// 공공조달 사업 데이터 구조
export interface PublicProcurement {
  id: string;
  bidding_no: string;
  title: string;
  institution: string;
  industry_category?: string;
  region: string;
  district?: string;
  budget_amount: string;
  bid_start_date: string;
  bid_end_date: string;
  bid_opening_date: string;
  procurement_url: string;
  procurement_type: string;
  qualification?: string;
  created_at: string;
}

export const MOCK_PROCUREMENTS: PublicProcurement[] = [
  {
    id: "1",
    bidding_no: "20250001-001",
    title: "서울시청 사무용 컴퓨터 및 주변기기 구매",
    institution: "서울특별시청",
    industry_category: "정보통신",
    region: "서울특별시",
    district: "중구",
    budget_amount: "250,000,000 원",
    bid_start_date: "2025-01-02",
    bid_end_date: "2025-01-15",
    bid_opening_date: "2025-01-16",
    procurement_url: "https://www.g2b.go.kr/pt/pt001/001",
    procurement_type: "물품",
    qualification: "중소기업",
    created_at: "2024-12-20"
  },
  {
    id: "2",
    bidding_no: "20250002-001",
    title: "부산광역시 도로 포장 공사",
    institution: "부산광역시청",
    industry_category: "건설",
    region: "부산광역시",
    district: "해운대구",
    budget_amount: "1,500,000,000 원",
    bid_start_date: "2025-01-05",
    bid_end_date: "2025-01-20",
    bid_opening_date: "2025-01-21",
    procurement_url: "https://www.g2b.go.kr/pt/pt001/002",
    procurement_type: "공사",
    qualification: "건설업면허",
    created_at: "2024-12-18"
  },
  {
    id: "3",
    bidding_no: "20250003-001",
    title: "대구시립병원 의료기기 유지보수 용역",
    institution: "대구광역시의료원",
    industry_category: "보건의료",
    region: "대구광역시",
    district: "중구",
    budget_amount: "180,000,000 원",
    bid_start_date: "2025-01-03",
    bid_end_date: "2025-01-18",
    bid_opening_date: "2025-01-19",
    procurement_url: "https://www.g2b.go.kr/pt/pt001/003",
    procurement_type: "용역",
    qualification: "의료기기업체",
    created_at: "2024-12-15"
  },
  {
    id: "4",
    bidding_no: "20250004-001",
    title: "인천공항 청소 용역 계약",
    institution: "인천국제공항공사",
    industry_category: "시설관리",
    region: "인천광역시",
    district: "중구",
    budget_amount: "850,000,000 원",
    bid_start_date: "2025-01-06",
    bid_end_date: "2025-01-25",
    bid_opening_date: "2025-01-26",
    procurement_url: "https://www.g2b.go.kr/pt/pt001/004",
    procurement_type: "용역",
    qualification: "청소업 등록",
    created_at: "2024-12-12"
  },
  {
    id: "5",
    bidding_no: "20250005-001",
    title: "광주광역시 급식 식자재 공급",
    institution: "광주광역시교육청",
    industry_category: "식품",
    region: "광주광역시",
    district: "동구",
    budget_amount: "420,000,000 원",
    bid_start_date: "2025-01-04",
    bid_end_date: "2025-01-22",
    bid_opening_date: "2025-01-23",
    procurement_url: "https://www.g2b.go.kr/pt/pt001/005",
    procurement_type: "물품",
    qualification: "식품제조업",
    created_at: "2024-12-10"
  },
  {
    id: "6",
    bidding_no: "20250006-001",
    title: "대전광역시 공원 조경 공사",
    institution: "대전광역시청",
    industry_category: "조경",
    region: "대전광역시",
    district: "서구",
    budget_amount: "680,000,000 원",
    bid_start_date: "2025-01-07",
    bid_end_date: "2025-01-28",
    bid_opening_date: "2025-01-29",
    procurement_url: "https://www.g2b.go.kr/pt/pt001/006",
    procurement_type: "공사",
    qualification: "조경공사업",
    created_at: "2024-12-08"
  },
  {
    id: "7",
    bidding_no: "20250007-001",
    title: "울산광역시 쓰레기 수거 차량 구매",
    institution: "울산광역시청",
    industry_category: "환경",
    region: "울산광역시",
    district: "남구",
    budget_amount: "950,000,000 원",
    bid_start_date: "2025-01-08",
    bid_end_date: "2025-01-30",
    bid_opening_date: "2025-01-31",
    procurement_url: "https://www.g2b.go.kr/pt/pt001/007",
    procurement_type: "물품",
    qualification: "자동차판매업",
    created_at: "2024-12-05"
  },
  {
    id: "8",
    bidding_no: "20250008-001",
    title: "세종특별자치시 홈페이지 구축 용역",
    institution: "세종특별자치시청",
    industry_category: "정보통신",
    region: "세종특별자치시",
    district: "",
    budget_amount: "320,000,000 원",
    bid_start_date: "2025-01-09",
    bid_end_date: "2025-02-05",
    bid_opening_date: "2025-02-06",
    procurement_url: "https://www.g2b.go.kr/pt/pt001/008",
    procurement_type: "용역",
    qualification: "정보처리업",
    created_at: "2024-12-01"
  },
  {
    id: "9",
    bidding_no: "20250009-001",
    title: "경기도청 사무용품 일괄 구매",
    institution: "경기도청",
    industry_category: "사무용품",
    region: "경기도",
    district: "수원시",
    budget_amount: "150,000,000 원",
    bid_start_date: "2025-01-10",
    bid_end_date: "2025-02-10",
    bid_opening_date: "2025-02-11",
    procurement_url: "https://www.g2b.go.kr/pt/pt001/009",
    procurement_type: "물품",
    qualification: "일반업체",
    created_at: "2024-11-28"
  },
  {
    id: "10",
    bidding_no: "20250010-001",
    title: "강원특별자치도 관광 홍보 영상 제작",
    institution: "강원특별자치도청",
    industry_category: "영상제작",
    region: "강원특별자치도",
    district: "춘천시",
    budget_amount: "280,000,000 원",
    bid_start_date: "2025-01-12",
    bid_end_date: "2025-02-15",
    bid_opening_date: "2025-02-16",
    procurement_url: "https://www.g2b.go.kr/pt/pt001/010",
    procurement_type: "용역",
    qualification: "영상제작업",
    created_at: "2024-11-25"
  }
];

// 공공조달 유형 옵션
export const PROCUREMENT_TYPES = [
  { name: "물품", code: "GOODS" },
  { name: "공사", code: "CONSTRUCTION" },
  { name: "용역", code: "SERVICE" }
];

// 업종 카테고리 옵션 (공공조달용)
export const PROCUREMENT_CATEGORIES = [
  { name: "정보통신", code: "IT" },
  { name: "건설", code: "CONSTRUCTION" },
  { name: "보건의료", code: "HEALTHCARE" },
  { name: "시설관리", code: "FACILITY" },
  { name: "식품", code: "FOOD" },
  { name: "조경", code: "LANDSCAPE" },
  { name: "환경", code: "ENVIRONMENT" },
  { name: "사무용품", code: "OFFICE" },
  { name: "영상제작", code: "MEDIA" }
];

// 조달 유형별 필터링 함수
export const filterProcurementsByType = (procurements: PublicProcurement[], type: string): PublicProcurement[] => {
  if (!type || type === "ALL") return procurements;
  const typeName = PROCUREMENT_TYPES.find(t => t.code === type)?.name || "";
  return procurements.filter(procurement => procurement.procurement_type === typeName);
};

// 업종별 필터링 함수
export const filterProcurementsByCategory = (procurements: PublicProcurement[], category: string): PublicProcurement[] => {
  if (!category || category === "ALL") return procurements;
  const categoryName = PROCUREMENT_CATEGORIES.find(c => c.code === category)?.name || "";
  return procurements.filter(procurement => procurement.industry_category === categoryName);
};

// 지역별 필터링 함수
export const filterProcurementsByRegion = (procurements: PublicProcurement[], regionName: string): PublicProcurement[] => {
  if (!regionName || regionName === "전체") return procurements;
  return procurements.filter(procurement => procurement.region.includes(regionName));
};

// 입찰 마감일 기준 정렬
export const sortProcurementsByDeadline = (procurements: PublicProcurement[]): PublicProcurement[] => {
  return [...procurements].sort((a, b) => {
    const dateA = new Date(a.bid_end_date);
    const dateB = new Date(b.bid_end_date);
    return dateA.getTime() - dateB.getTime();
  });
};