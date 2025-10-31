/**
 * 기존 데이터베이스의 HTML 엔티티 정리 스크립트
 * 저장된 데이터에서 HTML 엔티티를 디코딩하여 업데이트
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// HTML 엔티티 디코딩 함수 (Node.js 버전)
function decodeHtmlEntities(text) {
  if (!text || typeof text !== 'string') {
    return text;
  }

  // HTML 엔티티 매핑
  const htmlEntities = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&#x27;': "'",
    '&apos;': "'",
    '&nbsp;': ' ',
    '&#160;': ' ',
    '&copy;': '\u00A9',
    '&reg;': '\u00AE',
    '&trade;': '\u2122',
    '&hellip;': '\u2026',
    '&mdash;': '\u2014',
    '&ndash;': '\u2013',
    '&laquo;': '\u00AB',
    '&raquo;': '\u00BB',
    '&lsquo;': '\u2018',
    '&rsquo;': '\u2019',
    '&ldquo;': '\u201C',
    '&rdquo;': '\u201D',
    '&#xD;': '',     // 캐리지 리턴 제거
    '&#xA;': '\n',   // 라인피드는 줄바꿈으로
    '&#13;': '',     // 캐리지 리턴 제거
    '&#10;': '\n',   // 라인피드는 줄바꿈으로
  };

  let decoded = text;

  // 명시적 엔티티 치환
  Object.entries(htmlEntities).forEach(([entity, replacement]) => {
    decoded = decoded.replace(new RegExp(entity, 'g'), replacement);
  });

  // 숫자 형태의 HTML 엔티티 디코딩 (&#숫자;)
  decoded = decoded.replace(/&#(\d+);/g, (match, dec) => {
    return String.fromCharCode(parseInt(dec, 10));
  });

  // 16진수 형태의 HTML 엔티티 디코딩 (&#x16진수;)
  decoded = decoded.replace(/&#x([0-9a-fA-F]+);/g, (match, hex) => {
    return String.fromCharCode(parseInt(hex, 16));
  });

  // 연속된 줄바꿈을 단일 줄바꿈으로 변경
  decoded = decoded.replace(/\n+/g, '\n');

  // 앞뒤 공백 제거
  decoded = decoded.trim();

  return decoded;
}

function decodeTitle(text) {
  if (!text) return text;

  let decoded = decodeHtmlEntities(text);

  // 제목에서 불필요한 줄바꿈 제거
  decoded = decoded.replace(/\n/g, ' ');

  // 연속된 공백을 단일 공백으로 변경
  decoded = decoded.replace(/\s+/g, ' ');

  return decoded.trim();
}

function decodeDescription(text) {
  if (!text) return text;

  let decoded = decodeHtmlEntities(text);

  // 연속된 공백을 단일 공백으로 변경 (줄바꿈은 유지)
  decoded = decoded.replace(/[^\S\n]+/g, ' ');

  return decoded.trim();
}

async function main() {
  // Supabase 클라이언트 생성
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  console.log('🔧 HTML 엔티티 정리 스크립트 시작...')

  try {
    // 1. HTML 엔티티가 포함된 데이터 조회
    console.log('📊 HTML 엔티티가 포함된 데이터 조회 중...')

    const { data: problematicData, error: selectError } = await supabase
      .from('government_supports')
      .select('id, title, host_institution, support_method, application_method, attachment_files, business_type_code, announcement_url')
      .or('title.like.%&#%,host_institution.like.%&#%,support_method.like.%&#%,application_method.like.%&#%,attachment_files.like.%&#%,business_type_code.like.%&#%,announcement_url.like.%&#%')

    if (selectError) {
      throw selectError
    }

    console.log(`🔍 HTML 엔티티가 포함된 레코드: ${problematicData.length}개 발견`)

    if (problematicData.length === 0) {
      console.log('✅ 처리할 데이터가 없습니다.')
      return
    }

    // 2. 샘플 데이터 출력
    console.log('\n📝 처리 대상 샘플:')
    problematicData.slice(0, 3).forEach((item, index) => {
      console.log(`${index + 1}. [${item.id}] ${item.title}`)
    })

    // 3. 사용자 확인
    console.log(`\n⚠️  ${problematicData.length}개의 레코드를 업데이트하시겠습니까?`)
    console.log('계속하려면 스크립트를 다시 실행하고 아래 주석을 해제하세요.')

    // 4. 배치 업데이트 실행
    let updateCount = 0
    const batchSize = 50 // 한 번에 50개씩 처리

    for (let i = 0; i < problematicData.length; i += batchSize) {
      const batch = problematicData.slice(i, i + batchSize)

      console.log(`📦 배치 ${Math.floor(i / batchSize) + 1}/${Math.ceil(problematicData.length / batchSize)} 처리 중... (${i + 1}-${Math.min(i + batchSize, problematicData.length)})`)

      for (const item of batch) {
        const updatedData = {
          title: decodeTitle(item.title),
          host_institution: decodeHtmlEntities(item.host_institution),
          support_method: decodeHtmlEntities(item.support_method),
          application_method: decodeDescription(item.application_method),
          attachment_files: decodeHtmlEntities(item.attachment_files),
          business_type_code: decodeHtmlEntities(item.business_type_code),
          announcement_url: decodeHtmlEntities(item.announcement_url),
          updated_at: new Date().toISOString()
        }

        const { error: updateError } = await supabase
          .from('government_supports')
          .update(updatedData)
          .eq('id', item.id)

        if (updateError) {
          console.error(`❌ 레코드 ${item.id} 업데이트 실패:`, updateError.message)
        } else {
          updateCount++
          if (updateCount % 10 === 0) {
            console.log(`✅ ${updateCount}개 레코드 업데이트 완료`)
          }
        }
      }

      // 배치 간 잠깐 대기 (API 부하 방지)
      if (i + batchSize < problematicData.length) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    console.log(`🎉 HTML 엔티티 정리 완료: ${updateCount}개 레코드 업데이트됨`)

    // 5. 정리 후 검증
    const { data: remainingData, error: verifyError } = await supabase
      .from('government_supports')
      .select('id, title')
      .or('title.like.%&#%,host_institution.like.%&#%')
      .limit(5)

    if (verifyError) {
      console.error('❌ 검증 쿼리 실패:', verifyError.message)
    } else {
      console.log(`🔍 정리 후 남은 HTML 엔티티: ${remainingData.length}개`)
      if (remainingData.length > 0) {
        console.log('📝 남은 문제 데이터 샘플:')
        remainingData.forEach((item, index) => {
          console.log(`${index + 1}. [${item.id}] ${item.title}`)
        })
      }
    }

  } catch (error) {
    console.error('❌ HTML 엔티티 정리 실패:', error.message)
    process.exit(1)
  }
}

// 스크립트 실행
if (require.main === module) {
  main().then(() => {
    console.log('✅ 스크립트 실행 완료')
    process.exit(0)
  }).catch(error => {
    console.error('❌ 스크립트 실행 실패:', error)
    process.exit(1)
  })
}