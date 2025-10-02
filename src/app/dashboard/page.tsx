"use client";

import { useState, useEffect, useCallback } from "react";

// 네이버 지원사업 데이터 타입
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

interface CrawlResponse {
  success: boolean;
  data?: {
    items: SubventionItem[];
    totalCount: number;
    page: number;
    size: number;
    requestedIds?: number;
    successfulCrawls?: number;
  };
  error?: string;
}

interface WorkflowResponse {
  success: boolean;
  data?: {
    executionId: string;
    message: string;
    statusUrl: string;
  };
  error?: string;
}

interface WorkflowStatus {
  id: string;
  workflowId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  currentStep: number;
  startTime: string;
  endTime?: string;
  progress: number;
  results: any[];
  errors: any[];
  logs: string[];
}

export default function DashboardPage() {
  const [subventions, setSubventions] = useState<SubventionItem[]>([]);
  const [allSubventions, setAllSubventions] = useState<SubventionItem[]>([]); // 전체 데이터 저장
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isFullDataLoaded, setIsFullDataLoaded] = useState(false); // 전체 데이터 로드 여부
  const [searchFilters, setSearchFilters] = useState({
    industry: '전체',
    area: '전체',
    keyword: ''
  });

  // 워크플로우 관련 상태
  const [workflowStatus, setWorkflowStatus] = useState<WorkflowStatus | null>(null);
  const [workflowLoading, setWorkflowLoading] = useState(false);

  // 클라이언트 사이드 필터링 함수
  const filterSubventions = useCallback((data: SubventionItem[], filters: typeof searchFilters) => {
    console.log('🔍 필터링 함수 실행:', {
      총데이터: data.length,
      필터: filters,
      키워드있음: !!filters.keyword,
      키워드값: filters.keyword,
      지역필터: filters.area
    });

    if (!data || data.length === 0) {
      console.log('❌ 필터링할 데이터가 없음');
      return [];
    }

    const filtered = data.filter(item => {
      // 키워드 검색 (가장 먼저 체크)
      const keywordMatch = !filters.keyword || filters.keyword.trim() === '' ||
        item.지원사업명?.toLowerCase().includes(filters.keyword.toLowerCase()) ||
        item.접수기관?.toLowerCase().includes(filters.keyword.toLowerCase()) ||
        item.출처?.toLowerCase().includes(filters.keyword.toLowerCase()) ||
        item["지원 방식"]?.toLowerCase().includes(filters.keyword.toLowerCase()) ||
        item.지역?.toLowerCase().includes(filters.keyword.toLowerCase());

      // 키워드가 있는데 매칭되지 않으면 바로 false 반환
      if (filters.keyword && filters.keyword.trim() !== '' && !keywordMatch) {
        return false;
      }

      // 지역 필터
      const areaMatch = filters.area === '전체' ||
        item.지역?.includes(filters.area) ||
        item.출처?.includes(filters.area);

      // 업종 필터 (간단한 키워드 매칭)
      const industryMatch = filters.industry === '전체' ||
        item.지원사업명?.includes(filters.industry === '제조업' ? '제조' : '') ||
        item.지원사업명?.includes(filters.industry === '소매업(자동차 제외)' ? '소매' : '') ||
        item.지원사업명?.includes(filters.industry === '음식점업' ? '음식' : '') ||
        item.지원사업명?.includes(filters.industry === '정보통신업' ? '정보통신' : '') ||
        item.지원사업명?.includes(filters.industry === '건설업' ? '건설' : '') ||
        true; // 정확한 업종 매칭이 어려우므로 일단 모든 데이터 포함

      return keywordMatch && areaMatch && industryMatch;
    });

    console.log('필터링 결과:', filtered.length, '개');
    return filtered;
  }, []);

  // 업종 옵션
  const industryOptions = [
    '전체', '제조업', '정보통신업', '건설업', '서비스업', '도소매업',
    '자동차 및 부품 판매업', '도매 및 상품 중개업', '소매업(자동차 제외)',
    '숙박업', '음식점업', '교육 서비스업', '부동산업', '전문, 과학 및 기술 서비스업'
  ];

  // 지역 옵션
  const areaOptions = [
    '전체', '서울특별시', '부산광역시', '대구광역시', '인천광역시', '광주광역시',
    '대전광역시', '울산광역시', '세종특별자치시', '경기도', '충청북도', '충청남도',
    '전라남도', '경상북도', '경상남도', '제주특별자치도', '강원특별자치도', '전북특별자치도'
  ];

  // 지원금액 포맷팅
  const formatAmount = (amount: string): string => {
    if (!amount || amount === "확인 필요") return "확인 필요";

    // 이미 포맷된 경우 (천 단위 구분자 포함)
    if (amount.includes(',')) return amount;

    // 숫자만 있는 경우
    const num = parseInt(amount.replace(/[^0-9]/g, ''));
    if (isNaN(num)) return amount;

    return num.toLocaleString() + '원';
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string): string => {
    if (!dateString || dateString === "확인 필요") return "확인 필요";

    // YY-MM-DD 형식인 경우 (2자리 연도를 4자리로 변환)
    if (/^\d{2}-\d{2}-\d{2}$/.test(dateString)) {
      const [year, month, day] = dateString.split('-');
      const fullYear = parseInt(year) < 50 ? `20${year}` : `19${year}`; // 50 미만이면 20xx, 이상이면 19xx
      return `${fullYear}-${month}-${day}`;
    }

    // 이미 YYYY-MM-DD 형식인 경우
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;

    // YYYYMMDD 형식인 경우 (8자리)
    if (dateString.length === 8 && /^\d{8}$/.test(dateString)) {
      const year = dateString.substring(0, 4);
      const month = dateString.substring(4, 6);
      const day = dateString.substring(6, 8);
      return `${year}-${month}-${day}`;
    }

    // YYYY.MM.DD 형식인 경우
    if (dateString.includes('.')) {
      return dateString.replace(/\./g, '-');
    }

    // YYYY/MM/DD 형식인 경우
    if (dateString.includes('/')) {
      return dateString.replace(/\//g, '-');
    }

    // 기타 형식은 그대로 반환
    return dateString;
  };

  // 마감일까지 남은 일수 계산
  const getDaysUntilDeadline = (dateString: string): { days: number; status: string; color: string } => {
    if (!dateString || dateString === "확인 필요") {
      return { days: 0, status: "확인 필요", color: "text-gray-500 bg-gray-100" };
    }

    let deadlineDate: Date;

    try {
      // 먼저 날짜를 표준 형식으로 변환
      const formattedDate = formatDate(dateString);

      if (formattedDate === "확인 필요") {
        return { days: 0, status: "확인 필요", color: "text-gray-500 bg-gray-100" };
      }

      // YYYY-MM-DD 형식으로 변환된 날짜를 파싱
      if (formattedDate.includes('-')) {
        deadlineDate = new Date(formattedDate);
      } else {
        // 날짜 파싱 실패
        return { days: 0, status: "날짜 형식 오류", color: "text-gray-500 bg-gray-100" };
      }

      // 유효한 날짜인지 확인
      if (isNaN(deadlineDate.getTime())) {
        return { days: 0, status: "날짜 형식 오류", color: "text-gray-500 bg-gray-100" };
      }

      const today = new Date();
      // 오늘 날짜를 00:00:00으로 설정
      today.setHours(0, 0, 0, 0);
      deadlineDate.setHours(0, 0, 0, 0);

      const diffTime = deadlineDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) return { days: diffDays, status: "마감", color: "text-red-600 bg-red-50" };
      if (diffDays === 0) return { days: 0, status: "오늘마감", color: "text-red-600 bg-red-50" };
      if (diffDays <= 3) return { days: diffDays, status: `${diffDays}일 남음`, color: "text-orange-600 bg-orange-50" };
      if (diffDays <= 7) return { days: diffDays, status: `${diffDays}일 남음`, color: "text-yellow-600 bg-yellow-50" };
      return { days: diffDays, status: `${diffDays}일 남음`, color: "text-green-600 bg-green-50" };
    } catch (error) {
      console.error('날짜 파싱 오류:', dateString, error);
      return { days: 0, status: "날짜 파싱 오류", color: "text-gray-500 bg-gray-100" };
    }
  };

  // 워크플로우 실행
  const runWorkflow = async (workflowId: string, params?: any) => {
    setWorkflowLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/workflow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'run',
          workflowId: workflowId,
          params: params
        })
      });

      const result: WorkflowResponse = await response.json();

      if (result.success && result.data) {
        // 워크플로우 상태 모니터링 시작
        monitorWorkflow(result.data.executionId);
      } else {
        setError(result.error || '워크플로우 실행에 실패했습니다.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '워크플로우 실행 중 오류가 발생했습니다.');
    } finally {
      setWorkflowLoading(false);
    }
  };

  // 워크플로우 상태 모니터링
  const monitorWorkflow = async (executionId: string) => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/workflow?action=status&executionId=${executionId}`);
        const result = await response.json();

        if (result.success && result.data) {
          setWorkflowStatus(result.data);

          // 완료되었으면 결과 데이터 추출
          if (result.data.status === 'completed' && result.data.results.length > 0) {
            const crawlResult = result.data.results.find((r: any) => r.stepId === 'crawl_naver' || r.stepId === 'batch_crawl_naver');
            if (crawlResult && crawlResult.result.data && crawlResult.result.data.items) {
              setSubventions(crawlResult.result.data.items);
              setTotalCount(crawlResult.result.data.totalCount || crawlResult.result.data.items.length);
            }
          }

          // 아직 실행 중이면 계속 모니터링
          if (result.data.status === 'running' || result.data.status === 'pending') {
            setTimeout(checkStatus, 2000); // 2초마다 상태 확인
          }
        }
      } catch (err) {
        console.error('워크플로우 상태 확인 중 오류:', err);
      }
    };

    checkStatus();
  };

  // 직접 크롤링 (워크플로우 없이)
  const fetchSubventions = async (page: number = 1) => {
    console.log('🌐 fetchSubventions 실행:', { page, searchFilters });
    setLoading(true);
    setError(null);

    try {
      // 키워드 검색 시에는 더 많은 데이터를 요청
      const size = searchFilters.keyword && searchFilters.keyword.trim() !== '' ? "50" : "10";

      const params = new URLSearchParams({
        industry: searchFilters.industry,
        area: searchFilters.area,
        page: page.toString(),
        size: size
      });

      const response = await fetch(`/api/crawl-finsupport?${params.toString()}`);
      const result: CrawlResponse = await response.json();

      if (result.success && result.data) {
        let filteredItems = result.data.items;

        // 키워드가 있는 경우 클라이언트 사이드 필터링 적용
        if (searchFilters.keyword && searchFilters.keyword.trim() !== '') {
          console.log('🔍 서버 데이터에 키워드 필터링 적용:', searchFilters.keyword);
          filteredItems = result.data.items.filter(item =>
            item.지원사업명?.toLowerCase().includes(searchFilters.keyword.toLowerCase()) ||
            item.접수기관?.toLowerCase().includes(searchFilters.keyword.toLowerCase()) ||
            item.출처?.toLowerCase().includes(searchFilters.keyword.toLowerCase()) ||
            item["지원 방식"]?.toLowerCase().includes(searchFilters.keyword.toLowerCase()) ||
            item.지역?.toLowerCase().includes(searchFilters.keyword.toLowerCase())
          );
          console.log('🔍 키워드 필터링 결과:', {
            원본: result.data.items.length,
            필터링후: filteredItems.length,
            키워드: searchFilters.keyword
          });
        }

        setSubventions(filteredItems);
        setTotalCount(filteredItems.length);
        setCurrentPage(page);

        console.log('✅ fetchSubventions 완료:', {
          총결과수: filteredItems.length,
          페이지: page,
          키워드적용여부: !!searchFilters.keyword
        });
      } else {
        setError(result.error || "데이터를 불러오는데 실패했습니다.");
      }
    } catch (err) {
      console.error('fetchSubventions 오류:', err);
      setError(err instanceof Error ? err.message : "네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 검색 실행
  const handleSearch = () => {
    if (isFullDataLoaded) {
      // 전체 데이터가 로드된 경우 클라이언트 사이드 필터링
      const filteredData = filterSubventions(allSubventions, searchFilters);
      setSubventions(filteredData);
      setTotalCount(filteredData.length);
      setCurrentPage(1);
    } else {
      // 전체 데이터가 로드되지 않은 경우 서버 사이드 검색
      setCurrentPage(1);
      fetchSubventions(1);
    }
  };

  // 워크플로우로 크롤링 실행
  const handleWorkflowCrawl = (workflowType: 'single' | 'batch') => {
    const workflowId = workflowType === 'single' ? 'naver_finsupport_full' : 'naver_batch_crawl';
    const params = {
      industry: searchFilters.industry,
      area: searchFilters.area
    };

    runWorkflow(workflowId, params);
  };

  // 전체 데이터 크롤링 (4,332개)
  const handleFullCrawl = async () => {
    console.log('전체 크롤링 시작');
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/crawl-finsupport', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          industry: '전체',
          area: '전체',
          maxPages: 144  // 144페이지 × 30개 = 4,320개 + 마지막 페이지 12개 = 4,332개
        }),
      });

      console.log('API 응답 받음:', response.status);
      const result: CrawlResponse = await response.json();
      console.log('API 결과:', {
        success: result.success,
        itemsLength: result.data?.items?.length,
        totalCount: result.data?.totalCount
      });

      if (result.success && result.data && result.data.items) {
        console.log('데이터 저장 중:', result.data.items.length, '개');

        // 샘플 데이터 로그
        console.log('샘플 데이터:', result.data.items[0]);

        // 상태 업데이트 전 현재 상태 로그
        console.log('상태 업데이트 전:', {
          currentAllSubventions: allSubventions.length,
          currentIsFullDataLoaded: isFullDataLoaded,
          currentSubventions: subventions.length
        });

        // 배치로 상태 업데이트 - React 18의 automatic batching을 활용
        setAllSubventions(result.data.items); // 전체 데이터 저장
        setSubventions(result.data.items); // 현재 표시 데이터도 업데이트
        setTotalCount(result.data.totalCount);
        setCurrentPage(1);
        setIsFullDataLoaded(true); // 전체 데이터 로드 완료 표시

        console.log('✅ 데이터 저장 완료:', {
          저장된데이터수: result.data.items.length,
          isFullDataLoaded설정: true,
          totalCount: result.data.totalCount
        });

        alert(`전체 크롤링 완료! 총 ${result.data.totalCount}개의 지원사업을 불러왔습니다. 이제 실시간 검색/필터링이 가능합니다.`);
      } else {
        console.error('API 실패:', result.error);
        setError(result.error || "전체 크롤링에 실패했습니다.");
      }
    } catch (err) {
      console.error('크롤링 오류:', err);
      setError(err instanceof Error ? err.message : "네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
      console.log('크롤링 완료');
    }
  };

  // 페이지 변경
  const handlePageChange = (pageNo: number) => {
    fetchSubventions(pageNo);
  };

  // 컴포넌트 마운트 시 기본 데이터 로드
  useEffect(() => {
    fetchSubventions(1);
  }, []);

  // 검색 필터 변경 시 처리 (디바운싱 적용)
  useEffect(() => {
    const effectId = Math.random().toString(36).substring(2, 11);
    console.log(`🔄 useEffect-${effectId} 실행:`, {
      isFullDataLoaded,
      allSubventionsLength: allSubventions.length,
      searchFilters,
      searchFiltersKeyword: searchFilters.keyword,
      timestamp: new Date().toLocaleTimeString()
    });

    // 디바운싱: 300ms 후에 검색 실행
    const timeoutId = setTimeout(() => {
      if (isFullDataLoaded && allSubventions.length > 0) {
        // 전체 데이터가 로드된 경우: 클라이언트 사이드 필터링
        console.log(`✅ useEffect-${effectId} 클라이언트 사이드 필터링 시작`, {
          데이터수: allSubventions.length,
          필터: searchFilters
        });
        const filteredData = filterSubventions(allSubventions, searchFilters);
        console.log(`✅ useEffect-${effectId} 필터링 결과:`, {
          원본데이터: allSubventions.length,
          필터링후: filteredData.length
        });
        setSubventions(filteredData);
        setTotalCount(filteredData.length);
        setCurrentPage(1);
        console.log(`✅ useEffect-${effectId} 클라이언트 필터링 완료`);
      } else {
        // 전체 데이터가 로드되지 않은 경우: 서버 사이드 검색
        console.log(`🌐 useEffect-${effectId} 서버 사이드 검색 시작:`, {
          이유: !isFullDataLoaded ? 'isFullDataLoaded가 false' : 'allSubventions가 비어있음',
          검색조건: searchFilters
        });

        // 서버 사이드 검색 실행
        fetchSubventions(1);
      }
    }, 300); // 300ms 디바운싱

    // 클린업: 다음 타이핑이 들어오면 이전 타이머 취소
    return () => {
      console.log(`🧹 useEffect-${effectId} 클린업: 타이머 취소`);
      clearTimeout(timeoutId);
    };
  }, [searchFilters, isFullDataLoaded, allSubventions, filterSubventions]);

  return (
    <div className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 페이지 타이틀 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">정부지원사업</h1>
          <p className="mt-2 text-gray-600">
            실시간 정부지원사업 정보를 확인하세요
          </p>
        </div>

        {/* 검색 필터 섹션 */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                업종
              </label>
              <select
                value={searchFilters.industry}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, industry: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {industryOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                지역
              </label>
              <select
                value={searchFilters.area}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, area: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {areaOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                키워드
              </label>
              <input
                type="text"
                value={searchFilters.keyword}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, keyword: e.target.value }))}
                placeholder="사업명으로 검색"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* 상태 정보 */}
          <div className="mb-4">
            <div className="text-sm text-gray-600 text-center sm:text-left">
              {loading || workflowLoading ? "데이터 조회 중..." :
                isFullDataLoaded
                  ? `🚀 전체 ${allSubventions.length}개 데이터 로드 완료 | 필터링 결과: ${subventions.length}개 표시 (실시간 검색 가능)`
                  : `총 ${totalCount}개의 지원사업 중 ${subventions.length}개 표시 (${currentPage}페이지)`
              }
            </div>
          </div>

          {/* 액션 버튼들 - 모바일 최적화 */}
          <div className="grid grid-cols-2 sm:flex sm:justify-end gap-2 sm:gap-2 mb-6">
            <button
              onClick={handleSearch}
              disabled={loading || workflowLoading}
              className="px-3 py-2 sm:px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-sm font-medium"
            >
              <span className="block sm:hidden">🔍 빠른검색</span>
              <span className="hidden sm:block">
                {loading ? "검색 중..." : isFullDataLoaded ? "🔍 즉시 검색" : "빠른 검색"}
              </span>
            </button>

            <button
              onClick={() => handleWorkflowCrawl('single')}
              disabled={loading || workflowLoading}
              className="px-3 py-2 sm:px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-sm font-medium"
            >
              <span className="block sm:hidden">🔧 워크플로우</span>
              <span className="hidden sm:block">
                {workflowLoading ? "워크플로우 실행 중..." : "워크플로우 검색"}
              </span>
            </button>

            <button
              onClick={() => handleWorkflowCrawl('batch')}
              disabled={loading || workflowLoading}
              className="px-3 py-2 sm:px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed text-sm font-medium"
            >
              <span className="block sm:hidden">📊 대량크롤링</span>
              <span className="hidden sm:block">대량 크롤링</span>
            </button>

            <button
              onClick={handleFullCrawl}
              disabled={loading || workflowLoading}
              className="px-3 py-2 sm:px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-sm font-medium"
            >
              <span className="block sm:hidden">🚀 전체크롤링</span>
              <span className="hidden sm:block">
                {loading ? "전체 크롤링 중..." : "🚀 전체 크롤링 (4,332개)"}
              </span>
            </button>
          </div>
        </div>

        {/* 워크플로우 상태 표시 */}
        {workflowStatus && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-medium text-blue-900">워크플로우 실행 상태</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                workflowStatus.status === 'completed' ? 'bg-green-100 text-green-800' :
                workflowStatus.status === 'running' ? 'bg-blue-100 text-blue-800' :
                workflowStatus.status === 'failed' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {workflowStatus.status}
              </span>
            </div>
            <div className="text-sm text-blue-700">
              <p>진행률: {workflowStatus.progress}%</p>
              <p>현재 단계: {workflowStatus.currentStep + 1} / {workflowStatus.results.length + workflowStatus.errors.length + 1}</p>
              {workflowStatus.logs.length > 0 && (
                <p>최근 로그: {workflowStatus.logs[workflowStatus.logs.length - 1]}</p>
              )}
            </div>
            {workflowStatus.progress > 0 && (
              <div className="mt-2 bg-blue-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${workflowStatus.progress}%` }}
                ></div>
              </div>
            )}
          </div>
        )}

        {/* 오류 메시지 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="text-red-600">⚠️ {error}</div>
          </div>
        )}

        {/* 지원사업 목록 */}
        <div className="space-y-4">
          {subventions.length === 0 && !loading && !workflowLoading ? (
            <div className="bg-white p-8 rounded-lg shadow-sm text-center">
              <div className="text-gray-500 text-lg mb-2">🏛️</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                조건에 맞는 지원사업이 없습니다
              </h3>
              <p className="text-gray-600">
                다른 조건으로 검색해보세요
              </p>
            </div>
          ) : (
            subventions.map((item, index) => {
              const deadline = getDaysUntilDeadline(item["접수 마감일"]);
              return (
                <div key={`${item.subventionId}-${index}`} className="bg-white p-4 sm:p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="mb-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 leading-tight">
                            {item.지원사업명}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${deadline.color} w-fit`}>
                            {deadline.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                        <p><span className="font-medium">접수기관:</span> {item.접수기관}</p>
                        <p><span className="font-medium">지역:</span> {item.지역}</p>
                        <p><span className="font-medium">지원방식:</span> {item["지원 방식"]}</p>
                        <p><span className="font-medium">접수방법:</span> {item["접수 방법"]}</p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-gray-500 pt-2">
                        <span className="flex items-center gap-1">💰 {formatAmount(item.지원금액)}</span>
                        <span className="flex items-center gap-1">📈 {item.금리}</span>
                        <span className="flex items-center gap-1">📅 {formatDate(item["접수 마감일"])}</span>
                        <span className="flex items-center gap-1">🏢 {item.출처}</span>
                        {item.첨부파일 && item.첨부파일 !== "없음" && (
                          <span className="flex items-center gap-1 col-span-full">📎 {item.첨부파일}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-gray-100 gap-3 sm:gap-0">
                    <div className="space-x-2">
                      {item["공고 URL"] &&
                       item["공고 URL"] !== "확인 필요" &&
                       item["공고 URL"].startsWith('http') ? (
                        <a
                          href={item["공고 URL"]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          자세히 보기
                        </a>
                      ) : (
                        <span className="inline-flex items-center px-4 py-2 border border-gray-200 rounded-md text-sm font-medium text-gray-400 bg-gray-50 cursor-not-allowed">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          링크 없음
                        </span>
                      )}
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
                  {currentPage} 페이지 / 총 {Math.ceil(totalCount / 10)} 페이지
                  <span className="text-blue-600 ml-2">
                    (총 {totalCount}개)
                  </span>
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1 || loading || workflowLoading}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    이전
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= Math.ceil(totalCount / 10) || loading || workflowLoading}
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