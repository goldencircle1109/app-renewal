/**
 * Jest 설정 파일
 *
 * API 프로젝트는 Babel + webpack 기반 ES Module을 사용합니다.
 * babel.config.json의 @babel/preset-env 설정을 Jest와 연동합니다.
 */

module.exports = {
    // 테스트 환경: Node.js (Express API이므로 browser 불필요)
    testEnvironment: "node",

    // 테스트 파일 경로 패턴
    testMatch: [
        "**/__tests__/**/*.test.js",
    ],

    // Babel을 통한 ES Module 변환 (기존 babel.config.json 활용)
    transform: {
        "^.+\\.js$": "babel-jest",
    },

    // node_modules 변환 제외 (일부 CJS 라이브러리 호환을 위해)
    transformIgnorePatterns: [
        "/node_modules/(?!(camelcase-keys)/)",
    ],

    // 테스트 커버리지 설정
    collectCoverageFrom: [
        "api/controllers/garmin.js",         // 구현 예정 파일
        "api/routes/callbacks.js",           // Garmin 콜백 라우트
        "api/routes/v1/user/mypage/riding.js",
        "api/routes/v2/user/riding.js",
    ],

    // 커버리지 임계값: 80% 이상 목표
    coverageThreshold: {
        global: {
            branches: 70,
            functions: 80,
            lines: 80,
            statements: 80,
        },
    },

    // 커버리지 결과 포맷
    coverageReporters: ["text", "lcov", "html"],

    // 테스트 타임아웃: 10초 (DB Mock 포함)
    testTimeout: 10000,

    // 각 테스트 파일 실행 전 전역 설정
    setupFilesAfterFramework: [],

    // 모듈 경로 별칭 (필요 시 추가)
    moduleNameMapper: {},

    // 테스트 결과 표시 방식
    verbose: true,
};
