/**
 * 채널톡 CS 대화 AI 분석 스크립트
 *
 * collect.js로 수집한 대화 데이터를 Claude API로 분석합니다.
 * - 문의 유형 자동 분류
 * - 감성 분석 (시작/종료 시점)
 * - 감정 태그
 * - 해결 여부 및 품질 평가
 * - 대화 요약
 * - 키워드 추출
 *
 * 사용법:
 *   node analyze.js                              # output/ 최신 full_*.json 분석
 *   node analyze.js ./output/2026-03-28_full_closed.json
 *   node analyze.js --limit 10                   # 10건만 분석 (테스트용)
 *   node analyze.js --dry-run                    # API 호출 없이 비용 추정만
 */

require('dotenv').config();
const https = require('https');
const fs = require('fs');
const path = require('path');

// ─── 설정 ─────────────────────────────────────────

const CONFIG = {
  apiKey: process.env.ANTHROPIC_API_KEY,
  model: 'claude-haiku-4-5-20251001',
  maxTokens: 500,
  // Rate limit 안전 마진: 초당 2요청
  requestDelayMs: 500,
  // 비용 추정 (Haiku 4.5 기준, $/MTok)
  costPerInputMTok: 1.0,
  costPerOutputMTok: 5.0,
};

// ─── 분석 프롬프트 ────────────────────────────────

const SYSTEM_PROMPT = `당신은 자전거 브랜드 "라이트브라더스"의 CS 대화 분석 전문가입니다.
주어진 고객 상담 대화를 분석하여 반드시 JSON으로만 응답하세요.
다른 텍스트는 절대 포함하지 마세요.`;

function extractText(message) {
  // _text 필드가 있으면 사용 (collect.js에서 추출한 것)
  if (message._text) return message._text;

  // plainText 우선
  if (message.plainText && message.plainText.trim()) {
    return message.plainText.trim();
  }

  // blocks에서 추출
  if (message.blocks && message.blocks.length > 0) {
    return message.blocks
      .filter((b) => b.type === 'text' && b.value)
      .map((b) => b.value.replace(/<[^>]*>/g, ''))
      .join('\n')
      .trim();
  }

  return '';
}

function buildUserPrompt(conversation) {
  const messages = conversation.messages || [];

  // 시스템 로그 메시지 제외, 텍스트가 있는 것만
  const transcript = messages
    .filter((m) => !m.log && extractText(m))
    .map((m) => {
      const role = m.personType === 'user' ? '고객' : '상담사';
      return `[${role}] ${extractText(m)}`;
    })
    .join('\n');

  // 대화가 비어있으면 분석 불가
  if (!transcript.trim()) return null;

  // 토큰 절약: 최대 3000자로 제한
  const trimmed = transcript.length > 3000
    ? transcript.slice(0, 1500) + '\n...(중략)...\n' + transcript.slice(-1500)
    : transcript;

  return `다음 CS 대화를 분석하세요:
---
${trimmed}
---

아래 JSON 형식으로만 응답하세요:
{
  "category": "배송문의|환불교환|상품정보|수리AS|계정문의|결제문의|예약문의|기타",
  "sub_category": "세부 분류 (자유 입력, 10자 이내)",
  "sentiment_open": "positive|neutral|negative",
  "sentiment_close": "positive|neutral|negative",
  "emotion_tags": ["해당되는 감정만 선택: 만족, 감사, 기대, 중립, 불안, 불만, 분노, 좌절, 실망"],
  "resolved": true 또는 false,
  "resolution_quality": 1에서 5 사이 정수 (1=최악, 5=완벽),
  "summary": "50자 이내 핵심 요약",
  "keywords": ["핵심 키워드 3개 이내"]
}`;
}

// ─── Claude API 호출 ──────────────────────────────

function callClaude(systemPrompt, userPrompt) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: CONFIG.model,
      max_tokens: CONFIG.maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const options = {
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CONFIG.apiKey,
        'anthropic-version': '2023-06-01',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 429) {
          reject(new Error('RATE_LIMIT'));
          return;
        }
        if (res.statusCode >= 400) {
          reject(new Error(`HTTP ${res.statusCode}: ${data.slice(0, 300)}`));
          return;
        }
        try {
          const parsed = JSON.parse(data);
          const text = parsed.content?.[0]?.text || '';
          const usage = parsed.usage || {};
          resolve({ text, usage });
        } catch (e) {
          reject(new Error(`응답 파싱 실패: ${data.slice(0, 200)}`));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ─── JSON 파싱 (LLM 응답에서 추출) ──────────────

function parseAnalysisResult(text) {
  // ```json ... ``` 블록 안에 있을 수 있음
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;

  try {
    return JSON.parse(jsonMatch[0]);
  } catch {
    return null;
  }
}

// ─── 인자 파싱 ────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    inputFile: null,
    limit: Infinity,
    dryRun: false,
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--limit' && args[i + 1]) {
      options.limit = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--dry-run') {
      options.dryRun = true;
    } else if (!args[i].startsWith('--')) {
      options.inputFile = args[i];
    }
  }

  return options;
}

// ─── 입력 파일 찾기 ───────────────────────────────

function findInputFile(specified) {
  if (specified) {
    if (!fs.existsSync(specified)) {
      console.error(`❌ 파일을 찾을 수 없습니다: ${specified}`);
      process.exit(1);
    }
    return specified;
  }

  const outputDir = path.join(__dirname, 'output');
  if (!fs.existsSync(outputDir)) {
    console.error('❌ output/ 폴더가 없습니다. 먼저 collect.js --with-messages를 실행하세요.');
    process.exit(1);
  }

  const files = fs.readdirSync(outputDir)
    .filter((f) => f.includes('full_') && f.endsWith('.json'))
    .sort()
    .reverse();

  if (files.length === 0) {
    console.error('❌ full_*.json 파일이 없습니다. collect.js --with-messages로 수집하세요.');
    process.exit(1);
  }

  return path.join(outputDir, files[0]);
}

// ─── 비용 추정 ────────────────────────────────────

function estimateCost(conversations) {
  let totalInputChars = 0;

  for (const conv of conversations) {
    const prompt = buildUserPrompt(conv);
    if (prompt) {
      totalInputChars += SYSTEM_PROMPT.length + prompt.length;
    }
  }

  // 대략적 토큰 추정: 한국어 1글자 ≈ 1.5~2 토큰
  const estimatedInputTokens = totalInputChars * 1.8;
  const estimatedOutputTokens = conversations.length * 200; // 대화당 ~200 토큰 출력

  const inputCost = (estimatedInputTokens / 1_000_000) * CONFIG.costPerInputMTok;
  const outputCost = (estimatedOutputTokens / 1_000_000) * CONFIG.costPerOutputMTok;

  return {
    conversations: conversations.length,
    estimatedInputTokens: Math.round(estimatedInputTokens),
    estimatedOutputTokens: Math.round(estimatedOutputTokens),
    inputCost,
    outputCost,
    totalCost: inputCost + outputCost,
  };
}

// ─── 결과 저장 ────────────────────────────────────

function saveResults(results, inputFile) {
  const outputDir = path.join(__dirname, 'output');
  const timestamp = new Date().toISOString().slice(0, 10);
  const filepath = path.join(outputDir, `${timestamp}_analysis.json`);

  fs.writeFileSync(filepath, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`\n💾 분석 결과 저장: ${filepath}`);
  return filepath;
}

// ─── 분석 결과 요약 리포트 ────────────────────────

function printReport(results) {
  const successful = results.filter((r) => r.analysis);

  console.log('\n' + '='.repeat(50));
  console.log(' 📊 CS 분석 리포트');
  console.log('='.repeat(50));
  console.log(`  분석 성공: ${successful.length}건 / 전체 ${results.length}건`);

  // 카테고리 분포
  const categories = {};
  for (const r of successful) {
    const cat = r.analysis.category || '미분류';
    categories[cat] = (categories[cat] || 0) + 1;
  }

  console.log('\n  📁 문의 유형 분포:');
  const sortedCats = Object.entries(categories).sort((a, b) => b[1] - a[1]);
  for (const [cat, count] of sortedCats) {
    const pct = ((count / successful.length) * 100).toFixed(1);
    const bar = '█'.repeat(Math.round(count / successful.length * 20));
    console.log(`    ${cat.padEnd(10)} ${String(count).padStart(4)}건 (${pct}%) ${bar}`);
  }

  // 감성 분포
  const sentiments = { positive: 0, neutral: 0, negative: 0 };
  for (const r of successful) {
    const s = r.analysis.sentiment_close || 'neutral';
    sentiments[s] = (sentiments[s] || 0) + 1;
  }

  console.log('\n  😊 종료 시점 감성:');
  console.log(`    긍정: ${sentiments.positive}건 | 중립: ${sentiments.neutral}건 | 부정: ${sentiments.negative}건`);

  // 해결률
  const resolved = successful.filter((r) => r.analysis.resolved).length;
  const resolveRate = successful.length > 0
    ? ((resolved / successful.length) * 100).toFixed(1)
    : 0;
  console.log(`\n  ✅ 해결률: ${resolveRate}% (${resolved}/${successful.length})`);

  // 평균 해결 품질
  const qualities = successful
    .map((r) => r.analysis.resolution_quality)
    .filter((q) => typeof q === 'number');
  const avgQuality = qualities.length > 0
    ? (qualities.reduce((a, b) => a + b, 0) / qualities.length).toFixed(1)
    : '-';
  console.log(`  ⭐ 평균 해결 품질: ${avgQuality}/5`);

  // Top 키워드
  const keywords = {};
  for (const r of successful) {
    for (const kw of (r.analysis.keywords || [])) {
      keywords[kw] = (keywords[kw] || 0) + 1;
    }
  }
  const topKeywords = Object.entries(keywords).sort((a, b) => b[1] - a[1]).slice(0, 10);
  if (topKeywords.length > 0) {
    console.log('\n  🔑 Top 키워드:');
    for (const [kw, count] of topKeywords) {
      console.log(`    ${kw}: ${count}회`);
    }
  }

  // 감정 태그
  const emotions = {};
  for (const r of successful) {
    for (const tag of (r.analysis.emotion_tags || [])) {
      emotions[tag] = (emotions[tag] || 0) + 1;
    }
  }
  const topEmotions = Object.entries(emotions).sort((a, b) => b[1] - a[1]).slice(0, 5);
  if (topEmotions.length > 0) {
    console.log('\n  💭 주요 감정:');
    for (const [em, count] of topEmotions) {
      console.log(`    ${em}: ${count}회`);
    }
  }

  console.log('\n' + '='.repeat(50));
}

// ─── 분석 결과 CSV 저장 ──────────────────────────

function saveAnalysisCsv(results) {
  const outputDir = path.join(__dirname, 'output');
  const timestamp = new Date().toISOString().slice(0, 10);

  const headers = [
    'chat_id', 'category', 'sub_category',
    'sentiment_open', 'sentiment_close',
    'emotion_tags', 'resolved', 'resolution_quality',
    'summary', 'keywords',
  ];

  function esc(v) {
    if (v === null || v === undefined) return '';
    const s = String(v);
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  }

  const rows = results
    .filter((r) => r.analysis)
    .map((r) => {
      const a = r.analysis;
      return [
        r.chatId,
        a.category,
        a.sub_category,
        a.sentiment_open,
        a.sentiment_close,
        (a.emotion_tags || []).join('; '),
        a.resolved,
        a.resolution_quality,
        a.summary,
        (a.keywords || []).join('; '),
      ].map(esc);
    });

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const filepath = path.join(outputDir, `${timestamp}_analysis.csv`);
  fs.writeFileSync(filepath, '\uFEFF' + csv, 'utf-8');
  console.log(`💾 분석 CSV: ${filepath}`);
}

// ─── 메인 ─────────────────────────────────────────

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const options = parseArgs();

  // 입력 파일 찾기
  const inputFile = findInputFile(options.inputFile);
  console.log(`📂 입력: ${inputFile}`);

  const raw = fs.readFileSync(inputFile, 'utf-8');
  const allConversations = JSON.parse(raw);

  // 메시지가 있는 대화만 필터
  const conversations = allConversations
    .filter((c) => c.messages && c.messages.length > 0)
    .slice(0, options.limit);

  console.log(`  전체 대화: ${allConversations.length}건`);
  console.log(`  메시지 있는 대화: ${conversations.length}건`);

  // 비용 추정
  const cost = estimateCost(conversations);
  console.log('\n💰 예상 비용 (Claude Haiku 4.5):');
  console.log(`  입력 토큰: ~${(cost.estimatedInputTokens / 1000).toFixed(0)}K`);
  console.log(`  출력 토큰: ~${(cost.estimatedOutputTokens / 1000).toFixed(0)}K`);
  console.log(`  예상 비용: ~$${cost.totalCost.toFixed(3)}`);

  if (options.dryRun) {
    console.log('\n🏃 --dry-run 모드: API 호출 없이 종료합니다.');
    return;
  }

  // API 키 검증
  if (!CONFIG.apiKey) {
    console.error('\n❌ ANTHROPIC_API_KEY가 설정되지 않았습니다.');
    console.error('   .env 파일에 ANTHROPIC_API_KEY=sk-ant-... 을 추가하세요.');
    process.exit(1);
  }

  // 분석 시작
  console.log('\n🔍 AI 분석 시작...\n');

  const results = [];
  let successCount = 0;
  let failCount = 0;
  let totalInputTokens = 0;
  let totalOutputTokens = 0;

  for (let i = 0; i < conversations.length; i++) {
    const conv = conversations[i];
    const userPrompt = buildUserPrompt(conv);

    if (!userPrompt) {
      results.push({ chatId: conv.id, analysis: null, error: '메시지 없음' });
      failCount++;
      continue;
    }

    process.stdout.write(`  [${i + 1}/${conversations.length}] ${conv.id.slice(0, 12)}... `);

    try {
      const { text, usage } = await callClaude(SYSTEM_PROMPT, userPrompt);
      const analysis = parseAnalysisResult(text);

      if (analysis) {
        results.push({ chatId: conv.id, analysis });
        successCount++;
        totalInputTokens += usage.input_tokens || 0;
        totalOutputTokens += usage.output_tokens || 0;
        console.log(`✅ ${analysis.category}`);
      } else {
        results.push({ chatId: conv.id, analysis: null, error: 'JSON 파싱 실패', raw: text });
        failCount++;
        console.log('⚠️ 파싱 실패');
      }
    } catch (error) {
      if (error.message === 'RATE_LIMIT') {
        console.log('⏳ Rate limit — 60초 대기');
        await sleep(60000);
        i--; // 재시도
        continue;
      }

      results.push({ chatId: conv.id, analysis: null, error: error.message });
      failCount++;
      console.log(`❌ ${error.message.slice(0, 50)}`);
    }

    await sleep(CONFIG.requestDelayMs);
  }

  // 결과 저장
  saveResults(results, inputFile);
  saveAnalysisCsv(results);

  // 실제 비용
  const actualInputCost = (totalInputTokens / 1_000_000) * CONFIG.costPerInputMTok;
  const actualOutputCost = (totalOutputTokens / 1_000_000) * CONFIG.costPerOutputMTok;
  console.log(`\n💰 실제 비용:`);
  console.log(`  입력: ${totalInputTokens} 토큰 ($${actualInputCost.toFixed(4)})`);
  console.log(`  출력: ${totalOutputTokens} 토큰 ($${actualOutputCost.toFixed(4)})`);
  console.log(`  합계: $${(actualInputCost + actualOutputCost).toFixed(4)}`);

  // 리포트 출력
  printReport(results);

  console.log(`\n✅ 분석 완료! (성공: ${successCount}, 실패: ${failCount})`);
}

main();
