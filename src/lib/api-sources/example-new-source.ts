/**
 * 새로운 API 소스 예시 템플릿
 * 새로운 정부지원사업 API를 추가할 때 이 템플릿을 참고하여 구현
 */

import { BaseApiSource, ApiSourceConfig, StandardizedSupport } from './base-api-source'

// 예시: 기업마당 API 또는 다른 정부 API
export class ExampleNewSource extends BaseApiSource {
  constructor() {
    const config: ApiSourceConfig = {
      name: '새로운API소스',
      source_id: 'example_new_api',
      base_url: process.env.NEW_API_BASE_URL || 'https://api.example.gov.kr',
      api_key: process.env.NEW_API_KEY || 'your_api_key',
      rate_limit_ms: 200, // 더 보수적인 rate limiting
      max_pages: 5,
      items_per_page: 50,
      timeout_ms: 30000
    }
    super(config)
  }

  // 1. Raw 데이터 가져오기 (각 API의 고유 구조에 맞게 구현)
  async fetchRawData(): Promise<any[]> {
    try {
      const allItems: any[] = []

      this.log('FETCH_EXTERNAL', 'success', `${this.config.name} API 호출 시작`)

      for (let page = 1; page <= this.config.max_pages; page++) {
        try {
          // 새로운 API의 파라미터 구조에 맞게 수정
          const params = new URLSearchParams({
            apiKey: this.config.api_key!,
            pageNo: page.toString(),
            numOfRows: this.config.items_per_page.toString(),
            type: 'json'
          })

          const url = `${this.config.base_url}/api/supports?${params.toString()}`

          const response = await fetch(url, {
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

          // 새로운 API의 응답 구조에 맞게 수정
          if (data.response?.body?.items) {
            allItems.push(...data.response.body.items)
            this.log('FETCH_EXTERNAL', 'success', `페이지 ${page}: ${data.response.body.items.length}개 수집`)
          }

          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, this.config.rate_limit_ms))

        } catch (error) {
          this.log('FETCH_EXTERNAL', 'warning', `페이지 ${page} 요청 실패`, error)
          continue
        }
      }

      this.log('FETCH_EXTERNAL', 'success', `총 ${allItems.length}개 항목 수집 완료`)
      return allItems

    } catch (error) {
      this.log('FETCH_EXTERNAL', 'error', `${this.config.name} API 호출 실패`, error)
      throw error
    }
  }

  // 2. 데이터 변환 (새로운 API 구조 → 표준화된 구조)
  transformData(rawData: any[]): StandardizedSupport[] {
    try {
      const transformed = rawData.map(item => {
        return {
          // 새로운 API의 ID 필드에 맞게 수정
          subvention_id: item.supportId || item.id || `${this.config.source_id}_${item.seq}`,

          // 새로운 API의 필드명에 맞게 매핑
          title: item.supportName || item.title || '',
          region: this.extractRegion(
            item.supportName || '',
            item.tags || '',
            item.hostOrganization || ''
          ),
          host_institution: item.hostOrganization || item.agency || '',
          support_method: item.supportType || item.method || '확인 필요',
          support_amount: item.supportAmount || item.budget || '확인 필요',
          interest_rate: item.interestRate || '확인 필요',
          application_deadline: this.parseDate(item.deadline) || '확인 필요',
          application_method: item.applicationMethod || '온라인접수',
          announcement_url: item.detailUrl || item.link || '',
          source: this.config.name,
          attachment_files: item.attachments || '없음',
          business_type_code: item.targetBusiness || '전체',
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

  // 3. 고유 ID 추출 (중복 체크에 사용)
  getUniqueIds(items: StandardizedSupport[]): string[] {
    return items.map(item => item.subvention_id).filter(Boolean)
  }

  // 4. 필요시 추가 커스텀 로직 구현 가능
  // protected customValidation(item: any): boolean {
  //   // 이 API만의 특별한 유효성 검사 로직
  //   return true
  // }
}

// 사용 예시:
/*
// API 소스 등록
const manager = new ApiSourceManager()
manager.registerSource(new ExampleNewSource(), 'example_new_api')

// 데이터 처리
const result = await manager.processSource('example_new_api')
if (result.success) {
  console.log(`새로운 API에서 ${result.count}개 데이터 처리 완료`)
}
*/