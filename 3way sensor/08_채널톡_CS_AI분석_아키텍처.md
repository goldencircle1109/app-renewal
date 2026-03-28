# 채널톡 CS 데이터 AI 분석 — 종합 설계 문서

> 작성일: 2026-03-28
> 대상: 라이트브라더스 채널톡 CS 데이터
> 스택: Node.js + PostgreSQL + Claude API

---

## 1. 현재 상태

채널톡 대화 내역/회원 목록은 라이트브라더스 DB에 저장되지 않음. 채널톡 서버에만 존재.
- 프론트엔드: SDK로 채팅 위젯만 제공
- 백엔드: 로그인 시 회원 프로필을 채널톡에 동기화 (단방향)
- 웹훅/배치 수집: 없음

---

## 2. 채널톡 Open API v5 스펙 요약

### 인증

```http
x-access-key: {ACCESS_KEY}
x-access-secret: {ACCESS_SECRET}
```

- 채널톡 관리자 > 설정 > API Key 관리에서 발급
- 라이트브라더스에 이미 환경변수 설정되어 있음 (`CHANNEL_TALK_ACCESS_KEY`, `CHANNEL_TALK_ACCESS_SECRET`)

### 주요 엔드포인트

| API | 메서드 | 엔드포인트 | 설명 |
|-----|--------|-----------|------|
| 유저 조회 | GET | `/users/{userId}` | 단일 유저 |
| 유저 upsert | PUT | `/users/@{memberId}` | memberId 기준 |
| 대화 목록 | GET | `/user-chats` | 상태 필터(opened/closed/snoozed) |
| 대화 상세 | GET | `/user-chats/{id}` | 단일 대화 |
| 메시지 목록 | GET | `/user-chats/{id}/messages` | 대화별 메시지 |
| 유저 대화 | GET | `/users/{userId}/user-chats` | 유저별 대화 목록 |
| 매니저 목록 | GET | `/managers` | 상담사 목록 |
| 웹훅 관리 | POST/GET/PATCH/DELETE | `/webhooks` | 웹훅 CRUD |

### 페이지네이션

- **커서(Cursor) 기반** — `since` 파라미터 사용
- 한 번에 최대 **500건**
- 응답의 `next` 필드로 다음 페이지 커서 전달
- `next`가 없으면 마지막 페이지

### Rate Limit

| 항목 | 값 |
|------|-----|
| 최대 버킷 | 1,000 토큰 |
| 재충전 속도 | 초당 10개 (분당 600개) |
| 초과 시 | 429 Too Many Requests |
| 단위 | 채널 단위 (API 키 여러 개여도 공유) |

### 요금제별 API 접근

| 기능 | 무료 | Early Stage | Growth | Enterprise |
|------|------|-------------|--------|-----------|
| Open API | 제한적 | 부분 | **포함** | **포함** |
| 웹훅 | 불가 | 부분 | **포함** | **포함** |
| CSV 내보내기 | 불가 | 불가 | Pro 이상 | **포함** |

### 웹훅 이벤트

| 스코프 | 설명 |
|--------|------|
| `userChatOpened` | 새 대화 생성 |
| `messageCreated` | 메시지 생성 |

페이로드 구조:
```json
{
  "event": "upsert",
  "type": "Message",
  "entity": { "id": "...", "chatId": "...", "plainText": "..." },
  "refers": { "user": { ... }, "userChat": { ... } }
}
```

### 응답 데이터 주요 필드

**UserChat:**
- id, state(opened/closed/snoozed), assigneeId, tags[], createdAt, resolvedAt

**Message:**
- id, chatId, personType(user/manager/bot), personId, plainText, blocks[], createdAt

---

## 3. AI 분석 항목 (우선순위순)

| 순위 | 항목 | 비즈니스 가치 | 난이도 |
|------|------|-------------|--------|
| ★★★ | 문의 유형 자동 분류 | 운영 효율화, 리소스 배분 | 낮음 |
| ★★★ | 감성 분석 (고객 만족도) | 이탈 예방, 품질 지표 | 낮음 |
| ★★★ | 반복 문의 패턴 탐지 | FAQ 자동화, 비용 절감 | 중간 |
| ★★☆ | FAQ 자동 생성 | 셀프서비스 고도화 | 중간 |
| ★★☆ | 해결률 분석 | 에이전트 성과 측정 | 낮음 |
| ★★☆ | 응답 시간 분석 | SLA 모니터링 | 낮음 |
| ★☆☆ | 에이전트 성과 분석 | HR/채용 근거 | 중간 |
| ★☆☆ | 고객 이탈 예측 | 선제 대응 | 높음 |

---

## 4. DB 스키마 설계 (PostgreSQL)

```sql
-- 1. 채널톡 사용자
CREATE TABLE cs_users (
  id            BIGSERIAL PRIMARY KEY,
  channel_user_id VARCHAR(100) UNIQUE,    -- 채널톡 유저 ID
  member_id     VARCHAR(100),             -- 라이트브라더스 회원 ID
  name          VARCHAR(100),
  mobile        VARCHAR(20),
  email         VARCHAR(255),
  tags          TEXT[],
  synced_at     TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 대화 (상담 티켓)
CREATE TABLE cs_conversations (
  id              BIGSERIAL PRIMARY KEY,
  chat_id         VARCHAR(100) UNIQUE,    -- 채널톡 userChat ID
  user_id         BIGINT REFERENCES cs_users(id),
  state           VARCHAR(20),            -- 'opened' | 'closed' | 'snoozed'
  assignee_name   VARCHAR(100),           -- 담당 상담사
  tags            TEXT[],
  opened_at       TIMESTAMPTZ,
  closed_at       TIMESTAMPTZ,
  resolved_at     TIMESTAMPTZ,
  first_response_at TIMESTAMPTZ,
  synced_at       TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 메시지
CREATE TABLE cs_messages (
  id              BIGSERIAL PRIMARY KEY,
  message_id      VARCHAR(100) UNIQUE,    -- 채널톡 메시지 ID
  conversation_id BIGINT REFERENCES cs_conversations(id),
  sender_type     VARCHAR(20),            -- 'user' | 'manager' | 'bot'
  sender_id       VARCHAR(100),
  body            TEXT NOT NULL,
  sent_at         TIMESTAMPTZ,
  synced_at       TIMESTAMPTZ DEFAULT NOW()
);

-- 4. AI 분석 결과
CREATE TABLE cs_analysis (
  id                  BIGSERIAL PRIMARY KEY,
  conversation_id     BIGINT REFERENCES cs_conversations(id) UNIQUE,
  category            VARCHAR(100),         -- 문의 유형
  sub_category        VARCHAR(100),
  sentiment_open      VARCHAR(20),          -- 'positive' | 'neutral' | 'negative'
  sentiment_close     VARCHAR(20),
  emotion_tags        TEXT[],
  resolved            BOOLEAN,
  resolution_quality  SMALLINT,             -- 1~5
  summary             TEXT,
  keywords            TEXT[],
  embedding           vector(1536),         -- pgvector (유사 문의 검색용)
  analyzed_at         TIMESTAMPTZ,
  model_used          VARCHAR(50),
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 수집 동기화 상태
CREATE TABLE cs_sync_state (
  source          VARCHAR(100) PRIMARY KEY,
  last_cursor     VARCHAR(500),           -- 채널톡 커서
  last_synced_at  TIMESTAMPTZ
);

-- 인덱스
CREATE INDEX idx_conv_opened_at ON cs_conversations(opened_at);
CREATE INDEX idx_conv_state ON cs_conversations(state);
CREATE INDEX idx_msg_conv_id ON cs_messages(conversation_id);
CREATE INDEX idx_analysis_category ON cs_analysis(category);
CREATE INDEX idx_analysis_embedding ON cs_analysis USING ivfflat (embedding vector_cosine_ops);
```

---

## 5. 전체 아키텍처

```
┌─────────────────────────────────────────────────────────┐
│                    데이터 수집 레이어                      │
│                                                         │
│  [채널톡 Open API v5]                                    │
│       │                                                 │
│       ├── 배치 수집 (cron 매 1시간)                       │
│       │   └── 대화 목록 → 메시지 → DB 저장               │
│       │                                                 │
│       └── 웹훅 (실시간, 선택)                             │
│           └── 새 메시지 → DB 저장                        │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                    분석 레이어                            │
│                                                         │
│  [배치 분석 Job] (매일 새벽 2시)                          │
│       │                                                 │
│       ├── Claude Haiku Batch API                        │
│       │   └── 분류 + 감성 + 요약 (1회 호출로 3가지)       │
│       │                                                 │
│       └── Embedding 생성                                │
│           └── text-embedding-3-small → pgvector          │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                    서빙 레이어                            │
│                                                         │
│  [REST API]                                             │
│       ├── GET /analytics/weekly    → 주간 통계           │
│       ├── GET /analytics/trends    → 카테고리 트렌드     │
│       ├── GET /analytics/top-issues → Top 반복 문의      │
│       └── GET /analytics/similar   → 유사 문의 검색      │
│                                                         │
│  [대시보드] (추후)                                        │
│       └── 카테고리별 분포, 감성 추이, 해결률 등           │
└─────────────────────────────────────────────────────────┘
```

---

## 6. AI 분석 비용 추정 (월 기준)

### 모델 선택

| 작업 | 모델 | 이유 |
|------|------|------|
| 분류 + 감성 + 요약 | Claude Haiku 4.5 | 단순 분류, 저비용 |
| FAQ 생성 | Claude Sonnet 4.5 | 품질 중요 |
| 임베딩 | text-embedding-3-small | 저비용, pgvector 호환 |

### 비용 (월 1만 건 기준)

| 항목 | 비용 |
|------|------|
| Haiku Batch API (분류+감성+요약) | ~$7.5 |
| Embedding 생성 | ~$2 |
| Sonnet FAQ 생성 (월 100건) | ~$3 |
| **합계** | **~$12.5/월** |

배치 API 50% 할인 + 프롬프트 캐싱 90% 절감 활용

---

## 7. 구현 로드맵

```
Phase 1 (1~2주): 데이터 수집
  └─ DB 테이블 생성
  └─ 채널톡 API 수집 스크립트
  └─ 증분 수집 cron 설정

Phase 2 (1주): AI 분석 배치
  └─ cs_analysis 테이블 활용
  └─ Claude Haiku Batch API 연동
  └─ 분류 + 감성 + 요약 파이프라인

Phase 3 (1주): 벡터 검색
  └─ pgvector 설치
  └─ embedding 생성 파이프라인
  └─ 유사 문의 검색 API

Phase 4 (1~2주): 대시보드
  └─ 통계 API 구현
  └─ 주간/월간 리포트 자동화
  └─ 시각화 (차트)
```

---

## 참고 출처

- [Channel Open API Documentation](https://api-doc.channel.io/)
- [Channel Developers](https://developers.channel.io/)
- [Rate Limiting](https://developers.channel.io/docs/rate-limiting)
- [Webhook Events](https://developers.channel.io/docs/webhook-events)
- [Claude API Batch Processing](https://platform.claude.com/docs/en/build-with-claude/batch-processing)
- [Claude API Pricing](https://platform.claude.com/docs/en/about-claude/pricing)
- [pgvector GitHub](https://github.com/pgvector/pgvector)
