"use client";

import { useState, useEffect } from "react";

// 공공조달 입찰공고 데이터 타입
interface BidNotice {
  bidNtceNo: string;        // 입찰공고번호
  bidNtceNm: string;        // 입찰공고명
  ntceInsttNm: string;      // 공고기관명
  dminsttNm: string;        // 수요기관명
  bidNtceDt: string;        // 입찰공고일시
  bidBeginDt: string;       // 입찰접수시작일시
  bidClseDt: string;        // 입찰접수마감일시
  opengDt: string;          // 개찰일시
  presmptPrce: string;      // 추정가격 (문자열로 변경)
  asignBdgtAmt: string;     // 배정예산액
  bidMethdNm: string;       // 입찰방법명
  cntrctCnclsMthdNm: string; // 계약체결방법명
  ntceInsttOfclNm: string;  // 공고기관담당자명
  ntceInsttOfclTelNo: string; // 공고기관담당자전화번호
  ntceInsttOfclEmailAdrs: string; // 공고기관담당자이메일
}

interface ApiResponse {
  success: boolean;
  data?: {
    response: {
      header: {
        resultCode: string;
        resultMsg: string;
      };
      body: {
        items: BidNotice[];
        numOfRows: number;
        pageNo: number;
        totalCount: number;
      };
    };
  };
  error?: string;
}

export default function ProcurementPage() {
  const [bidNotices, setBidNotices] = useState<BidNotice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: ""
  });
  const [statusFilter, setStatusFilter] = useState<"all" | "ongoing" | "closed">("all");

  // 현재 날짜 기준으로 기본 날짜 범위 설정 (1주일로 제한)
  useEffect(() => {
    const today = new Date();
    const oneWeekLater = new Date(today.getTime() + (7 * 24 * 60 * 60 * 1000)); // 1주일 후

    // 오늘 날짜를 YYYYMMDDHHMM 형식으로 변환
    const todayStr = formatDateForAPI(today);
    const oneWeekLaterStr = formatDateForAPI(oneWeekLater);

    setDateRange({
      startDate: todayStr, // 오늘 날짜
      endDate: oneWeekLaterStr // 1주일 후
    });
  }, []);

  // 날짜를 API 형식으로 변환 (YYYYMMDDHHMM)
  const formatDateForAPI = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}0000`;
  };

  // 날짜 범위 검증 (1주일 이내로 제한)
  const validateDateRange = (startDate: string, endDate: string): boolean => {
    if (!startDate || !endDate) return false;
    
    const start = new Date(
      parseInt(startDate.substring(0, 4)),
      parseInt(startDate.substring(4, 6)) - 1,
      parseInt(startDate.substring(6, 8))
    );
    
    const end = new Date(
      parseInt(endDate.substring(0, 4)),
      parseInt(endDate.substring(4, 6)) - 1,
      parseInt(endDate.substring(6, 8))
    );
    
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays <= 7; // 1주일 이내
  };

  // 날짜를 화면 표시용으로 변환
  const formatDateForDisplay = (dateString: string): string => {
    if (!dateString) return "정보없음";
    
    // 이미 YYYY-MM-DD HH:MM:SS 형식인 경우
    if (dateString.includes('-') && dateString.includes(':')) {
      return dateString.substring(0, 16); // YYYY-MM-DD HH:MM까지만 표시
    }
    
    // YYYYMMDDHHMM 형식인 경우
    if (dateString.length >= 8) {
      const year = dateString.substring(0, 4);
      const month = dateString.substring(4, 6);
      const day = dateString.substring(6, 8);
      const hour = dateString.substring(8, 10) || '00';
      const minute = dateString.substring(10, 12) || '00';
      return `${year}-${month}-${day} ${hour}:${minute}`;
    }
    
    return dateString;
  };

  // 금액을 천 단위로 구분하여 표시
  const formatPrice = (price: string | number): string => {
    if (!price) return "미정";
    const numPrice = typeof price === 'string' ? parseInt(price) : price;
    if (isNaN(numPrice)) return "미정";
    return numPrice.toLocaleString() + "원";
  };

  // 서버 사이드 페이지네이션으로 데이터 조회
  const fetchBidNotices = async (page: number = 1) => {
    setLoading(true);
    setError(null);

    // 날짜 범위 검증
    if (!validateDateRange(dateRange.startDate, dateRange.endDate)) {
      setError("날짜 범위는 1주일 이내로 설정해주세요.");
      setLoading(false);
      return;
    }

    try {
      const params = new URLSearchParams({
        pageNo: page.toString(),
        numOfRows: "100", // 한 번에 100개씩 가져오기
        type: "json",
        inqryDiv: "1",
        inqryBgnDt: dateRange.startDate,
        inqryEndDt: dateRange.endDate,
        // 필터링 파라미터 추가
        statusFilter: statusFilter,
        searchKeyword: searchKeyword
      });

      const response = await fetch(`/api/bid-notices?${params.toString()}`);
      const result: ApiResponse = await response.json();

      if (result.success && result.data) {
        const { response: apiResponse } = result.data;

        if (apiResponse.header.resultCode === "00") {
          const notices = apiResponse.body.items || [];
          
          // 공고일 기준 최신순 정렬
          const sortedNotices = notices.sort((a, b) => {
            const dateA = new Date(a.bidNtceDt);
            const dateB = new Date(b.bidNtceDt);
            return dateB.getTime() - dateA.getTime(); // 최신순
          });

          setBidNotices(sortedNotices);
          setTotalCount(apiResponse.body.totalCount);
          setCurrentPage(page);
        } else {
          setError(`API 오류: ${apiResponse.header.resultMsg}`);
        }
      } else {
        setError(result.error || "데이터를 불러오는데 실패했습니다.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 클라이언트 사이드 필터링 (현재 페이지 데이터만)
  const applyFilters = (notices: BidNotice[]) => {
    let filteredNotices = notices;

    // 상태 필터링 (마감/진행중)
    if (statusFilter !== "all") {
      filteredNotices = notices.filter(notice => {
        const bidStatus = getBidStatus(notice.bidClseDt);
        if (statusFilter === "ongoing") {
          return bidStatus.text !== "마감";
        } else if (statusFilter === "closed") {
          return bidStatus.text === "마감";
        }
        return true;
      });
    }

    // 키워드 검색 필터링
    if (searchKeyword) {
      filteredNotices = filteredNotices.filter(notice =>
        notice.bidNtceNm.includes(searchKeyword) ||
        notice.ntceInsttNm.includes(searchKeyword) ||
        notice.dminsttNm.includes(searchKeyword)
      );
    }

    return filteredNotices;
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    if (dateRange.startDate && dateRange.endDate) {
      fetchBidNotices(1);
    }
  }, [dateRange.startDate, dateRange.endDate]);

  // 필터 변경 시 서버에서 새 데이터 조회
  useEffect(() => {
    if (dateRange.startDate && dateRange.endDate) {
      fetchBidNotices(1); // 필터 변경 시 첫 페이지부터 다시 조회
    }
  }, [statusFilter, searchKeyword]);

  // 검색 실행
  const handleSearch = () => {
    setCurrentPage(1);
    fetchBidNotices(1);
  };

  // 페이지 변경
  const handlePageChange = (pageNo: number) => {
    fetchBidNotices(pageNo);
  };

  // 입찰 상태 계산
  const getBidStatus = (bidClseDt: string) => {
    if (!bidClseDt) return { text: "정보없음", color: "text-gray-500 bg-gray-100" };

    const closeDate = new Date(
      parseInt(bidClseDt.substring(0, 4)),
      parseInt(bidClseDt.substring(4, 6)) - 1,
      parseInt(bidClseDt.substring(6, 8)),
      parseInt(bidClseDt.substring(8, 10)),
      parseInt(bidClseDt.substring(10, 12))
    );

    const now = new Date();
    const diffTime = closeDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: "마감", color: "text-red-600 bg-red-50" };
    if (diffDays === 0) return { text: "오늘마감", color: "text-red-600 bg-red-50" };
    if (diffDays <= 3) return { text: `${diffDays}일 남음`, color: "text-orange-600 bg-orange-50" };
    if (diffDays <= 7) return { text: `${diffDays}일 남음`, color: "text-yellow-600 bg-yellow-50" };
    return { text: `${diffDays}일 남음`, color: "text-green-600 bg-green-50" };
  };

  return (
    <div className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 페이지 타이틀 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">공공조달 입찰공고</h1>
          <p className="mt-2 text-gray-600">
            실시간 공공조달 입찰공고 정보를 확인하세요
          </p>
        </div>

        {/* 검색 필터 섹션 */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                조회 시작일
              </label>
              <input
                type="date"
                value={dateRange.startDate ?
                  `${dateRange.startDate.substring(0,4)}-${dateRange.startDate.substring(4,6)}-${dateRange.startDate.substring(6,8)}`
                  : ""
                }
                onChange={(e) => {
                  const date = e.target.value.replace(/-/g, '') + '0000';
                  setDateRange(prev => {
                    const newStartDate = date;
                    // 시작일이 변경되면 종료일을 자동으로 1주일 후로 설정
                    const startDate = new Date(
                      parseInt(newStartDate.substring(0, 4)),
                      parseInt(newStartDate.substring(4, 6)) - 1,
                      parseInt(newStartDate.substring(6, 8))
                    );
                    const endDate = new Date(startDate.getTime() + (7 * 24 * 60 * 60 * 1000)); // 1주일 후
                    const newEndDate = formatDateForAPI(endDate);
                    
                    return { 
                      startDate: newStartDate, 
                      endDate: newEndDate 
                    };
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                조회 종료일
              </label>
              <input
                type="date"
                value={dateRange.endDate ?
                  `${dateRange.endDate.substring(0,4)}-${dateRange.endDate.substring(4,6)}-${dateRange.endDate.substring(6,8)}`
                  : ""
                }
                onChange={(e) => {
                  const date = e.target.value.replace(/-/g, '') + '2359';
                  setDateRange(prev => ({ ...prev, endDate: date }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                키워드 검색
              </label>
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="공고명, 기관명으로 검색"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* 필터 섹션 */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              상태 필터
            </label>
            <div className="flex space-x-4">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  statusFilter === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                전체
              </button>
              <button
                onClick={() => setStatusFilter("ongoing")}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  statusFilter === "ongoing"
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                진행중
              </button>
              <button
                onClick={() => setStatusFilter("closed")}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  statusFilter === "closed"
                    ? "bg-red-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                마감
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {loading ? "데이터 조회 중..." : `총 ${totalCount}개의 입찰공고 중 ${bidNotices.length}개 표시 (${currentPage}페이지)`}
          </div>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {loading ? "조회 중..." : "검색"}
            </button>
          </div>
        </div>

        {/* 사용 안내 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="text-blue-600">
            📅 <strong>사용 안내:</strong> 
            <ul className="mt-2 space-y-1 text-sm">
              <li>• 기본 조회 시작일은 오늘 날짜로 설정됩니다</li>
              <li>• 시작일을 선택하면 종료일이 자동으로 1주일 후로 설정됩니다</li>
              <li>• 날짜 범위는 최대 1주일까지 조회 가능합니다</li>
              <li>• 데이터는 공고일 기준 최신순으로 정렬됩니다</li>
              <li>• 상태 필터로 진행중/마감 공고를 선택하여 볼 수 있습니다</li>
              <li>• 키워드 검색으로 공고명, 기관명으로 필터링할 수 있습니다</li>
            </ul>
          </div>
        </div>

        {/* 오류 메시지 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="text-red-600">⚠️ {error}</div>
          </div>
        )}

        {/* 입찰공고 목록 */}
        <div className="space-y-4">
          {bidNotices.length === 0 && !loading ? (
            <div className="bg-white p-8 rounded-lg shadow-sm text-center">
              <div className="text-gray-500 text-lg mb-2">📋</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                조건에 맞는 입찰공고가 없습니다
              </h3>
              <p className="text-gray-600">
                다른 조건으로 검색해보세요
              </p>
            </div>
          ) : (
            bidNotices.map((notice, index) => {
              const bidStatus = getBidStatus(notice.bidClseDt);
              return (
                <div key={`${notice.bidNtceNo}-${index}`} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {notice.bidNtceNm}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${bidStatus.color}`}>
                          {bidStatus.text}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600 mb-3">
                        <p><span className="font-medium">공고기관:</span> {notice.ntceInsttNm}</p>
                        <p><span className="font-medium">수요기관:</span> {notice.dminsttNm}</p>
                        <p><span className="font-medium">입찰방법:</span> {notice.bidMethdNm}</p>
                        <p><span className="font-medium">계약체결방법:</span> {notice.cntrctCnclsMthdNm}</p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1">💰 <span className="font-medium">추정가격:</span> {formatPrice(notice.presmptPrce)}</span>
                        <span className="flex items-center gap-1">💳 <span className="font-medium">배정예산:</span> {formatPrice(notice.asignBdgtAmt)}</span>
                        <span className="flex items-center gap-1">📅 <span className="font-medium">공고일:</span> {formatDateForDisplay(notice.bidNtceDt)}</span>
                        <span className="flex items-center gap-1">⏰ <span className="font-medium">마감일:</span> {formatDateForDisplay(notice.bidClseDt)}</span>
                        {notice.opengDt && <span className="flex items-center gap-1">🔍 <span className="font-medium">개찰일:</span> {formatDateForDisplay(notice.opengDt)}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-gray-100 gap-3 sm:gap-0">
                    <div className="space-x-2">
                      <a
                        href={`https://www.g2b.go.kr/ep/invitation/publish/bidInfoDtl.do?bidno=${notice.bidNtceNo}&bidseq=000&reNtceYn=Y`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        자세히 보기
                      </a>
                      <button className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        관심 등록
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 페이지네이션 */}
        {totalCount > 0 && (
          <div className="mt-8 flex justify-center">
            <div className="bg-white px-6 py-3 rounded-lg shadow-sm">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  {currentPage} 페이지 / 총 {Math.ceil(totalCount / 100)} 페이지
                  <span className="text-blue-600 ml-2">
                    (총 {totalCount}개)
                  </span>
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1 || loading}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    이전
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= Math.ceil(totalCount / 100) || loading}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    다음
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}