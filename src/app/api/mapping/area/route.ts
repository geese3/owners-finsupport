import { NextRequest, NextResponse } from 'next/server';

// 지역 코드 매핑 데이터
const AREA_MAPPINGS: {
  standard: Record<string, string>;
  sites: Record<string, Record<string, string>>;
  reverse: Record<string, string>;
  groups: Record<string, string[]>;
} = {
  // 표준 지역 코드 (행정안전부 표준)
  standard: {
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
  },

  // 사이트별 지역 매핑
  sites: {
    // 중소벤처기업부
    "smes": {
      "전체": "00",
      "서울": "11",
      "부산": "26",
      "대구": "27",
      "인천": "28",
      "광주": "29",
      "대전": "30",
      "울산": "31",
      "세종": "36",
      "경기": "41",
      "충북": "43",
      "충남": "44",
      "전남": "46",
      "경북": "47",
      "경남": "48",
      "제주": "50",
      "강원": "51",
      "전북": "52"
    },

    // 서울시
    "seoul": {
      "전체": "ALL",
      "서울전체": "SEOUL_ALL",
      "강남구": "GANGNAM",
      "강동구": "GANGDONG",
      "강북구": "GANGBUK",
      "강서구": "GANGSEO",
      "관악구": "GWANAK",
      "광진구": "GWANGJIN",
      "구로구": "GURO",
      "금천구": "GEUMCHEON",
      "노원구": "NOWON",
      "도봉구": "DOBONG",
      "동대문구": "DONGDAEMUN",
      "동작구": "DONGJAK",
      "마포구": "MAPO",
      "서대문구": "SEODAEMUN",
      "서초구": "SEOCHO",
      "성동구": "SEONGDONG",
      "성북구": "SEONGBUK",
      "송파구": "SONGPA",
      "양천구": "YANGCHEON",
      "영등포구": "YEONGDEUNGPO",
      "용산구": "YONGSAN",
      "은평구": "EUNPYEONG",
      "종로구": "JONGNO",
      "중구": "JUNG",
      "중랑구": "JUNGNANG"
    },

    // 네이버 (기존)
    "naver": {
      "전체": "00000",
      "서울특별시": "11000",
      "부산광역시": "26000",
      "대구광역시": "27000",
      "인천광역시": "28000",
      "광주광역시": "29000",
      "대전광역시": "30000",
      "울산광역시": "31000",
      "세종특별자치시": "36000",
      "경기도": "41000"
    }
  },

  // 역매핑 (코드 → 이름)
  reverse: {
    "00000": "전체",
    "11000": "서울특별시",
    "26000": "부산광역시",
    "27000": "대구광역시",
    "28000": "인천광역시",
    "29000": "광주광역시",
    "30000": "대전광역시",
    "31000": "울산광역시",
    "36000": "세종특별자치시",
    "41000": "경기도",
    "43000": "충청북도",
    "44000": "충청남도",
    "46000": "전라남도",
    "47000": "경상북도",
    "48000": "경상남도",
    "50000": "제주특별자치도",
    "51000": "강원특별자치도",
    "52000": "전북특별자치도"
  },

  // 지역 그룹핑
  groups: {
    "수도권": ["11000", "28000", "41000"],
    "영남권": ["26000", "27000", "31000", "47000", "48000"],
    "호남권": ["29000", "46000", "52000"],
    "충청권": ["30000", "36000", "43000", "44000"],
    "강원권": ["51000"],
    "제주권": ["50000"]
  }
};

// GET: 지역 매핑 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const site = searchParams.get('site');
    const area = searchParams.get('area');
    const code = searchParams.get('code');
    const group = searchParams.get('group');

    switch (action) {
      case 'list':
        // 전체 매핑 목록 반환
        if (site && AREA_MAPPINGS.sites[site]) {
          return NextResponse.json({
            success: true,
            data: AREA_MAPPINGS.sites[site],
            site: site
          });
        }
        return NextResponse.json({
          success: true,
          data: AREA_MAPPINGS.standard
        });

      case 'convert':
        // 지역명 → 코드 변환
        if (!area) {
          return NextResponse.json(
            { success: false, error: 'area 파라미터가 필요합니다.' },
            { status: 400 }
          );
        }

        let code_result;
        if (site && AREA_MAPPINGS.sites[site]) {
          code_result = AREA_MAPPINGS.sites[site][area];
        } else {
          code_result = AREA_MAPPINGS.standard[area];
        }

        if (!code_result) {
          return NextResponse.json(
            { success: false, error: `매핑되지 않은 지역입니다: ${area}` },
            { status: 404 }
          );
        }

        return NextResponse.json({
          success: true,
          data: {
            area: area,
            code: code_result,
            site: site || 'standard'
          }
        });

      case 'reverse':
        // 코드 → 지역명 변환
        if (!code) {
          return NextResponse.json(
            { success: false, error: 'code 파라미터가 필요합니다.' },
            { status: 400 }
          );
        }

        const area_result = AREA_MAPPINGS.reverse[code];
        if (!area_result) {
          return NextResponse.json(
            { success: false, error: `매핑되지 않은 코드입니다: ${code}` },
            { status: 404 }
          );
        }

        return NextResponse.json({
          success: true,
          data: {
            code: code,
            area: area_result
          }
        });

      case 'groups':
        // 지역 그룹 조회
        if (group) {
          const group_areas = AREA_MAPPINGS.groups[group];
          if (!group_areas) {
            return NextResponse.json(
              { success: false, error: `존재하지 않는 그룹입니다: ${group}` },
              { status: 404 }
            );
          }

          const group_data = group_areas.map(code => ({
            code: code,
            area: AREA_MAPPINGS.reverse[code]
          }));

          return NextResponse.json({
            success: true,
            data: {
              group: group,
              areas: group_data
            }
          });
        }

        return NextResponse.json({
          success: true,
          data: {
            groups: Object.keys(AREA_MAPPINGS.groups),
            details: AREA_MAPPINGS.groups
          }
        });

      case 'sites':
        // 지원하는 사이트 목록
        return NextResponse.json({
          success: true,
          data: {
            sites: Object.keys(AREA_MAPPINGS.sites),
            standard: "standard"
          }
        });

      case 'search':
        // 지역 검색 (부분 일치)
        if (!area) {
          return NextResponse.json(
            { success: false, error: 'area 파라미터가 필요합니다.' },
            { status: 400 }
          );
        }

        const searchResults = Object.entries(AREA_MAPPINGS.standard)
          .filter(([name, code]) => name.includes(area))
          .map(([name, code]) => ({ area: name, code: code }));

        return NextResponse.json({
          success: true,
          data: {
            query: area,
            results: searchResults,
            count: searchResults.length
          }
        });

      default:
        // 기본: 표준 매핑 반환
        return NextResponse.json({
          success: true,
          data: AREA_MAPPINGS.standard,
          actions: ['list', 'convert', 'reverse', 'groups', 'sites', 'search']
        });
    }

  } catch (error) {
    console.error('지역 매핑 API 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '지역 매핑 조회 중 오류가 발생했습니다.'
      },
      { status: 500 }
    );
  }
}

// POST: 새로운 매핑 추가/수정
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, site, mappings, area, code, group, areas } = body;

    switch (action) {
      case 'add_site':
        // 새 사이트 매핑 추가
        if (!site || !mappings) {
          return NextResponse.json(
            { success: false, error: 'site와 mappings 파라미터가 필요합니다.' },
            { status: 400 }
          );
        }

        AREA_MAPPINGS.sites[site] = mappings;

        return NextResponse.json({
          success: true,
          message: `사이트 '${site}' 지역 매핑이 추가되었습니다.`,
          data: AREA_MAPPINGS.sites[site]
        });

      case 'add_mapping':
        // 기존 사이트에 매핑 추가
        if (!site || !area || !code) {
          return NextResponse.json(
            { success: false, error: 'site, area, code 파라미터가 필요합니다.' },
            { status: 400 }
          );
        }

        if (!AREA_MAPPINGS.sites[site]) {
          AREA_MAPPINGS.sites[site] = {};
        }

        AREA_MAPPINGS.sites[site][area] = code;

        return NextResponse.json({
          success: true,
          message: `사이트 '${site}'에 지역 매핑이 추가되었습니다: ${area} → ${code}`,
          data: AREA_MAPPINGS.sites[site]
        });

      case 'add_group':
        // 지역 그룹 추가
        if (!group || !areas || !Array.isArray(areas)) {
          return NextResponse.json(
            { success: false, error: 'group과 areas 배열 파라미터가 필요합니다.' },
            { status: 400 }
          );
        }

        AREA_MAPPINGS.groups[group] = areas;

        return NextResponse.json({
          success: true,
          message: `지역 그룹 '${group}'이 추가되었습니다.`,
          data: AREA_MAPPINGS.groups[group]
        });

      case 'update_standard':
        // 표준 매핑 업데이트
        if (!area || !code) {
          return NextResponse.json(
            { success: false, error: 'area, code 파라미터가 필요합니다.' },
            { status: 400 }
          );
        }

        AREA_MAPPINGS.standard[area] = code;
        AREA_MAPPINGS.reverse[code] = area;

        return NextResponse.json({
          success: true,
          message: `표준 지역 매핑이 업데이트되었습니다: ${area} → ${code}`
        });

      default:
        return NextResponse.json(
          { success: false, error: '지원하지 않는 액션입니다.' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('지역 매핑 API 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '지역 매핑 추가 중 오류가 발생했습니다.'
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
    const area = searchParams.get('area');
    const group = searchParams.get('group');

    if (group) {
      // 지역 그룹 삭제
      if (AREA_MAPPINGS.groups[group]) {
        delete AREA_MAPPINGS.groups[group];
        return NextResponse.json({
          success: true,
          message: `지역 그룹 '${group}'이 삭제되었습니다.`
        });
      } else {
        return NextResponse.json(
          { success: false, error: `존재하지 않는 그룹입니다: ${group}` },
          { status: 404 }
        );
      }
    }

    if (!site) {
      return NextResponse.json(
        { success: false, error: 'site 파라미터가 필요합니다.' },
        { status: 400 }
      );
    }

    if (!AREA_MAPPINGS.sites[site]) {
      return NextResponse.json(
        { success: false, error: `존재하지 않는 사이트입니다: ${site}` },
        { status: 404 }
      );
    }

    if (area) {
      // 특정 매핑 삭제
      if (AREA_MAPPINGS.sites[site][area]) {
        delete AREA_MAPPINGS.sites[site][area];
        return NextResponse.json({
          success: true,
          message: `사이트 '${site}'에서 '${area}' 매핑이 삭제되었습니다.`
        });
      } else {
        return NextResponse.json(
          { success: false, error: `매핑이 존재하지 않습니다: ${area}` },
          { status: 404 }
        );
      }
    } else {
      // 전체 사이트 삭제
      delete AREA_MAPPINGS.sites[site];
      return NextResponse.json({
        success: true,
        message: `사이트 '${site}' 전체 지역 매핑이 삭제되었습니다.`
      });
    }

  } catch (error) {
    console.error('지역 매핑 API 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '지역 매핑 삭제 중 오류가 발생했습니다.'
      },
      { status: 500 }
    );
  }
}