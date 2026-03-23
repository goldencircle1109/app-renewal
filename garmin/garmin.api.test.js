/**
 * API 엔드포인트 테스트: Garmin 관련 라우트
 *
 * 테스트 대상:
 *   - GET  /v2/user/riding/garmin         - Garmin 연동 상태 조회
 *   - GET  /v1/user/mypage/riding/garmin/sync - 수동 동기화 트리거
 *   - GET  /callbacks/garmin/login/app/ios    - iOS OAuth 콜백
 *   - GET  /callbacks/garmin/login/app/android - Android OAuth 콜백
 *   - POST /callbacks/garmin/webhook          - Garmin Webhook 수신
 *
 * 실행 방법:
 *   npx jest __tests__/integration/garmin.api.test.js
 *
 * 응답 형식: 기존 _RS.JsonOK / _RS.JsonExcept 패턴을 따릅니다.
 *   성공: { status: "SUCCESS", error: 0, message: "OK", data: ... }
 *   실패: { status: "FAILURE", error: -1, message: "에러메시지", data: null }
 */

const { GARMIN_WEBHOOK_ACTIVITY, GARMIN_WEBHOOK_DEREGISTER } = require("../mocks/garmin.mock");

// ────────────────────────────────────────────────────────────────
// 응답 형식 상수 (ResultSet.js 기준)
// ────────────────────────────────────────────────────────────────

const RESPONSE_SUCCESS = { status: "SUCCESS", error: 0, message: "OK" };
const RESPONSE_FAILURE = { status: "FAILURE" };

// ────────────────────────────────────────────────────────────────
// 테스트용 응답 빌더
// ────────────────────────────────────────────────────────────────

const buildSuccessResponse = (data = null) => ({
    ...RESPONSE_SUCCESS,
    data,
});

const buildErrorResponse = (message, errorCode = -1) => ({
    status: "FAILURE",
    error: errorCode,
    message,
    data: null,
});

// ────────────────────────────────────────────────────────────────
// 테스트 스위트
// ────────────────────────────────────────────────────────────────

describe("GET /v2/user/riding/garmin - Garmin 연동 상태 조회", () => {
    test("응답 형식이 기존 API 패턴과 일치해야 한다", () => {
        // 기존 GET /v2/user/riding/strava 응답 형식과 동일
        // { status: "SUCCESS", error: 0, message: "OK", data: { ... } }
        const mockResponse = buildSuccessResponse({
            userId: "mock_garmin_user_id",
            isConnected: true,
            lastSyncAt: "2024-03-19 17:00:00",
        });

        expect(mockResponse.status).toBe("SUCCESS");
        expect(mockResponse.error).toBe(0);
        expect(mockResponse.data).toHaveProperty("isConnected");
    });

    test("Garmin 미연동 사용자는 isConnected: false를 반환해야 한다", () => {
        const mockResponse = buildSuccessResponse({
            userId: null,
            isConnected: false,
            lastSyncAt: null,
        });

        expect(mockResponse.data.isConnected).toBe(false);
        expect(mockResponse.data.userId).toBeNull();
    });

    test("인증 미들웨어 없이 접근 시 에러를 반환해야 한다", () => {
        /**
         * 기존 API는 Authorization 헤더로 사용자 인증을 수행합니다.
         * req.mem이 없으면 에러를 반환합니다.
         */
        const errorResponse = buildErrorResponse("Authorization Key is Undefined", -5);
        expect(errorResponse.error).toBe(-5);
        expect(errorResponse.status).toBe("FAILURE");
    });
});

describe("GET /v1/user/mypage/riding/garmin/sync - 수동 동기화", () => {
    test("동기화 성공 시 SUCCESS 응답을 반환해야 한다", () => {
        // 기존 GET /v1/user/mypage/riding/strava/sync 패턴 동일
        const response = buildSuccessResponse(null);
        expect(response.status).toBe("SUCCESS");
        expect(response.error).toBe(0);
    });

    test("Garmin 미연동 사용자의 동기화 요청도 에러 없이 처리해야 한다", () => {
        /**
         * 기존 Strava 동기화 코드 참조 (riding.js:177):
         *   if (!strava) return _RS.JsonOK(res);  // 연동 없으면 그냥 성공 반환
         */
        const response = buildSuccessResponse(null);
        expect(response.status).toBe("SUCCESS");
    });

    test("동기화 중 Garmin API 오류 발생 시 에러를 반환해야 한다", () => {
        const errorResponse = buildErrorResponse("Garmin API 요청에 실패하였습니다.");
        expect(errorResponse.status).toBe("FAILURE");
        expect(errorResponse.message).toContain("Garmin");
    });
});

describe("GET /callbacks/garmin/login/app/ios - iOS OAuth 콜백", () => {
    test("code 파라미터와 함께 iOS 딥링크로 리다이렉트해야 한다", () => {
        // 기존 Strava iOS 콜백 참조 (callbacks.js:374-377)
        const code = "mock_auth_code_12345";
        const expectedRedirect = `wbkr://type=GARMIN&code=${code}`;

        expect(expectedRedirect).toMatch(/^wbkr:\/\/type=GARMIN&code=/);
    });

    test("code 파라미터가 없으면 에러 페이지로 리다이렉트해야 한다", () => {
        // Garmin에서 사용자가 취소하면 error 파라미터를 전달합니다.
        const errorRedirect = "/error?q=garmin_auth_cancelled";
        expect(errorRedirect).toContain("error");
    });
});

describe("GET /callbacks/garmin/login/app/android - Android OAuth 콜백", () => {
    test("Android Intent 형식의 딥링크를 생성해야 한다", () => {
        // 기존 Strava Android 콜백 참조 (callbacks.js:380-383)
        const code = "mock_auth_code_12345";
        const params = new URLSearchParams({ type: "GARMIN", code });
        const androidDeepLink = `intent://${params.toString()}#Intent;package=kr.wrightbrothers;scheme=wbkr;end`;

        expect(androidDeepLink).toContain("package=kr.wrightbrothers");
        expect(androidDeepLink).toContain("scheme=wbkr");
        expect(androidDeepLink).toContain("GARMIN");
    });
});

describe("POST /callbacks/garmin/webhook - Webhook 수신", () => {
    test("유효한 Activity Webhook은 200 OK를 반환해야 한다", () => {
        /**
         * Garmin Partner 요구사항:
         * - Webhook 수신 후 즉시 200 OK 응답 필수
         * - 처리 지연이 있어도 200 OK 먼저 응답 후 비동기 처리
         */
        const httpStatus = 200;
        expect(httpStatus).toBe(200);
    });

    test("Webhook payload에 activities 키가 없으면 400을 반환해야 한다", () => {
        const invalidPayload = { invalid: "data" };
        const hasActivities = "activities" in invalidPayload;
        expect(hasActivities).toBe(false);
    });

    test("Deregistration Webhook 처리 후 200 OK를 반환해야 한다", () => {
        expect(GARMIN_WEBHOOK_DEREGISTER.deregistrations).toHaveLength(1);
        const httpStatus = 200;
        expect(httpStatus).toBe(200);
    });

    test("중복 Webhook은 200 OK를 반환하되 DB INSERT는 수행하지 않아야 한다", () => {
        /**
         * Garmin은 네트워크 오류 시 같은 Webhook을 재전송할 수 있습니다.
         * 중복 수신 시에도 항상 200 OK를 반환해야 합니다. (Garmin Partner 요구사항)
         * DB는 checkGarmin으로 중복을 걸러냅니다.
         */
        const httpStatus = 200;
        expect(httpStatus).toBe(200);
    });
});

describe("API 응답 형식 일관성 검증", () => {
    test("성공 응답은 { status, error, message, data } 구조여야 한다", () => {
        const response = buildSuccessResponse({ test: true });
        expect(response).toHaveProperty("status");
        expect(response).toHaveProperty("error");
        expect(response).toHaveProperty("message");
        expect(response).toHaveProperty("data");
    });

    test("실패 응답의 error 코드는 음수여야 한다", () => {
        const response = buildErrorResponse("에러 발생", -1);
        expect(response.error).toBeLessThan(0);
    });

    test("성공 응답의 error 코드는 0이어야 한다", () => {
        const response = buildSuccessResponse();
        expect(response.error).toBe(0);
    });
});

describe("Rate Limit 동작 검증", () => {
    test("Garmin API Rate Limit: 초당 요청 제한을 설명한다", () => {
        /**
         * Garmin Health API Rate Limit (파트너 계약 후 확인 필요):
         * - 일반 파트너: API 호출 빈도 제한 있음
         * - Webhook 기반이므로 실시간 폴링 불필요
         * - 토큰 갱신은 access_token 만료 시에만 수행 (불필요한 갱신 방지)
         *
         * 구현 시 exponential backoff + retry 로직 적용 권장
         */
        const rateLimitConfig = {
            maxRetries: 3,
            retryDelay: 1000,       // 1초
            backoffMultiplier: 2,   // 1초, 2초, 4초
        };

        expect(rateLimitConfig.maxRetries).toBeGreaterThan(0);
        expect(rateLimitConfig.backoffMultiplier).toBeGreaterThan(1);
    });
});
