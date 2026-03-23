# WB3 Garmin API 연동 테스트 전략

> 작성일: 2026-03-19
> 참고: WB3_라이딩GPS_분석서.md, WB3_포인트SSP캐시_분석서.md

---

## 1. 현재 테스트 환경 분석 결과

### 기존 테스트 현황

| 영역 | 상태 | 비고 |
|------|------|------|
| API (`API/`) | 테스트 없음 | Jest/Mocha 미설치 |
| WEB (`WEB/`) | 테스트 없음 | package.json에 test 스크립트 없음 |
| APP (`APP/test/`) | 스모크 테스트 1개 | widget_test.dart만 존재 (기본 템플릿) |
| CI/CD | 테스트 없음 | 빌드/배포 스크립트만 존재 |

### 핵심 관찰 사항

- **API**: Node.js + Express + Serverless Framework. Babel 설정은 있으나 Jest 미설치.
- **기존 Strava 패턴**: `StravaController.getActivities()` → `mapper.getStatement()` → `RDB.Query()` 흐름이 확립되어 있음.
- **응답 형식**: `_RS.JsonOK / _RS.JsonExcept` 패턴을 모든 라우트에서 사용.
- **트랜잭션**: `RDB.getConnection()` → `beginTransaction` → `commit/rollback` 패턴.
- **SSP 지급**: `MemberController.ssp()` 함수로 중앙화되어 있음.

---

## 2. Garmin vs Strava 아키텍처 차이

| 항목 | Strava | Garmin |
|------|--------|--------|
| OAuth 방식 | Authorization Code + client_secret | Authorization Code + PKCE (code_verifier) |
| 데이터 수신 | Pull (앱에서 sync 버튼) | Push (Webhook으로 자동 전송) |
| refresh_token | 장기 유효 | 1회용 (갱신 시 새 token으로 교체) |
| 서명 검증 | 없음 | HMAC-SHA1 (Consumer Secret) |
| 파일 형식 | JSON API | JSON Summary + FIT 파일 옵션 |

이 차이가 테스트 설계의 핵심입니다.

---

## 3. 생성된 테스트 파일 구조

```
API/
├── __tests__/
│   ├── mocks/
│   │   └── garmin.mock.js          # Mock 데이터 (OAuth, Activity, Webhook)
│   ├── unit/
│   │   ├── garmin.oauth.test.js    # PKCE 함수 단위 테스트
│   │   └── garmin.activity.test.js # 데이터 변환 단위 테스트
│   └── integration/
│       ├── garmin.webhook.test.js  # Webhook 플로우 통합 테스트
│       ├── garmin.sync.test.js     # 동기화 플로우 통합 테스트
│       └── garmin.api.test.js      # API 엔드포인트 테스트
├── jest.config.js                  # Jest 설정
└── package.json                    # test 스크립트 추가됨

APP/
└── test/
    └── garmin_oauth_test.dart      # Flutter PKCE 테스트
```

---

## 4. 테스트 실행 방법

```bash
# API 디렉토리에서 실행
cd API

# 의존성 설치 (Jest 신규 추가)
yarn install

# 전체 테스트 실행
yarn test

# Garmin 관련 테스트만 실행
yarn test:garmin

# 단위 테스트만 실행
yarn test:unit

# 통합 테스트만 실행
yarn test:integration

# 커버리지 리포트 생성
yarn test:coverage

# Flutter 테스트 (APP 디렉토리에서)
cd APP
flutter test test/garmin_oauth_test.dart
```

---

## 5. 단위 테스트 상세 설명

### 5-1. PKCE 함수 테스트 (`garmin.oauth.test.js`)

```
테스트 파일: API/__tests__/unit/garmin.oauth.test.js
```

| 테스트 케이스 | 검증 내용 | 왜 중요한가 |
|-------------|---------|-----------|
| code_verifier 길이 43~128자 | RFC 7636 규격 준수 | 짧으면 Garmin 서버가 거부 |
| code_verifier 허용 문자셋 | URL-safe 문자만 사용 | 특수문자 포함 시 URL 인코딩 오류 |
| code_challenge SHA-256 정확성 | 알려진 값으로 검증 | 잘못된 challenge는 token 교환 실패 |
| refresh_token 교체 로직 | 새 token으로 DB 업데이트 | Garmin 1회용 정책. 누락 시 다음 갱신 실패 |
| 만료 token 연동 해제 | invalid_grant 에러 처리 | 사용자에게 재연동 안내 필요 |

### 5-2. Activity 데이터 변환 테스트 (`garmin.activity.test.js`)

```
테스트 파일: API/__tests__/unit/garmin.activity.test.js
```

**단위 변환 검증표:**

| Garmin 필드 | 단위 | 변환 후 | T_RIDING 컬럼 |
|------------|------|--------|--------------|
| distanceInMeters | m | ÷1000, 소수1자리 | DISTANCE |
| averageSpeedInMetersPerSecond | m/s | ×3.6 | AVG_SPEED |
| maxSpeedInMetersPerSecond | m/s | ×3.6 | MAX_SPEED |
| startTimeInSeconds | unix UTC | +offset → KST문자열 | START_DATE |
| activityId | number | toString() | ID |
| activityType | string | toUpperCase() | KIND |

**중복 감지 알고리즘:**
- 시작 시간 차이: ±5분(300초) 이내
- 거리 차이: 5% 이내
- 두 조건 모두 만족 시 → 중복으로 판정 → INSERT 건너뜀

---

## 6. 통합 테스트 상세 설명

### 6-1. Webhook 처리 플로우 (`garmin.webhook.test.js`)

```
테스트 파일: API/__tests__/integration/garmin.webhook.test.js
```

**Webhook 처리 순서:**
```
Garmin 서버
    │
    ▼ POST /callbacks/garmin/webhook
    │   { activities: [{ summaryId, activityType, ... }] }
    │
    ▼ 서명 검증 (HMAC-SHA1)
    │
    ▼ 200 OK 즉시 응답 (Garmin 요구사항)
    │
    ▼ 비동기 처리
    │   └─ checkGarmin (summaryId 중복 체크)
    │   └─ addGarmin (T_RIDING INSERT)
    │   └─ 트랜잭션 commit
```

**이중 지급 방지 로직:**
- `T_SSP_LOG.CODE = 'RIDING-GARMIN-{summaryId}'`로 추적
- 설문 완료 시 `MemberController.ssp()` 호출
- `checkGarmin` 쿼리가 `count > 0`이면 전체 처리 건너뜀

### 6-2. OAuth 콜백 플로우 (`garmin.webhook.test.js`)

```
앱 (Flutter)
    │
    ▼ WebView로 Garmin Connect 열기
    │   https://connect.garmin.com/oauth-service/oauth/authorize
    │   ?code_challenge=xxx&code_challenge_method=S256&...
    │
    ▼ 사용자 로그인 + 권한 허용
    │
    ▼ Garmin이 redirect_uri로 리다이렉트
    │   https://wrightbrothers.kr/callbacks/garmin/login/app/ios?code=yyy
    │
    ▼ 서버 (callbacks.js)
    │   - code + code_verifier → token 교환
    │   - access_token, refresh_token, userId 저장
    │   - 앱 딥링크로 리다이렉트
    │     wbkr://type=GARMIN&status=success
    │
    ▼ 앱이 딥링크 수신 → 연동 완료 UI 표시
```

---

## 7. Mock 데이터 설계 (`garmin.mock.js`)

```
테스트 파일: API/__tests__/mocks/garmin.mock.js
```

| Mock 데이터 | 용도 |
|------------|------|
| `GARMIN_TOKEN_SUCCESS` | 토큰 교환 성공 시뮬레이션 |
| `GARMIN_TOKEN_REFRESH_SUCCESS` | 토큰 갱신 (새 refresh_token 포함) |
| `GARMIN_TOKEN_ERROR` | `invalid_grant` 에러 케이스 |
| `GARMIN_ACTIVITY_CYCLING` | 자전거 라이딩 Activity |
| `GARMIN_ACTIVITY_RUNNING` | 달리기 Activity (CYCLING 외 처리 검증) |
| `GARMIN_WEBHOOK_ACTIVITY` | Activity 알림 Webhook payload |
| `GARMIN_WEBHOOK_DEREGISTER` | 연동 해제 Webhook payload |
| `GARMIN_ACTIVITY_DUPLICATE_WITH_STRAVA` | Strava와 동일 시간/거리 (중복 테스트용) |
| `FIT_FILE_PARSED_RESULT` | FIT 파일 파서 출력 형식 |
| `EXPECTED_T_RIDING_ROW` | T_RIDING INSERT 기대값 |

---

## 8. 구현 시 추가해야 할 파일들

Garmin 연동 구현 시 아래 파일들을 생성하고, 테스트가 통과되도록 코드를 작성합니다.

### API 서버 (`API/api/`)
```
api/
├── controllers/
│   └── garmin.js         # OAuth, 토큰 관리, Activity 조회
├── routes/
│   ├── callbacks.js      # (수정) Garmin OAuth 콜백 라우트 추가
│   ├── v1/user/mypage/
│   │   └── riding.js     # (수정) /garmin/sync 라우트 추가
│   └── v2/user/
│       └── riding.js     # (수정) /garmin 상태 조회 라우트 추가
└── mapper/
    └── userMypageRiding.xml  # (수정) checkGarmin, addGarmin SQL 추가
```

### Flutter 앱 (`APP/lib/`)
```
lib/
└── garmin/
    ├── garmin_oauth.dart     # PKCE 유틸리티
    ├── garmin_service.dart   # API 호출 서비스
    └── garmin_state.dart     # Riverpod 상태 관리
```

### DB 변경
```sql
-- Garmin 토큰 저장 (T_MEMBER_SNS에 TYPE='GARMIN'으로 추가 또는 신규 테이블)
-- T_RIDING에 TYPE='GARMIN' 추가 (기존 'WB', 'STRAVA'와 동일 패턴)
-- T_SSP_LOG의 CODE: 'RIDING-GARMIN-{activityId}' 형식
```

---

## 9. Garmin Partner Verification Tool 체크리스트

Garmin 파트너 검증 통과를 위한 테스트 확인 항목입니다.

| 항목 | 검증 방법 | 테스트 파일 |
|------|---------|------------|
| OAuth PKCE 정상 동작 | code_verifier/challenge 생성 정확성 | `garmin.oauth.test.js` |
| Webhook 200 OK 즉시 응답 | 응답 코드 검증 | `garmin.api.test.js` |
| 연동 해제 Webhook 처리 | DB 토큰 삭제 확인 | `garmin.webhook.test.js` |
| 개인정보 삭제 (연동 해제 시) | 토큰 삭제 로직 | `garmin.webhook.test.js` |
| Activity 중복 처리 방지 | summaryId 중복 체크 | `garmin.sync.test.js` |
| Garmin 브랜딩 가이드라인 | UI 버튼에 공식 로고 사용 | (수동 검증) |

---

## 10. 테스트 우선순위 및 구현 로드맵

### Phase 1 (핵심 - 먼저 통과해야 함)
1. `garmin.oauth.test.js` - PKCE 구현 검증
2. `garmin.webhook.test.js` - Webhook 수신 및 이중지급 방지
3. `garmin.sync.test.js` - T_RIDING 저장 트랜잭션

### Phase 2 (안정성)
4. `garmin.activity.test.js` - 데이터 변환 정확성
5. `garmin.api.test.js` - API 응답 형식 일관성

### Phase 3 (Flutter 앱)
6. `garmin_oauth_test.dart` - 앱 측 PKCE 로직

---

## 11. 주의 사항 (초보 개발자를 위한 설명)

### Garmin의 가장 큰 특이사항
1. **1회용 refresh_token**: Strava와 달리 Garmin은 토큰을 갱신할 때마다 새로운 refresh_token을 발급합니다. 기존 refresh_token은 즉시 무효화됩니다. DB 업데이트를 빠뜨리면 다음 갱신 시 연동이 끊깁니다.

2. **Webhook 즉시 응답**: Garmin은 Webhook을 받으면 즉시(5초 이내) 200 OK를 기대합니다. DB 처리가 느려도 200을 먼저 보내고 비동기로 처리해야 합니다.

3. **code_verifier 임시 저장**: OAuth 인증 시작 시 생성한 code_verifier를 콜백까지 보관해야 합니다. 앱에서는 SecureStorage나 메모리에 임시 저장합니다.
