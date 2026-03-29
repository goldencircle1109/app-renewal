# Task List - App Renewal

**Last updated:** 2026-03-29
**Current phase:** Pre-Dev (BRD complete, PRD next)
**Design spec:** `docs/superpowers/specs/2026-03-28-app-renewal-design.md`
**Full roadmap:** `docs/superpowers/specs/2026-03-28-full-roadmap-phase1-2-3.md`

---

## Timeline Decision: Option C Hybrid + Dev Pipeline (25.5 weeks, CONFIRMED 2026-03-30)

```
Dev Pipeline (6팀 자동 오케스트레이션):
  T1(일정) → T2(설계,5에이전트병렬) → T3(개발,3명병렬) → T6(보안) → T4(QA,11에이전트) → T5(배포)

Pre-Dev (2w) → Phase 1 MVP (5w) → LAUNCH → 보강 (2.5w) → Phase 2 (8w) → Phase 3 (8w)
                                     ↓
                               7주 후 출시 = 2026년 6월 초

Week -2~-1:  Pre-Dev (PRD 핵심 + 화면기획 10개 + API설계)
Week 1:      Foundation (T3 병렬: API팀+Flutter팀+인프라팀 동시)
Week 2-3:    SmartMove MVP (T3 병렬: 센서팀+API팀+UI팀 동시)
Week 4-5:    Carbon + SSP + Ads + Admin 5모듈 (T3 병렬 + T4 QA 자동)
★ Week 7:    APP STORE LAUNCH (Phase 1 MVP, 90% quality)
Week 6-8:    Phase 1 보강 (T3 병렬: Wi-Fi+Geofence+MRV+Admin 동시)
Week 9-16:   Phase 2 (1주 스프린트 × 8: T2→T3→T4 파이프라인 반복)
Week 17-24:  Phase 3 (1주 스프린트 × 8: T2→T3→T4 파이프라인 반복)
Week 25.5:   Phase 1~3 FULL COMPLETE

Pipeline 효과: 38주 → 25.5주 (33% 단축, -12.5주)
```

---

## Korea Tourism Organization Proposal

- [ ] Review and finalize email draft, fill in sender info (name/title/contact)
- [ ] Send email (attach: business proposal, event plan, company intro)
- [ ] Wait for KTO response, coordinate meeting schedule
- [ ] Prepare meeting materials (summary presentation if needed)

## Racing the DMZ

- [ ] Update event plan based on KTO feedback
- [ ] Confirm KTO funding application process

## Park Run

- [ ] Update business proposal based on KTO feedback
- [ ] Negotiate MOU signing schedule
- [ ] Plan pilot 5 hub site field survey

---

## NEXT: Pre-Dev Week -2~-1 (2 weeks, start immediately)

- [x] BRD complete (docs/BRD/BRD_complete.md) ← DONE
- [ ] PRD Phase 1 core (SmartMove + Carbon, acceptance criteria for MVP scope only)
- [ ] App IA (tab/navigation structure, core 10 screens)
- [ ] Core 10 screens lo-fi wireframes (home, activity, carbon, mypage, settings, onboarding, mission center, login, address setup, admin dashboard)
- [ ] Design system decision (color palette, typography, spacing, component rules)
- [ ] API endpoint spec for Phase 1 MVP (auth, member, activity, carbon, ssp, ad)
- [ ] Data model finalization (Phase 1 new tables confirmed)
- [ ] Design system code prep (Flutter ThemeData + Tailwind config)
- [ ] PRD Phase 2/3 rough draft (detailed specs during Phase 1 보강 period)

---

## Week 1-2: Foundation (Phase 1 MVP start)

- [ ] Express + TypeScript + Prisma project setup (`api/` folder)
- [ ] Aurora MySQL connection + `prisma db pull` introspect (107 tables)
- [ ] Prisma schema review + new tables creation (T_ACTIVITY_RECORD, T_MEMBER_LOCATION, T_CARBON_DAILY, T_SSP_RATE_CONFIG, T_WIFI_SSID_PATTERN, T_EMISSION_FACTOR)
- [ ] Firebase Auth (Google/Apple/Kakao, 3 providers — foreign user support)
- [ ] i18n setup (flutter_localizations + intl: KO/EN, JA/ZH later)
- [ ] Flutter project creation + folder structure + routing + state management (`app/` folder)
- [ ] Member API (register/login/profile/address)
- [ ] Flutter <-> API integration + login screen working

## Week 3-4: SmartMove MVP (walk/run/cycle only)

- [ ] Flutter activity_recognition plugin (walking/running/cycling detection)
- [ ] GPS speed validation + distance measurement
- [ ] Local SQLite storage + server sync API
- [ ] Activity record API (start/end/distance/calories/SSP)
- [ ] Battery optimization (duty cycling, background mode)
- [ ] Real-world walk/run/cycle testing + accuracy tuning

## Week 5-6: Carbon Reduction + SSP + Basic UI

- [ ] T-map car route API integration
- [ ] Carbon reduction calculation engine (baseline vs actual)
- [ ] Emission factor management system (admin-configurable)
- [ ] SSP source tagging system (CARBON/AD/SHOP/BONUS)
- [ ] SSP exchange validation (only AD+SHOP exchangeable, CARBON blocked)
- [ ] SSP auto-earning engine (per-activity configurable rates)
- [ ] Home/Work registration (Kakao Address API -> geocoding)
- [ ] Home screen (today's carbon reduction, activity summary, SSP)
- [ ] Activity history list + detail screens
- [ ] Carbon dashboard (charts, car comparison)

## Week 7-8: Ads + Admin + Launch Prep

- [ ] AdMob 리워드 동영상 연동 (google_mobile_ads, "광고 보고 2배 SSP")
- [ ] 오퍼월 연동 (애디슨 AdiSON SDK + postback callback API)
- [ ] "미션센터" 탭 UI (오퍼월 + 리워드 동영상 목록)
- [ ] My page (profile, SSP balance, home/work management)
- [ ] Settings screen (notifications, privacy, social accounts)
- [ ] Next.js admin: dashboard + member mgmt + SSP settings + push + notices (5 modules)
- [ ] App <-> API <-> Admin integration test
- [ ] Real walk/run/cycle scenario end-to-end test
- [ ] Bug fixes + App Store / Google Play submission

## ★ Week 10: LAUNCH (Phase 1 MVP, 90% quality)

## Week 9-12: Phase 1 보강 (post-launch, weekly updates)

- [ ] Wi-Fi SSID scan module (Android only, iOS uses GPS speed)
- [ ] Bus stop geofence (iOS alternative for bus detection)
- [ ] Geofence car/taxi auto-inference
- [ ] Pattern learning (repeated routes -> auto home/work)
- [ ] MRV: 도로교통공단 운전면허 자동검증 API
- [ ] MRV: CODEF API (자동차등록원부, 보험다모아, 하이패스)
- [ ] MRV: Claude Vision API OCR (보험증권, 리스계약서 자동 검증)
- [ ] MRV: 3-Tier 인증 플로우 + 관리자 검수 큐
- [ ] Daily/weekly/monthly aggregation cron
- [ ] 배너 광고 (카카오 애드핏)
- [ ] Admin expansion: banner/popup, challenge, full SSP config
- [ ] PRD Phase 2/3 detailed specs

---

## Phase 2 - Week 13-15: Multi-Sport GPX Course Engine (compressed 12 weeks)

- [ ] Sport type registry (RUNNING/CYCLING/HIKING + extensible)
- [ ] GPX auto-pipeline (upload -> parse -> clean -> metadata -> checkpoints -> challenge)
- [ ] Auto reverse course generation (B->A) + loop detection
- [ ] Organization system (KTO, local govs, national parks) + batch GPX API
- [ ] Admin course CRUD + bidirectional map preview
- [ ] Multi-sport per course tagging

## Phase 2 - Week 16-17: Bidirectional GPS Matching Engine

- [ ] Direction detection (A->B vs B->A from first 3 checkpoints)
- [ ] Bidirectional start/end detection (either endpoint = valid start)
- [ ] Per-sport speed/stop validation (running/cycling/hiking different thresholds)
- [ ] Post-activity batch matching + Strava sync matching

## Phase 2 - Week 18-19: Multi-Sport Ranking System

- [ ] Per-sport + per-direction leaderboards
- [ ] KOR/QOR (Course King/Queen) + Local Legend + Season Ranking
- [ ] Cross-sport champion badges
- [ ] Crew ranking + ranking notifications + leaderboard filters

## Phase 2 - Week 20: Strava + Garmin Integration

- [ ] Strava OAuth + activity sync + webhook
- [ ] Garmin Connect IQ + activity sync
- [ ] Sport type mapping (Strava/Garmin -> WB types)
- [ ] Native GPS recording for all 3 sports

## Phase 2 - Week 21-22: Multi-Sport Event System

- [ ] Event types (Park Run 5km / Bike Run / Hike / Special / Multi-Sport)
- [ ] Bidirectional events (participants choose direction)
- [ ] QR/NFC check-in + GPS tracking + live leaderboard (WebSocket, per-sport)
- [ ] Completion detection (either direction) + results + SNS share cards
- [ ] Volunteer matching system

## Phase 2 - Week 22-23: Stamp Tour + Challenge System

- [ ] GPX-auto stamp generation (no manual setup needed)
- [ ] Bidirectional stamp collection (A->B and B->A both count)
- [ ] Organization stamp books + grand slam + cross-sport badges
- [ ] Tourism info integration at checkpoints

## Phase 2 - Week 23: Crew Hub (Multi-Sport)

- [ ] Multi-sport crews + crew CRUD + member management
- [ ] Crew events + inter-crew challenges (per sport or cross-sport)
- [ ] Social feed + kudos + comments
- [ ] Crew search + leaderboard

## Phase 2 - Week 24: SSP External Exchange

- [ ] Naver Pay Points (Daou Addcon B2B API)
- [ ] Kakao Gift Biz API (mobile voucher delivery)
- [ ] Giftishow Biz / ZeroPay voucher / Onnuri gift certificate
- [ ] Exchange rate admin + tax handling (22% > 50K KRW)
- [ ] Integration testing + Phase 2 launch

---

## Phase 3 - Week 25-27: Dual Commerce + Dealer Portal (compressed 12 weeks)

- [ ] Dual channel architecture (Normal Shop + Dark Room)
- [ ] Multi-sport category system (T_SHOP_CATEGORY, cross-sport tagging)
- [ ] Dark Room SSP entry ticket system (500 AD/SHOP SSP/month, Phase 1 active check)
- [ ] Dealer registration + approval + tiers (Bronze/Silver/Gold) + NDA
- [ ] Naver Commerce API integration (Smart Store connection)
- [ ] Product auto-import pipeline (pull -> stage -> select -> publish)
- [ ] Daily sync cron (new/removed/updated product detection)
- [ ] Simplified product registration (imported: set qty/price/condition + channel selection)
- [ ] Settlement dashboard

## Phase 3 - Week 28-29: AI Product Description Generator

- [ ] Claude API integration for product description generation
- [ ] Data collection pipeline (manufacturer site + Naver Shopping)
- [ ] Per-category HTML templates (bikes, components, shoes, apparel)
- [ ] Batch generation (50+ products at once)
- [ ] Admin review interface (preview -> approve/edit -> publish)

## Phase 3 - Week 30-31: Operations Automation Engine

- [ ] KakaoTalk Biz Message API (order/settlement auto-alerts)
- [ ] Email auto-send (packing slip PDF, settlement statement)
- [ ] GoodsFlow webhook (shipping auto-track + delivery confirmation)
- [ ] 7-day auto-confirm timer + settlement batch cron
- [ ] Tax invoice auto-issue (홈택스/Barobill/Popbill API)
- [ ] Monthly auto-report generation + delivery
- [ ] Consumer notification pipeline (ordered -> shipped -> delivered)

## Phase 3 - Week 32: Anonymity Architecture

- [ ] API response filtering (zero dealer info leak)
- [ ] Shipping label system (LB brand only)
- [ ] CS routing + notification filtering
- [ ] Access control + audit trail

## Phase 3 - Week 33: Flash Sale System

- [ ] Sale creation (duration countdown, 1-unit inventory)
- [ ] Status transitions (Draft -> Active -> Sold Out/Expired)
- [ ] Upcoming preview (blurred cards) + auto-cancel/confirm
- [ ] Consumer flash sale list + detail UI

## Phase 3 - Week 34: Consumer Experience + Payment

- [ ] Dark Commerce tab in Flutter app + AI-generated product detail
- [ ] Purchase flow (existing PG) + auto-updated tracking
- [ ] Auto consumer notifications (KakaoTalk/push)
- [ ] Returns (defective only policy)

## Phase 3 - Week 35: Settlement + Tax Automation

- [ ] Auto settlement calculation (per-tier cycle: 1/3/5 days)
- [ ] Auto bank transfer + tax invoice issuance
- [ ] Auto settlement notification (KakaoTalk + email PDF)
- [ ] Monthly dealer report auto-generation

## Phase 3 - Week 36: Native Commerce + Full Admin + Launch

- [ ] Product catalog + cart + checkout (native Flutter)
- [ ] Order history with auto-tracking
- [ ] Full admin panel (10 modules: dealer, smart store, AI desc, inspection, flash sale, ops dashboard, settlement, anonymity, analytics, notification config)
- [ ] Integration testing + Phase 3 launch

---

## Phase 4 - Week 37-39: SSP Token Infrastructure

- [ ] SSP lock/unlock system + conversion status tracking
- [ ] Token conversion API (SSP -> carbon proof -> issuance request)
- [ ] Double-counting prevention (DB triggers, one-way conversion)
- [ ] Carbon proof export (JSON/CSV, auditable format)
- [ ] SSP-to-token ratio config + token balance display in app

## Phase 4 - Week 39-41: Carbon Certification & Audit

- [ ] KCCI + Ministry of Environment certification pathway
- [ ] Third-party audit (DNV/TUV) of carbon methodology
- [ ] POPLE voluntary registry + multi-source certification
- [ ] MRV data package consolidation + annual carbon report automation

## Phase 4 - Week 41-46: Korea STO (Track 1)

- [ ] Broker partnership (NXT/KDX participating firm)
- [ ] FSC pre-consultation + securities prospectus drafting
- [ ] KYC/AML integration (broker SDK)
- [ ] Broker API integration (token issuance, balance, trading)
- [ ] Beta launch (100-1,000 users) -> full launch

## Phase 4 - Week 44-52: Overseas Blockchain (Track 2, parallel)

- [ ] Singapore/Dubai entity incorporation + legal opinion
- [ ] ERC-20 smart contract (Solidity: mint, burn, pause, access control)
- [ ] Security audit (CertiK/Trail of Bits)
- [ ] Testnet (Polygon Mumbai) -> mainnet deployment
- [ ] DEX listing (Uniswap/SushiSwap) + geo-blocking (US)

## Phase 4 - Week 48-56: B2B Corporate ESG Sales

- [ ] Corporate ESG dashboard (white-label carbon reports)
- [ ] Bulk credit purchase API + ESG report integration (GRI/SASB/TCFD)
- [ ] Corporate partnership onboarding (first 5-10 companies)
- [ ] Employee carbon challenge program + insurance partnerships

---

## Completed

- [x] SSP point exchange research (Naver Pay, Kakao, ZeroPay, Onnuri) - 2026-03-25
- [x] Park Run proposal update (Section 13 SSP exchange slide) - 2026-03-25
- [x] Korea Tourism Organization proposal email draft - 2026-03-26
- [x] App Renewal Phase 1 design spec - 2026-03-28
- [x] Existing WB3 DB/architecture/feature analysis - 2026-03-28
- [x] SmartMove existing research review - 2026-03-28
- [x] Full roadmap Phase 1+2+3 design spec - 2026-03-28
- [x] Phase 2 update: multi-sport + bidirectional + GPX auto-pipeline + org system - 2026-03-28
- [x] Phase 3 update: ops automation + AI product desc + Smart Store import - 2026-03-28
- [x] iOS Wi-Fi SSID restriction research + GPS/geofence alternative - 2026-03-29
- [x] GTM strategy created (docs/GTM/) - 2026-03-29
- [x] Actual metrics confirmed: MAU ~4,000 (app 2,130 + web 2,000) - 2026-03-29
- [x] Doc review: 7 CEO decisions resolved + 13 inconsistencies fixed - 2026-03-29
- [x] Shareholder report Word + PPT (McKinsey style) - 2026-03-29
- [x] Rename 3Way Sensor → SmartMove (folder + 28 files + Word/PPT) - 2026-03-29
- [x] MRV 3-Tier vehicle verification + Claude Vision OCR - 2026-03-28
- [x] Phase 4 added: Carbon Token Securities (STO) + Global Expansion - 2026-03-28
