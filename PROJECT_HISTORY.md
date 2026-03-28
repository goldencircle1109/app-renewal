# Project History - App Renewal

---

## 2026-03-23

### Initial Commit
- app renewal project folder created
- Existing research documents uploaded:
  - `parkrun/` - Park Run research (01~06)
  - `3way sensor/` - 3Way Sensor research (01~04)
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
  1. **Launch order**: 1st 3Way Sensor → 2nd Riding+ParkRun → 3rd Commerce
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
  - Covers: architecture, 3Way Sensor flow, carbon calc, SSP system, data model, admin features, app screens, 14-week schedule

### Full Roadmap Phase 1+2+3
- Explored parkrun/ folder (06_통합_기능_기획문서.md, 04_한국형_파크런_사업계획서.md) for Phase 2 scope
- Explored darkcommerce/ folder (01~03 + WB3 분석서) for Phase 3 scope
- Created unified roadmap covering all 3 phases:
  - `docs/superpowers/specs/2026-03-28-full-roadmap-phase1-2-3.md`
  - Phase 1 (14 weeks): 3Way Sensor + Carbon Reduction + Admin
  - Phase 2 (16 weeks): GPX Segments + GPS Matching + Rankings + Strava/Garmin + Park Run + Stamp Tour + Crew + SSP Exchange
  - Phase 3 (12 weeks): Dark Commerce (깜깜이방) — Dealer Portal + Anonymity + Flash Sale + Settlement + Native Commerce
  - Total: 42 weeks (~10.5 months), accelerated 32-36 weeks
  - 34 new DB tables, 15 external API integrations, 20 admin modules, ~60 app screens
- Updated task.md with detailed Phase 2/3 weekly task breakdown
