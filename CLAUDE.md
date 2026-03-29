# CLAUDE.md - App Renewal Project

## Project Purpose

Wright Brothers (라이트브라더스) app full renewal. Modernize the legacy system while preserving the existing database (Aurora MySQL, 107 tables).

**This is NOT a new product** — it is a complete rebuild of the existing app at `C:\Dev\wrightbrothers`.

## Legacy Reference (CRITICAL)

The existing Wright Brothers project at **`C:\Dev\wrightbrothers`** is the primary reference source.

When developing any feature, ALWAYS check the legacy codebase first:

| What to check | Where in legacy |
|---------------|----------------|
| DB schema & table structure | `WB3_데이터베이스_ERD.md`, `WB3_DB_분석서.md` |
| API endpoints & business logic | `API/api/routes/`, `API/mapper/*.xml` (75 MyBatis SQL mappers) |
| SSP/Points/Cash system | `WB3_포인트SSP캐시_분석서.md` |
| Payment integration (Inicis, PortOne, NaverPay) | `WB3_결제시스템_분석서.md` |
| Strava integration | `API/api/routes/v1/user/mypage/riding.js` |
| Architecture overview | `WB3_아키텍처_분석서.md` |
| Renewal analysis | `WB3_리뉴얼_분석보고서.md` |
| All analysis docs | `WB3_*.md` files in project root |

**Rule**: Do not reinvent business logic. Always check legacy code first. When porting is appropriate:

1. Read the legacy file and identify the business rule
2. **Ask the user**: "기존 규칙은 [X]입니다. 그대로 포팅할까요, 변경이 필요한가요?"
3. Wait for approval before porting
4. If the user says the rule needs to change, implement the new rule instead

**Never silently port legacy logic** — existing rules may be outdated or need modification. Always confirm with the user first.

## Project Documents

| Document | Path | Purpose |
|----------|------|---------|
| BRD | `docs/BRD/BRD_complete.md` | Business requirements (10 sections) |
| Phase 1 Design | `docs/superpowers/specs/2026-03-28-app-renewal-design.md` | SmartMove + Carbon Reduction spec |
| Full Roadmap | `docs/superpowers/specs/2026-03-28-full-roadmap-phase1-2-3.md` | Phase 1+2+3 unified roadmap |
| Task List | `task.md` | Current task status and weekly breakdown |
| Project History | `PROJECT_HISTORY.md` | Date-by-date work log |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 20 LTS |
| API | Express + TypeScript + Prisma |
| DB | Aurora MySQL (existing, connected via Prisma introspect) |
| App | Flutter (existing framework, code rewritten) |
| Admin | Next.js 14 + TypeScript + Tailwind + shadcn/ui |
| Auth | Firebase Auth (existing) |
| Push | Firebase Cloud Messaging (existing) |

## Project Structure

```
C:\Dev\app renewal\
├── api/          ← Express + TS + Prisma (backend)
├── app/          ← Flutter (mobile app)
├── admin/        ← Next.js 14 (admin panel)
├── docs/         ← BRD, PRD, design specs
├── parkrun/      ← Park Run research documents
├── darkcommerce/ ← Dark Commerce research documents
├── smartmove/  ← SmartMove research documents
└── .specify/     ← Spec-Kit configuration
```

## Development Rules

- Korean responses, code comments in Korean
- Read the file before modifying it
- Explain changes before making them, get approval for breaking changes
- Follow existing patterns in `C:\Dev\wrightbrothers` for business logic
- Immutable patterns (no mutation)
- Small files (<800 lines), small functions (<50 lines)
- Validate at system boundaries (zod for input, parameterized queries)
- No hardcoded secrets — use environment variables
- Log work to `task.md` and `PROJECT_HISTORY.md`

## Phase Overview

```
Pre-Dev (2w): PRD core + Screen Planning + API Design  ← CURRENT
Phase 1 MVP (8w): SmartMove + Carbon + SSP + Ads + Admin 5 modules → LAUNCH
Phase 1 보강 (4w): Wi-Fi + Geofence + MRV + Admin expansion (post-launch)
Phase 2 (12w): Multi-Sport Challenge (GPX, ranking, Strava, events, crew)
Phase 3 (12w): Dual Commerce (Normal Shop + Dark Room + automation)
Phase 4 (20w): Carbon Token Securities (STO) + Global Expansion
Timeline: Option C Hybrid (38 weeks to Phase 1~3 complete, launch at Week 10)
```

## Session Start Checklist

Every session, before doing any work:

1. `git fetch origin && git pull origin master`
2. Read `task.md` for current status
3. Read `PROJECT_HISTORY.md` for recent context
4. Check which Phase/Week we're in
