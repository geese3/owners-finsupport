import { useState, useEffect } from 'react';
import { InvestmentMission } from '@/app/api/investment-roadmap/route';

interface InvestmentRoadmapData {
  missions: InvestmentMission[];
  totalPoints: number;
  completedCount: number;
  availableCount: number;
}

interface UseInvestmentRoadmapReturn {
  missions: InvestmentMission[];
  totalPoints: number;
  completedCount: number;
  availableCount: number;
  loading: boolean;
  error: string | null;
  completeMission: (missionId: string, files: File[]) => Promise<boolean>;
  updateMissionStatus: (missionId: string, status: InvestmentMission['status']) => Promise<boolean>;
  refreshData: () => Promise<void>;
}

export const useInvestmentRoadmap = (): UseInvestmentRoadmapReturn => {
  const [data, setData] = useState<InvestmentRoadmapData>({
    missions: [],
    totalPoints: 0,
    completedCount: 0,
    availableCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 데이터 로드 함수
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/investment-roadmap');
      if (!response.ok) {
        throw new Error('투자 로드맵 데이터를 불러오지 못했습니다.');
      }

      const result = await response.json();
      if (result.success) {
        setData(result.data);
      } else {
        throw new Error(result.error || '데이터 로드 중 오류가 발생했습니다.');
      }
    } catch (err) {
      console.error('투자 로드맵 데이터 로드 오류:', err);
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 미션 완료 함수
  const completeMission = async (missionId: string, files: File[]): Promise<boolean> => {
    try {
      setError(null);

      const response = await fetch('/api/investment-roadmap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          missionId,
          uploadedFiles: files
        })
      });

      if (!response.ok) {
        throw new Error('미션 완료 처리에 실패했습니다.');
      }

      const result = await response.json();
      if (result.success) {
        // 데이터 업데이트
        setData(prevData => ({
          ...prevData,
          missions: result.data.missions,
          totalPoints: result.data.totalPoints,
          completedCount: result.data.missions.filter((m: InvestmentMission) => m.status === 'completed').length,
          availableCount: result.data.missions.filter((m: InvestmentMission) => m.status === 'available').length
        }));
        return true;
      } else {
        throw new Error(result.error || '미션 완료 처리 중 오류가 발생했습니다.');
      }
    } catch (err) {
      console.error('미션 완료 오류:', err);
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      return false;
    }
  };

  // 미션 상태 업데이트 함수
  const updateMissionStatus = async (missionId: string, status: InvestmentMission['status']): Promise<boolean> => {
    try {
      setError(null);

      const response = await fetch('/api/investment-roadmap', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          missionId,
          status
        })
      });

      if (!response.ok) {
        throw new Error('미션 상태 업데이트에 실패했습니다.');
      }

      const result = await response.json();
      if (result.success) {
        // 데이터 새로고침
        await loadData();
        return true;
      } else {
        throw new Error(result.error || '미션 상태 업데이트 중 오류가 발생했습니다.');
      }
    } catch (err) {
      console.error('미션 상태 업데이트 오류:', err);
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      return false;
    }
  };

  // 데이터 새로고침 함수
  const refreshData = async () => {
    await loadData();
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadData();
  }, []);

  return {
    missions: data.missions,
    totalPoints: data.totalPoints,
    completedCount: data.completedCount,
    availableCount: data.availableCount,
    loading,
    error,
    completeMission,
    updateMissionStatus,
    refreshData
  };
};