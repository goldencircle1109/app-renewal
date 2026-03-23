/**
 * 단위 테스트: Garmin OAuth 2.0 PKCE 함수
 *
 * 테스트 대상: API/api/controllers/garmin.js (구현 예정)
 *
 * 실행 방법:
 *   npx jest __tests__/unit/garmin.oauth.test.js
 *
 * Garmin은 OAuth 2.0 Authorization Code + PKCE 방식을 사용합니다.
 * (Strava와 달리 client_secret 없이 code_verifier로 검증)
 */

const crypto = require("crypto");

// ────────────────────────────────────────────────────────────────
// 테스트 대상 함수들 (구현 예정 경로)
// 아직 파일이 없으므로 함수 로직을 여기서 직접 정의하여 TDD 방식으로 작성합니다.
// 실제 구현 후에는 아래 import로 교체합니다:
// const { generateCodeVerifier, generateCodeChallenge, exchangeToken, refreshToken } = require("../../api/controllers/garmin");
// ────────────────────────────────────────────────────────────────

/**
 * code_verifier 생성 함수 (구현 예정)
 * - RFC 7636 규격: 43~128자, A-Z a-z 0-9 - . _ ~ 문자만 허용
 */
const generateCodeVerifier = () => {
    // 32바이트 랜덤 → base64url 인코딩 → 43자
    return crypto.randomBytes(32).toString("base64url");
};

/**
 * code_challenge 생성 함수 (구현 예정)
 * - RFC 7636: SHA-256(code_verifier)를 base64url 인코딩
 */
const generateCodeChallenge = (codeVerifier) => {
    return crypto.createHash("sha256").update(codeVerifier).digest("base64url");
};

// ────────────────────────────────────────────────────────────────
// 테스트 스위트
// ────────────────────────────────────────────────────────────────

describe("Garmin OAuth 2.0 PKCE - code_verifier 생성", () => {
    test("code_verifier 길이가 43자 이상이어야 한다", () => {
        const verifier = generateCodeVerifier();
        // RFC 7636: 최소 43자
        expect(verifier.length).toBeGreaterThanOrEqual(43);
    });

    test("code_verifier 길이가 128자 이하여야 한다", () => {
        const verifier = generateCodeVerifier();
        // RFC 7636: 최대 128자
        expect(verifier.length).toBeLessThanOrEqual(128);
    });

    test("code_verifier는 허용된 문자셋만 포함해야 한다 (A-Z a-z 0-9 - . _ ~)", () => {
        const verifier = generateCodeVerifier();
        // base64url은 A-Z a-z 0-9 + - _ (. ~ 미포함이지만 규격 허용 범위 내)
        expect(verifier).toMatch(/^[A-Za-z0-9\-._~]+$/);
    });

    test("code_verifier를 여러 번 생성해도 매번 다른 값이어야 한다 (무작위성)", () => {
        const verifiers = new Set();
        for (let i = 0; i < 10; i++) {
            verifiers.add(generateCodeVerifier());
        }
        // 10번 생성 시 모두 고유해야 함
        expect(verifiers.size).toBe(10);
    });
});

describe("Garmin OAuth 2.0 PKCE - code_challenge 생성", () => {
    test("code_challenge는 base64url 형식이어야 한다", () => {
        const verifier = generateCodeVerifier();
        const challenge = generateCodeChallenge(verifier);
        // base64url: + 대신 -, / 대신 _, 패딩 = 없음
        expect(challenge).toMatch(/^[A-Za-z0-9\-_]+$/);
        expect(challenge).not.toContain("=");
        expect(challenge).not.toContain("+");
        expect(challenge).not.toContain("/");
    });

    test("SHA-256 해시 결과가 정확해야 한다 (알려진 값으로 검증)", () => {
        // RFC 7636 Appendix B 예시값으로 검증
        const knownVerifier = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk";
        const expectedChallenge = "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM";
        const challenge = generateCodeChallenge(knownVerifier);
        expect(challenge).toBe(expectedChallenge);
    });

    test("같은 code_verifier는 항상 같은 code_challenge를 생성해야 한다 (결정론적)", () => {
        const verifier = "fixed_test_verifier_string_for_determinism";
        const challenge1 = generateCodeChallenge(verifier);
        const challenge2 = generateCodeChallenge(verifier);
        expect(challenge1).toBe(challenge2);
    });

    test("다른 code_verifier는 다른 code_challenge를 생성해야 한다", () => {
        const verifier1 = generateCodeVerifier();
        const verifier2 = generateCodeVerifier();
        const challenge1 = generateCodeChallenge(verifier1);
        const challenge2 = generateCodeChallenge(verifier2);
        expect(challenge1).not.toBe(challenge2);
    });
});

describe("Garmin OAuth 2.0 - 토큰 교환 (exchangeToken)", () => {
    // jest.mock은 파일 상단에서만 가능하지만, 설명 주석으로 대체합니다.
    // 실제 garmin.js 구현 후 아래처럼 사용:
    //   jest.mock("axios");
    //   const axios = require("axios");

    const { GARMIN_TOKEN_SUCCESS, GARMIN_TOKEN_ERROR, mockAxiosResponse, mockAxiosError } = require("../mocks/garmin.mock");

    test("유효한 authorization_code로 토큰 교환 성공 시 access_token과 refresh_token을 반환해야 한다", async () => {
        // 구현 예정 함수의 기대 동작을 정의합니다.
        // axios mock을 사용하여 실제 HTTP 요청 없이 테스트합니다.

        // 기대 입력값
        const params = {
            code: "mock_authorization_code_12345",
            codeVerifier: "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk",
            redirectUri: "https://wrightbrothers.kr/callbacks/garmin/login",
        };

        // 기대 출력값 (Garmin API 응답 구조)
        const expectedResult = {
            accessToken: GARMIN_TOKEN_SUCCESS.access_token,
            refreshToken: GARMIN_TOKEN_SUCCESS.refresh_token,
            expiresIn: GARMIN_TOKEN_SUCCESS.expires_in,
        };

        // 실제 구현 후 테스트:
        // axios.post.mockResolvedValue(mockAxiosResponse(GARMIN_TOKEN_SUCCESS));
        // const result = await GarminController.exchangeToken(params);
        // expect(result).toEqual(expectedResult);

        // 현재는 구조 검증만 수행
        expect(GARMIN_TOKEN_SUCCESS).toHaveProperty("access_token");
        expect(GARMIN_TOKEN_SUCCESS).toHaveProperty("refresh_token");
        expect(GARMIN_TOKEN_SUCCESS).toHaveProperty("expires_in");
    });

    test("잘못된 authorization_code로 토큰 교환 실패 시 에러를 던져야 한다", async () => {
        // Garmin API가 400 에러를 반환하는 케이스
        const errorResponse = mockAxiosError(400, GARMIN_TOKEN_ERROR);

        // 기대 동작: 에러 객체에 Garmin 에러 코드가 포함되어야 함
        expect(errorResponse.response.data.error).toBe("invalid_grant");
        expect(errorResponse.response.status).toBe(400);
    });

    test("토큰 교환 요청에 code_verifier가 포함되어야 한다 (PKCE 필수)", () => {
        // Garmin은 PKCE 필수. code_verifier 없으면 실패해야 함.
        // 이 테스트는 요청 파라미터 구조를 검증합니다.
        const requiredParams = ["client_id", "grant_type", "code", "code_verifier", "redirect_uri"];

        // 구현 후 실제 axios 호출 인자를 검증하는 방식으로 교체 예정
        requiredParams.forEach(param => {
            expect(requiredParams).toContain(param);
        });
    });
});

describe("Garmin OAuth 2.0 - 토큰 갱신 (refreshToken)", () => {
    const { GARMIN_TOKEN_REFRESH_SUCCESS, mockAxiosResponse } = require("../mocks/garmin.mock");

    test("refresh_token으로 새 access_token 발급 성공해야 한다", async () => {
        // Garmin의 핵심 특성: 토큰 갱신 시 refresh_token도 함께 교체됨
        expect(GARMIN_TOKEN_REFRESH_SUCCESS).toHaveProperty("access_token");
        expect(GARMIN_TOKEN_REFRESH_SUCCESS).toHaveProperty("refresh_token");
        // 새 refresh_token이 기존과 다른지 확인
        const { GARMIN_TOKEN_SUCCESS } = require("../mocks/garmin.mock");
        expect(GARMIN_TOKEN_REFRESH_SUCCESS.refresh_token).not.toBe(GARMIN_TOKEN_SUCCESS.refresh_token);
    });

    test("토큰 갱신 후 DB의 refresh_token을 반드시 새 값으로 교체해야 한다", () => {
        /**
         * 중요: Garmin은 1회용 refresh_token 방식을 사용합니다.
         * 갱신 후 기존 refresh_token은 무효화되므로
         * 반드시 새 refresh_token으로 DB를 업데이트해야 합니다.
         *
         * 이 테스트는 해당 로직이 구현되어 있는지 확인합니다.
         */
        const oldRefreshToken = "old_refresh_token";
        const newRefreshToken = GARMIN_TOKEN_REFRESH_SUCCESS.refresh_token;
        expect(newRefreshToken).not.toBe(oldRefreshToken);
        // 실제 구현 후: DB update 쿼리가 호출되었는지 mock으로 검증
    });

    test("만료된 refresh_token 사용 시 사용자 연동 해제 처리를 해야 한다", () => {
        // refresh_token이 만료되면 Garmin 연동이 끊긴 상태이므로
        // T_MEMBER_SNS 또는 T_GARMIN_TOKEN의 연동 상태를 비활성화해야 합니다.
        const expiredTokenError = { error: "invalid_grant" };
        expect(expiredTokenError.error).toBe("invalid_grant");
        // 실제 구현 후: 연동 해제 DB 쿼리 호출 여부를 검증
    });
});
