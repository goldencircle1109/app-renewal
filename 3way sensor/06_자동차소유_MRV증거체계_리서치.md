# 자동차 소유/이용 MRV 증거 체계 리서치

> 작성일: 2026-03-28
> 목적: 탄소 크레딧 MRV(측정·보고·검증)에서 "과거 자동차 이용 → 현재 친환경 수단 전환"을 증빙하기 위한 국가 데이터 API 연동 방안

---

## 1. 핵심 과제

탄소배출권 전문가 요구: **"자동차 대신 자전거/걷기/지하철로 바꿨다면, 기존에 자동차를 타고 다녔다는 것을 증빙하라"**

### 문제: 본인 명의가 아닌 차량 운전 케이스

| 케이스 | 예시 | 명의 | 보험 | 등록원부에 내 이름 |
|--------|------|------|------|--------------------|
| 본인 명의 | 내 차 | 본인 | 계약자 | **있음** |
| 가족 차량 | 배우자/부모 명의, 내가 운전자 등록 | 타인 | 부가 운전자 | **없음** |
| 법인 차량 | 회사 차로 출퇴근 | 법인 | 법인보험 | **없음** |
| 리스 차량 | 리스사 명의, 내가 사용자 | 리스사 | 내가 계약자 | **없음** |
| 장기렌탈 | 렌터카사 명의 | 렌터카사 | 렌터카사 보험 | **없음** |
| 카셰어링 | 쏘카/그린카 | 플랫폼 | 플랫폼 보험 | **없음** |

---

## 2. 사용 가능한 API 전체 목록

### 2.1 자동차 소유 확인

| API | 제공 기관 | 데이터 | 본인 명의 | 타인 명의 | 비용 | URL |
|-----|----------|--------|----------|----------|------|-----|
| **자동차등록원부 갑부** | CODEF (정부24 연동) | 소유 이력, 명의 변경 전체 | ✅ | ❌ | 유료 구독 | https://developer.codef.io/products/public/each/mw/car-registration-issuance-second |
| 자동차종합정보 | 국토부 (data.go.kr) | 차량번호 기반 정보 | ✅ (동의 시) | ❌ | 무료 | https://www.data.go.kr/data/15071233/openapi.do |
| 차량정보 조회 | 하이픈 (Hyphen) | 차량번호+소유자명 기반 | ✅ | ❌ | 유료 건당 | https://hyphen.im/product/view?seq=8 |
| 차량정보 조회 | 에이픽 (Apick) | 차량번호+소유자명 기반 | ✅ | ❌ | 유료 건당 | https://apick.app/dev_guide/get_car_info |

### 2.2 운전면허 확인

| API | 제공 기관 | 데이터 | 비용 | URL |
|-----|----------|--------|------|-----|
| **운전면허 자동검증** | 도로교통공단 | 면허 진위, 유효 여부, 종류(1종/2종), 취득일 | 유료 후불 (건당) | https://dlv.koroad.or.kr/ |
| 운전면허 진위확인 | CODEF (경찰청 연동) | 면허 진위 확인 | 유료 구독 | https://developer.codef.io/products/public/each/ef/driver-license |
| 운전면허 조회 | CODEF (도로교통공단) | 면허 상세 조회 | 유료 구독 | https://developer.codef.io/products/public/each/ef/KoRoad-driver-license |
| 운전면허 진위확인 | 에이픽 (Apick) | 면허 진위 | 유료 건당 | https://apick.app/dev_guide/identi_card2 |

### 2.3 자동차보험 확인

| API | 제공 기관 | 데이터 | 비용 | URL |
|-----|----------|--------|------|-----|
| **보험다모아 내 차보험** | CODEF | 보험사, 차량번호, 보험기간, **보험가입경력(연수)** | 유료 구독 | https://developer.codef.io/products/insurance/each/damoa/myCarInsuranceInfo |
| 할인할증 등급 | CODEF (보험개발원) | 할인할증 등급, 사고 이력 | 유료 구독 | https://developer.codef.io/products/insurance/each/kidi/car-discount-premium |

### 2.4 보완 증거

| API | 제공 기관 | 데이터 | 비용 | URL |
|-----|----------|--------|------|-----|
| **하이패스 이용내역** | CODEF | 최근 3년 고속도로 이용 이력 | 유료 구독 | https://developer.codef.io/products/public/each/ex/hipass-usage-details |
| 자동차세 납부 | 위택스 (CODEF 스크래핑) | 자동차세 납부 여부 | 유료 | 공개 API 없음 |

---

## 3. 3단계 증거 체계 (3-Tier Evidence System)

### Tier 1: 자동 검증 (API만으로 완료)

대상: **본인 명의 차량 소유자**

```
Step 1: 운전면허 진위확인 (도로교통공단 API)
  → "1종 보통, 유효, 2015년 취득" ✅

Step 2: 자동차등록원부 갑부 (CODEF API)
  → "2018~현재 소나타 소유, 명의 이력 확인" ✅

Step 3: 보험가입경력 (CODEF 보험다모아)
  → "자동차보험 8년 가입" ✅

결과: 3개 모두 확인 → 자동 승인 (관리자 개입 불필요)
```

### Tier 2: 반자동 검증 (API + 서류 업로드 + AI OCR)

대상: **타인 명의 차량 이용자** (가족 차, 법인 차, 리스, 렌탈)

```
Step 1: 운전면허 진위확인 (도로교통공단 API)
  → "1종 보통, 유효" ✅ (공통)

Step 2: 본인 명의 차량 없음 확인

Step 3: 사용자 유형 선택 + 서류 업로드
  ├── "가족 차량" → 자동차보험증권 사진 (부가운전자 이름 확인)
  ├── "법인 차량" → 재직증명서 + 법인차량 배정확인서
  ├── "리스 차량" → 리스 계약서 사진
  ├── "장기렌탈" → 렌탈 계약서 사진
  └── "카셰어링" → 쏘카/그린카 앱 이용내역 스크린샷

Step 4: Claude Vision API 자동 OCR + 검증
  → AI가 서류에서 핵심 정보 자동 추출 + 일치 여부 판정

Step 5: 관리자 최종 확인 (AI 판정 결과 리뷰)

결과: AI 검증 통과 → 관리자 간편 승인 (1건당 30초)
```

### Tier 3: 행동 기반 검증 (서류도 없는 경우)

대상: **과거에 차를 탔지만 현재 서류가 없는 경우**

```
Step 1: 운전면허 진위확인 → "면허 있음" ✅

Step 2: 보완 증거 수집
  ├── 하이패스 이용내역 (CODEF) → "최근 3년 고속도로 이용"
  ├── 3Way Sensor 과거 데이터 → "과거에 자동차(Vehicle) 감지 이력"
  └── 사용자 자기신고서 (사유서 작성)

결과: 행동 증거 + 자기신고 → 관리자 심사 후 승인
```

---

## 4. Claude Vision API OCR 검증 상세

### 4.1 개요

사용자가 업로드한 서류 사진을 **Claude Vision API**로 자동 분석하여 핵심 정보를 추출하고 사용자 입력과 일치하는지 검증합니다.

### 4.2 서류별 AI 검증 항목

| 서류 | AI가 추출하는 정보 | 검증 로직 |
|------|-------------------|----------|
| **자동차보험증권** | 부가운전자 이름, 차량번호, 보험기간, 보험사 | 이름 == 사용자 이름 && 보험기간이 현재 유효 |
| **리스 계약서** | 사용자 이름, 차량정보, 리스사, 계약기간 | 이름 == 사용자 이름 && 계약기간 유효 |
| **렌탈 계약서** | 사용자 이름, 차량정보, 렌터카사, 계약기간 | 이름 == 사용자 이름 && 계약기간 유효 |
| **재직증명서** | 회사명, 사용자 이름, 재직기간, 직위 | 이름 == 사용자 이름 && 현재 재직 중 |
| **법인차량 배정확인서** | 사용자 이름, 차량번호, 배정기간 | 이름 == 사용자 이름 |
| **카셰어링 이용내역** | 사용자 이름, 이용 횟수, 최근 이용일 | 이름 확인 + 정기적 이용 패턴 |

### 4.3 AI 검증 플로우

```
[사용자 서류 사진 업로드]
    │
    ▼
[Claude Vision API 호출]
  Prompt: "이 보험증권 이미지에서 다음 정보를 추출하세요:
          1. 부가운전자 이름
          2. 차량번호
          3. 보험 시작일/종료일
          4. 보험사명
          JSON 형태로 반환."
    │
    ▼
[추출된 데이터]
  {
    "additional_driver": "김대표",
    "car_number": "12가3456",
    "period_start": "2025-03-01",
    "period_end": "2026-03-01",
    "insurer": "삼성화재"
  }
    │
    ▼
[자동 검증 로직]
  ├── 이름 일치? 사용자 입력 "김대표" == OCR "김대표" → ✅
  ├── 보험 유효? 오늘(2026-03-28) < 종료일(2026-03-01)? → ❌ 만료
  └── 결과: PARTIAL_MATCH (이름 O, 기간 만료)
    │
    ▼
[관리자 리뷰 큐에 추가]
  "이름 일치, 보험 만료 1개월. 갱신 중일 수 있음 → 관리자 판단 필요"
```

### 4.4 AI 판정 결과 분류

| 판정 | 의미 | 관리자 액션 |
|------|------|-----------|
| **AUTO_APPROVED** | 모든 항목 일치 | 자동 승인 (검수 불필요) |
| **PARTIAL_MATCH** | 일부 불일치 (만료, 오타 등) | 관리자 간편 리뷰 (30초) |
| **MANUAL_REVIEW** | AI가 판독 불가 (흐린 사진, 손글씨 등) | 관리자 직접 확인 |
| **REJECTED** | 이름 불일치 또는 위조 의심 | 자동 반려 + 재제출 요청 |

### 4.5 비용 추정

| 항목 | 비용 |
|------|------|
| Claude Vision API (Haiku) | ~₩100-200/건 |
| 월 500건 검증 시 | ~₩50,000-100,000/월 |
| vs 수동 검수 인건비 (1명) | ~₩2,000,000+/월 |
| **절감 효과** | **~95% 인건비 절감** |

---

## 5. 증거 매트릭스 (최종)

| 증거 수단 | 본인 명의 | 가족 차 | 법인 차 | 리스 | 렌탈 | 카셰어링 | 방식 |
|-----------|----------|--------|--------|------|------|---------|------|
| 운전면허 API | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 자동 |
| 자동차등록원부 | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | 자동 |
| 보험가입경력 | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | 자동 |
| 하이패스 이용 | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | 자동 |
| 보험증권 OCR | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | AI+서류 |
| 계약서 OCR | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | AI+서류 |
| 재직증명 OCR | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | AI+서류 |
| 앱 이용내역 | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | AI+서류 |
| 3Way Sensor 이력 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 자동 |

---

## 6. 앱 UX 플로우 (전체)

```
[탄소저감 인증 신청]
    │
    ▼
"자동차를 어떻게 이용하셨나요?" (선택)
    ├── (A) 내 명의 차량
    ├── (B) 가족 차량 (부가운전자)
    ├── (C) 회사 차량
    ├── (D) 리스/렌탈 차량
    └── (E) 카셰어링
    │
    ▼
[공통] 운전면허 정보 입력
    ├── 이름, 생년월일, 면허번호, 비밀일련번호
    └── → 도로교통공단 API 자동 검증
    │
    ├── 면허 확인 실패 → "면허 정보를 다시 확인해주세요"
    └── 면허 확인 성공 ✅
    │
    ▼
[A: 내 명의] 자동 검증
    ├── CODEF: 자동차등록원부 조회
    ├── CODEF: 보험가입경력 조회
    └── 3개 모두 확인 → 자동 승인 ✅

[B~E: 타인 명의] 서류 업로드
    ├── 안내: "아래 서류 중 1개를 촬영해 업로드해주세요"
    ├── 사진 촬영 or 갤러리 선택
    ├── Claude Vision API → 자동 OCR + 검증
    ├── AUTO_APPROVED → 즉시 승인 ✅
    ├── PARTIAL_MATCH → 관리자 간편 리뷰 (24시간 내)
    └── MANUAL_REVIEW → 관리자 직접 확인 (24시간 내)
    │
    ▼
[인증 완료]
    ├── T맵 API: 집↔회사 자동차 경로 거리 기준값 설정
    ├── 3Way Sensor 탄소저감 기록 시작
    └── SSP 적립 시작
```

---

## 7. 신규 DB 테이블

```sql
-- 자동차 소유/이용 인증
T_VEHICLE_VERIFICATION (
  IDX int AUTO_INCREMENT PRIMARY KEY,
  MEMBER_IDX int NOT NULL,
  VERIFICATION_TYPE enum('OWN','FAMILY','CORPORATE','LEASE','RENTAL','CARSHARE'),
  TIER enum('TIER1_AUTO','TIER2_SEMI','TIER3_BEHAVIOR'),

  -- Tier 1: API 자동 검증 결과
  LICENSE_VERIFIED enum('Y','N','PENDING') default 'PENDING',
  LICENSE_TYPE varchar(20),           -- 1종보통, 2종보통 등
  LICENSE_ACQUIRED_DATE date,
  REGISTRATION_VERIFIED enum('Y','N','NA') default 'NA',
  CAR_NUMBER varchar(20),
  INSURANCE_YEARS int,

  -- Tier 2: 서류 업로드 + AI OCR
  DOCUMENT_TYPE varchar(50),          -- INSURANCE_CERT, LEASE_CONTRACT, EMPLOYMENT_CERT, etc.
  DOCUMENT_IMAGE_URL varchar(500),
  OCR_RESULT json,                    -- Claude Vision API 추출 결과
  OCR_VERDICT enum('AUTO_APPROVED','PARTIAL_MATCH','MANUAL_REVIEW','REJECTED'),
  OCR_CONFIDENCE decimal(3,2),

  -- Tier 3: 행동 기반
  HIPASS_VERIFIED enum('Y','N','NA') default 'NA',
  SENSOR_VEHICLE_DAYS int default 0,  -- 3Way Sensor 과거 Vehicle 감지 일수
  SELF_DECLARATION text,              -- 자기신고서 내용

  -- 승인
  STATUS enum('PENDING','APPROVED','REJECTED','EXPIRED') default 'PENDING',
  APPROVED_BY int,                    -- 관리자 IDX (자동 승인 시 0)
  APPROVED_AT datetime,
  REJECTION_REASON text,
  EXPIRES_AT datetime,                -- 인증 유효기간 (1년)

  REG_DATE datetime default NOW(),
  MOD_DATE datetime default NOW() ON UPDATE NOW()
)

-- 서류 OCR 이력 (검증 감사 추적용)
T_VEHICLE_OCR_LOG (
  IDX int AUTO_INCREMENT PRIMARY KEY,
  VERIFICATION_IDX int NOT NULL,
  IMAGE_URL varchar(500),
  CLAUDE_MODEL varchar(50),           -- claude-haiku-4-5 등
  PROMPT_USED text,
  RAW_RESPONSE json,
  EXTRACTED_DATA json,
  MATCH_RESULT json,                  -- 각 필드별 일치 여부
  PROCESSING_TIME_MS int,
  COST_KRW decimal(10,2),
  REG_DATE datetime default NOW()
)
```

---

## 8. 비용 추정 (월간)

| 항목 | 비용 |
|------|------|
| CODEF 구독 (등록원부 + 보험 + 하이패스 + 면허) | ~30-50만원/월 |
| 도로교통공단 면허 API (건당) | ~10-20만원/월 (1,000건 기준) |
| Claude Vision OCR (Haiku, 500건) | ~5-10만원/월 |
| **합계** | **~45-80만원/월** |
| vs 수동 검수 인력 1명 | ~200만원+/월 |
| **절감 효과** | **60-75% 절감** |
