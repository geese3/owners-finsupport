import { NextRequest, NextResponse } from 'next/server';

// 지원사업 추천 타입 정의
export interface RecommendedSubvention {
  id: string;
  title: string;
  description: string;
  institution: string;
  industry: string[];
  region: string[];
  amount: string;
  deadline: string;
  status: 'active' | 'deadline_approaching' | 'closed';
  matchingScore: number;
  tags: string[];
  applicationUrl?: string;
  requirements: string[];
  benefits: string[];
}

// 필터 조건 타입
interface RecommendationFilters {
  industry?: string;
  region?: string;
  status?: string;
  sortBy?: 'deadline' | 'amount' | 'matching' | 'latest';
  limit?: number;
}

// 가상의 지원사업 데이터
const mockSubventions: RecommendedSubvention[] = [
  {
    id: 'sub_001',
    title: '2025년 스마트제조혁신 지원사업',
    description: '제조업체의 디지털 전환 및 스마트팩토리 구축을 위한 종합 지원 프로그램',
    institution: '중소벤처기업부',
    industry: ['제조업', '기계', '전자'],
    region: ['서울특별시', '경기도', '인천광역시'],
    amount: '최대 2억원',
    deadline: '2025-03-15',
    status: 'active',
    matchingScore: 95,
    tags: ['스마트팩토리', '디지털전환', 'AI', 'IoT'],
    requirements: [
      '제조업 업종 사업자',
      '최근 3년 평균 매출 10억원 이상',
      '스마트팩토리 구축 계획서 제출'
    ],
    benefits: [
      '사업비 최대 80% 지원',
      '기술컨설팅 무료 제공',
      '세제혜택 추가 지원'
    ]
  },
  {
    id: 'sub_002',
    title: '미래차 부품산업 경쟁력 강화사업',
    description: '전기차, 자율주행차 등 미래차 관련 부품 개발 및 양산화 지원',
    institution: '산업통상자원부',
    industry: ['제조업', '자동차', '전자'],
    region: ['전국'],
    amount: '최대 1.5억원',
    deadline: '2025-02-28',
    status: 'deadline_approaching',
    matchingScore: 88,
    tags: ['미래차', '전기차', '자율주행', '부품개발'],
    requirements: [
      '자동차 부품 제조업체',
      'R&D 역량 보유',
      '미래차 부품 개발 경험'
    ],
    benefits: [
      '개발비 최대 70% 지원',
      '인증 취득 지원',
      '해외 진출 지원'
    ]
  },
  {
    id: 'sub_003',
    title: '중소제조기업 ESG 경영 지원사업',
    description: '중소제조기업의 환경·사회·지배구조 개선을 통한 지속가능경영 지원',
    institution: '환경부',
    industry: ['제조업', '전체업종'],
    region: ['수도권', '서울특별시', '경기도'],
    amount: '최대 8천만원',
    deadline: '2025-04-30',
    status: 'active',
    matchingScore: 82,
    tags: ['ESG', '환경경영', '지속가능성', '탄소중립'],
    requirements: [
      '제조업 중소기업',
      'ESG 경영 도입 의지',
      '환경경영시스템 구축 계획'
    ],
    benefits: [
      'ESG 컨설팅 지원',
      '인증 취득 비용 지원',
      'ESG 평가 우대'
    ]
  },
  {
    id: 'sub_004',
    title: '청년창업 지원사업',
    description: '39세 이하 청년의 창업을 지원하는 종합 프로그램',
    institution: '중소벤처기업부',
    industry: ['전체업종', 'IT', '서비스업'],
    region: ['전국'],
    amount: '최대 1억원',
    deadline: '2025-03-30',
    status: 'active',
    matchingScore: 65,
    tags: ['청년창업', '스타트업', '사업화'],
    requirements: [
      '39세 이하 청년',
      '사업 개시 3년 이내',
      '사업계획서 제출'
    ],
    benefits: [
      '창업자금 지원',
      '멘토링 프로그램',
      '네트워킹 기회 제공'
    ]
  },
  {
    id: 'sub_005',
    title: '디지털 뉴딜 기업혁신 지원사업',
    description: '중소기업의 디지털 전환 및 혁신 역량 강화를 위한 지원',
    institution: '과학기술정보통신부',
    industry: ['제조업', 'IT', '서비스업'],
    region: ['서울특별시', '부산광역시', '대구광역시'],
    amount: '최대 5천만원',
    deadline: '2025-05-15',
    status: 'active',
    matchingScore: 78,
    tags: ['디지털전환', 'DX', '혁신', '클라우드'],
    requirements: [
      '중소기업',
      '디지털 전환 계획 보유',
      'IT 투자 계획서 제출'
    ],
    benefits: [
      '디지털 전환 비용 지원',
      '전문가 컨설팅',
      '성과 인센티브'
    ]
  }
];

// 향상된 사용자 프로필 인터페이스
interface EnhancedUserProfile {
  // 기본 정보
  industry: string;
  region: string;

  // 기업 기본 정보
  employeeCount?: string;
  annualRevenue?: string;
  establishedYear?: string;
  mainBusiness?: string;

  // 기술/역량 정보
  certifications?: string[];
  rdInvestment?: string;
  rdEmployees?: string;

  // 사업 방향성
  investmentPriorities?: string[];
  interestAreas?: string[];

  // 지원사업 선호도
  preferredSupportTypes?: string[];
  preferredInstitutions?: string[];
}

// 향상된 매칭 스코어 계산 함수 (130점 만점)
function calculateEnhancedMatchingScore(
  subvention: RecommendedSubvention,
  userProfile: EnhancedUserProfile
): number {
  let score = 0;

  // 1. 기본 정보 매칭 (70점)
  // 업종 매칭 (40점)
  if (subvention.industry.includes(userProfile.industry) || subvention.industry.includes('전체업종')) {
    score += 40;
  } else if (subvention.industry.some(industry =>
    industry.includes('제조') && userProfile.industry.includes('제조')
  )) {
    score += 25;
  } else if (subvention.industry.includes('전체업종')) {
    score += 15;
  }

  // 지역 매칭 (20점)
  if (subvention.region.includes(userProfile.region) || subvention.region.includes('전국')) {
    score += 20;
  } else if (subvention.region.some(region =>
    region.includes('수도권') && userProfile.region.includes('서울')
  )) {
    score += 15;
  } else if (subvention.region.includes('전국')) {
    score += 10;
  }

  // 기업규모 매칭 (10점)
  if (userProfile.employeeCount && userProfile.annualRevenue) {
    // 지원사업 조건에 맞는 기업규모인지 확인 (실제로는 더 복잡한 로직 필요)
    score += 10;
  } else if (userProfile.employeeCount || userProfile.annualRevenue) {
    score += 5;
  }

  // 2. 기업 역량 매칭 (25점)
  // R&D 역량 (8점)
  if (userProfile.rdInvestment && userProfile.rdEmployees) {
    if (subvention.tags.some(tag => ['R&D', 'AI', '혁신', '기술개발'].includes(tag))) {
      score += 8;
    } else {
      score += 4;
    }
  }

  // 인증/자격 (7점)
  if (userProfile.certifications && userProfile.certifications.length > 0) {
    if (subvention.tags.some(tag => ['벤처', '이노비즈', 'ISO'].includes(tag))) {
      score += 7;
    } else {
      score += 3;
    }
  }

  // 기술수준 (10점) - 설립연도 기준으로 대략적 판단
  if (userProfile.establishedYear) {
    const companyAge = new Date().getFullYear() - parseInt(userProfile.establishedYear);
    if (companyAge >= 7) {
      score += 10; // 성숙한 기업
    } else if (companyAge >= 3) {
      score += 7; // 중간 단계
    } else {
      score += 3; // 초기 기업
    }
  }

  // 3. 사업 관심도 매칭 (20점)
  // 관심분야 일치 (15점)
  if (userProfile.interestAreas && userProfile.interestAreas.length > 0) {
    const matchingInterests = userProfile.interestAreas.filter(interest =>
      subvention.tags.some(tag => tag.includes(interest) || interest.includes(tag))
    );
    if (matchingInterests.length >= 2) {
      score += 15;
    } else if (matchingInterests.length >= 1) {
      score += 8;
    }
  }

  // 투자계획 연관성 (5점)
  if (userProfile.investmentPriorities && userProfile.investmentPriorities.length > 0) {
    const matchingPriorities = userProfile.investmentPriorities.filter(priority =>
      subvention.tags.some(tag => tag.includes(priority) || priority.includes(tag))
    );
    if (matchingPriorities.length > 0) {
      score += 5;
    } else {
      score += 2;
    }
  }

  // 4. 지원이력 기반 매칭 (10점)
  // 성공 이력 (5점) - 현재는 가상으로 처리
  score += 3; // 기본 점수

  // 중복 방지/새로운 시도 (5점)
  if (userProfile.preferredInstitutions &&
      userProfile.preferredInstitutions.includes(subvention.institution)) {
    score += 2; // 선호 기관 보너스
  }
  score += 3; // 새로운 시도 기본 점수

  // 5. 추가 우대 조건 (5점)
  // 긴급도 (2점)
  if (subvention.status === 'deadline_approaching') {
    score += 2;
  }

  // 성공 가능성 (3점) - 기업 규모와 지원사업 매칭
  if (userProfile.annualRevenue && userProfile.employeeCount) {
    score += 3;
  }

  return Math.min(score, 130);
}

// 기본 매칭 스코어 계산 함수 (기존 버전)
function calculateBasicMatchingScore(
  subvention: RecommendedSubvention,
  userIndustry: string,
  userRegion: string
): number {
  let score = 0;

  // 업종 매칭 (60점 만점)
  if (subvention.industry.includes(userIndustry) || subvention.industry.includes('전체업종')) {
    score += 60;
  } else if (subvention.industry.some(industry => industry.includes('제조') && userIndustry.includes('제조'))) {
    score += 40;
  }

  // 지역 매칭 (30점 만점)
  if (subvention.region.includes(userRegion) || subvention.region.includes('전국')) {
    score += 30;
  } else if (subvention.region.some(region => region.includes('수도권') && userRegion.includes('서울'))) {
    score += 20;
  }

  // 기본 점수 (10점)
  score += 10;

  return Math.min(score, 100);
}

// 필터링 및 정렬 함수 (향상된 프로필 지원)
function filterAndSortSubventions(
  subventions: RecommendedSubvention[],
  filters: RecommendationFilters,
  userIndustry: string,
  userRegion: string,
  enhancedProfile?: EnhancedUserProfile
): RecommendedSubvention[] {
  let filtered = [...subventions];

  // 업종 필터
  if (filters.industry) {
    filtered = filtered.filter(sub =>
      sub.industry.includes(filters.industry!) || sub.industry.includes('전체업종')
    );
  }

  // 지역 필터
  if (filters.region) {
    filtered = filtered.filter(sub =>
      sub.region.includes(filters.region!) || sub.region.includes('전국')
    );
  }

  // 상태 필터
  if (filters.status) {
    filtered = filtered.filter(sub => sub.status === filters.status);
  }

  // 매칭 스코어 재계산 (향상된 프로필이 있으면 향상된 알고리즘 사용)
  if (enhancedProfile) {
    filtered = filtered.map(sub => ({
      ...sub,
      matchingScore: Math.round(calculateEnhancedMatchingScore(sub, enhancedProfile) * 100 / 130) // 130점을 100점으로 정규화
    }));
  } else {
    filtered = filtered.map(sub => ({
      ...sub,
      matchingScore: calculateBasicMatchingScore(sub, userIndustry, userRegion)
    }));
  }

  // 정렬
  switch (filters.sortBy) {
    case 'deadline':
      filtered.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
      break;
    case 'amount':
      filtered.sort((a, b) => {
        const aAmount = parseInt(a.amount.replace(/[^0-9]/g, ''));
        const bAmount = parseInt(b.amount.replace(/[^0-9]/g, ''));
        return bAmount - aAmount;
      });
      break;
    case 'matching':
      filtered.sort((a, b) => b.matchingScore - a.matchingScore);
      break;
    default:
      filtered.sort((a, b) => b.matchingScore - a.matchingScore);
  }

  // 제한
  if (filters.limit) {
    filtered = filtered.slice(0, filters.limit);
  }

  return filtered;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // 쿼리 파라미터 추출
    const userIndustry = searchParams.get('industry') || '제조업';
    const userRegion = searchParams.get('region') || '서울특별시';
    const status = searchParams.get('status');
    const sortBy = searchParams.get('sortBy') as RecommendationFilters['sortBy'];
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

    const filters: RecommendationFilters = {
      industry: userIndustry,
      region: userRegion,
      status: status || undefined,
      sortBy: sortBy || 'matching',
      limit: limit
    };

    // 향상된 프로필 데이터 체크 (실제로는 데이터베이스에서 가져와야 함)
    // 현재는 가상의 향상된 프로필 데이터 생성 (예시)
    let enhancedProfile: EnhancedUserProfile | undefined;

    // enhancedProfile 쿼리 파라미터로 향상된 프로필 사용 여부 확인
    const useEnhanced = searchParams.get('enhanced') === 'true';

    if (useEnhanced) {
      enhancedProfile = {
        industry: userIndustry,
        region: userRegion,
        employeeCount: '10-49명',
        annualRevenue: '1-10억원',
        establishedYear: '2018',
        mainBusiness: '자동차 부품 제조',
        certifications: ['벤처기업', 'ISO 9001'],
        rdInvestment: '1-3%',
        rdEmployees: '3',
        investmentPriorities: ['R&D', '설비투자'],
        interestAreas: ['스마트팩토리', 'AI/빅데이터'],
        preferredSupportTypes: ['자금지원', '컨설팅'],
        preferredInstitutions: ['중소벤처기업부', '산업통상자원부']
      };
    }

    // 필터링 및 정렬된 지원사업 가져오기
    const recommendations = filterAndSortSubventions(
      mockSubventions,
      filters,
      userIndustry,
      userRegion,
      enhancedProfile
    );

    // 통계 정보 계산
    const stats = {
      total: recommendations.length,
      activeCount: recommendations.filter(r => r.status === 'active').length,
      deadlineApproachingCount: recommendations.filter(r => r.status === 'deadline_approaching').length,
      averageMatchingScore: recommendations.length > 0
        ? Math.round(recommendations.reduce((sum, r) => sum + r.matchingScore, 0) / recommendations.length)
        : 0
    };

    return NextResponse.json({
      success: true,
      data: {
        recommendations,
        stats,
        filters: {
          industry: userIndustry,
          region: userRegion,
          appliedFilters: filters
        }
      }
    });

  } catch (error) {
    console.error('추천 지원사업 조회 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '추천 지원사업을 불러오는 중 오류가 발생했습니다.'
      },
      { status: 500 }
    );
  }
}

// POST: 지원사업 북마크, 관심 표시, 또는 향상된 프로필 저장
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'save_enhanced_profile') {
      // 향상된 프로필 저장
      const { profileData } = body;

      // 실제로는 데이터베이스에 저장
      console.log('향상된 프로필 저장:', profileData);

      return NextResponse.json({
        success: true,
        message: '추가 정보가 성공적으로 저장되었습니다.'
      });

    } else {
      // 북마크 관련 액션
      const { subventionId } = body; // action: 'bookmark' | 'unbookmark' | 'interest'

      // 실제로는 데이터베이스에 저장
      console.log(`${action} action for subvention:`, subventionId);

      return NextResponse.json({
        success: true,
        message: action === 'bookmark' ? '즐겨찾기에 추가되었습니다.' :
                 action === 'unbookmark' ? '즐겨찾기에서 제거되었습니다.' :
                 '관심 표시가 등록되었습니다.'
      });
    }

  } catch (error) {
    console.error('요청 처리 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '처리 중 오류가 발생했습니다.'
      },
      { status: 500 }
    );
  }
}