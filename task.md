# Task List - App Renewal

**Last updated:** 2026-03-28
**Current phase:** Phase 1 - 3Way Sensor + Carbon Reduction
**Design spec:** `docs/superpowers/specs/2026-03-28-app-renewal-design.md`

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

## Phase 2 (After Phase 1): Riding + Park Run

- [ ] GPS riding recording (full route tracking)
- [ ] Strava API sync
- [ ] Garmin API sync
- [ ] Riding statistics + history
- [ ] Representative Course 60 digital stamp tour
- [ ] Segment ranking system
- [ ] Park Run weekly events
- [ ] SSP -> External rewards exchange (Naver Pay, Kakao Gift, Onnuri, ZeroPay)

## Phase 3 (After Phase 2): Commerce

- [ ] B2B/B2C product sales (native, not WebView)
- [ ] C2C used goods marketplace
- [ ] Rental system
- [ ] Payment gateway integration
- [ ] Partner portal + settlement
- [ ] Shipping integration

---

## Completed

- [x] SSP point exchange research (Naver Pay, Kakao, ZeroPay, Onnuri) - 2026-03-25
- [x] Park Run proposal update (Section 13 SSP exchange slide) - 2026-03-25
- [x] App Renewal Phase 1 design spec - 2026-03-28
- [x] Existing WB3 DB/architecture/feature analysis - 2026-03-28
- [x] 3Way Sensor existing research review - 2026-03-28
