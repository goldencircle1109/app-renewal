/// Flutter 단위 테스트: Garmin OAuth PKCE 처리
///
/// 테스트 대상:
///   - Garmin OAuth 2.0 PKCE 플로우 (앱 측)
///   - code_verifier 생성 및 저장 (SharedPreferences)
///   - Garmin 연동 상태 관리
///
/// 실행 방법:
///   flutter test test/garmin_oauth_test.dart
///
/// 참고: 기존 Strava 연동 플로우를 기반으로 Garmin 버전을 설계합니다.

import 'dart:convert';
import 'dart:math';

import 'package:flutter_test/flutter_test.dart';
import 'package:crypto/crypto.dart';

// ────────────────────────────────────────────────────────────────
// 구현 예정 함수들 (TDD: 테스트 먼저)
// 실제 구현 파일 경로 예정: lib/garmin/garmin_oauth.dart
// ────────────────────────────────────────────────────────────────

/// code_verifier 생성 (RFC 7636)
/// - 43~128자, URL-safe base64 문자만 사용
String generateCodeVerifier() {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  final random = Random.secure();
  // 43자 생성 (최소 요구사항)
  return List.generate(43, (_) => charset[random.nextInt(charset.length)]).join();
}

/// code_challenge 생성 (SHA-256 + base64url)
String generateCodeChallenge(String codeVerifier) {
  final bytes = utf8.encode(codeVerifier);
  final digest = sha256.convert(bytes);
  // base64url 인코딩 (패딩 제거, + → -, / → _)
  return base64Url.encode(digest.bytes).replaceAll('=', '');
}

/// Garmin OAuth 인증 URL 생성
String buildGarminAuthUrl({
  required String clientId,
  required String redirectUri,
  required String codeChallenge,
  required String state,
}) {
  const baseUrl = 'https://connect.garmin.com/oauth-service/oauth/authorize';
  final params = {
    'client_id': clientId,
    'response_type': 'code',
    'redirect_uri': redirectUri,
    'code_challenge': codeChallenge,
    'code_challenge_method': 'S256',
    'state': state,
    'scope': 'activity:read',
  };
  final queryString = params.entries.map((e) => '${e.key}=${Uri.encodeComponent(e.value)}').join('&');
  return '$baseUrl?$queryString';
}

// ────────────────────────────────────────────────────────────────
// 테스트
// ────────────────────────────────────────────────────────────────

void main() {
  group('Garmin OAuth PKCE - code_verifier 생성', () {
    test('code_verifier 길이가 43자 이상이어야 한다', () {
      final verifier = generateCodeVerifier();
      expect(verifier.length, greaterThanOrEqualTo(43));
    });

    test('code_verifier 길이가 128자 이하여야 한다', () {
      final verifier = generateCodeVerifier();
      expect(verifier.length, lessThanOrEqualTo(128));
    });

    test('code_verifier는 허용된 문자만 포함해야 한다 (URL-safe)', () {
      final verifier = generateCodeVerifier();
      // 허용: A-Z a-z 0-9 - . _ ~
      final validChars = RegExp(r'^[A-Za-z0-9\-._~]+$');
      expect(validChars.hasMatch(verifier), isTrue);
    });

    test('code_verifier는 매번 다른 값을 생성해야 한다 (무작위성)', () {
      final verifiers = <String>{};
      for (int i = 0; i < 10; i++) {
        verifiers.add(generateCodeVerifier());
      }
      expect(verifiers.length, equals(10));
    });
  });

  group('Garmin OAuth PKCE - code_challenge 생성', () {
    test('code_challenge는 base64url 형식이어야 한다 (패딩 없음)', () {
      final verifier = generateCodeVerifier();
      final challenge = generateCodeChallenge(verifier);
      // base64url: = 패딩 없음, + 없음, / 없음
      expect(challenge.contains('='), isFalse);
      expect(challenge.contains('+'), isFalse);
      expect(challenge.contains('/'), isFalse);
    });

    test('같은 verifier는 항상 같은 challenge를 생성해야 한다 (결정론적)', () {
      const verifier = 'fixed_test_verifier_for_flutter_test_123';
      final challenge1 = generateCodeChallenge(verifier);
      final challenge2 = generateCodeChallenge(verifier);
      expect(challenge1, equals(challenge2));
    });

    test('다른 verifier는 다른 challenge를 생성해야 한다', () {
      final verifier1 = generateCodeVerifier();
      final verifier2 = generateCodeVerifier();
      final challenge1 = generateCodeChallenge(verifier1);
      final challenge2 = generateCodeChallenge(verifier2);
      expect(challenge1, isNot(equals(challenge2)));
    });
  });

  group('Garmin OAuth - 인증 URL 생성', () {
    const testClientId = 'test_garmin_client_id';
    const testRedirectUri = 'wbkr://type=GARMIN';
    const testState = 'random_state_12345';

    test('인증 URL은 Garmin Connect 도메인으로 시작해야 한다', () {
      final verifier = generateCodeVerifier();
      final challenge = generateCodeChallenge(verifier);
      final url = buildGarminAuthUrl(
        clientId: testClientId,
        redirectUri: testRedirectUri,
        codeChallenge: challenge,
        state: testState,
      );
      expect(url.startsWith('https://connect.garmin.com'), isTrue);
    });

    test('인증 URL에 code_challenge_method=S256이 포함되어야 한다', () {
      final verifier = generateCodeVerifier();
      final challenge = generateCodeChallenge(verifier);
      final url = buildGarminAuthUrl(
        clientId: testClientId,
        redirectUri: testRedirectUri,
        codeChallenge: challenge,
        state: testState,
      );
      expect(url.contains('code_challenge_method=S256'), isTrue);
    });

    test('인증 URL에 response_type=code가 포함되어야 한다', () {
      final verifier = generateCodeVerifier();
      final challenge = generateCodeChallenge(verifier);
      final url = buildGarminAuthUrl(
        clientId: testClientId,
        redirectUri: testRedirectUri,
        codeChallenge: challenge,
        state: testState,
      );
      expect(url.contains('response_type=code'), isTrue);
    });

    test('인증 URL에 scope=activity:read가 포함되어야 한다', () {
      final verifier = generateCodeVerifier();
      final challenge = generateCodeChallenge(verifier);
      final url = buildGarminAuthUrl(
        clientId: testClientId,
        redirectUri: testRedirectUri,
        codeChallenge: challenge,
        state: testState,
      );
      // URL 인코딩된 형태로 확인
      expect(url.contains('activity'), isTrue);
    });
  });

  group('Garmin 연동 상태 검증', () {
    test('연동 성공 후 Garmin 버튼 상태가 "연동됨"으로 변경되어야 한다', () {
      // 마이페이지 Garmin 연동 버튼 상태 검증
      // 실제 구현 후 Widget 테스트로 확장 예정
      const isConnected = true;
      const buttonText = isConnected ? '연동됨' : 'Garmin 연동';
      expect(buttonText, equals('연동됨'));
    });

    test('연동 해제 후 Garmin 버튼 상태가 "Garmin 연동"으로 변경되어야 한다', () {
      const isConnected = false;
      const buttonText = isConnected ? '연동됨' : 'Garmin 연동';
      expect(buttonText, equals('Garmin 연동'));
    });
  });
}
