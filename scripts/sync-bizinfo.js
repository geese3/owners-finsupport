#!/usr/bin/env node

/**
 * 기업마당 데이터 수동 동기화 스크립트
 * 사용법: node scripts/sync-bizinfo.js
 */

// 환경변수 로드
require('dotenv').config({ path: '.env.local' });

async function syncBizinfoData() {
  try {
    console.log('🚀 기업마당 데이터 동기화 시작...');
    console.log('📍 API URL:', process.env.POLICY_API_BASE_URL || 'https://www.bizinfo.go.kr/uss/rss/bizinfoApi.do');
    console.log('🔑 API Key 설정:', process.env.POLICY_API_KEY ? '✅' : '❌');

    // ESM 모듈 동적 임포트
    const { syncBizinfoData } = await import('../src/lib/api-sources/bizinfo.ts');

    const result = await syncBizinfoData();
    console.log(`✅ 동기화 완료: ${result}개 항목 처리됨`);

  } catch (error) {
    console.error('❌ 동기화 실패:', error);
    process.exit(1);
  }
}

// 실행
syncBizinfoData();