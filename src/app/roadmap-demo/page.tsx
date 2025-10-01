'use client';

import React from 'react';
import { useRoadmap } from '@/hooks/useRoadmap';
import { RoadmapSlider } from '@/components/RoadmapSlider';

export default function RoadmapDemo() {
  const {
    missions,
    totalPoints,
    loading,
    error,
    completeMission
  } = useRoadmap();

  const handleMissionComplete = async (missionId: string, files: FileList) => {
    const filesArray = Array.from(files);
    const success = await completeMission(missionId, filesArray);

    if (success) {
      // 성공 메시지나 추가 로직
      console.log('미션 완료!');
    }
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-600">{error}</p>
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
            <h1 className="text-2xl font-bold text-gray-900">
              로드맵 API 데모
            </h1>
            <div className="text-sm text-gray-600">
              <span className="font-medium">총 포인트:</span> {totalPoints.toLocaleString()}P
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 설명 */}
        <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">
            🚀 재사용 가능한 로드맵 시스템
          </h2>
          <p className="text-blue-700 mb-4">
            이 페이지는 로드맵 시스템이 다른 페이지에서도 쉽게 사용될 수 있음을 보여주는 데모입니다.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white p-3 rounded border">
              <span className="font-medium">📡 API:</span> /api/roadmap
            </div>
            <div className="bg-white p-3 rounded border">
              <span className="font-medium">🎣 Hook:</span> useRoadmap()
            </div>
            <div className="bg-white p-3 rounded border">
              <span className="font-medium">🧩 Component:</span> RoadmapSlider
            </div>
          </div>
        </div>

        {/* 로드맵 */}
        <RoadmapSlider
          missions={missions}
          totalPoints={totalPoints}
          onMissionComplete={handleMissionComplete}
          className="mb-8"
        />

        {/* 코드 예시 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            💻 사용 방법
          </h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">1. 훅 사용:</h4>
              <div className="bg-gray-900 text-gray-100 p-4 rounded text-sm overflow-x-auto">
                <pre>{`import { useRoadmap } from '@/hooks/useRoadmap';

const { missions, totalPoints, completeMission } = useRoadmap();`}</pre>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">2. 컴포넌트 사용:</h4>
              <div className="bg-gray-900 text-gray-100 p-4 rounded text-sm overflow-x-auto">
                <pre>{`import { RoadmapSlider } from '@/components/RoadmapSlider';

<RoadmapSlider
  missions={missions}
  totalPoints={totalPoints}
  onMissionComplete={handleMissionComplete}
/>`}</pre>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">3. API 직접 호출:</h4>
              <div className="bg-gray-900 text-gray-100 p-4 rounded text-sm overflow-x-auto">
                <pre>{`// 모든 미션 조회
GET /api/roadmap

// 미션 완료
POST /api/roadmap
{
  "missionId": "mission_01",
  "uploadedFiles": [...]
}`}</pre>
              </div>
            </div>
          </div>
        </div>

        {/* 통계 */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
            <div className="text-2xl font-bold text-blue-600">{missions.length}</div>
            <div className="text-sm text-gray-600">총 미션</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
            <div className="text-2xl font-bold text-green-600">
              {missions.filter(m => m.status === 'completed').length}
            </div>
            <div className="text-sm text-gray-600">완료된 미션</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {missions.filter(m => m.status === 'available').length}
            </div>
            <div className="text-sm text-gray-600">진행 가능</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
            <div className="text-2xl font-bold text-purple-600">{totalPoints.toLocaleString()}</div>
            <div className="text-sm text-gray-600">총 포인트</div>
          </div>
        </div>
      </main>
    </div>
  );
}