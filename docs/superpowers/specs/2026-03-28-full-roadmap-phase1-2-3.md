# App Renewal - Full Roadmap: Phase 1 + 2 + 3 + 4

**Date:** 2026-03-28
**Project:** Wright Brothers App Renewal
**Author:** CEO + Claude
**Status:** Draft

---

## Executive Summary

Wright Brothers app renewal in 4 phases, preserving existing Aurora MySQL (107 tables).

```
Pre-Dev: BRD + PRD + Screen Planning + Design System     (~3 weeks)
    ↓
Phase 1: 3Way Sensor + Carbon Reduction                  (~14 weeks)
    ↓
Phase 2: Multi-Sport Challenge Platform                  (~18 weeks)
         (Running/Cycling/Hiking + extensible)
         (GPX-in → Challenge-out, bidirectional)
    ↓
Phase 3: Dark Commerce + Smart Commerce                  (~18 weeks)
         (Ops automation, AI product desc, Smart Store import)
    ↓
Phase 4: Carbon Token Securities (STO) + Global Expansion (~20 weeks)
         (Korea STO + Overseas blockchain, two-track strategy)
───────────────────────────────────────────────────────
Total: ~73 weeks (~18 months)
Accelerated: ~56-62 weeks (~14-15.5 months)
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
| Auth | Firebase Auth (Google/Apple/Kakao, 3 providers — foreign user support) |
| i18n | flutter_localizations + intl (KO/EN (JA/ZH later)) |
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
| **MRV: Driver License API** | 도로교통공단 자동검증 — license type, validity, acquired date |
| **MRV: Vehicle Ownership** | CODEF API — 자동차등록원부(소유이력), 보험다모아(경력), 하이패스 |
| **MRV: Document OCR** | Claude Vision API (Haiku) — insurance cert, lease/rental contract, employment cert auto-OCR |
| **MRV: 3-Tier Verification** | Tier1 auto (API only) / Tier2 semi-auto (API+OCR) / Tier3 behavior-based |
| **MRV: Verification UI** | Vehicle type selection, document upload, OCR result, admin review queue |
| **AdMob Rewarded Video** | google_mobile_ads Flutter SDK, "watch ad for 2x SSP" after activity |
| **Offerwall (AdiSON)** | Mission Center tab, AdiSON partner center SDK, postback callback API |
| **Banner Ads** | Kakao AdFit or AdMob banner on dashboard bottom |

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

# PHASE 3: Dual Commerce (Normal Shop + Dark Room) + Smart Commerce (~18 weeks)

## Scope Summary

Two-channel commerce platform + fully automated operations:

1. **Normal Shop** (일반샵): Full-price products, partner name visible, open to all users
2. **Dark Room** (깜깜이방): Discounted products, partner anonymous, **Phase 1 active user + SSP entry ticket required**
3. **Operations Automation**: Order/settlement notifications + tax invoice auto-issuance
4. **AI Product Description Generator**: Model name → auto-generate product pages
5. **Smart Store Auto-Import**: Partner Smart Store → auto-import → set qty/price only

## Design Principle: Dual-Channel Commerce

```
┌─────────────────────────────────────────────────────────────┐
│  Partner registers product                                    │
│    ↓                                                         │
│  Choose channel:                                              │
│  ├── [일반샵] Normal Shop                                     │
│  │   ├── Full price                                          │
│  │   ├── Partner name visible                                │
│  │   ├── Standard commission (5-8%)                          │
│  │   └── Accessible by ALL users                             │
│  │                                                           │
│  └── [깜깜이방] Dark Room                                     │
│      ├── Discounted price (excess inventory, old stock)       │
│      ├── Partner ANONYMOUS (LB brand only)                    │
│      ├── Higher commission (8-20%)                            │
│      └── Access: Phase 1 active + SSP entry ticket (500/month)│
└─────────────────────────────────────────────────────────────┘
```

### Dark Room Entry System (SSP 입장권)

```
[User taps "깜깜이방" tab]
    ↓
Check 1: Phase 1 active? (activity record within last 7 days)
  NO → "3Way Sensor를 활성화하고 활동을 기록해주세요"
  YES ↓

Check 2: Monthly entry ticket purchased?
  NO → "입장권 구매: 500 SSP (교환 가능 SSP만 사용)"
       [구매하기] ← AD/SHOP SSP only, CARBON SSP blocked
  YES ↓

[Dark Room products visible]
  Flash sale items with countdown timers
  Anonymous seller (LB brand)
  Discounted prices
```

**Entry Ticket Economics:**
- 500 AD/SHOP SSP = user watched ~50 rewarded videos or completed offerwall missions
- WB revenue from those ads: ~₩1,000
- Entry ticket SSP cost to WB: ₩0 (already funded by ad revenue)
- Dark Room purchase commission: 8-20% additional revenue
- **Net result: every Dark Room user generates ad revenue BEFORE buying anything**

### Multi-Sport Category Structure (Normal Shop + Dark Room shared)

```
Filter 1: Sport (tab/chip) — same for both channels
  [All] [🚴Cycling] [🏃Running] [🏔Hiking] [⛺Camping] [🏊Swimming] [⛷Ski] [+More]

Filter 2: Category (dynamic based on sport selection)
  Cycling → [Complete Bike] [Parts] [Accessories] [Apparel]
  Running → [Shoes] [Apparel] [GPS Watch] [Accessories]
  Hiking  → [Boots] [Backpack] [Apparel] [Gear]
  Camping → [Tent] [Sleeping] [Cooking] [Lighting]

Filter 3: Detail filters (sidebar/modal)
  ├── Price range slider
  ├── Brand multi-select
  ├── Condition: New / Display / Refurb (Dark Room only)
  └── Sort: Popular / Price / Newest
```

**Cross-Sport Tagging:** One product can appear in multiple sport tabs
- "Garmin Fenix 8 GPS Watch" → Running + Cycling + Hiking + Swimming
- "Gore-Tex Windbreaker" → Running + Hiking + Cycling + Camping

**Future Category Expansion (DB ready, not activated at launch):**

| Category Type | Phase 3 Launch | Post-stabilization | Phase 5+ |
|--------------|---------------|-------------------|----------|
| **SPORT** | ✅ Active | ✅ | ✅ |
| **TECH** (laptop, phone) | ❌ DB ready only | ✅ Dark Room only | ✅ Both |
| **LIFE** (home, fashion) | ❌ DB ready only | ❌ | ✅ Dark Room first |

Strategy: Sports-only at launch (category killer like Musinsa). Non-sport categories via Dark Room first (anonymous = less brand identity conflict), then expand to Normal Shop if proven.

## Design Principle: Zero-Ops Commerce

## Design Principle: Zero-Ops Commerce

```
BEFORE (Current WB3 — heavy manual labor):
┌─────────────────────────────────────────────────────────────┐
│  Order received                                              │
│    → Staff manually sends KakaoTalk to partner               │
│    → Staff manually sends order details via email             │
│    → Staff manually tracks shipping                          │
│    → Staff manually calculates settlement                    │
│    → Staff manually issues tax invoice via 홈택스             │
│    → Staff manually creates product pages (photos + specs)   │
│                                                              │
│  Result: 1-2 full-time staff needed for ~100 orders/month    │
└─────────────────────────────────────────────────────────────┘

AFTER (Renewed — fully automated):
┌─────────────────────────────────────────────────────────────┐
│  Order received                                              │
│    → Auto KakaoTalk alert to partner (order details)         │
│    → Auto email with packing slip                            │
│    → Auto shipping tracking (GoodsFlow webhook)              │
│    → Auto settlement calculation (cron, per tier cycle)      │
│    → Auto tax invoice via 국세청 홈택스 API                    │
│    → Auto settlement complete notification                   │
│                                                              │
│  Product registration:                                       │
│    → Connect partner Smart Store → auto-import products      │
│    → AI generates product description from model name        │
│    → Partner only sets qty + price → publish                 │
│                                                              │
│  Result: 0 staff needed for operations                       │
└─────────────────────────────────────────────────────────────┘
```

## Business Model

```
Dealer (Anonymous) → LB (Special Purchase, becomes legal owner) → Consumer
                     LB sells under own brand only
                     Dealer identity NEVER exposed
```

**Commission: 8-20%** depending on product category.
**Break-even: ~₩40M GMV/month (~80 units)**

## Feature List

### M1. Dealer Portal + Smart Store Import (Week 33-35)

| Feature | Detail |
|---------|--------|
| Dealer Registration | Business info + bank account (no public exposure) |
| Dealer Approval | Admin review + contract signing |
| Dealer Tiers | Bronze (new) → Silver (3mo+10sales) → Gold (6mo+30sales) |
| NDA + Contract | Digital signing within portal |
| **Smart Store Connection** | Partner connects their Naver Smart Store via Commerce API |
| **Product Auto-Import** | Pull product catalog from partner's Smart Store (name, photos, specs, options) |
| **Simplified Registration** | Auto-imported product → partner only inputs: qty, LB price, condition → publish |
| Manual Product Registration | For partners without Smart Store: photos, condition, pricing |
| Shipment Notification | Masked consumer info (K**, 010-****-5678) |
| Settlement Dashboard | Earnings tracking, settlement history, monthly stats |

#### Smart Store Auto-Import Flow

```
1. Partner enters Smart Store URL or Store ID
     ↓
2. System connects via Naver Commerce API (상품 조회)
     ↓
3. Pull all products:
   ├── Product name, brand, model number
   ├── Product images (all)
   ├── Product description HTML
   ├── Options (size, color, etc.)
   ├── Specs/attributes
   └── Category mapping
     ↓
4. Display imported products in partner dashboard
     ↓
5. Partner selects which to list on LB:
   ├── Set LB selling price (can differ from Smart Store)
   ├── Set available quantity
   ├── Set condition (NEW/DISPLAY/REFURB)
   └── Confirm → auto-create LB product listing
     ↓
6. Periodic sync (daily cron):
   ├── Detect new products on Smart Store → suggest import
   ├── Detect removed products → flag for review
   └── Update product images/specs if changed
```

### M2. AI Product Description Generator (Week 35-37)

| Feature | Detail |
|---------|--------|
| **Model Name Input** | Partner or admin inputs product model name (e.g., "Giant TCR Advanced Pro 1 2026") |
| **AI Data Collection** | Claude API crawls manufacturer site + Naver Shopping for specs, features, reviews |
| **Description Generation** | Generate Naver-quality product detail page: hero section + key features + specs table + comparison |
| **Image Enhancement** | Auto-crop, resize, white-background product photos |
| **Template System** | Per-category templates: bikes, components, shoes, apparel, accessories |
| **Human Review** | AI-generated draft → admin quick review → approve/edit → publish |
| **Batch Generation** | Import 50 products from Smart Store → batch-generate all descriptions |

#### AI Description Generation Pipeline

```
Input: Model name "Shimano Ultegra R8100 Di2 Groupset"
     ↓
Step 1: Search & Collect
├── Manufacturer spec sheet (shimano.com)
├── Naver Shopping product data
├── Key review highlights
└── Competitor price range
     ↓
Step 2: Generate (Claude API)
├── Hero description (2-3 sentences, emotional + technical)
├── Key features (5-7 bullet points with icons)
├── Full spec table (weight, material, compatibility)
├── "Who is this for?" section
├── Size/compatibility guide
└── SEO-optimized title + meta description
     ↓
Step 3: Format
├── Apply category-specific HTML template
├── Insert product images at correct positions
├── Generate comparison table (vs competitors)
└── Mobile-responsive layout
     ↓
Step 4: Review
├── Admin previews generated page
├── One-click approve or inline edit
└── Publish to product listing
```

#### Cost Consideration

| Item | Cost |
|------|------|
| Claude API per product description | ~₩200-500 (Haiku for collection, Sonnet for generation) |
| 100 products/month | ~₩20,000-50,000/month |
| vs Manual copywriter | ~₩2,000,000+/month |
| **Savings** | **~97% cost reduction** |

### M3. Operations Automation Engine (Week 37-39)

| Feature | Detail |
|---------|--------|
| **Order Notification (KakaoTalk)** | Auto-send order alert to partner via KakaoTalk Biz Message API |
| **Order Notification (Email)** | Auto-send order details + packing slip PDF via email |
| **Order Notification (SMS)** | Fallback for partners without KakaoTalk Biz |
| **Shipping Auto-Track** | GoodsFlow webhook → auto-update order status |
| **Delivery Confirmation** | Auto-detect delivery → start 7-day return window timer |
| **Settlement Auto-Calc** | Cron job: calculate per-dealer settlement on tier cycle (1/3/5 days) |
| **Settlement Notification** | Auto-send settlement summary to dealer (KakaoTalk + email) |
| **Tax Invoice Auto-Issue** | 국세청 홈택스 API (e-Tax) for electronic tax invoice issuance |
| **Monthly Report Auto-Send** | Auto-generate + send monthly sales/settlement report to each dealer |
| **Consumer Order Updates** | Auto KakaoTalk/push: order confirmed → shipped → delivered |

#### Order Lifecycle Automation

```
[Consumer places order]
     ↓ (instant)
① Auto: KakaoTalk to partner "New order! Product: XXX, Ship by: 4/5"
② Auto: Email to partner with packing slip PDF + shipping label
③ Auto: Push to consumer "Order confirmed! Expected delivery: 4/7"
     ↓
[Partner ships]
④ Auto: GoodsFlow tracking number detected
⑤ Auto: Push to consumer "Your order has shipped! Track: XXXX"
     ↓
[Delivered]
⑥ Auto: GoodsFlow delivery confirmed
⑦ Auto: Push to consumer "Delivered! 7-day return window started"
⑧ Auto: Start 7-day auto-confirm timer
     ↓
[7 days passed, no return]
⑨ Auto: Order auto-confirmed (purchase complete)
⑩ Auto: Add to settlement batch
     ↓
[Settlement cycle reached]
⑪ Auto: Calculate settlement amount (sale price - commission)
⑫ Auto: Issue tax invoice via 홈택스 API
⑬ Auto: Transfer settlement to dealer bank account
⑭ Auto: KakaoTalk to dealer "Settlement ₩520,000 transferred!"
⑮ Auto: Email settlement statement PDF
```

#### Notification Templates (KakaoTalk Biz Message)

| Event | Template | Recipient |
|-------|----------|-----------|
| New Order | "[LB] New order received. Product: {name}, Qty: {qty}. Ship by {deadline}. View: {link}" | Partner |
| Ship Reminder (D-1) | "[LB] Reminder: Order #{id} ships tomorrow. View: {link}" | Partner |
| Ship Overdue | "[LB] Warning: Order #{id} is overdue for shipping. Cancel in 24h." | Partner |
| Shipped | "[LB] Your order has shipped! Tracking: {number}. View: {link}" | Consumer |
| Delivered | "[LB] Your order has been delivered! Rate your purchase: {link}" | Consumer |
| Settlement Complete | "[LB] Settlement ₩{amount} transferred to {bank}. View details: {link}" | Partner |
| Monthly Report | "[LB] {month} sales report ready. Revenue: ₩{total}. View: {link}" | Partner |

#### Tax Invoice Automation (홈택스 API)

```
Settlement batch finalized
     ↓
For each dealer in batch:
├── Collect: dealer business number, LB business number, amounts
├── Call 국세청 홈택스 e-Tax API:
│   ├── POST /tax-invoice/issue
│   ├── Body: supplier info, buyer info, line items, amounts, tax
│   └── Response: invoice number, issue date
├── Store invoice reference in T_DARK_SETTLEMENT
├── Attach invoice PDF to settlement email
└── Log in audit trail

Alternative if 홈택스 API access is complex:
├── 1순위: 홈택스 API (direct, free)
├── 2순위: Barobill API (세금계산서 발행 전문 SaaS, ~₩200/건)
└── 3순위: Popbill API (similar SaaS, ~₩200/건)
```

### M4. Anonymity Architecture (Week 39-40)

| Feature | Detail |
|---------|--------|
| API Response Filtering | Zero dealer info in any consumer-facing API |
| Shipping Label | "Lightbrothers" brand only, LB logistics address |
| CS Routing | All consumer inquiries handled by LB, never forwarded to dealer |
| Notification Filtering | Dealer name/identity stripped from all notifications |
| Access Control | Dealer-product mapping limited to 2-3 admin staff |
| Audit Trail | All dealer info access logged for compliance |

### M5. Flash Sale System (Week 40-41)

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

### M6. Consumer Experience + Payment (Week 42-43)

| Feature | Detail |
|---------|--------|
| Dark Commerce Tab | Dedicated section in app |
| Flash Sale List | Active sales with countdown timers |
| Product Detail | **AI-generated description** + photos + condition badge |
| Purchase Flow | Inicis/PortOne/NaverPay |
| Order Tracking | **Auto-updated via GoodsFlow webhook** |
| **Auto Notifications** | KakaoTalk/push: ordered → shipped → delivered |
| Returns | Defective items only |

### M7. Settlement + Tax Automation (Week 44-45)

| Feature | Detail |
|---------|--------|
| Ledger | Double-entry: consumer payment → LB revenue → dealer settlement |
| Settlement Cycle | Bronze: 5 days, Silver: 3 days, Gold: 1 day |
| **Auto Calculation** | Cron-based settlement batch per tier cycle |
| **Auto Bank Transfer** | Settlement amount → dealer bank account (via PG or banking API) |
| **Auto Tax Invoice** | 홈택스/Barobill/Popbill API → electronic tax invoice |
| **Auto Settlement Notice** | KakaoTalk + email with settlement PDF |
| **Auto Monthly Report** | Per-dealer monthly sales/commission/settlement report |
| Accounting Method | Total amount method (총액법) |
| VAT Chain | Dealer→LB (purchase), LB→Consumer (sale) |

### M8. Native Commerce + Admin (Week 46-50)

| Feature | Detail |
|---------|--------|
| Product Catalog | B2B/B2C product browsing (native Flutter) |
| Product Detail | **AI-generated descriptions**, image gallery, options, specs |
| Cart + Checkout | Cart management, address selection, payment |
| Order History | Order list, detail, **auto-updated tracking**, cancel/return |
| Wishlist | Save favorite products |
| Search | Full-text search with filters |
| Admin: Dealer Mgmt | Registration, tiers, NDA, Smart Store connections |
| Admin: Product Inspection | AI-draft review, photo review, price adjustment |
| Admin: Flash Sale | Scheduling, monitoring, auto-expiry |
| Admin: Settlement | Auto-calc review, dispute resolution, monthly close |
| Admin: Anonymity Audit | Access logs, leak detection alerts |
| Admin: Commerce Analytics | GMV, conversion, category, **AI generation stats** |
| Admin: Notification Config | KakaoTalk templates, email templates, trigger rules |

## Phase 3 New DB Tables

```
-- Dealer
T_DARK_DEALER          — Anonymous dealer profiles
T_DARK_DEALER_CONTRACT — NDA + participation contracts
T_DARK_DEALER_TIER     — Tier progression history

-- Smart Store Import
T_DARK_SMARTSTORE      — Partner Smart Store connections
T_DARK_IMPORT_LOG      — Product import history + sync status
T_DARK_IMPORT_PRODUCT  — Imported product staging (before LB listing)

-- Products
T_DARK_PRODUCT         — Flash sale products
T_DARK_PRODUCT_IMAGE   — Product photos
T_DARK_PRODUCT_AI_DESC — AI-generated descriptions (draft + approved versions)
T_DARK_SALE            — Flash sale definitions (duration, status)

-- Orders + Settlement
T_DARK_ORDER           — Consumer orders (linked to T_ORDER)
T_DARK_SETTLEMENT      — Dealer settlement ledger
T_DARK_TAX_INVOICE     — Auto-issued tax invoice records
T_DARK_INSPECTION      — Admin inspection records

-- Operations
T_DARK_NOTIFICATION_LOG — All auto-sent notifications (KakaoTalk/email/SMS)
T_DARK_AUDIT_LOG       — Dealer info access audit trail

-- Category Structure (multi-sport + future expansion)
T_SHOP_CATEGORY        — Sport-based categories (CATEGORY_TYPE: SPORT/TECH/LIFE)
T_PRODUCT_SPORT        — Product ↔ Sport cross-tagging (many-to-many)

-- Normal Shop
T_SHOP_PRODUCT         — Normal shop products (full price, partner visible)

-- Dark Room Entry
T_DARK_ENTRY_TICKET    — Monthly SSP entry tickets (500 AD/SHOP SSP)

-- Templates
T_NOTIFICATION_TEMPLATE — KakaoTalk/email notification templates
T_AI_DESC_TEMPLATE     — Per-category AI description templates
```

## Phase 3 Admin Additions

| Module | Key Features |
|--------|-------------|
| Dealer Management | Registration, tiers, NDA, **Smart Store connections** |
| **Smart Store Import** | View connected stores, sync status, import queue |
| **AI Description** | Generated drafts, batch generation, template management |
| Product Inspection | AI-draft review, photo review, price adjustment |
| Flash Sale Management | Scheduling, monitoring, auto-expiry |
| **Operations Dashboard** | Auto-notification status, delivery tracking, overdue alerts |
| **Settlement Automation** | Auto-calc review, tax invoice history, bank transfer status |
| Anonymity Audit | Access logs, leak detection |
| Commerce Analytics | GMV, conversion, category, **AI generation stats, ops cost savings** |
| **Notification Config** | KakaoTalk Biz templates, email templates, trigger rules |

## Phase 3 Schedule

```
Week 33-35  Dealer Portal + Smart Store Import (M1)
├── Dealer registration + approval + tiers + NDA
├── Naver Commerce API integration (Smart Store connection)
├── Product auto-import pipeline (pull → stage → select → publish)
├── Daily sync cron (new/removed/updated product detection)
├── Simplified product registration (imported: set qty/price only)
└── Settlement dashboard

Week 35-37  AI Product Description Generator (M2)
├── Claude API integration for product description generation
├── Data collection pipeline (manufacturer site + Naver Shopping)
├── Per-category HTML templates (bikes, components, shoes, apparel)
├── Batch generation (50+ products at once)
├── Admin review interface (preview → approve/edit → publish)
└── Image auto-processing (crop, resize, white-background)

Week 37-39  Operations Automation Engine (M3)
├── KakaoTalk Biz Message API integration (order/settlement alerts)
├── Email auto-send (packing slip PDF, settlement statement)
├── GoodsFlow webhook (shipping auto-track + delivery confirmation)
├── 7-day auto-confirm timer + settlement batch cron
├── 홈택스/Barobill API integration (tax invoice auto-issuance)
├── Monthly auto-report generation + delivery
└── Consumer notification pipeline (ordered → shipped → delivered)

Week 39-40  Anonymity Architecture (M4)
├── API response filtering + shipping label system
├── CS routing + notification filtering
└── Access control + audit trail

Week 40-41  Flash Sale System (M5)
├── Sale creation (duration, countdown, inventory)
├── Status transitions (cron) + auto-cancel/confirm
└── Consumer flash sale list + upcoming preview

Week 42-43  Consumer Experience + Payment (M6)
├── Dark Commerce tab + flash sale browsing
├── AI-generated product detail pages
├── Purchase flow (existing PG) + auto-updated tracking
└── Auto consumer notifications (KakaoTalk/push)

Week 44-45  Settlement + Tax Automation (M7)
├── Auto settlement calculation (per-tier cycle)
├── Auto bank transfer + tax invoice issuance
├── Auto settlement notification (KakaoTalk + email PDF)
└── Monthly dealer report auto-generation

Week 46-50  Native Commerce + Admin (M8)
├── Product catalog + cart + checkout (native Flutter)
├── Order history with auto-tracking
├── Full admin panel (10 modules)
├── Operations dashboard + notification config
├── Commerce analytics + AI generation stats
└── Integration testing + Phase 3 launch
```

---

# PHASE 4: Carbon Token Securities (STO) + Global Expansion (~20 weeks)

## Scope Summary

Tokenize SSP/carbon reduction data as security tokens (Korea STO) and utility tokens (overseas blockchain). Two-track strategy for domestic regulated market and global crypto market.

## Core Strategy: Two-Track Approach

```
Track 1: Korea STO (Regulated Securities)
├── Legal basis: Capital Markets Law + Electronic Securities Law (2026.01.15)
├── Exchange: NXT or KDX (pre-authorized, 2026 H2 launch target)
├── Structure: Broker manages tokenization, KYC/AML required
├── WB role: SSP lock/unlock API + carbon proof data export
├── Risk: Minimal (within Korean regulation)
└── Target: 2027 Q1-Q2 launch

Track 2: Overseas Blockchain (Utility Token)
├── Jurisdiction: Singapore or Dubai (crypto-friendly)
├── Blockchain: Polygon/Base L2 (low gas fees)
├── Structure: ERC-20 smart contract
├── WB role: Separate legal entity + smart contract + DEX listing
├── Risk: Regulatory uncertainty by country
└── Target: 2027 Q3-Q4 launch (6 months after Track 1)
```

## Business Model

### Revenue Streams

| Stream | Source | Est. Year 1 |
|--------|--------|------------|
| STO trading fee share | 0.5-2% per transaction (broker split) | 1-5억원 |
| B2B carbon credit sales | Corporate ESG buyers (Samsung, LG, SK, etc.) | 5-20억원 |
| Premium subscription boost | SSP 2x/3x multiplier for token earners | 1-3억원 |
| Overseas token ecosystem | DEX fees, staking, governance premium | $1-10M |
| Brand partnerships | Eco-brand sponsorships, insurance companies | 1-10억원 |

### Carbon Credit Potential

| Scale | Active Users | Annual Reduction | Credit Revenue (@10,000원/ton) |
|-------|-------------|-----------------|-------------------------------|
| Conservative | 10,000 | ~1,905 tCO₂eq | ~1,905만원/yr |
| Realistic | 50,000 | ~9,525 tCO₂eq | ~9,525만원/yr |
| Optimistic | 100,000 | ~19,050 tCO₂eq | ~1.9억원/yr |

## Feature List

### M1. SSP Token Infrastructure (Week 51-53)

| Feature | Detail |
|---------|--------|
| **SSP Lock/Unlock System** | DB-level SSP freeze when converting to token, prevent double-spending |
| **Token Conversion API** | SSP → carbon proof → token issuance request to broker |
| **Conversion Status Tracking** | Each SSP record: unconverted / STO-converted / token-converted |
| **Double-Counting Prevention** | DB triggers: STO-converted SSP cannot be overseas-token-converted |
| **Carbon Proof Export** | JSON/CSV export of carbon reduction records (auditable) |
| **Reverse Sync** | Token balance ↔ SSP balance display in app |
| **SSP-to-Token Ratio** | Admin-configurable (recommended: 1 SSP = 0.01 kg CO₂) |
| **Token Expiration Policy** | Tokens don't expire (unlike SSP 1-year expiry), migration mechanism |

### M2. Carbon Certification & Audit (Week 53-55)

| Feature | Detail |
|---------|--------|
| **KCCI Certification** | Korea Chamber of Commerce carbon credit methodology approval |
| **환경부 Contact** | Korea Ministry of Environment pathway consultation |
| **Third-Party Audit** | DNV, TUV, or KCCI audit of carbon calculation methodology |
| **POPLE Registry** | Voluntary carbon market registration (existing methodology) |
| **Multi-Source Certification** | Diversify: KCCI + Verra + Gold Standard (prevent Flowcarbon risk) |
| **MRV Data Package** | Consolidate 3Way Sensor data + vehicle verification + T-map baseline into audit-ready format |
| **Annual Carbon Report** | Automated generation for regulators and investors |

### M3. Korea STO Track (Week 55-60)

| Feature | Detail |
|---------|--------|
| **Broker Partnership** | Partner with NXT/KDX participating firm (Shinhan, Hana, Kiwoom, Kakao Pay) |
| **FSC Pre-Consultation** | Financial Services Commission regulatory pathway discussion |
| **Securities Prospectus** | Legal + accounting documentation for FSC approval |
| **KYC/AML Integration** | Enhanced identity verification (broker provides SDK) |
| **Broker API Integration** | REST API to broker for token issuance, balance query, trading |
| **Investor Dashboard** | Token holdings, carbon backing, trading history in app |
| **Beta Launch** | Limited STO issuance (100-500M won, 100-1,000 users) |
| **Full Launch** | Nationwide marketing, corporate ESG outreach |

### M4. Overseas Blockchain Track (Week 58-70)

| Feature | Detail |
|---------|--------|
| **Legal Entity** | Incorporate in Singapore (recommended for tax/regulatory clarity) |
| **Legal Opinion** | Jurisdictional risk assessment (US Howey Test, EU MiCA, UK FCA) |
| **Smart Contract (ERC-20)** | Token minting, burn mechanism, pause function, access control |
| **Security Audit** | CertiK or Trail of Bits audit (non-negotiable) |
| **Testnet Deployment** | Polygon Mumbai 8-12 weeks testing |
| **Mainnet Deployment** | Polygon/Base L2 production launch |
| **DEX Listing** | Uniswap/SushiSwap liquidity provision |
| **Geo-Blocking** | Block US users (SEC compliance) |
| **Wallet Integration** | ethers.js/Web3.js in Flutter app (optional, or web-based) |
| **Token Economics** | Supply cap, quarterly burn events, staking mechanics |

### M5. B2B Corporate ESG Sales (Week 62-70)

| Feature | Detail |
|---------|--------|
| **Corporate ESG Dashboard** | White-label carbon report for corporate buyers |
| **Bulk Credit Purchase** | API for corporations to buy carbon credits in bulk |
| **ESG Report Integration** | Generate data compatible with GRI, SASB, TCFD reporting standards |
| **Corporate Partnership Program** | Onboarding for Samsung, LG, SK, Hyundai ESG teams |
| **Employee Challenge** | Corporations deploy WB app for employee carbon reduction challenges |
| **Insurance Partnerships** | Green driver discount programs with insurers |

## Phase 4 New DB Tables

```sql
-- Token conversion
T_TOKEN_CONVERSION (
  IDX, MEMBER_IDX,
  SSP_AMOUNT int,
  CARBON_KG decimal(10,6),
  TOKEN_AMOUNT decimal(18,8),
  CONVERSION_RATE decimal(10,4),
  TRACK enum('KOREA_STO','OVERSEAS_BLOCKCHAIN'),
  BROKER_TX_ID varchar(100),          -- Track 1: broker transaction ID
  BLOCKCHAIN_TX_HASH varchar(100),    -- Track 2: on-chain tx hash
  STATUS enum('PENDING','CONFIRMED','FAILED','REVERSED'),
  REG_DATE, MOD_DATE
)

-- SSP lock ledger (prevent double-spending)
T_SSP_LOCK (
  IDX, MEMBER_IDX,
  SSP_AMOUNT int,
  LOCK_TYPE enum('STO_CONVERSION','TOKEN_CONVERSION','ADMIN_HOLD'),
  LOCK_REFERENCE_IDX int,             -- FK to T_TOKEN_CONVERSION
  LOCKED_AT datetime,
  UNLOCKED_AT datetime NULL,
  STATUS enum('LOCKED','RELEASED','CONVERTED'),
  REG_DATE
)

-- Carbon certification records
T_CARBON_CERTIFICATION (
  IDX,
  CERTIFICATION_BODY varchar(100),    -- KCCI, Verra, Gold Standard, POPLE
  METHODOLOGY_ID varchar(50),
  PERIOD_START date,
  PERIOD_END date,
  TOTAL_REDUCTION_TONS decimal(12,4),
  CERTIFICATE_NUMBER varchar(100),
  CERTIFICATE_URL varchar(500),
  AUDIT_STATUS enum('PENDING','AUDITED','APPROVED','REJECTED'),
  REG_DATE, MOD_DATE
)

-- Corporate ESG buyer accounts
T_CORPORATE_ESG (
  IDX,
  COMPANY_NAME varchar(200),
  BUSINESS_NUMBER varchar(20),
  CONTACT_NAME varchar(100),
  CONTACT_EMAIL varchar(200),
  CREDIT_PURCHASED_TONS decimal(12,4),
  TOTAL_SPENT_KRW bigint,
  CONTRACT_URL varchar(500),
  STATUS enum('PROSPECT','ACTIVE','CHURNED'),
  REG_DATE, MOD_DATE
)

-- Overseas entity and blockchain config
T_BLOCKCHAIN_CONFIG (
  IDX,
  CHAIN_NAME varchar(50),            -- Polygon, Base
  CONTRACT_ADDRESS varchar(100),
  CHAIN_ID int,
  ENTITY_JURISDICTION varchar(50),   -- Singapore, Dubai
  ENTITY_NAME varchar(200),
  IS_ACTIVE enum('Y','N'),
  REG_DATE, MOD_DATE
)
```

## Phase 4 Admin Additions

| Module | Key Features |
|--------|-------------|
| **Token Dashboard** | Real-time STO/token stats, conversion volume, locked SSP |
| **Conversion Management** | Conversion queue, approval (if needed), failure retry |
| **Carbon Certification** | Certification upload, audit status, methodology management |
| **Corporate ESG Portal** | B2B buyer onboarding, credit purchase, report generation |
| **Blockchain Monitor** | Track 2: contract status, holder count, trading volume |
| **Investor Relations** | Prospectus management, investor communication tools |

## Phase 4 Schedule

```
Week 51-53  SSP Token Infrastructure (M1)
├── SSP lock/unlock system + conversion status tracking
├── Token conversion API (SSP → proof → issuance request)
├── Double-counting prevention (DB triggers)
├── Carbon proof export (JSON/CSV, auditable)
├── SSP-to-token ratio configuration
└── App: token balance display + conversion UI

Week 53-55  Carbon Certification & Audit (M2)
├── KCCI + 환경부 certification pathway engagement
├── Third-party audit (DNV/TUV) of carbon methodology
├── POPLE voluntary registry registration
├── Multi-source certification strategy (prevent Flowcarbon risk)
├── MRV data package consolidation
└── Annual carbon report automation

Week 55-58  Korea STO Track - Preparation (M3a)
├── Broker partnership (NXT/KDX participating firm)
├── FSC pre-consultation
├── Securities prospectus drafting (legal + accounting)
├── KYC/AML integration (broker SDK)
└── Broker API integration (token issuance, balance, trading)

Week 58-60  Korea STO Track - Launch (M3b)
├── FSC formal approval process
├── Beta launch (100-1,000 users, 1-5억원 initial issuance)
├── Investor dashboard in app
└── Full launch + corporate ESG marketing

Week 58-62  Overseas Blockchain - Development (M4a, parallel with M3b)
├── Singapore/Dubai entity incorporation
├── Legal opinion (US/EU/UK jurisdictional assessment)
├── ERC-20 smart contract (Solidity: mint, burn, pause, access control)
├── Security audit (CertiK/Trail of Bits)
└── Testnet deployment (Polygon Mumbai, 8-12 weeks)

Week 62-66  Overseas Blockchain - Launch (M4b)
├── Mainnet deployment (Polygon/Base L2)
├── DEX listing (Uniswap/SushiSwap, initial liquidity)
├── Geo-blocking (US users)
├── Token economics activation (supply cap, burn schedule)
└── Global marketing campaign

Week 62-70  B2B Corporate ESG Sales (M5)
├── Corporate ESG dashboard (white-label carbon reports)
├── Bulk credit purchase API
├── ESG report integration (GRI, SASB, TCFD compatible)
├── Corporate partnership onboarding (first 5-10 companies)
├── Employee carbon challenge program
└── Insurance partnership (green driver discounts)
```

## Phase 4 Key Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| FSC rejection | High | Pre-consultation + regulatory sandbox participation |
| Token price collapse (KlimaDAO 99% drop) | Critical | STO structure limits speculation + burn mechanism + supply cap |
| Certification body policy flip (Flowcarbon) | Critical | Multi-source certs (KCCI + Verra + Gold Standard + custom) |
| Smart contract hack | Critical | CertiK/Trail of Bits audit + 80% cold storage + pause function |
| Double-counting (same SSP → STO + crypto) | High | DB triggers, one-way conversion flag, technical prevention |
| US SEC classification (overseas token) | High | Geo-block US + legal opinion + not marketed as investment |
| Corporate demand insufficient (Nori failure) | Medium | Secure LOI from 3-5 corporations before launch |

## Phase 4 Cost Estimates

| Item | Cost |
|------|------|
| Securities law firm (STO prospectus) | 3,000만-1억원 |
| FSC regulatory consultation | 1,000만-3,000만원 |
| Carbon certification (KCCI/third-party) | 2,000만-5,000만원 |
| Smart contract development (Track 2) | 3,000만-5,000만원 |
| Security audit (CertiK/Trail of Bits) | 5,000만-2억원 |
| Overseas entity incorporation | 1,000만-3,000만원 |
| International legal opinion | 3,000만-1억원 |
| DEX initial liquidity | 5,000만-2억원 |
| **Total Phase 4** | **약 2.3억-10.6억원** |

> Note: Track 1 (Korea STO) alone costs ~1-3억원. Track 2 (overseas) adds 1.3-7.6억원. Can start Track 1 only and add Track 2 later based on results.

---

# UNIFIED TIMELINE

```
2026
─────────────────────────────────────────────────────

PRE-DEV: BRD + PRD + Screen Planning + Design System (3 weeks)
│
├── Week -3     BRD + PRD
│               ├── BRD: business goals, target users, success metrics
│               ├── PRD Phase 1: 3Way Sensor + Carbon (detailed specs)
│               ├── PRD Phase 2: Multi-Sport Challenge (detailed specs)
│               └── PRD Phase 3: Dark Commerce + Smart Commerce (detailed specs)
│
├── Week -2     Screen Planning + Design System Decision
│               ├── App IA (information architecture + navigation)
│               ├── All ~65 screens lo-fi wireframes (HTML, Claude-generated)
│               ├── Admin IA + key module wireframes
│               ├── User flow diagrams (onboarding, core loops)
│               └── Design system decision (colors, fonts, spacing, components)
│
└── Week -1     API Design + Final Review
                ├── Screen-based API endpoint spec (RESTful)
                ├── Data model finalization
                ├── Design system code prep (Flutter ThemeData + Tailwind config)
                └── Full document review + commit
│
▼ Pre-Dev Complete ────────────────────────────────

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

PHASE 3: Dark Commerce + Smart Commerce (18 weeks)
│
├── Week 33-35  Dealer Portal + Smart Store Auto-Import
├── Week 35-37  AI Product Description Generator (Claude API)
├── Week 37-39  Operations Automation (KakaoTalk/Email/Tax Invoice)
├── Week 39-40  Anonymity Architecture
├── Week 40-41  Flash Sale System
├── Week 42-43  Consumer Experience + Payment
├── Week 44-45  Settlement + Tax Automation
└── Week 46-50  Native Commerce + Full Admin (10 modules)
│
▼ Phase 3 Launch ──────────────────────────────────

PHASE 4: Carbon Token Securities + Global Expansion (20 weeks)
│
├── Week 51-53  SSP Token Infrastructure (lock/unlock, conversion API)
├── Week 53-55  Carbon Certification & Audit (KCCI, 환경부, third-party)
├── Week 55-58  Korea STO Preparation (broker, FSC, prospectus)
├── Week 58-60  Korea STO Launch (beta → full)
├── Week 58-62  Overseas Blockchain Dev (Singapore entity, ERC-20, audit)
├── Week 62-66  Overseas Blockchain Launch (mainnet, DEX listing)
└── Week 62-70  B2B Corporate ESG Sales (dashboard, bulk API, partnerships)
│
▼ Phase 4 Launch ──────────────────────────────────

Total: 73 weeks (~18 months)
Accelerated: 56-62 weeks (~14-15.5 months) with Claude parallel generation
```

---

# CUMULATIVE METRICS

## Total New DB Tables

| Phase | Tables | Count |
|-------|--------|-------|
| Phase 1 | T_ACTIVITY_RECORD, T_MEMBER_LOCATION, T_CARBON_DAILY, T_SSP_RATE_CONFIG, T_WIFI_SSID_PATTERN, T_EMISSION_FACTOR | 6 |
| Phase 2 | T_SPORT_TYPE, T_ORGANIZATION, T_COURSE, T_COURSE_SPORT, T_COURSE_CHECKPOINT, T_COURSE_EFFORT, T_COURSE_RANKING, T_EVENT, T_EVENT_SERIES, T_EVENT_PARTICIPANT, T_EVENT_VOLUNTEER, T_STAMP_COLLECTION, T_BADGE, T_BADGE_AWARD, T_CREW, T_CREW_MEMBER, T_CREW_CHALLENGE, T_SOCIAL_FEED, T_SOCIAL_REACTION, T_SOCIAL_COMMENT, T_SSP_EXCHANGE, T_SSP_EXCHANGE_RATE | 22 |
| Phase 3 | T_DARK_DEALER, T_DARK_DEALER_CONTRACT, T_DARK_DEALER_TIER, T_DARK_SMARTSTORE, T_DARK_IMPORT_LOG, T_DARK_IMPORT_PRODUCT, T_DARK_PRODUCT, T_DARK_PRODUCT_IMAGE, T_DARK_PRODUCT_AI_DESC, T_DARK_SALE, T_DARK_ORDER, T_DARK_SETTLEMENT, T_DARK_TAX_INVOICE, T_DARK_INSPECTION, T_DARK_NOTIFICATION_LOG, T_DARK_AUDIT_LOG, T_NOTIFICATION_TEMPLATE, T_AI_DESC_TEMPLATE | 18 |
| Phase 4 | T_TOKEN_CONVERSION, T_SSP_LOCK, T_CARBON_CERTIFICATION, T_CORPORATE_ESG, T_BLOCKCHAIN_CONFIG | 5 |
| **Total** | + existing 107 tables | **158 tables** |

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
| 3 | Naver Commerce API | Smart Store product import |
| 3 | Claude API | AI product description generation |
| 3 | KakaoTalk Biz Message | Order/settlement auto-notifications |
| 3 | Barobill/Popbill (or 홈택스) | Electronic tax invoice auto-issuance |
| 4 | NXT/KDX Broker API | Korea STO token issuance + trading |
| 4 | Polygon/Base L2 | Overseas blockchain smart contract |
| 4 | KCCI/Verra/Gold Standard | Carbon credit certification |
| 4 | CertiK/Trail of Bits | Smart contract security audit |

## Admin Panel Growth

| Phase | New Modules |
|-------|------------|
| Phase 1 | Dashboard, Members, SSP Config, Push, Banners, Challenges, Notices |
| Phase 2 | + Sports, Organizations, Courses (bidirectional), Rankings, Events, Stamps/Badges, Crews, Exchange, Org Portal |
| Phase 3 | + Dealers, Smart Store Import, AI Description, Inspection, Flash Sales, Ops Dashboard, Settlement Automation, Anonymity Audit, Commerce Analytics, Notification Config |
| Phase 4 | + Token Dashboard, Conversion Mgmt, Carbon Certification, Corporate ESG Portal, Blockchain Monitor, Investor Relations |
| **Total** | **33 admin modules** |

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
