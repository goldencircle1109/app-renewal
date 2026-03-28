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

## Next: Week 1-2 Foundation (Start immediately)

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

## Phase 2 - Week 15-16: GPX Segment Management

- [ ] GPX parser (XML -> coordinates + metadata)
- [ ] Coordinate cleanup (noise removal + Douglas-Peucker simplification)
- [ ] Batch import KTO 60 courses + National Cycling 12 routes
- [ ] Admin segment CRUD + map preview
- [ ] Segment categories (8 types) + user segment creation

## Phase 2 - Week 17-18: GPS Matching Engine

- [ ] Bounding box filter + start/end point detection (50m radius)
- [ ] Route similarity validation (80% checkpoint threshold)
- [ ] Time validation (speed filters + stop time filters)
- [ ] Post-activity batch matching + Strava sync matching

## Phase 2 - Week 19-20: Ranking System

- [ ] KOR/QOR (Course King/Queen) per segment
- [ ] Local Legend (90-day rolling window most completions)
- [ ] Segment leaderboard + season ranking (quarterly points)
- [ ] Crew ranking + ranking notifications

## Phase 2 - Week 21-22: Strava + Garmin Integration

- [ ] Strava OAuth + activity sync + webhook
- [ ] Garmin Connect IQ + activity sync
- [ ] Post-sync segment matching pipeline
- [ ] Native GPS riding recording (non-Strava)

## Phase 2 - Week 23-25: Park Run Events

- [ ] Event types (Park Run 5km / Bike Run 15-30km / Special)
- [ ] Event series + registration + QR/NFC check-in
- [ ] Live leaderboard (WebSocket) + GPS tracking
- [ ] Completion detection + results + SNS share cards
- [ ] Volunteer matching system

## Phase 2 - Week 25-26: Digital Stamp Tour

- [ ] Stamp/badge data model + checkpoint GPS trigger
- [ ] Stamp book UI + collection progress
- [ ] KTO tourism info integration

## Phase 2 - Week 27-28: Crew Hub

- [ ] Crew CRUD + member management + roles
- [ ] Crew events + inter-crew challenges
- [ ] Social feed + kudos + comments
- [ ] Crew search + leaderboard

## Phase 2 - Week 29-30: SSP External Exchange

- [ ] Naver Pay Points (Daou Addcon B2B API)
- [ ] Kakao Gift Biz API (mobile voucher delivery)
- [ ] Giftishow Biz / ZeroPay voucher / Onnuri gift certificate
- [ ] Exchange rate admin + tax handling (22% > 50K KRW)

---

## Phase 3 - Week 31-33: Dealer Portal (Dark Commerce)

- [ ] Dealer registration + approval workflow
- [ ] Dealer tier system (Bronze/Silver/Gold)
- [ ] Product registration (photos, condition, pricing)
- [ ] Shipment notification (masked consumer info)
- [ ] Settlement dashboard + NDA digital signing

## Phase 3 - Week 33-34: Anonymity Architecture

- [ ] API response filtering (zero dealer info leak)
- [ ] Shipping label system (LB brand only)
- [ ] CS routing + notification filtering
- [ ] Access control + audit trail

## Phase 3 - Week 35-36: Flash Sale System

- [ ] Sale creation (duration countdown, 1-unit inventory)
- [ ] Status transitions (Draft -> Active -> Sold Out/Expired)
- [ ] Upcoming preview (blurred cards) + auto-cancel/confirm
- [ ] Consumer flash sale list + detail UI

## Phase 3 - Week 37-38: Admin Inspection

- [ ] Product approval workflow + photo review
- [ ] Price adjustment authority + quality scoring
- [ ] Category + commission rate management

## Phase 3 - Week 39-40: Consumer Experience + Payment

- [ ] Dark Commerce tab in Flutter app
- [ ] Purchase flow (existing PG integration)
- [ ] Order tracking (LB as sender) + returns (defective only)

## Phase 3 - Week 41-42: Settlement + Native Commerce

- [ ] Settlement ledger (double-entry) + VAT chain
- [ ] Tax invoice auto-generation + dealer monthly reporting
- [ ] Existing commerce WebView -> native conversion (basic)
- [ ] Integration testing + Phase 3 launch

---

## Completed

- [x] SSP point exchange research (Naver Pay, Kakao, ZeroPay, Onnuri) - 2026-03-25
- [x] Park Run proposal update (Section 13 SSP exchange slide) - 2026-03-25
- [x] Korea Tourism Organization proposal email draft - 2026-03-26
- [x] App Renewal Phase 1 design spec - 2026-03-28
- [x] Existing WB3 DB/architecture/feature analysis - 2026-03-28
- [x] 3Way Sensor existing research review - 2026-03-28
- [x] Full roadmap Phase 1+2+3 design spec - 2026-03-28
