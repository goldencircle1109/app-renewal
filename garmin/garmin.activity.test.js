/**
 * 단위 테스트: Garmin Activity 데이터 변환
 *
 * 테스트 대상:
 *   - Garmin Activity → T_RIDING 매핑 함수
 *   - 단위 변환 (m/s → km/h, m → km, unix timestamp → KST)
 *   - SSP 포인트 계산 로직
 *   - Strava ↔ Garmin 중복 감지 로직
 *
 * 실행 방법:
 *   npx jest __tests__/unit/garmin.activity.test.js
 *
 * 참고: 기존 Strava 동기화 로직 (riding.js:195~213)을 참고하여
 *       Garmin 버전도 동일한 변환 패턴을 따릅니다.
 */

const moment = require("moment");
const {
    GARMIN_ACTIVITY_CYCLING,
    GARMIN_ACTIVITY_RUNNING,
    EXPECTED_T_RIDING_ROW,
    GARMIN_ACTIVITY_DUPLICATE_WITH_STRAVA,
    GARMIN_ACTIVITY_UNIQUE,
} = require("../mocks/garmin.mock");

// ────────────────────────────────────────────────────────────────
// 구현 예정 함수들 (TDD: 테스트 먼저, 구현 후)
// 실제 garmin.js 구현 후 이 블록을 교체합니다:
// const { mapGarminToRiding, isDuplicateActivity, calculateSsp } = require("../../api/controllers/garmin");
// ────────────────────────────────────────────────────────────────

/**
 * Garmin Activity를 T_RIDING INSERT 파라미터로 변환
 * 기존 Strava 변환 로직 (riding.js:195~213) 참조
 */
const mapGarminToRiding = (activity, memIdx) => {
    const {
        activityId,
        activityName,
        activityType,
        startTimeInSeconds,
        startTimeOffsetInSeconds,
        durationInSeconds,
        distanceInMeters,
        averageSpeedInMetersPerSecond,
        maxSpeedInMetersPerSecond,
        totalElevationGainInMeters,
        totalElevationLossInMeters,
        calories,
    } = activity;

    // unix timestamp (UTC) → KST 변환
    const startDateKST = moment.unix(startTimeInSeconds + startTimeOffsetInSeconds).utc().format("YYYY-MM-DD HH:mm:ss");
    const endDateKST = moment.unix(startTimeInSeconds + startTimeOffsetInSeconds + durationInSeconds).utc().format("YYYY-MM-DD HH:mm:ss");

    // 거리: m → km (소수점 1자리)
    const distanceKm = parseFloat((distanceInMeters / 1000).toFixed(1));

    // 속도: m/s → km/h (× 3.6)
    const avgSpeedKmh = parseFloat((averageSpeedInMetersPerSecond * 3.6).toFixed(2));
    const maxSpeedKmh = maxSpeedInMetersPerSecond ? parseFloat((maxSpeedInMetersPerSecond * 3.6).toFixed(2)) : null;

    return {
        id: String(activityId),
        name: activityName,
        kind: activityType.toUpperCase(),
        type: "GARMIN",
        distance: distanceKm,
        avgSpeed: avgSpeedKmh,
        maxSpeed: maxSpeedKmh,
        startDate: startDateKST,
        endDate: endDateKST,
        duration: durationInSeconds,
        totalUpperAltitude: totalElevationGainInMeters || null,
        totlaLowerAltitude: totalElevationLossInMeters || null,
        kCalorie: calories || null,
        ssp: 0,
        fileUrl: null,
        memIdx,
    };
};

/**
 * SSP 포인트 계산
 * 기존 로직 (riding.js:63~76) 참조:
 *   distance >= 0.5km, avgSpeed 5~40km/h, maxSpeed <= 80km/h
 *   → distance * 10 포인트
 */
const calculateSsp = (distance, avgSpeed, maxSpeed) => {
    if (distance < 0.5) return 0;
    if (avgSpeed < 5 || avgSpeed > 40) return 0;
    if (maxSpeed && maxSpeed > 80) return 0;
    return Math.floor(distance * 10);
};

/**
 * Strava ↔ Garmin 중복 Activity 감지
 * 판정 기준: 시작 시간 ±5분 이내 AND 거리 차이 5% 이내
 */
const isDuplicateActivity = (garminActivity, existingRidings) => {
    const garminStartTime = garminActivity.startTimeInSeconds;
    const garminDistance = garminActivity.distanceInMeters;

    return existingRidings.some(riding => {
        const ridingStartUnix = moment(riding.startDate).unix();
        const timeDiffSeconds = Math.abs(garminStartTime - ridingStartUnix);
        const distanceDiffRatio = Math.abs((garminDistance / 1000) - riding.distance) / riding.distance;

        // 5분(300초) 이내 AND 거리 차이 5% 이내
        return timeDiffSeconds <= 300 && distanceDiffRatio <= 0.05;
    });
};

// ────────────────────────────────────────────────────────────────
// 테스트 스위트
// ────────────────────────────────────────────────────────────────

describe("Garmin Activity → T_RIDING 데이터 매핑", () => {
    const MEM_IDX = 12345;

    test("activityId는 string으로 변환되어야 한다", () => {
        const result = mapGarminToRiding(GARMIN_ACTIVITY_CYCLING, MEM_IDX);
        expect(typeof result.id).toBe("string");
        expect(result.id).toBe("9876543210");
    });

    test("type은 'GARMIN'이어야 한다 (WB, STRAVA와 구분)", () => {
        const result = mapGarminToRiding(GARMIN_ACTIVITY_CYCLING, MEM_IDX);
        expect(result.type).toBe("GARMIN");
    });

    test("거리 단위 변환: m → km (소수점 1자리)", () => {
        // 25000.5m → 25.0km
        const result = mapGarminToRiding(GARMIN_ACTIVITY_CYCLING, MEM_IDX);
        expect(result.distance).toBe(25.0);
    });

    test("평균 속도 변환: m/s → km/h (× 3.6)", () => {
        // 6.945 m/s × 3.6 = 25.0 km/h
        const result = mapGarminToRiding(GARMIN_ACTIVITY_CYCLING, MEM_IDX);
        expect(result.avgSpeed).toBeCloseTo(25.0, 1);
    });

    test("최대 속도 변환: m/s → km/h (× 3.6)", () => {
        // 12.5 m/s × 3.6 = 45.0 km/h
        const result = mapGarminToRiding(GARMIN_ACTIVITY_CYCLING, MEM_IDX);
        expect(result.maxSpeed).toBeCloseTo(45.0, 1);
    });

    test("시작 시간: unix timestamp(UTC) → KST 문자열 변환", () => {
        // 1710806400 (UTC) + 32400 (KST +9h) = 2024-03-19 17:00:00 KST
        const result = mapGarminToRiding(GARMIN_ACTIVITY_CYCLING, MEM_IDX);
        expect(result.startDate).toBe("2024-03-19 17:00:00");
    });

    test("종료 시간: 시작시간 + 지속시간으로 계산", () => {
        // 17:00:00 + 3600초 = 18:00:00
        const result = mapGarminToRiding(GARMIN_ACTIVITY_CYCLING, MEM_IDX);
        expect(result.endDate).toBe("2024-03-19 18:00:00");
    });

    test("activityType은 대문자로 변환되어야 한다", () => {
        // "CYCLING" → "CYCLING" (이미 대문자), "Running" → "RUNNING"
        const result = mapGarminToRiding(GARMIN_ACTIVITY_RUNNING, MEM_IDX);
        expect(result.kind).toBe("RUNNING");
    });

    test("고도 상승/하강 데이터가 매핑되어야 한다", () => {
        const result = mapGarminToRiding(GARMIN_ACTIVITY_CYCLING, MEM_IDX);
        expect(result.totalUpperAltitude).toBe(320.5);
        expect(result.totlaLowerAltitude).toBe(315.2);
    });

    test("칼로리 데이터가 kCalorie로 매핑되어야 한다", () => {
        const result = mapGarminToRiding(GARMIN_ACTIVITY_CYCLING, MEM_IDX);
        expect(result.kCalorie).toBe(750);
    });

    test("ssp 초기값은 0이어야 한다 (설문 완료 후 지급)", () => {
        const result = mapGarminToRiding(GARMIN_ACTIVITY_CYCLING, MEM_IDX);
        expect(result.ssp).toBe(0);
    });

    test("memIdx가 매핑 결과에 포함되어야 한다", () => {
        const result = mapGarminToRiding(GARMIN_ACTIVITY_CYCLING, MEM_IDX);
        expect(result.memIdx).toBe(MEM_IDX);
    });
});

describe("SSP 포인트 계산 로직 (기존 로직 동일 적용)", () => {
    test("정상 라이딩: distance * 10 포인트를 반환해야 한다", () => {
        // 25km, avgSpeed 25km/h, maxSpeed 45km/h → 250 SSP
        expect(calculateSsp(25.0, 25.0, 45.0)).toBe(250);
    });

    test("거리 0.5km 미만이면 0 SSP를 반환해야 한다", () => {
        expect(calculateSsp(0.3, 15.0, 20.0)).toBe(0);
    });

    test("평균 속도 5km/h 미만이면 0 SSP를 반환해야 한다 (너무 느림)", () => {
        expect(calculateSsp(5.0, 3.0, 10.0)).toBe(0);
    });

    test("평균 속도 40km/h 초과이면 0 SSP를 반환해야 한다 (비정상 라이딩 의심)", () => {
        expect(calculateSsp(100.0, 45.0, 60.0)).toBe(0);
    });

    test("최대 속도 80km/h 초과이면 0 SSP를 반환해야 한다 (GPS 오류 의심)", () => {
        expect(calculateSsp(30.0, 25.0, 90.0)).toBe(0);
    });

    test("maxSpeed가 null이면 속도 검증 없이 포인트를 지급해야 한다", () => {
        // Garmin FIT 파일에 maxSpeed 데이터가 없을 수 있음
        expect(calculateSsp(10.0, 15.0, null)).toBe(100);
    });

    test("경계값 테스트: 거리 정확히 0.5km", () => {
        expect(calculateSsp(0.5, 15.0, 20.0)).toBe(5);
    });

    test("경계값 테스트: 평균 속도 정확히 40km/h", () => {
        expect(calculateSsp(10.0, 40.0, 50.0)).toBe(100);
    });
});

describe("Strava ↔ Garmin 중복 Activity 감지", () => {
    // 기존 Strava 데이터 (T_RIDING에 이미 존재)
    const existingStravaRidings = [
        {
            id: "strava_11111",
            type: "STRAVA",
            startDate: "2024-03-19 17:00:00",  // KST
            distance: 25.0,                     // km
        },
    ];

    test("동일 시간 + 비슷한 거리의 Garmin Activity는 중복으로 감지해야 한다", () => {
        // GARMIN_ACTIVITY_DUPLICATE_WITH_STRAVA:
        //   startTimeInSeconds: 1710806400 (= 2024-03-19 17:00:00 KST)
        //   distanceInMeters: 25000 (= 25.0km, Strava 25.0km와 차이 0%)
        const isDup = isDuplicateActivity(GARMIN_ACTIVITY_DUPLICATE_WITH_STRAVA, existingStravaRidings);
        expect(isDup).toBe(true);
    });

    test("다른 날의 Garmin Activity는 중복이 아니어야 한다", () => {
        const isDup = isDuplicateActivity(GARMIN_ACTIVITY_UNIQUE, existingStravaRidings);
        expect(isDup).toBe(false);
    });

    test("시간은 같지만 거리 차이가 5% 초과이면 중복이 아니어야 한다", () => {
        const differentDistanceActivity = {
            ...GARMIN_ACTIVITY_DUPLICATE_WITH_STRAVA,
            distanceInMeters: 30000,    // 30km vs Strava 25km = 20% 차이
        };
        const isDup = isDuplicateActivity(differentDistanceActivity, existingStravaRidings);
        expect(isDup).toBe(false);
    });

    test("거리는 같지만 시간 차이가 5분 초과이면 중복이 아니어야 한다", () => {
        const differentTimeActivity = {
            ...GARMIN_ACTIVITY_DUPLICATE_WITH_STRAVA,
            startTimeInSeconds: 1710806400 + 600,   // 10분 후 시작
        };
        const isDup = isDuplicateActivity(differentTimeActivity, existingStravaRidings);
        expect(isDup).toBe(false);
    });

    test("T_RIDING에 기존 기록이 없으면 중복이 아니어야 한다", () => {
        const isDup = isDuplicateActivity(GARMIN_ACTIVITY_CYCLING, []);
        expect(isDup).toBe(false);
    });
});

describe("FIT 파일 파싱 결과 검증", () => {
    const { FIT_FILE_PARSED_RESULT } = require("../mocks/garmin.mock");

    test("FIT 파일 파싱 결과에 sessions 배열이 존재해야 한다", () => {
        expect(FIT_FILE_PARSED_RESULT).toHaveProperty("sessions");
        expect(Array.isArray(FIT_FILE_PARSED_RESULT.sessions)).toBe(true);
        expect(FIT_FILE_PARSED_RESULT.sessions.length).toBeGreaterThan(0);
    });

    test("FIT session에서 총 거리(m)를 추출할 수 있어야 한다", () => {
        const session = FIT_FILE_PARSED_RESULT.sessions[0];
        expect(session).toHaveProperty("total_distance");
        expect(typeof session.total_distance).toBe("number");
    });

    test("FIT session에서 평균 속도(m/s)를 추출할 수 있어야 한다", () => {
        const session = FIT_FILE_PARSED_RESULT.sessions[0];
        expect(session).toHaveProperty("avg_speed");
        expect(session.avg_speed).toBeGreaterThan(0);
    });

    test("FIT records에 GPS 좌표(위도/경도)가 포함되어야 한다", () => {
        expect(FIT_FILE_PARSED_RESULT.records.length).toBeGreaterThan(0);
        const record = FIT_FILE_PARSED_RESULT.records[0];
        expect(record).toHaveProperty("position_lat");
        expect(record).toHaveProperty("position_long");
    });
});
