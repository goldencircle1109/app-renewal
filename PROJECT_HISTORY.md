# Project History - App Renewal

---

## 2026-03-23

### Initial Commit
- app renewal project folder created
- Existing research documents uploaded:
  - `parkrun/` - Park Run research (01~06)
  - `smartmove/` - SmartMove research (01~04)
  - `STO/`, `darkcommerce/`, `garmin/` - other project folders

---

## 2026-03-25

### SSP Point Exchange Research
- SSP point to external reward exchange comprehensive research completed
- 10+ platforms investigated (Naver Pay, Kakao, ZeroPay, Onnuri, etc.)
- Created 5 research documents:
  - `parkrun/07_SSP_포인트교환_종합리서치.md` - Master research overview
  - `parkrun/08_네이버페이포인트_연동_리서치.md` - Naver Pay Points deep dive (Daou Addcon API)
  - `parkrun/09_카카오선물하기_연동_리서치.md` - Kakao Gift Biz API deep dive
  - `parkrun/10_제로페이_연동_리서치.md` - ZeroPay integration deep dive
  - `parkrun/11_온누리상품권_연동_리서치.md` - Onnuri gift certificate deep dive
- Updated `parkrun/05_관광공사_자전거파크런_사업제안서.md`:
  - Added Section 13: SSP Point Exchange System slide
  - Added references to all 5 new research documents

### Utility Scripts
- Created `pull_from_github.bat` - git fetch + pull (English, no Korean encoding issues)
- Created `save_to_github.bat` - git add + commit + push with message prompt

---

## 2026-03-26

### Korea Tourism Organization Proposal Email Draft
- Analyzed 3 attachment documents:
  - Racing the DMZ event plan v5.0 (PDF): 2027 May DMZ Ultra Triathlon (421km, 2 nights 3 days)
  - Korea Tourism Organization x Wright Brothers business proposal (PPTX): Digital stamp tour + Park Run + ESG campaign
  - WRIGHT BROTHERS company intro 2026.03 (PDF): Company overview, business status, IP, global achievements
- Drafted email to Korea Tourism Organization Regional Content Team
  - Includes: company intro + proposal summary + Racing the DMZ summary
  - File: `parkrun/메일초안_한국관광공사_지역콘텐츠육성팀.md`
- Purpose: Explore tourism organization funding, propose cycling Park Run collaboration

---

## 2026-03-28

### App Renewal Phase 1 Design Spec
- Full brainstorming session with CEO for app renewal direction
- Explored existing wrightbrothers project:
  - Aurora MySQL 107 tables, Express.js + MyBatis, Flutter hybrid app
  - 638 API endpoints, 75 SQL mapper files
  - ~190만원/month infrastructure cost
- Key decisions made:
  1. **Launch order**: 1st SmartMove → 2nd Riding+ParkRun → 3rd Commerce
  2. **App strategy**: Update existing app (not new app)
  3. **DB migration**: Full migration (all 107 tables, connect via Prisma)
  4. **Backend**: Separate API server (Express + TypeScript + Prisma)
  5. **Transport detection**: 100% automatic (sensor + Wi-Fi SSID + geofence, zero user input)
  6. **Home/work setup**: User registration + pattern learning
  7. **SSP rates**: Configurable per activity type (admin adjustable)
  8. **Carbon calculation**: T-map API car distance baseline vs actual transport mode
  9. **Admin panel**: Full admin from Phase 1 (dashboard, members, SSP, push, banners, challenges, notices)
  10. **Dev approach**: "Feature first" - build fast, reinforce foundation after
- Design spec written and committed:
  - `docs/superpowers/specs/2026-03-28-app-renewal-design.md`
  - Covers: architecture, SmartMove flow, carbon calc, SSP system, data model, admin features, app screens, 14-week schedule

### Full Roadmap Phase 1+2+3+4
- Explored parkrun/ folder (06_통합_기능_기획문서.md, 04_한국형_파크런_사업계획서.md) for Phase 2 scope
- Explored darkcommerce/ folder (01~03 + WB3 분석서) for Phase 3 scope
- Created unified roadmap covering all 3 phases:
  - `docs/superpowers/specs/2026-03-28-full-roadmap-phase1-2-3.md`
  - Phase 1 (14 weeks): SmartMove + Carbon Reduction + Admin
  - Phase 2 (16 weeks): GPX Segments + GPS Matching + Rankings + Strava/Garmin + Park Run + Stamp Tour + Crew + SSP Exchange
  - Phase 3 (12 weeks): Dark Commerce (깜깜이방) — Dealer Portal + Anonymity + Flash Sale + Settlement + Native Commerce
  - Total: 42 weeks (~10.5 months), accelerated 32-36 weeks
  - 34 new DB tables, 15 external API integrations, 20 admin modules, ~60 app screens
- Updated task.md with detailed Phase 2/3 weekly task breakdown

---

## 2026-03-29

### Document Review + CEO Decisions + Real Metrics

- Spec-Kit v0.4.3 installed (specify CLI via uv)
- BRD complete (12 sections, 1,700+ lines): docs/BRD/BRD_complete.md
- Project CLAUDE.md created (legacy reference rules, tech stack, session checklist)
- 3-agent document review (product-manager, tech-architect, business-analyst):
  - 47 BRD gaps, 46 technical gaps, 19 cross-document inconsistencies identified
- CEO decisions (7 items):
  1. Rental system: included in Phase 3 (port from legacy)
  2. C2C marketplace: excluded from Phase 3 (DB ready only)
  3. Premium pricing: admin-configurable (no fixed price in docs)
  4. GTM strategy: created (docs/GTM/, 4 files)
  5. iOS Wi-Fi SSID: blocked by Apple → GPS speed + bus stop geofence + CMMotion alternative
  6. Lambda vs EC2: decided by feature needs (WebSocket → EC2 for Phase 2)
  7. SSP expiration: CARBON = no expiry, AD/SHOP = 1 year
- Actual metrics confirmed via Google Play Console + Google Analytics:
  - Android installs: 7,180 / MAU: 1,490
  - Web MAU: ~2,000 / DAU: ~137
  - Total MAU (app+web): ~4,000
  - All metrics trending down (-30~35%)
  - Android rating: 1.00★
- Document inconsistencies fixed:
  - Login providers: 4 → 3 (Google/Apple/Kakao) across all docs
  - i18n: 4 languages → KO/EN only across all docs
  - CLAUDE.md: Phase 4 + Node.js 20 LTS added
  - SSP expiration policy added to design spec
  - iOS Wi-Fi alternative (GPS+geofence) added to design spec
- Additional features documented:
  - SSP Plan C (source tagging: CARBON/AD/SHOP/BONUS)
  - Ad revenue + offerwall (AdMob + AdiSON)
  - MRV 3-Tier vehicle verification + Claude Vision OCR
  - Phase 3 dual commerce (Normal Shop + Dark Room + SSP entry ticket)
  - Phase 4 STO (Korea STO + overseas blockchain)
  - Foreign user participation (i18n + tourist mode)
  - Multi-sport category structure (cross-sport tagging)
  - GTM strategy (MAU 4,000 → 10,000 target)

### Shareholder Report (AGM 2026.03.31)
- Created McKinsey-style shareholder report for annual general meeting:
  - Word: `docs/shareholder/WB_App_Renewal_Shareholder_Report_2026.docx` (9 sections)
  - PPT: `docs/shareholder/WB_App_Renewal_Shareholder_Report_2026.pptx` (10 slides)
  - Midnight Executive palette (navy + ice blue)
  - Content: Executive Summary, Why Renewal, 4-Phase Strategy, Phase 1 Detail, Revenue, Commerce, STO, Risk, Timeline, Conclusion

### SmartMove Rename
- Renamed "3Way Sensor" → "SmartMove" across entire project
  - Folder: `3way sensor/` → `smartmove/`
  - All .md files (28 files), generator scripts, Word/PPT regenerated
  - Reason: 3Way = 3 modes, but system detects 7 modes (walk/run/cycle/bus/subway/taxi/car)
  - SmartMove = future-proof, no number limitation

---

## 2026-03-30

### Timeline Decision: Option C Hybrid (38 weeks)
- Compared 3 timeline options in detail:
  - Option A: Full Scope 50 weeks (all features, 100% quality, first launch at week 17)
  - Option B: 3-Month MVP 13 weeks (70% quality, P1+P2+P3 core, high risk on commerce)
  - Option C: Hybrid 38 weeks (Phase 1 MVP 90% → launch at week 10, then iterate)
- **CEO decision: Option C confirmed**
- Key characteristics:
  - Pre-Dev: 2 weeks (compressed from 3, PRD core + 10 screens + API spec)
  - Phase 1 MVP: 8 weeks → App Store launch at Week 10
  - Phase 1 보강: 4 weeks post-launch (Wi-Fi, geofence, MRV, admin expansion)
  - Phase 2: 12 weeks compressed (from 18)
  - Phase 3: 12 weeks compressed (from 18)
  - Phase 1~3 full complete: Week 38 (Option A was Week 50 = 12 weeks faster)
  - First launch: Week 10 (Option A was Week 17 = 7 weeks faster)
- Updated: task.md (all week numbers adjusted), CLAUDE.md (phase overview)

### Dev Pipeline Integration
- Analyzed Dev Pipeline (dotfiles/claude/agents/teams/) impact on timeline:
  - 6 teams: T1(schedule) → T2(design,5 agents) → T3(dev,3 parallel) → T6(security) → T4(QA,11 agents) → T5(deploy)
  - T3 development: frontend+backend+infra simultaneous → 60% time reduction
  - T4 QA: 11 agents parallel (code-reviewer, security-auditor, test-automator etc.) → 75% time reduction
  - T2 design: 5 agents parallel (architect, explorer, API designer, type analyzer, security) → 75% time reduction
- Timeline acceleration:
  - Option C (38w) → Option C + Pipeline (25.5w) = 33% faster (-12.5 weeks)
  - First launch: Week 10 → **Week 7** (3 weeks faster)
  - Phase 1~3 complete: Week 38 → **Week 25.5** (12.5 weeks faster)
- Updated: task.md, CLAUDE.md with Pipeline-accelerated timeline
