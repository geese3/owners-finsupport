/**
 * 기업마당 데이터 동기화 테스트
 */

// 기업마당 API 직접 호출 테스트
async function testBizinfoAPI() {
  const API_KEY = 'f0K6CT';
  const BASE_URL = 'https://www.bizinfo.go.kr/uss/rss/bizinfoApi.do';

  try {
    console.log('📡 기업마당 API 최신 데이터 조회 중...');

    // 전체 데이터 수집 (기존 시스템과 동일)
    const categories = ['01', '02', '03', '04', '05', '06', '07', '09']; // 금융, 기술, 인력, 수출, 내수, 창업, 경영, 기타
    const maxPages = 10; // 최대 10페이지까지
    const itemsPerPage = 100; // 페이지당 100개
    const allItems = [];

    console.log(`📋 수집 계획: ${categories.length}개 분야 × ${maxPages}페이지 × ${itemsPerPage}개 = 최대 ${categories.length * maxPages * itemsPerPage}개`);

    for (const category of categories) {
      console.log(`\n🔍 분야 ${category} 수집 시작...`);
      let categoryTotal = 0;

      for (let page = 1; page <= maxPages; page++) {
        const searchParams = new URLSearchParams({
          crtfcKey: API_KEY,
          dataType: 'json',
          searchCnt: itemsPerPage.toString(),
          pageIndex: page.toString(),
          pageUnit: itemsPerPage.toString(),
          searchLclasId: category
        });

        try {
          const response = await fetch(`${BASE_URL}?${searchParams}`, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'OwnersFinsupport/1.0'
            }
          });

          if (!response.ok) {
            console.log(`   ❌ 페이지 ${page}: ${response.status} ${response.statusText}`);
            continue;
          }

          const data = await response.json();

          if (data.jsonArray && Array.isArray(data.jsonArray)) {
            if (data.jsonArray.length === 0) {
              console.log(`   📄 페이지 ${page}: 데이터 없음 (수집 종료)`);
              break; // 더 이상 데이터가 없으면 중단
            }

            allItems.push(...data.jsonArray);
            categoryTotal += data.jsonArray.length;
            console.log(`   ✅ 페이지 ${page}: ${data.jsonArray.length}개 수집 (분야 누계: ${categoryTotal}개)`);

            // 총 개수 정보가 있으면 출력
            if (data.totCnt && page === 1) {
              console.log(`   📊 분야 ${category} 전체: ${data.totCnt}개`);
            }
          } else {
            console.log(`   ⚠️ 페이지 ${page}: 예상과 다른 응답 구조`);
          }

          // API 호출 간격 조절 (Rate limiting 방지)
          await new Promise(resolve => setTimeout(resolve, 100));

        } catch (error) {
          console.log(`   ❌ 페이지 ${page} 요청 실패: ${error.message}`);
          continue;
        }
      }

      console.log(`✅ 분야 ${category} 완료: ${categoryTotal}개 수집`);
    }

    console.log(`\n📊 전체 수집 결과: ${allItems.length}개 (중복 제거 전)`);

    // 중복 제거 (pblancId 기준)
    const uniqueItems = allItems.filter((item, index, arr) => {
      const currentId = item.pblancId;
      if (!currentId) return false; // ID가 없는 항목은 제외
      return arr.findIndex(i => i.pblancId === currentId) === index;
    });

    console.log(`🔄 중복 제거 후: ${uniqueItems.length}개 (${allItems.length - uniqueItems.length}개 중복 제거)`);

    if (uniqueItems.length > 0) {
      console.log('\n━'.repeat(80));
      console.log('📌 최신 공고 샘플:');

      uniqueItems.slice(0, 5).forEach((item, index) => {
        console.log(`\n[${index + 1}] ${item.pblancNm || '제목 없음'}`);
        console.log(`   📅 생성일시: ${item.creatPnttm || '정보없음'}`);
        console.log(`   🏢 접수기관: ${item.jrsdInsttNm || '정보없음'}`);
        console.log(`   📆 접수기간: ${item.reqstBeginEndDe || '정보없음'}`);
        console.log(`   🔗 공고 ID: ${item.pblancId}`);
      });

      console.log('\n━'.repeat(80));
      console.log(`✅ 최종 결과: ${uniqueItems.length}개의 고유한 정부지원사업 공고 수집 완료!`);

      // 최신 공고의 상세 정보 출력 (디버깅용)
      console.log('\n🔍 최신 공고 상세 데이터:');
      console.log(JSON.stringify(uniqueItems[0], null, 2));

    } else {
      console.log('⚠️ 수집된 데이터가 없습니다.');
    }

  } catch (error) {
    console.error('❌ API 호출 실패:', error);
  }
}

// 실행
console.log('🚀 기업마당 API 테스트 시작...\n');
testBizinfoAPI();