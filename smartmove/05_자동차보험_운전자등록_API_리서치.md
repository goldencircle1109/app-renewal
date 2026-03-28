# 자동차보험 운전자 등록 확인 API 리서치

> 작성일: 2026-03-28
> 목적: 자동차보험의 운전자 등록 여부를 국가데이터 API로 검증 가능한지 조사

---

## 1. 핵심 결론

**"내가 특정 자동차보험의 운전자로 등록되어 있는지"를 직접 조회하는 공식 공개 API는 현재 존재하지 않는다.**

- 대부분의 API/서비스는 **계약자 또는 주 피보험자** 기준으로만 조회 가능
- 타인 계약에 **부가 운전자로만 등록된 경우**를 API로 확인하는 공식 방법은 없음
- 마이데이터 허가를 받아도 운전자 등록 정보는 표준 API 범위 밖

---

## 2. 주요 경로 비교 요약

| 기관/서비스 | API 제공 | 운전자 등록 조회 | 비용 | 접근 난이도 |
|---|---|---|---|---|
| 공공데이터포털 (금융위) | O | **불가** (통계만) | 무료 | 낮음 |
| 보험개발원 (KIDI) | X (웹만) | 본인 명의만 | - | - |
| **CODEF API** (KIDI 연동) | **O** | **간접 가능** | 유료 | 중간 |
| CODEF API (보험다모아) | O | 계약자 기준만 | 유료 | 중간 |
| 마이데이터 | O | 가능하나 허가 필요 | 매우 높음 | 매우 높음 |
| 손해보험협회 | X (웹만) | 웹에서만 가능 | - | - |
| 자동차365 (국토부) | O | **불가** (차량 정보만) | 무료 | 낮음 |

---

## 3. CODEF API 연동 상세

### 3-1. 개요

- CODEF는 스크래핑 기반으로 보험개발원/보험다모아 데이터를 API화한 민간 플랫폼
- 공공 API가 없는 영역의 사실상 유일한 프로그래밍 접근 경로
- 140개 이상 기업이 월 구독 방식으로 사용 중

### 3-2. 가입 및 API 키 발급

1. [codef.io](https://codef.io) 회원가입
2. 데모 서비스 신청 → `client_id` + `client_secret` 발급
3. 샌드박스에서 테스트 (무료, 고정 응답)

### 3-3. 환경 비교

| 환경 | 제한 | 비용 |
|------|------|------|
| 샌드박스 | 고정 응답만, 가입 불필요 | 무료 |
| 데모 | 일 100회, 3개월 | 무료 |
| 운영(정식) | 제한 없음 | 유료 (B2B 월 구독, 가격 비공개 → 영업팀 문의) |

### 3-4. 인증 흐름

```
[OAuth 토큰 발급] → [사용자 인증수단 등록 → connectedId 발급] → [connectedId로 API 반복 호출]
```

**1단계: accessToken 발급** (OAuth 2.0 Client Credentials)

```
POST https://oauth.codef.io/oauth/token
Authorization: Basic Base64({client_id}:{client_secret})
Body: grant_type=client_credentials&scope=read
→ access_token (유효 7일)
```

**2단계: connectedId 발급**

- 사용자의 공동인증서/간편인증으로 보험사 계정을 등록하면 고유 ID 발급
- 이후 이 ID 하나로 반복 조회 가능
- 지원 인증: 아이디/비밀번호, 공동인증서(.pfx), 간편인증(카카오, PASS 등)

### 3-5. 자동차보험 관련 주요 API

| API | 엔드포인트 | 조회 내용 |
|-----|-----------|---------|
| 보험다모아 자동차보험 | `/v1/kr/insurance/p/damoa/myCarInsuranceInfo` | 가입 보험 목록, 보험사, 증권번호, 기간, 차량번호 |
| 보험개발원 할인할증 | `/v1/kr/insurance/p/kidi/car-discount-premium` | 할인할증 등급, 사고 이력, 법규 위반 이력 |
| 건보심평원 진료내역 | `/v1/kr/public/hw/my-car-insurance` | 자동차보험 처리 진료 내역 |

### 3-6. Node.js 연동 코드 예시

```bash
npm install easycodef-node
```

```javascript
const EasyCodef = require('easycodef-node');
const { SERVICE_TYPE_SANDBOX } = require('easycodef-node/constant');

// 1. 인스턴스 생성 및 설정
const codef = new EasyCodef();
codef.setPublicKey('발급받은_RSA_공개키');
codef.setClientInfoForDemo('YOUR_CLIENT_ID', 'YOUR_CLIENT_SECRET');

// 2. 보험다모아 자동차보험 조회
const param = {
  connectedId: 'USER_CONNECTED_ID',
  organization: '0000',       // 기관 코드
  birthDate: '19900101',
  identity: '900101',
};

const response = await codef.requestProduct(
  '/v1/kr/insurance/p/damoa/myCarInsuranceInfo',
  SERVICE_TYPE_SANDBOX,
  param
);

console.log(JSON.parse(response));
```

**응답 데이터 구조 (예시)**

```json
{
  "result": {
    "code": "CF-00000",
    "message": "성공"
  },
  "data": [
    {
      "resInsuOrganization": "삼성화재",
      "resContractNo": "2024-XXXX-XXXXX",
      "resInsurancePeriodStart": "20240101",
      "resInsurancePeriodEnd": "20250101",
      "resCarNumber": "12가3456",
      "resMainInsured": "홍길동",
      "resInsuranceType": "자동차보험"
    }
  ]
}
```

### 3-7. connectedId 최초 발급 (인증수단 등록)

```javascript
const accountParam = {
  accountList: [
    {
      countryCode: 'KR',
      businessType: 'IN',          // 보험
      clientType: 'P',             // 개인
      organization: '0000',        // 기관 코드
      loginType: '1',              // 1: 인증서, 0: 아이디/비밀번호
      certType: '1',               // pfx 파일
      certFile: 'base64_encoded_pfx_content',
      password: 'cert_password'
    }
  ]
};

codef.createAccount(
  SERVICE_TYPE_SANDBOX,
  accountParam
).then((response) => {
  const result = JSON.parse(response);
  const connectedId = result.data.connectedId;
  console.log('발급된 connectedId:', connectedId);
  // 이 connectedId를 DB에 저장하여 이후 API 호출에 재사용
});
```

### 3-8. CODEF 요금 체계

- 무료(데모): 3개월, 일 100회
- 유료: B2B 월 구독 기반, 건당 과금 또는 묶음 요금제
- 구체적 단가: 공개되지 않음 → CODEF 영업팀 직접 문의 필요

---

## 4. CODEF 외 대안 플랫폼

| 플랫폼 | 특징 | 자동차보험 API |
|--------|------|-------------|
| **쿠콘(COOCON)** | 2,500개 기관 연동, B2B | 직접 확인 필요 (영업 문의) |
| **보험다모아 직접** | 공개 API 없음 | 불가 |
| **각 보험사 직접** | 공개 API 없음 | B2B 제휴 계약 필요 |

→ CODEF가 현재 유일하게 실용적인 프로그래밍 경로

---

## 5. 마이데이터 사업자 허가 상세

### 5-1. 법적 근거

- **「신용정보의 이용 및 보호에 관한 법률」 제2조 제9호의2 및 제11조의2**
- 2020년 8월 신용정보법 전면 개정으로 도입된 금융 라이선스
- 하위 법령: 신용정보법 시행령, 신용정보업감독규정

### 5-2. 마이데이터 사업의 정의

- 개인의 신용정보를 통합하여 본인에게 제공하는 업
- 은행·카드·보험·증권·연금 등 금융기관 보유 개인 금융정보를 표준 API로 수집
- 수집된 정보를 통합·분석하여 본인에게 제공, 자산관리·금융상품 추천 가능

### 5-3. 허가 요건

| 요건 | 내용 |
|------|------|
| **자본금** | 최소 **5억 원** (납입 완료, 유지 의무) |
| **인력** | CISO 1명 + CPO 1명 + IT/준법 인력 (실무 5~10인 이상) |
| **정보보호** | ISMS-P 인증 사실상 필수 |
| **인프라** | 데이터센터(클라우드 가능) + DR 시스템 + API 서버 |
| **사업계획서** | 서비스 모델, 수익구조, 소비자 편익, FDS 체계, 3년 재무추정 |

### 5-4. 허가 절차 및 소요 기간

```
예비허가 신청 (금융위원회)
    ↓ ~2개월 심사
예비허가 취득
    ↓ 3~6개월 인프라 구축
본허가 신청
    ↓ ~1개월 심사
본허가 취득 → 서비스 개시
```

전체 소요: **약 1년 ~ 1년 6개월**

### 5-5. 심사 기준

1. 안전한 데이터 활용 능력 보유 여부
2. 개인신용정보 보호 체계의 적정성
3. 서비스의 혁신성 및 소비자 편익 기여도
4. 금융소비자 보호 체계 완비 여부
5. 대주주·임원의 적격성

### 5-6. 허가 후 의무사항

- 금융위원회 연간 보고 의무
- ISMS-P 인증 유지
- 표준 API 방식 준수 (스크래핑 방식 금지)
- 마이데이터 종합포털 등록 및 현황 공시
- CISO 선임 및 신고
- 이상거래탐지시스템(FDS) 운영
- 마이데이터 2.0 기준 준수 (2025년 6월 이후)

### 5-7. 비용 추정

#### 허가 취득까지

| 항목 | 금액 |
|------|------|
| 자본금 | **5억 원** |
| 법무/컨설팅 | 3,000만 ~ 1억 원 |
| ISMS-P 인증 | 1억 ~ 2억 원 |
| IT 인프라 | 2억 ~ 5억 원 |
| 인건비 (1년, 5~10인) | 3억 ~ 6억 원 |
| **합계 (자본금 포함)** | **약 12억 ~ 20억 원** |

#### 연간 운영비

| 항목 | 금액 |
|------|------|
| ISMS-P 사후 심사 | 500만 ~ 1,500만 원/년 |
| 클라우드/인프라 운영 | 1,200만 ~ 3,600만 원/년 |
| 준법감시/컴플라이언스 인력 | 5,000만 ~ 1억 원/년 |
| 보안 솔루션 유지 | 1,000만 ~ 3,000만 원/년 |
| API 연동 유지보수 | 1,000만 ~ 3,000만 원/년 |
| **합계** | **약 1억 ~ 2.5억 원/년** |

### 5-8. 현실적 진입 장벽

- 2025년 6월 기준 **본허가 사업자: 약 62개사** (토스, 카카오페이, 네이버파이낸셜, 주요 은행/보험사 등)
- **보험업권 직접 참여: 3개사 수준** (교보생명, KB손보, 신한라이프)
- 스타트업도 도전 사례 있으나 준비 비용/기간 상당
- 컨설팅 의존도 높음 ("마이데이터 허가 과외"라는 표현이 나올 정도)

### 5-9. 보험 분야 마이데이터 표준 API

#### 조회 가능 항목

| 분류 | 주요 항목 |
|------|---------|
| 보험 계약 기본정보 | 보험종류, 상품명, 보험사, 계약일, 만기일, 보험료, 납입상태 |
| 보장 내역 | 담보명, 보장금액, 담보기간 |
| 자동차보험 | 차량정보, 보험료, 담보 구성, 계약 기간, 특약 내역 |
| 납입 내역 | 납입일, 납입보험료, 납입방법 |
| 보험금 청구 내역 | 청구일, 지급액, 청구사유(일부) |

#### 조회 불가능 항목 (핵심 한계)

- **운전자 등록 정보** (면허번호, 사고점수, 할인할증 이력)
- **부가 운전자 목록**
- 보험 리스크 평가 데이터 전반

→ 마이데이터는 금융 자산 관리 목적 설계라 리스크 평가 데이터는 범위 밖

---

## 6. 대안: 마이데이터 사업자 제휴 모델

직접 허가 대신 기허가 사업자와 제휴하는 방법이 법적으로 허용됨.

```
[내 서비스] → 제휴 계약 → [기허가 마이데이터 사업자]
                              ↓
                   사용자 동의 후 금융 데이터 수집·제공
                              ↓
              [내 서비스에서 분석·활용]
```

- 금융위 유권해석상 마이데이터 사업자가 제3자 동의받아 제공한 정보 활용은 적법
- 뱅크샐러드, 토스, 카카오페이 등과 B2B API 제휴 협의 가능
- 단, 운전자 등록 확인이 표준 API에 없으므로 이 목적에는 CODEF보다 이점 없음

---

## 7. 최종 비교 및 권장 경로

| 방법 | 비용 | 기간 | 운전자 등록 확인 | 권장도 |
|------|------|------|---------------|-------|
| **CODEF API** | 월 구독 (수십만원~) | 즉시~3개월 | 간접 가능 (계약자 기준) | ★★★★★ |
| 마이데이터 직접 허가 | 12~20억 원 | 1~1.5년 | **불가** (표준 API 미포함) | ★☆☆☆☆ |
| 마이데이터 사업자 제휴 | 제휴 비용 협의 | 수개월 | **불가** (동일 한계) | ★★☆☆☆ |
| 공공데이터포털 | 무료 | 즉시 | **불가** (통계만) | ★★☆☆☆ |

**권장: CODEF API가 비용/기간/기능 면에서 가장 현실적인 경로**

---

## 참고 출처

- [CODEF API 개발가이드](https://developer.codef.io/)
- [CODEF 보험 API 개요](https://developer.codef.io/products/insurance/overview)
- [보험다모아 자동차보험 정보 조회 API](https://developer.codef.io/products/insurance/each/damoa/myCarInsuranceInfo)
- [보험개발원 할인할증 조회 API](https://developer.codef.io/products/insurance/each/kidi/car-discount-premium)
- [easycodef-node npm](https://www.npmjs.com/package/easycodef-node)
- [easycodef-node GitHub](https://github.com/codef-io/easycodef-node)
- [보험개발원 내 차보험 찾기](https://mycar.kidi.or.kr)
- [보험개발원 BIGIN](https://bigin.kidi.or.kr:9443)
- [손해보험협회 자동차보험 종합포털](https://carinfo.knia.or.kr/)
- [손해보험협회 보험가입내역조회](https://contract.knia.or.kr/)
- [금융위원회 자동차보험가입정보 API (공공데이터포털)](https://www.data.go.kr/data/15124891/openapi.do)
- [국토교통부 자동차종합정보 API (공공데이터포털)](https://www.data.go.kr/data/15071233/openapi.do)
- [쿠콘(COOCON)](https://www.coocon.net/)
- [마이데이터 허가요건 (CICA)](https://www.cica.or.kr/14_mydata/mydata_02.jsp)
- [마이데이터 본허가 현황 (종합포털)](https://www.mydataplatform.or.kr/company/com.jsp)
- [보험 업권 표준 API (마이데이터코리아)](https://developers.mydatakorea.org/mdtb/apg/mac/bas/FSAG0403?id=3)
- [마이데이터 2.0 추진 방안 (금융위원회)](https://www.fsc.go.kr/no010101/84780)
- [신용정보법 시행령 (국가법령정보센터)](https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=220813)
