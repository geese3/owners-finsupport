"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRoadmap } from '@/hooks/useRoadmap';
import { RoadmapSlider } from '@/components/RoadmapSlider';
import { useProcurementRoadmap } from '@/hooks/useProcurementRoadmap';
import { ProcurementRoadmapSlider } from '@/components/ProcurementRoadmapSlider';
import { useInvestmentRoadmap } from '@/hooks/useInvestmentRoadmap';
import { InvestmentRoadmapSlider } from '@/components/InvestmentRoadmapSlider';
import { useRecommendations } from '@/hooks/useRecommendations';
import { EnhancedProfileForm } from '@/components/EnhancedProfileForm';

// 사용자 정보 타입
interface UserInfo {
  id: string;
  name: string;
  email: string;
  company: string;
  businessType: '개인사업자' | '법인';
  businessNumber: string;
  corporateNumber?: string; // 법인등록번호 (법인인 경우만)
  industry: string;
  region: string;
  joinDate: string;
  planType: string;
}

// 검색 기록 타입
interface SearchHistory {
  id: string;
  keyword: string;
  industry: string;
  area: string;
  resultCount: number;
  searchDate: string;
}

// 즐겨찾기 타입
interface BookmarkItem {
  id: string;
  subventionId: string;
  title: string;
  institution: string;
  deadline: string;
  amount: string;
  bookmarkedAt: string;
}

export default function MyPage() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [activeTab, setActiveTab] = useState<'profile' | 'history' | 'bookmarks' | 'roadmap' | 'recommendations'>('profile');
  const [loading, setLoading] = useState(true);
  const [showEnhancedProfileForm, setShowEnhancedProfileForm] = useState(false);
  const [hasEnhancedProfile, setHasEnhancedProfile] = useState(false);

  // 로드맵 훅 사용
  const {
    missions,
    totalPoints,
    loading: roadmapLoading,
    error: roadmapError,
    completeMission
  } = useRoadmap();

  // 공공조달 로드맵 훅 사용
  const {
    missions: procurementMissions,
    totalPoints: procurementTotalPoints,
    loading: procurementLoading,
    error: procurementError,
    completeMission: completeProcurementMission
  } = useProcurementRoadmap();

  // 투자 로드맵 훅 사용
  const {
    missions: investmentMissions,
    totalPoints: investmentTotalPoints,
    loading: investmentLoading,
    error: investmentError,
    completeMission: completeInvestmentMission
  } = useInvestmentRoadmap();

  // 맞춤형 추천 훅 사용
  const {
    recommendations,
    stats: recommendationStats,
    loading: recommendationsLoading,
    error: recommendationsError,
    filters,
    setFilters,
    bookmarkSubvention,
    // unbookmarkSubvention - not used
  } = useRecommendations(userInfo?.industry, userInfo?.region, hasEnhancedProfile);

  // 미션 완료 핸들러
  const handleMissionComplete = async (missionId: string, files: FileList) => {
    const filesArray = Array.from(files);
    const success = await completeMission(missionId, filesArray);

    if (success) {
      // 성공 메시지 표시 (실제로는 toast 등 사용)
      console.log('미션 완료!');
    }
  };

  // 공공조달 미션 완료 핸들러
  const handleProcurementMissionComplete = async (missionId: string, files: FileList) => {
    const filesArray = Array.from(files);
    const success = await completeProcurementMission(missionId, filesArray);

    if (success) {
      // 성공 메시지 표시 (실제로는 toast 등 사용)
      console.log('공공조달 미션 완료!');
    }
  };

  // 투자 미션 완료 핸들러
  const handleInvestmentMissionComplete = async (missionId: string, files: FileList) => {
    const filesArray = Array.from(files);
    const success = await completeInvestmentMission(missionId, filesArray);

    if (success) {
      // 성공 메시지 표시 (실제로는 toast 등 사용)
      console.log('투자 미션 완료!');
    }
  };

  // 향상된 프로필 저장 핸들러
  const handleEnhancedProfileSubmit = async (profileData: Record<string, any>) => {
    try {
      // API 호출하여 프로필 데이터 저장
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'save_enhanced_profile',
          profileData
        })
      });

      const result = await response.json();

      if (result.success) {
        // 프로필 저장 성공 처리
        setHasEnhancedProfile(true);
        setShowEnhancedProfileForm(false);

        // 성공 메시지 표시
        alert('추가 정보가 저장되었습니다! 이제 더 정확한 맞춤형 추천을 받으실 수 있습니다.');

        // 추천 데이터 새로고침 (useRecommendations 훅이 자동으로 처리)
      } else {
        throw new Error(result.error || '프로필 저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('프로필 저장 오류:', error);
      alert('정보 저장 중 오류가 발생했습니다. 다시 시도해 주세요.');
    }
  };

  // 가상의 사용자 데이터 (실제로는 API에서 가져와야 함)
  useEffect(() => {
    // 가상 데이터 로드
    setTimeout(() => {
      setUserInfo({
        id: "user001",
        name: "홍길동",
        email: "hong@example.com",
        company: "(주)예시기업",
        businessType: "법인",
        businessNumber: "123-45-67890",
        corporateNumber: "110111-1234567",
        industry: "제조업",
        region: "서울특별시",
        joinDate: "2024-01-15",
        planType: "스탠다드"
      });

      setSearchHistory([
        {
          id: "search001",
          keyword: "미래차",
          industry: "제조업",
          area: "전체",
          resultCount: 15,
          searchDate: "2025-01-10"
        },
        {
          id: "search002",
          keyword: "스마트팩토리",
          industry: "제조업",
          area: "서울특별시",
          resultCount: 23,
          searchDate: "2025-01-09"
        },
        {
          id: "search003",
          keyword: "디지털전환",
          industry: "정보통신업",
          area: "전체",
          resultCount: 31,
          searchDate: "2025-01-08"
        }
      ]);

      setBookmarks([
        {
          id: "bookmark001",
          subventionId: "sub001",
          title: "2025년 스마트공장 구축 지원사업",
          institution: "중소벤처기업부",
          deadline: "2025-03-31",
          amount: "최대 1억원",
          bookmarkedAt: "2025-01-10"
        },
        {
          id: "bookmark002",
          subventionId: "sub002",
          title: "미래차 부품기업 육성 프로그램",
          institution: "산업통상자원부",
          deadline: "2025-02-28",
          amount: "최대 5천만원",
          bookmarkedAt: "2025-01-09"
        }
      ]);

      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link href="/">
                <Image
                  src="/owners-logo.png"
                  alt="오너스경영연구소"
                  width={300}
                  height={90}
                  className="h-20 w-auto"
                />
              </Link>
            </div>
            <nav className="flex space-x-4">
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                지원사업
              </Link>
              <Link
                href="/procurement"
                className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                공공조달
              </Link>
              <Link
                href="/mypage"
                className="text-blue-600 bg-blue-50 px-3 py-2 rounded-md text-sm font-medium"
              >
                마이페이지
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 사이드바 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{userInfo?.name}</h3>
                <p className="text-sm text-gray-600">{userInfo?.company}</p>
                <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  {userInfo?.planType} 플랜
                </span>
              </div>

              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'profile'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  프로필 정보
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'history'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  검색 기록
                </button>
                <button
                  onClick={() => setActiveTab('bookmarks')}
                  className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'bookmarks'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  즐겨찾기
                </button>
                <button
                  onClick={() => setActiveTab('recommendations')}
                  className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'recommendations'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  맞춤형 지원사업
                </button>
                <button
                  onClick={() => setActiveTab('roadmap')}
                  className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'roadmap'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  로드맵
                </button>
              </nav>
            </div>
          </div>

          {/* 메인 콘텐츠 */}
          <div className="lg:col-span-3">
            {/* 프로필 정보 탭 */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">프로필 정보</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">이름</label>
                      <p className="text-lg text-gray-900">{userInfo?.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">이메일</label>
                      <p className="text-lg text-gray-900">{userInfo?.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">회사명</label>
                      <p className="text-lg text-gray-900">{userInfo?.company}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">기업형태</label>
                      <p className="text-lg text-gray-900">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          userInfo?.businessType === '법인'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {userInfo?.businessType}
                        </span>
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">사업자등록번호</label>
                      <p className="text-lg text-gray-900">{userInfo?.businessNumber}</p>
                    </div>
                    {userInfo?.businessType === '법인' && userInfo?.corporateNumber && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">법인등록번호</label>
                        <p className="text-lg text-gray-900">{userInfo?.corporateNumber}</p>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">업종</label>
                      <p className="text-lg text-gray-900">{userInfo?.industry}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">지역</label>
                      <p className="text-lg text-gray-900">{userInfo?.region}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">가입일</label>
                      <p className="text-lg text-gray-900">{userInfo?.joinDate}</p>
                    </div>
                  </div>
                  <div className="mt-8">
                    <button className="bg-blue-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
                      프로필 수정
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 검색 기록 탭 */}
            {activeTab === 'history' && (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">검색 기록</h2>
                </div>
                <div className="p-6">
                  {searchHistory.length === 0 ? (
                    <div className="text-center py-12">
                      <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <p className="text-gray-500">검색 기록이 없습니다.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {searchHistory.map((history) => (
                        <div key={history.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="text-lg font-medium text-gray-900 mb-2">
                                키워드: &quot;{history.keyword}&quot;
                              </h3>
                              <div className="text-sm text-gray-600 space-y-1">
                                <p>업종: {history.industry}</p>
                                <p>지역: {history.area}</p>
                                <p>검색 결과: {history.resultCount}건</p>
                              </div>
                            </div>
                            <div className="text-sm text-gray-500">
                              {history.searchDate}
                            </div>
                          </div>
                          <div className="mt-4 flex space-x-2">
                            <Link
                              href={`/dashboard?keyword=${encodeURIComponent(history.keyword)}&industry=${encodeURIComponent(history.industry)}&area=${encodeURIComponent(history.area)}`}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              다시 검색
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 즐겨찾기 탭 */}
            {activeTab === 'bookmarks' && (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">즐겨찾기</h2>
                </div>
                <div className="p-6">
                  {bookmarks.length === 0 ? (
                    <div className="text-center py-12">
                      <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                      <p className="text-gray-500">즐겨찾기한 지원사업이 없습니다.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {bookmarks.map((bookmark) => (
                        <div key={bookmark.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="text-lg font-medium text-gray-900 mb-2">
                                {bookmark.title}
                              </h3>
                              <div className="text-sm text-gray-600 space-y-1">
                                <p>접수기관: {bookmark.institution}</p>
                                <p>지원금액: {bookmark.amount}</p>
                                <p>접수마감: {bookmark.deadline}</p>
                              </div>
                            </div>
                            <div className="text-sm text-gray-500">
                              즐겨찾기: {bookmark.bookmarkedAt}
                            </div>
                          </div>
                          <div className="mt-4 flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                              자세히 보기
                            </button>
                            <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                              즐겨찾기 제거
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 맞춤형 지원사업 탭 */}
            {activeTab === 'recommendations' && (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">나에게 맞는 지원사업</h2>
                      <p className="text-sm text-gray-600 mt-1">
                        업종: <span className="font-medium text-blue-600">{userInfo?.industry}</span> |
                        지역: <span className="font-medium text-blue-600"> {userInfo?.region}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">{recommendationStats.total}건</div>
                      <div className="text-sm text-gray-600">추천 공고</div>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {/* 추가 정보 수집 프롬프트 */}
                  {!hasEnhancedProfile && (
                    <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">더 정확한 맞춤형 추천을 받아보세요!</h3>
                          <p className="text-gray-600 mb-4">
                            현재는 기본 정보(업종, 지역)만으로 추천하고 있습니다.
                            기업의 규모, R&D 역량, 사업 방향성 등 추가 정보를 입력하시면
                            훨씬 더 정확하고 맞춤화된 지원사업을 추천받으실 수 있습니다.
                          </p>
                          <div className="flex space-x-3">
                            <button
                              onClick={() => setShowEnhancedProfileForm(true)}
                              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                            >
                              추가 정보 입력하기
                            </button>
                            <button
                              onClick={() => setHasEnhancedProfile(true)}
                              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                            >
                              나중에
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 향상된 추천 혜택 표시 */}
                  {hasEnhancedProfile && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-green-800 font-medium">향상된 맞춤형 추천이 활성화되었습니다!</span>
                        <span className="text-green-600 text-sm">더 정확한 매칭을 제공합니다.</span>
                      </div>
                    </div>
                  )}

                  {/* 필터 옵션 */}
                  <div className="flex flex-wrap gap-3 mb-6 p-4 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">필터:</span>
                    <button
                      onClick={() => setFilters({ ...filters, status: filters.status === 'active' ? undefined : 'active' })}
                      className={`px-3 py-1 text-xs rounded-full transition-colors ${
                        filters.status === 'active'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      진행 중인 공고만
                    </button>
                    <button
                      onClick={() => setFilters({ ...filters, sortBy: 'deadline' })}
                      className={`px-3 py-1 text-xs rounded-full transition-colors ${
                        filters.sortBy === 'deadline'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      마감임박순
                    </button>
                    <button
                      onClick={() => setFilters({ ...filters, sortBy: 'amount' })}
                      className={`px-3 py-1 text-xs rounded-full transition-colors ${
                        filters.sortBy === 'amount'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      지원금액순
                    </button>
                    <button
                      onClick={() => setFilters({ ...filters, sortBy: 'matching' })}
                      className={`px-3 py-1 text-xs rounded-full transition-colors ${
                        filters.sortBy === 'matching'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      매칭도순
                    </button>
                    {hasEnhancedProfile && (
                      <button
                        onClick={() => setShowEnhancedProfileForm(true)}
                        className="px-3 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full hover:bg-yellow-200 transition-colors"
                      >
                        추가 정보 수정
                      </button>
                    )}
                  </div>

                  {/* 맞춤형 지원사업 목록 */}
                  {recommendationsLoading ? (
                    <div className="text-center py-12">
                      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-gray-600">맞춤형 지원사업을 불러오는 중...</p>
                    </div>
                  ) : recommendationsError ? (
                    <div className="text-center py-12">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-red-600 mb-2">데이터를 불러오는 중 오류가 발생했습니다</p>
                      <p className="text-gray-500 text-sm">{recommendationsError}</p>
                    </div>
                  ) : recommendations.length === 0 ? (
                    <div className="text-center py-12">
                      <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <p className="text-gray-500">현재 조건에 맞는 지원사업이 없습니다.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recommendations.map((recommendation) => (
                        <div key={recommendation.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className={`px-2 py-1 text-xs font-medium rounded ${
                                  recommendation.status === 'active'
                                    ? 'bg-green-100 text-green-800'
                                    : recommendation.status === 'deadline_approaching'
                                    ? 'bg-orange-100 text-orange-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {recommendation.status === 'active' ? '접수중' :
                                   recommendation.status === 'deadline_approaching' ? '마감임박' : '마감'}
                                </span>
                                {recommendation.industry.slice(0, 2).map((industry, index) => (
                                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                                    {industry}
                                  </span>
                                ))}
                                {recommendation.region.slice(0, 1).map((region, index) => (
                                  <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded">
                                    {region}
                                  </span>
                                ))}
                              </div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                {recommendation.title}
                              </h3>
                              <p className="text-gray-600 text-sm mb-3">
                                {recommendation.description}
                              </p>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-500">접수기관:</span>
                                  <p className="font-medium">{recommendation.institution}</p>
                                </div>
                                <div>
                                  <span className="text-gray-500">지원금액:</span>
                                  <p className="font-medium text-green-600">{recommendation.amount}</p>
                                </div>
                                <div>
                                  <span className="text-gray-500">접수마감:</span>
                                  <p className="font-medium text-red-600">{recommendation.deadline}</p>
                                </div>
                                <div>
                                  <span className="text-gray-500">매칭도:</span>
                                  <p className="font-medium text-blue-600">{recommendation.matchingScore}%</p>
                                </div>
                              </div>
                            </div>
                            <div className="ml-4">
                              <button
                                onClick={() => bookmarkSubvention(recommendation.id)}
                                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                              >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                                </svg>
                              </button>
                            </div>
                          </div>
                          <div className="flex space-x-3">
                            <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
                              자세히 보기
                            </button>
                            <button
                              onClick={() => bookmarkSubvention(recommendation.id)}
                              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
                            >
                              북마크
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 더보기 버튼 */}
                  {!recommendationsLoading && !recommendationsError && recommendations.length > 0 && (
                    <div className="text-center mt-8">
                      <button
                        onClick={() => setFilters({ ...filters, limit: undefined })}
                        className="px-6 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                      >
                        전체 지원사업 보기
                      </button>
                      {recommendationStats.total > recommendations.length && (
                        <p className="text-sm text-gray-500 mt-2">
                          총 {recommendationStats.total}건 중 {recommendations.length}건 표시
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 로드맵 탭 - 새로운 모듈화된 컴포넌트 사용 */}
            {activeTab === 'roadmap' && (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-6">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">기업 성장 로드맵</h2>
                        <p className="text-sm text-gray-600 mt-1">미션을 완수하고 포인트를 획득하세요!</p>
                      </div>

                      {/* 진행 상황 요약 - 가로 배치 */}
                      <div className="flex space-x-3">
                        <div className="text-center px-3 py-2 bg-yellow-50 rounded-lg border border-yellow-200 w-20">
                          <div className="text-lg font-bold text-yellow-600">
                            {missions.filter(m => m.status === 'completed').length}
                          </div>
                          <div className="text-xs text-yellow-800">완료</div>
                        </div>
                        <div className="text-center px-3 py-2 bg-blue-50 rounded-lg border border-blue-200 w-20">
                          <div className="text-lg font-bold text-blue-600">
                            {missions.filter(m => m.status === 'available').length}
                          </div>
                          <div className="text-xs text-blue-800">진행 중</div>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">{totalPoints.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">총 포인트</div>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {roadmapLoading ? (
                    <div className="text-center py-8">
                      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-gray-600">로드맵 로딩 중...</p>
                    </div>
                  ) : roadmapError ? (
                    <div className="text-center py-8">
                      <p className="text-red-600">{roadmapError}</p>
                    </div>
                  ) : (
                    <RoadmapSlider
                      missions={missions}
                      totalPoints={totalPoints}
                      onMissionComplete={handleMissionComplete}
                    />
                  )}
                </div>
              </div>
            )}

            {/* 공공조달 로드맵 섹션 추가 */}
            {activeTab === 'roadmap' && (
              <div className="bg-white rounded-lg shadow-sm mt-8">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-6">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">공공조달 로드맵</h2>
                        <p className="text-sm text-gray-600 mt-1">공공조달 진출을 위한 단계별 미션을 완료하세요!</p>
                      </div>

                      {/* 진행 상황 요약 - 가로 배치 */}
                      <div className="flex space-x-3">
                        <div className="text-center px-3 py-2 bg-green-50 rounded-lg border border-green-200 w-20">
                          <div className="text-lg font-bold text-green-600">
                            {procurementMissions.filter(m => m.status === 'completed').length}
                          </div>
                          <div className="text-xs text-green-800">완료</div>
                        </div>
                        <div className="text-center px-3 py-2 bg-blue-50 rounded-lg border border-blue-200 w-20">
                          <div className="text-lg font-bold text-blue-600">
                            {procurementMissions.filter(m => m.status === 'available').length}
                          </div>
                          <div className="text-xs text-blue-800">진행 중</div>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">{procurementTotalPoints.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">총 포인트</div>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {procurementLoading ? (
                    <div className="text-center py-8">
                      <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-gray-600">공공조달 로드맵 로딩 중...</p>
                    </div>
                  ) : procurementError ? (
                    <div className="text-center py-8">
                      <p className="text-red-600">{procurementError}</p>
                    </div>
                  ) : (
                    <ProcurementRoadmapSlider
                      missions={procurementMissions}
                      onMissionComplete={handleProcurementMissionComplete}
                    />
                  )}
                </div>
              </div>
            )}

            {/* 투자 로드맵 섹션 추가 */}
            {activeTab === 'roadmap' && (
              <div className="bg-white rounded-lg shadow-sm mt-8">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-6">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">투자 로드맵</h2>
                        <p className="text-sm text-gray-600 mt-1">스타트업 투자 유치를 위한 단계별 미션을 완료하세요!</p>
                      </div>

                      {/* 진행 상황 요약 - 가로 배치 */}
                      <div className="flex space-x-3">
                        <div className="text-center px-3 py-2 bg-purple-50 rounded-lg border border-purple-200 w-20">
                          <div className="text-lg font-bold text-purple-600">
                            {investmentMissions.filter(m => m.status === 'completed').length}
                          </div>
                          <div className="text-xs text-purple-800">완료</div>
                        </div>
                        <div className="text-center px-3 py-2 bg-indigo-50 rounded-lg border border-indigo-200 w-20">
                          <div className="text-lg font-bold text-indigo-600">
                            {investmentMissions.filter(m => m.status === 'available').length}
                          </div>
                          <div className="text-xs text-indigo-800">진행 중</div>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-purple-600">{investmentTotalPoints.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">총 포인트</div>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {investmentLoading ? (
                    <div className="text-center py-8">
                      <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-gray-600">투자 로드맵 로딩 중...</p>
                    </div>
                  ) : investmentError ? (
                    <div className="text-center py-8">
                      <p className="text-red-600">{investmentError}</p>
                    </div>
                  ) : (
                    <InvestmentRoadmapSlider
                      missions={investmentMissions}
                      onMissionComplete={handleInvestmentMissionComplete}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 향상된 프로필 입력 폼 모달 */}
      {showEnhancedProfileForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <EnhancedProfileForm
              onSubmit={handleEnhancedProfileSubmit}
              onClose={() => setShowEnhancedProfileForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}