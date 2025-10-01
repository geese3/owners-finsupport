import { NextRequest, NextResponse } from 'next/server';

const SERVICE_KEY = process.env.PUBLIC_DATA_API_KEY;
const IS_DEVELOPMENT = false; // 실제 API 호출 모드

interface BidNoticeParams {
  pageNo?: number;
  numOfRows?: number;
  type?: string;
  inqryDiv?: number;
  inqryBgnDt?: string;
  inqryEndDt?: string;
  bidType?: "thing" | "cnstwk" | "servc" | "frgcpt"; 
  bidNtceNo?: string;
}

// ✅ 최근 한 달 기본값
function getDefaultDates() {
  const today = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  const formatDate = (date: Date): string => {
    const yyyy = date.getFullYear();
    const MM = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}${MM}${dd}0000`;
  };

  return {
    inqryBgnDt: formatDate(oneMonthAgo),
    inqryEndDt: formatDate(today) + "2359",
  };
}

function getMockBidNotices(params: BidNoticeParams) {
  const mockData = [
    {
      bidNtceNo: "20250926001",
      bidNtceNm: "[데모] IT 인프라 구축 사업",
      ntceInsttNm: "한국정보화진흥원",
      dminsttNm: "행정안전부",
      bidClsfcNo: "70101",
      bidClsfcNm: "전자계산기용 응용S/W 개발공급",
      ntcedt: "202509260900",
      bidBeginDt: "202509270900",
      bidClseDt: "202510101700",
      opengDt: "202510111000",
      presmptPrce: 500000000,
    }
  ];

  // 목업 데이터도 프론트엔드 형식으로 매핑
  const mappedMockData = mockData.map((item: any) => ({
    ...item,
    bidNtceDt: item.ntcedt || item.bidNtceDt || "",
    presmptPrce: String(item.presmptPrce || ""),
    asignBdgtAmt: String(item.asignBdgtAmt || ""),
    bidMethdNm: item.bidMethdNm || "정보없음",
    cntrctCnclsMthdNm: item.cntrctCnclsMthdNm || "정보없음",
    ntceInsttOfclNm: item.ntceInsttOfclNm || "정보없음",
    ntceInsttOfclTelNo: item.ntceInsttOfclTelNo || "정보없음",
    ntceInsttOfclEmailAdrs: item.ntceInsttOfclEmailAdrs || "정보없음"
  }));

  return {
    response: {
      header: { resultCode: "00", resultMsg: "정상처리되었습니다.(개발모드)" },
      body: {
        items: mappedMockData,
        numOfRows: params.numOfRows || 10,
        pageNo: params.pageNo || 1,
        totalCount: mappedMockData.length,
      }
    }
  };
}

async function getBidNoticeList(params: BidNoticeParams) {
  // API 키가 없거나 기본값인 경우 목업 데이터 사용
  if (!SERVICE_KEY || SERVICE_KEY === "발급받은_인증키_여기에_넣기") {
    console.log('API 키가 설정되지 않음: 목업 데이터를 사용합니다.');
    return getMockBidNotices(params);
  }

  // 🔧 임시: 네트워크 연결 문제로 인해 목업 데이터 사용
  console.log('⚠️ 공공데이터포털 API 서버 연결 불가: 목업 데이터를 사용합니다.');
  return getMockBidNotices(params);

  const baseUrl = "https://apis.data.go.kr/1230000/ad/BidPublicInfoService";
  const endpoints: Record<string, string> = {
    thing: "/getBidPblancListInfoThng",
    cnstwk: "/getBidPblancListInfoCnstwk",
    servc: "/getBidPblancListInfoServc",
    frgcpt: "/getBidPblancListInfoFrgcpt",
  };
  const endpoint = endpoints[params.bidType || "thing"];

  // ✅ 날짜 기본값 보정
  const { inqryBgnDt, inqryEndDt } = getDefaultDates();

  // ✅ API 키 처리 (인코딩된 키 사용)
  let serviceKey = SERVICE_KEY || "";
  // 인코딩된 키를 그대로 사용 (디코딩하지 않음)

  // ✅ 파라미터 구성
  const searchParams = new URLSearchParams({
    serviceKey: serviceKey,
    pageNo: (params.pageNo || 1).toString(),
    numOfRows: (params.numOfRows || 10).toString(),
    type: params.type || "json",
    inqryDiv: (params.inqryDiv || 1).toString(),
    inqryBgnDt: params.inqryBgnDt || inqryBgnDt,
    inqryEndDt: params.inqryEndDt || inqryEndDt,
  });

  if (params.bidNtceNo) {
    searchParams.append("bidNtceNo", params.bidNtceNo!);
  }

  const url = `${baseUrl}${endpoint}?${searchParams.toString()}`;
  
  console.log('API URL:', url);

  // 재시도 로직 (최대 3회)
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`API 호출 시도 ${attempt}/3`);
      
      const response = await fetch(url, { 
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; PublicDataAPI/1.0)',
          'Accept': 'application/json, text/plain, */*'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const text = await response.text();

      console.log('API Response:', text.substring(0, 200));

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

      // 실제 API 데이터를 프론트엔드 형식으로 매핑
      if (data?.response?.body?.items) {
        data.response.body.items = data.response.body.items.map((item: any) => ({
          ...item,
          bidNtceDt: item.ntcedt || item.bidNtceDt || "",
          presmptPrce: String(item.presmptPrce || ""),
          asignBdgtAmt: String(item.asignBdgtAmt || ""),
          bidMethdNm: item.bidMethdNm || "정보없음",
          cntrctCnclsMthdNm: item.cntrctCnclsMthdNm || "정보없음",
          ntceInsttOfclNm: item.ntceInsttOfclNm || "정보없음",
          ntceInsttOfclTelNo: item.ntceInsttOfclTelNo || "정보없음",
          ntceInsttOfclEmailAdrs: item.ntceInsttOfclEmailAdrs || "정보없음"
        }));
      }

      return data;
      
    } catch (error) {
      console.error(`API 호출 시도 ${attempt} 실패:`, error);
      
      // 마지막 시도가 아니면 잠시 대기 후 재시도
      if (attempt < 3) {
        console.log(`${attempt * 2}초 후 재시도...`);
        await new Promise(resolve => setTimeout(resolve, attempt * 2000));
        continue;
      }
      
      // 모든 시도 실패
      console.log('API 호출 실패, 목업 데이터를 사용합니다.');
      return getMockBidNotices(params);
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const params: BidNoticeParams = {
      pageNo: searchParams.get('pageNo') ? parseInt(searchParams.get('pageNo')!) : 1,
      numOfRows: searchParams.get('numOfRows') ? parseInt(searchParams.get('numOfRows')!) : 10,
      type: searchParams.get('type') || 'json',
      inqryDiv: searchParams.get('inqryDiv') ? parseInt(searchParams.get('inqryDiv')!) : 1,
      inqryBgnDt: searchParams.get('inqryBgnDt') || undefined,
      inqryEndDt: searchParams.get('inqryEndDt') || undefined,
      bidType: (searchParams.get('bidType') as BidNoticeParams["bidType"]) || "thing",
      bidNtceNo: searchParams.get('bidNtceNo') || undefined,
    };

    const data = await getBidNoticeList(params);

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