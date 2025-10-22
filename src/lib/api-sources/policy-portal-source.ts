/**
 * 정책정보포털 API 소스
 * BaseApiSource를 상속받아 정책정보포털 특화 로직 구현
 */

import { BaseApiSource, ApiSourceConfig, StandardizedSupport } from './base-api-source'

export class PolicyPortalSource extends BaseApiSource {
  constructor() {
    const config: ApiSourceConfig = {
      name: '정책정보포털',
      source_id: 'policy_portal',
      base_url: process.env.POLICY_API_BASE_URL || 'http://X.X.X.X:X/test',
      api_key: process.env.POLICY_API_KEY || 'f0K6CT',
      rate_limit_ms: 100,
      max_pages: 10,
      items_per_page: 100,
      timeout_ms: 30000
    }
    super(config)
  }

  async fetchRawData(): Promise<any[]> {
    try {
      const allItems: any[] = []

      this.log('FETCH_EXTERNAL', 'success', `${this.config.name} API 호출 시작 (최대 ${this.config.max_pages}페이지)`)

      for (let page = 1; page <= this.config.max_pages; page++) {
        const params = new URLSearchParams({
          crtfcKey: this.config.api_key!,
          dataType: 'json',
          searchCnt: this.config.items_per_page.toString(),
          pageIndex: page.toString(),
          pageUnit: this.config.items_per_page.toString()
        })

        // 다양한 분야의 데이터 수집
        const categories = ['01', '02', '03', '04', '05', '06', '07', '09']

        for (const category of categories) {
          try {
            const categoryParams = new URLSearchParams(params)
            categoryParams.set('searchLclasId', category)

            const url = `${this.config.base_url}?${categoryParams.toString()}`

            this.log('FETCH_EXTERNAL', 'success', `API 요청: 페이지 ${page}, 분야 ${category}`)

            const response = await fetch(url, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'OwnersFinsupport/1.0'
              },
              signal: AbortSignal.timeout(this.config.timeout_ms)
            })

            if (!response.ok) {
              this.log('FETCH_EXTERNAL', 'warning', `API 요청 실패: ${response.status} ${response.statusText}`)
              continue
            }

            const data = await response.json()

            if (data.jsonArray && Array.isArray(data.jsonArray)) {
              allItems.push(...data.jsonArray)
              this.log('FETCH_EXTERNAL', 'success', `분야 ${category}: ${data.jsonArray.length}개 항목 수집`)
            }

            // Rate limiting
            await new Promise(resolve => setTimeout(resolve, this.config.rate_limit_ms))

          } catch (error) {
            this.log('FETCH_EXTERNAL', 'warning', `분야 ${category} 요청 실패`, error)
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

  transformData(rawData: any[]): StandardizedSupport[] {
    try {
      const transformed = rawData.map(item => {
        return {
          subvention_id: item.seq || item.pblancId,
          title: item.title || item.pblancNm || '',
          region: this.extractRegion(
            item.title || item.pblancNm || '',
            item.hashtags || '',
            item.jrsdInsttNm || ''
          ),
          host_institution: item.author || item.jrsdInsttNm || '',
          support_method: item.pldirSportRealmMlsfcCodeNm || item.lcategory || '기타',
          support_amount: '확인 필요',
          interest_rate: '확인 필요',
          application_deadline: item.reqstBeginEndDe || this.parseApplicationPeriod(item.reqstDt) || '확인 필요',
          application_method: item.reqstMthPapersCn || '온라인접수',
          announcement_url: item.link || item.pblancUrl || '',
          source: this.config.name,
          attachment_files: item.fileNm || item.printFileNm || '없음',
          business_type_code: item.trgetNm || '전체',
          status: 'active' as const,
          api_source: this.config.source_id,
          api_last_updated_at: new Date().toISOString(),
          raw_data: item
        }
      }).filter(item => item.subvention_id) // ID가 없는 항목 제외

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
}