# App Renewal - Full Roadmap: Phase 1 + 2 + 3

**Date:** 2026-03-28
**Project:** Wright Brothers App Renewal
**Author:** CEO + Claude
**Status:** Draft

---

## Executive Summary

Wright Brothers app renewal in 3 phases, preserving existing Aurora MySQL (107 tables).

```
Phase 1: 3Way Sensor + Carbon Reduction     (~14 weeks)
    ↓
Phase 2: Riding + Park Run + WB RUN         (~16 weeks)
    ↓
Phase 3: Dark Commerce (깜깜이방)            (~12 weeks)
─────────────────────────────────────────────
Total: ~42 weeks (~10.5 months)
Accelerated: ~32-36 weeks (~8-9 months)
```

---

## Architecture (Shared Across All Phases)

```
[Flutter App]   ─┐
[Next.js Admin] ─┼──→ [API Server: Express + TS + Prisma] ──→ [Aurora MySQL]
[Next.js Web]   ─┘
(Phase 3)            External APIs:
                     ├── Firebase Auth (social login)
                     ├── FCM (push notifications)
                     ├── T-map API (car routes)
                     ├── Kakao Address API
                     ├── Strava API (Phase 2)
                     ├── Garmin API (Phase 2)
                     ├── Naver Pay / Kakao Gift / ZeroPay (Phase 2)
                     ├── Inicis / PortOne / NaverPay PG (Phase 3)
                     └── GoodsFlow (shipping, Phase 3)
```

---

# PHASE 1: 3Way Sensor + Carbon Reduction (~14 weeks)

## Scope Summary

Build foundation + automatic activity/transport detection + carbon reduction calculation.

## Feature List

### Foundation (Week 1-2)

| Feature | Detail |
|---------|--------|
| API Server | Express + TypeScript + Prisma project |
| DB Connection | Aurora MySQL Prisma introspect (107 tables) |
| New Tables | T_ACTIVITY_RECORD, T_MEMBER_LOCATION, T_CARBON_DAILY, T_SSP_RATE_CONFIG, T_WIFI_SSID_PATTERN, T_EMISSION_FACTOR |
| Auth | Firebase Auth + social login (Kakao/Naver/Google/Apple) |
| Flutter App | Project skeleton, routing, state management |
| Member API | Register/login/profile/address CRUD |

### 3Way Sensor (Week 3-4)

| Feature | Detail |
|---------|--------|
| Activity Detection | Walking/running/cycling via Platform API (Android: Activity Recognition Transition API, iOS: CMMotionActivityManager) |
| GPS Speed Validation | Speed-based activity confirmation + distance calc |
| Local Storage | SQLite for offline activity records |
| Server Sync | Batch sync when connectivity available |
| Battery Optimization | Transition API (event-driven), GPS duty cycling (5s on/25s off) |

### Transport Auto-Detection (Week 5-6)

| Feature | Detail |
|---------|--------|
| Wi-Fi SSID Scanner | Android + iOS Wi-Fi scan module |
| SSID Pattern DB | Seoul bus/subway/KTX patterns (server-synced) |
| SSID Matching | Bus (`T wifi zone`, `BUS_FREE_WIFI`), Subway (`Metro_WiFi`, `U+zone`), KTX (`KTX_WiFi`) |
| Geofence | Home/work 200m radius, walking→vehicle transition detection |
| Car vs Taxi | Inside geofence = private car, outside = taxi |
| Pattern Learning | 5+ repeated trips → auto home/work suggestion |

### Carbon Reduction Engine (Week 7-8)

| Feature | Detail |
|---------|--------|
| T-map API | Car route distance between home↔work (cached weekly) |
| Calculation Engine | Baseline emission (car) - actual emission (real transport) = reduction |
| Emission Factors | Admin-configurable per transport mode (gasoline 0.15871, bus 0.02745, etc.) |
| SSP Auto-Earning | Per-activity configurable rates |
| Aggregation | Daily/weekly/monthly carbon reduction summaries |
| Reports | Individual + platform-wide carbon reports |

### Flutter App UI (Week 9-10)

| Screen | Key Elements |
|--------|-------------|
| Home | Today's carbon reduction, activity timeline, SSP balance, streak |
| Activity History | Calendar view, daily trip list, trip detail with map |
| Carbon Dashboard | Cumulative CO₂, "X trees equivalent", monthly trend, mode breakdown |
| My Page | Profile, SSP balance + history, home/work management, bikes |
| Settings | Notifications, privacy, activity detection toggle |
| Onboarding | Welcome slides, social login, address setup, permissions |

### Admin Panel (Week 11-13)

| Module | Key Features |
|--------|-------------|
| Dashboard | Carbon stats (daily/monthly/yearly), user statistics charts |
| Members | List, detail, SSP history, activity history, manual SSP adjust |
| SSP Config | Activity rates, emission factors CRUD, bonus multipliers |
| Push Notifications | FCM compose/send, audience targeting, scheduling, history |
| Banners/Popups | Image upload (S3), display period, placement, priority |
| Challenges | Create, participant management, auto-completion, results |
| Notices | CRUD, rich text editor, pin/unpin |

### Integration & Launch (Week 14)

| Task | Detail |
|------|--------|
| Integration Test | App ↔ API ↔ Admin full flow |
| Real-World Test | Actual commute scenarios end-to-end |
| Bug Fixes | Performance optimization |
| Store Submission | iOS App Store + Google Play |

## Phase 1 New DB Tables

```
T_ACTIVITY_RECORD     — Activity records from 3Way Sensor
T_MEMBER_LOCATION     — Home/work/school geofence locations
T_CARBON_DAILY        — Daily carbon reduction summary
T_SSP_RATE_CONFIG     — SSP earning rates (admin-managed)
T_WIFI_SSID_PATTERN   — Bus/subway/KTX SSID patterns
T_EMISSION_FACTOR     — CO₂ emission factors per transport
```

---

# PHASE 2: Riding + Park Run + WB RUN (~16 weeks)

## Scope Summary

GPS riding with Strava/Garmin integration, segment ranking system, digital stamp tour, park run events, crew system, and SSP external reward exchange.

## Feature List

### M1. GPX Segment Management (Week 15-16)

| Feature | Detail |
|---------|--------|
| GPX Parser | XML parsing → coordinate extraction (trkpt lat/lon/ele) |
| Coordinate Cleanup | Noise removal + Douglas-Peucker simplification |
| Metadata Calculation | Haversine distance, elevation gain, loop detection |
| Batch Import | KTO 60 courses + National Cycling 12 routes |
| Admin Segment CRUD | Create/edit/delete/activate segments |
| Segment Categories | 8 types: city, sea, island, river, mountain, challenge, history, healing |
| User Segment Creation | Users create segments from past rides (admin moderation) |

### M2. GPS Matching Engine (Week 17-18)

| Feature | Detail |
|---------|--------|
| Bounding Box Filter | Narrow candidates from 10,000s to 10s |
| Start Point Detection | GPS within 50m of segment start → candidate marking |
| Route Similarity | Checkpoint validation (80% threshold) |
| End Point Detection | GPS within 50m of segment end → completion confirmed |
| Time Validation | Speed filters (min/max), stop time filter (>30min = invalid) |
| Post-Activity Matching | Batch matching after activity upload (Phase 2a) |
| Real-Time Matching | Live segment during activity via GPS streaming (Phase 2b) |
| Strava Sync Matching | Match segments from Strava-imported activities |

### M3. Ranking System (Week 19-20)

| Feature | Detail |
|---------|--------|
| KOR/QOR (Course King/Queen) | Per-segment male/female fastest time, crown icon |
| Local Legend | 90-day rolling window, most completions, wreath icon |
| Segment Leaderboard | Full ranking by time, filterable |
| Season Ranking | Quarterly points: base (100) + rank bonus (+50/+20) + difficulty bonus |
| Crew Ranking | Per-crew aggregate stats |
| Live Segment | Real-time PR/KOR comparison during ride (premium) |
| Leaderboard Filters | Gender, age group, crew, period, friends (premium features) |
| Notifications | "Your KOR was beaten!", "New personal best!" |

### M4. Strava & Garmin Integration (Week 21-22)

| Feature | Detail |
|---------|--------|
| Strava OAuth | Connect/disconnect Strava account |
| Strava Activity Sync | Pull activities + streams (GPS data) via Strava API |
| Strava Webhook | Real-time activity push from Strava |
| Garmin Connect IQ | Connect/disconnect Garmin account |
| Garmin Activity Sync | Pull activities via Garmin Health API |
| Post-Sync Processing | Auto segment matching + SSP earning + ranking update |
| Existing Code Reference | `API/api/routes/v1/user/mypage/riding.js` (existing Strava sync) |

### M5. Park Run Event System (Week 23-25)

| Feature | Detail |
|---------|--------|
| Event Types | WB Park Run (5km running, Sat 8am), WB Bike Run (15-30km cycling, Sat 9am), Special Events |
| Event Series | Recurring weekly events with auto-generation |
| Registration | One-tap sign up, volunteer sign up, reminder notifications |
| Check-In | QR code scan + NFC tap |
| GPS Tracking | Auto-start at event time, real-time tracking |
| Live Leaderboard | WebSocket-based real-time rankings during event |
| Completion Detection | GPS-based auto-finish (50m from endpoint) |
| Results | Instant ranking, SNS share card generation |
| Volunteer System | Role matching (marshal, timer, photographer), volunteer SSP rewards |
| Event Statistics | Participation trends, PR tracking, cumulative stats |

### M6. Digital Stamp Tour (Week 25-26)

| Feature | Detail |
|---------|--------|
| Stamp Collection | Digital stamps for completing KTO 60 courses |
| Checkpoint Stamps | Mid-route checkpoint stamps (GPS-triggered) |
| Badge System | Region badges, category badges, grand slam badge |
| Stamp Book UI | Visual collection interface, progress tracking |
| SSP Bonus | Extra SSP for stamp collection milestones |
| KTO Integration | Tourism info, nearby certified restaurants/hotels |

### M7. Crew Hub (Week 27-28)

| Feature | Detail |
|---------|--------|
| Crew Creation | Create running/cycling crew, set rules/description |
| Crew Management | Member invite/approve/remove, roles (leader/admin/member) |
| Crew Events | Crew-specific regular runs, auto-recording |
| Crew vs Crew | Inter-crew weekly/monthly challenges |
| Crew Leaderboard | Aggregate distance, average pace, member rankings |
| Social Feed | Activity sharing, kudos (likes), comments |
| Crew Search | By region, skill level, activity type |

### M8. SSP External Reward Exchange (Week 29-30)

| Feature | Detail |
|---------|--------|
| Exchange Infrastructure | SSP → external reward conversion engine |
| Naver Pay Points | Daou Addcon B2B API (Naver ID instant credit) |
| Kakao Gift Biz | Mobile voucher API (phone number based delivery) |
| Giftishow Biz | KT Alpha API (convenience store/cafe/restaurant coupons) |
| Onnuri Gift Certificate | Corporate purchase portal batch distribution |
| ZeroPay Voucher | BizZeroPay PIN-based voucher |
| Exchange Rate Admin | Admin-configurable exchange rates per reward type |
| Tax Handling | Auto 22% withholding for amounts >50,000 KRW |

## Phase 2 New DB Tables

```
T_SEGMENT             — GPX segment definitions
T_SEGMENT_EFFORT      — Segment completion records
T_SEGMENT_RANKING     — Rankings (KOR/QOR/local legend/season)
T_EVENT               — Park run events
T_EVENT_SERIES        — Recurring event definitions
T_EVENT_PARTICIPANT   — Event registrations + results
T_EVENT_VOLUNTEER     — Volunteer assignments
T_STAMP               — Digital stamp collection
T_STAMP_CHECKPOINT    — Mid-route checkpoint definitions
T_BADGE               — Badge definitions + awards
T_CREW                — Crew/club definitions
T_CREW_MEMBER         — Crew membership
T_CREW_CHALLENGE      — Inter-crew challenges
T_SOCIAL_FEED         — Activity sharing posts
T_SOCIAL_REACTION     — Kudos/likes
T_SOCIAL_COMMENT      — Comments
T_SSP_EXCHANGE        — SSP → external reward transactions
T_SSP_EXCHANGE_RATE   — Exchange rate configuration
```

## Phase 2 Admin Additions

| Module | Key Features |
|--------|-------------|
| Segment Management | GPX import, segment CRUD, map preview, activation |
| Ranking Admin | Season management, ranking reset, anomaly detection |
| Event Management | Event series CRUD, check-in monitoring, results publishing |
| Stamp/Badge Admin | Stamp/badge CRUD, collection progress stats |
| Crew Moderation | Crew approval, reported content review |
| Exchange Management | Exchange rate settings, transaction history, settlement |
| KTO Dashboard | Tourism-specific stats for Korea Tourism Organization reporting |

## Phase 2 Schedule

```
Week 15-16  GPX Segment Management (M1)
├── GPX parser + coordinate cleanup + metadata calc
├── Batch import KTO 60 + National 12
├── Admin segment CRUD
└── Segment data model + API

Week 17-18  GPS Matching Engine (M2)
├── Bounding box + start/end detection
├── Route similarity + time validation
├── Post-activity batch matching
└── Strava sync matching integration

Week 19-20  Ranking System (M3)
├── KOR/QOR + Local Legend
├── Segment leaderboard + season ranking
├── Crew ranking
└── Ranking notifications + badges

Week 21-22  Strava & Garmin Integration (M4)
├── Strava OAuth + activity sync + webhook
├── Garmin Connect IQ + activity sync
├── Post-sync segment matching pipeline
└── GPS riding recording (native, non-Strava)

Week 23-25  Park Run Events (M5)
├── Event types + series + registration
├── QR/NFC check-in + GPS tracking
├── Live leaderboard (WebSocket)
├── Completion detection + results + share cards
└── Volunteer matching system

Week 25-26  Digital Stamp Tour (M6)
├── Stamp/badge data model
├── Checkpoint GPS trigger
├── Stamp book UI
└── KTO tourism info integration

Week 27-28  Crew Hub (M7)
├── Crew CRUD + member management
├── Crew events + challenges
├── Social feed + kudos + comments
└── Crew search + leaderboard

Week 29-30  SSP External Exchange (M8)
├── Naver Pay (Daou Addcon API)
├── Kakao Gift Biz API
├── Giftishow Biz / ZeroPay / Onnuri
└── Exchange rate admin + tax handling
```

---

# PHASE 3: Dark Commerce (깜깜이방) (~12 weeks)

## Scope Summary

Anonymous discount marketplace for excess sports retail inventory. Dealers sell anonymously through Lightbrothers as legal buyer/reseller. Flash sale model.

## Business Model

```
Dealer (Anonymous) → LB (Special Purchase, becomes legal owner) → Consumer
                     LB sells under own brand only
                     Dealer identity NEVER exposed
```

**Commission: 8-20%** depending on product category.
**Break-even: ~₩40M GMV/month (~80 units)**

## Feature List

### Dealer Portal (Week 31-33)

| Feature | Detail |
|---------|--------|
| Dealer Registration | Business info + bank account (no public exposure) |
| Dealer Approval | Admin review + contract signing |
| Dealer Tiers | Bronze (new) → Silver (3mo+10sales) → Gold (6mo+30sales) |
| Product Registration | Photos, condition (NEW/DISPLAY/REFURB), pricing |
| Shipment Notification | Masked consumer info (K**, 010-****-5678) |
| Settlement Dashboard | Earnings tracking, settlement history, monthly stats |
| NDA + Contract | Digital signing within portal |

### Anonymity Architecture (Week 33-34)

| Feature | Detail |
|---------|--------|
| API Response Filtering | Zero dealer info in any consumer-facing API |
| Shipping Label | "Lightbrothers" brand only, LB logistics address |
| CS Routing | All consumer inquiries handled by LB, never forwarded to dealer |
| Notification Filtering | Dealer name/identity stripped from all notifications |
| Access Control | Dealer-product mapping limited to 2-3 admin staff |
| Audit Trail | All dealer info access logged for compliance |

### Flash Sale System (Week 35-36)

| Feature | Detail |
|---------|--------|
| Sale Duration | 48h / 72h / 7d configurable per product |
| Countdown Timer | Real-time JavaScript countdown on product cards |
| Inventory | Typically 1 unit per product (prevents overselling) |
| Status Transitions | Draft → Active → Sold Out / Expired (cron-managed) |
| Upcoming Preview | Blurred product cards (category only, no details) |
| First-Come Purchase | No bidding/auction, fixed price |
| Auto-Cancel | If dealer doesn't ship within deadline |
| Auto-Confirm | 7 days after delivery + no return request |

### Admin Inspection (Week 37-38)

| Feature | Detail |
|---------|--------|
| Product Approval Workflow | Submit → Review → Approve/Reject |
| Photo Review | Multi-image gallery inspection |
| Price Adjustment | Admin can tweak final consumer price |
| Quality Scoring | Per-dealer quality tracking (repeat issues flagged) |
| Category Management | Product category + commission rate management |

### Consumer Experience (Week 39-40)

| Feature | Detail |
|---------|--------|
| Dark Commerce Tab | Dedicated section in app (separate from regular commerce) |
| Flash Sale List | Active sales with countdown timers |
| Product Detail | Photos, condition badge, price (LB brand only) |
| Purchase Flow | Uses existing WB3 payment system (Inicis/PortOne/NaverPay) |
| Order Tracking | Standard tracking (LB as sender) |
| Returns | Defective items only (policy enforced at checkout) |

### Settlement System (Week 40-41)

| Feature | Detail |
|---------|--------|
| Ledger | Double-entry: consumer payment → LB revenue → dealer settlement |
| Settlement Cycle | Bronze: 5 days, Silver: 3 days, Gold: 1 day |
| Accounting Method | Total amount method (총액법): LB revenue = full sale price |
| VAT Chain | Dealer→LB (purchase), LB→Consumer (sale) |
| Tax Invoice | Auto-generated electronic tax invoices |
| Monthly Reporting | Per-dealer sales, commission, settlement reports |

### Existing Commerce WebView → Native (Week 41-42)

| Feature | Detail |
|---------|--------|
| Product Catalog | B2B/B2C product browsing (native Flutter) |
| Product Detail | Image gallery, options, specs, reviews |
| Cart + Checkout | Cart management, address selection, payment |
| Order History | Order list, detail, tracking, cancel/return |
| Wishlist | Save favorite products |
| Search | Full-text search with filters |

## Phase 3 New DB Tables

```
T_DARK_DEALER          — Anonymous dealer profiles
T_DARK_DEALER_CONTRACT — NDA + participation contracts
T_DARK_DEALER_TIER     — Tier progression history
T_DARK_PRODUCT         — Flash sale products
T_DARK_PRODUCT_IMAGE   — Product photos
T_DARK_SALE            — Flash sale definitions (duration, status)
T_DARK_ORDER           — Consumer orders (linked to T_ORDER)
T_DARK_SETTLEMENT      — Dealer settlement ledger
T_DARK_INSPECTION      — Admin inspection records
T_DARK_AUDIT_LOG       — Dealer info access audit trail
```

## Phase 3 Admin Additions

| Module | Key Features |
|--------|-------------|
| Dealer Management | Registration approval, tier management, NDA tracking |
| Product Inspection | Approval workflow, photo review, price adjustment |
| Flash Sale Management | Sale scheduling, status monitoring, auto-expiry config |
| Settlement Admin | Settlement approval, dispute resolution, monthly close |
| Anonymity Audit | Access log review, leak detection alerts |
| Commerce Analytics | GMV, conversion rate, category performance, dealer scoring |

## Phase 3 Schedule

```
Week 31-33  Dealer Portal
├── Dealer registration + approval workflow
├── Dealer tier system (Bronze/Silver/Gold)
├── Product registration form (photos, condition, pricing)
├── Shipment notification (masked consumer info)
└── Settlement dashboard + NDA digital signing

Week 33-34  Anonymity Architecture
├── API response filtering (zero dealer info leak)
├── Shipping label system (LB brand only)
├── CS routing (all inquiries to LB)
├── Notification filtering
└── Access control + audit trail

Week 35-36  Flash Sale System
├── Sale creation (duration, countdown, inventory)
├── Status transitions (cron-managed)
├── Upcoming preview (blurred cards)
├── Auto-cancel + auto-confirm logic
└── Consumer flash sale list + detail UI

Week 37-38  Admin Inspection
├── Product approval workflow
├── Photo review interface
├── Price adjustment authority
├── Quality scoring per dealer
└── Category + commission management

Week 39-40  Consumer Experience + Payment
├── Dark Commerce tab in Flutter app
├── Flash sale browsing UI
├── Purchase flow (existing PG integration)
├── Order tracking (LB as sender)
└── Returns (defective only policy)

Week 41-42  Settlement + Native Commerce
├── Settlement ledger (double-entry)
├── VAT chain + tax invoice auto-generation
├── Dealer monthly reporting
├── Existing commerce WebView → native conversion (basic)
└── Integration testing + launch
```

---

# UNIFIED TIMELINE

```
2026
─────────────────────────────────────────────────────

PHASE 1: 3Way Sensor + Carbon Reduction (14 weeks)
│
├── Week 1-2    Foundation (API+DB+Auth+Flutter)
├── Week 3-4    3Way Sensor (walk/run/cycle detection)
├── Week 5-6    Transport Auto-Detection (Wi-Fi+Geofence)
├── Week 7-8    Carbon Reduction + SSP Engine
├── Week 9-10   Flutter App UI
├── Week 11-13  Admin Panel (full)
└── Week 14     Integration Test + Store Launch
│
▼ Phase 1 Launch ──────────────────────────────────

PHASE 2: Riding + Park Run (16 weeks)
│
├── Week 15-16  GPX Segment Management
├── Week 17-18  GPS Matching Engine
├── Week 19-20  Ranking System (KOR/QOR/Legend/Season)
├── Week 21-22  Strava + Garmin Integration
├── Week 23-25  Park Run Event System
├── Week 25-26  Digital Stamp Tour
├── Week 27-28  Crew Hub (Social)
└── Week 29-30  SSP External Exchange (Naver/Kakao/Onnuri)
│
▼ Phase 2 Launch ──────────────────────────────────

PHASE 3: Dark Commerce (12 weeks)
│
├── Week 31-33  Dealer Portal
├── Week 33-34  Anonymity Architecture
├── Week 35-36  Flash Sale System
├── Week 37-38  Admin Inspection
├── Week 39-40  Consumer Experience + Payment
└── Week 41-42  Settlement + Native Commerce
│
▼ Phase 3 Launch ──────────────────────────────────

Total: 42 weeks (~10.5 months)
Accelerated: 32-36 weeks (~8-9 months) with Claude parallel generation
```

---

# CUMULATIVE METRICS

## Total New DB Tables

| Phase | Tables | Count |
|-------|--------|-------|
| Phase 1 | T_ACTIVITY_RECORD, T_MEMBER_LOCATION, T_CARBON_DAILY, T_SSP_RATE_CONFIG, T_WIFI_SSID_PATTERN, T_EMISSION_FACTOR | 6 |
| Phase 2 | T_SEGMENT, T_SEGMENT_EFFORT, T_SEGMENT_RANKING, T_EVENT, T_EVENT_SERIES, T_EVENT_PARTICIPANT, T_EVENT_VOLUNTEER, T_STAMP, T_STAMP_CHECKPOINT, T_BADGE, T_CREW, T_CREW_MEMBER, T_CREW_CHALLENGE, T_SOCIAL_FEED, T_SOCIAL_REACTION, T_SOCIAL_COMMENT, T_SSP_EXCHANGE, T_SSP_EXCHANGE_RATE | 18 |
| Phase 3 | T_DARK_DEALER, T_DARK_DEALER_CONTRACT, T_DARK_DEALER_TIER, T_DARK_PRODUCT, T_DARK_PRODUCT_IMAGE, T_DARK_SALE, T_DARK_ORDER, T_DARK_SETTLEMENT, T_DARK_INSPECTION, T_DARK_AUDIT_LOG | 10 |
| **Total** | + existing 107 tables | **141 tables** |

## External API Integrations

| Phase | API | Purpose |
|-------|-----|---------|
| 1 | Firebase Auth | Social login |
| 1 | Firebase Cloud Messaging | Push notifications |
| 1 | T-map | Car route distance (carbon baseline) |
| 1 | Kakao Address | Geocoding |
| 2 | Strava | Activity sync + webhook |
| 2 | Garmin | Activity sync |
| 2 | Daou Addcon | Naver Pay Points B2B |
| 2 | Kakao Gift Biz | Mobile voucher delivery |
| 2 | Giftishow Biz | Brand coupon API |
| 2 | BizZeroPay | ZeroPay voucher |
| 2 | Onnuri Biz | Gift certificate purchase |
| 3 | Inicis | PG (payment gateway) |
| 3 | PortOne | PG (payment gateway) |
| 3 | NaverPay | PG (payment gateway) |
| 3 | GoodsFlow | Shipping tracking |

## Admin Panel Growth

| Phase | New Modules |
|-------|------------|
| Phase 1 | Dashboard, Members, SSP Config, Push, Banners, Challenges, Notices |
| Phase 2 | + Segments, Rankings, Events, Stamps/Badges, Crews, Exchange, KTO Dashboard |
| Phase 3 | + Dealers, Inspection, Flash Sales, Settlement, Anonymity Audit, Commerce Analytics |
| **Total** | **20 admin modules** |

## Flutter App Screen Count

| Phase | Screens |
|-------|---------|
| Phase 1 | Home, Activity History, Carbon Dashboard, My Page, Settings, Onboarding (~15 screens) |
| Phase 2 | + Riding, Segments, Rankings, Events, Stamps, Crew, Exchange, Social Feed (~25 screens) |
| Phase 3 | + Flash Sales, Product Detail, Cart, Checkout, Orders, Dealer Portal (~20 screens) |
| **Total** | **~60 screens** |

---

# RISK ASSESSMENT

| Risk | Phase | Severity | Mitigation |
|------|-------|----------|------------|
| Wi-Fi SSID coverage outside Seoul | 1 | Medium | Fallback to simple vehicle popup for non-Seoul |
| T-map API rate limits/costs | 1 | Low | Cache results, recalculate weekly |
| Strava API rate limits | 2 | Medium | Webhook for real-time, batch sync overnight |
| Real-time WebSocket scaling | 2 | Medium | Start with post-activity matching, add live later |
| Park Run event no-shows | 2 | Low | Reminder notifications, no-show tracking |
| Dealer identity leak | 3 | **Critical** | Multi-layer filtering, audit trail, access control |
| Settlement accounting errors | 3 | High | Double-entry ledger, automated reconciliation |
| PG integration complexity | 3 | Medium | Reuse existing WB3 PG contracts and merchant IDs |
| App Store review (Flash Sale) | 3 | Low | Comply with IAP guidelines (physical goods exempt) |

---

# REFERENCES

- Phase 1 Design Spec: `docs/superpowers/specs/2026-03-28-app-renewal-design.md`
- Park Run Business Plan: `parkrun/04_한국형_파크런_사업계획서.md`
- Integrated Feature Spec: `parkrun/06_통합_기능_기획문서.md`
- Strava Segment Research: `parkrun/01_스트라바_구간랭킹_리서치.md`
- KTO Proposal: `parkrun/05_관광공사_자전거파크런_사업제안서.md`
- SSP Exchange Research: `parkrun/07_SSP_포인트교환_종합리서치.md`
- Dark Commerce Business Plan: `darkcommerce/01_사업기획서_깜깜이방.md`
- Dark Commerce Feature Spec: `darkcommerce/03_기능_기획문서.md`
- Dark Commerce Legal Analysis: `darkcommerce/02_법적_회계적_이슈_분석.md`
- Dark Commerce Business Model: `darkcommerce/WB3_깜깜이방_비즈니스모델_분석서.md`
- WB3 Database ERD: `C:/Dev/wrightbrothers/WB3_데이터베이스_ERD.md`
