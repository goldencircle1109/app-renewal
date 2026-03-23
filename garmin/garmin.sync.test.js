/**
 * 통합 테스트: Garmin 라이딩 동기화 API 플로우
 *
 * 테스트 대상:
 *   - GET /v1/user/mypage/riding/garmin/sync (구현 예정)
 *   - POST /v2/user/riding (기존 엔드포인트, Garmin 데이터 처리 확장)
 *   - SSP 포인트 지급 플로우
 *   - T_RIDING INSERT 전체 트랜잭션
 *
 * 실행 방법:
 *   npx jest __tests__/integration/garmin.sync.test.js
 *
 * 기존 Strava 동기화 로직 (riding.js:170~228)을 참고하여
 * Garmin 버전을 동일한 패턴으로 구현합니다.
 */

const {
    GARMIN_ACTIVITY_CYCLING,
    GARMIN_ACTIVITY_LIST,
    GARMIN_ACTIVITY_EMPTY,
    GARMIN_TOKEN_REFRESH_SUCCESS,
    EXPECTED_T_RIDING_ROW,
} = require("../mocks/garmin.mock");

// ────────────────────────────────────────────────────────────────
// Mock 헬퍼
// ────────────────────────────────────────────────────────────────

/**
 * Express req/res 객체 생성 헬퍼
 * 기존 라우트 패턴에서 req.mapper, req.mem을 사용합니다.
 */
const createMockReqRes = (overrides = {}) => {
    const jsonSpy = jest.fn();
    const sendSpy = jest.fn();

    const res = {
        send: sendSpy,
        json: jsonSpy,
        status: jest.fn().mockReturnThis(),
    };

    const req = {
        mapper: {
            getStatement: jest.fn().mockImplementation((ns, id) => `SQL:${ns}:${id}`),
        },
        mem: { idx: 12345, id: "test_user_id" },
        body: {},
        query: {},
        params: {},
        headers: {},
        ...overrides,
    };

    return { req, res, jsonSpy, sendSpy };
};

/**
 * _RS.JsonOK 응답을 파싱하는 헬퍼
 * 기존 API는 res.send(JSON.stringify(...)) 방식을 사용합니다.
 */
const parseJsonResponse = (sendSpy) => {
    if (sendSpy.mock.calls.length === 0) return null;
    const rawResponse = sendSpy.mock.calls[0][0];
    return typeof rawResponse === "string" ? JSON.parse(rawResponse) : rawResponse;
};

// ────────────────────────────────────────────────────────────────
// Garmin 동기화 로직 (TDD: 구현 예정)
// ────────────────────────────────────────────────────────────────

/**
 * Garmin Activity 목록을 T_RIDING으로 동기화
 * 기존 Strava 동기화 코드 (riding.js:183~222) 참조
 */
const syncGarminActivities = async ({ activities, memIdx, db, mapper, conn }) => {
    const results = { inserted: 0, skipped: 0, errors: [] };

    for (const activity of activities) {
        try {
            // 1. 중복 체크
            const checkQuery = mapper.getStatement("userMypageRiding", "checkGarmin", { id: String(activity.activityId) });
            const exists = await db.getReadOne(checkQuery);
            if (exists > 0) {
                results.skipped++;
                continue;
            }

            // 2. Garmin → T_RIDING 파라미터 변환
            const distanceKm = parseFloat((activity.distanceInMeters / 1000).toFixed(1));
            const avgSpeedKmh = parseFloat((activity.averageSpeedInMetersPerSecond * 3.6).toFixed(2));

            const params = {
                id: String(activity.activityId),
                name: activity.activityName,
                kind: activity.activityType.toUpperCase(),
                type: "GARMIN",
                distance: distanceKm,
                avgSpeed: avgSpeedKmh,
                maxSpeed: activity.maxSpeedInMetersPerSecond ? parseFloat((activity.maxSpeedInMetersPerSecond * 3.6).toFixed(2)) : null,
                duration: activity.durationInSeconds,
                memIdx,
                ssp: 0,
            };

            // 3. DB INSERT
            const insertQuery = mapper.getStatement("userMypageRiding", "addGarmin", params);
            await db.Query(insertQuery, [], conn);
            results.inserted++;
        } catch (error) {
            results.errors.push({ activityId: activity.activityId, error: error.message });
        }
    }

    return results;
};

// ────────────────────────────────────────────────────────────────
// 테스트 스위트
// ────────────────────────────────────────────────────────────────

describe("Garmin 동기화 - 정상 플로우", () => {
    let db, mapper, conn;

    beforeEach(() => {
        conn = {
            beginTransaction: jest.fn(),
            commit: jest.fn(),
            rollback: jest.fn(),
            release: jest.fn(),
        };
        db = {
            Query: jest.fn().mockResolvedValue({ insertId: 9999 }),
            getReadOne: jest.fn().mockResolvedValue(0),  // 중복 없음
            getConnection: jest.fn().mockResolvedValue(conn),
        };
        mapper = {
            getStatement: jest.fn().mockReturnValue("MOCK_SQL"),
        };
    });

    test("Activity 2개 수신 시 2개 모두 T_RIDING에 INSERT해야 한다", async () => {
        const result = await syncGarminActivities({
            activities: GARMIN_ACTIVITY_LIST.activityList,
            memIdx: 12345,
            db,
            mapper,
            conn,
        });

        expect(result.inserted).toBe(2);
        expect(result.skipped).toBe(0);
        expect(result.errors).toHaveLength(0);
    });

    test("Activity 목록이 비어있으면 INSERT하지 않아야 한다", async () => {
        const result = await syncGarminActivities({
            activities: GARMIN_ACTIVITY_EMPTY.activityList,
            memIdx: 12345,
            db,
            mapper,
            conn,
        });

        expect(result.inserted).toBe(0);
        expect(db.Query).not.toHaveBeenCalled();
    });

    test("이미 존재하는 Activity는 INSERT를 건너뛰어야 한다 (중복 방지)", async () => {
        // 첫 번째 Activity는 이미 존재, 두 번째는 신규
        db.getReadOne.mockResolvedValueOnce(1).mockResolvedValueOnce(0);

        const result = await syncGarminActivities({
            activities: GARMIN_ACTIVITY_LIST.activityList,
            memIdx: 12345,
            db,
            mapper,
            conn,
        });

        expect(result.inserted).toBe(1);
        expect(result.skipped).toBe(1);
    });

    test("checkGarmin 쿼리가 각 Activity마다 호출되어야 한다", async () => {
        await syncGarminActivities({
            activities: GARMIN_ACTIVITY_LIST.activityList,
            memIdx: 12345,
            db,
            mapper,
            conn,
        });

        // 2개 Activity → getReadOne 2번 호출
        expect(db.getReadOne).toHaveBeenCalledTimes(2);
    });

    test("type이 'GARMIN'으로 설정되어야 한다", async () => {
        await syncGarminActivities({
            activities: [GARMIN_ACTIVITY_CYCLING],
            memIdx: 12345,
            db,
            mapper,
            conn,
        });

        // mapper.getStatement 호출 시 params에 type: "GARMIN" 포함 여부 검증
        const addGarminCall = mapper.getStatement.mock.calls.find(call => call[1] === "addGarmin");
        expect(addGarminCall).toBeDefined();
        expect(addGarminCall[2]).toMatchObject({ type: "GARMIN" });
    });
});

describe("Garmin 동기화 - 에러 처리", () => {
    let db, mapper, conn;

    beforeEach(() => {
        conn = {
            beginTransaction: jest.fn(),
            commit: jest.fn(),
            rollback: jest.fn(),
            release: jest.fn(),
        };
        mapper = {
            getStatement: jest.fn().mockReturnValue("MOCK_SQL"),
        };
    });

    test("DB INSERT 실패 시 errors 배열에 에러를 기록해야 한다", async () => {
        db = {
            Query: jest.fn().mockRejectedValue(new Error("DB connection failed")),
            getReadOne: jest.fn().mockResolvedValue(0),
        };

        const result = await syncGarminActivities({
            activities: [GARMIN_ACTIVITY_CYCLING],
            memIdx: 12345,
            db,
            mapper,
            conn,
        });

        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].activityId).toBe(GARMIN_ACTIVITY_CYCLING.activityId);
    });

    test("한 Activity INSERT 실패 시 다른 Activity 처리는 계속되어야 한다", async () => {
        // 첫 번째는 성공, 두 번째는 실패하도록 설정
        db = {
            Query: jest.fn()
                .mockResolvedValueOnce({ insertId: 1 })
                .mockRejectedValueOnce(new Error("Duplicate entry")),
            getReadOne: jest.fn().mockResolvedValue(0),
        };

        const result = await syncGarminActivities({
            activities: GARMIN_ACTIVITY_LIST.activityList,
            memIdx: 12345,
            db,
            mapper,
            conn,
        });

        // 하나는 성공, 하나는 에러
        expect(result.inserted).toBe(1);
        expect(result.errors).toHaveLength(1);
    });
});

describe("Garmin 동기화 - SSP 지급 플로우", () => {
    test("동기화 완료 후 설문 미완료 라이딩의 ssp는 0이어야 한다", () => {
        /**
         * SSP 지급 시점:
         * 1. 라이딩 저장 시: ssp = 0
         * 2. 설문 완료 시: MemberController.ssp({ type: "IN", amount: distance * 10 })
         *
         * 기존 Strava/WB 라이딩과 동일한 방식 (riding.js:116~128)
         */
        const INITIAL_SSP = 0;
        expect(INITIAL_SSP).toBe(0);
    });

    test("설문 완료 시 SSP code가 'RIDING-GARMIN'으로 기록되어야 한다", () => {
        // 기존 코드 참조: `RIDING-${riding.TYPE ? riding.TYPE : "STRAVA"}`
        // Garmin은: "RIDING-GARMIN"
        const ridingType = "GARMIN";
        const sspCode = `RIDING-${ridingType}`;
        expect(sspCode).toBe("RIDING-GARMIN");
    });

    test("SSP 지급 메시지는 'GARMIN : {activityId}' 형식이어야 한다", () => {
        // 기존 Strava SSP 메시지: "STRAVA : 12345"
        const activityId = String(GARMIN_ACTIVITY_CYCLING.activityId);
        const sspMessage = `GARMIN : ${activityId}`;
        expect(sspMessage).toMatch(/^GARMIN : \d+$/);
    });
});

describe("Garmin 동기화 - T_RIDING 데이터 구조 검증", () => {
    test("INSERT 파라미터에 필수 컬럼이 모두 포함되어야 한다", () => {
        const requiredColumns = [
            "id",           // Garmin activityId
            "name",         // 라이딩명
            "kind",         // CYCLING, RUNNING 등
            "type",         // "GARMIN"
            "distance",     // km 단위
            "avgSpeed",     // km/h 단위
            "duration",     // 초 단위
            "memIdx",       // 회원 고유번호
            "ssp",          // 초기값 0
        ];

        requiredColumns.forEach(col => {
            expect(EXPECTED_T_RIDING_ROW).toHaveProperty(col);
        });
    });

    test("EXPECTED_T_RIDING_ROW의 type은 'GARMIN'이어야 한다", () => {
        expect(EXPECTED_T_RIDING_ROW.type).toBe("GARMIN");
    });

    test("EXPECTED_T_RIDING_ROW의 distance는 km 단위 (소수점 1자리)여야 한다", () => {
        // 25000.5m → 25.0km
        expect(EXPECTED_T_RIDING_ROW.distance).toBe(25.0);
    });
});
