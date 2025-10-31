/**
 * K-Startup 데이터 동기화 유틸리티
 * 창업진흥원 API에서 데이터를 가져와 데이터베이스에 저장하는 기능
 */

import { createClient } from '@supabase/supabase-js'
import { decodeTitle, decodeDescription, decodeHtmlEntities } from './html-decoder'

// Service role client for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// 로그 타입 정의
interface SyncLog {
  timestamp: string
  action: string
  status: 'success' | 'error' | 'warning'
  message: string
  details?: any
}

// K-Startup API 항목 타입 정의
interface KStartupItem {
  id?: string
  rcrt_prgs_yn?: string              // 모집 진행 여부
  aply_trgt?: string                 // 신청 대상
  biz_enyy?: string                  // 사업 시행년도
  biz_trgt_age?: string              // 사업 대상 연령
  prfn_matr?: string                 // 우대 사항
  intg_pbanc_yn?: string             // 통합 공고 여부
  biz_pbanc_nm?: string              // 사업 공고명
  intg_pbanc_biz_nm?: string         // 통합 공고 사업명
  pbanc_ctnt?: string                // 공고 내용
  supt_biz_clsfc?: string            // 지원 사업 분류
  aply_trgt_ctnt?: string            // 신청 대상 내용
  supt_regin?: string                // 지원 지역
  pbanc_rcpt_bgng_dt?: string        // 공고 접수 시작일
  pbanc_rcpt_end_dt?: string         // 공고 접수 종료일
  pbanc_ntrp_nm?: string             // 공고 기업명
  sprv_inst?: string                 // 주관 기관
  biz_prch_dprt_nm?: string          // 사업 담당 부서명
  biz_gdnc_url?: string              // 사업 안내 URL
  biz_aply_url?: string              // 사업 신청 URL
  prch_cnpl_no?: string              // 담당자 연락처
  detl_pg_url?: string               // 상세 페이지 URL
  aply_mthd_vst_rcpt_istc?: string   // 신청방법 - 방문접수
  aply_mthd_pssr_rcpt_istc?: string  // 신청방법 - 우편접수
  aply_mthd_fax_rcpt_istc?: string   // 신청방법 - 팩스접수
  aply_mthd_onli_rcpt_istc?: string  // 신청방법 - 온라인접수
  aply_mthd_etc_istc?: string        // 신청방법 - 기타
  aply_mthd_eml_rcpt_istc?: string   // 신청방법 - 이메일접수
  aply_excl_trgt_ctnt?: string       // 신청 제외 대상 내용
  pbanc_sn?: string                  // 공고 일련번호
}

class KStartupSyncService {
  private logs: SyncLog[] = []
  private apiKey = process.env.KSTARTUP_API_KEY || 'e224416b40e2d82716c0b11880f8a396c50a48b0f6b19f7a9f90a0180d141b06'
  private baseUrl = process.env.KSTARTUP_API_BASE_URL || 'https://apis.data.go.kr/B552735'

  private log(action: string, status: SyncLog['status'], message: string, details?: any) {
    const logEntry: SyncLog = {
      timestamp: new Date().toISOString(),
      action,
      status,
      message,
      details
    }
    this.logs.push(logEntry)
    console.log(`[${status.toUpperCase()}] ${action}: ${message}`, details || '')
  }

  // HTML 엔티티 디코딩 함수
  private decodeHtmlEntities(text: string): string {
    if (!text) return text

    return text
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'")
      .replace(/&#x2F;/g, '/')
      .replace(/&#39;/g, "'")
  }

  // XML 파싱 헬퍼 함수
  private parseXMLItem(itemStr: string): KStartupItem {
    const item: KStartupItem = {}

    // <col name="속성명">값</col> 형식 파싱
    const colRegex = /<col\s+name="([^"]+)">([^<]*)<\/col>/g
    let match

    while ((match = colRegex.exec(itemStr)) !== null) {
      const [, key, value] = match
      item[key as keyof KStartupItem] = value || undefined
    }

    return item
  }

  private async fetchFromKStartupAPI(): Promise<KStartupItem[]> {
    try {
      const allItems: KStartupItem[] = []
      let page = 1
      let maxPages = 1000 // 전체 데이터 수집을 위해 1000페이지까지

      this.log('FETCH_EXTERNAL', 'success', `K-Startup API 호출 시작 (전체 데이터 수집)`)

      // K-Startup API 엔드포인트 - 사용자가 확인한 정확한 경로 및 파라미터
      const endpoint = '/kisedKstartupService01/getAnnouncementInformation01'

      try {
        let seenIds = new Set<string>() // 중복 감지용
        let consecutiveDuplicatePages = 0 // 연속된 중복 페이지 수
        let lastItemsHash = '' // 이전 페이지 아이템들의 해시

        for (let currentPage = page; currentPage <= maxPages; currentPage++) {
          // 사용자가 제공한 실제 작동하는 API 파라미터 사용
          const params = new URLSearchParams({
            serviceKey: this.apiKey,
            perPage: '30', // 페이지당 30개 (사용자 확인)
            page: currentPage.toString() // 페이지 번호 (사용자 확인)
          })

          const url = `${this.baseUrl}${endpoint}?${params.toString()}`

          this.log('FETCH_EXTERNAL', 'success', `API 요청: 페이지 ${currentPage}`)
          console.log('🌐 K-Startup API 호출:', url.substring(0, 150) + '...')

          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Accept': 'application/xml, application/json',
              'User-Agent': 'OwnersFinsupport/1.0'
            }
          })

          console.log('🌐 API 응답 상태:', response.status, response.statusText)

          if (!response.ok) {
            this.log('FETCH_EXTERNAL', 'warning', `API 요청 실패: ${response.status} ${response.statusText}`)
            continue
          }

          const text = await response.text()

          // XML 응답 파싱
          if (text.includes('<results>')) {
            // totalCount 추출 시도 (API가 제공하지 않을 수 있음)
            const totalMatch = text.match(/<totalCount>(\d+)<\/totalCount>/)
            const totalCount = totalMatch ? parseInt(totalMatch[1]) : null

            if (totalCount) {
              console.log('🌐 전체 데이터 수:', totalCount)
              // 첫 번째 페이지에서만 maxPages 조정
              if (currentPage === 1) {
                const requiredPages = Math.ceil(totalCount / 30)
                maxPages = Math.min(requiredPages, 1000) // 최대 1000페이지로 제한
                console.log('🌐 수집할 페이지 수:', maxPages)
              }
            } else {
              // totalCount가 없는 경우 충분한 페이지 수로 설정
              if (currentPage === 1) {
                maxPages = 1000 // 충분히 큰 수로 설정 (빈 페이지 감지로 중단)
                console.log('🌐 totalCount 없음: 빈 페이지까지 수집 예정')
              }
            }

            // item들 추출
            const itemRegex = /<item>([\s\S]*?)<\/item>/g
            let itemMatch
            let pageItems = 0
            let pageItemIds: string[] = []

            while ((itemMatch = itemRegex.exec(text)) !== null) {
              const item = this.parseXMLItem(itemMatch[1])
              if (item.pbanc_sn) {
                pageItemIds.push(item.pbanc_sn)

                // 중복 검사: 이미 수집된 ID가 아닌 경우에만 추가
                if (!seenIds.has(item.pbanc_sn)) {
                  seenIds.add(item.pbanc_sn)
                  allItems.push(item)
                  pageItems++
                }
              }
            }

            // 현재 페이지 아이템들의 해시 생성 (중복 페이지 감지용)
            const currentItemsHash = pageItemIds.sort().join(',')

            // 동일한 아이템들이 반복되는지 확인
            if (currentItemsHash === lastItemsHash && currentItemsHash !== '') {
              consecutiveDuplicatePages++
              this.log('FETCH_EXTERNAL', 'warning', `페이지 ${currentPage}: 이전 페이지와 동일한 데이터 감지 (연속 ${consecutiveDuplicatePages}회)`)

              // 5번 연속으로 같은 데이터가 나오면 페이지네이션이 작동하지 않는다고 판단
              if (consecutiveDuplicatePages >= 5) {
                this.log('FETCH_EXTERNAL', 'warning', `API 페이지네이션이 작동하지 않음을 감지하여 수집을 중단합니다.`)
                console.log('🚨 K-Startup API는 페이지네이션을 지원하지 않는 것으로 보입니다.')
                break
              }
            } else {
              consecutiveDuplicatePages = 0
              lastItemsHash = currentItemsHash
            }

            this.log('FETCH_EXTERNAL', 'success', `페이지 ${currentPage}/${maxPages}: ${pageItems}개 신규 항목 수집`)
            console.log(`🌐 진행상황: ${currentPage}/${maxPages} 페이지 (${((currentPage/maxPages)*100).toFixed(1)}%)`)
            console.log('🌐 현재까지 수집된 고유 항목 수:', allItems.length)

            // 100페이지마다 중간 진행상황 로그
            if (currentPage % 100 === 0) {
              console.log(`📊 중간 리포트: ${currentPage}페이지 완료, 총 ${allItems.length}개 고유 데이터 수집`)
            }

            // 더 이상 데이터가 없으면 중단
            if (pageItems === 0 && currentPage > 1) {
              console.log('🌐 신규 데이터가 없어 수집을 중단합니다.')
              break
            }
          } else {
            console.log('🌐 예상과 다른 응답 형식:', text.substring(0, 200))
            break
          }

          // API 호출 간격 조절 (Rate limiting 방지) - 테스트용 짧은 간격
          await new Promise(resolve => setTimeout(resolve, 50))
        }
      } catch (error) {
        this.log('FETCH_EXTERNAL', 'warning', `API 요청 실패`, error)
      }

      console.log('🔍 수집된 총 항목 수:', allItems.length)

      // 이미 중복 제거가 완료된 상태이므로 추가 검증만 수행
      const validItems = allItems.filter(item => item.pbanc_sn) // ID가 있는 항목만

      console.log('🔍 유효한 ID를 가진 항목 수:', validItems.length)

      if (validItems.length !== allItems.length) {
        this.log('FETCH_EXTERNAL', 'warning', `${allItems.length - validItems.length}개 항목에 ID가 없어 제외됨`)
      }

      this.log('FETCH_EXTERNAL', 'success', `총 ${validItems.length}개 고유 항목 수집 완료`)
      return validItems

    } catch (error) {
      this.log('FETCH_EXTERNAL', 'error', 'K-Startup API 호출 실패', error)
      throw error
    }
  }

  private transformData(rawData: KStartupItem[]) {
    try {
      // 테스트용: 2025년 데이터만 필터링
      const filteredData = rawData.filter(item => {
        const bgngDate = item.pbanc_rcpt_bgng_dt || item.pbanc_reg_dt
        if (!bgngDate || bgngDate.length !== 8) return false
        const year = bgngDate.slice(0, 4)
        return year === '2025'
      })

      console.log(`🗓️ 전체 데이터: ${rawData.length}개, 2025년 데이터: ${filteredData.length}개`)

      const transformed = filteredData.map(item => {
        // 신청 기간 파싱 (YYYYMMDD를 YYYY-MM-DD로 변환)
        const formatDate = (dateStr?: string) => {
          if (!dateStr || dateStr.length !== 8) return null
          return `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`
        }

        const startDate = formatDate(item.pbanc_rcpt_bgng_dt)
        const endDate = formatDate(item.pbanc_rcpt_end_dt)
        const applicationDeadline = startDate && endDate
          ? `${startDate} ~ ${endDate}`
          : '확인 필요'

        // 지역 정보 추출
        const extractRegion = (region?: string, institution?: string) => {
          if (!region) return '전국'

          const regions = ['서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종',
                          '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주']

          // 지역 정보에서 첫 번째 매칭되는 지역 찾기
          for (const r of regions) {
            if (region.includes(r)) return r
          }

          // 기관명에서 지역 찾기
          if (institution) {
            for (const r of regions) {
              if (institution.includes(r)) return r
            }
          }

          return region === '전국' ? '전국' : region
        }

        // 신청 방법 문자열 생성
        const applicationMethods = []
        if (item.aply_mthd_onli_rcpt_istc) {
          // URL이 포함되어 있으면 온라인접수로 처리
          applicationMethods.push('온라인접수')
        }
        if (item.aply_mthd_vst_rcpt_istc) applicationMethods.push('방문접수')
        if (item.aply_mthd_pssr_rcpt_istc) applicationMethods.push('우편접수')
        if (item.aply_mthd_fax_rcpt_istc) applicationMethods.push('팩스접수')
        if (item.aply_mthd_eml_rcpt_istc) applicationMethods.push('이메일접수')
        if (item.aply_mthd_etc_istc) applicationMethods.push('기타')

        const applicationMethod = applicationMethods.length > 0
          ? applicationMethods.join(', ')
          : '온라인접수'

        // 지원 방식 분류
        const classifySupportMethod = (classification?: string, content?: string) => {
          if (!classification && !content) return '기타'

          const text = `${classification || ''} ${content || ''}`.toLowerCase()

          if (text.includes('보조금') || text.includes('지원금') || text.includes('보조')) {
            return '보조금'
          } else if (text.includes('융자') || text.includes('대출')) {
            return '융자'
          } else if (text.includes('투자') || text.includes('펀드')) {
            return '투자'
          } else if (text.includes('바우처') || text.includes('이용권')) {
            return '바우처'
          } else if (text.includes('세제') || text.includes('세금') || text.includes('감면')) {
            return '세제혜택'
          } else if (text.includes('판로') || text.includes('마케팅') || text.includes('홍보')) {
            return '판로/마케팅'
          } else if (text.includes('교육') || text.includes('컨설팅') || text.includes('멘토링')) {
            return '교육/컨설팅'
          } else if (text.includes('시설') || text.includes('공간') || text.includes('보육')) {
            return '시설/공간'
          } else if (text.includes('인증') || text.includes('인력') || text.includes('고용')) {
            return '인력지원'
          } else if (text.includes('행사') || text.includes('네트워크')) {
            return '행사/네트워크'
          }

          return '기타'
        }

        return {
          subvention_id: `kstartup_${item.pbanc_sn || Date.now()}`,
          title: decodeTitle(item.biz_pbanc_nm || item.intg_pbanc_biz_nm || '제목 없음'),
          region: extractRegion(item.supt_regin, item.sprv_inst),
          host_institution: decodeHtmlEntities(item.sprv_inst || item.pbanc_ntrp_nm || '확인 필요'),
          support_method: decodeHtmlEntities(classifySupportMethod(item.supt_biz_clsfc, item.pbanc_ctnt)),
          support_amount: '확인 필요', // API에서 직접 제공되지 않음
          interest_rate: '해당없음', // 창업지원사업은 대부분 무이자
          application_deadline: applicationDeadline,
          application_method: decodeDescription(applicationMethod),
          announcement_url: decodeHtmlEntities(item.detl_pg_url || item.biz_gdnc_url || item.biz_aply_url || ''),
          source: 'K-Startup',
          attachment_files: '없음', // API에서 제공되지 않음
          business_type_code: decodeHtmlEntities(item.aply_trgt || '창업기업'),
          status: item.rcrt_prgs_yn === 'Y' ? 'active' : 'inactive',
          api_source: 'kstartup',
          api_last_updated_at: new Date().toISOString(),
          raw_data: {
            ...item,
            enyy: item.biz_enyy,
            target_age: item.biz_trgt_age,
            preference: item.prfn_matr,
            target_content: item.aply_trgt_ctnt,
            exclude_target: item.aply_excl_trgt_ctnt,
            department: item.biz_prch_dprt_nm,
            contact: item.prch_cnpl_no,
            is_recruiting: item.rcrt_prgs_yn
          }
        }
      })

      this.log('TRANSFORM_DATA', 'success', `${transformed.length}개 항목 변환 완료`)
      return transformed
    } catch (error) {
      this.log('TRANSFORM_DATA', 'error', '데이터 변환 실패', error)
      throw error
    }
  }

  private async updateDatabase(data: any[], mode: 'replace' | 'upsert' = 'upsert') {
    try {
      if (mode === 'upsert') {
        // Upsert 모드: 데이터 보존하면서 상태 업데이트
        if (data.length > 0) {
          // 1. 현재 API 데이터의 ID 목록 추출
          const currentIds = data.map(item => item.subvention_id).filter(Boolean)

          if (currentIds.length > 0) {
            // 2. DB에는 있지만 API에 없는 항목들을 inactive로 변경
            const { error: updateError } = await supabaseAdmin
              .from('government_supports')
              .update({
                status: 'inactive',
                api_last_updated_at: new Date().toISOString()
              })
              .not('subvention_id', 'in', `(${currentIds.map(id => `'${id}'`).join(',')})`)
              .eq('status', 'active')
              .eq('api_source', 'kstartup') // K-Startup 소스만 처리

            if (updateError) {
              this.log('UPDATE_DATABASE', 'warning', `기존 데이터 비활성화 실패: ${updateError.message}`)
            } else {
              this.log('UPDATE_DATABASE', 'success', 'API에서 사라진 데이터를 비활성화 처리 완료')
            }
          }
        }
      }

      if (data.length > 0) {
        // 새 데이터 저장 - upsert
        const batchSize = 50 // K-Startup은 데이터가 적으므로 배치 크기 축소
        let processedCount = 0

        for (let i = 0; i < data.length; i += batchSize) {
          const batch = data.slice(i, i + batchSize)

          // Upsert: 있으면 업데이트, 없으면 삽입
          for (const item of batch) {
            try {
              const { error: upsertError } = await supabaseAdmin
                .from('government_supports')
                .upsert(item, {
                  onConflict: 'subvention_id',
                  ignoreDuplicates: false
                })

              if (!upsertError) {
                processedCount++
              } else {
                this.log('UPDATE_DATABASE', 'warning', `개별 upsert 실패: ${item.subvention_id}`, upsertError.message)
              }
            } catch (e) {
              this.log('UPDATE_DATABASE', 'warning', `개별 항목 처리 실패: ${item.subvention_id}`, e)
            }
          }
        }

        this.log('UPDATE_DATABASE', 'success', `${processedCount}개 항목 upsert 완료`)
        return processedCount
      } else {
        this.log('UPDATE_DATABASE', 'warning', '저장할 데이터가 없습니다.')
        return 0
      }
    } catch (error) {
      this.log('UPDATE_DATABASE', 'error', '데이터베이스 업데이트 실패', error)
      throw error
    }
  }

  async syncData(options: {
    mode?: 'replace' | 'upsert'
    dryRun?: boolean
  } = {}) {
    const { mode = 'upsert', dryRun = false } = options

    try {
      this.log('SYNC_START', 'success', `K-Startup 동기화 시작 (모드: ${mode}, 드라이런: ${dryRun})`)

      // 1. K-Startup API에서 데이터 가져오기
      const externalData = await this.fetchFromKStartupAPI()

      // 2. 데이터 변환
      const transformedData = this.transformData(externalData)

      // 3. 데이터베이스 업데이트 (드라이런이 아닌 경우에만)
      let savedCount = 0
      if (!dryRun) {
        savedCount = await this.updateDatabase(transformedData, mode)
      } else {
        this.log('SYNC_DRYRUN', 'success', `드라이런: ${transformedData.length}개 항목이 처리될 예정`)
        savedCount = transformedData.length
      }

      this.log('SYNC_COMPLETE', 'success', `K-Startup 동기화 완료: ${savedCount}개 항목 처리`)

      return {
        success: true,
        count: savedCount,
        logs: this.logs
      }

    } catch (error) {
      this.log('SYNC_ERROR', 'error', 'K-Startup 동기화 실패', error)

      return {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        logs: this.logs
      }
    }
  }

  async getStats() {
    try {
      const { error, count } = await supabaseAdmin
        .from('government_supports')
        .select('*', { count: 'exact', head: true })
        .eq('api_source', 'kstartup')

      if (error) throw error

      const { data: lastUpdated } = await supabaseAdmin
        .from('government_supports')
        .select('api_last_updated_at')
        .eq('api_source', 'kstartup')
        .order('api_last_updated_at', { ascending: false })
        .limit(1)
        .single()

      return {
        total_count: count || 0,
        last_updated: lastUpdated?.api_last_updated_at || null
      }
    } catch (error) {
      this.log('GET_STATS', 'error', '통계 조회 실패', error)
      throw error
    }
  }

  getLogs() {
    return this.logs
  }

  clearLogs() {
    this.logs = []
  }
}

// 싱글톤 인스턴스 생성
export const kStartupSyncService = new KStartupSyncService()

// 편의 함수들
export async function syncKStartupSupports(options?: {
  mode?: 'replace' | 'upsert'
  dryRun?: boolean
}) {
  return await kStartupSyncService.syncData(options)
}

export async function getKStartupSupportStats() {
  return await kStartupSyncService.getStats()
}

// 스케줄링을 위한 함수 (cron job에서 사용)
export async function scheduledKStartupSync() {
  console.log('K-Startup 데이터 정기 동기화 시작...')

  const result = await syncKStartupSupports({
    mode: 'upsert', // K-Startup은 upsert 모드 권장 (데이터 보존)
    dryRun: false
  })

  if (result.success) {
    console.log(`K-Startup 정기 동기화 완료: ${result.count}개 항목 처리`)
  } else {
    console.error('K-Startup 정기 동기화 실패:', result.error)
  }

  return result
}