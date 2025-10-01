"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

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

// 로드맵 미션 타입
interface RoadmapMission {
  id: string;
  title: string;
  description: string;
  status: 'locked' | 'available' | 'in_progress' | 'completed';
  points: number;
  requiredFiles: string[];
  completedAt?: string;
  uploadedFiles?: string[];
}

export default function MyPage() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [roadmapMissions, setRoadmapMissions] = useState<RoadmapMission[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [activeTab, setActiveTab] = useState<'profile' | 'history' | 'bookmarks' | 'roadmap'>('profile');
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedMission, setSelectedMission] = useState<RoadmapMission | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<FileList | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

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

      // 로드맵 미션 데이터 설정
      setRoadmapMissions([
        {
          id: "mission_01",
          title: "기업 설립",
          description: "사업자등록증을 업로드하여 기업 설립을 인증하세요",
          status: "completed",
          points: 100,
          requiredFiles: ["사업자등록증"],
          completedAt: "2024-01-15",
          uploadedFiles: ["business_registration.pdf"]
        },
        {
          id: "mission_02",
          title: "연구소 설립",
          description: "기업부설연구소 설립 신고서를 업로드하세요",
          status: "available",
          points: 150,
          requiredFiles: ["연구소설립신고서", "연구소현황신고서"]
        },
        {
          id: "mission_03",
          title: "특허 등록",
          description: "특허증 또는 실용신안증을 업로드하세요",
          status: "available",
          points: 200,
          requiredFiles: ["특허증", "실용신안증"]
        },
        {
          id: "mission_04",
          title: "정책자금 실행",
          description: "정책자금 대출 승인서를 업로드하세요",
          status: "available",
          points: 120,
          requiredFiles: ["대출승인서", "자금지원확인서"]
        },
        {
          id: "mission_05",
          title: "고용 증대",
          description: "고용보험 가입자 명부를 업로드하세요 (5명 이상)",
          status: "available",
          points: 100,
          requiredFiles: ["고용보험가입자명부", "4대보험가입확인서"]
        },
        {
          id: "mission_06",
          title: "벤처기업인증",
          description: "벤처기업 확인서를 업로드하세요",
          status: "available",
          points: 300,
          requiredFiles: ["벤처기업확인서"]
        },
        {
          id: "mission_07",
          title: "초기창업패키지",
          description: "초기창업패키지 선정 확인서를 업로드하세요",
          status: "available",
          points: 400,
          requiredFiles: ["창업패키지선정확인서", "사업계획서"]
        },
        {
          id: "mission_08",
          title: "ISO 인증",
          description: "ISO 9001 또는 ISO 14001 인증서를 업로드하세요",
          status: "available",
          points: 250,
          requiredFiles: ["ISO인증서"]
        },
        {
          id: "mission_09",
          title: "이노비즈/메인비즈 인증",
          description: "이노비즈 또는 메인비즈 인증서를 업로드하세요",
          status: "available",
          points: 200,
          requiredFiles: ["이노비즈인증서", "메인비즈인증서"]
        },
        {
          id: "mission_10",
          title: "Scale Up",
          description: "창업도약패키지 선정 확인서를 업로드하세요",
          status: "available",
          points: 500,
          requiredFiles: ["창업도약패키지선정확인서", "사업실적보고서"]
        }
      ]);

      // 완료된 미션의 포인트 합계 계산
      setTotalPoints(100); // 첫 번째 미션 완료 포인트

      setLoading(false);
    }, 1000);
  }, []);

  // 파일 검증 함수
  const validateFiles = (files: FileList): string | null => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // 파일 크기 검증
      if (file.size > maxSize) {
        return `${file.name}이(가) 10MB를 초과합니다.`;
      }

      // 파일 타입 검증
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!allowedTypes.includes(fileExtension || '')) {
        return `${file.name}은(는) 지원되지 않는 파일 형식입니다.`;
      }
    }

    return null;
  };

  // 드래그 앤 드롭 핸들러
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    setUploadError(null);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const error = validateFiles(files);
      if (error) {
        setUploadError(error);
        return;
      }
      setUploadedFiles(files);
    }
  };

  // 파일 선택 핸들러
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const files = e.target.files;
    if (files && files.length > 0) {
      const error = validateFiles(files);
      if (error) {
        setUploadError(error);
        return;
      }
      setUploadedFiles(files);
    }
  };

  // 파일 업로드 함수
  const handleFileUpload = (missionId: string, files: FileList) => {
    if (!files || files.length === 0) return;

    // 파일 업로드 시뮬레이션
    const fileNames = Array.from(files).map(file => file.name);

    setRoadmapMissions(prev => prev.map(mission => {
      if (mission.id === missionId) {
        return {
          ...mission,
          status: 'completed' as const,
          uploadedFiles: fileNames,
          completedAt: new Date().toISOString().split('T')[0]
        };
      }
      return mission;
    }));

    // 포인트 추가
    const mission = roadmapMissions.find(m => m.id === missionId);
    if (mission) {
      setTotalPoints(prev => prev + mission.points);
    }


    setUploadModalOpen(false);
    setSelectedMission(null);
    setUploadedFiles(null);
    setUploadError(null);
    setIsDragOver(false);
  };

  // 미션 시작하기
  const handleStartMission = (mission: RoadmapMission) => {
    setSelectedMission(mission);
    setUploadModalOpen(true);
  };

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
                                키워드: "{history.keyword}"
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

            {/* 로드맵 탭 */}
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
                            {roadmapMissions.filter(m => m.status === 'completed').length}
                          </div>
                          <div className="text-xs text-yellow-800">완료</div>
                        </div>
                        <div className="text-center px-3 py-2 bg-blue-50 rounded-lg border border-blue-200 w-20">
                          <div className="text-lg font-bold text-blue-600">
                            {roadmapMissions.filter(m => m.status === 'available').length}
                          </div>
                          <div className="text-xs text-blue-800">진행 가능</div>
                        </div>
                        <div className="text-center px-3 py-2 bg-orange-50 rounded-lg border border-orange-200 w-20">
                          <div className="text-lg font-bold text-orange-600">
                            {roadmapMissions.filter(m => m.status === 'in_progress').length}
                          </div>
                          <div className="text-xs text-orange-800">진행 중</div>
                        </div>
                        <div className="text-center px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 w-20">
                          <div className="text-lg font-bold text-gray-600">
                            {roadmapMissions.filter(m => m.status === 'locked').length}
                          </div>
                          <div className="text-xs text-gray-800">잠김</div>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">{totalPoints}</div>
                      <div className="text-sm text-gray-600">총 포인트</div>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {/* 슬라이드 로드맵 */}
                  <div className="relative">
                    {/* 네비게이션 버튼 */}
                    <div className="flex justify-between items-center mb-6">
                      <button
                        onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                        disabled={currentSlide === 0}
                        className={`p-2 rounded-full ${
                          currentSlide === 0
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>

                      {/* 진행도 표시 */}
                      <div className="flex space-x-2">
                        {Array.from({ length: Math.ceil(roadmapMissions.length / 3) }, (_, index) => (
                          <div
                            key={index}
                            className={`w-3 h-3 rounded-full ${
                              index === currentSlide ? 'bg-blue-600' : 'bg-gray-300'
                            }`}
                          />
                        ))}
                      </div>

                      <button
                        onClick={() => setCurrentSlide(Math.min(Math.ceil(roadmapMissions.length / 3) - 1, currentSlide + 1))}
                        disabled={currentSlide >= Math.ceil(roadmapMissions.length / 3) - 1}
                        className={`p-2 rounded-full ${
                          currentSlide >= Math.ceil(roadmapMissions.length / 3) - 1
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>

                    {/* 슬라이드 컨테이너 */}
                    <div className="overflow-hidden">
                      <div
                        className="flex transition-transform duration-500 ease-in-out"
                        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                      >
                        {Array.from({ length: Math.ceil(roadmapMissions.length / 3) }, (_, slideIndex) => (
                          <div key={slideIndex} className="w-full flex-shrink-0">
                            <div className="relative">
                              {/* 연결선 */}
                              <div className="absolute top-6 left-16 right-16 h-0.5 bg-gray-300"></div>

                              {/* 미션들 (3개씩) */}
                              <div className="grid grid-cols-3 gap-8 px-8">
                                {roadmapMissions.slice(slideIndex * 3, slideIndex * 3 + 3).map((mission) => (
                                  <div key={mission.id} className="relative">
                                    {/* 다이아몬드 아이콘 */}
                                    <div className="flex justify-center mb-4">
                                      <div className={`w-16 h-16 transform rotate-45 flex items-center justify-center relative ${
                                        mission.status === 'completed'
                                          ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-lg'
                                          : mission.status === 'available'
                                          ? 'bg-gradient-to-br from-blue-400 to-blue-600 shadow-md animate-pulse'
                                          : mission.status === 'in_progress'
                                          ? 'bg-gradient-to-br from-orange-400 to-orange-600 shadow-md'
                                          : 'bg-gray-300'
                                      }`}>
                                        <div className="transform -rotate-45">
                                          {mission.status === 'completed' && (
                                            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                          )}
                                          {mission.status === 'available' && (
                                            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                            </svg>
                                          )}
                                          {mission.status === 'in_progress' && (
                                            <svg className="w-8 h-8 text-white animate-spin" fill="currentColor" viewBox="0 0 20 20">
                                              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                                            </svg>
                                          )}
                                          {mission.status === 'locked' && (
                                            <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                            </svg>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    {/* 미션 정보 */}
                                    <div className={`p-4 rounded-lg border-2 h-40 flex flex-col justify-between ${
                                      mission.status === 'completed'
                                        ? 'border-yellow-300 bg-yellow-50'
                                        : mission.status === 'available'
                                        ? 'border-blue-300 bg-blue-50'
                                        : mission.status === 'in_progress'
                                        ? 'border-orange-300 bg-orange-50'
                                        : 'border-gray-200 bg-gray-50'
                                    }`}>
                                      <div className="flex-grow">
                                        <h4 className={`font-semibold text-lg mb-3 text-center ${
                                          mission.status === 'locked' ? 'text-gray-500' : 'text-gray-900'
                                        }`}>
                                          {mission.title}
                                        </h4>
                                        <p className={`text-sm text-center ${
                                          mission.status === 'locked' ? 'text-gray-400' : 'text-gray-600'
                                        }`}>
                                          {mission.description}
                                        </p>
                                      </div>
                                      <div className="flex items-center justify-between mt-4">
                                        <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                                          mission.status === 'completed'
                                            ? 'bg-yellow-200 text-yellow-800'
                                            : mission.status === 'available'
                                            ? 'bg-blue-200 text-blue-800'
                                            : mission.status === 'in_progress'
                                            ? 'bg-orange-200 text-orange-800'
                                            : 'bg-gray-200 text-gray-600'
                                        }`}>
                                          {mission.points}P
                                        </span>
                                        {mission.status === 'available' && (
                                          <button
                                            onClick={() => handleStartMission(mission)}
                                            className="text-sm bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                                          >
                                            시작
                                          </button>
                                        )}
                                        {mission.status === 'completed' && (
                                          <span className="text-sm text-yellow-600 font-medium">✓ 완료</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 파일 업로드 모달 */}
      {uploadModalOpen && selectedMission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">미션: {selectedMission.title}</h3>
              <button
                onClick={() => {
                  setUploadModalOpen(false);
                  setSelectedMission(null);
                  setUploadedFiles(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-3">{selectedMission.description}</p>
              <div className="mb-3">
                <h4 className="text-sm font-medium text-gray-700 mb-2">필요한 파일:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {selectedMission.requiredFiles.map((file, index) => (
                    <li key={index} className="flex items-center">
                      <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                      {file}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 파일 업로드 영역 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                파일 업로드
              </label>
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
                  isDragOver
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-400'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center">
                    <svg className={`w-12 h-12 mb-3 transition-colors ${
                      isDragOver ? 'text-blue-500' : 'text-gray-400'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium text-blue-600">클릭하여 파일 선택</span> 또는 드래그하여 업로드
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PDF, JPG, PNG, DOC, DOCX (최대 10MB)
                    </p>
                  </div>
                </label>
              </div>

              {/* 에러 메시지 */}
              {uploadError && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-red-600">{uploadError}</span>
                  </div>
                </div>
              )}

              {/* 선택된 파일 목록 */}
              {uploadedFiles && uploadedFiles.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">선택된 파일:</h4>
                  <ul className="space-y-2">
                    {Array.from(uploadedFiles).map((file, index) => (
                      <li key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm">
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-gray-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                          </svg>
                          <div>
                            <div className="text-gray-700 font-medium">{file.name}</div>
                            <div className="text-gray-500 text-xs">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* 버튼 */}
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setUploadModalOpen(false);
                  setSelectedMission(null);
                  setUploadedFiles(null);
                  setUploadError(null);
                  setIsDragOver(false);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => {
                  if (uploadedFiles && selectedMission) {
                    handleFileUpload(selectedMission.id, uploadedFiles);
                  }
                }}
                disabled={!uploadedFiles || uploadedFiles.length === 0}
                className={`flex-1 px-4 py-2 rounded transition-colors ${
                  uploadedFiles && uploadedFiles.length > 0
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                업로드 완료 (+{selectedMission.points}P)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}