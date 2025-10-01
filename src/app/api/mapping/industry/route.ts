import { NextRequest, NextResponse } from 'next/server';

// 업종 코드 매핑 데이터
const INDUSTRY_MAPPINGS: {
  standard: Record<string, string>;
  sites: Record<string, Record<string, string>>;
  reverse: Record<string, string>;
} = {
  // 표준 업종 코드
  standard: {
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
  },

  // 사이트별 업종 매핑
  sites: {
    // 중소벤처기업부 (중기청)
    "smes": {
      "전체": "ALL",
      "제조업": "MANUFACTURING",
      "정보통신업": "INFORMATION",
      "건설업": "CONSTRUCTION",
      "서비스업": "SERVICE",
      "도소매업": "WHOLESALE_RETAIL"
    },

    // 서울시
    "seoul": {
      "전업종": "ALL",
      "제조": "MANUFACTURING",
      "IT": "INFORMATION",
      "건설": "CONSTRUCTION",
      "서비스": "SERVICE",
      "유통": "WHOLESALE_RETAIL"
    },

    // 네이버 (기존)
    "naver": {
      "전체": "ALL",
      "자동차 및 부품 판매업": "MOTOR",
      "도매 및 상품 중개업": "WHOLESALE",
      "소매업(자동차 제외)": "RETAIL",
      "제조업": "MANUFACTURING",
      "정보통신업": "INFORMATION",
      "건설업": "CONSTRUCTION"
    }
  },

  // 역매핑 (코드 → 이름)
  reverse: {
    "ALL": "전체",
    "MOTOR": "자동차 및 부품 판매업",
    "WHOLESALE": "도매 및 상품 중개업",
    "RETAIL": "소매업(자동차 제외)",
    "LODGING": "숙박업",
    "RESTAURANT": "음식점업",
    "MANUFACTURING": "제조업",
    "EDUCATION": "교육 서비스업",
    "ORGANIZATION": "협회 및 단체, 수리 및 기타 개인 서비스업",
    "ESTATES": "부동산업",
    "TECHNICAL": "전문, 과학 및 기술 서비스업",
    "ARTS": "예술, 스포츠 및 여가관련 서비스업",
    "INFORMATION": "정보통신업",
    "FARMING": "농업, 임업 및 어업",
    "CONSTRUCTION": "건설업",
    "TRANSPORT": "운수 및 창고업",
    "HEALTH": "보건업 및 사회복지 서비스업",
    "BUSINESS_SUPPORT": "사업시설 관리, 사업 지원 및 임대 서비스업",
    "FINANCE": "금융 및 보험업",
    "SUPPLIER": "전기, 가스, 증기 및 공기 조절 공급업",
    "MINE": "광업",
    "RECYCLING": "수도, 하수 및 폐기물 처리, 원료 재생업",
    "EMPLOYMENT": "가구 내 고용활동 및 달리 분류되지 않은 자가 소비 생산활동",
    "DEFENCE": "공공 행정, 국방 및 사회보장 행정",
    "INTERNATIONAL": "국제 및 외국기관"
  }
};

// GET: 업종 매핑 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const site = searchParams.get('site');
    const industry = searchParams.get('industry');
    const code = searchParams.get('code');

    switch (action) {
      case 'list':
        // 전체 매핑 목록 반환
        if (site && INDUSTRY_MAPPINGS.sites[site]) {
          return NextResponse.json({
            success: true,
            data: INDUSTRY_MAPPINGS.sites[site],
            site: site
          });
        }
        return NextResponse.json({
          success: true,
          data: INDUSTRY_MAPPINGS.standard
        });

      case 'convert':
        // 업종명 → 코드 변환
        if (!industry) {
          return NextResponse.json(
            { success: false, error: 'industry 파라미터가 필요합니다.' },
            { status: 400 }
          );
        }

        let code_result;
        if (site && INDUSTRY_MAPPINGS.sites[site]) {
          code_result = INDUSTRY_MAPPINGS.sites[site][industry];
        } else {
          code_result = INDUSTRY_MAPPINGS.standard[industry];
        }

        if (!code_result) {
          return NextResponse.json(
            { success: false, error: `매핑되지 않은 업종입니다: ${industry}` },
            { status: 404 }
          );
        }

        return NextResponse.json({
          success: true,
          data: {
            industry: industry,
            code: code_result,
            site: site || 'standard'
          }
        });

      case 'reverse':
        // 코드 → 업종명 변환
        if (!code) {
          return NextResponse.json(
            { success: false, error: 'code 파라미터가 필요합니다.' },
            { status: 400 }
          );
        }

        const industry_result = INDUSTRY_MAPPINGS.reverse[code];
        if (!industry_result) {
          return NextResponse.json(
            { success: false, error: `매핑되지 않은 코드입니다: ${code}` },
            { status: 404 }
          );
        }

        return NextResponse.json({
          success: true,
          data: {
            code: code,
            industry: industry_result
          }
        });

      case 'sites':
        // 지원하는 사이트 목록
        return NextResponse.json({
          success: true,
          data: {
            sites: Object.keys(INDUSTRY_MAPPINGS.sites),
            standard: "standard"
          }
        });

      default:
        // 기본: 표준 매핑 반환
        return NextResponse.json({
          success: true,
          data: INDUSTRY_MAPPINGS.standard,
          actions: ['list', 'convert', 'reverse', 'sites']
        });
    }

  } catch (error) {
    console.error('업종 매핑 API 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '업종 매핑 조회 중 오류가 발생했습니다.'
      },
      { status: 500 }
    );
  }
}

// POST: 새로운 매핑 추가/수정
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, site, mappings, industry, code } = body;

    switch (action) {
      case 'add_site':
        // 새 사이트 매핑 추가
        if (!site || !mappings) {
          return NextResponse.json(
            { success: false, error: 'site와 mappings 파라미터가 필요합니다.' },
            { status: 400 }
          );
        }

        // 메모리 내 추가 (실제로는 DB나 파일에 저장해야 함)
        INDUSTRY_MAPPINGS.sites[site] = mappings;

        return NextResponse.json({
          success: true,
          message: `사이트 '${site}' 매핑이 추가되었습니다.`,
          data: INDUSTRY_MAPPINGS.sites[site]
        });

      case 'add_mapping':
        // 기존 사이트에 매핑 추가
        if (!site || !industry || !code) {
          return NextResponse.json(
            { success: false, error: 'site, industry, code 파라미터가 필요합니다.' },
            { status: 400 }
          );
        }

        if (!INDUSTRY_MAPPINGS.sites[site]) {
          INDUSTRY_MAPPINGS.sites[site] = {};
        }

        INDUSTRY_MAPPINGS.sites[site][industry] = code;

        return NextResponse.json({
          success: true,
          message: `사이트 '${site}'에 매핑이 추가되었습니다: ${industry} → ${code}`,
          data: INDUSTRY_MAPPINGS.sites[site]
        });

      case 'update_standard':
        // 표준 매핑 업데이트
        if (!industry || !code) {
          return NextResponse.json(
            { success: false, error: 'industry, code 파라미터가 필요합니다.' },
            { status: 400 }
          );
        }

        INDUSTRY_MAPPINGS.standard[industry] = code;
        INDUSTRY_MAPPINGS.reverse[code] = industry;

        return NextResponse.json({
          success: true,
          message: `표준 매핑이 업데이트되었습니다: ${industry} → ${code}`
        });

      default:
        return NextResponse.json(
          { success: false, error: '지원하지 않는 액션입니다.' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('업종 매핑 API 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '업종 매핑 추가 중 오류가 발생했습니다.'
      },
      { status: 500 }
    );
  }
}

// DELETE: 매핑 삭제
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const site = searchParams.get('site');
    const industry = searchParams.get('industry');

    if (!site) {
      return NextResponse.json(
        { success: false, error: 'site 파라미터가 필요합니다.' },
        { status: 400 }
      );
    }

    if (!INDUSTRY_MAPPINGS.sites[site]) {
      return NextResponse.json(
        { success: false, error: `존재하지 않는 사이트입니다: ${site}` },
        { status: 404 }
      );
    }

    if (industry) {
      // 특정 매핑 삭제
      if (INDUSTRY_MAPPINGS.sites[site][industry]) {
        delete INDUSTRY_MAPPINGS.sites[site][industry];
        return NextResponse.json({
          success: true,
          message: `사이트 '${site}'에서 '${industry}' 매핑이 삭제되었습니다.`
        });
      } else {
        return NextResponse.json(
          { success: false, error: `매핑이 존재하지 않습니다: ${industry}` },
          { status: 404 }
        );
      }
    } else {
      // 전체 사이트 삭제
      delete INDUSTRY_MAPPINGS.sites[site];
      return NextResponse.json({
        success: true,
        message: `사이트 '${site}' 전체 매핑이 삭제되었습니다.`
      });
    }

  } catch (error) {
    console.error('업종 매핑 API 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '업종 매핑 삭제 중 오류가 발생했습니다.'
      },
      { status: 500 }
    );
  }
}