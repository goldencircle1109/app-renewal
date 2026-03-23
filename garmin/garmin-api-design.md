# Garmin Connect Developer Program API 연동 설계

작성일: 2026-03-19
작성자: API Designer

---

## 1. 기존 코드 패턴 분석 결과

### 1-1. 응답 포맷 표준 (`WEB/src/api/utils/ResultSet.js`)

프로젝트 전체에서 아래 두 가지 포맷만 사용합니다.

```
// 성공
{ "status": "SUCCESS", "error": 0, "message": "OK", "data": { ... } }

// 실패
{ "status": "FAILURE", "error": -1, "message": "에러 메시지", "data": null }
```

헬퍼 함수:
- `_RS.JsonOK(res, data)` — 성공 응답
- `_RS.JsonERROR(res, message, errorCode)` — 실패 응답
- `_RS.JsonExcept(res, e)` — catch 블록 공통 처리 (`e.code`가 있으면 에러코드, 없으면 `e.message`)

### 1-2. 인증 미들웨어 (`WEB/src/api/controllers/verificate.js`)

```
VerificateController.APIKey   → /api/** 경로에서 헤더 apikey 검증
VerificateController.Author   → Authorization / authorios 헤더로 req.mem 주입
```

- `req.mem`이 없으면 비로그인 상태
- `/api/v1/user/**` 라우터 진입 시 `mem.status !== "Y"` 이면 즉시 `권한이 없습니다.` 반환
- `/api/callbacks/**` 경로는 APIKey 검증 제외 (외부 서비스 웹훅용)

### 1-3. 콜백 경로 패턴 (`WEB/src/api/routes/callbacks.js`)

| 패턴 | 설명 |
|---|---|
| `POST /api/callbacks/payment/bootpay/webhook` | IP 화이트리스트 검증 후 처리 |
| `GET /api/callbacks/strava/login/app/ios` | `wbkr://` 딥링크로 307 리디렉트 |
| `GET /api/callbacks/strava/login/app/android` | `intent://` 딥링크로 307 리디렉트 |
| `POST /api/callbacks/apple/login` | 쿠키 세팅 후 `/login/apple`로 리디렉트 |

웹훅 엔드포인트는 `try/catch` 내부에서 처리하며,
성공 시 `res.send("OK")` 또는 `res.status(200).send({ success: true })`,
실패 시 `res.send("Error")` 또는 `res.status(500).send({ success: false })` 반환합니다.

### 1-4. 공통 인증 패턴 (`WEB/src/api/routes/v1/common.js`)

SNS 토큰 교환은 `/api/v1/common/{provider}/login` 에 위치합니다.
예: `POST /api/v1/common/strava/login` → Strava authorization code → access_token 교환

### 1-5. 마이페이지 동기화 패턴 (`WEB/src/api/routes/v1/user/mypage/riding.js`)

```
GET /api/v1/user/mypage/riding/strava/sync
```
- DB에서 `accessToken`, `refreshToken` 조회
- Strava API 호출 → 활동 목록 수신
- `RDB.getConnection()` → `beginTransaction()` → 중복 체크 후 insert → `commit()`
- `_RS.JsonOK(res)` 로 종료

### 1-6. SNS 연동 패턴 (`WEB/src/api/routes/v1/user/mypage/index.js`)

```
GET    /api/v1/user/mypage/sns     → 연동된 SNS 목록 조회
POST   /api/v1/user/mypage/sns     → SNS 연동 추가 (type: KAKAO/NAVER/GOOGLE/APPLE/STRAVA)
DELETE /api/v1/user/mypage/sns     → SNS 연동 해제
```

---

## 2. Garmin Connect API 연동 설계

### 2-1. Garmin OAuth 2.0 PKCE 흐름 개요

Garmin Connect Developer Program은 OAuth 2.0 Authorization Code with PKCE 방식을 사용합니다.

```
앱(iOS/Android)
  │
  ├─ [1] GET /api/v1/common/garmin/auth       → code_verifier, code_challenge 생성 → authUrl 반환
  │
  ├─ [2] 사용자가 Garmin 로그인 페이지에서 승인
  │
  ├─ [3] Garmin → GET /api/callbacks/garmin/login/app/ios (또는 android)
  │         → 딥링크(wbkr://)로 307 리디렉트 → 앱이 code 수신
  │
  ├─ [4] POST /api/v1/common/garmin/token     → code + code_verifier → access_token 교환
  │
  └─ [5] POST /api/v1/user/mypage/sns         → type: GARMIN 으로 연동 저장
```

---

## 3. 엔드포인트 상세 설계

### [그룹 A] 인증 관련

---

#### A-1. Garmin OAuth 인증 URL 생성

```
GET /api/v1/common/garmin/auth
```

**용도**: PKCE용 code_verifier / code_challenge를 서버에서 생성하고,
Garmin 로그인 URL을 앱에 반환합니다.
(code_verifier는 세션/캐시에 임시 보관하거나 앱이 직접 생성해 서버에 전달하는 방식 모두 가능)

**Request**

| 위치 | 파라미터 | 필수 | 설명 |
|---|---|---|---|
| Header | `apikey` | 필수 | WrightBrothers API 키 |
| Header | `Authorization` | 필수 | 로그인 사용자 인증 토큰 (`req.mem` 주입) |

**Response (성공)**

```json
{
  "status": "SUCCESS",
  "error": 0,
  "message": "OK",
  "data": {
    "authUrl": "https://connect.garmin.com/oauth2/authorize?client_id=...&code_challenge=...&code_challenge_method=S256&redirect_uri=...&response_type=code&scope=activity_read+health_snapshot",
    "codeVerifier": "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk",
    "state": "a9f3bc2e1d"
  }
}
```

> `codeVerifier`는 앱에서 토큰 교환(A-3) 시 다시 전송해야 합니다.
> `state`는 CSRF 방지용 무작위 문자열입니다.

**에러 케이스**

| HTTP | error 코드 | message |
|---|---|---|
| 200 | -5 | Authorization Key is Undefined (비로그인) |

**구현 위치**: `WEB/src/api/routes/v1/common.js` 에 추가

---

#### A-2. Garmin 콜백 수신 (딥링크 리디렉트)

Strava 패턴과 동일하게 iOS / Android 각각 별도 엔드포인트로 분리합니다.

**iOS**

```
GET /api/callbacks/garmin/login/app/ios
```

**Android**

```
GET /api/callbacks/garmin/login/app/android
```

**Request (Query)**

| 파라미터 | 필수 | 설명 |
|---|---|---|
| `code` | 필수 | Garmin 인증 서버가 전달한 authorization code |
| `state` | 권장 | CSRF 검증용 state 값 |

**응답**: HTTP 307 리디렉트

- iOS: `wbkr://type=GARMIN&code={code}&state={state}`
- Android: `intent://type=GARMIN&code={code}&state={state}#Intent;package=kr.wrightbrothers;scheme=wbkr;end`

**에러 케이스**

| 상황 | 처리 |
|---|---|
| `code` 파라미터 없음 | `wbkr://type=GARMIN&error=missing_code` 로 리디렉트 |
| Garmin이 `error` 파라미터 전달 시 | `wbkr://type=GARMIN&error={error}` 로 리디렉트 |

> `/api/callbacks/**` 경로는 `APIKey` 미들웨어에서 제외되므로 별도 apikey 불필요.

**구현 위치**: `WEB/src/api/routes/callbacks.js` 에 추가

---

#### A-3. Garmin 토큰 교환

```
POST /api/v1/common/garmin/token
```

**용도**: 앱이 콜백으로 받은 `code`와 최초 생성한 `codeVerifier`를 서버에 전달하면,
서버가 Garmin 토큰 서버에 요청하여 `access_token`, `refresh_token`을 반환합니다.
(Strava의 `POST /api/v1/common/strava/login` 과 동일한 패턴)

**Request**

| 위치 | 파라미터 | 필수 | 설명 |
|---|---|---|---|
| Header | `apikey` | 필수 | WrightBrothers API 키 |
| Body | `code` | 필수 | Garmin authorization code |
| Body | `codeVerifier` | 필수 | PKCE code_verifier |

**Request Body 예시**

```json
{
  "code": "Yzk5ZjA...",
  "codeVerifier": "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk"
}
```

**Response (성공)**

```json
{
  "status": "SUCCESS",
  "error": 0,
  "message": "OK",
  "data": {
    "accessToken": "eyJhbGci...",
    "refreshToken": "dGhpcyBp...",
    "expiresIn": 3600,
    "tokenType": "Bearer",
    "scope": "activity_read health_snapshot",
    "userId": "garmin_user_id_string"
  }
}
```

> 앱은 이 결과를 받은 뒤, `POST /api/v1/user/mypage/sns` (type: "GARMIN") 를 호출해
> 연동을 DB에 저장합니다.

**에러 케이스**

| HTTP | error 코드 | message |
|---|---|---|
| 200 | -1 | code is required |
| 200 | -1 | codeVerifier is required |
| 200 | -1 | Garmin 토큰 발급에 실패하였습니다. |

**구현 위치**: `WEB/src/api/routes/v1/common.js` 에 추가

---

#### A-4. Garmin 연동 해제

기존 SNS 연동 해제 엔드포인트를 그대로 활용합니다.
별도의 Garmin 전용 엔드포인트를 만들지 않고 기존 `DELETE /api/v1/user/mypage/sns` 에
`type: "GARMIN"` 을 추가하는 방식으로 구현합니다.

```
DELETE /api/v1/user/mypage/sns
```

**Request Body**

```json
{
  "type": "GARMIN"
}
```

**Response (성공)**

```json
{
  "status": "SUCCESS",
  "error": 0,
  "message": "OK",
  "data": null
}
```

> Garmin Deregistration API 호출이 필요한 경우(사용자가 Garmin 측에서 직접 앱 권한을 취소),
> 아래 A-5의 Deregistration 웹훅으로 처리합니다.
> **구현 위치**: 기존 `WEB/src/api/routes/v1/user/mypage/index.js` 의 `DELETE /sns` 핸들러에
> `case "GARMIN":` 분기만 추가

---

### [그룹 B] 데이터 동기화 관련

---

#### B-1. Garmin 활동 수동 동기화

```
GET /api/v1/user/mypage/riding/garmin/sync
```

**용도**: Strava 동기화(`/strava/sync`)와 동일한 패턴.
사용자가 마이페이지에서 수동으로 Garmin 활동 데이터를 가져올 때 사용합니다.

**Request**

| 위치 | 파라미터 | 필수 | 설명 |
|---|---|---|---|
| Header | `apikey` | 필수 | WrightBrothers API 키 |
| Header | `Authorization` | 필수 | 로그인 사용자 인증 토큰 |
| Query | `startDate` | 선택 | 동기화 시작일 `YYYY-MM-DD` (기본: 30일 전) |
| Query | `endDate` | 선택 | 동기화 종료일 `YYYY-MM-DD` (기본: 오늘) |

**처리 흐름**

```
1. DB에서 GARMIN type의 accessToken, refreshToken 조회
2. 토큰 없으면 → _RS.JsonOK(res) 빈 응답 반환 (Strava 패턴 동일)
3. Garmin API 호출 → 활동 목록 수신
4. access_token 만료 시 → refreshToken으로 재발급 후 재시도
5. RDB.getConnection() → beginTransaction()
6. 각 활동별 중복 체크 (garminActivityId 기준) → 없으면 insert
7. commit() → _RS.JsonOK(res)
```

**Response (성공)**

```json
{
  "status": "SUCCESS",
  "error": 0,
  "message": "OK",
  "data": {
    "syncCount": 5,
    "totalCount": 5
  }
}
```

**에러 케이스**

| HTTP | error 코드 | message |
|---|---|---|
| 200 | -5 | Authorization Key is Undefined (비로그인) |
| 200 | -1 | Garmin 데이터 동기화 중 오류가 발생하였습니다. |
| 200 | -1 | Garmin 토큰 갱신에 실패하였습니다. |

**구현 위치**: `WEB/src/api/routes/v1/user/mypage/riding.js` 에 추가

---

#### B-2. Garmin 건강 데이터 조회

```
GET /api/v1/user/mypage/garmin/health
```

**용도**: Garmin Health API에서 심박수, 수면, 걸음수, 스트레스 등의 건강 데이터를 조회합니다.

**Request**

| 위치 | 파라미터 | 필수 | 설명 |
|---|---|---|---|
| Header | `apikey` | 필수 | WrightBrothers API 키 |
| Header | `Authorization` | 필수 | 로그인 사용자 인증 토큰 |
| Query | `date` | 선택 | 조회 날짜 `YYYY-MM-DD` (기본: 오늘) |

**Response (성공)**

```json
{
  "status": "SUCCESS",
  "error": 0,
  "message": "OK",
  "data": {
    "date": "2026-03-19",
    "steps": 8432,
    "heartRateAvg": 72,
    "heartRateMin": 52,
    "heartRateMax": 134,
    "sleepSeconds": 27000,
    "stressAvg": 35,
    "caloriesTotal": 2140,
    "floorsClimbed": 8
  }
}
```

**에러 케이스**

| HTTP | error 코드 | message |
|---|---|---|
| 200 | -5 | Authorization Key is Undefined (비로그인) |
| 200 | -1 | Garmin 연동 정보를 조회할 수 없습니다. |
| 200 | -1 | 건강 데이터 조회에 실패하였습니다. |

**구현 위치**: 신규 파일 `WEB/src/api/routes/v1/user/mypage/garmin.js`

---

### [그룹 C] Webhook 관련

---

#### C-1. Garmin Push Webhook 수신

```
POST /api/callbacks/garmin/webhook
```

**용도**: Garmin이 사용자의 새 활동 / 건강 데이터를 서버로 자동 Push할 때 수신합니다.
Bootpay/PortOne 웹훅 패턴과 동일하게 IP 화이트리스트 검증 후 처리합니다.

**Garmin Webhook IP 목록** (Garmin 공식 문서 기준, 실제 운영 전 재확인 필요)

```javascript
const _GARMIN_IP = ["54.214.207.162", "52.32.179.7", "52.25.149.139"];
```

**Request Body (Garmin가 전송하는 형식)**

```json
{
  "userId": "garmin_user_id",
  "uploadStartTimeInSeconds": 1710806400,
  "uploadEndTimeInSeconds": 1710810000,
  "activityFiles": [
    {
      "activityId": 12345678901,
      "activityName": "Cycling",
      "activityType": "CYCLING",
      "startTimeInSeconds": 1710806400,
      "durationInSeconds": 3600,
      "distanceInMeters": 25000,
      "averageSpeedInMetersPerSecond": 6.94
    }
  ]
}
```

**처리 흐름**

```
1. IP 화이트리스트 검증 (실패 시 → res.status(403).send({ success: false }))
2. userId로 회원 조회 (연동된 GARMIN SNS 레코드)
3. 회원 없으면 → res.status(200).send({ success: true }) (무시 처리)
4. RDB.getConnection() → beginTransaction()
5. 각 activityId 중복 체크 → 없으면 riding 테이블에 insert
6. commit() → res.status(200).send({ success: true })
```

**Response**

```json
{ "success": true }
```

**에러 케이스**

| HTTP | 응답 | 상황 |
|---|---|---|
| 403 | `{ "success": false }` | Garmin IP가 아닌 요청 |
| 500 | `{ "success": false }` | DB 처리 오류 |
| 200 | `{ "success": true }` | 정상 처리 (또는 이미 처리된 데이터) |

> `/api/callbacks/**` 는 `APIKey` 미들웨어 대상 제외이므로
> 별도 API 키 없이 수신 가능 (기존 패턴과 동일)

**구현 위치**: `WEB/src/api/routes/callbacks.js` 에 추가

---

#### C-2. Garmin Deregistration 콜백

```
POST /api/callbacks/garmin/deregister
```

**용도**: 사용자가 Garmin Connect 앱에서 직접 WrightBrothers 앱 권한을 취소했을 때,
Garmin이 서버로 알림을 보내는 엔드포인트입니다.

**Request Body (Garmin 전송 형식)**

```json
{
  "userId": "garmin_user_id",
  "deregistrationTimestamp": 1710806400
}
```

**처리 흐름**

```
1. IP 화이트리스트 검증 (위 C-1과 동일)
2. userId로 SNS 테이블에서 GARMIN 레코드 조회
3. 해당 레코드 삭제 (또는 status = 'N' 처리)
4. res.status(200).send({ success: true })
```

**Response**

```json
{ "success": true }
```

**에러 케이스**

| HTTP | 응답 | 상황 |
|---|---|---|
| 403 | `{ "success": false }` | Garmin IP가 아닌 요청 |
| 200 | `{ "success": true }` | 정상 처리 (userId 없어도 성공 반환, Garmin 권고사항) |
| 500 | `{ "success": false }` | DB 처리 오류 |

**구현 위치**: `WEB/src/api/routes/callbacks.js` 에 추가

---

### [그룹 D] 마이페이지 관련

---

#### D-1. Garmin 연동 상태 조회

기존 SNS 연동 조회 엔드포인트를 그대로 활용합니다.

```
GET /api/v1/user/mypage/sns
```

**Response 예시** (기존 응답에 GARMIN 항목 포함)

```json
{
  "status": "SUCCESS",
  "error": 0,
  "message": "OK",
  "data": [
    { "type": "KAKAO", "uid": "12345", "email": "user@kakao.com" },
    { "type": "STRAVA", "uid": "54321", "email": null },
    { "type": "GARMIN", "uid": "garmin_user_id", "email": null }
  ]
}
```

> DB `SNS` 테이블에 `type = 'GARMIN'` 레코드만 추가하면 됩니다.
> 별도 엔드포인트 불필요.

---

#### D-2. Garmin 건강 대시보드 데이터

```
GET /api/v1/user/mypage/garmin/dashboard
```

**용도**: 마이페이지 Garmin 섹션에서 최근 7일 요약 데이터를 표시합니다.

**Request**

| 위치 | 파라미터 | 필수 | 설명 |
|---|---|---|---|
| Header | `apikey` | 필수 | WrightBrothers API 키 |
| Header | `Authorization` | 필수 | 로그인 사용자 인증 토큰 |

**Response (성공)**

```json
{
  "status": "SUCCESS",
  "error": 0,
  "message": "OK",
  "data": {
    "isConnected": true,
    "lastSyncDate": "2026-03-19T10:30:00",
    "weeklyStats": {
      "totalDistanceKm": 87.3,
      "totalRidingCount": 4,
      "avgHeartRate": 74,
      "avgSleepHours": 6.8,
      "totalCalories": 14980
    },
    "recentActivities": [
      {
        "activityId": "12345678901",
        "activityName": "Morning Ride",
        "activityType": "CYCLING",
        "startDate": "2026-03-19T06:30:00",
        "durationSeconds": 3600,
        "distanceKm": 25.0,
        "avgSpeedKmh": 25.0
      }
    ]
  }
}
```

**에러 케이스**

| HTTP | error 코드 | message |
|---|---|---|
| 200 | -5 | Authorization Key is Undefined (비로그인) |
| 200 | -1 | Garmin 연동 정보를 조회할 수 없습니다. |

> `isConnected: false` 인 경우 `weeklyStats`, `recentActivities` 는 `null` 반환

**구현 위치**: 신규 파일 `WEB/src/api/routes/v1/user/mypage/garmin.js`

---

## 4. 신규 파일 및 수정 파일 목록

### 신규 생성

| 파일 경로 | 설명 |
|---|---|
| `WEB/src/api/routes/v1/user/mypage/garmin.js` | 건강 데이터 조회, 대시보드 라우트 |
| `WEB/src/api/controllers/garmin.js` | Garmin API 호출 컨트롤러 (토큰 갱신, 활동 조회, 건강 데이터 조회) |
| `WEB/src/api/mapper/user_mypage_garmin.xml` | Garmin 관련 SQL (활동 insert/조회, SNS 토큰 조회) |

### 수정 파일

| 파일 경로 | 수정 내용 |
|---|---|
| `WEB/src/api/routes/callbacks.js` | Garmin 콜백(iOS/Android 딥링크), 웹훅, Deregistration 엔드포인트 추가 |
| `WEB/src/api/routes/v1/common.js` | Garmin auth URL 생성, 토큰 교환 엔드포인트 추가 |
| `WEB/src/api/routes/v1/user/mypage/riding.js` | Garmin 활동 수동 동기화 엔드포인트 추가 |
| `WEB/src/api/routes/v1/user/mypage/index.js` | garmin.js 라우트 마운트 추가 |
| `WEB/src/api/config/index.js` | `garmin: { clientId, clientSecret }` 설정 추가 |
| `WEB/src/api/controllers/index.js` | GarminController export 추가 |

---

## 5. 환경변수 추가 목록

```
# Garmin Connect Developer Program
GARMIN_CLIENT_ID=
GARMIN_CLIENT_SECRET=
GARMIN_REDIRECT_URI_IOS=https://wrightbrothers.kr/api/callbacks/garmin/login/app/ios
GARMIN_REDIRECT_URI_ANDROID=https://wrightbrothers.kr/api/callbacks/garmin/login/app/android
```

---

## 6. DB 스키마 변경사항

### 기존 SNS 테이블 활용

`MEMBER_SNS` 테이블의 `TYPE` 컬럼에 `'GARMIN'` 값 추가만으로 충분합니다.
기존 STRAVA 연동이 `TOKEN`, `REFRESH_TOKEN` 컬럼을 사용하는 것과 동일하게 활용합니다.

### Garmin 활동 저장

기존 `RIDING` 테이블에 `SOURCE` 컬럼이 있다면 `'GARMIN'` 값을 추가합니다.
없다면 아래 컬럼 추가를 검토합니다.

```sql
ALTER TABLE RIDING
  ADD COLUMN GARMIN_ACTIVITY_ID VARCHAR(20) NULL COMMENT 'Garmin 활동 고유 ID (중복 방지)',
  ADD COLUMN SOURCE VARCHAR(10) NULL COMMENT '데이터 출처 (STRAVA/GARMIN/MANUAL)';
```

---

## 7. 전체 엔드포인트 요약표

| # | 메서드 | 경로 | 인증 | 설명 |
|---|---|---|---|---|
| A-1 | GET | `/api/v1/common/garmin/auth` | apikey + Authorization | OAuth 인증 URL 생성 |
| A-2a | GET | `/api/callbacks/garmin/login/app/ios` | 없음 | iOS 딥링크 리디렉트 |
| A-2b | GET | `/api/callbacks/garmin/login/app/android` | 없음 | Android 딥링크 리디렉트 |
| A-3 | POST | `/api/v1/common/garmin/token` | apikey | 토큰 교환 |
| A-4 | DELETE | `/api/v1/user/mypage/sns` | apikey + Authorization | 연동 해제 (기존 활용) |
| B-1 | GET | `/api/v1/user/mypage/riding/garmin/sync` | apikey + Authorization | 활동 수동 동기화 |
| B-2 | GET | `/api/v1/user/mypage/garmin/health` | apikey + Authorization | 건강 데이터 조회 |
| C-1 | POST | `/api/callbacks/garmin/webhook` | IP 화이트리스트 | Push 웹훅 수신 |
| C-2 | POST | `/api/callbacks/garmin/deregister` | IP 화이트리스트 | Deregistration 콜백 |
| D-1 | GET | `/api/v1/user/mypage/sns` | apikey + Authorization | 연동 상태 조회 (기존 활용) |
| D-2 | GET | `/api/v1/user/mypage/garmin/dashboard` | apikey + Authorization | 건강 대시보드 |

---

## 8. 구현 시 주의사항

**PKCE code_verifier 보관 방식**
서버가 생성해서 Redis/세션에 저장하거나, 앱이 직접 생성해서 `/token` 호출 시 함께 전송하는 방식 중 선택이 필요합니다.
현재 프로젝트에 Redis가 없다면 앱이 직접 생성하는 방식이 더 단순합니다.
(A-1 엔드포인트에서 `codeVerifier` 를 `data` 에 포함해 앱에 반환하는 방식을 기본 설계에 채택했습니다)

**Garmin API IP 화이트리스트 확인**
Garmin 공식 Developer Program 문서에서 실제 웹훅 발신 IP 범위를 반드시 확인 후 `_GARMIN_IP` 배열에 적용하세요.

**토큰 갱신 처리**
`GarminController`는 Strava 컨트롤러(`strava.js`)와 동일한 패턴으로,
access_token 만료 감지 → refresh_token으로 재발급 → 재시도 흐름을 구현합니다.

**활동 타입 매핑**
Garmin의 `activityType` 값(`CYCLING`, `RUNNING` 등)을 기존 `RIDING` 테이블의
`KIND` 컬럼 형식으로 변환하는 매핑 로직이 필요합니다.
Strava의 `sport_type.toUpperCase()` 처리 방식과 통일하면 됩니다.
