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
