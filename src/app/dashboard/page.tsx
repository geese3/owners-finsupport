"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { SupportCard } from "@/components/SupportCard";

// 첨부파일 타입
interface AttachmentFile {
  url: string;
  name: string;
}

// 정부지원사업 데이터 타입
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
  첨부파일URL?: string; // 기존 호환성
  첨부파일목록?: AttachmentFile[]; // 여러 첨부파일 배열
  businessTypeCode: string;
  rawData?: any; // 디버깅용 raw_data
  showMethodDetail?: boolean; // 접수방법 상세창 표시 여부
}




export default function DashboardPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const isFirstRender = useRef(true);
  const isInitialized = useRef(false);
  const isInitializing = useRef(false);

  const [subventions, setSubventions] = useState<SubventionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(30);
  const [totalCount, setTotalCount] = useState(0);
  const [searchFilters, setSearchFilters] = useState({
    industry: '전체',
    area: '전체',
    keyword: ''
  });
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [favoriteLoading, setFavoriteLoading] = useState<Set<string>>(new Set());



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


  // 사용자 관심 목록 가져오기
  const fetchUserFavorites = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(`/api/favorites?user_id=${user.id}`);
      const result = await response.json();

      if (result.success && result.data) {
        const favoriteIds = new Set<string>(result.data.map((item: any) => item.item_id));
        setFavorites(favoriteIds);
      }
    } catch (error) {
      console.error('관심 목록 로드 실패:', error);
    }
  };

  // 관심 등록/해제 함수
  const handleFavoriteToggle = async (item: SubventionItem) => {
    if (!user?.id) {
      alert('로그인이 필요한 기능입니다.');
      return;
    }

    const subventionId = item.subventionId;
    const isFavorite = favorites.has(subventionId);

    // 로딩 상태 추가
    setFavoriteLoading(prev => new Set(prev).add(subventionId));

    try {
      if (isFavorite) {
        // 관심 해제
        const response = await fetch(`/api/favorites?user_id=${user.id}&subvention_id=${subventionId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setFavorites(prev => {
            const newFavorites = new Set(prev);
            newFavorites.delete(subventionId);
            return newFavorites;
          });
        } else {
          throw new Error('관심 해제에 실패했습니다.');
        }
      } else {
        // 관심 등록
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: user.id,
            subvention_id: subventionId,
            support_title: item.지원사업명,
            host_institution: item.접수기관,
            support_method: item["지원 방식"],
            support_amount: item.지원금액,
            application_deadline: item["접수 마감일"],
            announcement_url: item["공고 URL"],
            source: item.출처,
            attachments: item.첨부파일목록 || []
          }),
        });

        if (response.ok) {
          setFavorites(prev => new Set(prev).add(subventionId));
        } else {
          const errorData = await response.json();
          if (response.status === 409) {
            alert('이미 관심 등록된 지원사업입니다.');
          } else {
            throw new Error(errorData.error || '관심 등록에 실패했습니다.');
          }
        }
      }
    } catch (error) {
      console.error('관심 등록/해제 실패:', error);
      alert(error instanceof Error ? error.message : '오류가 발생했습니다.');
    } finally {
      // 로딩 상태 제거
      setFavoriteLoading(prev => {
        const newLoading = new Set(prev);
        newLoading.delete(subventionId);
        return newLoading;
      });
    }
  };

  // URL 매개변수 업데이트 함수
  const updateUrlParams = (newParams: {
    page?: number;
    limit?: number;
    industry?: string;
    area?: string;
    keyword?: string;
  }) => {
    const params = new URLSearchParams(searchParams.toString());

    if (newParams.page !== undefined) {
      params.set('page', newParams.page.toString());
    }
    if (newParams.limit !== undefined) {
      params.set('limit', newParams.limit.toString());
    }
    if (newParams.industry !== undefined && newParams.industry !== '전체') {
      params.set('industry', newParams.industry);
    } else if (newParams.industry === '전체') {
      params.delete('industry');
    }
    if (newParams.area !== undefined && newParams.area !== '전체') {
      params.set('area', newParams.area);
    } else if (newParams.area === '전체') {
      params.delete('area');
    }
    if (newParams.keyword !== undefined && newParams.keyword !== '') {
      params.set('keyword', newParams.keyword);
    } else if (newParams.keyword === '') {
      params.delete('keyword');
    }

    router.push(`/dashboard?${params.toString()}`);
  };

  // 데이터베이스에서 지원사업 데이터 가져오기 (실시간 조회)
  const fetchSubventions = async (page: number = 1) => {
    console.log('🌐 fetchSubventions 실행:', { page, searchFilters, itemsPerPage });
    setLoading(true);
    setError(null);

    // 페이지 변경이 아닌 검색/필터 변경시에만 데이터 클리어
    if (page === 1) {
      setSubventions([]);
    }

    try {
      // API 파라미터 구성 (페이지당 항목 수 적용)
      const limit = itemsPerPage; // 사용자가 선택한 페이지당 항목 수
      const offset = (page - 1) * limit;

      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
        status: 'active'
      });

      // 필터 적용
      if (searchFilters.keyword && searchFilters.keyword.trim() !== '') {
        params.append('keyword', searchFilters.keyword.trim());
      }

      if (searchFilters.area && searchFilters.area !== '전체') {
        params.append('region', encodeURIComponent(searchFilters.area));
      }

      // 업종 필터링은 키워드 검색에 포함 (간단한 매핑)
      if (searchFilters.industry && searchFilters.industry !== '전체') {
        const industryKeyword = searchFilters.industry === '제조업' ? '제조' :
                               searchFilters.industry === '소매업(자동차 제외)' ? '소매' :
                               searchFilters.industry === '음식점업' ? '음식' :
                               searchFilters.industry === '정보통신업' ? '정보통신' :
                               searchFilters.industry === '건설업' ? '건설' : '';

        if (industryKeyword) {
          const currentKeyword = params.get('keyword') || '';
          const combinedKeyword = currentKeyword ? `${currentKeyword} ${industryKeyword}` : industryKeyword;
          params.set('keyword', combinedKeyword);
        }
      }

      console.log('🔍 API 요청 파라미터:', Object.fromEntries(params.entries()));

      const response = await fetch(`/api/government-supports?${params.toString()}`);
      const result = await response.json();

      if (result.success && result.data) {
        const items = result.data;

        setSubventions(items);
        setTotalCount(result.total || items.length);
        setCurrentPage(page);

        console.log('✅ fetchSubventions 완료:', {
          총결과수: items.length,
          전체갯수: result.total,
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

  // 검색 실행 (항상 데이터베이스 조회)
  const handleSearch = () => {
    updateUrlParams({
      page: 1,
      industry: searchFilters.industry,
      area: searchFilters.area,
      keyword: searchFilters.keyword
    });
    fetchSubventions(1);
    // 페이지 상단으로 스크롤
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };



  // 페이지 변경
  const handlePageChange = (pageNo: number) => {
    updateUrlParams({ page: pageNo });
    fetchSubventions(pageNo);
  };

  // 페이지당 항목 수 변경
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
    updateUrlParams({ page: 1, limit: newItemsPerPage });
    // 페이지 상단으로 스크롤
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // URL 매개변수에서 상태 초기화 (한 번만 실행)
  useEffect(() => {
    if (!isInitialized.current) {
      const pageFromUrl = parseInt(searchParams.get('page') || '1');
      const limitFromUrl = parseInt(searchParams.get('limit') || '30');
      const industryFromUrl = searchParams.get('industry') || '전체';
      const areaFromUrl = searchParams.get('area') || '전체';
      const keywordFromUrl = searchParams.get('keyword') || '';

      console.log('🔧 URL에서 상태 초기화:', {
        pageFromUrl,
        limitFromUrl,
        industryFromUrl,
        areaFromUrl,
        keywordFromUrl
      });

      // 초기화 중임을 표시
      isInitializing.current = true;

      setCurrentPage(pageFromUrl);
      setItemsPerPage(limitFromUrl);
      setSearchFilters({
        industry: industryFromUrl,
        area: areaFromUrl,
        keyword: keywordFromUrl
      });

      isInitialized.current = true;
      fetchSubventions(pageFromUrl);

      // 초기화 완료 후 플래그 해제
      setTimeout(() => {
        isInitializing.current = false;
        console.log('🔄 초기화 완료 - 검색 필터 useEffect 활성화');
      }, 100);
    }
  }, [searchParams]);

  // 컴포넌트 마운트 시 기본 데이터 로드 - 제거됨 (위의 useEffect에서 처리)
  // useEffect(() => {
  //   fetchSubventions(currentPage);
  // }, []);

  // 검색 필터 변경 시 처리 (디바운싱 적용) - 첫 렌더링 및 초기화 중 제외
  useEffect(() => {
    if (isFirstRender.current) {
      console.log('🚫 검색 필터 useEffect: 첫 렌더링이므로 건너뜀');
      isFirstRender.current = false;
      return;
    }

    if (isInitializing.current) {
      console.log('🚫 검색 필터 useEffect: URL 초기화 중이므로 건너뜀');
      return;
    }

    console.log('🔍 검색 필터 변경 감지:', searchFilters);

    // 디바운싱: 300ms 후에 검색 실행
    const timeoutId = setTimeout(() => {
      console.log('⏰ 디바운싱 타임아웃 실행 - fetchSubventions(1) 호출');
      fetchSubventions(1);
    }, 300);

    // 클린업: 다음 타이핑이 들어오면 이전 타이머 취소
    return () => {
      clearTimeout(timeoutId);
    };
  }, [searchFilters]);

  // 페이지당 항목 수 변경 시 데이터 다시 불러오기
  useEffect(() => {
    console.log('📏 itemsPerPage useEffect 트리거:', { itemsPerPage, currentPage, isInitializing: isInitializing.current });

    // 초기화 중이면 실행하지 않음
    if (isInitializing.current) {
      console.log('🚫 itemsPerPage useEffect: 초기화 중이므로 건너뜀');
      return;
    }

    if (currentPage === 1) {
      console.log('📏 itemsPerPage 변경으로 fetchSubventions(1) 호출');
      fetchSubventions(1);
    }
  }, [itemsPerPage]);

  // 사용자가 로그인된 경우 관심 목록 가져오기
  useEffect(() => {
    if (user?.id) {
      fetchUserFavorites();
    }
  }, [user?.id]);

  // 페이지 변경 시 스크롤 (데이터 로딩 완료 후)
  useEffect(() => {
    console.log('스크롤 체크:', { loading, subventionsLength: subventions.length, currentPage });
    if (!loading && subventions.length > 0 && currentPage > 1) {
      console.log('페이지 상단으로 스크롤 실행');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage, loading, subventions]);

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
          {/* 모바일: 업종과 지역 한 줄, 키워드 다음 줄 */}
          <div className="sm:hidden space-y-4 mb-4">
            {/* 업종과 지역 (한 줄에 배치) */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  업종
                </label>
                <select
                  value={searchFilters.industry}
                  onChange={(e) => setSearchFilters(prev => ({ ...prev, industry: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm"
                >
                  {areaOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 키워드 검색과 페이지당 항목 수 */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  키워드
                </label>
                <input
                  type="text"
                  value={searchFilters.keyword}
                  onChange={(e) => setSearchFilters(prev => ({ ...prev, keyword: e.target.value }))}
                  placeholder="사업명으로 검색"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  표시 개수
                </label>
                <select
                  value={itemsPerPage}
                  onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm"
                >
                  <option value={10}>10개씩</option>
                  <option value={30}>30개씩</option>
                  <option value={100}>100개씩</option>
                </select>
              </div>
            </div>
          </div>

          {/* 데스크톱: 4열 레이아웃 */}
          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                업종
              </label>
              <select
                value={searchFilters.industry}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, industry: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                표시 개수
              </label>
              <select
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              >
                <option value={10}>10개씩</option>
                <option value={30}>30개씩</option>
                <option value={100}>100개씩</option>
              </select>
            </div>
          </div>

          {/* 상태 정보 */}
          <div className="mb-4">
            <div className="text-sm text-gray-600 text-center sm:text-left">
              {loading ? "데이터 조회 중..." :
                `총 ${totalCount}개의 지원사업 중 ${subventions.length}개 표시 (${currentPage}페이지)`
              }
            </div>
          </div>

          {/* 액션 버튼들 - 모바일 최적화 */}
          <div className="grid grid-cols-2 sm:flex sm:justify-end gap-2 sm:gap-2 mb-6">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-3 py-2 sm:px-4 bg-brand text-white rounded-md hover:bg-brand-700 disabled:bg-brand-400 disabled:cursor-not-allowed text-sm font-medium"
            >
              <span className="block sm:hidden">🔍 빠른검색</span>
              <span className="hidden sm:block">
                {loading ? "검색 중..." : "빠른 검색"}
              </span>
            </button>


          </div>
        </div>


        {/* 오류 메시지 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="text-red-600">⚠️ {error}</div>
          </div>
        )}

        {/* 지원사업 목록 */}
        <div className="space-y-6">
          {loading && subventions.length === 0 ? (
            // 로딩 중이고 데이터가 없을 때 스켈레톤 UI
            <div className="space-y-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow-sm animate-pulse">
                  <div className="h-6 bg-gray-200 rounded mb-4 w-3/4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                  <div className="mt-4 flex gap-3">
                    <div className="h-8 bg-gray-200 rounded w-20"></div>
                    <div className="h-8 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : subventions.length === 0 && !loading ? (
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
            subventions.map((item, index) => (
              <div key={`${item.subventionId}-${index}`} className={loading ? 'opacity-70 pointer-events-none' : ''}>
                <SupportCard
                  title={item.지원사업명}
                  hostInstitution={item.접수기관}
                  supportMethod={item["지원 방식"]}
                  supportAmount={item.지원금액}
                  applicationDeadline={item["접수 마감일"]}
                  source={item.출처}
                  region={item.지역}
                  interestRate={item.금리}
                  applicationMethod={item["접수 방법"]}
                  announcementUrl={item["공고 URL"]}
                  attachments={item.첨부파일목록}
                  subventionId={item.subventionId}
                  favoriteLoading={favoriteLoading}
                  showBookmarkButton={true}
                  isBookmarked={favorites.has(item.subventionId)}
                  onBookmark={() => handleFavoriteToggle(item)}
                  variant="dashboard"
                />
              </div>
            ))
          )}
        </div>

        {/* 페이지네이션 */}
        {totalCount > 0 && (
          <div className="mt-8 flex justify-center">
            <div className="bg-white px-6 py-3 rounded-lg shadow-sm">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  {currentPage} 페이지 / 총 {Math.ceil(totalCount / itemsPerPage)} 페이지
                  <span className="text-brand ml-2">
                    (총 {totalCount}개, {itemsPerPage}개씩 표시)
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
                    disabled={currentPage >= Math.ceil(totalCount / itemsPerPage) || loading}
                    className="px-3 py-1 text-sm bg-brand text-white rounded hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
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