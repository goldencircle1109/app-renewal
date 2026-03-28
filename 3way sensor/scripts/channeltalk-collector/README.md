# 채널톡 CS 데이터 수집 & AI 분석기

채널톡 Open API v5로 대화 데이터를 수집하고, Claude API로 AI 분석합니다.

## 설치

```bash
cd scripts/channeltalk-collector
npm install
```

## 설정

`.env.example`을 `.env`로 복사하고 채널톡 API 키를 입력하세요.

```bash
cp .env.example .env
```

- 채널톡 API 키: 채널톡 관리자 > 설정 > API Key 관리
- Claude API 키: https://console.anthropic.com (AI 분석용)

## 사용법

### 1단계: 대화 목록만 수집

```bash
node collect.js                     # 종료된(closed) 대화 (기본)
node collect.js --state opened      # 진행 중인 대화
node collect.js --limit 50          # 50건만
```

### 2단계: 대화 + 메시지 함께 수집

```bash
node collect.js --with-messages                     # 전체 종료 대화 + 메시지
node collect.js --state closed --with-messages      # 명시적
node collect.js --limit 100 --with-messages         # 100건만 + 메시지
```

### 3단계: CSV 변환

```bash
node export-csv.js                  # 최신 수집 데이터를 CSV로 변환
```

### 4단계: AI 분석 (Claude API)

```bash
node analyze.js --dry-run           # API 호출 없이 비용 추정만
node analyze.js --limit 3           # 3건만 테스트 분석 (~$0.003)
node analyze.js                     # 전체 분석
```

## 출력 파일

`output/` 폴더에 날짜별로 저장됩니다.

```
output/
  2026-03-28_conversations_closed.json   # 대화 목록
  2026-03-28_messages_closed.json        # 메시지 (대화ID별)
  2026-03-28_full_closed.json            # 통합 (대화+메시지)
  2026-03-28_conversations.csv           # 대화 요약 CSV
  2026-03-28_messages.csv                # 전체 메시지 CSV
  2026-03-28_analysis.json               # AI 분석 결과
  2026-03-28_analysis.csv                # AI 분석 결과 CSV
```

## Rate Limit

- 채널톡 API: 초당 10요청, 버킷 1000
- 이 스크립트: 안전하게 초당 5요청으로 제한
- 429 에러 발생 시 30초 대기 후 자동 재시도

## 주의사항

- `.env` 파일은 절대 git에 커밋하지 마세요
- 대화 수가 많을 경우 `--limit`으로 나눠서 수집하세요
- 메시지 수집은 대화 건당 1회 이상 API 호출이 필요하므로 시간이 걸립니다
- AI 분석 전에 `--dry-run`으로 예상 비용을 먼저 확인하세요
- AI 분석 비용: 약 $1.25/1000건 (Claude Haiku 4.5 기준)
