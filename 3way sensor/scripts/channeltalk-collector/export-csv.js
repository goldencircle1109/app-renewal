/**
 * JSON → CSV 변환 스크립트
 *
 * collect.js로 수집한 JSON 데이터를 CSV로 변환합니다.
 * 외부 라이브러리 없이 동작합니다.
 *
 * 사용법:
 *   node export-csv.js                           # output/ 폴더의 최신 full_*.json 변환
 *   node export-csv.js ./output/2026-03-28_full_closed.json   # 특정 파일 변환
 */

const fs = require('fs');
const path = require('path');

// ─── CSV 유틸리티 ─────────────────────────────────

function escapeCsv(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function formatTimestamp(ms) {
  if (!ms) return '';
  return new Date(ms).toISOString().replace('T', ' ').slice(0, 19);
}

// ─── 대화 요약 CSV 생성 ──────────────────────────

function conversationsToCsv(data) {
  const headers = [
    'chat_id',
    'state',
    'tags',
    'assignee_id',
    'opened_at',
    'closed_at',
    'message_count',
    'first_message',
    'last_message',
  ];

  function extractText(msg) {
    if (msg._text) return msg._text;
    if (msg.plainText && msg.plainText.trim()) return msg.plainText.trim();
    if (msg.blocks && msg.blocks.length > 0) {
      return msg.blocks
        .filter((b) => b.type === 'text' && b.value)
        .map((b) => b.value.replace(/<[^>]*>/g, ''))
        .join(' ')
        .trim();
    }
    return '';
  }

  const rows = data.map((conv) => {
    const messages = (conv.messages || []).filter((m) => !m.log);
    const userMessages = messages.filter((m) => m.personType === 'user');
    const firstMsg = extractText(userMessages[0] || {});
    const lastMsg = extractText(userMessages[userMessages.length - 1] || {});

    return [
      conv.id,
      conv.state,
      (conv.tags || []).join('; '),
      conv.assigneeId || '',
      formatTimestamp(conv.createdAt),
      formatTimestamp(conv.closedAt || conv.resolvedAt),
      messages.length,
      firstMsg.slice(0, 200),
      lastMsg.slice(0, 200),
    ].map(escapeCsv);
  });

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

// ─── 전체 메시지 CSV 생성 ────────────────────────

function messagesToCsv(data) {
  const headers = [
    'chat_id',
    'message_id',
    'sender_type',
    'sender_id',
    'body',
    'sent_at',
  ];

  const rows = [];

  for (const conv of data) {
    const messages = (conv.messages || []).filter((m) => !m.log);
    for (const msg of messages) {
      const text = msg._text || msg.plainText || '';
      rows.push([
        conv.id,
        msg.id,
        msg.personType,
        msg.personId,
        text.replace(/<[^>]*>/g, '').slice(0, 1000),
        formatTimestamp(msg.createdAt),
      ].map(escapeCsv));
    }
  }

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

// ─── 메인 ─────────────────────────────────────────

function main() {
  // 입력 파일 결정
  let inputFile = process.argv[2];

  if (!inputFile) {
    const outputDir = path.join(__dirname, 'output');
    if (!fs.existsSync(outputDir)) {
      console.error('❌ output/ 폴더가 없습니다. 먼저 collect.js를 실행하세요.');
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

    inputFile = path.join(outputDir, files[0]);
    console.log(`📂 입력 파일: ${inputFile}`);
  }

  // JSON 읽기
  const raw = fs.readFileSync(inputFile, 'utf-8');
  const data = JSON.parse(raw);

  console.log(`  대화 수: ${data.length}건`);

  const outputDir = path.join(__dirname, 'output');
  const timestamp = new Date().toISOString().slice(0, 10);

  // 대화 요약 CSV
  const convCsv = conversationsToCsv(data);
  const convPath = path.join(outputDir, `${timestamp}_conversations.csv`);
  fs.writeFileSync(convPath, '\uFEFF' + convCsv, 'utf-8'); // BOM 추가 (Excel 한글 호환)
  console.log(`💾 대화 요약: ${convPath}`);

  // 전체 메시지 CSV
  const msgCsv = messagesToCsv(data);
  const msgPath = path.join(outputDir, `${timestamp}_messages.csv`);
  fs.writeFileSync(msgPath, '\uFEFF' + msgCsv, 'utf-8');
  console.log(`💾 전체 메시지: ${msgPath}`);

  const totalMessages = data.reduce((sum, c) => sum + (c.messages?.length || 0), 0);
  console.log(`\n✅ CSV 변환 완료! (대화 ${data.length}건, 메시지 ${totalMessages}건)`);
}

main();
