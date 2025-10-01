// 임시 정부지원사업 데이터 (실제 데이터 구조와 유사하게 구성)
export interface GovernmentNotice {
  id: string;
  subvention_id: string;
  title: string;
  institution: string;
  industry_code?: string;
  region: string;
  district?: string;
  support_amount: string;
  reception_end_date: string;
  subvention_url: string;
  support_method?: string;
  created_at: string;
}

export const MOCK_NOTICES: GovernmentNotice[] = [
  {
    id: "1",
    subvention_id: "SUB2025001",
    title: "2025년 소상공인 디지털 전환 지원사업",
    institution: "소상공인시장진흥공단",
    industry_code: "RETAIL",
    region: "서울특별시",
    district: "강남구",
    support_amount: "3,000,000 원",
    reception_end_date: "2025-01-31",
    subvention_url: "https://www.semas.or.kr/support/digital-transform",
    support_method: "보조금",
    created_at: "2024-12-15"
  },
  {
    id: "2",
    subvention_id: "SUB2025002",
    title: "제조업 스마트팩토리 구축 지원",
    institution: "중소벤처기업부",
    industry_code: "MANUFACTURING",
    region: "경기도",
    district: "수원시",
    support_amount: "50,000,000 원",
    reception_end_date: "2025-02-28",
    subvention_url: "https://www.mss.go.kr/smartfactory",
    support_method: "융자",
    created_at: "2024-12-10"
  },
  {
    id: "3",
    subvention_id: "SUB2025003",
    title: "음식점업 위생시설 개선 지원",
    institution: "식품의약품안전처",
    industry_code: "RESTAURANT",
    region: "부산광역시",
    district: "해운대구",
    support_amount: "1,500,000 원",
    reception_end_date: "2025-01-15",
    subvention_url: "https://www.mfds.go.kr/restaurant-support",
    support_method: "보조금",
    created_at: "2024-12-08"
  },
  {
    id: "4",
    subvention_id: "SUB2025004",
    title: "건설업 안전관리 시스템 도입 지원",
    institution: "고용노동부",
    industry_code: "CONSTRUCTION",
    region: "인천광역시",
    district: "남동구",
    support_amount: "10,000,000 원",
    reception_end_date: "2025-03-15",
    subvention_url: "https://www.moel.go.kr/construction-safety",
    support_method: "보조금",
    created_at: "2024-12-05"
  },
  {
    id: "5",
    subvention_id: "SUB2025005",
    title: "정보통신업 연구개발 혁신 지원",
    institution: "과학기술정보통신부",
    industry_code: "INFORMATION",
    region: "대전광역시",
    district: "유성구",
    support_amount: "100,000,000 원",
    reception_end_date: "2025-02-10",
    subvention_url: "https://www.msit.go.kr/rd-innovation",
    support_method: "융자",
    created_at: "2024-12-01"
  },
  {
    id: "6",
    subvention_id: "SUB2025006",
    title: "농업 스마트팜 설치 지원사업",
    institution: "농림축산식품부",
    industry_code: "FARMING",
    region: "전라남도",
    district: "무안군",
    support_amount: "80,000,000 원",
    reception_end_date: "2025-01-20",
    subvention_url: "https://www.mafra.go.kr/smartfarm",
    support_method: "융자",
    created_at: "2024-11-28"
  },
  {
    id: "7",
    subvention_id: "SUB2025007",
    title: "운수업 친환경 차량 구매 지원",
    institution: "국토교통부",
    industry_code: "TRANSPORT",
    region: "충청남도",
    district: "천안시",
    support_amount: "25,000,000 원",
    reception_end_date: "2025-01-25",
    subvention_url: "https://www.molit.go.kr/eco-vehicle",
    support_method: "보조금",
    created_at: "2024-11-25"
  },
  {
    id: "8",
    subvention_id: "SUB2025008",
    title: "보건업 의료기기 구매 지원",
    institution: "보건복지부",
    industry_code: "HEALTH",
    region: "대구광역시",
    district: "중구",
    support_amount: "15,000,000 원",
    reception_end_date: "2025-02-05",
    subvention_url: "https://www.mohw.go.kr/medical-device",
    support_method: "보조금",
    created_at: "2024-11-20"
  }
];

// 업종별 필터링 함수
export const filterNoticesByIndustry = (notices: GovernmentNotice[], industryCode: string): GovernmentNotice[] => {
  if (!industryCode || industryCode === "ALL") return notices;
  return notices.filter(notice => notice.industry_code === industryCode);
};

// 지역별 필터링 함수
export const filterNoticesByRegion = (notices: GovernmentNotice[], regionName: string): GovernmentNotice[] => {
  if (!regionName || regionName === "전체") return notices;
  return notices.filter(notice => notice.region.includes(regionName));
};

// 마감일 기준 정렬
export const sortNoticesByDeadline = (notices: GovernmentNotice[]): GovernmentNotice[] => {
  return [...notices].sort((a, b) => {
    const dateA = new Date(a.reception_end_date);
    const dateB = new Date(b.reception_end_date);
    return dateA.getTime() - dateB.getTime();
  });
};