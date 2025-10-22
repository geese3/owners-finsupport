/**
 * 기업마당(bizinfo.go.kr) API 소스 - 새로운 모듈화 시스템
 * BaseApiSource를 상속받아 기업마당 특화 로직 구현
 */

import { BaseApiSource, ApiSourceConfig, StandardizedSupport } from './base-api-source'

const BIZINFO_API_BASE_URL = process.env.POLICY_API_BASE_URL || 'https://www.bizinfo.go.kr/uss/rss/bizinfoApi.do'
const BIZINFO_API_KEY = process.env.POLICY_API_KEY || ''

export interface BizinfoAPIResponse {
  fileNm?: string
  totCnt?: number
  flpthNm?: string
  trgetNm?: string
  hashtags?: string
  inqireCo?: number
  pblancId: string
  pblancNm: string
  refrncNm?: string
  pblancUrl?: string
  creatPnttm?: string
  excInsttNm?: string
  bsnsSumryCn?: string
  jrsdInsttNm?: string
  printFileNm?: string
  printFlpthNm?: string
  reqstBeginEndDe?: string
  rceptEngnHmpgUrl?: string
  reqstMthPapersCn?: string
  pldirSportRealmLclasCodeNm?: string
  pldirSportRealmMlsfcCodeNm?: string
}

export class BizinfoSource extends BaseApiSource {
  constructor() {
    const config: ApiSourceConfig = {
      name: '기업마당',
      source_id: 'bizinfo',
      base_url: BIZINFO_API_BASE_URL,
      api_key: BIZINFO_API_KEY,
      rate_limit_ms: 200,
      max_pages: 10,
      items_per_page: 100,
      timeout_ms: 30000
    }
    super(config)
  }

  async fetchRawData(): Promise<BizinfoAPIResponse[]> {
    try {
      const allItems: BizinfoAPIResponse[] = []

      this.log('FETCH_EXTERNAL', 'success', `${this.config.name} API 호출 시작`)

      // 다양한 분야의 데이터 수집을 위해 분야별로 요청
      const categories = ['01', '02', '03', '04', '05', '06', '07', '09'] // 금융, 기술, 인력, 수출, 내수, 창업, 경영, 기타

      for (let page = 1; page <= this.config.max_pages; page++) {
        for (const category of categories) {
          try {
            const searchParams = new URLSearchParams({
              crtfcKey: this.config.api_key!,
              dataType: 'json',
              searchCnt: this.config.items_per_page.toString(),
              pageIndex: page.toString(),
              pageUnit: this.config.items_per_page.toString(),
              searchLclasId: category
            })

          const response = await fetch(`${this.config.base_url}?${searchParams}`, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'OwnersFinsupport/1.0'
            },
            signal: AbortSignal.timeout(this.config.timeout_ms)
          })

          if (!response.ok) {
            this.log('FETCH_EXTERNAL', 'warning', `API 요청 실패: ${response.status}`)
            continue
          }

          const data = await response.json()

          if (data.jsonArray && Array.isArray(data.jsonArray)) {
            allItems.push(...data.jsonArray)
            this.log('FETCH_EXTERNAL', 'success', `페이지 ${page}: ${data.jsonArray.length}개 수집`)
          }

            // Rate limiting
            await new Promise(resolve => setTimeout(resolve, this.config.rate_limit_ms))

          } catch (error) {
            this.log('FETCH_EXTERNAL', 'warning', `페이지 ${page}, 분야 ${category} 요청 실패`, error)
            continue
          }
        }
      }

      this.log('FETCH_EXTERNAL', 'success', `총 ${allItems.length}개 항목 수집 완료`)
      return allItems

    } catch (error) {
      this.log('FETCH_EXTERNAL', 'error', `${this.config.name} API 호출 실패`, error)
      throw error
    }
  }

  transformData(rawData: BizinfoAPIResponse[]): StandardizedSupport[] {
    try {
      const transformed = rawData.map(item => {
        return {
          subvention_id: item.pblancId,
          title: item.pblancNm,
          region: this.extractRegionFromBizinfo(item),
          host_institution: item.jrsdInsttNm || '미정',
          support_method: item.pldirSportRealmMlsfcCodeNm || '기타',
          support_amount: '확인 필요',
          interest_rate: '확인 필요',
          application_deadline: this.extractDeadline(item.reqstBeginEndDe || ''),
          application_method: item.reqstMthPapersCn || '온라인접수',
          announcement_url: item.pblancUrl ? `https://www.bizinfo.go.kr${item.pblancUrl}` : '',
          source: this.config.name,
          attachment_files: item.printFileNm || '없음',
          business_type_code: this.extractBusinessType(item),
          status: 'active' as const,
          api_source: this.config.source_id,
          api_last_updated_at: new Date().toISOString(),
          raw_data: item
        }
      }).filter(item => item.subvention_id)

      this.log('TRANSFORM_DATA', 'success', `${transformed.length}개 항목 변환 완료`)
      return transformed

    } catch (error) {
      this.log('TRANSFORM_DATA', 'error', '데이터 변환 실패', error)
      throw error
    }
  }

  getUniqueIds(items: StandardizedSupport[]): string[] {
    return items.map(item => item.subvention_id).filter(Boolean)
  }

  // 신청 마감일 추출 함수
  private extractDeadline(reqstBeginEndDe: string): string {
    if (!reqstBeginEndDe) return '확인 필요'

    // "20250828 ~ 20251211" 형식에서 마감일(뒷날짜) 추출
    if (reqstBeginEndDe.includes('~')) {
      const parts = reqstBeginEndDe.split('~').map(part => part.trim())
      if (parts.length === 2) {
        const endDate = parts[1]
        // YYYYMMDD 형식을 YYYY-MM-DD 형식으로 변환
        if (endDate.length === 8 && /^\d{8}$/.test(endDate)) {
          const year = endDate.substring(0, 4)
          const month = endDate.substring(4, 6)
          const day = endDate.substring(6, 8)
          return `${year}-${month}-${day}`
        }
        return endDate
      }
    }

    // 단일 날짜인 경우
    if (/^\d{8}$/.test(reqstBeginEndDe)) {
      const year = reqstBeginEndDe.substring(0, 4)
      const month = reqstBeginEndDe.substring(4, 6)
      const day = reqstBeginEndDe.substring(6, 8)
      return `${year}-${month}-${day}`
    }

    // 그 외의 경우 그대로 반환
    return reqstBeginEndDe
  }

  // 지역 추출 함수 (4단계 우선순위)
  private extractRegionFromBizinfo(item: BizinfoAPIResponse): string {
    // 우선순위 1: hashtags에서 지역 추출
    if (item.hashtags) {
      const regionFromHashtags = this.extractRegionFromText(item.hashtags)
      if (regionFromHashtags !== '전국') {
        return regionFromHashtags
      }
    }

    // 우선순위 2: 제목에서 [지역] 패턴 추출
    const titleMatch = item.pblancNm?.match(/\[([가-힣]+)\]/)
    if (titleMatch) {
      const extracted = this.normalizeRegionName(titleMatch[1])
      if (extracted !== '전국') {
        return extracted
      }
    }

    // 우선순위 3: 제목에서 지역명 직접 찾기
    const regionFromTitle = this.extractRegionFromText(item.pblancNm || '')
    if (regionFromTitle !== '전국') {
      return regionFromTitle
    }

    // 우선순위 4: 기관명에서 지역 추출
    const regionFromInstitution = this.extractRegionFromText(item.jrsdInsttNm || '')
    if (regionFromInstitution !== '전국') {
      return regionFromInstitution
    }

    return '전국'
  }

  // 텍스트에서 지역 추출
  private extractRegionFromText(text: string): string {
    const regions = [
      '서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종',
      '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'
    ]

    for (const region of regions) {
      if (text.includes(region)) {
        return region
      }
    }

    return '전국'
  }

  // 지역명 정규화
  private normalizeRegionName(name: string): string {
    const regionMap: Record<string, string> = {
      '서울특별시': '서울',
      '부산광역시': '부산',
      '대구광역시': '대구',
      '인천광역시': '인천',
      '광주광역시': '광주',
      '대전광역시': '대전',
      '울산광역시': '울산',
      '세종특별자치시': '세종',
      '경기도': '경기',
      '강원도': '강원',
      '강원특별자치도': '강원',
      '충청북도': '충북',
      '충청남도': '충남',
      '전라북도': '전북',
      '전북특별자치도': '전북',
      '전라남도': '전남',
      '경상북도': '경북',
      '경상남도': '경남',
      '제주특별자치도': '제주',
      '제주도': '제주'
    }

    return regionMap[name] || name
  }

  // 사업자 유형 추출
  private extractBusinessType(item: BizinfoAPIResponse): string {
    const target = item.trgetNm || ''

    if (target.includes('소상공인')) return '소상공인'
    if (target.includes('중소기업')) return '중소기업'
    if (target.includes('중견기업')) return '중견기업'
    if (target.includes('스타트업') || target.includes('창업')) return '스타트업'
    if (target.includes('예비창업')) return '예비창업자'

    return '기타'
  }
}

// 편의 함수들 (이전 호환성 유지)
export async function fetchBizinfoData(_params: any = {}): Promise<BizinfoAPIResponse[]> {
  const source = new BizinfoSource()
  const result = await source.processData()
  return result.data.map(item => item.raw_data)
}

// 배치 데이터 동기화
export async function syncBizinfoData(): Promise<number> {
  try {
    console.log('🔄 Bizinfo 데이터 동기화 시작...')

    const source = new BizinfoSource()
    const result = await source.processData()

    if (result.success) {
      console.log(`✅ Bizinfo에서 ${result.count}개 데이터 처리 완료`)
      return result.count
    } else {
      throw new Error(result.error || '데이터 처리 실패')
    }
  } catch (error) {
    console.error('❌ Bizinfo 동기화 실패:', error)
    throw error
  }
}