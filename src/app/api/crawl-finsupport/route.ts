import { NextRequest, NextResponse } from 'next/server';

// 업종 코드 매핑
const INDUSTRY_CODE_MAP: Record<string, string> = {
  "전체": "ALL",
  "자동차 및 부품 판매업": "MOTOR",
  "도매 및 상품 중개업": "WHOLESALE",
  "소매업(자동차 제외)": "RETAIL",
  "숙박업": "LODGING",
  "음식점업": "RESTAURANT",
  "제조업": "MANUFACTURING",
  "교육 서비스업": "EDUCATION",
  "협회 및 단체, 수리 및 기타 개인 서비스업": "ORGANIZATION",
  "부동산업": "ESTATES",
  "전문, 과학 및 기술 서비스업": "TECHNICAL",
  "예술, 스포츠 및 여가관련 서비스업": "ARTS",
  "정보통신업": "INFORMATION",
  "농업, 임업 및 어업": "FARMING",
  "건설업": "CONSTRUCTION",
  "운수 및 창고업": "TRANSPORT",
  "보건업 및 사회복지 서비스업": "HEALTH",
  "사업시설 관리, 사업 지원 및 임대 서비스업": "BUSINESS_SUPPORT",
  "금융 및 보험업": "FINANCE",
  "전기, 가스, 증기 및 공기 조절 공급업": "SUPPLIER",
  "광업": "MINE",
  "수도, 하수 및 폐기물 처리, 원료 재생업": "RECYCLING",
  "가구 내 고용활동 및 달리 분류되지 않은 자가 소비 생산활동": "EMPLOYMENT",
  "공공 행정, 국방 및 사회보장 행정": "DEFENCE",
  "국제 및 외국기관": "INTERNATIONAL"
};

// 지역 코드 매핑
const AREA_CODE_MAP: Record<string, string> = {
  "전체": "00000",
  "서울특별시": "11000",
  "부산광역시": "26000",
  "대구광역시": "27000",
  "인천광역시": "28000",
  "광주광역시": "29000",
  "대전광역시": "30000",
  "울산광역시": "31000",
  "세종특별자치시": "36000",
  "경기도": "41000",
  "충청북도": "43000",
  "충청남도": "44000",
  "전라남도": "46000",
  "경상북도": "47000",
  "경상남도": "48000",
  "제주특별자치도": "50000",
  "강원특별자치도": "51000",
  "전북특별자치도": "52000"
};

interface CrawlParams {
  industry?: string;
  area?: string;
  page?: number;
  size?: number;
}

interface SubventionItem {
  subventionId: string;
  지역: string;
  접수기관: string;
  지원사업명: string;
  "지원 방식": string;
  지원금액: string;
  금리: string;
  "접수 마감일": string;
  "접수 방법": string;
  "공고 URL": string;
  출처: string;
  첨부파일: string;
  businessTypeCode: string;
}

// 지원사업 ID 목록 크롤링
async function fetchSubventionIds(industry: string, area: string, page: number, size: number = 30): Promise<string[]> {
  const mainPageUrl = "https://internal.pay.naver.com/partner/api/subvention/list";

  const businessTypeCode = INDUSTRY_CODE_MAP[industry] || "ALL";
  const areaCode = AREA_CODE_MAP[area] || "00000";

  const params = new URLSearchParams({
    isActive: "Y",
    page: page.toString(),
    size: size.toString(),
    sort: "ACCURACY"
  });

  if (businessTypeCode && businessTypeCode !== "ALL") {
    params.append("businessTypeCode", businessTypeCode);
  }

  if (areaCode && areaCode !== "00000") {
    params.append("areaCode", areaCode);
  }

  try {
    const response = await fetch(`${mainPageUrl}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; FinSupportCrawler/1.0)'
      }
    });

    if (response.status === 200) {
      const data = await response.json();

      if (!data || !data.data || !data.data.content) {
        console.log(`페이지 ${page}에서 데이터가 비어 있습니다.`);
        return [];
      }

      return data.data.content.map((item: any) => item.subventionId);
    } else {
      console.error(`페이지 ${page}에서 데이터를 가져오는 데 실패했습니다. 상태 코드: ${response.status}`);
      return [];
    }
  } catch (error) {
    console.error('API 요청 중 오류 발생:', error);
    return [];
  }
}

// 상세 정보 크롤링
async function scrapeDetailPage(subventionId: string, retries: number = 3): Promise<SubventionItem | null> {
  const url = `https://internal.pay.naver.com/partner/api/subvention/detail/${subventionId}`;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; FinSupportCrawler/1.0)'
        }
      });

      if (response.status === 200) {
        const data = await response.json();

        if (!data || !data.data) {
          console.log(`${subventionId}의 상세 데이터가 비어 있습니다.`);
          return null;
        }

        const details = data.data;

        // 데이터 처리
        const area = details.subventionAreaList?.map((a: any) =>
          a?.areaName || "확인 필요"
        ).join(", ") || "확인 필요";

        const institution = details.receptionInstitutionName || "확인 필요";
        const subventionTitle = details.subventionTitleName || "확인 필요";

        const supportMethod = details.subventionSupportMethodCodeList?.map((m: any) =>
          m?.description || "확인 필요"
        ).join(", ") || "확인 필요";

        const supportAmount = details.supportAmount
          ? `${details.supportAmount.toLocaleString()} 원`
          : "확인 필요";

        const interestRate = details.interestRateDescription || "확인 필요";

        // 날짜 형식 처리 개선
        let receptionEndDate = details.receptionEndYmd || "확인 필요";
        if (receptionEndDate && receptionEndDate !== "확인 필요") {
          // YYYYMMDD 형식을 YYYY-MM-DD로 변환
          if (/^\d{8}$/.test(receptionEndDate)) {
            receptionEndDate = `${receptionEndDate.substring(0, 4)}-${receptionEndDate.substring(4, 6)}-${receptionEndDate.substring(6, 8)}`;
          }
          // YYYY.MM.DD 형식을 YYYY-MM-DD로 변환
          else if (receptionEndDate.includes('.')) {
            receptionEndDate = receptionEndDate.replace(/\./g, '-');
          }
          // YYYY/MM/DD 형식을 YYYY-MM-DD로 변환
          else if (receptionEndDate.includes('/')) {
            receptionEndDate = receptionEndDate.replace(/\//g, '-');
          }
        }

        const subventionUrl = details.subventionUrlAddress || details.subventionHomepageUrl || details.pblancDetailUrl || "확인 필요";

        // URL 형식 정규화 (http:// 또는 https:// 추가)
        let normalizedUrl = subventionUrl;
        if (normalizedUrl && normalizedUrl !== "확인 필요") {
          if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
            normalizedUrl = `https://${normalizedUrl}`;
          }
        }
        const sourceName = details.receptionInstitutionName || "확인 필요";

        const applicationMethod = details.applicationMethodCodeList?.map((m: any) =>
          m?.description || "확인 필요"
        ).join(", ") || "확인 필요";

        const attachments = details.attachmentList?.map((att: any) =>
          att?.fileName || "첨부파일"
        ).join(", ") || "없음";

        const businessTypeCode = details.businessTypeCode || "ALL";

        return {
          subventionId,
          지역: area,
          접수기관: institution,
          지원사업명: subventionTitle,
          "지원 방식": supportMethod,
          지원금액: supportAmount,
          금리: interestRate,
          "접수 마감일": receptionEndDate,
          "접수 방법": applicationMethod,
          "공고 URL": normalizedUrl,
          출처: sourceName,
          첨부파일: attachments,
          businessTypeCode
        };

      } else if ([429, 500, 502, 503, 504].includes(response.status)) {
        const delay = Math.pow(2, attempt) * 1000; // 지수 백오프
        console.log(`${subventionId} 요청 중 ${response.status} 오류 발생. ${attempt + 1}/${retries}회 재시도 중... ${delay}ms 대기.`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      } else {
        console.log(`${subventionId}의 상세 정보를 가져오는 데 실패했습니다. 상태 코드: ${response.status}`);
        return null;
      }
    } catch (error) {
      const delay = Math.pow(2, attempt) * 1000;
      console.log(`${subventionId} 요청 중 오류 발생: ${error}. ${attempt + 1}/${retries}회 재시도 중... ${delay}ms 대기.`);
      if (attempt < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  console.error(`${subventionId}의 요청이 실패하여 데이터를 가져오지 못했습니다.`);
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const params: CrawlParams = {
      industry: searchParams.get('industry') || '전체',
      area: searchParams.get('area') || '전체',
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      size: searchParams.get('size') ? parseInt(searchParams.get('size')!) : 10
    };

    console.log('크롤링 시작:', params);

    // 1단계: 지원사업 ID 목록 가져오기 (사용자 page=1을 API page=0으로 변환)
    const subventionIds = await fetchSubventionIds(
      params.industry!,
      params.area!,
      params.page! - 1,  // 사용자 페이지(1-based)를 API 페이지(0-based)로 변환
      params.size!
    );

    if (subventionIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          items: [],
          totalCount: 0,
          page: params.page,
          size: params.size,
          message: "조건에 맞는 지원사업이 없습니다."
        }
      });
    }

    console.log(`${subventionIds.length}개의 지원사업 ID 발견`);

    // 2단계: 각 ID의 상세 정보 크롤링 (병렬 처리)
    const crawlPromises = subventionIds.map(id => scrapeDetailPage(id));
    const results = await Promise.all(crawlPromises);

    // null 값 제거
    const validResults = results.filter(item => item !== null) as SubventionItem[];

    console.log(`${validResults.length}개의 상세 정보 크롤링 완료`);

    return NextResponse.json({
      success: true,
      data: {
        items: validResults,
        totalCount: validResults.length,
        page: params.page,
        size: params.size,
        requestedIds: subventionIds.length,
        successfulCrawls: validResults.length
      }
    });

  } catch (error) {
    console.error('크롤링 API 오류:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '크롤링 중 오류가 발생했습니다.'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { industry, area, maxPages = 144 } = body;

    console.log('대량 크롤링 시작:', { industry, area, maxPages });

    const allResults: SubventionItem[] = [];
    let totalIds = 0;

    // 여러 페이지 크롤링 (API는 0-based 페이지 사용)
    for (let page = 0; page < maxPages; page++) {
      console.log(`페이지 ${page + 1} 크롤링 중...`);

      const subventionIds = await fetchSubventionIds(industry, area, page);

      if (subventionIds.length === 0) {
        console.log(`페이지 ${page}에 더 이상 데이터가 없습니다.`);
        break;
      }

      totalIds += subventionIds.length;

      // 상세 정보 크롤링 (배치 처리)
      const batchSize = 10; // 동시 요청 수 제한
      for (let i = 0; i < subventionIds.length; i += batchSize) {
        const batch = subventionIds.slice(i, i + batchSize);
        const batchPromises = batch.map(id => scrapeDetailPage(id));
        const batchResults = await Promise.all(batchPromises);

        const validBatchResults = batchResults.filter(item => item !== null) as SubventionItem[];
        allResults.push(...validBatchResults);

        // 요청 간 지연 (서버 부하 방지)
        if (i + batchSize < subventionIds.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      console.log(`페이지 ${page + 1} 완료: ${subventionIds.length}개 ID, ${allResults.length}개 성공`);

      // 페이지 간 지연
      if (page < maxPages - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log(`대량 크롤링 완료: 총 ${totalIds}개 ID, ${allResults.length}개 성공`);

    return NextResponse.json({
      success: true,
      data: {
        items: allResults,
        totalCount: allResults.length,
        totalRequested: totalIds,
        successRate: totalIds > 0 ? (allResults.length / totalIds * 100).toFixed(2) : 0,
        pagesProcessed: Math.min(maxPages, 10) // 실제 처리된 페이지 수
      }
    });

  } catch (error) {
    console.error('대량 크롤링 API 오류:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '대량 크롤링 중 오류가 발생했습니다.'
      },
      { status: 500 }
    );
  }
}