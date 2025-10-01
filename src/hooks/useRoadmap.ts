import { useState, useEffect, useCallback } from 'react';
import { RoadmapMission } from '@/app/api/roadmap/route';

interface RoadmapData {
  missions: RoadmapMission[];
  totalPoints: number;
  completedCount: number;
  availableCount: number;
}

interface UseRoadmapReturn {
  missions: RoadmapMission[];
  totalPoints: number;
  completedCount: number;
  availableCount: number;
  loading: boolean;
  error: string | null;
  completeMission: (missionId: string, uploadedFiles: File[]) => Promise<boolean>;
  updateMissionStatus: (missionId: string, status: RoadmapMission['status']) => Promise<boolean>;
  refreshData: () => Promise<void>;
}

export const useRoadmap = (): UseRoadmapReturn => {
  const [data, setData] = useState<RoadmapData>({
    missions: [],
    totalPoints: 0,
    completedCount: 0,
    availableCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 로드맵 데이터 조회
  const fetchRoadmapData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/roadmap');
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || '로드맵 데이터를 가져오는데 실패했습니다.');
      }
    } catch (err) {
      setError('네트워크 오류가 발생했습니다.');
      console.error('로드맵 데이터 조회 오류:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 미션 완료 처리
  const completeMission = useCallback(async (missionId: string, uploadedFiles: File[]): Promise<boolean> => {
    try {
      setError(null);

      const response = await fetch('/api/roadmap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          missionId,
          uploadedFiles: uploadedFiles.map(file => ({ name: file.name, size: file.size }))
        }),
      });

      const result = await response.json();

      if (result.success) {
        setData(prev => ({
          ...prev,
          missions: result.data.missions,
          totalPoints: result.data.totalPoints,
          completedCount: result.data.missions.filter((m: RoadmapMission) => m.status === 'completed').length,
          availableCount: result.data.missions.filter((m: RoadmapMission) => m.status === 'available').length
        }));
        return true;
      } else {
        setError(result.error || '미션 완료 처리에 실패했습니다.');
        return false;
      }
    } catch (err) {
      setError('네트워크 오류가 발생했습니다.');
      console.error('미션 완료 오류:', err);
      return false;
    }
  }, []);

  // 미션 상태 업데이트
  const updateMissionStatus = useCallback(async (missionId: string, status: RoadmapMission['status']): Promise<boolean> => {
    try {
      setError(null);

      const response = await fetch('/api/roadmap', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ missionId, status }),
      });

      const result = await response.json();

      if (result.success) {
        setData(prev => ({
          ...prev,
          missions: prev.missions.map(mission =>
            mission.id === missionId ? { ...mission, status } : mission
          )
        }));
        return true;
      } else {
        setError(result.error || '미션 상태 업데이트에 실패했습니다.');
        return false;
      }
    } catch (err) {
      setError('네트워크 오류가 발생했습니다.');
      console.error('미션 상태 업데이트 오류:', err);
      return false;
    }
  }, []);

  // 데이터 새로고침
  const refreshData = useCallback(async () => {
    await fetchRoadmapData();
  }, [fetchRoadmapData]);

  // 초기 데이터 로드
  useEffect(() => {
    fetchRoadmapData();
  }, [fetchRoadmapData]);

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