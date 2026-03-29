const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
        ShadingType, PageNumber, PageBreak, LevelFormat } = require('docx');
const fs = require('fs');

// McKinsey style colors
const DARK_BLUE = "003366";
const ACCENT_BLUE = "0066CC";
const LIGHT_BLUE = "D5E8F0";
const DARK_GRAY = "333333";
const LIGHT_GRAY = "F5F5F5";
const WHITE = "FFFFFF";
const RED = "CC3333";
const GREEN = "339933";

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const noBorder = { style: BorderStyle.NONE, size: 0 };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };
const cellMargins = { top: 80, bottom: 80, left: 120, right: 120 };

// Helper functions
function heading1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    children: [new TextRun({ text, bold: true, size: 36, font: "Arial", color: DARK_BLUE })]
  });
}

function heading2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 300, after: 150 },
    children: [new TextRun({ text, bold: true, size: 28, font: "Arial", color: DARK_BLUE })]
  });
}

function heading3(text) {
  return new Paragraph({
    spacing: { before: 200, after: 100 },
    children: [new TextRun({ text, bold: true, size: 24, font: "Arial", color: ACCENT_BLUE })]
  });
}

function bodyText(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 120 },
    children: [new TextRun({ text, size: 22, font: "Arial", color: DARK_GRAY, ...opts })]
  });
}

function keyMessage(text) {
  return new Paragraph({
    spacing: { before: 200, after: 200 },
    shading: { fill: LIGHT_BLUE, type: ShadingType.CLEAR },
    indent: { left: 360, right: 360 },
    children: [new TextRun({ text: "KEY MESSAGE: ", bold: true, size: 22, font: "Arial", color: DARK_BLUE }),
               new TextRun({ text, size: 22, font: "Arial", color: DARK_GRAY })]
  });
}

function makeRow(cells, isHeader = false) {
  return new TableRow({
    children: cells.map((text, i) => new TableCell({
      borders,
      width: { size: Math.floor(9360 / cells.length), type: WidthType.DXA },
      shading: { fill: isHeader ? DARK_BLUE : (i === 0 ? LIGHT_GRAY : WHITE), type: ShadingType.CLEAR },
      margins: cellMargins,
      verticalAlign: "center",
      children: [new Paragraph({
        children: [new TextRun({
          text: String(text),
          bold: isHeader || i === 0,
          size: isHeader ? 20 : 20,
          font: "Arial",
          color: isHeader ? WHITE : DARK_GRAY
        })]
      })]
    }))
  });
}

function makeTable(headers, rows) {
  const colWidth = Math.floor(9360 / headers.length);
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: headers.map(() => colWidth),
    rows: [
      makeRow(headers, true),
      ...rows.map(r => makeRow(r))
    ]
  });
}

function spacer() {
  return new Paragraph({ spacing: { before: 100, after: 100 }, children: [] });
}

// ==================== DOCUMENT ====================

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, font: "Arial", color: DARK_BLUE },
        paragraph: { spacing: { before: 360, after: 240 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: "Arial", color: DARK_BLUE },
        paragraph: { spacing: { before: 240, after: 180 }, outlineLevel: 1 } },
    ]
  },
  numbering: {
    config: [
      { reference: "bullets",
        levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ]
  },
  sections: [
    // ===== COVER PAGE =====
    {
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
        }
      },
      children: [
        spacer(), spacer(), spacer(), spacer(), spacer(),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
          children: [new TextRun({ text: "CONFIDENTIAL", size: 24, font: "Arial", color: RED, bold: true })]
        }),
        spacer(), spacer(),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "(주)라이트브라더스", size: 48, font: "Arial", color: DARK_BLUE, bold: true })]
        }),
        spacer(),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "앱 리뉴얼 사업 보고서", size: 40, font: "Arial", color: DARK_BLUE })]
        }),
        spacer(),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "2026년 정기 주주총회", size: 28, font: "Arial", color: ACCENT_BLUE })]
        }),
        spacer(), spacer(), spacer(), spacer(), spacer(), spacer(),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "2026년 3월 31일", size: 24, font: "Arial", color: DARK_GRAY })]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "대표이사 김병수", size: 24, font: "Arial", color: DARK_GRAY })]
        }),
      ]
    },

    // ===== MAIN CONTENT =====
    {
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
        }
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [new TextRun({ text: "CONFIDENTIAL | 라이트브라더스 앱 리뉴얼", size: 16, font: "Arial", color: "999999", italics: true })]
          })]
        })
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "Page ", size: 16, font: "Arial", color: "999999" }),
                       new TextRun({ children: [PageNumber.CURRENT], size: 16, font: "Arial", color: "999999" })]
          })]
        })
      },
      children: [
        // ===== 1. EXECUTIVE SUMMARY =====
        heading1("1. Executive Summary"),
        keyMessage("자전거 전용 앱에서 '멀티스포츠 탄소저감 플랫폼'으로 전환하여 하락 추세를 반전시키고, 4단계 성장 전략으로 STO(토큰증권)까지 확장합니다."),
        spacer(),
        heading3("현재 상황 (As-Is)"),
        makeTable(
          ["지표", "수치", "추세"],
          [
            ["전체 MAU (앱+웹)", "~4,000명", "▼ 30~35% 하락"],
            ["Android MAU", "1,490명", "▲ 11% 성장"],
            ["웹 MAU", "~2,000명", "▼ 32% 하락"],
            ["Android 설치", "7,180명", "누적"],
            ["Android 평점", "1.00★", "심각"],
            ["월 인프라 비용", "~190만원", "비용 절감 진행 중"],
          ]
        ),
        spacer(),
        heading3("목표 상황 (To-Be)"),
        makeTable(
          ["시점", "MAU 목표", "현재 대비", "핵심 수익원"],
          [
            ["Phase 1 (3개월 후)", "10,000", "2.5배", "광고+오퍼월"],
            ["Phase 2 (9개월 후)", "30,000", "7.5배", "+프리미엄 구독"],
            ["Phase 3 (15개월 후)", "50,000", "12.5배", "+커머스 수수료"],
            ["Phase 4 (18개월 후)", "100,000", "25배", "+토큰증권(STO)"],
          ]
        ),

        // ===== 2. WHY RENEWAL =====
        new Paragraph({ children: [new PageBreak()] }),
        heading1("2. 리뉴얼 필요성"),
        keyMessage("기술부채 해소 + 시장 공백 선점 + 수익 다각화의 세 가지 이유로 리뉴얼이 필수적입니다."),
        spacer(),
        heading3("기술부채 (Technical Debt)"),
        makeTable(
          ["문제", "현재 상태", "리뉴얼 후"],
          [
            ["코드 품질", "JavaScript 11만줄, 테스트 0%", "TypeScript + TDD 80%+"],
            ["보안", "API키 하드코딩, 커스텀 토큰", "환경변수 + Firebase Auth"],
            ["유지보수", "Spring Boot 7개 프로젝트 방치", "Express+Prisma 단일 API"],
            ["인프라 비용", "월 190만원 (2개 AWS 계정)", "월 123만원 (통합)"],
          ]
        ),
        spacer(),
        heading3("시장 기회"),
        makeTable(
          ["시장", "규모", "현재 경쟁 공백"],
          [
            ["한국 러닝 인구", "1,000만명", "크루+정기런+랭킹 통합 앱 없음"],
            ["자전거 관광", "60선 대표코스", "디지털 스탬프 투어 없음"],
            ["ESG 탄소저감", "정부 정책 부합", "개인 탄소저감 자동 측정 앱 없음"],
            ["토큰증권(STO)", "2026년 전자증권법 시행", "탄소+활동 기반 STO 선례 없음"],
          ]
        ),

        // ===== 3. FOUR-PHASE STRATEGY =====
        new Paragraph({ children: [new PageBreak()] }),
        heading1("3. 4단계 성장 전략"),
        keyMessage("SmartMove(탄소저감) → 멀티스포츠 챌린지 → 커머스 → STO 순서로 확장하여, 각 단계가 다음 단계의 기반이 됩니다."),
        spacer(),
        makeTable(
          ["Phase", "기간", "핵심 기능", "수익원"],
          [
            ["1. SmartMove", "14주", "걷기/러닝/자전거 자동감지\n탄소저감 계산\nSSP 포인트", "광고+오퍼월\n(월 76만~763만)"],
            ["2. 멀티스포츠", "18주", "GPX 코스 자동생성\n양방향 랭킹\n파크런 이벤트", "프리미엄 구독\n스폰서십"],
            ["3. 커머스", "18주", "일반샵+깜깜이방\nAI 상품설명 자동생성\n운영 완전 자동화", "커머스 수수료\n(8~20%)"],
            ["4. STO", "20주", "탄소 토큰증권\n한국 STO + 해외 블록체인", "토큰 거래\nB2B ESG"],
          ]
        ),
        spacer(),
        heading3("총 일정: 73주 (약 18개월), 가속 시 56~62주"),

        // ===== 4. PHASE 1 DEEP DIVE =====
        new Paragraph({ children: [new PageBreak()] }),
        heading1("4. Phase 1 상세: SmartMove + 탄소저감"),
        keyMessage("스마트폰 센서로 걷기/러닝/자전거/버스/지하철을 100% 자동 감지하고, T맵 자동차 경로 대비 탄소저감량을 실시간 계산합니다."),
        spacer(),
        heading3("핵심 기술: 교통수단 100% 자동 감지"),
        makeTable(
          ["교통수단", "감지 방법", "예상 정확도"],
          [
            ["걷기", "SmartMove (Platform API)", "93%+"],
            ["러닝", "SmartMove (Platform API)", "95%+"],
            ["자전거", "SmartMove + GPS 속도", "90%+"],
            ["버스", "GPS 속도 + 정류장 지오펜스", "90%+ (서울)"],
            ["지하철", "GPS 신호 소실 감지", "85%+"],
            ["자가용", "지오펜스 (집/회사 반경)", "90%+"],
            ["택시", "소거법 (위 전부 아니면)", "85%+"],
          ]
        ),
        spacer(),
        heading3("SSP 포인트 정책 (Plan C: 적자 방지 구조)"),
        makeTable(
          ["SSP 유형", "적립 경로", "기프티콘 교환", "토큰 전환", "라브 원가"],
          [
            ["CARBON SSP", "걷기/자전거/대중교통", "불가", "가능 (Phase 4)", "₩0"],
            ["AD SSP", "광고 시청, 오퍼월", "가능", "불가", "광고수익 충당"],
            ["SHOP SSP", "상품 구매", "가능", "불가", "커머스 마진"],
          ]
        ),
        spacer(),
        bodyText("CARBON SSP는 기프티콘 교환이 불가하므로 라브 현금 지출 제로. AD/SHOP SSP만 교환 가능하며 이는 광고수익과 커머스 마진으로 자체 충당. 어떤 경우에도 적자 불가능한 구조.", { bold: true }),

        // ===== 5. REVENUE MODEL =====
        new Paragraph({ children: [new PageBreak()] }),
        heading1("5. 수익 모델"),
        keyMessage("Phase 1부터 광고 수익으로 SSP 원가를 커버하고, Phase 3에서 커머스 수수료, Phase 4에서 토큰증권으로 수익을 다각화합니다."),
        spacer(),
        heading3("Phase 1 광고 수익 (즉시 수익 발생)"),
        makeTable(
          ["수익원", "방식", "MAU 1만 기준 월 수익"],
          [
            ["AdMob 리워드 동영상", "활동 완료 후 '2배 SSP' 자발적 시청", "~16만원"],
            ["오퍼월 (애디슨 AdiSON)", "미션센터 탭, 앱설치/가입 미션", "~50만원"],
            ["배너 (카카오 애드핏)", "대시보드 하단", "~10만원"],
            ["합계", "", "~76만원/월 (연 912만원)"],
          ]
        ),
        spacer(),
        heading3("3년 수익 전망"),
        makeTable(
          ["Phase", "월 수익 (안정기)", "주요 수익원"],
          [
            ["Phase 1", "76만~763만원", "광고 + 오퍼월"],
            ["Phase 2", "1,000만~3,000만원", "+ 프리미엄 구독 + 스폰서십"],
            ["Phase 3", "3,000만~8,000만원", "+ 커머스 수수료 (8~20%)"],
            ["Phase 4", "5,000만~2억원", "+ STO 거래 + B2B ESG"],
          ]
        ),
        spacer(),
        heading3("Phase 3 깜깜이방 (익명 할인 마켓)"),
        bodyText("입점 파트너사의 재고를 라이트브라더스 명의로 익명 판매. 딜러 정보 완전 비공개."),
        makeTable(
          ["", "일반샵", "깜깜이방"],
          [
            ["가격", "정가", "할인가 (재고 처리)"],
            ["파트너 노출", "공개", "익명 (LB 명의)"],
            ["수수료", "5~8%", "8~20%"],
            ["입장 조건", "누구나", "Phase 1 활성 + SSP 입장권"],
          ]
        ),

        // ===== 6. INVESTMENT =====
        new Paragraph({ children: [new PageBreak()] }),
        heading1("6. 투자 및 비용"),
        keyMessage("1인(CEO)+Claude AI 체제로 인건비 최소화. 인프라 비용도 190만→123만원/월로 절감. Phase 4 STO 진입 시 별도 자금 필요."),
        spacer(),
        makeTable(
          ["항목", "비용", "비고"],
          [
            ["Phase 1~3 개발", "CEO + Claude", "추가 인건비 없음"],
            ["인프라 (현재)", "190만원/월", "AWS 2개 계정"],
            ["인프라 (리뉴얼 후)", "123만원/월", "35% 절감"],
            ["외부 API (T맵, CODEF 등)", "45~80만원/월", "탄소저감+MRV"],
            ["광고 SDK (AdMob, 오퍼월)", "무료", "수익만 발생"],
            ["Phase 4 STO (Track 1)", "1~3억원", "증권법 법무+FSC"],
            ["Phase 4 STO (Track 2)", "1.3~7.6억원", "해외 블록체인 (선택)"],
          ]
        ),

        // ===== 7. RISK =====
        new Paragraph({ children: [new PageBreak()] }),
        heading1("7. 리스크 및 대응"),
        spacer(),
        makeTable(
          ["리스크", "심각도", "대응 전략"],
          [
            ["MAU 하락 지속", "높음", "리뉴얼+GTM 전략으로 반전 (목표: 3개월 내 2.5배)"],
            ["iOS Wi-Fi 스캔 차단", "높음", "GPS 속도+정류장 지오펜스+CMMotion 대안 확보"],
            ["1인 개발 체제", "중간", "Claude AI 병렬 코드생성, Spec-Kit 자동화"],
            ["STO 규제 불확실성", "중간", "FSC 사전컨설팅 + 규제 샌드박스 참여"],
            ["딜러 익명성 유출", "높음", "API 필터링 + 접근 제한 (2~3명) + 감사 로그"],
            ["토큰 가격 붕괴", "중간", "STO 구조로 투기 제한 + 소각 메커니즘"],
          ]
        ),

        // ===== 8. AI DEV TEAM (NEW) =====
        new Paragraph({ children: [new PageBreak()] }),
        heading1("8. AI 개발팀 구축 효과"),
        keyMessage("6개 AI 팀 + 16개 QA 에이전트로 구성된 자동화 개발 파이프라인을 구축하여, 3~4명 규모의 개발팀과 동등한 생산성을 1인 체제에서 달성합니다."),
        spacer(),
        heading3("AI 개발팀 구성 (Dev Pipeline)"),
        makeTable(
          ["팀", "역할", "에이전트 수", "인건비 대체 효과"],
          [
            ["T1 일정기획", "스프린트 분해 + 일정 분석", "2개", "PM 1명 (월 500만원)"],
            ["T2 구현설계", "아키텍처 + API + 보안 설계", "6개", "시니어 개발자 1명 (월 600만원)"],
            ["T3 개발", "프론트/백엔드/인프라 병렬 코딩", "3~30개", "개발자 3명 (월 1,500만원)"],
            ["T4 QA", "16개 에이전트 3단계 자동 검수", "16개", "QA 1명 (월 400만원)"],
            ["T5 배포", "빌드 검증 + 롤백 + 문서화", "2개", "DevOps 1명 (월 500만원)"],
            ["T6 보안", "STRIDE + OWASP 자동 스캔", "2개", "보안 전문가 (월 600만원)"],
          ]
        ),
        spacer(),
        heading3("인건비 절감 효과"),
        makeTable(
          ["항목", "일반 스타트업", "AI 개발팀 (라이트브라더스)", "절감"],
          [
            ["개발자 3명", "월 1,500만원", "₩0 (Claude 구독만)", "100%"],
            ["QA 1명", "월 400만원", "₩0 (AI 자동)", "100%"],
            ["PM 1명", "월 500만원", "₩0 (T1 자동)", "100%"],
            ["DevOps 1명", "월 500만원", "₩0 (T5 자동)", "100%"],
            ["보안 전문가 (외주)", "월 300만원", "₩0 (T6 자동)", "100%"],
            ["합계", "월 3,200만원", "Claude 구독 ~20만원", "99.4%"],
            ["연간", "3.84억원", "~240만원", "연 3.6억원 절감"],
          ]
        ),
        spacer(),
        heading3("속도 향상 효과"),
        makeTable(
          ["항목", "AI 팀 없이", "AI 팀 적용", "개선"],
          [
            ["Phase 1~3 완료", "38주", "25.5주", "33% 단축"],
            ["첫 출시", "Week 10", "Week 7", "3주 빠름"],
            ["스프린트 1회", "10일", "4일", "60% 단축"],
            ["QA 시간", "2일 (수동)", "0.5일 (자동)", "75% 단축"],
            ["코드 리뷰", "대표 직접", "16개 에이전트 자동", "84% 발견율"],
          ]
        ),
        spacer(),
        heading3("대표님 역할 변화"),
        makeTable(
          ["업무", "이전", "이후"],
          [
            ["코딩", "직접 지시+확인", "결과만 확인"],
            ["설계", "직접 기획", "T2 산출물 승인 (15분)"],
            ["리뷰", "직접 읽기", "T4 요약 리포트 확인"],
            ["보안", "생략", "T6 자동 (CRITICAL 시만 보고)"],
            ["핵심 역할", "개발자", "의사결정자"],
          ]
        ),

        // ===== 9. TIMELINE =====
        new Paragraph({ children: [new PageBreak()] }),
        heading1("9. 추진 일정"),
        spacer(),
        makeTable(
          ["기간", "Phase", "핵심 마일스톤"],
          [
            ["2026 Q2", "Pre-Dev + Phase 1 시작", "BRD/PRD 완료, 개발 착수"],
            ["2026 Q3", "Phase 1 완료", "앱스토어 출시, MAU 10,000"],
            ["2026 Q4~2027 Q1", "Phase 2", "멀티스포츠, 관광공사 MOU"],
            ["2027 Q1~Q3", "Phase 3", "커머스 런칭, 매출 발생"],
            ["2027 Q3~2028 Q1", "Phase 4", "STO 런칭, 글로벌 확장"],
          ]
        ),

        // ===== 10. CONCLUSION =====
        new Paragraph({ children: [new PageBreak()] }),
        heading1("10. 결론 및 승인 요청"),
        spacer(),
        keyMessage("현재 MAU ~4,000, 전 지표 하락 중인 상황에서 앱 리뉴얼은 선택이 아닌 필수입니다. SmartMove + SSP + 광고 수익 모델로 Phase 1부터 흑자 구조를 만들고, 4단계 성장 전략으로 STO(토큰증권)까지 확장합니다."),
        spacer(),
        heading3("승인 요청 사항"),
        makeTable(
          ["항목", "내용"],
          [
            ["앱 리뉴얼 프로젝트 승인", "Phase 1~4 전체 로드맵 (73주)"],
            ["기존 DB 보존 + 신규 개발", "Aurora MySQL 107개 테이블 유지, 코드만 재작성"],
            ["STO Phase 4 사전 준비", "FSC 사전컨설팅 + 증권법 법무 검토 착수"],
            ["인프라 비용 절감 계속", "190만→123만원/월 (연 804만원 절감)"],
          ]
        ),
        spacer(), spacer(),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "- 이상 -", size: 24, font: "Arial", color: DARK_GRAY, bold: true })]
        }),
      ]
    }
  ]
});

// Generate
Packer.toBuffer(doc).then(buffer => {
  const outPath = "WB_App_Renewal_Shareholder_Report_2026.docx";
  fs.writeFileSync(outPath, buffer);
  console.log("Word report generated:", outPath);
  console.log("Size:", (buffer.length / 1024).toFixed(1), "KB");
});
