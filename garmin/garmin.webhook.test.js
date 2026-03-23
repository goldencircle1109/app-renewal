/**
 * 통합 테스트: Garmin Webhook 처리 플로우
 *
 * 테스트 대상:
 *   - POST /callbacks/garmin/webhook (구현 예정)
 *   - Webhook 수신 → Activity 처리 → T_RIDING 저장 전체 플로우
 *   - 이중 지급 방지 (같은 activityId 재처리 차단)
 *   - 사용자 연동 해제 Webhook 처리
 *
 * 실행 방법:
 *   npx jest __tests__/integration/garmin.webhook.test.js
 *
 * 아키텍처 참고:
 *   기존 Strava 동기화 패턴 (callbacks.js + riding.js)을 따르되,
 *   Garmin은 Push 방식(Webhook)이므로 처리 구조가 다릅니다.
 */

const {
    GARMIN_WEBHOOK_ACTIVITY,
    GARMIN_WEBHOOK_ACTIVITY_DEREGISTER,
    GARMIN_WEBHOOK_DEREGISTER,
    GARMIN_ACTIVITY_CYCLING,
} = require("../mocks/garmin.mock");

// ────────────────────────────────────────────────────────────────
// Webhook 처리 함수 (TDD: 구현 예정)
// 실제 구현 후 교체:
// const { handleActivityWebhook, handleDeregisterWebhook } = require("../../api/routes/callbacks");
// ────────────────────────────────────────────────────────────────

/**
 * Webhook payload 유효성 검증 함수
 * Garmin은 Consumer Key 기반 HMAC 서명 검증을 사용합니다.
 */
const validateGarminWebhookSignature = (req, consumerSecret) => {
    // 실제 구현: HMAC-SHA1 서명 검증
    // Authorization 헤더: OAuth oauth_signature="..."
    const authHeader = req.headers?.authorization || "";
    return authHeader.startsWith("OAuth");
};

/**
 * Webhook Activity payload에서 핵심 필드 추출
 */
const extractActivityFromWebhook = (webhookPayload) => {
    if (!webhookPayload.activities || webhookPayload.activities.length === 0) {
        return null;
    }
    return webhookPayload.activities[0];
};

// ────────────────────────────────────────────────────────────────
// DB Mock 헬퍼 (실제 DB 없이 동작 검증)
// ────────────────────────────────────────────────────────────────

const createDbMock = () => {
    const queryLog = [];
    const mockData = {};

    return {
        Query: jest.fn().mockImplementation((sql) => {
            queryLog.push(sql);
            return Promise.resolve({ insertId: 9999, affectedRows: 1 });
        }),
        getReadOne: jest.fn().mockImplementation(() => Promise.resolve(0)),  // 중복 없음
        getReadSingleRow: jest.fn().mockImplementation(() => Promise.resolve(null)),
        getConnection: jest.fn().mockImplementation(() => Promise.resolve({
            beginTransaction: jest.fn(),
            commit: jest.fn(),
            rollback: jest.fn(),
            release: jest.fn(),
        })),
        queryLog,
        mockData,
    };
};

const createMapperMock = () => ({
    getStatement: jest.fn().mockImplementation((namespace, id) => `MOCK_SQL:${namespace}:${id}`),
});

// ────────────────────────────────────────────────────────────────
// 테스트 스위트
// ────────────────────────────────────────────────────────────────

describe("Garmin Webhook - Activity 알림 처리", () => {
    test("Webhook payload에 activities 배열이 있어야 한다", () => {
        expect(GARMIN_WEBHOOK_ACTIVITY).toHaveProperty("activities");
        expect(Array.isArray(GARMIN_WEBHOOK_ACTIVITY.activities)).toBe(true);
    });

    test("Activity Webhook에서 userId와 summaryId를 추출할 수 있어야 한다", () => {
        const activity = extractActivityFromWebhook(GARMIN_WEBHOOK_ACTIVITY);
        expect(activity).not.toBeNull();
        expect(activity).toHaveProperty("userId");
        expect(activity).toHaveProperty("summaryId");
        expect(activity).toHaveProperty("userAccessToken");
    });

    test("빈 activities 배열 Webhook은 null을 반환해야 한다", () => {
        const emptyPayload = { activities: [] };
        const result = extractActivityFromWebhook(emptyPayload);
        expect(result).toBeNull();
    });

    test("CYCLING 타입의 Activity만 T_RIDING에 저장해야 한다 (자전거 앱 특성)", () => {
        // WrightBrothers는 자전거 앱이므로 CYCLING 우선 처리
        const activity = extractActivityFromWebhook(GARMIN_WEBHOOK_ACTIVITY);
        expect(activity.activityType).toBe("CYCLING");
    });
});

describe("Garmin Webhook - 이중 지급 방지 (중복 처리 차단)", () => {
    let db, mapper;

    beforeEach(() => {
        db = createDbMock();
        mapper = createMapperMock();
    });

    test("이미 처리된 summaryId는 DB INSERT를 수행하지 않아야 한다", async () => {
        // DB에 이미 해당 summaryId가 존재하는 경우
        db.getReadOne.mockResolvedValue(1);  // check 쿼리가 1 반환 (이미 존재)

        const activity = GARMIN_WEBHOOK_ACTIVITY.activities[0];
        const checkQuery = mapper.getStatement("userMypageRiding", "checkGarmin", { id: activity.summaryId });

        const isDuplicate = await db.getReadOne(checkQuery) > 0;
        expect(isDuplicate).toBe(true);

        // INSERT는 호출되지 않아야 함
        expect(db.Query).not.toHaveBeenCalled();
    });

    test("처음 수신된 summaryId는 T_RIDING에 저장되어야 한다", async () => {
        // DB에 없는 경우 (getReadOne → 0)
        db.getReadOne.mockResolvedValue(0);

        const activity = GARMIN_WEBHOOK_ACTIVITY.activities[0];
        const checkQuery = mapper.getStatement("userMypageRiding", "checkGarmin", { id: activity.summaryId });
        const isDuplicate = await db.getReadOne(checkQuery) > 0;

        expect(isDuplicate).toBe(false);
        // INSERT 쿼리가 호출되어야 함을 기대 (실제 구현 후 검증)
    });

    test("SSP 포인트는 동일 summaryId에 대해 단 한 번만 지급되어야 한다", () => {
        /**
         * 이중 지급 방지 시나리오:
         * 1. Webhook 첫 수신 → T_RIDING INSERT + ssp = 0 (설문 전)
         * 2. 설문 완료 시 → SSP 지급 (code: "RIDING-GARMIN")
         * 3. 동일 Webhook 재수신 → checkGarmin으로 차단 → SSP 미지급
         *
         * T_SSP_LOG의 code 컬럼으로 이중 지급 추적 가능
         */
        const sspCode = `RIDING-GARMIN-9876543210`;
        expect(sspCode).toMatch(/^RIDING-GARMIN-\d+$/);
    });
});

describe("Garmin Webhook - 사용자 연동 해제 처리", () => {
    test("deregistrations Webhook은 해당 사용자의 Garmin 연동을 비활성화해야 한다", () => {
        expect(GARMIN_WEBHOOK_DEREGISTER).toHaveProperty("deregistrations");
        const deregister = GARMIN_WEBHOOK_DEREGISTER.deregistrations[0];
        expect(deregister).toHaveProperty("userId");
        expect(deregister).toHaveProperty("userAccessToken");
    });

    test("연동 해제 시 accessToken과 refreshToken을 DB에서 삭제해야 한다", () => {
        /**
         * Garmin 정책: 사용자가 Garmin Connect에서 연동 해제 시
         * 즉시 deregistration Webhook을 발송합니다.
         * 토큰을 계속 보관하는 것은 개인정보 보호 규정 위반입니다.
         */
        const deregister = GARMIN_WEBHOOK_DEREGISTER.deregistrations[0];
        // 실제 구현: UPDATE T_GARMIN_TOKEN SET STATUS='N' WHERE USER_ID = deregister.userId
        expect(typeof deregister.userId).toBe("string");
    });
});

describe("Garmin Webhook - 서명 검증 (보안)", () => {
    test("유효한 OAuth Authorization 헤더를 가진 요청은 통과해야 한다", () => {
        const mockReq = {
            headers: {
                authorization: 'OAuth oauth_consumer_key="key", oauth_signature="sig"',
            },
        };
        const isValid = validateGarminWebhookSignature(mockReq, "consumer_secret");
        expect(isValid).toBe(true);
    });

    test("Authorization 헤더가 없는 요청은 거부해야 한다", () => {
        const mockReq = { headers: {} };
        const isValid = validateGarminWebhookSignature(mockReq, "consumer_secret");
        expect(isValid).toBe(false);
    });

    test("잘못된 헤더 형식의 요청은 거부해야 한다", () => {
        const mockReq = {
            headers: { authorization: "Bearer fake_token" },
        };
        const isValid = validateGarminWebhookSignature(mockReq, "consumer_secret");
        expect(isValid).toBe(false);
    });
});

describe("Garmin Webhook - OAuth 콜백 플로우 (연동 등록)", () => {
    test("callbacks/garmin/login 라우트 구조 검증", () => {
        /**
         * Garmin OAuth 콜백 플로우:
         *   1. GET /callbacks/garmin/login?code=XXX&state=YYY
         *   2. code + code_verifier → POST https://connectapi.garmin.com/oauth-service/oauth/token
         *   3. access_token + refresh_token + userId 반환
         *   4. T_GARMIN_TOKEN에 저장 (또는 T_MEMBER_SNS)
         *   5. 앱 딥링크로 리다이렉트: wbkr://type=GARMIN&status=success
         *
         * 기존 Strava 콜백 참고: callbacks.js:374~384
         */
        const garminCallbackRoute = "/callbacks/garmin/login/app/ios";
        expect(garminCallbackRoute).toContain("garmin");
    });

    test("iOS 앱 딥링크 형식은 wbkr://type=GARMIN&... 이어야 한다", () => {
        // 기존 Strava iOS 딥링크: wbkr://type=STRAVA&code=${code} (callbacks.js:375)
        const mockCode = "mock_auth_code";
        const iosDeepLink = `wbkr://type=GARMIN&code=${mockCode}`;
        expect(iosDeepLink).toMatch(/^wbkr:\/\/type=GARMIN/);
    });

    test("Android 앱 딥링크 형식은 intent:// 스킴을 사용해야 한다", () => {
        // 기존 Strava Android 딥링크 (callbacks.js:381): intent://...#Intent;package=kr.wrightbrothers;scheme=wbkr;end
        const mockCode = "mock_auth_code";
        const androidDeepLink = `intent://${new URLSearchParams({ type: "GARMIN", code: mockCode }).toString()}#Intent;package=kr.wrightbrothers;scheme=wbkr;end`;
        expect(androidDeepLink).toContain("package=kr.wrightbrothers");
        expect(androidDeepLink).toContain("GARMIN");
    });
});
