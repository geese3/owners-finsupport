// 업종 코드 매핑 데이터
export const INDUSTRY_OPTIONS = [
  { name: "자동차 및 부품 판매업", code: "MOTOR" },
  { name: "도매 및 상품 중개업", code: "WHOLESALE" },
  { name: "소매업(자동차 제외)", code: "RETAIL" },
  { name: "숙박업", code: "LODGING" },
  { name: "음식점업", code: "RESTAURANT" },
  { name: "제조업", code: "MANUFACTURING" },
  { name: "교육 서비스업", code: "EDUCATION" },
  { name: "협회 및 단체, 수리 및 기타 개인 서비스업", code: "ORGANIZATION" },
  { name: "부동산업", code: "ESTATES" },
  { name: "전문, 과학 및 기술 서비스업", code: "TECHNICAL" },
  { name: "예술, 스포츠 및 여가관련 서비스업", code: "ARTS" },
  { name: "정보통신업", code: "INFORMATION" },
  { name: "농업, 임업 및 어업", code: "FARMING" },
  { name: "건설업", code: "CONSTRUCTION" },
  { name: "운수 및 창고업", code: "TRANSPORT" },
  { name: "보건업 및 사회복지 서비스업", code: "HEALTH" },
  { name: "사업시설 관리, 사업 지원 및 임대 서비스업", code: "BUSINESS_SUPPORT" },
  { name: "금융 및 보험업", code: "FINANCE" },
  { name: "전기, 가스, 증기 및 공기 조절 공급업", code: "SUPPLIER" },
  { name: "광업", code: "MINE" },
  { name: "수도, 하수 및 폐기물 처리, 원료 재생업", code: "RECYCLING" },
  { name: "가구 내 고용활동 및 달리 분류되지 않은 자가 소비 생산활동", code: "EMPLOYMENT" },
  { name: "공공 행정, 국방 및 사회보장 행정", code: "DEFENCE" },
  { name: "국제 및 외국기관", code: "INTERNATIONAL" }
];

// 지역 코드 매핑 데이터
export const REGION_OPTIONS = [
  { name: "서울특별시", code: "11000" },
  { name: "부산광역시", code: "26000" },
  { name: "대구광역시", code: "27000" },
  { name: "인천광역시", code: "28000" },
  { name: "광주광역시", code: "29000" },
  { name: "대전광역시", code: "30000" },
  { name: "울산광역시", code: "31000" },
  { name: "세종특별자치시", code: "36000" },
  { name: "경기도", code: "41000" },
  { name: "충청북도", code: "43000" },
  { name: "충청남도", code: "44000" },
  { name: "전라남도", code: "46000" },
  { name: "경상북도", code: "47000" },
  { name: "경상남도", code: "48000" },
  { name: "제주특별자치도", code: "50000" },
  { name: "강원특별자치도", code: "51000" },
  { name: "전북특별자치도", code: "52000" }
];

export type IndustryCode = typeof INDUSTRY_OPTIONS[number]['code'];
export type RegionCode = typeof REGION_OPTIONS[number]['code'];