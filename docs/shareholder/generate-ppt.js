const pptxgen = require("pptxgenjs");
const pres = new pptxgen();

// McKinsey Midnight Executive palette
const NAVY = "1E2761";
const ICE = "CADCFC";
const WHITE = "FFFFFF";
const DARK = "1A1A2E";
const ACCENT = "4A90D9";
const RED = "E74C3C";
const GREEN = "27AE60";
const GRAY = "95A5A6";
const LIGHT_BG = "F8F9FA";

pres.layout = "LAYOUT_WIDE"; // 13.33 x 7.5 inches
pres.author = "Wright Brothers Co., Ltd";
pres.subject = "App Renewal Shareholder Report 2026";

// ===== SLIDE 1: COVER =====
let slide = pres.addSlide();
slide.background = { color: NAVY };
slide.addText("CONFIDENTIAL", { x: 0.5, y: 0.4, w: 12, fontSize: 12, color: RED, bold: true, fontFace: "Arial" });
slide.addText("(주)라이트브라더스", { x: 0.8, y: 2.0, w: 11, fontSize: 44, color: WHITE, bold: true, fontFace: "Arial Black" });
slide.addText("앱 리뉴얼 사업 보고서", { x: 0.8, y: 3.2, w: 11, fontSize: 32, color: ICE, fontFace: "Arial" });
slide.addShape(pres.ShapeType.rect, { x: 0.8, y: 4.2, w: 3, h: 0.05, fill: { color: ACCENT } });
slide.addText("2026년 정기 주주총회 | 2026.03.31", { x: 0.8, y: 4.6, w: 11, fontSize: 18, color: GRAY, fontFace: "Arial" });
slide.addText("대표이사 김병수", { x: 0.8, y: 5.2, w: 11, fontSize: 16, color: GRAY, fontFace: "Arial" });

// ===== SLIDE 2: EXECUTIVE SUMMARY =====
slide = pres.addSlide();
slide.background = { color: WHITE };
slide.addText("Executive Summary", { x: 0.5, y: 0.3, w: 12, fontSize: 28, color: NAVY, bold: true, fontFace: "Arial Black" });
slide.addText("자전거 전용 앱 → 멀티스포츠 탄소저감 플랫폼으로 전환하여 하락 추세를 반전시키고, STO(토큰증권)까지 확장합니다.", {
  x: 0.5, y: 1.0, w: 12, fontSize: 14, color: NAVY, fontFace: "Arial", fill: { color: ICE }, margin: [10, 15, 10, 15]
});

// As-Is metrics
slide.addText("현재 (As-Is)", { x: 0.5, y: 1.8, w: 5, fontSize: 18, color: NAVY, bold: true, fontFace: "Arial" });
const asIsData = [
  ["MAU (앱+웹)", "~4,000명", "▼30-35%"],
  ["Android 설치", "7,180명", "-"],
  ["Android 평점", "1.00★", "심각"],
  ["인프라 비용", "190만원/월", "-"],
];
slide.addTable(
  [["지표", "수치", "추세"].map(t => ({ text: t, options: { fontSize: 11, bold: true, color: WHITE, fill: { color: NAVY } } })),
   ...asIsData.map(r => r.map((t, i) => ({ text: t, options: { fontSize: 11, color: i === 2 && t.includes("▼") ? RED : DARK, fill: { color: LIGHT_BG } } })))],
  { x: 0.5, y: 2.3, w: 5.5, colW: [2.2, 1.8, 1.5], border: { color: "DDDDDD", pt: 0.5 }, margin: [5, 8, 5, 8] }
);

// To-Be targets
slide.addText("목표 (To-Be)", { x: 7, y: 1.8, w: 5, fontSize: 18, color: NAVY, bold: true, fontFace: "Arial" });
const toBeData = [
  ["Phase 1 (3개월)", "10,000", "2.5배"],
  ["Phase 2 (9개월)", "30,000", "7.5배"],
  ["Phase 3 (15개월)", "50,000", "12.5배"],
  ["Phase 4 (18개월)", "100,000", "25배"],
];
slide.addTable(
  [["시점", "MAU 목표", "성장"].map(t => ({ text: t, options: { fontSize: 11, bold: true, color: WHITE, fill: { color: ACCENT } } })),
   ...toBeData.map(r => r.map((t, i) => ({ text: t, options: { fontSize: 11, color: i === 2 ? GREEN : DARK, bold: i === 2, fill: { color: LIGHT_BG } } })))],
  { x: 7, y: 2.3, w: 5.5, colW: [2.2, 1.8, 1.5], border: { color: "DDDDDD", pt: 0.5 }, margin: [5, 8, 5, 8] }
);

// Big number callouts
slide.addShape(pres.ShapeType.roundRect, { x: 0.8, y: 5.0, w: 3.5, h: 1.8, fill: { color: NAVY }, rectRadius: 0.15 });
slide.addText("MAU 목표", { x: 0.8, y: 5.1, w: 3.5, fontSize: 12, color: GRAY, align: "center", fontFace: "Arial" });
slide.addText("4K → 100K", { x: 0.8, y: 5.5, w: 3.5, fontSize: 36, color: WHITE, bold: true, align: "center", fontFace: "Arial Black" });
slide.addText("25배 성장", { x: 0.8, y: 6.2, w: 3.5, fontSize: 14, color: GREEN, align: "center", fontFace: "Arial" });

slide.addShape(pres.ShapeType.roundRect, { x: 5.0, y: 5.0, w: 3.5, h: 1.8, fill: { color: NAVY }, rectRadius: 0.15 });
slide.addText("인프라 절감", { x: 5.0, y: 5.1, w: 3.5, fontSize: 12, color: GRAY, align: "center", fontFace: "Arial" });
slide.addText("190→123만", { x: 5.0, y: 5.5, w: 3.5, fontSize: 36, color: WHITE, bold: true, align: "center", fontFace: "Arial Black" });
slide.addText("연 804만원 절감", { x: 5.0, y: 6.2, w: 3.5, fontSize: 14, color: GREEN, align: "center", fontFace: "Arial" });

slide.addShape(pres.ShapeType.roundRect, { x: 9.2, y: 5.0, w: 3.5, h: 1.8, fill: { color: NAVY }, rectRadius: 0.15 });
slide.addText("총 기간", { x: 9.2, y: 5.1, w: 3.5, fontSize: 12, color: GRAY, align: "center", fontFace: "Arial" });
slide.addText("73주", { x: 9.2, y: 5.5, w: 3.5, fontSize: 36, color: WHITE, bold: true, align: "center", fontFace: "Arial Black" });
slide.addText("4 Phase 순차 실행", { x: 9.2, y: 6.2, w: 3.5, fontSize: 14, color: ICE, align: "center", fontFace: "Arial" });

// ===== SLIDE 3: WHY RENEWAL =====
slide = pres.addSlide();
slide.background = { color: WHITE };
slide.addText("리뉴얼이 필요한 이유", { x: 0.5, y: 0.3, w: 12, fontSize: 28, color: NAVY, bold: true, fontFace: "Arial Black" });

// 3 columns
const reasons = [
  { title: "기술부채 해소", items: ["JS 11만줄, 테스트 0%", "API키 하드코딩", "Spring Boot 7개 방치", "→ TypeScript + TDD"] },
  { title: "시장 공백 선점", items: ["러닝 1,000만명 시장", "크루+랭킹 통합 앱 없음", "파크런 한국 미진출", "→ 카테고리 킬러"] },
  { title: "수익 다각화", items: ["현재: 커머스 수수료만", "→ 광고 + 오퍼월", "→ 프리미엄 구독", "→ 토큰증권 (STO)"] },
];

reasons.forEach((r, i) => {
  const x = 0.5 + i * 4.2;
  slide.addShape(pres.ShapeType.roundRect, { x, y: 1.2, w: 3.8, h: 5.5, fill: { color: LIGHT_BG }, rectRadius: 0.15, line: { color: "E0E0E0", width: 1 } });
  slide.addShape(pres.ShapeType.roundRect, { x: x + 0.3, y: 1.5, w: 3.2, h: 0.6, fill: { color: NAVY }, rectRadius: 0.1 });
  slide.addText(r.title, { x: x + 0.3, y: 1.5, w: 3.2, h: 0.6, fontSize: 16, color: WHITE, bold: true, align: "center", fontFace: "Arial" });
  r.items.forEach((item, j) => {
    const isArrow = item.startsWith("→");
    slide.addText(item, {
      x: x + 0.5, y: 2.5 + j * 0.7, w: 2.8, fontSize: 13,
      color: isArrow ? GREEN : DARK, bold: isArrow, fontFace: "Arial"
    });
  });
});

// ===== SLIDE 4: 4-PHASE STRATEGY =====
slide = pres.addSlide();
slide.background = { color: NAVY };
slide.addText("4단계 성장 전략", { x: 0.5, y: 0.3, w: 12, fontSize: 28, color: WHITE, bold: true, fontFace: "Arial Black" });

const phases = [
  { num: "1", title: "SmartMove", period: "14주", desc: "교통수단 자동감지\n탄소저감 계산\nSSP 포인트", revenue: "광고+오퍼월", color: "2ECC71" },
  { num: "2", title: "멀티스포츠", period: "18주", desc: "GPX 코스 자동생성\n양방향 랭킹\n파크런 이벤트", revenue: "+구독+스폰서", color: "3498DB" },
  { num: "3", title: "커머스", period: "18주", desc: "일반샵+깜깜이방\nAI 상품설명\n운영 자동화", revenue: "+수수료 8~20%", color: "9B59B6" },
  { num: "4", title: "STO", period: "20주", desc: "탄소 토큰증권\n한국 STO\n해외 블록체인", revenue: "+토큰+B2B ESG", color: "E67E22" },
];

phases.forEach((p, i) => {
  const x = 0.3 + i * 3.2;
  slide.addShape(pres.ShapeType.roundRect, { x, y: 1.2, w: 3.0, h: 5.5, fill: { color: "16213E" }, rectRadius: 0.15, line: { color: p.color, width: 2 } });
  // Phase number circle
  slide.addShape(pres.ShapeType.ellipse, { x: x + 1.05, y: 1.5, w: 0.9, h: 0.9, fill: { color: p.color } });
  slide.addText(p.num, { x: x + 1.05, y: 1.5, w: 0.9, h: 0.9, fontSize: 24, color: WHITE, bold: true, align: "center", valign: "middle", fontFace: "Arial Black" });
  slide.addText(p.title, { x, y: 2.6, w: 3.0, fontSize: 18, color: WHITE, bold: true, align: "center", fontFace: "Arial" });
  slide.addText(p.period, { x, y: 3.1, w: 3.0, fontSize: 12, color: GRAY, align: "center", fontFace: "Arial" });
  slide.addText(p.desc, { x: x + 0.3, y: 3.6, w: 2.4, fontSize: 12, color: ICE, fontFace: "Arial", lineSpacing: 18 });
  // Revenue box
  slide.addShape(pres.ShapeType.roundRect, { x: x + 0.3, y: 5.5, w: 2.4, h: 0.5, fill: { color: p.color }, rectRadius: 0.08 });
  slide.addText(p.revenue, { x: x + 0.3, y: 5.5, w: 2.4, h: 0.5, fontSize: 11, color: WHITE, bold: true, align: "center", valign: "middle", fontFace: "Arial" });
});

// Arrow connectors
for (let i = 0; i < 3; i++) {
  slide.addText("→", { x: 3.1 + i * 3.2, y: 3.0, w: 0.5, fontSize: 24, color: ACCENT, align: "center", fontFace: "Arial" });
}

// ===== SLIDE 5: PHASE 1 DETAIL =====
slide = pres.addSlide();
slide.background = { color: WHITE };
slide.addText("Phase 1: SmartMove + 탄소저감", { x: 0.5, y: 0.3, w: 12, fontSize: 28, color: NAVY, bold: true, fontFace: "Arial Black" });
slide.addText("스마트폰 센서로 7가지 교통수단을 100% 자동 감지하고, 자동차 대비 탄소저감량을 실시간 계산합니다.", {
  x: 0.5, y: 0.9, w: 12, fontSize: 13, color: NAVY, fontFace: "Arial", fill: { color: ICE }, margin: [8, 12, 8, 12]
});

// Transport detection table
const transportData = [
  ["걷기", "SmartMove", "93%+"],
  ["러닝", "SmartMove", "95%+"],
  ["자전거", "센서 + GPS", "90%+"],
  ["버스", "GPS + 정류장 지오펜스", "90%+"],
  ["지하철", "GPS 신호 소실", "85%+"],
  ["자가용", "지오펜스 (집/회사)", "90%+"],
  ["택시", "소거법", "85%+"],
];
slide.addTable(
  [["교통수단", "감지 방법", "정확도"].map(t => ({ text: t, options: { fontSize: 11, bold: true, color: WHITE, fill: { color: NAVY } } })),
   ...transportData.map(r => r.map(t => ({ text: t, options: { fontSize: 11, color: DARK, fill: { color: LIGHT_BG } } })))],
  { x: 0.5, y: 1.7, w: 6, colW: [1.5, 2.5, 1.5], border: { color: "DDDDDD", pt: 0.5 }, margin: [4, 6, 4, 6] }
);

// SSP Policy
slide.addText("SSP 정책 (적자 방지 구조)", { x: 7, y: 1.5, w: 5.5, fontSize: 16, color: NAVY, bold: true, fontFace: "Arial" });
const sspData = [
  ["CARBON", "걷기/자전거", "불가", "가능", "₩0"],
  ["AD", "광고 시청", "가능", "불가", "광고수익"],
  ["SHOP", "상품 구매", "가능", "불가", "마진"],
];
slide.addTable(
  [["유형", "적립", "교환", "토큰", "원가"].map(t => ({ text: t, options: { fontSize: 10, bold: true, color: WHITE, fill: { color: ACCENT } } })),
   ...sspData.map(r => r.map(t => ({ text: t, options: { fontSize: 10, color: DARK, fill: { color: LIGHT_BG } } })))],
  { x: 7, y: 1.9, w: 5.8, colW: [1.0, 1.2, 0.8, 0.8, 1.0], border: { color: "DDDDDD", pt: 0.5 }, margin: [4, 5, 4, 5] }
);

// Key insight
slide.addShape(pres.ShapeType.roundRect, { x: 7, y: 3.8, w: 5.8, h: 1.2, fill: { color: "E8F5E9" }, rectRadius: 0.1, line: { color: GREEN, width: 1 } });
slide.addText("CARBON SSP → 기프티콘 교환 불가 → 라브 현금 지출 ₩0\nAD SSP → 교환 가능 → 광고수익으로 자체 충당\n어떤 경우에도 적자 불가능", {
  x: 7.2, y: 3.9, w: 5.4, fontSize: 11, color: DARK, fontFace: "Arial", bold: true, lineSpacing: 16
});

// Revenue numbers
slide.addText("Phase 1 광고 수익 시뮬레이션", { x: 0.5, y: 5.3, w: 12, fontSize: 16, color: NAVY, bold: true, fontFace: "Arial" });
const revData = [
  ["10,000 MAU", "76만원/월", "912만원/년", "SSP 원가 커버 + 흑자"],
  ["50,000 MAU", "382만원/월", "4,584만원/년", "Phase 2 개발비 충당"],
  ["100,000 MAU", "763만원/월", "9,156만원/년", "독립 수익 구조"],
];
slide.addTable(
  [["규모", "월 수익", "연 환산", "의미"].map(t => ({ text: t, options: { fontSize: 11, bold: true, color: WHITE, fill: { color: NAVY } } })),
   ...revData.map(r => r.map((t, i) => ({ text: t, options: { fontSize: 11, color: i === 3 ? GREEN : DARK, bold: i === 3, fill: { color: LIGHT_BG } } })))],
  { x: 0.5, y: 5.8, w: 12, colW: [2.5, 2.5, 3, 4], border: { color: "DDDDDD", pt: 0.5 }, margin: [4, 8, 4, 8] }
);

// ===== SLIDE 6: PHASE 3 COMMERCE =====
slide = pres.addSlide();
slide.background = { color: WHITE };
slide.addText("Phase 3: 듀얼 커머스 (일반샵 + 깜깜이방)", { x: 0.5, y: 0.3, w: 12, fontSize: 28, color: NAVY, bold: true, fontFace: "Arial Black" });

// Normal Shop vs Dark Room
slide.addShape(pres.ShapeType.roundRect, { x: 0.5, y: 1.2, w: 5.8, h: 4.5, fill: { color: LIGHT_BG }, rectRadius: 0.15, line: { color: ACCENT, width: 2 } });
slide.addText("일반샵 (Normal Shop)", { x: 0.5, y: 1.3, w: 5.8, h: 0.5, fontSize: 18, color: ACCENT, bold: true, align: "center", fontFace: "Arial" });
slide.addText("정가 판매\n파트너사 이름 공개\n수수료 5~8%\n누구나 접근 가능\n멀티스포츠 6종 카테고리", {
  x: 0.8, y: 2.0, w: 5.2, fontSize: 14, color: DARK, fontFace: "Arial", lineSpacing: 22
});

slide.addShape(pres.ShapeType.roundRect, { x: 7, y: 1.2, w: 5.8, h: 4.5, fill: { color: DARK }, rectRadius: 0.15, line: { color: "E67E22", width: 2 } });
slide.addText("깜깜이방 (Dark Room)", { x: 7, y: 1.3, w: 5.8, h: 0.5, fontSize: 18, color: "E67E22", bold: true, align: "center", fontFace: "Arial" });
slide.addText("할인가 판매 (재고 처리)\n파트너사 완전 익명 (LB 명의)\n수수료 8~20%\nPhase 1 활성 + SSP 입장권\n플래시 세일 (한정 수량)", {
  x: 7.3, y: 2.0, w: 5.2, fontSize: 14, color: ICE, fontFace: "Arial", lineSpacing: 22
});

// Entry ticket
slide.addShape(pres.ShapeType.roundRect, { x: 3, y: 6.0, w: 7, h: 1.0, fill: { color: "FFF3E0" }, rectRadius: 0.1, line: { color: "E67E22", width: 1 } });
slide.addText("깜깜이방 입장권: 월 500 AD/SHOP SSP (광고 시청으로 충당 → 라브 추가 비용 ₩0)", {
  x: 3.2, y: 6.1, w: 6.6, fontSize: 13, color: DARK, bold: true, fontFace: "Arial", valign: "middle"
});

// ===== SLIDE 7: PHASE 4 STO =====
slide = pres.addSlide();
slide.background = { color: NAVY };
slide.addText("Phase 4: 탄소 토큰증권 (STO) + 글로벌", { x: 0.5, y: 0.3, w: 12, fontSize: 28, color: WHITE, bold: true, fontFace: "Arial Black" });

// Two tracks
slide.addShape(pres.ShapeType.roundRect, { x: 0.5, y: 1.2, w: 5.8, h: 5.0, fill: { color: "16213E" }, rectRadius: 0.15, line: { color: "2ECC71", width: 2 } });
slide.addText("Track 1: 한국 STO", { x: 0.5, y: 1.4, w: 5.8, h: 0.5, fontSize: 20, color: "2ECC71", bold: true, align: "center", fontFace: "Arial" });
slide.addText("법적 근거: 자본시장법 + 전자증권법 (2026.01 시행)\n거래소: NXT 또는 KDX\n구조: 증권사 파트너 API 연동\n투자자 신뢰: 높음 (규제 하)\n비용: 1~3억원\n타겟: 2027 Q1-Q2 런칭", {
  x: 0.8, y: 2.2, w: 5.2, fontSize: 13, color: ICE, fontFace: "Arial", lineSpacing: 20
});

slide.addShape(pres.ShapeType.roundRect, { x: 7, y: 1.2, w: 5.8, h: 5.0, fill: { color: "16213E" }, rectRadius: 0.15, line: { color: "E67E22", width: 2 } });
slide.addText("Track 2: 해외 블록체인", { x: 7, y: 1.4, w: 5.8, h: 0.5, fontSize: 20, color: "E67E22", bold: true, align: "center", fontFace: "Arial" });
slide.addText("법인: 싱가포르 또는 두바이\n블록체인: Polygon/Base L2 (ERC-20)\n보안감사: CertiK/Trail of Bits\n유동성: 전 세계 (DEX 상장)\n비용: 1.3~7.6억원\n타겟: 2027 Q3-Q4 런칭", {
  x: 7.3, y: 2.2, w: 5.2, fontSize: 13, color: ICE, fontFace: "Arial", lineSpacing: 20
});

// B2B ESG
slide.addShape(pres.ShapeType.roundRect, { x: 3.5, y: 6.5, w: 6, h: 0.7, fill: { color: ACCENT }, rectRadius: 0.1 });
slide.addText("B2B 기업 ESG 탄소크레딧 판매: 연 5~20억원 잠재 수익", {
  x: 3.5, y: 6.5, w: 6, h: 0.7, fontSize: 14, color: WHITE, bold: true, align: "center", valign: "middle", fontFace: "Arial"
});

// ===== SLIDE 8: RISK =====
slide = pres.addSlide();
slide.background = { color: WHITE };
slide.addText("리스크 및 대응", { x: 0.5, y: 0.3, w: 12, fontSize: 28, color: NAVY, bold: true, fontFace: "Arial Black" });

const riskData = [
  ["MAU 하락 지속", "높음", "리뉴얼 + GTM 전략 (기존 13만 회원 활용)"],
  ["iOS Wi-Fi 스캔 차단", "높음", "GPS 속도 + 정류장 지오펜스 + CMMotion 대안"],
  ["1인 개발 체제", "중간", "Claude AI 병렬 코드생성, Spec-Kit 자동화"],
  ["STO 규제 불확실성", "중간", "FSC 사전컨설팅 + 규제 샌드박스 참여"],
  ["딜러 익명성 유출", "높음", "API 필터링 + 접근 제한 + 감사 로그"],
  ["토큰 가격 붕괴", "중간", "STO 구조로 투기 제한 + 소각 메커니즘"],
];
slide.addTable(
  [["리스크", "심각도", "대응 전략"].map(t => ({ text: t, options: { fontSize: 12, bold: true, color: WHITE, fill: { color: NAVY } } })),
   ...riskData.map(r => r.map((t, i) => ({
     text: t,
     options: {
       fontSize: 11,
       color: i === 1 && t === "높음" ? RED : DARK,
       bold: i === 1,
       fill: { color: LIGHT_BG }
     }
   })))],
  { x: 0.5, y: 1.2, w: 12, colW: [3, 1.5, 7.5], border: { color: "DDDDDD", pt: 0.5 }, margin: [6, 10, 6, 10] }
);

// ===== SLIDE 9: TIMELINE =====
slide = pres.addSlide();
slide.background = { color: WHITE };
slide.addText("추진 일정", { x: 0.5, y: 0.3, w: 12, fontSize: 28, color: NAVY, bold: true, fontFace: "Arial Black" });

const timeData = [
  ["2026 Q2", "Pre-Dev + Phase 1 시작", "BRD/PRD 완료, 개발 착수"],
  ["2026 Q3", "Phase 1 완료 + 출시", "앱스토어 출시, MAU 10,000 목표"],
  ["2026 Q4~2027 Q1", "Phase 2 멀티스포츠", "관광공사 MOU, 파크런 시작"],
  ["2027 Q1~Q3", "Phase 3 커머스", "일반샵+깜깜이방, 매출 발생"],
  ["2027 Q3~2028 Q1", "Phase 4 STO", "토큰증권 런칭, 글로벌 확장"],
];
slide.addTable(
  [["기간", "Phase", "핵심 마일스톤"].map(t => ({ text: t, options: { fontSize: 12, bold: true, color: WHITE, fill: { color: NAVY } } })),
   ...timeData.map(r => r.map(t => ({ text: t, options: { fontSize: 12, color: DARK, fill: { color: LIGHT_BG } } })))],
  { x: 0.5, y: 1.2, w: 12, colW: [3, 3.5, 5.5], border: { color: "DDDDDD", pt: 0.5 }, margin: [8, 12, 8, 12] }
);

// Total timeline callout
slide.addShape(pres.ShapeType.roundRect, { x: 3, y: 5.5, w: 7, h: 1.5, fill: { color: NAVY }, rectRadius: 0.15 });
slide.addText("총 개발 기간", { x: 3, y: 5.6, w: 7, fontSize: 12, color: GRAY, align: "center", fontFace: "Arial" });
slide.addText("73주 (약 18개월)", { x: 3, y: 5.9, w: 7, fontSize: 32, color: WHITE, bold: true, align: "center", fontFace: "Arial Black" });
slide.addText("가속 시 56~62주 (약 14~15.5개월)", { x: 3, y: 6.5, w: 7, fontSize: 14, color: GREEN, align: "center", fontFace: "Arial" });

// ===== SLIDE 10: CONCLUSION =====
slide = pres.addSlide();
slide.background = { color: NAVY };
slide.addText("결론 및 승인 요청", { x: 0.5, y: 0.3, w: 12, fontSize: 28, color: WHITE, bold: true, fontFace: "Arial Black" });
slide.addShape(pres.ShapeType.rect, { x: 0.5, y: 0.9, w: 3, h: 0.05, fill: { color: ACCENT } });

slide.addText("현재 MAU ~4,000, 전 지표 하락 중인 상황에서\n앱 리뉴얼은 선택이 아닌 필수입니다.", {
  x: 0.8, y: 1.5, w: 11, fontSize: 18, color: ICE, fontFace: "Arial", lineSpacing: 28
});

const approvalItems = [
  "앱 리뉴얼 프로젝트 승인 (Phase 1~4, 73주)",
  "기존 DB 보존 + 신규 개발 (Aurora MySQL 107개 테이블 유지)",
  "STO Phase 4 사전 준비 (FSC 컨설팅 + 법무 검토)",
  "인프라 비용 절감 계속 (190만 → 123만원/월)",
];

approvalItems.forEach((item, i) => {
  slide.addShape(pres.ShapeType.roundRect, { x: 0.8, y: 2.8 + i * 1.0, w: 11.5, h: 0.8, fill: { color: "16213E" }, rectRadius: 0.1, line: { color: ACCENT, width: 1 } });
  slide.addText(`${i + 1}`, { x: 1.0, y: 2.85 + i * 1.0, w: 0.5, h: 0.7, fontSize: 20, color: ACCENT, bold: true, fontFace: "Arial Black", valign: "middle" });
  slide.addText(item, { x: 1.6, y: 2.85 + i * 1.0, w: 10.5, h: 0.7, fontSize: 15, color: WHITE, fontFace: "Arial", valign: "middle" });
});

slide.addText("감사합니다", { x: 0, y: 6.8, w: 13.33, fontSize: 20, color: GRAY, align: "center", fontFace: "Arial" });

// ===== GENERATE =====
pres.writeFile({ fileName: "WB_App_Renewal_Shareholder_Report_2026.pptx" })
  .then(() => console.log("PPT generated: WB_App_Renewal_Shareholder_Report_2026.pptx"))
  .catch(err => console.error("Error:", err));
