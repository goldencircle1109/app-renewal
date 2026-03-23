# Garmin API vs Strava API 통합 비교 분석 보고서

**작성일**: 2026-03-19
**대상**: WrightBrothers 개발팀
**목적**: Garmin Connect Developer Program 통합 도입을 위한 기술 비교 및 구현 전략 수립
**현황**: Garmin Developer Portal 연동계약 승인 완료

---

## 1. Garmin API 종류

Garmin은 목적이 다른 3가지 독립 프로그램을 운영합니다.

### 1-1. Garmin Connect Developer Program (GCDP) ⭐ 우리가 승인받은 것

서버-to-서버 방식으로 사용자의 Garmin Connect 데이터를 외부 앱에서 가져오는 API입니다.

| Sub-API | 설명 | WB 관련성 |
|---------|------|-----------|
| **Health API** | 일일 웰니스 데이터 (걸음수, 심박수, 수면, 스트레스, Body Battery) | 높음 |
| **Activity API** | 운동 활동 FIT/GPX/TCX 파일 접근 | **매우 높음** (라이딩 기록) |
| **Training API** | 훈련 부하, 회복 시간, VO2max | 중간 |
| **Courses API** | 코스/루트 데이터 | 중간 |
| **Women's Health API** | 생리 주기, 임신 추적 데이터 | 낮음 |

### 1-2. Connect IQ SDK (별도 프로그램)

Garmin 워치에서 직접 실행되는 앱(워치페이스, 위젯)을 만드는 SDK입니다.
GCDP와는 완전히 별개이며, WrightBrothers의 현재 목표(서버 측 데이터 연동)와는 다릅니다.

### 1-3. Garmin Health SDK (모바일 SDK)

모바일 앱에서 Bluetooth로 Garmin 기기에 직접 연결하는 SDK입니다.
Flutter 앱에서 사용 가능하지만, 사용자가 기기를 직접 연결해야 하는 제약이 있습니다.

### 1-4. Push API vs Ping/Pull API

Garmin GCDP에서 가장 중요한 개념이며, Strava와 근본적으로 다른 데이터 전달 방식입니다.

```
[Push 방식] ← 권장
Garmin 서버 --> WB 서버 (POST body에 데이터 직접 포함)
→ 추가 API 호출 불필요, 구현 단순

[Ping/Pull 방식]
Garmin 서버 --> WB 서버 (알림: "새 데이터 있음, Callback URL")
WB 서버 --> Garmin API (30초 내에 Callback URL 호출해서 데이터 가져옴)
→ 30초 타임아웃, 비동기 처리 필요
```

---

## 2. 인증 방식 비교

### 2-1. 핵심 차이

| 구분 | Strava (현재 구현) | Garmin (신규 구현) |
|------|-------------------|-------------------|
| **인증 방식** | OAuth 2.0 표준 | OAuth 2.0 **PKCE** |
| **Access Token 유효기간** | 6시간 | **3개월** |
| **Refresh Token 정책** | 재사용 가능 | **사용 시마다 새것으로 교체** |
| **사용자 식별자** | athlete.id (숫자) | User ID (OAuth 2.0 전용 필드) |
| **추가 보안** | 없음 | code_verifier / code_challenge 필요 |

> ⚠️ **중요**: Garmin의 기존 OAuth 1.0a는 2026년 12월 31일 공식 폐기 예정입니다. 우리는 신규 승인이므로 **OAuth 2.0 PKCE로 바로 시작**합니다.

### 2-2. Garmin OAuth 2.0 PKCE 흐름

```
1. WB 앱 → Garmin Connect 로그인 페이지 리디렉션
   (PKCE: code_challenge 포함)

2. 사용자: Garmin 계정 로그인 + 데이터 공유 동의

3. Garmin → WB 서버로 authorization_code 전달

4. WB 서버 → Garmin: code + code_verifier 교환
   → Access Token (3개월) + Refresh Token 수신

5. Refresh Token은 갱신 시마다 새것으로 교체됨
   → DB에 최신 토큰 즉시 업데이트 필수!
```

### 2-3. 현재 Strava 인증 흐름 (참고)

```javascript
// API/api/controllers/strava.js 현재 패턴
const getToken = (refreshToken) => {
    // POST https://www.strava.com/api/v3/oauth/token
    // grant_type: "refresh_token"
    // → access_token, refresh_token 반환
};
```

### 2-4. 사용자 식별자 비교

```
Strava:  athlete.id (숫자형 ID, 영구적)
Garmin:  User ID (OAuth 2.0 전용 필드)
→ DB에 GARMIN_USER_ID 컬럼 추가 필요
→ T_MEMBER_SNS 테이블에 TYPE='GARMIN' 추가
```

---

## 3. 데이터 접근 범위 비교

### 3-1. Garmin만 제공하는 데이터 (Strava에는 없음)

| 데이터 카테고리 | 상세 항목 | 갱신 주기 |
|-----------------|-----------|-----------|
| **Daily Summary** | 총 걸음수, 소모 칼로리, 활동 시간, 이동 거리 | 1회/일 |
| **Epoch Summary** | 위와 동일하지만 15분 단위 세분화 | 15분 |
| **수면 (Sleep)** | 수면 시간, 단계(얕은잠/깊은잠/REM/각성) | 1회/일 |
| **스트레스 (Stress)** | 스트레스 레벨 1~100점, 3분 단위 | 3분 |
| **Body Battery** | 에너지 레벨 지수 (HRV 기반) | 실시간 |
| **심박수 (HR)** | 안정시 + 일중 변화 | 1분 |
| **혈중 산소 (SpO2)** | 혈중 산소 포화도 | 이벤트 시 |
| **호흡수** | 분당 호흡수 | 1분 |
| **VO2max** | 추정 최대산소섭취량 | 계산 시 |
| **체성분** | 체중, BMI, 체지방률, 근육량 | 측정 시 |

### 3-2. Garmin Activity API — FIT 파일 원본 접근

Garmin의 핵심 차별화는 **원본 FIT 파일**입니다. 3계층 메시지 구조:

```
Session 메시지 (활동 전체 요약)
├── total_distance, total_elapsed_time, total_calories
├── avg_speed, max_speed, avg_cadence, avg_power
├── avg_heart_rate, max_heart_rate
├── total_ascent, total_descent
└── sport: "cycling"

Lap 메시지 (랩/인터벌별 분할)
└── 각 랩의 요약 데이터

Record 메시지 (1초 단위 원시 센서 데이터)
├── timestamp, position_lat, position_long
├── altitude, heart_rate, speed
├── cadence (RPM), power (Watts)
└── temperature
```

> 💡 Strava는 FIT 파일을 가공하여 일부 데이터를 제거합니다. Garmin은 **원본 그대로** 제공하므로 더 정확한 분석이 가능합니다.

### 3-3. Strava만 제공하는 데이터 (Garmin에는 없음)

| 데이터 | 설명 |
|--------|------|
| **Segments** | GPS 구간 기준 전 세계 사용자 비교 |
| **Leaderboards** | 세그먼트 순위표 (KOM/QOM) |
| **Kudos** | 소셜 좋아요 |
| **Clubs** | 그룹/클럽 기능 |
| **Routes** | 커뮤니티 공유 루트 |
| **Streams** | 활동의 시계열 데이터 (JSON) |

### 3-4. 데이터 세분성 비교표

| 측면 | Garmin | Strava |
|------|--------|--------|
| 원시 센서 데이터 | FIT 파일 (초 단위, 원본) | Streams API (시계열 JSON) |
| 일일 요약 | Daily Summary (전체 하루) | ❌ 없음 |
| 구간 요약 | Epoch (15분 단위) | ❌ 없음 |
| 심박수 | 활동 중 + 안정시 + 일중 전체 | 활동 중만 |
| 수면 데이터 | 상세 (REM, 깊은잠, 얕은잠) | ❌ 없음 |
| 세그먼트/순위 | ❌ 없음 | ✅ 전세계 KOM/QOM |
| 소셜 기능 | ❌ 없음 | ✅ Kudos, Clubs |
| 고도 데이터 | 기압계 센서 (더 정확) | GPS 보정 (덜 정확한 경우 있음) |

---

## 4. Webhook/Push 알림 비교

### 4-1. 구조 비교

| 항목 | Strava Webhook | Garmin Push API (권장) |
|------|---------------|----------------------|
| **전달 방식** | 이벤트 알림만 (데이터 없음) | POST body에 데이터 직접 포함 |
| **후속 API 호출** | 필요 (Activity ID로 상세 조회) | 불필요 |
| **응답 SLA** | 2초 내 200 응답 | 200 응답 |
| **재시도** | 최대 3회 | 있음 |
| **이벤트 종류** | create/update/delete + revoke | 데이터 타입별 (activity, daily, sleep 등) |

### 4-2. 현재 WB의 Strava 동기화 방식

```
[현재 구현 - 배치 방식]
Lambda Cron → Strava API 폴링 → T_RIDING 저장

[Strava Webhook - Java 백엔드에만 구현]
Strava → /stravaWebhookCallback → T_RIDING 저장 + 포인트 지급
```

### 4-3. Garmin 권장 방식

```
[권장: Garmin Push 방식]
이유:
1. Strava Webhook과 구조 유사 → 기존 코드 패턴 재활용 가능
2. 추가 API 호출 불필요 → Lambda 실행 시간 절약
3. Ping/Pull의 30초 타임아웃 비동기 처리 복잡도 회피
```

---

## 5. Rate Limits 비교

### Strava

| 구분 | 제한 |
|------|------|
| 15분 전체 요청 | 200회 |
| 15분 읽기 요청 | 100회 |
| 일일 전체 요청 | 2,000회 |
| 일일 읽기 요청 | 1,000회 |
| 초과 시 | HTTP 429 Too Many Requests |

> ⚠️ 배치로 전체 사용자 동기화 시 빠르게 한도에 도달하는 이슈가 있습니다.

### Garmin GCDP

| 구분 | 내용 |
|------|------|
| 평가 키 (Evaluation) | Rate Limit 적용 (개발/테스트용) |
| **프로덕션 키** | **Rate Limit 사실상 없음** |
| 프로덕션 전환 조건 | Partner Verification Tool 검증 통과 |
| Backfill 제한 | 최대 24시간 범위 쿼리 |

> 💡 **핵심 차이**: Garmin은 프로덕션에서는 Rate Limit이 거의 없지만, Push/Ping 기반으로만 데이터를 받아야 합니다. 무제한 REST 폴링은 약관 위반입니다.

---

## 6. 각 API 장단점 종합

### Garmin API

**장점:**
- 🟢 업계 최고 수준의 데이터 풍부성 (Health + Activity 통합)
- 🟢 FIT 파일 원본 접근 (파워, 케이던스, 심박 등 무손실)
- 🟢 건강 지표(수면, 스트레스, Body Battery) → 웰니스 서비스 확장 가능
- 🟢 프로덕션 Rate Limit 없음 → 대규모 사용자 확장 유리
- 🟢 신형 Garmin 기기 출시 시 별도 작업 불필요

**단점:**
- 🔴 기업 승인 필수 (B2B 계약 성격, 개인 개발자 접근 불가)
- 🔴 **브랜딩 강제** — 앱 내 Garmin 로고 표시 + 데이터 귀속 표기 의무
- 🔴 Garmin-Strava 법적 분쟁(2024~2025)으로 정책 변동 가능성
- 🔴 Push/Ping 인프라 구축 필요
- 🔴 Garmin 기기 보유자만 대상 (Strava보다 타겟 좁음)
- 🔴 공개 문서가 추상적 (상세 Spec은 Developer Portal에서만 확인)

### Strava API

**장점:**
- 🟢 전 세계 1억+ 사용자 기반 (국내 사이클리스트 다수 사용)
- 🟢 세그먼트/KOM/클럽 등 소셜 기능 → 커뮤니티 구현 가능
- 🟢 공개 API 문서 + 활성 개발자 커뮤니티
- 🟢 OAuth 2.0 표준, Webhook 구조 단순 → 빠른 개발

**단점:**
- 🔴 Rate Limit 엄격 (배치 동기화 시 한도 도달 이슈)
- 🔴 건강 데이터 없음 (수면, 스트레스, Body Battery 등)
- 🔴 FIT 파일 가공으로 일부 데이터 손실 가능
- 🔴 2024년 약관 변경으로 상업적 활용 제한 강화 추세
- 🔴 웰니스 서비스 확장 불가

---

## 7. WrightBrothers 통합 아키텍처 권고

### 7-1. 현재 Strava 구조 (참고)

```
[인증]
APP/lib/login/strava.dart → OAuth 2.0 → /callbacks/strava/login/app/{os}
→ API /v1/common/strava/login → 토큰 저장

[데이터 동기화]
API/api/controllers/strava.js → getActivities() → T_RIDING 저장
→ SSP 포인트 지급 (checkStravaSsp)

[배치]
API/cron/Ride.js → T_RIDING 통계 계산 → T_RIDING_STATS
```

### 7-2. Garmin 통합 목표 아키텍처

```
[Phase 1: OAuth 2.0 PKCE 인증]

APP (Flutter)
├── Garmin 로그인 버튼 추가
├── WebView로 Garmin Connect 동의 페이지 열기
└── code → /callbacks/garmin/login/app/{ios|android}

API/api/routes/callbacks.js
├── GET /callbacks/garmin/login/app/ios   → wbkr://type=GARMIN&code={code}
└── GET /callbacks/garmin/login/app/android → intent://...scheme=wbkr

API/api/controllers/garmin.js (신규)
├── exchangeToken(code, code_verifier) → access_token + refresh_token + user_id
├── refreshToken(refresh_token) → 새 access_token + 새 refresh_token
└── DB 저장: T_MEMBER_SNS (TYPE='GARMIN', UID=Garmin User ID)

───────────────────────────────────────

[Phase 2: Push Webhook 수신]

API/api/routes/callbacks.js
└── POST /callbacks/garmin/webhook
    → Garmin이 활동/건강 데이터 POST로 전송
    → 즉시 HTTP 200 응답 (2초 내)
    → 데이터는 SQS 큐 또는 비동기 처리

Activity Processor (Lambda)
├── FIT 파일 다운로드 → S3 저장
├── T_RIDING 테이블 저장
└── SSP/포인트 지급

───────────────────────────────────────

[Phase 3: Health 데이터 활용 - 선택]

T_MEMBER_HEALTH (신규 테이블)
├── GARMIN_USER_ID, DATE
├── STEPS, SLEEP_DURATION, SLEEP_SCORE
├── STRESS_AVG, BODY_BATTERY_LOW
└── HR_RESTING

마이페이지 연동 예시:
→ "어제 수면 7.5시간, 스트레스 낮음 → 오늘 라이딩 추천!"
```

### 7-3. 데이터 중복 처리 (Strava ↔ Garmin)

동일 라이딩이 Strava + Garmin 양쪽에서 수신될 수 있습니다.

```sql
-- 현재 T_RIDING 중복 체크
SELECT COUNT(IDX) FROM T_RIDING WHERE ID=#{id}

-- Garmin 연동 시 TYPE 컬럼 활용
TYPE = 'STRAVA' | 'GARMIN' | 'MANUAL'
ID   = Strava Activity ID | Garmin Activity ID

-- 중복 방지 전략
1. 같은 시간대 + 같은 거리(오차 ±5%) → 중복으로 간주
2. 중복 시 Garmin 데이터 우선 (원본 FIT이 더 정확)
3. Strava 레코드는 Garmin 데이터로 보완/업데이트
```

### 7-4. SSP 포인트 이중 지급 방지

```sql
-- 추가될 SSP 코드
CODE='GARMIN-CONNECT'    -- Garmin 최초 연동 보상
CODE='GARMIN-ACTIVITY'   -- Garmin 활동 동기화 보상

-- 이중 지급 방지
동일 활동(시간+거리 기준 매칭)에 대해
Strava + Garmin 양쪽 포인트 지급 금지
→ 먼저 수신된 쪽에만 포인트 지급
```

### 7-5. 브랜딩 의무사항 (반드시 준수)

Garmin API 약관상 필수:

- ✅ Garmin 데이터 표시 화면에 **Garmin 로고** 표시
- ✅ 데이터 내보내기 시 **"Data provided by Garmin"** 문구
- ✅ 제3자 전달 시 Garmin 귀속 표기
- ❌ Garmin 로고 변형, 애니메이션 처리 금지

> ⚠️ 2024~2025년 Garmin이 Strava를 "로고를 숨겼다"며 소송한 사례가 있으므로, 브랜딩 규정을 반드시 준수해야 합니다.

---

## 8. 구현 로드맵

| 단계 | 작업 | 예상 기간 | 비고 |
|------|------|-----------|------|
| **1** | Garmin OAuth 2.0 PKCE 인증 (API + APP) | 1주 | callbacks.js 패턴 재활용 |
| **2** | Garmin Push Webhook 수신 서버 | 1주 | SQS 비동기 처리 권고 |
| **3** | Activity API → FIT 파싱 → T_RIDING 저장 | 1~2주 | FIT SDK 라이브러리 필요 |
| **4** | Partner Verification Tool 검증 | Garmin 심사 | 프로덕션 키 발급 |
| **5** | Health API (수면/스트레스/Body Battery) | 1~2주 | 선택 기능 |
| **6** | 마이페이지 Garmin 데이터 UI | 1주 | 브랜딩 규정 준수 |

**필수 기능 기준**: 약 3~4주 / Garmin 검증 포함 시 5~6주

---

## 9. 결론

### 핵심 판단

1. **Garmin과 Strava는 경쟁이 아니라 상호 보완** — 한국 사이클리스트 다수가 Garmin 기기로 기록하고 Strava에 연동합니다
2. **Garmin 직접 연동의 핵심 가치** — Strava를 거치지 않고 더 풍부한 원본 데이터(파워, 고도, 심박)를 직접 수신
3. **웰니스 플랫폼 확장** — Health API의 수면/스트레스/Body Battery 데이터는 단순 라이딩 앱을 웰니스 플랫폼으로 확장하는 핵심 차별화 요소
4. **모니터링 필요** — Garmin 브랜딩 의무와 Strava-Garmin 정책 갈등 동향 지속 주시

---

## 참고 문서

### Garmin 공식
- [Garmin Connect Developer Program](https://developer.garmin.com/gc-developer-program/)
- [Health API](https://developer.garmin.com/gc-developer-program/health-api/)
- [Activity API](https://developer.garmin.com/gc-developer-program/activity-api/)
- [Program FAQ](https://developer.garmin.com/gc-developer-program/program-faq/)
- [OAuth 2.0 PKCE 명세](https://developerportal.garmin.com/sites/default/files/OAuth2PKCE_1.pdf)
- [API Brand Guidelines](https://developer.garmin.com/brand-guidelines/api-brand-guidelines/)
- [FIT SDK Activity File](https://developer.garmin.com/fit/file-types/activity/)

### Strava 공식
- [Rate Limits](https://developers.strava.com/docs/rate-limits/)
- [Webhook Events API](https://developers.strava.com/docs/webhooks/)
- [Getting Started](https://developers.strava.com/docs/getting-started/)

### WrightBrothers 관련 코드 (Strava 참조)
- `API/api/controllers/strava.js` — 토큰/활동 조회 컨트롤러
- `API/api/routes/callbacks.js` — OAuth 콜백 라우트
- `APP/lib/login/strava.dart` — Flutter 로그인
- `API/mapper/user_riding_v2.xml` — T_RIDING DB 쿼리
- `API/mapper/user.xml` — SSP 포인트 지급
- `API/cron/Ride.js` — 라이딩 통계 배치
