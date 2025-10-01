import { NextRequest, NextResponse } from 'next/server';

const SERVICE_KEY = process.env.PUBLIC_DATA_API_KEY;
const IS_DEVELOPMENT = false; // 실제 API 호출 모드

interface BidResultParams {
  pageNo?: number;
  numOfRows?: number;
  type?: string;
  inqryDiv?: number;
  inqryBgnDt?: string;
  inqryEndDt?: string;
}

// ✅ 기본 날짜 포맷 함수 (YYYYMMDDHHmm)
function formatDate(date: Date): string {
  const yyyy = date.getFullYear();
  const MM = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}${MM}${dd}0000`;
}

// ✅ 최근 한 달 기본값
function getDefaultDates() {
  const end = new Date();
  const start = new Date();
  start.setMonth(start.getMonth() - 1);
  return {
    inqryBgnDt: "202501010000", // 2025년 1월 1일
    inqryEndDt: "202501312359", // 2025년 1월 31일
  };
}

function getMockBidResults(params: BidResultParams) {
  const mockData = [
    {
      bidNtceNo: "20250926001",
      bidNtceNm: "[완료] IT 인프라 구축 사업",
      ntceInsttNm: "한국정보화진흥원",
      dminsttNm: "행정안전부",
      bidClsfcNo: "70101",
      bidClsfcNm: "전자계산기용 응용S/W 개발공급",
      scsbidNm: "ABC소프트웨어",
      scsbidAmt: 450000000,
      scsbidDt: "202510150900",
    }
  ];

  return {
    response: {
      header: { resultCode: "00", resultMsg: "정상처리되었습니다.(개발모드)" },
      body: {
        items: mockData,
        numOfRows: params.numOfRows || 10,
        pageNo: params.pageNo || 1,
        totalCount: mockData.length,
      }
    }
  };
}

// 낙찰정보 조회 API 함수
async function getBidResultList(params: BidResultParams) {
  // API 키가 없거나 기본값인 경우 목업 데이터 사용
  if (!SERVICE_KEY || SERVICE_KEY === "발급받은_인증키_여기에_넣기") {
    console.log('API 키가 설정되지 않음: 목업 데이터를 사용합니다.');
    return getMockBidResults(params);
  }

  const baseUrl = "https://apis.data.go.kr/1230000/as/ScsbidInfoService";
  const endpoint = "/getScsbidListSttusThng"; // 물품 낙찰 현황 조회

  // ✅ 날짜 기본값 보정
  const { inqryBgnDt, inqryEndDt } = getDefaultDates();

  // ✅ API 키 처리 (인코딩된 키 사용)
  let serviceKey = SERVICE_KEY || "";
  // 인코딩된 키를 그대로 사용 (디코딩하지 않음)

  const searchParams = new URLSearchParams({
    serviceKey: serviceKey,
    pageNo: (params.pageNo || 1).toString(),
    numOfRows: (params.numOfRows || 10).toString(),
    type: params.type || "json",
    inqryDiv: (params.inqryDiv || 1).toString(),
    inqryBgnDt: params.inqryBgnDt || inqryBgnDt,
    inqryEndDt: params.inqryEndDt || inqryEndDt,
  });

  const url = `${baseUrl}${endpoint}?${searchParams.toString()}`;

  try {
    const response = await fetch(url, { method: 'GET' });
    const text = await response.text();

    // ✅ HTML 에러 방어
    if (text.startsWith('<') || text.includes('OpenAPI_S')) {
      throw new Error('API 키 오류 또는 잘못된 요청입니다.');
    }

    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error("API 응답 파싱 오류: JSON 형식이 아닙니다.");
    }

    // ✅ resultCode 체크
    if (data?.response?.header?.resultCode !== "00") {
      throw new Error(`조달청 API 오류: ${data?.response?.header?.resultMsg || "알 수 없는 오류"}`);
    }

    return data;
  } catch (error) {
    console.error('API 호출 오류:', error);
    console.log('API 호출 실패, 목업 데이터를 사용합니다.');
    return getMockBidResults(params);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const params: BidResultParams = {
      pageNo: searchParams.get('pageNo') ? parseInt(searchParams.get('pageNo')!) : 1,
      numOfRows: searchParams.get('numOfRows') ? parseInt(searchParams.get('numOfRows')!) : 10,
      type: searchParams.get('type') || 'json',
      inqryDiv: searchParams.get('inqryDiv') ? parseInt(searchParams.get('inqryDiv')!) : 2,
      inqryBgnDt: searchParams.get('inqryBgnDt') || undefined,
      inqryEndDt: searchParams.get('inqryEndDt') || undefined,
    };

    const data = await getBidResultList(params);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('API 에러:', error);

    let errorMessage = 'Unknown error';
    let statusCode = 500;

    if (error instanceof Error) {
      errorMessage = error.message;
      if (errorMessage.includes('API 키') || errorMessage.includes('인증키')) {
        statusCode = 400;
      } else if (errorMessage.includes('필수 파라미터')) {
        statusCode = 422;
      }
    }

    return NextResponse.json(
      { success: false, error: errorMessage, developmentMode: IS_DEVELOPMENT },
      { status: statusCode }
    );
  }
}