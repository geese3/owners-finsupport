"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRoadmap } from '@/hooks/useRoadmap';
import { RoadmapSlider } from '@/components/RoadmapSlider';

// 사용자 정보 타입
interface UserInfo {
  id: string;
  name: string;
  email: string;
  company: string;
  businessType: '개인사업자' | '법인';
  businessNumber: string;
  corporateNumber?: string;
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
  const [activeTab, setActiveTab] = useState<'profile' | 'history' | 'bookmarks' | 'roadmap'>('profile');
  const [loading, setLoading] = useState(true);

  // 로드맵 훅 사용
  const {
    missions,
    totalPoints,
    loading: roadmapLoading,
    error: roadmapError,
    completeMission
  } = useRoadmap();

  // 미션 완료 핸들러
  const handleMissionComplete = async (missionId: string, files: FileList) => {
    const filesArray = Array.from(files);
    const success = await completeMission(missionId, filesArray);

    if (success) {
      // 성공 메시지 표시 (실제로는 toast 등 사용)
      console.log('미션 완료!');
    }
  };

  // 가상의 사용자 데이터 (실제로는 API에서 가져와야 함)
  useEffect(() => {
    // 가상 데이터 로드
    setTimeout(() => {
      setUserInfo({
        id: "user001",
        name: "김도현",
        email: "kim.dohyun@example.com",
        company: "혁신기술(주)",
        businessType: "법인",
        businessNumber: "123-45-67890",
        corporateNumber: "110111-1234567",
        industry: "정보통신업",
        region: "서울특별시",
        joinDate: "2024-01-15",
        planType: "프리미엄"
      });

      setSearchHistory([
        {
          id: "search001",
          keyword: "스타트업 지원",
          industry: "정보통신업",
          area: "서울특별시",
          resultCount: 15,
          searchDate: "2025-01-14"
        },
        {
          id: "search002",
          keyword: "R&D 자금",
          industry: "제조업",
          area: "경기도",
          resultCount: 8,
          searchDate: "2025-01-13"
        }
      ]);

      setBookmarks([
        {
          id: "bookmark001",
          subventionId: "sub001",
          title: "청년창업 지원 프로그램",
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
      {/* 헤더 */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">오너스 핀서포트</span>
            </Link>
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
                className="bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                마이페이지
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">마이페이지</h1>
          <p className="mt-2 text-gray-600">프로필 정보와 활동 내역을 확인하세요</p>
        </div>

        {/* 탭 네비게이션 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'profile', name: '프로필', icon: '👤' },
                { id: 'roadmap', name: '성장 로드맵', icon: '🚀' },
                { id: 'history', name: '검색 기록', icon: '🔍' },
                { id: 'bookmarks', name: '즐겨찾기', icon: '⭐' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* 프로필 탭 */}
            {activeTab === 'profile' && userInfo && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">기본 정보</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">이름</label>
                        <p className="mt-1 text-sm text-gray-900">{userInfo.name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">이메일</label>
                        <p className="mt-1 text-sm text-gray-900">{userInfo.email}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">가입일</label>
                        <p className="mt-1 text-sm text-gray-900">{userInfo.joinDate}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">요금제</label>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                          {userInfo.planType}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">사업체 정보</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">회사명</label>
                        <p className="mt-1 text-sm text-gray-900">{userInfo.company}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">사업자 형태</label>
                        <p className="mt-1 text-sm text-gray-900">{userInfo.businessType}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">사업자등록번호</label>
                        <p className="mt-1 text-sm text-gray-900">{userInfo.businessNumber}</p>
                      </div>
                      {userInfo.businessType === '법인' && userInfo.corporateNumber && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">법인등록번호</label>
                          <p className="mt-1 text-sm text-gray-900">{userInfo.corporateNumber}</p>
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">업종</label>
                        <p className="mt-1 text-sm text-gray-900">{userInfo.industry}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">지역</label>
                        <p className="mt-1 text-sm text-gray-900">{userInfo.region}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 로드맵 탭 */}
            {activeTab === 'roadmap' && (
              <div className="space-y-6">
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
            )}

            {/* 검색 기록 탭 */}
            {activeTab === 'history' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">최근 검색 기록</h3>
                <div className="space-y-3">
                  {searchHistory.map((item) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{item.keyword}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {item.industry} • {item.area} • 결과 {item.resultCount}건
                          </p>
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.searchDate}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 즐겨찾기 탭 */}
            {activeTab === 'bookmarks' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">즐겨찾기한 지원사업</h3>
                <div className="space-y-3">
                  {bookmarks.map((item) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {item.institution} • 마감: {item.deadline}
                          </p>
                          <p className="text-sm text-blue-600 font-medium mt-1">{item.amount}</p>
                        </div>
                        <div className="text-sm text-gray-500">
                          즐겨찾기: {item.bookmarkedAt}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}