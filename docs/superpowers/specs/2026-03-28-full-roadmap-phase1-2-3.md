# App Renewal - Full Roadmap: Phase 1 + 2 + 3

**Date:** 2026-03-28
**Project:** Wright Brothers App Renewal
**Author:** CEO + Claude
**Status:** Draft

---

## Executive Summary

Wright Brothers app renewal in 3 phases, preserving existing Aurora MySQL (107 tables).

```
Phase 1: 3Way Sensor + Carbon Reduction          (~14 weeks)
    ↓
Phase 2: Multi-Sport Challenge Platform           (~18 weeks)
         (Running/Cycling/Hiking + extensible)
         (GPX-in → Challenge-out, bidirectional)
    ↓
Phase 3: Dark Commerce (깜깜이방)                  (~12 weeks)
─────────────────────────────────────────────────
Total: ~44 weeks (~11 months)
Accelerated: ~34-38 weeks (~8.5-9.5 months)
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

# PHASE 2: Multi-Sport Challenge Platform (~18 weeks)

## Scope Summary

Multi-sport (running/cycling/hiking + extensible) challenge platform with GPX-driven auto course generation, bidirectional course support, segment ranking, park run events, and SSP external exchange. Any organization (KTO, local government, etc.) can create courses by simply uploading GPX data.

## Core Design Principles

### Principle 1: Multi-Sport Architecture

All features are **sport-agnostic by design**. Sport type is a configurable dimension, not hardcoded logic.

```
T_SPORT_TYPE (extensible sport registry)
├── RUNNING     ← Launch sport
├── CYCLING     ← Launch sport
├── HIKING      ← Launch sport
├── (future) TRAIL_RUNNING
├── (future) SWIMMING
├── (future) KAYAKING
└── (future) any sport with GPS tracking
```

Every course, ranking, event, crew, and challenge is tagged with `sport_type`. Users filter by sport. Leaderboards are per-sport. One GPX course can support multiple sports (e.g., a river path usable for both running and cycling).

### Principle 2: GPX-In → Challenge-Out (One-Click Course Generation)

```
[Any Organization]              [Admin / API]
       │                              │
       └── Upload GPX file ──────────→│
                                      ▼
                              ┌───────────────────┐
                              │  GPX Auto-Pipeline │
                              ├───────────────────┤
                              │ 1. Parse XML       │
                              │ 2. Clean coords    │
                              │ 3. Calc metadata   │
                              │    (distance,      │
                              │     elevation,     │
                              │     difficulty)    │
                              │ 4. Detect loop     │
                              │ 5. Generate reverse│
                              │    course (B→A)    │
                              │ 6. Auto-create     │
                              │    checkpoints     │
                              │ 7. Create challenge│
                              │    with stamps     │
                              └────────┬──────────┘
                                       ▼
                              Course + Challenge + Stamps
                              ready for users instantly
```

**No developer needed.** Admin uploads GPX → system generates everything automatically:
- Forward course (A→B)
- Reverse course (B→A) — auto-generated
- Checkpoints at distance intervals (every 5km default, configurable)
- Digital stamps for each checkpoint
- Challenge definition with completion criteria
- Leaderboard initialized
- Course map preview

### Principle 3: Bidirectional Courses (A→B and B→A)

```
Original GPX: Seoul → Busan (서해안 자전거길, 633km)

System auto-generates TWO courses:
├── Course A: Seoul → Busan (정방향)
│   Checkpoints: Seoul → Incheon → Gunsan → Mokpo → ... → Busan
│
└── Course B: Busan → Seoul (역방향, auto-reversed)
    Checkpoints: Busan → ... → Mokpo → Gunsan → Incheon → Seoul

Both directions:
✅ Count as challenge completion
✅ Have separate leaderboards (conditions differ: wind, elevation profile)
✅ Earn same SSP rewards
✅ Collect same stamps (checkpoint order reversed)
```

**Loop courses** (start == end, e.g., 한강 순환): Clockwise and counter-clockwise both count. System detects loop automatically and creates single bidirectional course.

### Principle 4: Multi-Client Organization Support

```
T_ORGANIZATION (course providers)
├── KTO (한국관광공사) → 60 courses
├── Seoul City (서울시) → N courses
├── Gangwon Province (강원도) → N courses
├── Jeju Tourism (제주관광공사) → N courses
├── National Parks (국립공원관리공단) → hiking trails
├── Any local government → GPX upload → instant courses
└── User-created (community) → admin moderation
```

Each organization gets:
- Own dashboard (their courses' stats)
- Branded stamp collection ("서울시 코스 전체 완주" badge)
- API access for GPX batch upload
- ESG/carbon reduction reporting for their courses

## Feature List

### M1. Multi-Sport GPX Course Engine (Week 15-17)

| Feature | Detail |
|---------|--------|
| **Sport Type Registry** | Extensible sport types: RUNNING, CYCLING, HIKING + future sports. Per-sport speed limits, difficulty calc, SSP rates |
| **GPX Auto-Pipeline** | Upload GPX → auto-generate course with all metadata, no manual input required |
| GPX Parser | XML parsing → coordinate extraction (trkpt lat/lon/ele) |
| Coordinate Cleanup | Noise removal + Douglas-Peucker simplification |
| Metadata Auto-Calc | Haversine distance, elevation gain/loss, estimated difficulty (per sport) |
| **Loop Detection** | Start-end distance <500m → loop course, single bidirectional entry |
| **Auto Reverse Course** | Non-loop: auto-generate B→A version with reversed checkpoints |
| **Auto Checkpoints** | Generate checkpoints at configurable intervals (default: every 5km running, 10km cycling, 3km hiking) |
| **Auto Challenge Creation** | Each course auto-creates challenge definition + stamp collection |
| **Organization System** | T_ORGANIZATION: KTO, local governments, national parks, community |
| Organization Dashboard | Per-org course stats, user counts, carbon reduction |
| **Batch GPX API** | REST endpoint for organizations to upload GPX programmatically |
| Admin Course CRUD | Manual override, edit, activate/deactivate |
| Course Categories | 8 types: city, sea, island, river, mountain, challenge, history, healing |
| **Multi-Sport per Course** | One GPX path can be tagged for multiple sports (e.g., river path: running + cycling) |

### M2. Bidirectional GPS Matching Engine (Week 18-19)

| Feature | Detail |
|---------|--------|
| Bounding Box Filter | Narrow candidates from 10,000s to 10s |
| **Direction Detection** | Determine if user is going A→B or B→A based on first 3 checkpoints |
| Start Point Detection | GPS within 50m of segment start OR end → candidate (bidirectional) |
| Route Similarity | Checkpoint validation (80% threshold), works in either direction |
| End Point Detection | GPS within 50m of opposite endpoint → completion confirmed |
| **Per-Sport Speed Validation** | Running: 3-25 km/h, Cycling: 8-60 km/h, Hiking: 1-8 km/h |
| **Per-Sport Stop Filter** | Running: >30min stop = invalid, Hiking: >2hr stop = invalid (rest is normal) |
| Post-Activity Matching | Batch matching after activity upload |
| Real-Time Matching | Live segment during activity via GPS streaming (premium) |
| Strava/Garmin Sync Matching | Match from imported activities |

### M3. Multi-Sport Ranking System (Week 20-21)

| Feature | Detail |
|---------|--------|
| **Per-Sport Leaderboards** | Separate rankings for running, cycling, hiking per course |
| **Per-Direction Leaderboards** | A→B and B→A have separate leaderboards (different conditions) |
| KOR/QOR (Course King/Queen) | Per-course, per-sport, per-direction male/female fastest |
| Local Legend | 90-day rolling window, most completions (either direction counts) |
| Season Ranking | Quarterly points: base (100) + rank bonus + difficulty bonus |
| Crew Ranking | Per-crew, per-sport aggregate stats |
| **Cross-Sport Champion** | Users active in 2+ sports get multi-sport badges |
| Live Segment | Real-time PR/KOR comparison during activity (premium) |
| Leaderboard Filters | Gender, age group, crew, period, sport, direction |
| Notifications | "Your KOR was beaten!", "New personal best!" |

### M4. Strava & Garmin Integration (Week 22-23)

| Feature | Detail |
|---------|--------|
| Strava OAuth | Connect/disconnect Strava account |
| Strava Activity Sync | Pull activities + streams (GPS data) via Strava API |
| Strava Webhook | Real-time activity push from Strava |
| Garmin Connect IQ | Connect/disconnect Garmin account |
| Garmin Activity Sync | Pull activities via Garmin Health API |
| **Sport Type Mapping** | Strava/Garmin activity types → WB sport types auto-mapping |
| Post-Sync Processing | Auto course matching + SSP earning + ranking update |
| **Native GPS Recording** | WB app native recording for all 3 sports (non-Strava/Garmin users) |

### M5. Multi-Sport Event System (Week 24-26)

| Feature | Detail |
|---------|--------|
| **Event Types per Sport** | WB Park Run (5km running), WB Bike Run (15-30km cycling), WB Hike (5-15km hiking), Special Events |
| Event Series | Recurring weekly events with auto-generation |
| **Multi-Sport Events** | Single event can include multiple sports (e.g., mini triathlon) |
| Registration | One-tap sign up, volunteer sign up, reminders |
| Check-In | QR code scan + NFC tap |
| GPS Tracking | Auto-start, real-time tracking |
| Live Leaderboard | WebSocket-based, per-sport real-time rankings |
| **Bidirectional Events** | Circular course events: participants choose direction |
| Completion Detection | GPS-based auto-finish (50m from endpoint, either direction) |
| Results | Instant ranking, SNS share card, per-sport results |
| Volunteer System | Role matching, volunteer SSP rewards |

### M6. Digital Stamp Tour + Challenge System (Week 26-27)

| Feature | Detail |
|---------|--------|
| **GPX-Auto Stamps** | Uploaded GPX auto-generates stamp checkpoints (no manual setup) |
| **Bidirectional Stamps** | Stamps collectible in either direction (A→B or B→A) |
| **Organization Stamp Books** | Per-org collections ("관광공사 60선 완주", "제주도 전체 코스") |
| **Grand Slam Badges** | Complete all courses in a region/org/sport → special badge |
| **Cross-Sport Badges** | Complete same course in 2+ sports → multi-sport badge |
| Checkpoint GPS Trigger | Auto-stamp when passing within 100m of checkpoint |
| Stamp Book UI | Visual collection, progress per org/region/sport |
| SSP Milestone Bonus | Extra SSP at collection milestones (10/25/50/100 stamps) |
| Tourism Integration | Nearby restaurants/hotels/attractions at each checkpoint |

### M7. Crew Hub (Week 28-29)

| Feature | Detail |
|---------|--------|
| **Multi-Sport Crews** | Crews tagged with sport types (running crew, cycling crew, multi-sport) |
| Crew Creation | Create crew, set rules/description/sport focus |
| Crew Management | Member invite/approve/remove, roles (leader/admin/member) |
| Crew Events | Crew-specific regular runs/rides/hikes, auto-recording |
| Crew vs Crew | Inter-crew challenges (per sport or cross-sport) |
| Crew Leaderboard | Aggregate distance, per sport, member rankings |
| Social Feed | Activity sharing, kudos, comments |
| Crew Search | By region, sport, skill level |

### M8. SSP External Reward Exchange (Week 30-32)

| Feature | Detail |
|---------|--------|
| Exchange Infrastructure | SSP → external reward conversion engine |
| Naver Pay Points | Daou Addcon B2B API (Naver ID instant credit) |
| Kakao Gift Biz | Mobile voucher API (phone number based delivery) |
| Giftishow Biz | KT Alpha API (convenience store/cafe/restaurant coupons) |
| Onnuri Gift Certificate | Corporate purchase portal batch distribution |
| ZeroPay Voucher | BizZeroPay PIN-based voucher |
| Exchange Rate Admin | Admin-configurable per reward type |
| Tax Handling | Auto 22% withholding for amounts >50,000 KRW |

## Phase 2 Core Data Model

```sql
-- Sport type registry (extensible)
T_SPORT_TYPE (
  IDX, CODE varchar(20), NAME, ICON,
  MIN_SPEED_KMH, MAX_SPEED_KMH,
  MAX_STOP_MINUTES, DEFAULT_CHECKPOINT_INTERVAL_KM,
  SSP_RATE_PER_KM, IS_ACTIVE, SORT_ORDER
)
-- Launch data: RUNNING, CYCLING, HIKING

-- Organization (course providers)
T_ORGANIZATION (
  IDX, NAME, TYPE enum('GOVERNMENT','TOURISM','NATIONAL_PARK','COMMUNITY'),
  LOGO_URL, CONTACT_EMAIL, API_KEY,
  IS_ACTIVE, REG_DATE, MOD_DATE
)

-- Course (auto-generated from GPX)
T_COURSE (
  IDX, ORGANIZATION_IDX, NAME, DESCRIPTION,
  CATEGORY enum('CITY','SEA','ISLAND','RIVER','MOUNTAIN','CHALLENGE','HISTORY','HEALING'),
  REGION varchar(50),
  DISTANCE_KM, ELEVATION_GAIN_M, ELEVATION_LOSS_M,
  DIFFICULTY int(1-5),
  IS_LOOP boolean,
  DIRECTION enum('FORWARD','REVERSE','BIDIRECTIONAL'),
  PARENT_COURSE_IDX int NULL,  -- reverse course points to original
  GPX_DATA json,               -- original GPX
  POLYLINE text,               -- simplified for map display
  START_LAT, START_LON, END_LAT, END_LON,
  IS_ACTIVE, REG_DATE, MOD_DATE
)

-- Course ↔ Sport mapping (many-to-many)
T_COURSE_SPORT (
  IDX, COURSE_IDX, SPORT_TYPE_IDX,
  CUSTOM_DIFFICULTY int NULL,  -- sport-specific difficulty override
  CUSTOM_SSP_RATE decimal NULL
)

-- Auto-generated checkpoints
T_COURSE_CHECKPOINT (
  IDX, COURSE_IDX, SEQUENCE_NO,
  NAME varchar(100),           -- auto: "Checkpoint 1 (5km)"
  LATITUDE, LONGITUDE,
  DISTANCE_FROM_START_KM,
  RADIUS_M int default 100,
  HAS_STAMP boolean default true,
  TOURISM_INFO json NULL       -- nearby attractions
)

-- Course completion records
T_COURSE_EFFORT (
  IDX, COURSE_IDX, SPORT_TYPE_IDX, MEMBER_IDX,
  DIRECTION enum('FORWARD','REVERSE'),
  SOURCE enum('WB_APP','STRAVA','GARMIN'),
  START_TIME, END_TIME, ELAPSED_SEC, MOVING_SEC,
  AVG_SPEED_KMH, MAX_SPEED_KMH, AVG_HEART_RATE,
  IS_PERSONAL_BEST, RANK_AT_TIME,
  SSP_EARNED, CARBON_REDUCED_KG,
  CHECKPOINTS_PASSED json,    -- which checkpoints hit
  IS_VALID, GPS_DATA json,
  WEATHER json NULL,
  REG_DATE
)

-- Rankings (per course × sport × direction)
T_COURSE_RANKING (
  IDX, COURSE_IDX, SPORT_TYPE_IDX,
  DIRECTION enum('FORWARD','REVERSE'),
  RANKING_TYPE enum('KOR','QOR','LOCAL_LEGEND','SEASON'),
  MEMBER_IDX, RANK int,
  BEST_EFFORT_IDX, BEST_ELAPSED_SEC,
  EFFORT_COUNT_90D int,       -- for local legend
  SEASON_POINTS int,          -- for season ranking
  SEASON_ID varchar(10),
  UPDATED_AT,
  UNIQUE(COURSE_IDX, SPORT_TYPE_IDX, DIRECTION, RANKING_TYPE, MEMBER_IDX, SEASON_ID)
)

-- Events (multi-sport)
T_EVENT (
  IDX, COURSE_IDX, SPORT_TYPE_IDX,
  EVENT_SERIES_IDX, EVENT_NUMBER,
  TITLE, EVENT_TYPE enum('PARKRUN','BIKERUN','HIKE','SPECIAL'),
  EVENT_DATE, START_TIME, MAX_PARTICIPANTS,
  ALLOW_REVERSE boolean default true,
  STATUS enum('DRAFT','OPEN','ONGOING','COMPLETED','CANCELLED'),
  REG_DATE, MOD_DATE
)

T_EVENT_SERIES        — Recurring event definitions
T_EVENT_PARTICIPANT   — Registrations + results + direction chosen
T_EVENT_VOLUNTEER     — Volunteer assignments

-- Stamps & Badges
T_STAMP_COLLECTION (
  IDX, MEMBER_IDX, COURSE_IDX, CHECKPOINT_IDX,
  DIRECTION enum('FORWARD','REVERSE'),
  EFFORT_IDX,
  COLLECTED_AT
)

T_BADGE (
  IDX, NAME, DESCRIPTION, ICON_URL,
  BADGE_TYPE enum('COURSE','REGION','ORG','SPORT','CROSS_SPORT','GRAND_SLAM','MILESTONE'),
  CRITERIA json,              -- auto-evaluated: {"org": "KTO", "complete_all": true}
  SPORT_TYPE_IDX NULL,
  ORGANIZATION_IDX NULL
)

T_BADGE_AWARD (IDX, MEMBER_IDX, BADGE_IDX, AWARDED_AT)

-- Crews (multi-sport)
T_CREW (
  IDX, NAME, DESCRIPTION, LOGO_URL,
  PRIMARY_SPORT_IDX, IS_MULTI_SPORT boolean,
  REGION, MAX_MEMBERS, IS_PUBLIC,
  REG_DATE, MOD_DATE
)

T_CREW_MEMBER, T_CREW_CHALLENGE

-- Social
T_SOCIAL_FEED, T_SOCIAL_REACTION, T_SOCIAL_COMMENT

-- SSP Exchange
T_SSP_EXCHANGE, T_SSP_EXCHANGE_RATE
```

## Phase 2 Admin Additions

| Module | Key Features |
|--------|-------------|
| **Sport Management** | Sport type CRUD, per-sport speed/SSP/difficulty config |
| **Organization Management** | Org registration, API key issuance, per-org dashboard |
| **Course Management** | GPX upload → auto-generation, batch import, course CRUD, map preview |
| **Bidirectional Preview** | View both A→B and B→A courses on map |
| Ranking Admin | Season management, ranking reset, anomaly detection, per-sport/direction |
| Event Management | Multi-sport event CRUD, check-in monitoring, results |
| Stamp/Badge Admin | Auto-generated stamp review, badge CRUD, collection stats |
| Crew Moderation | Crew approval, reported content review |
| Exchange Management | Exchange rate settings, transaction history, settlement |
| **Organization Portal** | Per-org login, their courses' stats, GPX upload, ESG reports |

## Phase 2 Schedule

```
Week 15-17  Multi-Sport GPX Course Engine (M1) — 3 weeks
├── Sport type registry + extensible architecture
├── GPX auto-pipeline (parse → clean → metadata → checkpoints → challenge)
├── Auto reverse course generation (B→A)
├── Loop detection + bidirectional handling
├── Organization system + batch GPX API
├── Admin course CRUD + map preview
└── Multi-sport per course tagging

Week 18-19  Bidirectional GPS Matching Engine (M2) — 2 weeks
├── Direction detection (A→B vs B→A from first 3 checkpoints)
├── Bidirectional start/end detection (either endpoint = valid start)
├── Route similarity + per-sport speed/stop validation
├── Post-activity batch matching + Strava sync matching
└── Real-time matching (premium)

Week 20-21  Multi-Sport Ranking System (M3) — 2 weeks
├── Per-sport + per-direction leaderboards
├── KOR/QOR + Local Legend + Season Ranking
├── Cross-sport champion badges
├── Crew ranking + notifications
└── Leaderboard filters (sport, direction, gender, age, crew)

Week 22-23  Strava & Garmin Integration (M4) — 2 weeks
├── Strava OAuth + activity sync + webhook
├── Garmin Connect IQ + activity sync
├── Sport type mapping (Strava/Garmin → WB types)
├── Native GPS recording for all 3 sports
└── Post-sync course matching pipeline

Week 24-26  Multi-Sport Event System (M5) — 3 weeks
├── Event types: Park Run / Bike Run / Hike / Special / Multi-Sport
├── Bidirectional events (participants choose direction)
├── QR/NFC check-in + GPS tracking
├── Live leaderboard (WebSocket, per-sport)
├── Completion detection (either direction) + results + share cards
└── Volunteer matching system

Week 26-27  Stamp Tour + Challenge System (M6) — 2 weeks
├── GPX-auto stamp generation (no manual setup)
├── Bidirectional stamp collection
├── Organization stamp books + grand slam badges
├── Cross-sport badges
└── Tourism info integration at checkpoints

Week 28-29  Crew Hub (M7) — 2 weeks
├── Multi-sport crews + crew CRUD
├── Crew events + inter-crew challenges (per sport or cross-sport)
├── Social feed + kudos + comments
└── Crew search + leaderboard

Week 30-32  SSP External Exchange (M8) — 3 weeks
├── Naver Pay (Daou Addcon API)
├── Kakao Gift Biz API
├── Giftishow Biz / ZeroPay / Onnuri
├── Exchange rate admin + tax handling
└── Integration testing + Phase 2 launch
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

### Dealer Portal (Week 33-35)

| Feature | Detail |
|---------|--------|
| Dealer Registration | Business info + bank account (no public exposure) |
| Dealer Approval | Admin review + contract signing |
| Dealer Tiers | Bronze (new) → Silver (3mo+10sales) → Gold (6mo+30sales) |
| Product Registration | Photos, condition (NEW/DISPLAY/REFURB), pricing |
| Shipment Notification | Masked consumer info (K**, 010-****-5678) |
| Settlement Dashboard | Earnings tracking, settlement history, monthly stats |
| NDA + Contract | Digital signing within portal |

### Anonymity Architecture (Week 35-36)

| Feature | Detail |
|---------|--------|
| API Response Filtering | Zero dealer info in any consumer-facing API |
| Shipping Label | "Lightbrothers" brand only, LB logistics address |
| CS Routing | All consumer inquiries handled by LB, never forwarded to dealer |
| Notification Filtering | Dealer name/identity stripped from all notifications |
| Access Control | Dealer-product mapping limited to 2-3 admin staff |
| Audit Trail | All dealer info access logged for compliance |

### Flash Sale System (Week 37-38)

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

### Admin Inspection (Week 39-40)

| Feature | Detail |
|---------|--------|
| Product Approval Workflow | Submit → Review → Approve/Reject |
| Photo Review | Multi-image gallery inspection |
| Price Adjustment | Admin can tweak final consumer price |
| Quality Scoring | Per-dealer quality tracking (repeat issues flagged) |
| Category Management | Product category + commission rate management |

### Consumer Experience (Week 41-42)

| Feature | Detail |
|---------|--------|
| Dark Commerce Tab | Dedicated section in app (separate from regular commerce) |
| Flash Sale List | Active sales with countdown timers |
| Product Detail | Photos, condition badge, price (LB brand only) |
| Purchase Flow | Uses existing WB3 payment system (Inicis/PortOne/NaverPay) |
| Order Tracking | Standard tracking (LB as sender) |
| Returns | Defective items only (policy enforced at checkout) |

### Settlement System (Week 42-43)

| Feature | Detail |
|---------|--------|
| Ledger | Double-entry: consumer payment → LB revenue → dealer settlement |
| Settlement Cycle | Bronze: 5 days, Silver: 3 days, Gold: 1 day |
| Accounting Method | Total amount method (총액법): LB revenue = full sale price |
| VAT Chain | Dealer→LB (purchase), LB→Consumer (sale) |
| Tax Invoice | Auto-generated electronic tax invoices |
| Monthly Reporting | Per-dealer sales, commission, settlement reports |

### Existing Commerce WebView → Native (Week 43-44)

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
Week 33-35  Dealer Portal
├── Dealer registration + approval workflow
├── Dealer tier system (Bronze/Silver/Gold)
├── Product registration form (photos, condition, pricing)
├── Shipment notification (masked consumer info)
└── Settlement dashboard + NDA digital signing

Week 35-36  Anonymity Architecture
├── API response filtering (zero dealer info leak)
├── Shipping label system (LB brand only)
├── CS routing (all inquiries to LB)
├── Notification filtering
└── Access control + audit trail

Week 37-38  Flash Sale System
├── Sale creation (duration, countdown, inventory)
├── Status transitions (cron-managed)
├── Upcoming preview (blurred cards)
├── Auto-cancel + auto-confirm logic
└── Consumer flash sale list + detail UI

Week 39-40  Admin Inspection
├── Product approval workflow
├── Photo review interface
├── Price adjustment authority
├── Quality scoring per dealer
└── Category + commission management

Week 41-42  Consumer Experience + Payment
├── Dark Commerce tab in Flutter app
├── Flash sale browsing UI
├── Purchase flow (existing PG integration)
├── Order tracking (LB as sender)
└── Returns (defective only policy)

Week 43-44  Settlement + Native Commerce
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

PHASE 2: Multi-Sport Challenge Platform (18 weeks)
│
├── Week 15-17  Multi-Sport GPX Course Engine
│               (sport registry, GPX auto-pipeline, reverse course, org system)
├── Week 18-19  Bidirectional GPS Matching Engine
├── Week 20-21  Multi-Sport Ranking System (KOR/QOR/Legend/Season)
├── Week 22-23  Strava + Garmin Integration
├── Week 24-26  Multi-Sport Event System (ParkRun/BikeRun/Hike)
├── Week 26-27  Stamp Tour + Challenge System
├── Week 28-29  Crew Hub (Multi-Sport)
└── Week 30-32  SSP External Exchange (Naver/Kakao/Onnuri/ZeroPay)
│
▼ Phase 2 Launch ──────────────────────────────────

PHASE 3: Dark Commerce (12 weeks)
│
├── Week 33-35  Dealer Portal
├── Week 35-36  Anonymity Architecture
├── Week 37-38  Flash Sale System
├── Week 39-40  Admin Inspection
├── Week 41-42  Consumer Experience + Payment
└── Week 43-44  Settlement + Native Commerce
│
▼ Phase 3 Launch ──────────────────────────────────

Total: 44 weeks (~11 months)
Accelerated: 34-38 weeks (~8.5-9.5 months) with Claude parallel generation
```

---

# CUMULATIVE METRICS

## Total New DB Tables

| Phase | Tables | Count |
|-------|--------|-------|
| Phase 1 | T_ACTIVITY_RECORD, T_MEMBER_LOCATION, T_CARBON_DAILY, T_SSP_RATE_CONFIG, T_WIFI_SSID_PATTERN, T_EMISSION_FACTOR | 6 |
| Phase 2 | T_SPORT_TYPE, T_ORGANIZATION, T_COURSE, T_COURSE_SPORT, T_COURSE_CHECKPOINT, T_COURSE_EFFORT, T_COURSE_RANKING, T_EVENT, T_EVENT_SERIES, T_EVENT_PARTICIPANT, T_EVENT_VOLUNTEER, T_STAMP_COLLECTION, T_BADGE, T_BADGE_AWARD, T_CREW, T_CREW_MEMBER, T_CREW_CHALLENGE, T_SOCIAL_FEED, T_SOCIAL_REACTION, T_SOCIAL_COMMENT, T_SSP_EXCHANGE, T_SSP_EXCHANGE_RATE | 22 |
| Phase 3 | T_DARK_DEALER, T_DARK_DEALER_CONTRACT, T_DARK_DEALER_TIER, T_DARK_PRODUCT, T_DARK_PRODUCT_IMAGE, T_DARK_SALE, T_DARK_ORDER, T_DARK_SETTLEMENT, T_DARK_INSPECTION, T_DARK_AUDIT_LOG | 10 |
| **Total** | + existing 107 tables | **145 tables** |

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
| Phase 2 | + Sports, Organizations, Courses (bidirectional), Rankings, Events, Stamps/Badges, Crews, Exchange, Org Portal |
| Phase 3 | + Dealers, Inspection, Flash Sales, Settlement, Anonymity Audit, Commerce Analytics |
| **Total** | **23 admin modules** |

## Flutter App Screen Count

| Phase | Screens |
|-------|---------|
| Phase 1 | Home, Activity History, Carbon Dashboard, My Page, Settings, Onboarding (~15 screens) |
| Phase 2 | + Riding (3 sports), Courses (bidirectional), Rankings, Events, Stamps, Crew, Exchange, Social Feed (~30 screens) |
| Phase 3 | + Flash Sales, Product Detail, Cart, Checkout, Orders, Dealer Portal (~20 screens) |
| **Total** | **~65 screens** |

---

# RISK ASSESSMENT

| Risk | Phase | Severity | Mitigation |
|------|-------|----------|------------|
| Wi-Fi SSID coverage outside Seoul | 1 | Medium | Fallback to simple vehicle popup for non-Seoul |
| T-map API rate limits/costs | 1 | Low | Cache results, recalculate weekly |
| Strava API rate limits | 2 | Medium | Webhook for real-time, batch sync overnight |
| Bidirectional matching accuracy | 2 | Medium | Direction detection from first 3 checkpoints, fallback to full-route analysis |
| Hiking GPS accuracy (dense forest) | 2 | Medium | Wider checkpoint radius (150m vs 100m), altitude validation |
| Multi-sport leaderboard complexity | 2 | Low | Clean per-sport/per-direction separation, no cross-contamination |
| GPX data quality from orgs | 2 | Medium | Auto-cleanup pipeline, admin review flag for low-quality imports |
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
