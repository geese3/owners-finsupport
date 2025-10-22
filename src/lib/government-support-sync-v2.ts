/**
 * 새로운 모듈화된 정부지원사업 데이터 동기화 시스템
 * 다양한 API 소스를 쉽게 추가하고 관리할 수 있는 구조
 */

import { createClient } from '@supabase/supabase-js'
import { ApiSourceManager } from './api-sources/base-api-source'
import { PolicyPortalSource } from './api-sources/policy-portal-source'
// import { ExampleNewSource } from './api-sources/example-new-source' // 필요시 주석 해제

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

interface SyncLog {
  timestamp: string
  action: string
  status: 'success' | 'error' | 'warning'
  message: string
  details?: any
}

class ModularGovernmentSupportSyncService {
  private apiManager: ApiSourceManager
  private logs: SyncLog[] = []

  constructor() {
    this.apiManager = new ApiSourceManager()
    this.initializeApiSources()
  }

  // API 소스들을 등록
  private initializeApiSources() {
    // 기존 정책정보포털 API 등록
    this.apiManager.registerSource(new PolicyPortalSource(), 'policy_portal')

    // 새로운 API 소스들을 여기에 추가
    // this.apiManager.registerSource(new ExampleNewSource(), 'example_new_api')
    // this.apiManager.registerSource(new AnotherNewSource(), 'another_api')

    this.log('INIT', 'success', `API 소스 초기화 완료: ${this.apiManager.getRegisteredSources().join(', ')}`)
  }

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

  // 데이터베이스 업데이트 (기존 로직과 동일)
  private async updateDatabase(data: any[], mode: 'replace' | 'upsert' = 'upsert', apiSource?: string) {
    try {
      if (mode === 'replace') {
        // 전체 삭제 모드
        const { error: truncateError } = await supabaseAdmin.rpc('truncate_government_supports')

        if (truncateError) {
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
        // Upsert 모드: 특정 API 소스의 데이터만 처리
        if (data.length > 0 && apiSource) {
          const currentIds = data.map(item => item.subvention_id).filter(Boolean)

          if (currentIds.length > 0) {
            // 해당 API 소스에서 사라진 항목들을 inactive로 변경
            const { error: updateError } = await supabaseAdmin
              .from('government_supports')
              .update({
                status: 'inactive',
                api_last_updated_at: new Date().toISOString()
              })
              .not('subvention_id', 'in', `(${currentIds.map(id => `'${id}'`).join(',')})`)
              .eq('status', 'active')
              .eq('api_source', apiSource)

            if (updateError) {
              this.log('UPDATE_DATABASE', 'warning', `${apiSource} 데이터 비활성화 실패: ${updateError.message}`)
            } else {
              this.log('UPDATE_DATABASE', 'success', `${apiSource}에서 사라진 데이터를 비활성화 처리 완료`)
            }
          }
        }
      }

      // 새 데이터 저장
      if (data.length > 0) {
        const batchSize = 100
        let processedCount = 0

        for (let i = 0; i < data.length; i += batchSize) {
          const batch = data.slice(i, i + batchSize)

          if (mode === 'upsert') {
            // Upsert 처리
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
            // Insert 처리
            const { error: insertError } = await supabaseAdmin
              .from('government_supports')
              .insert(batch)

            if (insertError) {
              this.log('UPDATE_DATABASE', 'error', `배치 삽입 실패`, insertError)
              // 개별 재시도
              for (const item of batch) {
                try {
                  const { error: singleError } = await supabaseAdmin
                    .from('government_supports')
                    .insert([item])

                  if (!singleError) {
                    processedCount++
                  }
                } catch (e) {
                  // 개별 실패는 로그만
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

  // 특정 API 소스만 동기화
  async syncSingleSource(sourceId: string, options: {
    mode?: 'replace' | 'upsert'
    dryRun?: boolean
  } = {}) {
    const { mode = 'upsert', dryRun = false } = options

    try {
      this.log('SYNC_SINGLE_START', 'success', `${sourceId} 단일 소스 동기화 시작 (모드: ${mode})`)

      // 1. 해당 소스에서 데이터 가져오기
      const result = await this.apiManager.processSource(sourceId)

      if (!result.success) {
        throw new Error(result.error || '데이터 처리 실패')
      }

      // 2. 로그 병합
      this.logs.push(...result.logs)

      // 3. 데이터베이스 업데이트 (드라이런이 아닌 경우만)
      let savedCount = 0
      if (!dryRun) {
        savedCount = await this.updateDatabase(result.data, mode, sourceId)
      } else {
        this.log('SYNC_DRYRUN', 'success', `드라이런: ${result.count}개 항목이 처리될 예정`)
        savedCount = result.count
      }

      this.log('SYNC_SINGLE_COMPLETE', 'success', `${sourceId} 동기화 완료: ${savedCount}개 항목`)

      return {
        success: true,
        count: savedCount,
        sourceId,
        logs: this.logs
      }

    } catch (error) {
      this.log('SYNC_SINGLE_ERROR', 'error', `${sourceId} 동기화 실패`, error)

      return {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        sourceId,
        logs: this.logs
      }
    }
  }

  // 모든 API 소스 동기화
  async syncAllSources(options: {
    mode?: 'replace' | 'upsert'
    dryRun?: boolean
  } = {}) {
    const { mode = 'upsert', dryRun = false } = options

    try {
      this.log('SYNC_ALL_START', 'success', `전체 소스 동기화 시작 (모드: ${mode})`)

      // 1. 모든 소스에서 데이터 가져오기
      const result = await this.apiManager.processAllSources()

      // 2. 로그 병합
      this.logs.push(...result.logs)

      // 3. 에러가 있으면 경고 로그
      if (result.errors.length > 0) {
        this.log('SYNC_ALL_WARNING', 'warning', `일부 소스에서 오류 발생: ${result.errors.join(', ')}`)
      }

      // 4. 데이터베이스 업데이트 (드라이런이 아닌 경우만)
      let savedCount = 0
      if (!dryRun && result.data.length > 0) {
        if (mode === 'replace') {
          // Replace 모드는 전체 데이터를 한 번에 처리
          savedCount = await this.updateDatabase(result.data, mode)
        } else {
          // Upsert 모드는 각 소스별로 처리 (더 정확한 상태 관리)
          const sources = this.apiManager.getRegisteredSources()
          for (const sourceId of sources) {
            try {
              const sourceResult = await this.apiManager.processSource(sourceId)
              if (sourceResult.success && sourceResult.data.length > 0) {
                const sourceCount = await this.updateDatabase(sourceResult.data, mode, sourceId)
                savedCount += sourceCount
              }
            } catch (error) {
              this.log('SYNC_SOURCE_ERROR', 'error', `${sourceId} 처리 실패`, error)
            }
          }
        }
      } else if (dryRun) {
        this.log('SYNC_DRYRUN', 'success', `드라이런: ${result.count}개 항목이 처리될 예정`)
        savedCount = result.count
      }

      this.log('SYNC_ALL_COMPLETE', 'success', `전체 동기화 완료: ${savedCount}개 항목`)

      return {
        success: result.errors.length === 0,
        count: savedCount,
        errors: result.errors,
        logs: this.logs
      }

    } catch (error) {
      this.log('SYNC_ALL_ERROR', 'error', '전체 동기화 실패', error)

      return {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        logs: this.logs
      }
    }
  }

  // 통계 조회
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

      // API 소스별 통계
      const { data: sourceStats } = await supabaseAdmin
        .from('government_supports')
        .select('api_source, status')

      const sourceBreakdown = sourceStats?.reduce((acc: any, item) => {
        const source = item.api_source || 'unknown'
        if (!acc[source]) acc[source] = { active: 0, inactive: 0, total: 0 }
        acc[source][item.status || 'active']++
        acc[source].total++
        return acc
      }, {})

      return {
        total_count: count || 0,
        last_updated: lastUpdated?.api_last_updated_at || null,
        source_breakdown: sourceBreakdown || {},
        registered_sources: this.apiManager.getRegisteredSources()
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
export const modularGovernmentSupportSyncService = new ModularGovernmentSupportSyncService()

// 편의 함수들 (기존 API와 호환성 유지)
export async function syncGovernmentSupports(options?: {
  mode?: 'replace' | 'upsert'
  dryRun?: boolean
  sourceId?: string // 특정 소스만 동기화
}) {
  const { sourceId, ...syncOptions } = options || {}

  if (sourceId) {
    return await modularGovernmentSupportSyncService.syncSingleSource(sourceId, syncOptions)
  } else {
    return await modularGovernmentSupportSyncService.syncAllSources(syncOptions)
  }
}

export async function getGovernmentSupportStats() {
  return await modularGovernmentSupportSyncService.getStats()
}

// 새로운 API 소스를 쉽게 추가할 수 있는 함수
export function addApiSource(source: any, sourceId: string) {
  modularGovernmentSupportSyncService['apiManager'].registerSource(source, sourceId)
  console.log(`✅ 새로운 API 소스 추가됨: ${sourceId}`)
}