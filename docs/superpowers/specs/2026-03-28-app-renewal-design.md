# App Renewal - Phase 1 Design Spec

**Date:** 2026-03-28
**Project:** Wright Brothers App Renewal
**Author:** CEO + Claude
**Status:** Approved

---

## 1. Executive Summary

Wright Brothers app renewal project. Preserve existing Aurora MySQL database (107 tables), build new tech stack from scratch. Phase 1 focuses on SmartMove (activity detection) + carbon reduction calculation system.

### Launch Sequence

| Phase | Scope | Target |
|-------|-------|--------|
| **1차** | SmartMove + Carbon Reduction + SSP | ~14 weeks |
| **2차** | Riding GPS + Park Run + Strava/Garmin | After Phase 1 |
| **3차** | Commerce (B2B/B2C/C2C/Rental) | After Phase 2 |

### Key Decisions

| # | Decision | Detail |
|---|----------|--------|
| 1 | App strategy | Update existing app (not new app) |
| 2 | DB migration | Full migration (all 107 tables) |
| 3 | Backend | Separate API server (Express + TS + Prisma) |
| 4 | Transport detection | 100% automatic (sensor + Wi-Fi SSID + geofence) |
| 5 | Home/work setup | User registration + pattern learning |
| 6 | SSP rates | Configurable per activity type (admin panel) |
| 7 | Carbon calc | T-map API car distance baseline vs actual mode |
| 8 | Admin panel | Full admin from Phase 1 |
| 9 | Dev team | CEO + Claude |

---

## 2. Architecture

### 2.1 System Overview

```
[Flutter App]   ─┐
[Next.js Admin] ─┼──→ [API Server: Express + TS + Prisma] ──→ [Aurora MySQL]
[Next.js Web]   ─┘         ├── Firebase Auth (social login)
(future Phase 3)            ├── FCM (push notifications)
                            ├── T-map API (car route distance)
                            ├── Kakao Address API (geocoding)
                            └── Cron Jobs (daily stats, SSP calc)
```

### 2.2 Project Structure (Monorepo)

```
C:\Dev\app renewal\
├── api/                      ← Express + TypeScript + Prisma
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.ts       ← Login/register/social
│   │   │   ├── member.ts     ← Profile, address, bike
│   │   │   ├── activity.ts   ← Activity records, transport mode
│   │   │   ├── carbon.ts     ← Carbon reduction calc
│   │   │   ├── ssp.ts        ← SSP points
│   │   │   ├── admin/        ← Admin APIs
│   │   │   └── common.ts     ← Banner, popup, notice
│   │   ├── services/
│   │   │   ├── activity-detection.ts
│   │   │   ├── carbon-calculator.ts
│   │   │   ├── ssp-engine.ts
│   │   │   ├── tmap.ts
│   │   │   ├── geofence.ts
│   │   │   ├── wifi-ssid.ts
│   │   │   └── pattern-learner.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   └── error-handler.ts
│   │   └── prisma/
│   │       └── schema.prisma
│   ├── package.json
│   └── tsconfig.json
│
├── app/                      ← Flutter
│   ├── lib/
│   │   ├── core/
│   │   │   ├── sensors/
│   │   │   │   ├── three_way_sensor.dart
│   │   │   │   ├── wifi_ssid_scanner.dart
│   │   │   │   ├── geofence_manager.dart
│   │   │   │   └── gps_tracker.dart
│   │   │   ├── services/
│   │   │   │   ├── api_client.dart
│   │   │   │   ├── auth_service.dart
│   │   │   │   └── local_db.dart
│   │   │   └── utils/
│   │   │       └── carbon_calc.dart
│   │   ├── features/
│   │   │   ├── home/
│   │   │   ├── activity/
│   │   │   ├── carbon_dashboard/
│   │   │   ├── mypage/
│   │   │   ├── settings/
│   │   │   └── onboarding/
│   │   └── models/
│   └── pubspec.yaml
│
├── admin/                    ← Next.js 14 + TypeScript
│   ├── src/
│   │   ├── app/
│   │   │   ├── dashboard/
│   │   │   ├── members/
│   │   │   ├── ssp/
│   │   │   ├── push/
│   │   │   ├── banners/
│   │   │   ├── challenges/
│   │   │   └── notices/
│   │   └── components/
│   └── package.json
│
├── shared/                   ← Shared types (API ↔ Admin)
│   └── types/
│
├── docs/                     ← Design & planning docs
├── parkrun/                  ← Park Run research
└── smartmove/              ← SmartMove research
```

### 2.3 Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **API Runtime** | Node.js | 20 LTS |
| **API Framework** | Express + TypeScript | 4.x + TS 5.x |
| **ORM** | Prisma | 5.x |
| **DB** | Aurora MySQL (existing) | MySQL 8.0 compatible |
| **Mobile App** | Flutter + Dart | 3.x |
| **Admin Web** | Next.js + TypeScript + Tailwind + shadcn/ui | 14.x |
| **Auth** | Firebase Admin SDK (Google, Apple, Kakao) | 3 providers only |
| **i18n** | flutter_localizations + intl | KO/EN (JA/ZH later) |
| **Push** | Firebase Cloud Messaging | existing |
| **Car Route** | T-map API | route distance |
| **Geocoding** | Kakao Address API | address → coords |
| **Driver License** | 도로교통공단 자동검증 API | license verification |
| **Vehicle Ownership** | CODEF API (자동차등록원부, 보험다모아, 하이패스) | MRV evidence |
| **Document OCR** | Claude Vision API (Haiku) | insurance cert, contract OCR |
| **Ads (Rewarded)** | Google AdMob (`google_mobile_ads`) | rewarded video, banner |
| **Offerwall** | AdiSON (엔비티) or NAS (MAFIN) | CPA/CPE mission center |
| **Ads (Banner)** | Kakao AdFit (optional) | dashboard banner |
| **Deployment (API)** | AWS Lambda or EC2 | existing AWS account |
| **Deployment (Admin)** | Vercel | free/pro |

---

## 3. SmartMove - Activity Detection

### 3.1 Detection Flow (Complete)

```
[Smartphone Sensors]
    │
    ├── Accelerometer + Gyroscope
    │   └── Platform Activity Recognition API
    │       ├── WALKING  ──────────────────→ ✅ Walking
    │       ├── RUNNING  ──────────────────→ ✅ Running
    │       ├── ON_BICYCLE ────────────────→ ✅ Cycling
    │       │
    │       └── IN_VEHICLE (탈것 감지)
    │           │
    │           ├── Wi-Fi Scan
    │           │   ├── Bus SSID match     → ✅ Bus
    │           │   ├── Subway SSID match  → ✅ Subway
    │           │   ├── KTX SSID match     → ✅ KTX
    │           │   │
    │           │   └── No SSID match (자동차류)
    │           │       │
    │           │       └── Geofence Check
    │           │           ├── Walking→Vehicle transition
    │           │           │   within home/work 200m radius
    │           │           │   → ✅ Private Car
    │           │           │
    │           │           └── Walking→Vehicle transition
    │           │               outside home/work radius
    │           │               → ✅ Taxi
    │           │
    │           └── GPS Speed Validation (backup)
    │
    └── Step Counter (auxiliary, low power)
```

### 3.2 Wi-Fi SSID Patterns (Seoul)

| Transport | SSID Patterns | Coverage |
|-----------|--------------|----------|
| Seoul Bus | `T wifi zone`, `BUS_FREE_WIFI`, `seoul_bus_wifi` | ~100% city buses |
| Subway | `Metro_WiFi`, `T wifi zone_metro`, `U+zone`, `KT_GiGA_wifi` | Lines 1-9 + Shinbundang |
| KTX | `KTX_WiFi`, `KORAIL_WiFi` | All cars |

SSID pattern DB stored server-side, synced to app periodically.

### 3.3 Geofence Logic

```typescript
interface LocationFence {
  type: 'HOME' | 'WORK' | 'SCHOOL';
  latitude: number;
  longitude: number;
  radiusMeters: number; // default 200m
  source: 'USER_INPUT' | 'PATTERN_LEARNED';
}

// Car vs Taxi decision
function classifyVehicle(
  transitionPoint: LatLng,
  fences: LocationFence[]
): 'PRIVATE_CAR' | 'TAXI' {
  const isNearFence = fences.some(fence =>
    distanceMeters(transitionPoint, fence) <= fence.radiusMeters
  );
  return isNearFence ? 'PRIVATE_CAR' : 'TAXI';
}
```

### 3.4 Pattern Learning

After 5+ repeated trips with same origin/destination:
- System suggests "Is this your home/work?"
- User confirms → auto-registered as geofence
- Confidence increases with repetitions

### 3.5 Accuracy Targets

| Transport | Method | Target Accuracy |
|-----------|--------|----------------|
| Walking | Platform API | 93%+ |
| Running | Platform API | 95%+ |
| Cycling | Platform API + GPS | 90%+ |
| Bus | Wi-Fi SSID | 90%+ (Seoul) |
| Subway | Wi-Fi SSID | 95%+ |
| Private Car | Geofence | 90%+ |
| Taxi | Elimination | 85%+ |

### 3.6 Platform-Specific Transport Detection

**iOS Wi-Fi SSID scan is BLOCKED by Apple** (NEHotspotHelper denied for fitness apps, CNCopyCurrentNetworkInfo deprecated). Alternative approach:

| Method | Android | iOS | Purpose |
|--------|---------|-----|---------|
| Wi-Fi SSID scan | ✅ (30min intervals) | ❌ **Blocked** | Bus/subway detection |
| **GPS speed pattern** | ✅ | ✅ | Bus (20-60km/h) vs walk (4-6km/h) |
| **Bus stop geofencing** | ✅ | ✅ | CLCircularRegion, battery efficient |
| **CMMotionActivity** | ✅ | ✅ | `automotive` type detection |
| Cellular tower | ✅ (limited) | ❌ | Not viable on either platform |

**iOS transport detection stack:**
```
IN_VEHICLE detected (CMMotionActivity)
    ↓
GPS speed > 15km/h? → likely bus/car/subway
    ↓
Near bus stop geofence? → BUS
    ↓
GPS signal lost (underground)? → SUBWAY
    ↓
Near home/work geofence? → PRIVATE_CAR
    ↓
None of above → TAXI
```

**Android**: Wi-Fi SSID scan (primary) + GPS speed (backup)
**iOS**: GPS speed + bus stop geofencing + CMMotionActivity (no Wi-Fi)

### 3.6.1 Battery Optimization

- Activity Recognition: Transition API (event-driven, not polling)
- GPS: `kCLLocationAccuracyHundredMeters` + `distanceFilter: 50m` (iOS), FusedLocationProvider (Android)
- Wi-Fi scan: Android only, when IN_VEHICLE detected
- Bus stop geofence: CLCircularRegion (iOS), max 20 regions monitored
- Target: ≤5% additional daily battery drain

### 3.6.2 SSP Expiration Policy

| SSP Source | Expiration | Reason |
|-----------|-----------|--------|
| **CARBON** | **No expiration** | Future STO token conversion (Phase 4) |
| **AD** | **1 year from earn date** | Funded by ad revenue, time-limited |
| **SHOP** | **1 year from earn date** | Funded by commerce margin |
| **BONUS** | **Admin configurable** | Default 1 year |

Expired SSP: auto-removed by daily cron job. `T_SSP_LEDGER.EXPIRES_AT` field: NULL for CARBON, datetime for others.

---

## 3.7 MRV Evidence System (Vehicle Ownership Verification)

3-Tier evidence system to prove "user previously drove a car, now uses eco-friendly transport."

### Tier 1: Auto Verification (API only, for car owners)

```
Driver License API (도로교통공단) → license type, acquired date
    +
CODEF: Car Registration (자동차등록원부 갑부) → ownership history
    +
CODEF: Insurance History (보험다모아) → insurance years
    = AUTO APPROVED (no admin needed)
```

### Tier 2: Semi-Auto (API + Document Upload + AI OCR)

For family car, corporate car, lease, rental, carsharing users:

```
Driver License API → license confirmed
    +
User selects type: family/corporate/lease/rental/carshare
    +
Document photo upload (insurance cert, lease contract, employment cert)
    +
Claude Vision API (Haiku) → auto OCR + field extraction
    +
Validation: extracted name == user name && dates valid?
    = AUTO_APPROVED / PARTIAL_MATCH / MANUAL_REVIEW / REJECTED
```

### Tier 3: Behavior-Based (when no documents available)

```
Driver License API → license confirmed
    +
CODEF: Hi-pass usage history (last 3 years)
    +
SmartMove: past Vehicle detection days
    +
Self-declaration form
    = Admin review required
```

### Document OCR Detail (Claude Vision API)

| Document | Extracted Fields | Validation |
|----------|-----------------|------------|
| Insurance Certificate | additional driver name, car number, period, insurer | name match + period valid |
| Lease Contract | user name, car info, lease company, period | name match + period valid |
| Rental Contract | user name, car info, rental company, period | name match + period valid |
| Employment Certificate | company name, user name, employment period | name match + employed |

**OCR Verdict**: AUTO_APPROVED → instant / PARTIAL_MATCH → admin 30sec review / MANUAL_REVIEW → admin full review / REJECTED → auto-reject + resubmit

### New DB Tables for MRV

```sql
T_VEHICLE_VERIFICATION (
  IDX, MEMBER_IDX, VERIFICATION_TYPE, TIER,
  LICENSE_VERIFIED, LICENSE_TYPE, LICENSE_ACQUIRED_DATE,
  REGISTRATION_VERIFIED, CAR_NUMBER, INSURANCE_YEARS,
  DOCUMENT_TYPE, DOCUMENT_IMAGE_URL, OCR_RESULT json, OCR_VERDICT,
  HIPASS_VERIFIED, SENSOR_VEHICLE_DAYS, SELF_DECLARATION,
  STATUS, APPROVED_BY, APPROVED_AT, REJECTION_REASON, EXPIRES_AT,
  REG_DATE, MOD_DATE
)

T_VEHICLE_OCR_LOG (
  IDX, VERIFICATION_IDX, IMAGE_URL,
  CLAUDE_MODEL, PROMPT_USED, RAW_RESPONSE json,
  EXTRACTED_DATA json, MATCH_RESULT json,
  PROCESSING_TIME_MS, COST_KRW,
  REG_DATE
)
```

---

## 4. Carbon Reduction Calculation

### 4.1 Calculation Formula

```
Reduction (kg CO₂) = Baseline Emission - Actual Emission

Baseline Emission = T-map Car Distance (km) × Car Emission Factor (kg/km)
Actual Emission   = Actual Distance (km) × Transport Emission Factor (kg/km)
```

### 4.2 Emission Factors (Default, Admin-configurable)

| Transport Mode | Emission Factor (kg CO₂/km) | Source |
|---------------|---------------------------|--------|
| Gasoline Car | 0.15871 | Korea Transport Safety Authority |
| Diesel Car | 0.19701 | Korea Transport Safety Authority |
| LPG Car | 0.18212 | Korea Transport Safety Authority |
| **Default Car (avg)** | **0.17261** | Weighted average |
| Bus | 0.02745 | Per-passenger basis |
| Subway | 0.01523 | Per-passenger basis |
| KTX | 0.00837 | Per-passenger basis |
| Taxi | 0.15871 | Same as gasoline car |
| Walking | 0.0 | Zero emission |
| Running | 0.0 | Zero emission |
| Cycling | 0.0 | Zero emission |

### 4.3 T-map API Integration

```typescript
interface TmapRouteResult {
  totalDistanceMeters: number;  // Car route distance
  totalTimeSeconds: number;     // Car travel time
  tollFare: number;             // Toll cost
  fuelCost: number;             // Estimated fuel cost
}

// Called once when user registers home/work addresses
// Cached and recalculated weekly
async function getCarBaseline(
  origin: LatLng,    // Home
  destination: LatLng // Work
): Promise<TmapRouteResult>
```

### 4.4 Daily Calculation Flow

```
1. User commutes: Home → Work (bus 3km + walk 1km)
2. System calculates:
   - Baseline: T-map car distance = 8.2km
   - Car emission: 8.2 × 0.17261 = 1.415 kg CO₂
   - Actual: Bus 3km (0.02745) + Walk 1km (0.0) = 0.082 kg CO₂
   - Reduction: 1.415 - 0.082 = 1.333 kg CO₂ saved
3. SSP reward: 1.333 × SSP_RATE_PER_KG = N points
```

### 4.5 Multi-modal Trip Handling

A single commute may involve multiple transport modes:

```
Home → Walk 500m → Bus 3km → Walk 200m → Subway 5km → Walk 300m → Work
```

System segments each mode separately, calculates emission per segment, sums total.

---

## 5. SSP Point System

### 5.1 SSP Source Tagging Policy (Plan C: Unified SSP + Exchange Rules)

Users see ONE SSP balance, but internally every SSP is tagged by source. This prevents deficit from carbon-only users exchanging for gift cards.

```
┌──────────────────────────────────────────────┐
│  User sees: "My SSP: 3,500"                  │
│  ├── Exchangeable: 1,200 (from ads + shop)   │
│  └── Carbon: 2,300 (future token value)      │
└──────────────────────────────────────────────┘
```

**Source Tags:**

| Tag | Earned From | Exchangeable? | Tokenizable? | Cost to WB |
|-----|------------|---------------|-------------|-----------|
| **CARBON** | Walking, running, cycling, transit (carbon reduction) | **NO** | **YES** (Phase 4 STO) | ₩0 |
| **AD** | Rewarded video, offerwall missions | **YES** | NO | Covered by ad revenue |
| **SHOP** | Product purchase, rental | **YES** | NO | Covered by commerce margin |
| **BONUS** | Challenge rewards, events, referral | **Configurable** | NO | Marketing budget |

**Exchange Rules:**

```
Gift card / Naver Pay / Kakao exchange:
  → Only AD + SHOP SSP can be used
  → CARBON SSP CANNOT be exchanged for cash-equivalent rewards
  → Deduction order: AD first → SHOP second (FIFO)

Rankings / Badges / Challenges:
  → ALL SSP types count (CARBON + AD + SHOP + BONUS)

Token Securities conversion (Phase 4):
  → Only CARBON SSP can be converted to tokens
  → Each CARBON SSP = 0.01 kg CO₂ (auditable)
  → AD/SHOP/BONUS SSP cannot become tokens
```

**Why this works:**

```
User motivation 1: "Carbon SSP = future token value → keep commuting by bike"
User motivation 2: "Want gift card now → watch ads or do offerwall missions"
WB economics: Carbon SSP costs ₩0, Ad SSP covered by ad revenue → zero deficit
```

### 5.2 Configurable Rate Structure

```typescript
interface SSPRateConfig {
  // CARBON source rates (per kg CO₂ reduced)
  carbonReductionRate: number;  // e.g., 100 SSP per 1 kg CO₂

  // CARBON source: activity-based
  walkingPerKm: number;        // e.g., 5 SSP/km
  runningPerKm: number;        // e.g., 8 SSP/km
  cyclingPerKm: number;        // e.g., 10 SSP/km
  busPerTrip: number;          // e.g., 3 SSP/trip
  subwayPerTrip: number;       // e.g., 3 SSP/trip

  // AD source rates
  rewardedVideoSSP: number;    // e.g., 10 SSP per view
  offerwallBaseRate: number;   // e.g., 50% of CPA revenue as SSP

  // SHOP source rates
  purchaseSSPRate: number;     // e.g., 1% of purchase amount as SSP

  // Bonus multipliers
  streakBonus: number;         // e.g., 1.5x for 7-day streak
  challengeBonus: number;      // e.g., 2x during challenge events
}
```

All rates configurable via admin panel. Carbon consultancy can adjust CARBON rates. Business team adjusts AD/SHOP rates.

### 5.3 SSP Ledger

Every SSP transaction recorded with:
- **Source tag** (CARBON / AD / SHOP / BONUS)
- **Source detail** (WALKING, REWARDED_VIDEO, OFFERWALL_CPA, PURCHASE, etc.)
- Activity reference (which trip/activity/ad/order)
- Rate applied at time of earning
- Carbon reduction amount (CARBON source only)
- **is_exchangeable** flag (AD + SHOP = true, CARBON = false)
- **is_tokenizable** flag (CARBON = true, others = false)
- Bonus multiplier (if applicable)

Full audit trail for MRV compliance and token conversion.

### 5.4 SSP Balance Display (App UI)

```
┌─────────────────────────────────────┐
│  💰 My SSP                    3,500  │
│  ─────────────────────────────────  │
│  🌱 Carbon SSP          2,300      │
│     "Future token value"            │
│     → Earned from eco-commuting     │
│     → Convertible to STO (Phase 4)  │
│                                     │
│  💳 Exchangeable SSP     1,200      │
│     "Use now"                       │
│     → From ads + shopping           │
│     → Exchange for gift cards       │
│     [Exchange Now →]                │
│                                     │
│  ─────────────────────────────────  │
│  💡 "Watch ad to earn more          │
│      exchangeable SSP"       [▶️]   │
└─────────────────────────────────────┘
```

### 5.5 Exchange Validation Logic

```typescript
function validateExchange(memberId: number, amount: number): ExchangeResult {
  const exchangeableBalance = getSSPBalance(memberId, {
    sources: ['AD', 'SHOP'],
    // CARBON and BONUS(default) excluded
  });

  if (amount > exchangeableBalance) {
    return {
      success: false,
      message: `교환 가능 SSP가 부족합니다. 현재 ${exchangeableBalance} SSP`,
      suggestion: '광고 시청이나 오퍼월 미션으로 교환 가능 SSP를 모아보세요!'
    };
  }

  // Deduct: AD first, then SHOP (FIFO order)
  deductSSP(memberId, amount, deductOrder: ['AD', 'SHOP']);
  return { success: true };
}
```

---

## 5.3 Ad Revenue + Offerwall System

### Revenue Strategy

SSP point costs are covered by ad revenue. Ads are **optional SSP boosters**, never forced.

```
User completes activity → 10 SSP earned
    ↓
"Watch ad for 2x SSP" button (optional)
    ↓
User watches 15-30s rewarded video → +10 SSP bonus
    ↓
Revenue flow:
  Advertiser pays ~₩33 → Google AdMob takes ~40% → WB receives ~₩20
  WB gives user 10 SSP (~₩10 value) → WB keeps ~₩10 margin
  + User retention increases → more ad views → compounding revenue
```

### Ad Placements

| Format | Placement | Revenue | UX Impact |
|--------|-----------|---------|-----------|
| **Rewarded Video** (AdMob) | "Watch ad for 2x SSP" after activity | **High (~₩33/view)** | None (voluntary) |
| **Rewarded Video** (AdMob) | "Today's bonus SSP" on home screen | High | None |
| **Offerwall** (AdiSON/NAS) | "Mission Center" dedicated tab | **Very High (₩1K~70K/action)** | None (separate tab) |
| Native Ad (AdMob) | Between activity history items | Medium | Minimal |
| Banner (Kakao AdFit) | Carbon dashboard bottom | Low | Minimal |
| ~~Interstitial~~ | ~~Not used~~ | - | ~~Bad UX~~ |

### Offerwall Integration

```
[User taps "Mission Center" tab]
    ↓
[AdiSON offerwall loads (native SDK or WebView)]
    ↓
[User completes mission: install app, sign up for card, etc.]
    ↓
[AdiSON server → postback to WB API: POST /api/offerwall/callback]
    ↓
[WB server: verify + credit SSP to user]
```

**Offerwall priority:**
1. AdiSON (엔비티) — No.1 Korea, self-serve partner center, KOSDAQ-listed
2. TNK Factory — Neowiz subsidiary, 15yr track record
3. NAS (MAFIN) — Quick test only, too small for long-term

### Revenue Projection

| MAU | Rewarded Video | Offerwall CPA | Banner | **Monthly Total** |
|-----|---------------|---------------|--------|-----------------|
| 10,000 | ₩162K | ₩500K | ₩101K | **₩763K** |
| 50,000 | ₩810K | ₩2.5M | ₩506K | **₩3.82M** |
| 100,000 | ₩1.62M | ₩5M | ₩1.01M | **₩7.63M** |

### Implementation (Week 7-8, ~7-9 days)

| Task | Duration |
|------|----------|
| AdMob Flutter package (`google_mobile_ads`) | 1 day |
| Rewarded video integration (2x SSP after activity) | 2 days |
| Offerwall WebView/SDK + postback callback API | 3 days |
| "Mission Center" tab UI | 2 days |
| Kakao AdFit banner (optional) | 1 day |

---

## 6. Data Model (New Tables)

Additions to existing Aurora MySQL schema:

```sql
-- Activity records (from SmartMove)
T_ACTIVITY_RECORD (
  IDX, MEMBER_IDX,
  ACTIVITY_TYPE enum('WALKING','RUNNING','CYCLING','BUS','SUBWAY','KTX','TAXI','CAR'),
  STARTED_AT, ENDED_AT, DURATION_SEC,
  DISTANCE_M, AVG_SPEED_KMH,
  CONFIDENCE decimal(3,2),
  DETECTION_METHOD enum('PLATFORM_API','WIFI_SSID','GEOFENCE','GPS'),
  CALORIES decimal(8,2),
  SSP_EARNED int,
  CARBON_REDUCED_KG decimal(10,6),
  GPS_DATA json,
  SYNCED enum('Y','N'),
  REG_DATE, MOD_DATE
)

-- Commute locations (home/work/school)
T_MEMBER_LOCATION (
  IDX, MEMBER_IDX,
  LOCATION_TYPE enum('HOME','WORK','SCHOOL'),
  ADDRESS varchar(500),
  LATITUDE decimal(10,7),
  LONGITUDE decimal(10,7),
  RADIUS_M int default 200,
  SOURCE enum('USER_INPUT','PATTERN_LEARNED'),
  TMAP_CAR_DISTANCE_M int,
  TMAP_CAR_DURATION_SEC int,
  TMAP_LAST_CALCULATED datetime,
  STATUS varchar(1) default 'Y',
  REG_DATE, MOD_DATE
)

-- Carbon reduction daily summary
T_CARBON_DAILY (
  IDX, MEMBER_IDX, DATE date,
  BASELINE_EMISSION_KG decimal(10,6),
  ACTUAL_EMISSION_KG decimal(10,6),
  REDUCTION_KG decimal(10,6),
  TRIP_COUNT int,
  TRANSPORT_BREAKDOWN json,
  REG_DATE, MOD_DATE
)

-- SSP rate configuration (admin-managed)
T_SSP_RATE_CONFIG (
  IDX,
  RATE_KEY varchar(50),
  RATE_VALUE decimal(10,4),
  DESCRIPTION varchar(200),
  EFFECTIVE_FROM date,
  EFFECTIVE_TO date,
  STATUS varchar(1) default 'Y',
  REG_IDX, REG_DATE, MOD_IDX, MOD_DATE
)

-- SSP ledger with source tagging (Plan C)
T_SSP_LEDGER (
  IDX, MEMBER_IDX,
  SSP_AMOUNT int,
  SOURCE enum('CARBON','AD','SHOP','BONUS'),
  SOURCE_DETAIL varchar(50),        -- WALKING, REWARDED_VIDEO, OFFERWALL_CPA, PURCHASE, etc.
  REFERENCE_TYPE varchar(20),       -- ACTIVITY, AD_VIEW, OFFERWALL, ORDER, CHALLENGE
  REFERENCE_IDX int,                -- FK to source record
  CARBON_KG decimal(10,6) NULL,     -- CARBON source only
  IS_EXCHANGEABLE boolean,          -- true: AD+SHOP, false: CARBON
  IS_TOKENIZABLE boolean,           -- true: CARBON only
  BALANCE_AFTER int,                -- running balance after this transaction
  REG_DATE datetime default NOW()
)

-- Ad revenue tracking
T_AD_REVENUE_LOG (
  IDX, MEMBER_IDX,
  AD_TYPE enum('REWARDED_VIDEO','OFFERWALL','BANNER'),
  AD_NETWORK varchar(30),           -- ADMOB, ADISON, KAKAO_ADFIT
  REVENUE_KRW decimal(10,2),        -- WB revenue from this ad view
  SSP_REWARDED int,                 -- SSP given to user
  CAMPAIGN_ID varchar(100),         -- offerwall campaign reference
  REG_DATE datetime default NOW()
)

-- Wi-Fi SSID pattern DB
T_WIFI_SSID_PATTERN (
  IDX,
  SSID_PATTERN varchar(100),
  TRANSPORT_TYPE enum('BUS','SUBWAY','KTX'),
  REGION varchar(50),
  PRIORITY int,
  STATUS varchar(1) default 'Y',
  REG_DATE, MOD_DATE
)

-- Emission factors (admin-managed)
T_EMISSION_FACTOR (
  IDX,
  TRANSPORT_TYPE varchar(20),
  FACTOR_KG_PER_KM decimal(10,5),
  SOURCE varchar(200),
  EFFECTIVE_FROM date,
  STATUS varchar(1) default 'Y',
  REG_IDX, REG_DATE, MOD_IDX, MOD_DATE
)
```

---

## 7. Admin Panel Features

### 7.1 Dashboard
- Real-time carbon reduction total (today/week/month/year)
- Active user count, new registrations
- Transport mode distribution chart
- Top reducers leaderboard

### 7.2 Member Management
- Member list with search/filter
- Member detail: profile, activity history, SSP ledger
- SSP manual adjustment (with reason)
- Member status management (active/suspended/withdrawn)

### 7.3 SSP Configuration
- Activity-based rate settings (per km, per trip)
- Carbon-based rate settings (per kg CO₂)
- Bonus multiplier settings (streak, challenge)
- Emission factor management (per transport type)
- Rate change history log

### 7.4 Push Notifications
- FCM push composition and send
- Target selection (all / segment / individual)
- Scheduled sending
- Send history and open rate tracking

### 7.5 Banner & Popup Management
- Image upload (S3/CDN)
- Display period (start/end date)
- Target placement (home, activity, etc.)
- Click URL / deep link setting
- Priority ordering

### 7.6 Challenge Management
- Challenge creation (period, goal, reward)
- Participant list and progress
- Auto-completion detection
- Result aggregation and winner selection

### 7.7 Notice Board
- CRUD with rich text editor
- Pin/unpin notices
- Push notification on publish (optional)

---

## 8. App Screens (Flutter)

### 8.1 Onboarding
1. Language selection (한국어 / English) — JA/ZH added later
2. Welcome + app intro (3 slides, localized)
3. Social login (Google / Apple / Kakao) — 3 providers, supports foreign users
4. Profile setup (name, nationality — optional for foreign users)
5. Home/Work address registration (skip option for tourists)
6. Permission requests (location, activity, notifications)
7. T-map baseline calculation (loading, skip if tourist mode)

### 8.2 Home Screen
- Today's carbon reduction (big number + comparison to car)
- Activity timeline (walking 500m → bus 3km → walking 200m ...)
- SSP balance
- Weekly streak indicator
- Active challenge card (if any)

### 8.3 Activity History
- Calendar view (dates with activity highlighted)
- Daily detail: trip list with transport icons
- Trip detail: map route, distance, duration, carbon saved
- Weekly/monthly summary charts

### 8.4 Carbon Dashboard
- Cumulative CO₂ reduction (animated counter)
- "Equivalent to X trees planted" visualization
- Monthly trend chart
- Transport mode breakdown pie chart
- Comparison: "You saved X km of car driving this month"

### 8.5 My Page
- Profile (name, photo, email)
- SSP balance + history
- Home/Work/School location management
- Connected social accounts
- My bikes (existing data from T_MEMBER_BIKE)

### 8.6 Settings
- Notification preferences
- Privacy settings
- Activity detection on/off
- Battery optimization info
- App version / terms / privacy policy

---

## 9. Development Schedule

### Week 1-2: Foundation (14 days)

| Day | Task |
|-----|------|
| 1-2 | Express+TS+Prisma project setup, folder structure |
| 3-4 | Aurora MySQL connection + `prisma db pull` introspect |
| 5-6 | Firebase Auth (Google/Apple/Kakao) + i18n (KO/EN (JA/ZH later)) |
| 7-8 | Flutter project creation, routing, state management |
| 9-10 | Member API (register/login/profile/address) |
| 11-14 | Flutter ↔ API integration, login screen working |

### Week 3-4: SmartMove + GPS (14 days)

| Day | Task |
|-----|------|
| 15-17 | Flutter activity_recognition plugin (walk/run/cycle) |
| 18-19 | GPS speed validation + distance measurement |
| 20-21 | Local SQLite storage + server sync API |
| 22-24 | Activity record API (start/end/distance/calories/SSP) |
| 25-26 | Battery optimization (duty cycling, background mode) |
| 27-28 | Real-world testing + accuracy tuning |

### Week 5-6: Transport Auto-Detection (14 days)

| Day | Task |
|-----|------|
| 29-31 | Wi-Fi SSID scan module (Android + iOS) |
| 32-33 | Seoul bus/subway/KTX SSID pattern DB |
| 34-35 | SSID matching engine + vehicle classification |
| 36-37 | Home/Work registration (Kakao Address API → geocoding) |
| 38-39 | Geofence setup + car/taxi auto-inference |
| 40-41 | Pattern learning (repeated routes → auto home/work) |
| 42 | Full transport detection integration test |

### Week 7-8: Carbon + SSP Engine (14 days)

| Day | Task |
|-----|------|
| 43-44 | T-map car route API integration |
| 45-46 | Carbon reduction calculation engine |
| 47-48 | Emission factor management system |
| 49-50 | SSP auto-earning engine (per-activity rates) |
| 51-52 | Daily/weekly/monthly aggregation + API |
| 53-56 | Carbon reduction report API (individual, total) |

### Week 9-10: Flutter App UI (14 days)

| Day | Task |
|-----|------|
| 57-59 | Home screen (today's reduction, activity summary, SSP) |
| 60-62 | Activity history list + detail screens |
| 63-65 | Carbon dashboard (charts, car comparison) |
| 66-67 | My page (profile, SSP, home/work management) |
| 68-69 | Settings screen (notifications, privacy, social) |
| 70 | Full app navigation + design polish |

### Week 11-13: Admin Panel (21 days)

| Day | Task |
|-----|------|
| 71-73 | Next.js project setup + layout + auth |
| 74-76 | Dashboard (carbon stats, user charts) |
| 77-79 | Member management (list, detail, SSP history) |
| 80-82 | SSP settings (rates, emission factors CRUD) |
| 83-85 | Push notification management (FCM, targeting, scheduling) |
| 86-87 | Banner/popup management (image upload, scheduling) |
| 88-89 | Challenge management (create, participants, results) |
| 90-91 | Notice board + final admin testing |

### Week 14: Integration + Launch (7 days)

| Day | Task |
|-----|------|
| 92-93 | App ↔ API ↔ Admin full integration test |
| 94-95 | Real commute scenario end-to-end test |
| 96 | Bug fixes + performance optimization |
| 97-98 | App Store / Google Play submission |

**Total: ~14 weeks (3.5 months)**
**Accelerated target: 10-12 weeks with Claude parallel code generation**

---

## 10. Phase 2 Preview: Riding + Park Run

After Phase 1 launch, Phase 2 adds:

- GPS riding recording (full route tracking)
- Strava API sync
- Garmin API sync
- Riding statistics + history
- Representative Course 60 digital stamp tour
- Segment ranking system
- Park Run weekly events
- SSP → External rewards (Naver Pay, Kakao Gift, Onnuri, ZeroPay)

Phase 2 leverages Phase 1's entire infrastructure (API server, auth, SSP engine, admin panel).

---

## 11. Phase 3 Preview: Commerce

After Phase 2, Phase 3 migrates commerce from WebView to native:

- B2B/B2C product sales
- C2C used goods marketplace
- Rental system
- Payment gateway (Inicis, PortOne, NaverPay)
- Partner portal + settlement
- Shipping integration (GoodsFlow)

---

## 12. References

- [SmartMove Technical Research](../../smartmove%20sensor/01_기술_리서치_보고서.md)
- [SmartMove Implementation Plan](../../smartmove%20sensor/02_구현_계획서.md)
- [SmartMove Code Samples](../../smartmove%20sensor/03_코드_샘플.md)
- [Transport Auto-Detection Research](../../smartmove%20sensor/04_교통수단_자동감지_리서치.md)
- [Carbon Credit Risk Review](../../smartmove%20sensor/라이트브라더스_외부사업_등록_리스크_검토보고서.md)
- [SSP Point Exchange Research](../../parkrun/07_SSP_포인트교환_종합리서치.md)
- [Park Run Proposal](../../parkrun/05_관광공사_자전거파크런_사업제안서.md)
- [WB3 Database ERD](C:/Dev/wrightbrothers/WB3_데이터베이스_ERD.md)
- [WB3 Architecture Analysis](C:/Dev/wrightbrothers/WB3_아키텍처_분석서.md)
- [WB3 Renewal Analysis](C:/Dev/wrightbrothers/WB3_리뉴얼_분석보고서.md)
- [WB3 SSP/Points Analysis](C:/Dev/wrightbrothers/WB3_포인트SSP캐시_분석서.md)
