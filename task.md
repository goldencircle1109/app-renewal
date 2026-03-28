# Task List - App Renewal

**Last updated:** 2026-03-28
**Current phase:** Phase 1 - 3Way Sensor + Carbon Reduction
**Design spec:** `docs/superpowers/specs/2026-03-28-app-renewal-design.md`
**Full roadmap:** `docs/superpowers/specs/2026-03-28-full-roadmap-phase1-2-3.md`

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

## NEXT: Week -3 BRD + PRD (Start immediately)

- [ ] BRD: business goals, target users, success metrics, competitive analysis
- [ ] PRD Phase 1: 3Way Sensor + Carbon Reduction (detailed specs, acceptance criteria)
- [ ] PRD Phase 2: Multi-Sport Challenge Platform (detailed specs)
- [ ] PRD Phase 3: Dark Commerce + Smart Commerce (detailed specs)

## Week -2: Screen Planning + Design System Decision

- [ ] App IA (information architecture + tab/navigation structure)
- [ ] All ~65 screens lo-fi wireframes (HTML, Claude-generated, browser preview)
- [ ] Admin IA + key module wireframes (~27 modules)
- [ ] User flow diagrams (onboarding, core activity loop, SSP exchange, commerce)
- [ ] Design system decision (color palette, typography, spacing, component rules)

## Week -1: API Design + Final Review

- [ ] Screen-based API endpoint spec (RESTful, request/response for each screen)
- [ ] Data model finalization (all new tables confirmed)
- [ ] Design system code prep (Flutter ThemeData + Tailwind config definitions)
- [ ] Full document review + commit all docs

---

## Week 1-2: Foundation

- [ ] Express + TypeScript + Prisma project setup (`api/` folder)
- [ ] Aurora MySQL connection + `prisma db pull` introspect (107 tables)
- [ ] Prisma schema review + new tables creation (T_ACTIVITY_RECORD, T_MEMBER_LOCATION, T_CARBON_DAILY, T_SSP_RATE_CONFIG, T_WIFI_SSID_PATTERN, T_EMISSION_FACTOR)
- [ ] Firebase Auth middleware + social login API (Kakao/Naver/Google/Apple)
- [ ] Flutter project creation + folder structure + routing + state management (`app/` folder)
- [ ] Member API (register/login/profile/address)
- [ ] Flutter <-> API integration + login screen working

## Week 3-4: 3Way Sensor + GPS

- [ ] Flutter activity_recognition plugin (walking/running/cycling detection)
- [ ] GPS speed validation + distance measurement
- [ ] Local SQLite storage + server sync API
- [ ] Activity record API (start/end/distance/calories/SSP)
- [ ] Battery optimization (duty cycling, background mode)
- [ ] Real-world walk/run/cycle testing + accuracy tuning

## Week 5-6: Transport Auto-Detection

- [ ] Wi-Fi SSID scan module (Android + iOS)
- [ ] Seoul bus/subway/KTX SSID pattern DB build
- [ ] SSID matching engine + vehicle classification logic
- [ ] Home/Work registration (Kakao Address API -> geocoding)
- [ ] Geofence setup + car/taxi auto-inference
- [ ] Pattern learning (repeated routes -> auto home/work recognition)
- [ ] Full transport detection integration test

## Week 7-8: Carbon Reduction + SSP Engine

- [ ] T-map car route API integration
- [ ] Carbon reduction calculation engine (baseline vs actual)
- [ ] Emission factor management system (admin-configurable)
- [ ] SSP auto-earning engine (per-activity configurable rates)
- [ ] Daily/weekly/monthly aggregation logic + API
- [ ] Carbon reduction report API (individual + total)
- [ ] MRV: 도로교통공단 운전면허 자동검증 API 연동
- [ ] MRV: CODEF API 연동 (자동차등록원부, 보험다모아, 하이패스)
- [ ] MRV: Claude Vision API OCR (보험증권, 리스계약서, 재직증명서 자동 검증)
- [ ] MRV: 3-Tier 인증 플로우 (자동/반자동/행동기반) + 관리자 검수 큐

## Week 9-10: Flutter App UI

- [ ] Home screen (today's carbon reduction, activity summary, SSP)
- [ ] Activity history list + detail screens
- [ ] Carbon dashboard (charts, car comparison visualization)
- [ ] My page (profile, SSP balance, home/work management)
- [ ] Settings screen (notifications, privacy, social accounts)
- [ ] Full app navigation + design polish

## Week 11-13: Admin Panel

- [ ] Next.js 14 project setup + layout + auth (`admin/` folder)
- [ ] Dashboard (carbon stats charts, user statistics)
- [ ] Member management (list, detail, SSP history, activity history)
- [ ] SSP settings (activity rates, emission factors CRUD)
- [ ] Push notification management (FCM send, targeting, scheduling)
- [ ] Banner/popup management (image upload, display period)
- [ ] Challenge management (create, participants, results)
- [ ] Notice board (CRUD, rich text editor, pin/unpin)

## Week 14: Integration + Launch

- [ ] App <-> API <-> Admin full integration test
- [ ] Real commute scenario end-to-end test
- [ ] Bug fixes + performance optimization
- [ ] App Store / Google Play submission

---

## Phase 2 - Week 15-17: Multi-Sport GPX Course Engine

- [ ] Sport type registry (RUNNING/CYCLING/HIKING + extensible)
- [ ] GPX auto-pipeline (upload -> parse -> clean -> metadata -> checkpoints -> challenge)
- [ ] Auto reverse course generation (B->A) + loop detection
- [ ] Organization system (KTO, local govs, national parks) + batch GPX API
- [ ] Admin course CRUD + bidirectional map preview
- [ ] Multi-sport per course tagging

## Phase 2 - Week 18-19: Bidirectional GPS Matching Engine

- [ ] Direction detection (A->B vs B->A from first 3 checkpoints)
- [ ] Bidirectional start/end detection (either endpoint = valid start)
- [ ] Per-sport speed/stop validation (running/cycling/hiking different thresholds)
- [ ] Post-activity batch matching + Strava sync matching

## Phase 2 - Week 20-21: Multi-Sport Ranking System

- [ ] Per-sport + per-direction leaderboards
- [ ] KOR/QOR (Course King/Queen) + Local Legend + Season Ranking
- [ ] Cross-sport champion badges
- [ ] Crew ranking + ranking notifications + leaderboard filters

## Phase 2 - Week 22-23: Strava + Garmin Integration

- [ ] Strava OAuth + activity sync + webhook
- [ ] Garmin Connect IQ + activity sync
- [ ] Sport type mapping (Strava/Garmin -> WB types)
- [ ] Native GPS recording for all 3 sports

## Phase 2 - Week 24-26: Multi-Sport Event System

- [ ] Event types (Park Run 5km / Bike Run / Hike / Special / Multi-Sport)
- [ ] Bidirectional events (participants choose direction)
- [ ] QR/NFC check-in + GPS tracking + live leaderboard (WebSocket, per-sport)
- [ ] Completion detection (either direction) + results + SNS share cards
- [ ] Volunteer matching system

## Phase 2 - Week 26-27: Stamp Tour + Challenge System

- [ ] GPX-auto stamp generation (no manual setup needed)
- [ ] Bidirectional stamp collection (A->B and B->A both count)
- [ ] Organization stamp books + grand slam + cross-sport badges
- [ ] Tourism info integration at checkpoints

## Phase 2 - Week 28-29: Crew Hub (Multi-Sport)

- [ ] Multi-sport crews + crew CRUD + member management
- [ ] Crew events + inter-crew challenges (per sport or cross-sport)
- [ ] Social feed + kudos + comments
- [ ] Crew search + leaderboard

## Phase 2 - Week 30-32: SSP External Exchange

- [ ] Naver Pay Points (Daou Addcon B2B API)
- [ ] Kakao Gift Biz API (mobile voucher delivery)
- [ ] Giftishow Biz / ZeroPay voucher / Onnuri gift certificate
- [ ] Exchange rate admin + tax handling (22% > 50K KRW)
- [ ] Integration testing + Phase 2 launch

---

## Phase 3 - Week 33-35: Dealer Portal + Smart Store Import

- [ ] Dealer registration + approval + tiers (Bronze/Silver/Gold) + NDA
- [ ] Naver Commerce API integration (Smart Store connection)
- [ ] Product auto-import pipeline (pull -> stage -> select -> publish)
- [ ] Daily sync cron (new/removed/updated product detection)
- [ ] Simplified product registration (imported: set qty/price/condition only)
- [ ] Settlement dashboard

## Phase 3 - Week 35-37: AI Product Description Generator

- [ ] Claude API integration for product description generation
- [ ] Data collection pipeline (manufacturer site + Naver Shopping)
- [ ] Per-category HTML templates (bikes, components, shoes, apparel)
- [ ] Batch generation (50+ products at once)
- [ ] Admin review interface (preview -> approve/edit -> publish)

## Phase 3 - Week 37-39: Operations Automation Engine

- [ ] KakaoTalk Biz Message API (order/settlement auto-alerts)
- [ ] Email auto-send (packing slip PDF, settlement statement)
- [ ] GoodsFlow webhook (shipping auto-track + delivery confirmation)
- [ ] 7-day auto-confirm timer + settlement batch cron
- [ ] Tax invoice auto-issue (홈택스/Barobill/Popbill API)
- [ ] Monthly auto-report generation + delivery
- [ ] Consumer notification pipeline (ordered -> shipped -> delivered)

## Phase 3 - Week 39-40: Anonymity Architecture

- [ ] API response filtering (zero dealer info leak)
- [ ] Shipping label system (LB brand only)
- [ ] CS routing + notification filtering
- [ ] Access control + audit trail

## Phase 3 - Week 40-41: Flash Sale System

- [ ] Sale creation (duration countdown, 1-unit inventory)
- [ ] Status transitions (Draft -> Active -> Sold Out/Expired)
- [ ] Upcoming preview (blurred cards) + auto-cancel/confirm
- [ ] Consumer flash sale list + detail UI

## Phase 3 - Week 42-43: Consumer Experience + Payment

- [ ] Dark Commerce tab in Flutter app + AI-generated product detail
- [ ] Purchase flow (existing PG) + auto-updated tracking
- [ ] Auto consumer notifications (KakaoTalk/push)
- [ ] Returns (defective only policy)

## Phase 3 - Week 44-45: Settlement + Tax Automation

- [ ] Auto settlement calculation (per-tier cycle: 1/3/5 days)
- [ ] Auto bank transfer + tax invoice issuance
- [ ] Auto settlement notification (KakaoTalk + email PDF)
- [ ] Monthly dealer report auto-generation

## Phase 3 - Week 46-50: Native Commerce + Full Admin

- [ ] Product catalog + cart + checkout (native Flutter)
- [ ] Order history with auto-tracking
- [ ] Full admin panel (10 modules: dealer, smart store, AI desc, inspection, flash sale, ops dashboard, settlement, anonymity, analytics, notification config)
- [ ] Integration testing + Phase 3 launch

---

## Phase 4 - Week 51-53: SSP Token Infrastructure

- [ ] SSP lock/unlock system + conversion status tracking
- [ ] Token conversion API (SSP -> carbon proof -> issuance request)
- [ ] Double-counting prevention (DB triggers, one-way conversion)
- [ ] Carbon proof export (JSON/CSV, auditable format)
- [ ] SSP-to-token ratio config + token balance display in app

## Phase 4 - Week 53-55: Carbon Certification & Audit

- [ ] KCCI + Ministry of Environment certification pathway
- [ ] Third-party audit (DNV/TUV) of carbon methodology
- [ ] POPLE voluntary registry + multi-source certification
- [ ] MRV data package consolidation + annual carbon report automation

## Phase 4 - Week 55-60: Korea STO (Track 1)

- [ ] Broker partnership (NXT/KDX participating firm)
- [ ] FSC pre-consultation + securities prospectus drafting
- [ ] KYC/AML integration (broker SDK)
- [ ] Broker API integration (token issuance, balance, trading)
- [ ] Beta launch (100-1,000 users) -> full launch

## Phase 4 - Week 58-66: Overseas Blockchain (Track 2, parallel)

- [ ] Singapore/Dubai entity incorporation + legal opinion
- [ ] ERC-20 smart contract (Solidity: mint, burn, pause, access control)
- [ ] Security audit (CertiK/Trail of Bits)
- [ ] Testnet (Polygon Mumbai) -> mainnet deployment
- [ ] DEX listing (Uniswap/SushiSwap) + geo-blocking (US)

## Phase 4 - Week 62-70: B2B Corporate ESG Sales

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
- [x] 3Way Sensor existing research review - 2026-03-28
- [x] Full roadmap Phase 1+2+3 design spec - 2026-03-28
- [x] Phase 2 update: multi-sport + bidirectional + GPX auto-pipeline + org system - 2026-03-28
- [x] Phase 3 update: ops automation + AI product desc + Smart Store import - 2026-03-28
- [x] MRV 3-Tier vehicle verification + Claude Vision OCR - 2026-03-28
- [x] Phase 4 added: Carbon Token Securities (STO) + Global Expansion - 2026-03-28
