import { useState, useEffect } from 'react';
import { RecommendedSubvention } from '@/app/api/recommendations/route';

interface RecommendationFilters {
  status?: string;
  sortBy?: 'deadline' | 'amount' | 'matching' | 'latest';
  limit?: number;
}

interface RecommendationStats {
  total: number;
  activeCount: number;
  deadlineApproachingCount: number;
  averageMatchingScore: number;
}

interface UseRecommendationsReturn {
  recommendations: RecommendedSubvention[];
  stats: RecommendationStats;
  loading: boolean;
  error: string | null;
  filters: RecommendationFilters;
  setFilters: (filters: RecommendationFilters) => void;
  refreshData: () => Promise<void>;
  bookmarkSubvention: (subventionId: string) => Promise<boolean>;
  unbookmarkSubvention: (subventionId: string) => Promise<boolean>;
}

export const useRecommendations = (
  userIndustry: string = '제조업',
  userRegion: string = '서울특별시',
  hasEnhancedProfile: boolean = false
): UseRecommendationsReturn => {
  const [recommendations, setRecommendations] = useState<RecommendedSubvention[]>([]);
  const [stats, setStats] = useState<RecommendationStats>({
    total: 0,
    activeCount: 0,
    deadlineApproachingCount: 0,
    averageMatchingScore: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<RecommendationFilters>({
    sortBy: 'matching'
  });

  // 데이터 로드 함수
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // API 쿼리 파라미터 구성
      const queryParams = new URLSearchParams({
        industry: userIndustry,
        region: userRegion
      });

      if (filters.status) {
        queryParams.append('status', filters.status);
      }
      if (filters.sortBy) {
        queryParams.append('sortBy', filters.sortBy);
      }
      if (filters.limit) {
        queryParams.append('limit', filters.limit.toString());
      }
      if (hasEnhancedProfile) {
        queryParams.append('enhanced', 'true');
      }

      const response = await fetch(`/api/recommendations?${queryParams.toString()}`);

      if (!response.ok) {
        throw new Error('추천 지원사업 데이터를 불러오지 못했습니다.');
      }

      const result = await response.json();

      if (result.success) {
        setRecommendations(result.data.recommendations);
        setStats(result.data.stats);
      } else {
        throw new Error(result.error || '데이터 로드 중 오류가 발생했습니다.');
      }
    } catch (err) {
      console.error('추천 지원사업 데이터 로드 오류:', err);
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 북마크 추가 함수
  const bookmarkSubvention = async (subventionId: string): Promise<boolean> => {
    try {
      setError(null);

      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subventionId,
          action: 'bookmark'
        })
      });

      if (!response.ok) {
        throw new Error('북마크 추가에 실패했습니다.');
      }

      const result = await response.json();

      if (result.success) {
        // 로컬 상태 업데이트 (실제로는 서버에서 다시 가져와야 함)
        console.log(result.message);
        return true;
      } else {
        throw new Error(result.error || '북마크 추가 중 오류가 발생했습니다.');
      }
    } catch (err) {
      console.error('북마크 추가 오류:', err);
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      return false;
    }
  };

  // 북마크 제거 함수
  const unbookmarkSubvention = async (subventionId: string): Promise<boolean> => {
    try {
      setError(null);

      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subventionId,
          action: 'unbookmark'
        })
      });

      if (!response.ok) {
        throw new Error('북마크 제거에 실패했습니다.');
      }

      const result = await response.json();

      if (result.success) {
        console.log(result.message);
        return true;
      } else {
        throw new Error(result.error || '북마크 제거 중 오류가 발생했습니다.');
      }
    } catch (err) {
      console.error('북마크 제거 오류:', err);
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      return false;
    }
  };

  // 데이터 새로고침 함수
  const refreshData = async () => {
    await loadData();
  };

  // 필터 변경 시 데이터 다시 로드
  useEffect(() => {
    loadData();
  }, [filters, userIndustry, userRegion, hasEnhancedProfile]);

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    loadData();
  }, []);

  return {
    recommendations,
    stats,
    loading,
    error,
    filters,
    setFilters,
    refreshData,
    bookmarkSubvention,
    unbookmarkSubvention
  };
};