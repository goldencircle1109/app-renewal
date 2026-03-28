/**
 * 채널톡 CS 데이터 수집 스크립트
 *
 * 채널톡 Open API v5를 통해 대화 목록과 메시지를 수집하여 JSON 파일로 저장합니다.
 * 이후 AI 분석 파이프라인의 입력 데이터로 사용됩니다.
 *
 * 사용법:
 *   node collect.js                    # 종료된(closed) 대화 수집 (기본)
 *   node collect.js --state opened     # 진행 중인 대화 수집
 *   node collect.js --state closed     # 종료된 대화 수집
 *   node collect.js --limit 100        # 최대 100건만 수집
 *   node collect.js --with-messages    # 메시지도 함께 수집
 */

require('dotenv').config();
const https = require('https');
const fs = require('fs');
const path = require('path');

// ─── 설정 ─────────────────────────────────────────

const CONFIG = {
  baseUrl: 'https://api.channel.io',
  accessKey: process.env.CHANNEL_TALK_ACCESS_KEY,
  accessSecret: process.env.CHANNEL_TALK_ACCESS_SECRET,
  // Rate limit: 초당 10, 버킷 1000. 안전하게 초당 5로 제한
  requestDelayMs: 200,
  pageSize: 500,
};

// ─── 인자 파싱 ────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    state: 'closed',
    limit: Infinity,
    withMessages: false,
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--state' && args[i + 1]) {
      options.state = args[i + 1];
      i++;
    }
    if (args[i] === '--limit' && args[i + 1]) {
      options.limit = parseInt(args[i + 1], 10);
      i++;
    }
    if (args[i] === '--with-messages') {
      options.withMessages = true;
    }
  }

  return options;
}

// ─── HTTP 요청 유틸리티 ───────────────────────────

function request(method, urlPath) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlPath, CONFIG.baseUrl);

    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method,
      headers: {
        'x-access-key': CONFIG.accessKey,
        'x-access-secret': CONFIG.accessSecret,
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 429) {
          reject(new Error('RATE_LIMIT: 요청 한도 초과. 잠시 후 다시 시도하세요.'));
          return;
        }
        if (res.statusCode >= 400) {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          return;
        }
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`JSON 파싱 실패: ${data.slice(0, 200)}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── 대화 목록 수집 ──────────────────────────────

async function fetchConversations(state, maxCount) {
  const conversations = [];
  let cursor = null;
  let page = 1;

  console.log(`\n📋 대화 목록 수집 시작 (state: ${state})`);

  while (conversations.length < maxCount) {
    const limit = Math.min(CONFIG.pageSize, maxCount - conversations.length);
    let url = `/open/v5/user-chats?state=${state}&limit=${limit}&sortOrder=desc`;
    if (cursor) {
      url += `&since=${encodeURIComponent(cursor)}`;
    }

    console.log(`  페이지 ${page}... (현재 ${conversations.length}건)`);

    const response = await request('GET', url);

    if (response.userChats && response.userChats.length > 0) {
      conversations.push(...response.userChats);
    } else {
      break;
    }

    // 다음 페이지 커서
    if (response.next) {
      cursor = response.next;
    } else {
      break;
    }

    page++;
    await sleep(CONFIG.requestDelayMs);
  }

  console.log(`  => 총 ${conversations.length}건 수집 완료\n`);
  return conversations;
}

// ─── 대화별 메시지 수집 ──────────────────────────

async function fetchMessages(chatId) {
  const messages = [];
  let cursor = null;

  while (true) {
    let url = `/open/v5/user-chats/${chatId}/messages?limit=${CONFIG.pageSize}`;
    if (cursor) {
      url += `&since=${encodeURIComponent(cursor)}`;
    }

    const response = await request('GET', url);

    if (response.messages && response.messages.length > 0) {
      messages.push(...response.messages);
    } else {
      break;
    }

    if (response.next) {
      cursor = response.next;
    } else {
      break;
    }

    await sleep(CONFIG.requestDelayMs);
  }

  return messages;
}

async function fetchAllMessages(conversations) {
  console.log(`💬 메시지 수집 시작 (${conversations.length}개 대화)`);

  const result = {};
  let count = 0;

  for (const conv of conversations) {
    const chatId = conv.id;
    count++;

    if (count % 10 === 0 || count === 1) {
      console.log(`  ${count}/${conversations.length} 진행 중...`);
    }

    try {
      result[chatId] = await fetchMessages(chatId);
    } catch (error) {
      console.error(`  [오류] ${chatId}: ${error.message}`);
      result[chatId] = [];

      // Rate limit 시 30초 대기 후 재시도
      if (error.message.includes('RATE_LIMIT')) {
        console.log('  ⏳ Rate limit 도달. 30초 대기...');
        await sleep(30000);
        try {
          result[chatId] = await fetchMessages(chatId);
        } catch (retryError) {
          console.error(`  [재시도 실패] ${chatId}: ${retryError.message}`);
        }
      }
    }

    await sleep(CONFIG.requestDelayMs);
  }

  console.log(`  => 총 ${Object.keys(result).length}개 대화의 메시지 수집 완료\n`);
  return result;
}

// ─── 메시지 텍스트 추출 ──────────────────────────

function extractText(message) {
  // plainText가 있으면 우선 사용
  if (message.plainText && message.plainText.trim()) {
    return message.plainText.trim();
  }

  // blocks에서 텍스트 추출
  if (message.blocks && message.blocks.length > 0) {
    return message.blocks
      .filter((b) => b.type === 'text' && b.value)
      .map((b) => b.value.replace(/<[^>]*>/g, '')) // HTML 태그 제거
      .join('\n')
      .trim();
  }

  return '';
}

// ─── 파일 저장 ────────────────────────────────────

function saveToFile(data, filename) {
  const outputDir = path.join(__dirname, 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().slice(0, 10);
  const filepath = path.join(outputDir, `${timestamp}_${filename}`);

  fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`💾 저장 완료: ${filepath}`);

  return filepath;
}

// ─── 통계 출력 ────────────────────────────────────

function printStats(conversations, messagesByChat) {
  console.log('\n📊 수집 통계');
  console.log('─'.repeat(40));
  console.log(`  대화 수: ${conversations.length}건`);

  if (messagesByChat) {
    const totalMessages = Object.values(messagesByChat)
      .reduce((sum, msgs) => sum + msgs.length, 0);
    console.log(`  메시지 수: ${totalMessages}건`);

    const avgMessages = conversations.length > 0
      ? (totalMessages / conversations.length).toFixed(1)
      : 0;
    console.log(`  대화당 평균 메시지: ${avgMessages}건`);
  }

  // 태그 분포
  const tagCounts = {};
  for (const conv of conversations) {
    if (conv.tags) {
      for (const tag of conv.tags) {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      }
    }
  }

  if (Object.keys(tagCounts).length > 0) {
    console.log('\n  태그 분포:');
    const sorted = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    for (const [tag, count] of sorted) {
      console.log(`    ${tag}: ${count}건`);
    }
  }

  console.log('─'.repeat(40));
}

// ─── 메인 ─────────────────────────────────────────

async function main() {
  // 환경변수 검증
  if (!CONFIG.accessKey || !CONFIG.accessSecret) {
    console.error('❌ 환경변수가 설정되지 않았습니다.');
    console.error('   .env 파일에 CHANNEL_TALK_ACCESS_KEY, CHANNEL_TALK_ACCESS_SECRET을 설정하세요.');
    console.error('   .env.example 파일을 참고하세요.');
    process.exit(1);
  }

  const options = parseArgs();

  console.log('='.repeat(50));
  console.log(' 채널톡 CS 데이터 수집기');
  console.log('='.repeat(50));
  console.log(`  상태: ${options.state}`);
  console.log(`  최대: ${options.limit === Infinity ? '전체' : options.limit + '건'}`);
  console.log(`  메시지: ${options.withMessages ? '포함' : '대화 목록만'}`);
  console.log('='.repeat(50));

  try {
    // 1. 대화 목록 수집
    const conversations = await fetchConversations(options.state, options.limit);

    if (conversations.length === 0) {
      console.log('수집된 대화가 없습니다.');
      return;
    }

    saveToFile(conversations, `conversations_${options.state}.json`);

    // 2. 메시지 수집 (옵션)
    let messagesByChat = null;
    if (options.withMessages) {
      messagesByChat = await fetchAllMessages(conversations);
      saveToFile(messagesByChat, `messages_${options.state}.json`);

      // 3. 통합 데이터 (대화 + 메시지 합체, 텍스트 추출 포함)
      const merged = conversations.map((conv) => ({
        ...conv,
        messages: (messagesByChat[conv.id] || []).map((msg) => ({
          ...msg,
          _text: extractText(msg),
        })),
      }));
      saveToFile(merged, `full_${options.state}.json`);
    }

    // 4. 통계
    printStats(conversations, messagesByChat);

    console.log('\n✅ 수집 완료!');

  } catch (error) {
    console.error(`\n❌ 수집 실패: ${error.message}`);
    process.exit(1);
  }
}

main();
