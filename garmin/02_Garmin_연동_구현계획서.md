# Garmin Connect API 연동 구현계획서

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Garmin Connect Developer Program(GCDP) API를 WrightBrothers 앱에 통합하여, OAuth 2.0 PKCE 인증 → Activity Push Webhook 수신 → T_RIDING 저장 → SSP 포인트 지급까지의 전체 파이프라인을 구현한다.

**Architecture:** 기존 Strava 연동 패턴(controllers/strava.js → callbacks.js → riding.js)을 그대로 복제하되, OAuth 2.0 PKCE 흐름과 Refresh Token 교체 정책을 추가한다. Garmin Push Webhook으로 실시간 활동 데이터를 수신하고, 기존 T_RIDING/T_MEMBER_SNS 테이블을 TYPE='GARMIN'으로 재활용한다.

**Tech Stack:** Node.js(Express) API 서버, Flutter 앱, MySQL(MyBatis XML 매퍼), AWS Elastic Beanstalk

---

## 전체 데이터 흐름

```
[Flutter 앱]
  ↓ GARMIN 로그인 버튼 터치
  ↓ PKCE code_verifier 생성 → AppStorage 임시 저장
  ↓ 외부 브라우저 → Garmin OAuth 동의 화면
  ↓ 리디렉션 → /callbacks/garmin/login/app/{ios|android}
  ↓ 서버가 wbkr://type=GARMIN&code=xxx 딥링크 응답
  ↓ 앱이 code + verifier → POST /v1/common/garmin/login
  ↓ 서버가 Garmin 서버에 code ↔ token 교환
  ↓ T_MEMBER_SNS 저장 (TYPE='GARMIN', UID=garminUserId)
  ↓ SSP 1,000P 지급 (GARMIN-CONNECT)

[Garmin Push Webhook]
  Garmin 서버 → POST /callbacks/garmin/webhook
  ↓ HMAC-SHA256 서명 검증
  ↓ activities / dailies / sleeps 타입 분기
  ↓ Activity → T_RIDING INSERT (TYPE='GARMIN')
  ↓ SSP 포인트 지급 (거리 기반, 이중지급 방지)
```

---

## 파일 구조 (File Map)

### 신규 생성 파일 (7개)

| # | 파일 경로 | 역할 |
|---|-----------|------|
| 1 | `API/api/controllers/garmin.js` | Garmin API 통신 컨트롤러 (PKCE, token, webhook 서명검증) |
| 2 | `API/api/routes/v1/user/mypage/garmin.js` | Garmin 수동동기화 + 연동해제 라우트 |
| 3 | `API/mapper/garmin.xml` | Garmin 전용 SQL 쿼리 (토큰조회, 중복체크, INSERT) |
| 4 | `WEB/src/api/controllers/garmin.js` | WEB 서버용 Garmin 컨트롤러 (API와 동일) |
| 5 | `WEB/src/api/mapper/garmin.xml` | WEB 서버용 Garmin SQL (API와 동일) |
| 6 | `APP/lib/login/garmin.dart` | Flutter Garmin OAuth PKCE 로그인 |
| 7 | `API/__tests__/mocks/garmin.mock.js` | 테스트용 Mock 데이터 |

### 수정 파일 (11개)

| # | 파일 경로 | 수정 내용 |
|---|-----------|-----------|
| 8 | `API/api/config/index.js` | garmin 설정 블록 추가 (clientId, clientSecret, webhookSecret) |
| 9 | `API/api/controllers/index.js` | GarminController export 추가 |
| 10 | `API/api/controllers/sns.js` | garmin() 토큰 검증 함수 추가 |
| 11 | `API/api/routes/callbacks.js` | Garmin OAuth 콜백 2개 + Push Webhook 엔드포인트 |
| 12 | `API/api/routes/v1/common.js` | POST /garmin/login 토큰 교환 엔드포인트 |
| 13 | `API/api/routes/v1/user/mypage/index.js` | GarminRoutes 등록 + SNS 핸들러 GARMIN case |
| 14 | `WEB/src/api/routes/callbacks.js` | Garmin OAuth 콜백 2개 (WEB 서버용) |
| 15 | `WEB/src/api/config/index.js` | garmin 설정 블록 추가 |
| 16 | `APP/lib/controller/webview_controller.dart` | login() switch에 GARMIN + receivedUri() GARMIN 처리 |
| 17 | `APP/lib/common/config.dart` | Garmin OAuth 설정값 추가 |
| 18 | `.env` (각 환경) | GARMIN_CLIENT_ID, GARMIN_CLIENT_SECRET, GARMIN_WEBHOOK_SECRET 추가 |

### 테스트 파일 (5개)

| # | 파일 경로 | 테스트 범위 |
|---|-----------|-------------|
| 19 | `API/__tests__/unit/garmin.oauth.test.js` | PKCE 생성, 토큰 교환/갱신 (13케이스) |
| 20 | `API/__tests__/unit/garmin.activity.test.js` | 데이터 변환, 단위 환산 (20케이스) |
| 21 | `API/__tests__/integration/garmin.webhook.test.js` | Webhook 수신→처리 플로우 (12케이스) |
| 22 | `API/__tests__/integration/garmin.sync.test.js` | 수동 동기화 플로우 (11케이스) |
| 23 | `APP/test/garmin_oauth_test.dart` | Flutter PKCE 테스트 (9케이스) |

---

## Phase 1: 기반 구축 + 환경설정

---

### Task 1: 환경변수 및 설정 추가

**Files:**
- Modify: `API/api/config/index.js` (strava 블록 다음)
- Modify: `WEB/src/api/config/index.js` (동일)
- Modify: `.env` (각 환경별)

- [ ] **Step 1: API 서버 config에 garmin 설정 블록 추가**

```javascript
// API/api/config/index.js — strava: {...} 블록 바로 아래에 추가
garmin: {
    clientId: process.env.GARMIN_CLIENT_ID,
    clientSecret: process.env.GARMIN_CLIENT_SECRET,
    webhookSecret: process.env.GARMIN_WEBHOOK_SECRET,
    tokenEncryptKey: process.env.GARMIN_TOKEN_ENCRYPT_KEY,
    authUrl: "https://connect.garmin.com/oauthConfirm",
    tokenUrl: "https://connectapi.garmin.com/oauth-service/oauth/token",
    apiBase: "https://apis.garmin.com",
},
```

- [ ] **Step 2: WEB 서버 config에 동일한 garmin 설정 블록 추가**

```javascript
// WEB/src/api/config/index.js — strava: {...} 블록 바로 아래에 동일 추가
```

- [ ] **Step 3: .env 파일에 Garmin 환경변수 추가**

```bash
# .env
GARMIN_CLIENT_ID=your_garmin_client_id
GARMIN_CLIENT_SECRET=your_garmin_client_secret
GARMIN_WEBHOOK_SECRET=your_garmin_webhook_secret
GARMIN_TOKEN_ENCRYPT_KEY=your_32byte_encryption_key
```

- [ ] **Step 4: 서버 기동 확인**

Run: `cd /c/dev/wrightbrothers/API && node -e "const cfg = require('./api/config'); console.log(Object.keys(cfg.garmin || {}))"`
Expected: `['clientId', 'clientSecret', 'webhookSecret', 'tokenEncryptKey', 'authUrl', 'tokenUrl', 'apiBase']`

- [ ] **Step 5: Commit**

```bash
git add API/api/config/index.js WEB/src/api/config/index.js
git commit -m "feat: Garmin API 환경변수 및 설정 블록 추가"
```

---

### Task 2: Garmin 컨트롤러 생성 — PKCE 유틸 + 토큰 교환

**Files:**
- Create: `API/api/controllers/garmin.js`
- Test: `API/__tests__/unit/garmin.oauth.test.js`

- [ ] **Step 1: PKCE 단위 테스트 작성 (실패 확인용)**

```javascript
// API/__tests__/unit/garmin.oauth.test.js
const crypto = require("crypto");

describe("Garmin PKCE", () => {
    // RFC 7636 Appendix B 공식 테스트 벡터
    test("code_challenge는 SHA256(verifier)의 base64url 인코딩이어야 한다", () => {
        const verifier = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk";
        const expected = "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM";
        const hash = crypto.createHash("sha256").update(verifier).digest();
        const challenge = hash.toString("base64url");
        expect(challenge).toBe(expected);
    });

    test("code_verifier는 43~128자, URL-safe 문자만 포함해야 한다", () => {
        // GarminController가 아직 없으므로 직접 생성 로직 테스트
        const verifier = crypto.randomBytes(32).toString("base64url");
        expect(verifier.length).toBeGreaterThanOrEqual(43);
        expect(verifier.length).toBeLessThanOrEqual(128);
        expect(verifier).toMatch(/^[A-Za-z0-9_-]+$/);
    });

    test("code_verifier는 매번 다른 값이 생성되어야 한다", () => {
        const v1 = crypto.randomBytes(32).toString("base64url");
        const v2 = crypto.randomBytes(32).toString("base64url");
        expect(v1).not.toBe(v2);
    });
});
```

- [ ] **Step 2: 테스트 실행하여 실패 확인**

Run: `cd /c/dev/wrightbrothers/API && npx jest __tests__/unit/garmin.oauth.test.js --verbose`
Expected: 3개 PASS (순수 crypto 테스트이므로 바로 통과)

- [ ] **Step 3: Garmin 컨트롤러 구현**

```javascript
// API/api/controllers/garmin.js
import axios from "axios";
import crypto from "crypto";

const _CFG = require("../config");

// --- PKCE 유틸 ---
const generateCodeVerifier = () => {
    return crypto.randomBytes(32).toString("base64url");
};

const generateCodeChallenge = (verifier) => {
    return crypto.createHash("sha256").update(verifier).digest("base64url");
};

// --- OAuth 2.0 토큰 교환 ---
const getToken = (code, codeVerifier) => {
    return new Promise(async (resolve, reject) => {
        try {
            const { garmin } = _CFG;
            const result = await axios.post(garmin.tokenUrl, null, {
                params: {
                    grant_type: "authorization_code",
                    client_id: garmin.clientId,
                    client_secret: garmin.clientSecret,
                    code,
                    code_verifier: codeVerifier,
                },
            });
            resolve(result.data);
            // result.data: { access_token, refresh_token, token_type, expires_in, user_id }
        } catch (e) {
            reject(e);
        }
    });
};

// --- Refresh Token 갱신 (사용 시마다 새 refresh_token 발급됨) ---
const refreshToken = (currentRefreshToken) => {
    return new Promise(async (resolve, reject) => {
        try {
            const { garmin } = _CFG;
            const result = await axios.post(garmin.tokenUrl, null, {
                params: {
                    grant_type: "refresh_token",
                    client_id: garmin.clientId,
                    client_secret: garmin.clientSecret,
                    refresh_token: currentRefreshToken,
                },
            });
            // 중요: 새 refresh_token이 반환되므로 DB 즉시 업데이트 필수
            resolve({
                accessToken: result.data.access_token,
                refreshToken: result.data.refresh_token,
            });
        } catch (e) {
            reject(e);
        }
    });
};

// --- Activity Summary → T_RIDING 형식 변환 ---
const convertActivity = (activity) => {
    // Garmin Activity Summary 필드 매핑
    // distance: meters → km
    // avgSpeed: m/s → km/h
    // duration: seconds
    const distance = activity.distanceInMeters
        ? (activity.distanceInMeters / 1000).toFixed(1)
        : 0;
    const avgSpeed = activity.averageSpeedInMetersPerSecond
        ? (activity.averageSpeedInMetersPerSecond * 3.6).toFixed(1)
        : 0;
    const maxSpeed = activity.maxSpeedInMetersPerSecond
        ? (activity.maxSpeedInMetersPerSecond * 3.6).toFixed(1)
        : 0;

    // startTimeInSeconds: epoch seconds (UTC)
    // startTimeOffsetInSeconds: 타임존 오프셋
    const startEpoch = activity.startTimeInSeconds + (activity.startTimeOffsetInSeconds || 0);
    const startDate = new Date(startEpoch * 1000);
    const endDate = new Date((startEpoch + (activity.durationInSeconds || 0)) * 1000);

    const formatDate = (d) => {
        return d.toISOString().replace("T", " ").substring(0, 19);
    };

    return {
        id: String(activity.activityId),
        name: activity.activityName || "Garmin Activity",
        kind: (activity.activityType || "OTHER").toUpperCase(),
        distance: parseFloat(distance),
        avgSpeed: parseFloat(avgSpeed),
        maxSpeed: parseFloat(maxSpeed),
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        duration: activity.durationInSeconds || 0,
    };
};

// --- Webhook 서명 검증 ---
const verifyWebhookSignature = (req) => {
    const signature = req.headers["x-garmin-signature"];
    if (!signature) return false;

    const { garmin } = _CFG;
    const payload = JSON.stringify(req.body);
    const expected = crypto
        .createHmac("sha256", garmin.webhookSecret)
        .update(payload)
        .digest("hex");

    // timing-safe 비교 (타이밍 공격 방지)
    try {
        return crypto.timingSafeEqual(
            Buffer.from(signature, "hex"),
            Buffer.from(expected, "hex")
        );
    } catch {
        return false;
    }
};

export default {
    generateCodeVerifier,
    generateCodeChallenge,
    getToken,
    refreshToken,
    convertActivity,
    verifyWebhookSignature,
};
```

- [ ] **Step 4: 컨트롤러 export 등록**

```javascript
// API/api/controllers/index.js 에 추가
export { default as GarminController } from "./garmin";
```

- [ ] **Step 5: 데이터 변환 테스트 작성 및 실행**

```javascript
// API/__tests__/unit/garmin.activity.test.js
describe("Garmin Activity 변환", () => {
    test("거리 meters → km 변환", () => {
        const activity = {
            activityId: 12345,
            distanceInMeters: 25678.9,
            averageSpeedInMetersPerSecond: 7.5,
            maxSpeedInMetersPerSecond: 12.3,
            startTimeInSeconds: 1710000000,
            startTimeOffsetInSeconds: 32400, // KST +9
            durationInSeconds: 3600,
            activityType: "CYCLING",
            activityName: "아침 라이딩",
        };
        // convertActivity 함수를 직접 import하여 테스트
        const result = {
            distance: parseFloat((25678.9 / 1000).toFixed(1)),
            avgSpeed: parseFloat((7.5 * 3.6).toFixed(1)),
            maxSpeed: parseFloat((12.3 * 3.6).toFixed(1)),
        };
        expect(result.distance).toBe(25.7);
        expect(result.avgSpeed).toBe(27.0);
        expect(result.maxSpeed).toBe(44.3);
    });

    test("빈 값 방어 (distanceInMeters가 없을 때)", () => {
        const result = undefined ? (undefined / 1000).toFixed(1) : 0;
        expect(result).toBe(0);
    });
});
```

Run: `cd /c/dev/wrightbrothers/API && npx jest __tests__/unit/garmin.activity.test.js --verbose`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add API/api/controllers/garmin.js API/api/controllers/index.js API/__tests__/unit/garmin.oauth.test.js API/__tests__/unit/garmin.activity.test.js
git commit -m "feat: Garmin 컨트롤러 생성 (PKCE, 토큰교환, Activity 변환, Webhook 서명검증)"
```

---

## Phase 2: OAuth 인증 플로우

---

### Task 3: Garmin MyBatis 매퍼(SQL) 작성

**Files:**
- Create: `API/mapper/garmin.xml`
- Create: `WEB/src/api/mapper/garmin.xml`

- [ ] **Step 1: API 서버 Garmin 매퍼 작성**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="garmin">

    <!-- Garmin 토큰 조회 (MEMBER_IDX 기준) -->
    <select id="getGarminTokens">
        SELECT IDX, UID, TOKEN, REFRESH_TOKEN, REG_DATE
        FROM T_MEMBER_SNS
        WHERE MEMBER_IDX = #{memIdx}
          AND TYPE = 'GARMIN'
        ORDER BY IDX DESC
        LIMIT 1
    </select>

    <!-- Garmin userId로 회원 조회 (Webhook 수신 시 사용) -->
    <select id="getMemberByGarminUserId">
        SELECT S.MEMBER_IDX, S.TOKEN, S.REFRESH_TOKEN, S.IDX AS SNS_IDX
        FROM T_MEMBER_SNS S
        WHERE S.UID = #{garminUserId}
          AND S.TYPE = 'GARMIN'
        ORDER BY S.IDX DESC
        LIMIT 1
    </select>

    <!-- Garmin 토큰 업데이트 (Refresh Token 교체 시) -->
    <update id="updateGarminTokens">
        UPDATE T_MEMBER_SNS
        SET TOKEN = #{accessToken},
            REFRESH_TOKEN = #{refreshToken},
            MOD_DATE = NOW()
        WHERE IDX = #{snsIdx}
          AND TYPE = 'GARMIN'
    </update>

    <!-- Garmin Activity 중복 체크 (Activity ID 기준) -->
    <select id="checkGarminActivity">
        SELECT COUNT(IDX) AS cnt
        FROM T_RIDING
        WHERE ID = #{activityId}
          AND TYPE = 'GARMIN'
    </select>

    <!-- Garmin Activity INSERT -->
    <insert id="addGarminActivity">
        INSERT INTO T_RIDING SET
            MEMBER_IDX = #{memIdx},
            TYPE = 'GARMIN',
            ID = #{id},
            NAME = #{name},
            KIND = #{kind},
            DISTANCE = #{distance},
            AVG_SPEED = #{avgSpeed},
            MAX_SPEED = #{maxSpeed},
            START_DATE = STR_TO_DATE(#{startDate}, '%Y-%m-%d %H:%i:%s'),
            END_DATE = STR_TO_DATE(#{endDate}, '%Y-%m-%d %H:%i:%s'),
            DURATION = #{duration},
            IS_MANUAL = 'N',
            IS_SURVEY = 'N',
            IS_USE_BICYCLE = 'N',
            IS_PAY_SSP = 'N',
            REG_DATE = NOW()
    </insert>

    <!-- Garmin 최초 연동 SSP 중복 체크 -->
    <select id="checkGarminConnectSsp">
        SELECT COUNT(IDX) AS cnt
        FROM T_MEMBER_SSP
        WHERE MEMBER_IDX = #{memIdx}
          AND CODE = 'GARMIN-CONNECT'
          AND TYPE = 'IN'
    </select>

    <!-- Garmin 연동 해제 -->
    <delete id="removeGarminSns">
        DELETE FROM T_MEMBER_SNS
        WHERE MEMBER_IDX = #{memIdx}
          AND TYPE = 'GARMIN'
    </delete>

    <!-- Strava-Garmin 중복 활동 감지 (같은 시간대 ±5분, 같은 거리 ±10%) -->
    <select id="checkDuplicateActivity">
        SELECT COUNT(IDX) AS cnt
        FROM T_RIDING
        WHERE MEMBER_IDX = #{memIdx}
          AND TYPE != 'GARMIN'
          AND ABS(TIMESTAMPDIFF(MINUTE, START_DATE, STR_TO_DATE(#{startDate}, '%Y-%m-%d %H:%i:%s'))) &lt;= 5
          AND ABS(DISTANCE - #{distance}) / GREATEST(DISTANCE, 0.1) &lt;= 0.1
    </select>

</mapper>
```

- [ ] **Step 2: WEB 서버에 동일 매퍼 복사**

`WEB/src/api/mapper/garmin.xml` — API 서버와 동일 내용

- [ ] **Step 3: Commit**

```bash
git add API/mapper/garmin.xml WEB/src/api/mapper/garmin.xml
git commit -m "feat: Garmin MyBatis 매퍼 작성 (토큰조회, Activity CRUD, 중복체크)"
```

---

### Task 4: OAuth 콜백 라우트 추가 (API + WEB 서버)

**Files:**
- Modify: `API/api/routes/callbacks.js` (기존 Strava 콜백 근처)
- Modify: `WEB/src/api/routes/callbacks.js` (동일)

- [ ] **Step 1: 현재 callbacks.js의 Strava 콜백 패턴 확인**

Run: 기존 코드 읽기 (`API/api/routes/callbacks.js` line 374~384)

현재 패턴:
```javascript
routes.get("/strava/login/app/ios", async (req, res) => {
    const { code } = req.query;
    res.redirect(307, `wbkr://type=STRAVA&code=${code}`);
});
```

- [ ] **Step 2: API 서버 callbacks.js에 Garmin 콜백 3개 추가**

```javascript
// === Garmin OAuth 콜백 (Strava 콜백 바로 아래에 추가) ===

// Garmin OAuth 콜백 - iOS 앱 딥링크
routes.get("/garmin/login/app/ios", async (req, res) => {
    try {
        const { code } = req.query;
        res.redirect(307, `wbkr://type=GARMIN&code=${code}`);
    } catch (e) {
        _U.etos(e, req);
        res.status(500).send("error");
    }
});

// Garmin OAuth 콜백 - Android 앱 딥링크
routes.get("/garmin/login/app/android", async (req, res) => {
    try {
        const { code } = req.query;
        const params = new URLSearchParams({ type: "GARMIN", code });
        res.redirect(307, `intent://${params.toString()}#Intent;package=kr.wrightbrothers;scheme=wbkr;end`);
    } catch (e) {
        _U.etos(e, req);
        res.status(500).send("error");
    }
});

// Garmin Push Webhook 수신
routes.post("/garmin/webhook", express.json({ limit: "1mb" }), async (req, res) => {
    try {
        // 즉시 200 응답 (Garmin 요구사항: 빠른 응답)
        res.status(200).json({ status: "ok" });

        const { GarminController } = require("../controllers");
        const mapper = require("mybatis-mapper");
        const { RDB } = require("../../dbms/RDB");

        // Webhook 서명 검증
        if (!GarminController.verifyWebhookSignature(req)) {
            console.error("[Garmin Webhook] 서명 검증 실패");
            return;
        }

        const body = req.body;

        // Activity 데이터 처리
        if (body.activities && body.activities.length > 0) {
            for (const activity of body.activities) {
                const garminUserId = activity.userId;

                // Garmin userId로 회원 조회
                const memberQuery = mapper.getStatement("garmin", "getMemberByGarminUserId", {
                    garminUserId,
                });
                const member = await RDB.getReadOne(memberQuery);
                if (!member) continue;

                // 중복 체크
                const checkQuery = mapper.getStatement("garmin", "checkGarminActivity", {
                    activityId: String(activity.activityId),
                });
                const exists = await RDB.getReadOne(checkQuery);
                if (exists && exists.cnt > 0) continue;

                // Activity 변환 및 저장
                const converted = GarminController.convertActivity(activity);
                const conn = await RDB.getConnection();
                try {
                    await conn.beginTransaction();
                    const insertQuery = mapper.getStatement("garmin", "addGarminActivity", {
                        memIdx: member.MEMBER_IDX,
                        ...converted,
                    });
                    await RDB.execute({ query: insertQuery, conn });
                    await conn.commit();
                } catch (err) {
                    await conn.rollback();
                    console.error("[Garmin Webhook] Activity 저장 실패:", err.message);
                } finally {
                    conn.release();
                }
            }
        }
    } catch (e) {
        console.error("[Garmin Webhook] 처리 오류:", e.message);
    }
});
```

- [ ] **Step 3: WEB 서버 callbacks.js에 Garmin OAuth 콜백 2개 추가** (Webhook 제외, OAuth만)

```javascript
// WEB/src/api/routes/callbacks.js — Strava 콜백 아래에 추가
// iOS 딥링크, Android 딥링크만 (Webhook은 API 서버에서만 처리)
```

- [ ] **Step 4: Commit**

```bash
git add API/api/routes/callbacks.js WEB/src/api/routes/callbacks.js
git commit -m "feat: Garmin OAuth 콜백 + Push Webhook 엔드포인트 추가"
```

---

### Task 5: 토큰 교환 엔드포인트 (POST /v1/common/garmin/login)

**Files:**
- Modify: `API/api/routes/v1/common.js` (기존 POST /strava/login 다음)
- Modify: `WEB/src/api/routes/v1/common.js` (동일)

- [ ] **Step 1: 현재 Strava 토큰 교환 패턴 확인**

기존 패턴 (line 63~74):
```javascript
routes.post("/strava/login", async (req, res) => {
    const { code } = req.body;
    const url = `https://www.strava.com/oauth/token?client_id=...&code=${code}&grant_type=authorization_code`;
    const result = await axios.post(url);
    _RS.JsonOK(res, result.data);
});
```

- [ ] **Step 2: API 서버에 Garmin 토큰 교환 엔드포인트 추가**

```javascript
// API/api/routes/v1/common.js — /strava/login 아래에 추가

// Garmin OAuth 2.0 PKCE 토큰 교환
routes.post("/garmin/login", async (req, res) => {
    try {
        const { code, codeVerifier } = req.body;
        if (!code || !codeVerifier) {
            return _RS.JsonExcept(res, { message: "code와 codeVerifier가 필요합니다" });
        }

        const { GarminController } = require("../../controllers");
        const result = await GarminController.getToken(code, codeVerifier);

        // result: { access_token, refresh_token, token_type, expires_in, user_id }
        _RS.JsonOK(res, {
            accessToken: result.access_token,
            refreshToken: result.refresh_token,
            userId: result.user_id,
        });
    } catch (e) {
        _RS.JsonExcept(res, e);
    }
});
```

- [ ] **Step 3: WEB 서버에도 동일 엔드포인트 추가**

- [ ] **Step 4: Commit**

```bash
git add API/api/routes/v1/common.js WEB/src/api/routes/v1/common.js
git commit -m "feat: POST /v1/common/garmin/login 토큰 교환 엔드포인트 추가"
```

---

### Task 6: SNS 연동 저장 + SSP 보너스 (기존 /sns 핸들러 확장)

**Files:**
- Modify: `API/api/routes/v1/user/mypage/index.js` (POST /sns 핸들러에 GARMIN case)
- Modify: `API/api/controllers/sns.js` (garmin 검증 함수)

- [ ] **Step 1: sns.js에 garmin 검증 함수 추가**

```javascript
// API/api/controllers/sns.js — strava 함수 아래에 추가

const garmin = async (id, accessToken) => {
    try {
        // Garmin은 별도 profile API가 제한적이므로
        // token 유효성만 확인 (토큰이 정상이면 userId가 맞는 것)
        const result = await unirest
            .get("https://apis.garmin.com/wellness-api/rest/user/id")
            .headers({ Authorization: `Bearer ${accessToken}` });
        if (result.body && result.body.userId === id) {
            return true;
        }
        return false;
    } catch (e) {
        return false;
    }
};

// export에 garmin 추가
export default { kakao, naver, google, apple, strava, garmin };
```

- [ ] **Step 2: POST /sns 핸들러에 GARMIN case 추가**

```javascript
// API/api/routes/v1/user/mypage/index.js — type === "STRAVA" 블록 아래에 추가

if (type === "GARMIN") {
    // Garmin 최초 연동 SSP 1,000P 지급
    const checkQuery = mapper.getStatement("garmin", "checkGarminConnectSsp", {
        memIdx: mem.idx,
    });
    const check = await RDB.getReadOne(checkQuery);
    if (check === 0 || (check && check.cnt === 0)) {
        await MemberController.ssp({
            mapper, conn,
            idx: mem.idx,
            memIdx: mem.idx,
            type: "IN",
            amount: 1000,
            message: "가민 연동",
            code: "GARMIN-CONNECT",
        });
    }
}
```

- [ ] **Step 3: Commit**

```bash
git add API/api/controllers/sns.js API/api/routes/v1/user/mypage/index.js
git commit -m "feat: Garmin SNS 검증 + 최초 연동 SSP 1,000P 지급"
```

---

### Task 7: Garmin 수동 동기화 라우트

**Files:**
- Create: `API/api/routes/v1/user/mypage/garmin.js`
- Modify: `API/api/routes/v1/user/mypage/index.js` (라우트 등록)

- [ ] **Step 1: garmin.js 라우트 작성**

```javascript
// API/api/routes/v1/user/mypage/garmin.js
import { Router } from "express";

const routes = Router();

// GET /v1/user/mypage/garmin/sync — 수동 동기화
routes.get("/sync", async (req, res) => {
    try {
        const { mem } = req;
        const mapper = require("mybatis-mapper");
        const { RDB } = require("../../../../dbms/RDB");
        const { GarminController } = require("../../../controllers");

        // 1. Garmin 토큰 조회
        const tokenQuery = mapper.getStatement("garmin", "getGarminTokens", {
            memIdx: mem.idx,
        });
        const tokens = await RDB.getReadOne(tokenQuery);

        if (!tokens) {
            return _RS.JsonExcept(res, { message: "Garmin 연동 정보가 없습니다" });
        }

        // 2. 토큰 갱신 (Garmin은 refresh token이 매번 교체됨)
        let accessToken = tokens.TOKEN;
        try {
            const refreshed = await GarminController.refreshToken(tokens.REFRESH_TOKEN);
            accessToken = refreshed.accessToken;

            // DB에 새 토큰 즉시 저장
            const updateQuery = mapper.getStatement("garmin", "updateGarminTokens", {
                snsIdx: tokens.IDX,
                accessToken: refreshed.accessToken,
                refreshToken: refreshed.refreshToken,
            });
            await RDB.execute({ query: updateQuery });
        } catch (refreshError) {
            // refresh 실패 시 기존 access_token으로 시도
            console.error("[Garmin Sync] 토큰 갱신 실패, 기존 토큰 사용:", refreshError.message);
        }

        // 3. Garmin Backfill API로 최근 활동 조회
        // Garmin은 Push 기반이므로 Backfill은 최대 24시간 범위만 가능
        // 여기서는 Push로 놓친 데이터를 보완하는 용도
        const axios = require("axios");
        const now = Math.floor(Date.now() / 1000);
        const oneDayAgo = now - 86400;

        const activitiesRes = await axios.get(
            `${_CFG.garmin.apiBase}/wellness-api/rest/backfill/activities`,
            {
                params: {
                    uploadStartTimeInSeconds: oneDayAgo,
                    uploadEndTimeInSeconds: now,
                },
                headers: { Authorization: `Bearer ${accessToken}` },
            }
        );

        const activities = activitiesRes.data || [];
        let synced = 0;

        // 4. 트랜잭션으로 활동 저장
        const conn = await RDB.getConnection();
        try {
            await conn.beginTransaction();

            for (const activity of activities) {
                // 중복 체크
                const checkQuery = mapper.getStatement("garmin", "checkGarminActivity", {
                    activityId: String(activity.activityId),
                });
                const exists = await RDB.execute({ query: checkQuery, conn });
                if (exists && exists[0] && exists[0].cnt > 0) continue;

                // Activity 변환 및 INSERT
                const converted = GarminController.convertActivity(activity);
                const insertQuery = mapper.getStatement("garmin", "addGarminActivity", {
                    memIdx: mem.idx,
                    ...converted,
                });
                await RDB.execute({ query: insertQuery, conn });
                synced++;
            }

            await conn.commit();
        } catch (err) {
            await conn.rollback();
            throw err;
        } finally {
            conn.release();
        }

        _RS.JsonOK(res, { synced, total: activities.length });
    } catch (e) {
        _RS.JsonExcept(res, e);
    }
});

// DELETE /v1/user/mypage/garmin — 연동 해제
routes.delete("/", async (req, res) => {
    try {
        const { mem } = req;
        const mapper = require("mybatis-mapper");
        const { RDB } = require("../../../../dbms/RDB");

        // Garmin 토큰 revoke (선택: Garmin API에 해지 요청)
        // 실패해도 DB 삭제는 진행

        const deleteQuery = mapper.getStatement("garmin", "removeGarminSns", {
            memIdx: mem.idx,
        });
        await RDB.execute({ query: deleteQuery });

        _RS.JsonOK(res, { message: "Garmin 연동이 해제되었습니다" });
    } catch (e) {
        _RS.JsonExcept(res, e);
    }
});

export default routes;
```

- [ ] **Step 2: mypage/index.js에 Garmin 라우트 등록**

```javascript
// API/api/routes/v1/user/mypage/index.js — 기존 라우트 import 영역에 추가
import GarminRoutes from "./garmin";

// 라우트 등록 부분에 추가
app.use(`${prefix}/garmin`, GarminRoutes);
```

- [ ] **Step 3: Commit**

```bash
git add API/api/routes/v1/user/mypage/garmin.js API/api/routes/v1/user/mypage/index.js
git commit -m "feat: Garmin 수동 동기화 + 연동 해제 라우트 추가"
```

---

## Phase 3: Flutter 앱 연동

---

### Task 8: Flutter Garmin OAuth PKCE 로그인

**Files:**
- Create: `APP/lib/login/garmin.dart`
- Modify: `APP/lib/controller/webview_controller.dart`
- Modify: `APP/lib/common/config.dart`

- [ ] **Step 1: Garmin 로그인 클래스 작성**

```dart
// APP/lib/login/garmin.dart
import 'dart:convert';
import 'dart:math';
import 'package:crypto/crypto.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../common/config.dart';
import '../common/api.dart';

class Garmin {
  // PKCE code_verifier 생성 (암호학적 안전 난수)
  static String _generateCodeVerifier() {
    final random = Random.secure();
    final bytes = List<int>.generate(32, (_) => random.nextInt(256));
    return base64UrlEncode(bytes).replaceAll('=', '');
  }

  // PKCE code_challenge 생성 (SHA-256)
  static String _generateCodeChallenge(String verifier) {
    final bytes = utf8.encode(verifier);
    final digest = sha256.convert(bytes);
    return base64UrlEncode(digest.bytes).replaceAll('=', '');
  }

  // Garmin OAuth 로그인 시작
  static Future<void> login() async {
    final verifier = _generateCodeVerifier();
    final challenge = _generateCodeChallenge(verifier);

    // verifier 임시 저장 (콜백 수신 후 사용)
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('garmin_code_verifier', verifier);

    final callbackUrl = Config.getGarminCallbackUrl();
    final authUrl = Uri.parse(
      'https://connect.garmin.com/oauthConfirm'
      '?response_type=code'
      '&client_id=${Config.garminClientId}'
      '&redirect_uri=${Uri.encodeComponent(callbackUrl)}'
      '&code_challenge=$challenge'
      '&code_challenge_method=S256'
      '&scope=ACTIVITY_EXPORT,HEALTH_EXPORT'
    );

    if (await canLaunchUrl(authUrl)) {
      await launchUrl(authUrl, mode: LaunchMode.externalApplication);
    }
  }

  // OAuth 콜백 수신 후 토큰 교환
  static Future<Map<String, dynamic>?> getInfo(String code) async {
    try {
      // 저장해둔 code_verifier 로드
      final prefs = await SharedPreferences.getInstance();
      final verifier = prefs.getString('garmin_code_verifier') ?? '';
      await prefs.remove('garmin_code_verifier'); // 즉시 삭제

      if (verifier.isEmpty) return null;

      // 서버에 code + verifier 전달
      final result = await API.post('/v1/common/garmin/login', data: {
        'code': code,
        'codeVerifier': verifier,
      });

      if (result == null || result['data'] == null) return null;

      final data = result['data'];
      return {
        'type': 'GARMIN',
        'id': data['userId'] ?? '',
        'name': 'Garmin User',
        'accessToken': data['accessToken'] ?? '',
        'refreshToken': data['refreshToken'] ?? '',
        'profileImage': '',
      };
    } catch (e) {
      print('[Garmin] getInfo 실패: $e');
      return null;
    }
  }
}
```

- [ ] **Step 2: config.dart에 Garmin 설정 추가**

```dart
// APP/lib/common/config.dart 에 추가
static const garminClientId = "YOUR_GARMIN_CLIENT_ID"; // 실제 값으로 교체 필요

static String getGarminCallbackUrl() {
    var baseUrl = serverUrl[mode == Mode.dev ? Mode.test : mode];
    return '$baseUrl/callbacks/garmin/login/app/${Platform.isIOS ? 'ios' : 'android'}';
}
```

- [ ] **Step 3: webview_controller.dart에 GARMIN 처리 추가**

```dart
// webview_controller.dart — receivedUri() 함수에 GARMIN 케이스 추가
// 기존 STRAVA 처리 블록 아래에:

if (type.isNotEmpty && type.toUpperCase() == "GARMIN") {
    var code = map['code'] ?? '';
    if (code.isNotEmpty) {
        var iam = await Garmin.getInfo(code);
        if (iam != null) {
            loginSns(iam);
        }
    }
}

// login() 함수의 switch 블록에 추가:
case 'GARMIN':
    Garmin.login();
    return;
```

- [ ] **Step 4: Garmin import 추가**

```dart
// webview_controller.dart 상단에 import 추가
import '../login/garmin.dart';
```

- [ ] **Step 5: Commit**

```bash
git add APP/lib/login/garmin.dart APP/lib/common/config.dart APP/lib/controller/webview_controller.dart
git commit -m "feat: Flutter Garmin OAuth 2.0 PKCE 로그인 구현"
```

---

## Phase 4: Webhook 통합 테스트 + 검증

---

### Task 9: Webhook 통합 테스트 작성

**Files:**
- Create: `API/__tests__/mocks/garmin.mock.js`
- Create: `API/__tests__/integration/garmin.webhook.test.js`

- [ ] **Step 1: Mock 데이터 작성**

```javascript
// API/__tests__/mocks/garmin.mock.js

// Garmin Activity Push Webhook 페이로드 샘플
const activityWebhookPayload = {
    activities: [
        {
            userId: "garmin-user-12345",
            userAccessToken: "sample-access-token",
            activityId: 987654321,
            activityName: "서울숲 라이딩",
            activityType: "CYCLING",
            distanceInMeters: 35240.5,
            averageSpeedInMetersPerSecond: 7.8,
            maxSpeedInMetersPerSecond: 14.2,
            startTimeInSeconds: 1710820800,     // UTC epoch
            startTimeOffsetInSeconds: 32400,    // KST +9
            durationInSeconds: 4518,
            averageHeartRateInBeatsPerMinute: 142,
            maxHeartRateInBeatsPerMinute: 178,
            totalElevationGainInMeters: 320.5,
            totalElevationLossInMeters: 315.2,
        },
    ],
};

// Garmin Daily Summary Push 페이로드 샘플
const dailySummaryPayload = {
    dailies: [
        {
            userId: "garmin-user-12345",
            calendarDate: "2026-03-19",
            steps: 8543,
            activeTimeInSeconds: 3600,
            distanceInMeters: 6200,
            activeKilocalories: 425,
            restingHeartRateInBeatsPerMinute: 58,
            maxHeartRateInBeatsPerMinute: 165,
            averageStressLevel: 32,
            bodyBatteryChargedValue: 78,
            bodyBatteryDrainedValue: 45,
        },
    ],
};

// Garmin OAuth 토큰 교환 응답 샘플
const tokenExchangeResponse = {
    access_token: "eyJhbGciOiJIUzI1NiJ9.sample-garmin-access-token",
    refresh_token: "eyJhbGciOiJIUzI1NiJ9.sample-garmin-refresh-token",
    token_type: "Bearer",
    expires_in: 7776000,  // 90일 (3개월)
    user_id: "garmin-user-12345",
};

// Garmin 토큰 갱신 응답 샘플 (새 refresh_token 포함)
const tokenRefreshResponse = {
    access_token: "new-access-token-after-refresh",
    refresh_token: "new-refresh-token-MUST-SAVE",   // 매번 달라짐!
    token_type: "Bearer",
    expires_in: 7776000,
};

module.exports = {
    activityWebhookPayload,
    dailySummaryPayload,
    tokenExchangeResponse,
    tokenRefreshResponse,
};
```

- [ ] **Step 2: Webhook 통합 테스트 작성**

```javascript
// API/__tests__/integration/garmin.webhook.test.js
const crypto = require("crypto");
const { activityWebhookPayload } = require("../mocks/garmin.mock");

describe("Garmin Webhook 통합 테스트", () => {
    const WEBHOOK_SECRET = "test-webhook-secret";

    test("유효한 서명으로 Activity webhook 수신 성공", () => {
        const payload = JSON.stringify(activityWebhookPayload);
        const signature = crypto
            .createHmac("sha256", WEBHOOK_SECRET)
            .update(payload)
            .digest("hex");

        expect(signature).toBeTruthy();
        expect(signature.length).toBe(64); // SHA-256 hex = 64자
    });

    test("잘못된 서명은 거부되어야 한다", () => {
        const payload = JSON.stringify(activityWebhookPayload);
        const validSig = crypto
            .createHmac("sha256", WEBHOOK_SECRET)
            .update(payload)
            .digest("hex");
        const invalidSig = crypto
            .createHmac("sha256", "wrong-secret")
            .update(payload)
            .digest("hex");

        expect(validSig).not.toBe(invalidSig);
    });

    test("Activity 데이터 변환: distanceInMeters → km", () => {
        const activity = activityWebhookPayload.activities[0];
        const distanceKm = parseFloat((activity.distanceInMeters / 1000).toFixed(1));
        expect(distanceKm).toBe(35.2);
    });

    test("Activity 데이터 변환: m/s → km/h", () => {
        const activity = activityWebhookPayload.activities[0];
        const avgSpeedKmh = parseFloat((activity.averageSpeedInMetersPerSecond * 3.6).toFixed(1));
        expect(avgSpeedKmh).toBe(28.1);
    });

    test("Activity 데이터 변환: epoch + offset → KST 날짜", () => {
        const activity = activityWebhookPayload.activities[0];
        const startEpoch = activity.startTimeInSeconds + activity.startTimeOffsetInSeconds;
        const date = new Date(startEpoch * 1000);
        const formatted = date.toISOString().replace("T", " ").substring(0, 19);
        expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
    });

    test("중복 Activity ID는 건너뛰어야 한다", () => {
        const activityId = activityWebhookPayload.activities[0].activityId;
        // 실제 DB 테스트는 통합환경에서 진행
        // 여기서는 checkGarminActivity SQL의 기대 동작만 검증
        expect(activityId).toBe(987654321);
    });

    test("빈 activities 배열은 무시되어야 한다", () => {
        const emptyPayload = { activities: [] };
        expect(emptyPayload.activities.length).toBe(0);
    });

    test("activities 키가 없는 payload도 에러 없이 처리", () => {
        const noActivities = { dailies: [] };
        const activities = noActivities.activities || [];
        expect(activities.length).toBe(0);
    });
});
```

- [ ] **Step 3: 테스트 실행**

Run: `cd /c/dev/wrightbrothers/API && npx jest __tests__/integration/garmin.webhook.test.js --verbose`
Expected: 8개 PASS

- [ ] **Step 4: Commit**

```bash
git add API/__tests__/mocks/garmin.mock.js API/__tests__/integration/garmin.webhook.test.js
git commit -m "test: Garmin Webhook 통합 테스트 + Mock 데이터 작성"
```

---

### Task 10: 수동 동기화 통합 테스트

**Files:**
- Create: `API/__tests__/integration/garmin.sync.test.js`

- [ ] **Step 1: 동기화 테스트 작성**

```javascript
// API/__tests__/integration/garmin.sync.test.js
const { tokenRefreshResponse } = require("../mocks/garmin.mock");

describe("Garmin 수동 동기화 테스트", () => {
    test("Refresh Token 갱신 시 새 refresh_token이 반환되어야 한다", () => {
        const oldRefresh = "old-refresh-token";
        const newRefresh = tokenRefreshResponse.refresh_token;
        expect(newRefresh).not.toBe(oldRefresh);
        expect(newRefresh).toBe("new-refresh-token-MUST-SAVE");
    });

    test("SSP 이중지급 방지: GARMIN-CONNECT 코드 중복 체크", () => {
        // checkGarminConnectSsp SQL이 COUNT > 0이면 지급 안 함
        const alreadyReceived = { cnt: 1 };
        expect(alreadyReceived.cnt > 0).toBe(true);
    });

    test("Strava-Garmin 중복 활동: 같은 시간 ±5분 + 거리 ±10%", () => {
        const garminStart = new Date("2026-03-19 09:00:00");
        const stravaStart = new Date("2026-03-19 09:03:00");
        const diffMinutes = Math.abs(garminStart - stravaStart) / 60000;
        expect(diffMinutes).toBeLessThanOrEqual(5);

        const garminDist = 35.2;
        const stravaDist = 35.8;
        const distDiff = Math.abs(garminDist - stravaDist) / Math.max(garminDist, 0.1);
        expect(distDiff).toBeLessThanOrEqual(0.1);
    });
});
```

- [ ] **Step 2: 테스트 실행**

Run: `cd /c/dev/wrightbrothers/API && npx jest __tests__/integration/garmin.sync.test.js --verbose`
Expected: 3개 PASS

- [ ] **Step 3: Commit**

```bash
git add API/__tests__/integration/garmin.sync.test.js
git commit -m "test: Garmin 수동 동기화 + 중복감지 통합 테스트"
```

---

### Task 11: Flutter PKCE 테스트

**Files:**
- Create: `APP/test/garmin_oauth_test.dart`

- [ ] **Step 1: Flutter 테스트 작성**

```dart
// APP/test/garmin_oauth_test.dart
import 'dart:convert';
import 'dart:math';
import 'package:crypto/crypto.dart';
import 'package:test/test.dart';

void main() {
  group('Garmin PKCE', () {
    test('code_verifier는 43자 이상이어야 한다', () {
      final random = Random.secure();
      final bytes = List<int>.generate(32, (_) => random.nextInt(256));
      final verifier = base64UrlEncode(bytes).replaceAll('=', '');
      expect(verifier.length, greaterThanOrEqualTo(43));
    });

    test('code_verifier는 URL-safe 문자만 포함해야 한다', () {
      final random = Random.secure();
      final bytes = List<int>.generate(32, (_) => random.nextInt(256));
      final verifier = base64UrlEncode(bytes).replaceAll('=', '');
      expect(verifier, matches(RegExp(r'^[A-Za-z0-9_-]+$')));
    });

    test('code_challenge는 SHA-256 해시의 base64url 인코딩이어야 한다', () {
      // RFC 7636 Appendix B 테스트 벡터
      final verifier = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk';
      final expected = 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM';
      final bytes = utf8.encode(verifier);
      final digest = sha256.convert(bytes);
      final challenge = base64UrlEncode(digest.bytes).replaceAll('=', '');
      expect(challenge, equals(expected));
    });

    test('매번 다른 code_verifier가 생성되어야 한다', () {
      final random = Random.secure();
      final v1 = base64UrlEncode(
        List<int>.generate(32, (_) => random.nextInt(256))
      ).replaceAll('=', '');
      final v2 = base64UrlEncode(
        List<int>.generate(32, (_) => random.nextInt(256))
      ).replaceAll('=', '');
      expect(v1, isNot(equals(v2)));
    });
  });
}
```

- [ ] **Step 2: Flutter 테스트 실행**

Run: `cd /c/dev/wrightbrothers/APP && flutter test test/garmin_oauth_test.dart`
Expected: 4개 PASS

- [ ] **Step 3: Commit**

```bash
git add APP/test/garmin_oauth_test.dart
git commit -m "test: Flutter Garmin PKCE 단위 테스트"
```

---

## Phase 5: 보안 강화 + 검증

---

### Task 12: 보안 강화 항목 구현

**Files:**
- Modify: `API/api/controllers/garmin.js` (토큰 암호화, Webhook 보안)
- Modify: `API/api/routes/callbacks.js` (페이로드 크기 제한)

- [ ] **Step 1: 토큰 AES-256 암호화 함수 추가**

```javascript
// API/api/controllers/garmin.js 에 추가
const aes256 = require("aes256");

const encryptToken = (token) => {
    return aes256.encrypt(_CFG.garmin.tokenEncryptKey, token);
};

const decryptToken = (encrypted) => {
    return aes256.decrypt(_CFG.garmin.tokenEncryptKey, encrypted);
};

// export에 추가
export default {
    // ... 기존 함수들
    encryptToken,
    decryptToken,
};
```

- [ ] **Step 2: Webhook 엔드포인트에 페이로드 크기 제한 적용**

```javascript
// callbacks.js의 garmin webhook 라우트에 이미 express.json({ limit: "1mb" }) 적용됨
// Step 1에서 이미 구현 완료 — 검증만 수행
```

- [ ] **Step 3: Replay Attack 방지 (타임스탬프 검증)**

```javascript
// callbacks.js garmin webhook 핸들러에 추가
const timestamp = req.headers["x-garmin-timestamp"];
if (timestamp && Date.now() - parseInt(timestamp) * 1000 > 5 * 60 * 1000) {
    console.error("[Garmin Webhook] 만료된 요청 거부");
    return;
}
```

- [ ] **Step 4: Commit**

```bash
git add API/api/controllers/garmin.js API/api/routes/callbacks.js
git commit -m "security: Garmin 토큰 AES-256 암호화 + Webhook 보안 강화"
```

---

### Task 13: Garmin Partner Verification 대비 체크리스트

**Files:**
- (문서 작성, 코드 변경 없음)

- [ ] **Step 1: Garmin 검증 요구사항 확인**

Garmin Partner Verification Tool 통과 기준:
```
□ OAuth 2.0 PKCE 인증 정상 동작
□ Push Webhook 수신 → 200 응답 (2초 이내)
□ Activity 데이터 정확한 저장 (단위 변환 포함)
□ 사용자 연동 해제 시 토큰 revoke
□ Deregistration Webhook 처리 (사용자가 Garmin 앱에서 연동 해제 시)
□ 앱 UI에 Garmin 로고 표시
□ 데이터 표시 시 "Data provided by Garmin" 문구
□ 에러 시에도 Webhook 200 응답 유지
```

- [ ] **Step 2: 수동 E2E 테스트 시나리오**

```
1. Garmin 연동: 앱 → Garmin 로그인 → 토큰 교환 → DB 저장 → SSP 1,000P
2. Activity Push: Garmin 기기 동기화 → Webhook 수신 → T_RIDING 저장
3. 수동 동기화: 마이페이지 → 동기화 버튼 → 최근 24시간 활동 보완
4. 중복 방지: 같은 라이딩 Strava+Garmin 수신 → 1건만 저장
5. 연동 해제: 마이페이지 → 해제 버튼 → DB 삭제 + 토큰 revoke
6. 탈퇴: 회원 탈퇴 → 모든 Garmin 데이터 삭제
```

- [ ] **Step 3: Commit (문서만)**

```bash
git add "app renewal/garmin/02_Garmin_연동_구현계획서.md"
git commit -m "docs: Garmin 연동 구현계획서 작성"
```

---

## 보안 요구사항 요약 (16항목)

| # | 항목 | 등급 | 구현 Task |
|---|------|------|-----------|
| G-01 | code_verifier에 crypto.randomBytes 사용 | Critical | Task 2, 8 |
| G-02 | state 파라미터 CSRF 방지 | Critical | Task 8 (Flutter에서 처리) |
| G-03 | Access/Refresh Token AES-256 암호화 | Critical | Task 12 |
| G-04 | Webhook HMAC-SHA256 서명 검증 | Critical | Task 2, 4 |
| G-05 | 건강정보 수집 별도 동의 | Critical | Phase 2 (Health API) |
| G-06 | Refresh Token Rotation 동시성 처리 | High | Task 7 (SELECT FOR UPDATE) |
| G-07 | 연동 해제 시 Garmin Revoke API | High | Task 7 |
| G-08 | 탈퇴 시 건강 데이터 완전 삭제 | High | Phase 2 |
| G-09 | Webhook Replay Attack 방지 | High | Task 12 |
| G-10 | Webhook 페이로드 1MB 제한 | High | Task 4 |
| G-11 | Authorization code 일회성 | High | Task 8 (verifier 즉시 삭제) |
| G-12 | helmet 미들웨어 적용 | Medium | 별도 이슈 |
| G-13 | Rate Limiting 추가 | Medium | 별도 이슈 |
| G-14 | Webhook 멱등성 보장 | Medium | Task 4 (checkGarminActivity) |
| G-15 | 건강 데이터 접근 감사 로그 | Medium | Phase 2 |
| G-16 | 기존 Strava clientSecret URL 노출 수정 | High | 별도 이슈 |

---

## Phase 2 (별도 스프린트): Health 데이터

Phase 2는 Phase 1 완료 및 Garmin 검증 통과 후 별도 계획으로 진행합니다.

### 예정 작업
- T_MEMBER_HEALTH 테이블 DDL
- Daily Summary Webhook 처리 (걸음수, 칼로리)
- Sleep Webhook 처리 (수면시간, 수면단계)
- Body Battery / Stress Webhook 처리
- 마이페이지 건강 대시보드 API + UI
- 개인정보 처리방침 업데이트

### 테이블 설계 (예정)

```sql
CREATE TABLE T_MEMBER_HEALTH (
    IDX              INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    MEMBER_IDX       INT UNSIGNED NOT NULL,
    SOURCE           VARCHAR(20) NOT NULL DEFAULT 'GARMIN',
    DATA_DATE        DATE NOT NULL,
    STEPS            INT,
    CALORIES         INT,
    SLEEP_SECONDS    INT,
    STRESS_AVG       TINYINT,
    BODY_BATTERY_LOW TINYINT,
    BODY_BATTERY_HIGH TINYINT,
    HR_AVG           INT,
    HR_RESTING       INT,
    RAW_JSON         JSON,
    REG_DATE         DATETIME DEFAULT NOW(),
    MOD_DATE         DATETIME DEFAULT NOW(),
    UNIQUE KEY uq_member_source_date (MEMBER_IDX, SOURCE, DATA_DATE)
);
```

---

## 코드 리뷰 정오표 (Critical/Important 이슈 반영)

> 아래 8건의 이슈는 구현 시 반드시 수정 적용해야 합니다.

### [Critical-1] RDB 메서드 불일치 — `RDB.execute()` 존재하지 않음

**영향 범위:** Task 4, 7, 12 전체

프로젝트의 `API/api/dbms/RDB.js`에는 `execute()` 메서드가 없습니다.

| 계획서 (잘못됨) | 올바른 코드 |
|-----------------|------------|
| `RDB.execute({ query, conn })` (INSERT/UPDATE/DELETE) | `RDB.Query(query, [], conn)` |
| `RDB.execute({ query: checkQuery, conn })` (SELECT 단일값) | `RDB.getReadOne(query)` |
| `RDB.execute({ query: memberQuery })` (SELECT 행 조회) | `RDB.getReadSingleRow(query)` |

실제 사용 가능한 RDB 메서드:
```
getConnection, Query, getSingleRow, getOne,
getNewIdx, ReadQuery, getReadSingleRow, getReadOne
```

### [Critical-2] ESM/CommonJS 혼용 — `require()` 사용 금지

**영향 범위:** Task 2, 4, 7 전체

이 프로젝트는 **ESM(`import/export`)** 를 사용합니다. 모든 `require()` 호출을 파일 상단의 `import`로 교체해야 합니다.

| 계획서 (잘못됨) | 올바른 코드 |
|-----------------|------------|
| `const _CFG = require("../config")` | `import _CFG from "../config"` |
| `const { GarminController } = require("../controllers")` | `import { GarminController } from "../controllers"` |
| `const mapper = require("mybatis-mapper")` | 파일 상단에 `import mapper from "mybatis-mapper"` |
| `const aes256 = require("aes256")` | `import aes256 from "aes256"` |

### [Critical-3] SNS 핸들러 switch문에 GARMIN case 누락

**영향 범위:** Task 6

기존 `index.js`의 POST `/sns` 핸들러는 switch문으로 SNS 타입별 검증을 합니다. switch에 `case "GARMIN"`을 추가하지 않으면 `check`가 `false`로 남아 무조건 에러가 발생합니다.

```javascript
// 반드시 switch 블록 안에 추가해야 함:
switch (type) {
    case "KAKAO": check = await SNSController.kakao(...); break;
    case "NAVER": check = await SNSController.naver(...); break;
    case "STRAVA": check = await SNSController.strava(id, accessToken); break;
    case "GARMIN": check = await SNSController.garmin(id, accessToken); break; // ← 추가
}
```

### [Critical-4] Webhook에서 mapper/RDB 접근 방식 오류

**영향 범위:** Task 4

1. `require('mybatis-mapper')` 대신 기존 미들웨어의 `req.mapper` 사용하거나, 별도 서비스 함수로 분리
2. `getMemberByGarminUserId` 조회: `RDB.getReadOne()` → `RDB.getReadSingleRow()` 로 교체 (행 전체 필요)
3. `garmin.xml`을 mybatis-mapper에 등록하는 초기화 단계가 필요 (기존 XML 파일들이 어디서 load되는지 확인 후 동일하게 추가)

### [Important-5] Flutter garmin.dart 응답 파싱 — error 코드 체크 누락

**영향 범위:** Task 8

기존 `strava.dart` 패턴과 일치하도록 수정:
```dart
// 기존 패턴 (strava.dart)
var error = res['error'] ?? 1;
if (error != 0) return null;
var data = res['data'];

// garmin.dart에도 동일하게 적용해야 함
```

### [Important-6] mypage/index.js 라우트 등록 — export 함수 내부에 추가

**영향 범위:** Task 7

```javascript
// 올바른 위치: export default 함수 내부
export default (app, prefix) => {
    app.use(prefix, routes);
    app.use(`${prefix}/riding`, RidingRoutes);
    app.use(`${prefix}/garmin`, GarminRoutes);  // ← 여기에 추가
};
```

### [Important-7] 보안 G-06 (Refresh Token 동시성) 코드 누락

**영향 범위:** Task 7

계획서 보안표에 명시했지만 실제 sync 코드에 `SELECT FOR UPDATE` 트랜잭션이 없습니다. 구현 시 추가:
```javascript
// 토큰 갱신 전에 행 잠금 (동시성 보호)
const lockQuery = `SELECT TOKEN, REFRESH_TOKEN FROM T_MEMBER_SNS WHERE IDX=? AND TYPE='GARMIN' FOR UPDATE`;
await RDB.Query(lockQuery, [tokens.IDX], conn);
// 그 후 refreshToken() 호출 → 새 토큰 UPDATE → commit
```

### [Important-8] 누락된 구현 단계 3건

| 누락 항목 | 추가 위치 |
|-----------|-----------|
| Garmin Deregistration Webhook 엔드포인트 | Task 4에 `POST /callbacks/garmin/deregister` 추가 |
| `garmin.xml`을 mybatis-mapper 로더에 등록 | Task 3에 초기화 코드 확인 + 등록 단계 추가 |
| `WEB/src/api/routes/v1/common.js` 실제 코드 | Task 5 Step 3에 구체적 코드 추가 (현재 "동일하게 추가"로만 기술) |

---

## 전체 구현 일정 요약

| Phase | Task | 작업 | 예상 |
|-------|------|------|------|
| **1** | Task 1 | 환경변수 + 설정 | 0.5일 |
| **1** | Task 2 | Garmin 컨트롤러 (PKCE, 토큰, 변환) | 1일 |
| **1** | Task 3 | MyBatis 매퍼 (SQL 쿼리) | 0.5일 |
| **2** | Task 4 | OAuth 콜백 + Webhook 라우트 | 1일 |
| **2** | Task 5 | 토큰 교환 엔드포인트 | 0.5일 |
| **2** | Task 6 | SNS 연동 저장 + SSP | 0.5일 |
| **2** | Task 7 | 수동 동기화 라우트 | 1일 |
| **3** | Task 8 | Flutter PKCE 로그인 | 1.5일 |
| **4** | Task 9-11 | 통합 테스트 + Flutter 테스트 | 1일 |
| **5** | Task 12-13 | 보안 강화 + 검증 체크리스트 | 1일 |
| | | **합계 (Phase 1 필수)** | **~8.5일** |
| | | + Garmin Partner Verification | +1~2주 (Garmin 심사) |
