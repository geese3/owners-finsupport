/**
 * 정부지원사업 데이터 동기화 유틸리티
 * 외부 API에서 데이터를 가져와 데이터베이스에 저장하는 기능
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

class GovernmentSupportSyncService {
  private logs: SyncLog[] = []

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

  private async fetchFromPolicyAPI(): Promise<any[]> {
    try {
      const API_KEY = process.env.POLICY_API_KEY || 'f0K6CT'
      const BASE_URL = process.env.POLICY_API_BASE_URL || 'http://X.X.X.X:X/test'

      // 여러 페이지에서 데이터 수집
      const allItems: any[] = []
      let pageIndex = 1
      const maxPages = 10 // 최대 10페이지까지 수집

      this.log('FETCH_EXTERNAL', 'success', `정책정보포털 API 호출 시작 (최대 ${maxPages}페이지)`)

      for (let page = pageIndex; page <= maxPages; page++) {
        const params = new URLSearchParams({
          crtfcKey: API_KEY,
          dataType: 'json',
          searchCnt: '100', // 한 번에 100개씩
          pageIndex: page.toString(),
          pageUnit: '100'
        })

        // 다양한 분야의 데이터 수집을 위해 분야별로 요청
        const categories = ['01', '02', '03', '04', '05', '06', '07', '09'] // 금융, 기술, 인력, 수출, 내수, 창업, 경영, 기타

        for (const category of categories) {
          try {
            const categoryParams = new URLSearchParams(params)
            categoryParams.set('searchLclasId', category)

            const url = `${BASE_URL}?${categoryParams.toString()}`

            this.log('FETCH_EXTERNAL', 'success', `API 요청: 페이지 ${page}, 분야 ${category}`)
            console.log('🌐 정책정보포털 API 호출:', url)

            const response = await fetch(url, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'OwnersFinsupport/1.0'
              }
            })

            console.log('🌐 API 응답 상태:', response.status, response.statusText)

            if (!response.ok) {
              this.log('FETCH_EXTERNAL', 'warning', `API 요청 실패: ${response.status} ${response.statusText}`)
              continue
            }

            const data = await response.json()
            console.log('🌐 API 응답 데이터 구조:', Object.keys(data))

            if (data.jsonArray && Array.isArray(data.jsonArray)) {
              allItems.push(...data.jsonArray)
              this.log('FETCH_EXTERNAL', 'success', `분야 ${category}: ${data.jsonArray.length}개 항목 수집`)
              console.log('🌐 수집된 항목 수:', data.jsonArray.length)

              // 첫 번째 항목의 구조를 확인 (디버깅용)
              if (data.jsonArray.length > 0 && allItems.length === data.jsonArray.length) {
                console.log('🔍 첫 번째 항목 구조:', Object.keys(data.jsonArray[0]))
                console.log('🔍 샘플 데이터:', data.jsonArray[0])
              }
            } else {
              console.log('🌐 예상과 다른 응답 구조:', data)
            }

            // API 호출 간격 조절 (Rate limiting 방지)
            await new Promise(resolve => setTimeout(resolve, 100))

          } catch (error) {
            this.log('FETCH_EXTERNAL', 'warning', `분야 ${category} 요청 실패`, error)
            continue
          }
        }
      }

      console.log('🔍 중복 제거 전 총 항목 수:', allItems.length)

      // 첫 번째 항목의 구조를 확인
      if (allItems.length > 0) {
        console.log('🔍 첫 번째 항목 구조:', Object.keys(allItems[0]))
        console.log('🔍 첫 번째 항목 샘플:', allItems[0])
      }

      // 중복 제거 전에 중복 키 분석
      const seqCounts = allItems.reduce((acc: { [key: string]: number }, item) => {
        const key = item.seq || item.pblancId || 'NO_ID'
        acc[key] = (acc[key] || 0) + 1
        return acc
      }, {})

      const duplicates = Object.entries(seqCounts).filter(([, count]) => (count as number) > 1)
      console.log('🔍 중복 ID 개수:', duplicates.length)
      console.log('🔍 중복 예시:', duplicates.slice(0, 3))

      // 중복 제거 (seq 또는 pblancId 기준)
      const uniqueItems = allItems.filter((item, index, arr) => {
        const currentId = item.seq || item.pblancId
        if (!currentId) return false // ID가 없는 항목은 제외
        return arr.findIndex(i => (i.seq || i.pblancId) === currentId) === index
      })

      console.log('🔍 중복 제거 후 고유 항목 수:', uniqueItems.length)
      this.log('FETCH_EXTERNAL', 'success', `총 ${uniqueItems.length}개 고유 항목 수집 완료`)
      return uniqueItems

    } catch (error) {
      this.log('FETCH_EXTERNAL', 'error', '정책정보포털 API 호출 실패', error)
      throw error
    }
  }

  private transformData(rawData: any[]) {
    try {
      const transformed = rawData.map(item => {
        // HTML 태그 제거 함수 (현재 사용하지 않지만 향후 필요시 사용)
        // const stripHtml = (html: string) => {
        //   if (!html) return '';
        //   return html.replace(/<[^>]*>/g, '').trim();
        // }

        // 신청기간 파싱 (20220727 ~ 20220930 형식)
        const parseApplicationPeriod = (reqstDt: string) => {
          if (!reqstDt) return '';
          const match = reqstDt.match(/(\d{8})\s*~\s*(\d{8})/);
          if (match) {
            const startDate = match[1];
            const endDate = match[2];
            // YYYYMMDD를 YYYY-MM-DD로 변환
            const formatDate = (dateStr: string) => {
              return `${dateStr.slice(0,4)}-${dateStr.slice(4,6)}-${dateStr.slice(6,8)}`;
            }
            return `${formatDate(startDate)} ~ ${formatDate(endDate)}`;
          }
          return reqstDt;
        }

        // 지역 정보 추출 (개선된 로직)
        const extractRegion = (title: string, hashTags: string, jrsdInsttNm: string) => {
          const regions = ['서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종',
                          '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'];

          // 1순위: 제목에서 [지역] 패턴 추출
          if (title) {
            const titleRegionMatch = title.match(/\[([^\]]+)\]/);
            if (titleRegionMatch) {
              const extractedRegion = titleRegionMatch[1];
              // 추출된 지역이 실제 지역명인지 확인
              for (const region of regions) {
                if (extractedRegion.includes(region)) {
                  return region;
                }
              }
            }
          }

          // 2순위: 관할기관명에서 지역 추출
          if (jrsdInsttNm) {
            for (const region of regions) {
              if (jrsdInsttNm.includes(region)) {
                // 관할기관이 해당 지역 기관인 경우, 해당 지역으로 설정
                return region;
              }
            }
          }

          // 3순위: 해시태그에서 지역 추출 (단, 모든 지역이 포함된 경우 제외)
          if (hashTags) {
            const foundRegions = regions.filter(region => hashTags.includes(region));

            // 모든 지역이 포함되어 있으면 전국 사업으로 간주
            if (foundRegions.length >= 10) {
              return '전국';
            }

            // 3개 이하의 특정 지역만 포함되어 있으면 첫 번째 지역 반환
            if (foundRegions.length > 0 && foundRegions.length <= 3) {
              return foundRegions[0];
            }
          }

          // 4순위: 관할기관명이 중앙부처인지 확인
          if (jrsdInsttNm) {
            const centralAgencies = ['중소벤처기업부', '산업통상자원부', '기획재정부', '국토교통부',
                                   '문화체육관광부', '농림축산식품부', '해양수산부', '과학기술정보통신부',
                                   '보건복지부', '환경부', '고용노동부', '여성가족부', '특허청',
                                   '중소기업기술정보진흥원', '한국산업기술진흥원'];

            for (const agency of centralAgencies) {
              if (jrsdInsttNm.includes(agency)) {
                return '전국';
              }
            }
          }

          // 기본값: 전국
          return '전국';
        }

        return {
          subvention_id: item.seq || item.pblancId,
          title: decodeTitle(item.title || item.pblancNm || ''),
          region: extractRegion(item.title || item.pblancNm || '', item.hashtags || '', item.jrsdInsttNm || ''),
          host_institution: decodeHtmlEntities(item.author || item.jrsdInsttNm || ''),
          support_method: decodeHtmlEntities(item.pldirSportRealmMlsfcCodeNm || item.lcategory || '기타'),  // 지원 방식 필드 사용
          support_amount: '확인 필요', // API에서 직접 제공되지 않음
          interest_rate: '확인 필요', // API에서 직접 제공되지 않음
          application_deadline: decodeHtmlEntities(item.reqstBeginEndDe || parseApplicationPeriod(item.reqstDt) || '확인 필요'),  // 신청 기간 필드 사용
          application_method: decodeDescription(item.reqstMthPapersCn || '온라인접수'),  // 신청 방법 필드 사용
          announcement_url: decodeHtmlEntities(item.link || item.pblancUrl || ''),
          source: '정책정보포털',
          attachment_files: decodeHtmlEntities(item.fileNm || item.printFileNm || '없음'),
          business_type_code: decodeHtmlEntities(item.trgetNm || '전체'),
          status: 'active',
          api_source: 'policy_portal',
          api_last_updated_at: new Date().toISOString(),
          raw_data: item
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
      if (mode === 'replace') {
        // 기존 데이터 모두 삭제 - Truncate 사용으로 RLS 우회
        const { error: truncateError } = await supabaseAdmin.rpc('truncate_government_supports')

        if (truncateError) {
          // Truncate 함수가 없으면 일반 delete 사용
          const { error: deleteError } = await supabaseAdmin
            .from('government_supports')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000')

          if (deleteError) {
            throw new Error(`기존 데이터 삭제 실패: ${deleteError.message}`)
          }
        }

        this.log('UPDATE_DATABASE', 'success', '기존 데이터 삭제 완료')
      } else if (mode === 'upsert') {
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
              .eq('api_source', 'policy_portal') // 동일한 API 소스만 처리

            if (updateError) {
              this.log('UPDATE_DATABASE', 'warning', `기존 데이터 비활성화 실패: ${updateError.message}`)
            } else {
              this.log('UPDATE_DATABASE', 'success', 'API에서 사라진 데이터를 비활성화 처리 완료')
            }
          }
        }
      }

      if (data.length > 0) {
        // 새 데이터 저장 - upsert 또는 insert
        const batchSize = 100
        let processedCount = 0

        for (let i = 0; i < data.length; i += batchSize) {
          const batch = data.slice(i, i + batchSize)

          if (mode === 'upsert') {
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
          } else {
            // Replace 모드: 일반 insert
            const { error: insertError } = await supabaseAdmin
              .from('government_supports')
              .insert(batch)

            if (insertError) {
              console.error('배치 삽입 실패:', insertError)
              this.log('UPDATE_DATABASE', 'error', `배치 ${Math.floor(i / batchSize) + 1} 삽입 실패: ${insertError.message}`)
              // 개별 항목으로 재시도
              for (const item of batch) {
                try {
                  const { error: singleError } = await supabaseAdmin
                    .from('government_supports')
                    .insert([item])

                  if (!singleError) {
                    processedCount++
                  }
                } catch (e) {
                  console.error('개별 항목 삽입 실패:', e)
                }
              }
            } else {
              processedCount += batch.length
            }
          }
        }

        this.log('UPDATE_DATABASE', 'success', `${processedCount}개 항목 ${mode === 'upsert' ? 'upsert' : '저장'} 완료`)
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
      this.log('SYNC_START', 'success', `동기화 시작 (모드: ${mode}, 드라이런: ${dryRun})`)

      // 1. 정책정보포털 API에서 데이터 가져오기
      const externalData = await this.fetchFromPolicyAPI()

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

      this.log('SYNC_COMPLETE', 'success', `동기화 완료: ${savedCount}개 항목 처리`)

      return {
        success: true,
        count: savedCount,
        logs: this.logs
      }

    } catch (error) {
      this.log('SYNC_ERROR', 'error', '동기화 실패', error)

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

      if (error) throw error

      const { data: lastUpdated } = await supabaseAdmin
        .from('government_supports')
        .select('api_last_updated_at')
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
export const governmentSupportSyncService = new GovernmentSupportSyncService()

// 편의 함수들
export async function syncGovernmentSupports(options?: {
  mode?: 'replace' | 'upsert'
  dryRun?: boolean
}) {
  return await governmentSupportSyncService.syncData(options)
}

export async function getGovernmentSupportStats() {
  return await governmentSupportSyncService.getStats()
}

// 스케줄링을 위한 함수 (cron job에서 사용)
export async function scheduledSync() {
  console.log('정부지원사업 데이터 정기 동기화 시작...')

  const result = await syncGovernmentSupports({
    mode: 'upsert',
    dryRun: false
  })

  if (result.success) {
    console.log(`정기 동기화 완료: ${result.count}개 항목 처리`)
  } else {
    console.error('정기 동기화 실패:', result.error)
  }

  return result
}