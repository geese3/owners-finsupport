// 정부지원사업 통합 데이터 타입 정의

export interface GovernmentSupport {
  id?: string
  subvention_id: string              // 고유 ID (각 API의 고유값)
  title: string                      // 지원사업명
  host_institution: string           // 주관기관
  region: string                     // 지역
  business_type_code: string         // 사업자 유형 코드
  support_method: string             // 지원 방식 (융자, 보조금, 투자 등)
  support_amount: string             // 지원 금액
  interest_rate: string              // 금리 (융자의 경우)
  application_deadline: string       // 접수 마감일
  application_method: string         // 접수 방법
  announcement_url: string           // 공고 URL
  attachment_files: string           // 첨부파일명
  source: string                     // 데이터 출처 (정책정보포털, K-스타트업 등)
  status: 'active' | 'expired'      // 상태
  raw_data?: any                     // 원본 API 데이터
  created_at: string
  updated_at: string
}

// 레거시 프론트엔드 호환 타입
export interface SubventionItem {
  subventionId: string
  지역: string
  접수기관: string
  지원사업명: string
  "지원 방식": string
  지원금액: string
  금리: string
  "접수 마감일": string
  "접수 방법": string
  "공고 URL": string
  출처: string
  첨부파일: string
  첨부파일URL?: string
  businessTypeCode?: string
  rawData?: any
}

// API 응답 타입
export interface GovernmentSupportAPIResponse {
  success: boolean
  data: SubventionItem[]
  total?: number
  params?: any
}

// 데이터 소스 정의
export enum DataSource {
  BIZINFO = '정책정보포털',       // 기업마당 (bizinfo.go.kr)
  KSTARTUP = 'K-스타트업',       // K-스타트업 (k-startup.go.kr)
  SBIZ = '소상공인시장진흥공단',    // 소상공인시장진흥공단
  KOSME = '중소벤처기업진흥공단',   // 중소벤처기업진흥공단
  // 추가 데이터 소스
}