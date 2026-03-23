/**
 * Garmin API Mock 데이터
 *
 * Garmin Health API / Activity API 응답을 시뮬레이션합니다.
 * 실제 Garmin API를 호출하지 않고 테스트가 가능하도록 합니다.
 */

// ────────────────────────────────────────────────────────────────
// OAuth 2.0 PKCE 관련 Mock
// ────────────────────────────────────────────────────────────────

/** OAuth 토큰 교환 성공 응답 */
const GARMIN_TOKEN_SUCCESS = {
    access_token: "mock_garmin_access_token_abcdef1234567890",
    token_type: "Bearer",
    expires_in: 3600,
    refresh_token: "mock_garmin_refresh_token_xyz9876543210",
    scope: "activity:read",
};

/** OAuth 토큰 갱신 성공 응답 (새 refresh_token 포함) */
const GARMIN_TOKEN_REFRESH_SUCCESS = {
    access_token: "mock_garmin_access_token_new_abcdef1234",
    token_type: "Bearer",
    expires_in: 3600,
    refresh_token: "mock_garmin_refresh_token_new_xyz9876",  // Garmin은 갱신 시 refresh_token도 교체
    scope: "activity:read",
};

/** OAuth 토큰 에러 응답 */
const GARMIN_TOKEN_ERROR = {
    error: "invalid_grant",
    error_description: "The provided authorization grant is invalid, expired, revoked.",
};

// ────────────────────────────────────────────────────────────────
// Activity Summary API Mock
// ────────────────────────────────────────────────────────────────

/** 단일 자전거 라이딩 Activity */
const GARMIN_ACTIVITY_CYCLING = {
    activityId: 9876543210,
    activityName: "아침 자전거 라이딩",
    activityType: "CYCLING",
    startTimeInSeconds: 1710806400,          // 2024-03-19 08:00:00 UTC
    startTimeOffsetInSeconds: 32400,          // +09:00 (KST)
    durationInSeconds: 3600,                  // 1시간
    distanceInMeters: 25000.5,               // 25.0km
    averageSpeedInMetersPerSecond: 6.945,     // 25km/h
    maxSpeedInMetersPerSecond: 12.5,          // 45km/h
    averageHeartRateInBeatsPerMinute: 145,
    maxHeartRateInBeatsPerMinute: 172,
    averagePowerInWatts: 180,
    totalElevationGainInMeters: 320.5,
    totalElevationLossInMeters: 315.2,
    calories: 750,
};

/** 단일 달리기 Activity */
const GARMIN_ACTIVITY_RUNNING = {
    activityId: 9876543211,
    activityName: "저녁 조깅",
    activityType: "RUNNING",
    startTimeInSeconds: 1710835200,
    startTimeOffsetInSeconds: 32400,
    durationInSeconds: 1800,
    distanceInMeters: 5000,
    averageSpeedInMetersPerSecond: 2.778,     // 10km/h (6min/km 페이스)
    maxSpeedInMetersPerSecond: 4.2,
    averageHeartRateInBeatsPerMinute: 155,
    maxHeartRateInBeatsPerMinute: 180,
    calories: 400,
};

/** Activity 목록 응답 */
const GARMIN_ACTIVITY_LIST = {
    activityList: [GARMIN_ACTIVITY_CYCLING, GARMIN_ACTIVITY_RUNNING],
};

/** Activity가 없는 경우 */
const GARMIN_ACTIVITY_EMPTY = {
    activityList: [],
};

// ────────────────────────────────────────────────────────────────
// Webhook Payload Mock
// ────────────────────────────────────────────────────────────────

/** 새 Activity 알림 Webhook */
const GARMIN_WEBHOOK_ACTIVITY = {
    activities: [
        {
            userId: "mock_garmin_user_id_abc123",
            userAccessToken: "mock_garmin_access_token_abcdef1234567890",
            summaryId: "9876543210",
            activityType: "CYCLING",
            startTimeInSeconds: 1710806400,
            durationInSeconds: 3600,
            distanceInMeters: 25000.5,
            averageSpeedInMetersPerSecond: 6.945,
            maxSpeedInMetersPerSecond: 12.5,
            calories: 750,
        },
    ],
};

/** Activity 삭제 알림 Webhook */
const GARMIN_WEBHOOK_ACTIVITY_DEREGISTER = {
    activityFiles: [
        {
            userId: "mock_garmin_user_id_abc123",
            userAccessToken: "mock_garmin_access_token_abcdef1234567890",
            summaryId: "9876543210",
        },
    ],
};

/** 사용자 연동 해제 Webhook */
const GARMIN_WEBHOOK_DEREGISTER = {
    deregistrations: [
        {
            userId: "mock_garmin_user_id_abc123",
            userAccessToken: "mock_garmin_access_token_abcdef1234567890",
        },
    ],
};

// ────────────────────────────────────────────────────────────────
// Strava와 중복 판정을 위한 Mock 데이터
// ────────────────────────────────────────────────────────────────

/** Strava와 동일한 시간/거리의 Garmin Activity (중복 케이스) */
const GARMIN_ACTIVITY_DUPLICATE_WITH_STRAVA = {
    activityId: 9876543212,
    activityName: "라이딩 (Strava와 동일)",
    activityType: "CYCLING",
    startTimeInSeconds: 1710806400,   // Strava와 동일한 시작시간
    durationInSeconds: 3600,
    distanceInMeters: 25000,           // Strava와 거의 같은 거리 (5% 이내)
    averageSpeedInMetersPerSecond: 6.9,
};

/** Strava에 없는 고유 Garmin Activity */
const GARMIN_ACTIVITY_UNIQUE = {
    activityId: 9876543213,
    activityName: "Garmin 전용 라이딩",
    activityType: "CYCLING",
    startTimeInSeconds: 1710892800,   // 다음날
    durationInSeconds: 5400,
    distanceInMeters: 40000,
    averageSpeedInMetersPerSecond: 7.4,
};

// ────────────────────────────────────────────────────────────────
// FIT 파일 관련 Mock (최소한의 바이너리 헤더 시뮬레이션)
// ────────────────────────────────────────────────────────────────

/**
 * FIT 파일 파싱 결과 Mock
 * 실제 fit-file-parser 라이브러리 출력 형식을 따릅니다.
 */
const FIT_FILE_PARSED_RESULT = {
    sessions: [
        {
            sport: "cycling",
            timestamp: new Date("2024-03-19T08:00:00Z"),
            start_time: new Date("2024-03-19T08:00:00Z"),
            total_elapsed_time: 3600,
            total_timer_time: 3540,              // 실제 이동 시간
            total_distance: 25000.5,             // 단위: m
            avg_speed: 6.945,                    // 단위: m/s
            max_speed: 12.5,
            total_ascent: 320,
            total_descent: 315,
            total_calories: 750,
            avg_heart_rate: 145,
            max_heart_rate: 172,
            avg_power: 180,
        },
    ],
    records: [
        { timestamp: new Date("2024-03-19T08:00:00Z"), position_lat: 37.123456, position_long: 127.123456, altitude: 50, speed: 5.5 },
        { timestamp: new Date("2024-03-19T08:00:01Z"), position_lat: 37.123500, position_long: 127.123500, altitude: 51, speed: 6.0 },
    ],
};

// ────────────────────────────────────────────────────────────────
// DB Mock 데이터 (T_RIDING 테이블 기준)
// ────────────────────────────────────────────────────────────────

/**
 * Garmin Activity를 T_RIDING에 저장한 후의 기대 결과
 * 실제 riding.js POST / 의 params 구조와 동일하게 맞춥니다.
 */
const EXPECTED_T_RIDING_ROW = {
    id: "9876543210",                      // Garmin activityId → string
    name: "아침 자전거 라이딩",
    kind: "CYCLING",
    type: "GARMIN",                         // 기존 "WB", "STRAVA"와 구분
    distance: 25.0,                         // km 단위 (소수점 1자리)
    avgSpeed: 25.0,                         // km/h (m/s × 3.6)
    maxSpeed: 45.0,                         // km/h
    startDate: "2024-03-19 17:00:00",      // UTC → KST 변환
    endDate: "2024-03-19 18:00:00",
    duration: 3600,
    totalUpperAltitude: 320.5,
    totlaLowerAltitude: 315.2,
    kCalorie: 750,
    ssp: 0,
    fileUrl: null,
};

/**
 * Garmin 연동 토큰 저장 기대 구조 (T_MEMBER_SNS 또는 신규 T_GARMIN_TOKEN 기준)
 */
const EXPECTED_GARMIN_TOKEN_ROW = {
    memIdx: 12345,
    type: "GARMIN",
    userId: "mock_garmin_user_id_abc123",
    token: "mock_garmin_access_token_abcdef1234567890",
    refreshToken: "mock_garmin_refresh_token_xyz9876543210",
    tokenExpiresAt: "2024-03-19 18:00:00",  // 만료 시각 (테스트에서 expect.any(String)으로 검증)
};

// ────────────────────────────────────────────────────────────────
// Axios Mock 헬퍼 함수
// ────────────────────────────────────────────────────────────────

/**
 * axios를 Jest로 Mock하는 헬퍼
 * 사용법:
 *   jest.mock('axios');
 *   mockAxiosPost(GARMIN_TOKEN_SUCCESS);
 */
const mockAxiosResponse = (data, status = 200) => ({
    status,
    data,
    headers: { "content-type": "application/json" },
});

const mockAxiosError = (status, data) => {
    const error = new Error("Request failed");
    error.response = { status, data };
    return error;
};

module.exports = {
    // OAuth
    GARMIN_TOKEN_SUCCESS,
    GARMIN_TOKEN_REFRESH_SUCCESS,
    GARMIN_TOKEN_ERROR,
    // Activities
    GARMIN_ACTIVITY_CYCLING,
    GARMIN_ACTIVITY_RUNNING,
    GARMIN_ACTIVITY_LIST,
    GARMIN_ACTIVITY_EMPTY,
    // Webhooks
    GARMIN_WEBHOOK_ACTIVITY,
    GARMIN_WEBHOOK_ACTIVITY_DEREGISTER,
    GARMIN_WEBHOOK_DEREGISTER,
    // 중복 판정
    GARMIN_ACTIVITY_DUPLICATE_WITH_STRAVA,
    GARMIN_ACTIVITY_UNIQUE,
    // FIT 파일
    FIT_FILE_PARSED_RESULT,
    // DB 기대값
    EXPECTED_T_RIDING_ROW,
    EXPECTED_GARMIN_TOKEN_ROW,
    // 헬퍼
    mockAxiosResponse,
    mockAxiosError,
};
