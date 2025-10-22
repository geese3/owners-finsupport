/**
 * 기본 API 소스 인터페이스 및 유틸리티
 * 다양한 API 소스를 쉽게 추가할 수 있도록 모듈화된 구조
 */

// 표준화된 정부지원사업 데이터 인터페이스
export interface StandardizedSupport {
  subvention_id: string
  title: string
  region: string
  host_institution: string
  support_method: string
  support_amount: string
  interest_rate: string
  application_deadline: string
  application_method: string
  announcement_url: string
  source: string
  attachment_files: string
  business_type_code: string
  status: 'active' | 'inactive' | 'expired'
  api_source: string
  api_last_updated_at: string
  raw_data: any
}

// API 소스 설정 인터페이스
export interface ApiSourceConfig {
  name: string
  source_id: string
  base_url: string
  api_key?: string
  rate_limit_ms: number
  max_pages: number
  items_per_page: number
  timeout_ms: number
}

// 로그 인터페이스
export interface ApiLog {
  timestamp: string
  action: string
  status: 'success' | 'error' | 'warning'
  message: string
  details?: any
}

// 기본 API 소스 추상 클래스
export abstract class BaseApiSource {
  protected config: ApiSourceConfig
  protected logs: ApiLog[] = []

  constructor(config: ApiSourceConfig) {
    this.config = config
  }

  // 로그 기록
  protected log(action: string, status: ApiLog['status'], message: string, details?: any) {
    const logEntry: ApiLog = {
      timestamp: new Date().toISOString(),
      action,
      status,
      message,
      details
    }
    this.logs.push(logEntry)
    console.log(`[${this.config.source_id}] [${status.toUpperCase()}] ${action}: ${message}`, details || '')
  }

  // 각 API 소스에서 구현해야 하는 추상 메서드들
  abstract fetchRawData(): Promise<any[]>
  abstract transformData(rawData: any[]): StandardizedSupport[]
  abstract getUniqueIds(items: StandardizedSupport[]): string[]

  // 공통 중복 제거 로직
  public removeDuplicates(items: StandardizedSupport[]): StandardizedSupport[] {
    const uniqueIds = new Set<string>()
    const uniqueItems: StandardizedSupport[] = []

    for (const item of items) {
      const uniqueId = item.subvention_id
      if (uniqueId && !uniqueIds.has(uniqueId)) {
        uniqueIds.add(uniqueId)
        uniqueItems.push(item)
      }
    }

    this.log('REMOVE_DUPLICATES', 'success', `중복 제거: ${items.length} → ${uniqueItems.length}개`)
    return uniqueItems
  }

  // 공통 지역 추출 로직
  protected extractRegion(title: string, hashTags: string, institution: string): string {
    const regions = ['서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종',
                    '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주']

    // 1순위: 제목에서 [지역] 패턴 추출
    if (title) {
      const titleRegionMatch = title.match(/\[([^\]]+)\]/)
      if (titleRegionMatch) {
        const extractedRegion = titleRegionMatch[1]
        for (const region of regions) {
          if (extractedRegion.includes(region)) {
            return region
          }
        }
      }
    }

    // 2순위: 관할기관명에서 지역 추출
    if (institution) {
      for (const region of regions) {
        if (institution.includes(region)) {
          return region
        }
      }
    }

    // 3순위: 해시태그에서 지역 추출
    if (hashTags) {
      const foundRegions = regions.filter(region => hashTags.includes(region))
      if (foundRegions.length > 0 && foundRegions.length <= 3) {
        return foundRegions[0]
      }
    }

    // 4순위: 중앙부처 확인
    if (institution) {
      const centralAgencies = ['중소벤처기업부', '산업통상자원부', '기획재정부', '국토교통부',
                             '문화체육관광부', '농림축산식품부', '해양수산부', '과학기술정보통신부']
      for (const agency of centralAgencies) {
        if (institution.includes(agency)) {
          return '전국'
        }
      }
    }

    return '전국'
  }

  // 공통 날짜 파싱 로직
  protected parseDate(dateString: string): string {
    if (!dateString) return '확인 필요'

    // YYYYMMDD 형식
    if (/^\d{8}$/.test(dateString)) {
      return `${dateString.slice(0,4)}-${dateString.slice(4,6)}-${dateString.slice(6,8)}`
    }

    // YY-MM-DD 형식 (2자리 연도를 4자리로 변환)
    if (/^\d{2}-\d{2}-\d{2}$/.test(dateString)) {
      const [year, month, day] = dateString.split('-')
      const fullYear = parseInt(year) < 50 ? `20${year}` : `19${year}`
      return `${fullYear}-${month}-${day}`
    }

    // 다른 구분자들을 하이픈으로 변경
    if (dateString.includes('.')) {
      return dateString.replace(/\./g, '-')
    }
    if (dateString.includes('/')) {
      return dateString.replace(/\//g, '-')
    }

    return dateString
  }

  // 공통 기간 파싱 로직 (예: "20220727 ~ 20220930")
  protected parseApplicationPeriod(periodString: string): string {
    if (!periodString) return '확인 필요'

    const match = periodString.match(/(\d{8})\s*~\s*(\d{8})/)
    if (match) {
      const startDate = this.parseDate(match[1])
      const endDate = this.parseDate(match[2])
      return `${startDate} ~ ${endDate}`
    }

    return periodString
  }

  // 전체 처리 파이프라인
  async processData(): Promise<{
    success: boolean
    data: StandardizedSupport[]
    count: number
    logs: ApiLog[]
    error?: string
  }> {
    try {
      this.log('PROCESS_START', 'success', `${this.config.name} 데이터 처리 시작`)

      // 1. Raw 데이터 가져오기
      const rawData = await this.fetchRawData()

      // 2. 데이터 변환
      const transformedData = this.transformData(rawData)

      // 3. 중복 제거
      const uniqueData = this.removeDuplicates(transformedData)

      this.log('PROCESS_COMPLETE', 'success', `데이터 처리 완료: ${uniqueData.length}개`)

      return {
        success: true,
        data: uniqueData,
        count: uniqueData.length,
        logs: this.logs
      }

    } catch (error) {
      this.log('PROCESS_ERROR', 'error', '데이터 처리 실패', error)
      return {
        success: false,
        data: [],
        count: 0,
        logs: this.logs,
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      }
    }
  }

  // 로그 관리
  getLogs(): ApiLog[] {
    return this.logs
  }

  clearLogs(): void {
    this.logs = []
  }
}

// API 소스 관리자
export class ApiSourceManager {
  private sources: Map<string, BaseApiSource> = new Map()

  // API 소스 등록
  registerSource(source: BaseApiSource, sourceId: string): void {
    this.sources.set(sourceId, source)
    console.log(`🔌 API 소스 등록: ${sourceId}`)
  }

  // 특정 소스에서 데이터 가져오기
  async processSource(sourceId: string): Promise<{
    success: boolean
    data: StandardizedSupport[]
    count: number
    logs: ApiLog[]
    error?: string
  }> {
    const source = this.sources.get(sourceId)
    if (!source) {
      throw new Error(`등록되지 않은 API 소스: ${sourceId}`)
    }

    return await source.processData()
  }

  // 모든 소스에서 데이터 가져오기
  async processAllSources(): Promise<{
    success: boolean
    data: StandardizedSupport[]
    count: number
    logs: ApiLog[]
    errors: string[]
  }> {
    const allData: StandardizedSupport[] = []
    const allLogs: ApiLog[] = []
    const errors: string[] = []

    for (const [sourceId, source] of this.sources) {
      try {
        const result = await source.processData()
        if (result.success) {
          allData.push(...result.data)
          allLogs.push(...result.logs)
        } else {
          errors.push(`${sourceId}: ${result.error}`)
        }
      } catch (error) {
        errors.push(`${sourceId}: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
      }
    }

    // 전체 데이터에서 중복 제거 (서로 다른 API에서 같은 데이터가 올 수 있음)
    const uniqueData = this.removeDuplicatesAcrossSources(allData)

    return {
      success: errors.length === 0,
      data: uniqueData,
      count: uniqueData.length,
      logs: allLogs,
      errors
    }
  }

  // 여러 소스 간 중복 제거
  private removeDuplicatesAcrossSources(items: StandardizedSupport[]): StandardizedSupport[] {
    const uniqueIds = new Set<string>()
    const uniqueItems: StandardizedSupport[] = []

    for (const item of items) {
      const uniqueId = item.subvention_id
      if (uniqueId && !uniqueIds.has(uniqueId)) {
        uniqueIds.add(uniqueId)
        uniqueItems.push(item)
      }
    }

    console.log(`🔄 전체 중복 제거: ${items.length} → ${uniqueItems.length}개`)
    return uniqueItems
  }

  // 등록된 소스 목록
  getRegisteredSources(): string[] {
    return Array.from(this.sources.keys())
  }
}