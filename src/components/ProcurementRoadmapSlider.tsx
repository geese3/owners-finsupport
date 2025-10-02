'use client';

import React, { useState } from 'react';
import { ProcurementMission } from '@/app/api/procurement-roadmap/route';
import { FileUploadModal } from './FileUploadModal';
import { ConfettiAnimation } from './ConfettiAnimation';

interface ProcurementRoadmapSliderProps {
  missions: ProcurementMission[];
  onMissionComplete?: (missionId: string, files: FileList) => Promise<void>;
  className?: string;
}

export const ProcurementRoadmapSlider: React.FC<ProcurementRoadmapSliderProps> = ({
  missions,
  onMissionComplete,
  className = ''
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedMission, setSelectedMission] = useState<ProcurementMission | null>(null);
  const [showAllMissions, setShowAllMissions] = useState(false);
  const [justCompletedMission, setJustCompletedMission] = useState<string | null>(null);

  const missionsPerSlide = 3;
  const totalSlides = Math.ceil(missions.length / missionsPerSlide);

  // 미션 시작하기
  const handleStartMission = (mission: ProcurementMission) => {
    setSelectedMission(mission);
    setUploadModalOpen(true);
  };

  // 파일 업로드 핸들러
  const handleFileUpload = async (missionId: string, files: FileList) => {
    if (onMissionComplete) {
      await onMissionComplete(missionId, files);
      // 미션 완료 후 폭죽 애니메이션 트리거
      setJustCompletedMission(missionId);

      // 3초 후 애니메이션 상태 초기화
      setTimeout(() => {
        setJustCompletedMission(null);
      }, 3000);
    }
  };

  // 슬라이드 이동 (반응형)
  const goToSlide = (slideIndex: number) => {
    if (typeof window !== 'undefined' && window.innerWidth < 640) {
      // 모바일: 개별 미션 기준
      setCurrentSlide(Math.max(0, Math.min(slideIndex, missions.length - 1)));
    } else {
      // 데스크톱: 3개씩 묶인 슬라이드 기준
      setCurrentSlide(Math.max(0, Math.min(slideIndex, totalSlides - 1)));
    }
  };

  const nextSlide = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 640) {
      // 모바일: 개별 미션으로 이동
      if (currentSlide < missions.length - 1) {
        setCurrentSlide(currentSlide + 1);
      }
    } else {
      // 데스크톱: 슬라이드 단위로 이동
      if (currentSlide < totalSlides - 1) {
        setCurrentSlide(currentSlide + 1);
      }
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  // 미션 카드 컴포넌트
  const MissionCard = ({ mission }: { mission: ProcurementMission }) => (
    <div className="relative">
      {/* 폭죽 애니메이션 */}
      <ConfettiAnimation trigger={justCompletedMission === mission.id} />
      {/* 다이아몬드 아이콘 */}
      <div className="flex justify-center mb-1 overflow-hidden h-20">
        <div className={`w-12 h-12 transform rotate-45 flex items-center justify-center relative ${
          mission.status === 'completed'
            ? 'bg-gradient-to-br from-green-400 to-green-600 shadow-lg'
            : mission.status === 'available'
            ? 'bg-gradient-to-br from-blue-400 to-blue-600 shadow-md animate-pulse'
            : mission.status === 'in_progress'
            ? 'bg-gradient-to-br from-orange-400 to-orange-600 shadow-md'
            : 'bg-gray-300'
        }`}>
          <div className="transform -rotate-45">
            {mission.status === 'completed' && (
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
            {mission.status === 'available' && (
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            )}
            {mission.status === 'in_progress' && (
              <svg className="w-6 h-6 text-white animate-spin" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
            )}
            {mission.status === 'locked' && (
              <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        </div>
      </div>

      {/* 미션 정보 */}
      <div className={`p-4 rounded-lg border-2 h-40 flex flex-col justify-between ${
        mission.status === 'completed'
          ? 'border-green-300 bg-green-50'
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
          <span className={`text-sm font-medium px-3 py-1 rounded-full w-20 text-center ${
            mission.status === 'completed'
              ? 'bg-green-200 text-green-800'
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
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
            >
              시작하기
            </button>
          )}
          {mission.status === 'completed' && (
            <span className="text-green-600 text-sm font-medium">완료됨</span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className={`${className}`}>
      {/* 로드맵 슬라이더 */}
      <div className="relative bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* 슬라이드 네비게이션 */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-4 sm:space-y-0">
          <h3 className="hidden sm:block text-lg font-semibold text-gray-900">공공조달 로드맵</h3>
          <div className="flex items-center justify-center sm:justify-end space-x-2 sm:space-x-4">
            <button
              onClick={() => setShowAllMissions(!showAllMissions)}
              className="hidden sm:block px-3 py-2 sm:px-4 bg-blue-600 text-white text-xs sm:text-sm rounded-md hover:bg-blue-700 transition-colors"
            >
              {showAllMissions ? '슬라이드 보기' : '전체보기'}
            </button>
            {!showAllMissions && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={prevSlide}
                  disabled={currentSlide === 0}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="text-sm text-gray-500 hidden sm:block">
                  {currentSlide + 1} / {totalSlides}
                </span>
                <span className="text-sm text-gray-500 sm:hidden">
                  {currentSlide + 1} / {missions.length}
                </span>
                <button
                  onClick={nextSlide}
                  disabled={
                    typeof window !== 'undefined' && window.innerWidth < 640
                      ? currentSlide === missions.length - 1
                      : currentSlide === totalSlides - 1
                  }
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 미션 표시 */}
        {showAllMissions ? (
          /* 전체보기 모드 */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {missions.map((mission) => (
              <MissionCard key={mission.id} mission={mission} />
            ))}
          </div>
        ) : (
          /* 슬라이드 모드 */
          <>
            {/* 데스크톱 슬라이드 */}
            <div className="hidden sm:block overflow-hidden">
              <div
                className="flex transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {Array.from({ length: totalSlides }, (_, slideIndex) => (
                  <div key={slideIndex} className="w-full flex-shrink-0">
                    <div className="relative">
                      {/* 연결선 */}
                      <div className="absolute top-6 left-16 right-16 h-0.5 bg-gray-300"></div>

                      {/* 미션들 (3개씩) */}
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 px-4 sm:px-8">
                        {missions.slice(slideIndex * 3, slideIndex * 3 + 3).map((mission) => (
                          <MissionCard key={mission.id} mission={mission} />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 모바일 캐러셀 */}
            <div className="sm:hidden overflow-hidden">
              <div
                className="flex transition-transform duration-300 ease-in-out"
                style={{
                  transform: `translateX(-${currentSlide * 90}%)`,
                  paddingLeft: '5%',
                  paddingRight: '5%'
                }}
              >
                {missions.map((mission) => (
                  <div
                    key={mission.id}
                    className="flex-shrink-0 w-full px-1"
                  >
                    <MissionCard mission={mission} />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* 슬라이드 인디케이터 (슬라이드 모드일 때만) */}
        {!showAllMissions && (
          <>
            {/* 데스크톱 인디케이터 */}
            <div className="hidden sm:flex justify-center mt-6 space-x-2">
              {Array.from({ length: totalSlides }, (_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    currentSlide === index ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            {/* 모바일 인디케이터 */}
            <div className="flex sm:hidden justify-center mt-6 space-x-2">
              {Array.from({ length: missions.length }, (_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    currentSlide === index ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* 전체보기 버튼 (모바일용) */}
        <div className="flex sm:hidden justify-center mt-4">
          <button
            onClick={() => setShowAllMissions(!showAllMissions)}
            className="px-3 py-2 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors"
          >
            {showAllMissions ? '슬라이드 보기' : '전체보기'}
          </button>
        </div>
      </div>

      {/* 파일 업로드 모달 */}
      <FileUploadModal
        isOpen={uploadModalOpen}
        mission={selectedMission}
        onClose={() => {
          setUploadModalOpen(false);
          setSelectedMission(null);
        }}
        onUpload={handleFileUpload}
      />
    </div>
  );
};