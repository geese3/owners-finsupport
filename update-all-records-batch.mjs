import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qgttcblwdtizcmyrwhht.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFndHRjYmx3ZHRpemNteXJ3aGh0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDE1OTI2MywiZXhwIjoyMDc1NzM1MjYzfQ.f0uC8dvlKZ3qr9BnmlyLzmuXupxxxPiLvxCRI65jDK0'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function updateAllRecordsBatch() {
  try {
    console.log('🔄 모든 레코드 배치 업데이트 시작...')

    // 전체 레코드 수 확인
    const { count: totalCount } = await supabase
      .from('government_supports')
      .select('*', { count: 'exact', head: true })
      .eq('source', '정책정보포털')
      .not('raw_data', 'is', null)

    console.log(`📊 총 레코드 수: ${totalCount}개`)

    const batchSize = 1000
    const totalBatches = Math.ceil(totalCount / batchSize)
    console.log(`📦 필요한 배치 수: ${totalBatches}개\n`)

    let totalUpdateCount = 0
    let totalSkipCount = 0
    let totalErrorCount = 0

    // 배치별로 처리
    for (let batchNum = 0; batchNum < totalBatches; batchNum++) {
      const start = batchNum * batchSize
      const end = start + batchSize - 1

      console.log(`\n🔄 배치 ${batchNum + 1}/${totalBatches} 처리 중 (레코드 ${start}~${Math.min(end, totalCount - 1)})...`)

      // 배치 데이터 조회 (range 사용)
      const { data: records, error: fetchError } = await supabase
        .from('government_supports')
        .select('id, raw_data, support_method, support_amount, interest_rate')
        .eq('source', '정책정보포털')
        .not('raw_data', 'is', null)
        .range(start, end)

      if (fetchError) {
        console.error(`❌ 배치 ${batchNum + 1} 조회 오류:`, fetchError)
        continue
      }

      console.log(`  - ${records.length}개 레코드 처리 중...`)

      let batchUpdateCount = 0
      let batchSkipCount = 0
      let batchErrorCount = 0

      // 각 레코드별로 업데이트
      for (const record of records) {
        const rawData = record.raw_data

        // raw_data가 없거나 객체가 아닌 경우 스킵
        if (!rawData || typeof rawData !== 'object') {
          batchSkipCount++
          continue
        }

        const updates = {}
        let needsUpdate = false

        // 지원 방식 업데이트 (pldirSportRealmMlsfcCodeNm 직접 사용)
        if (rawData.pldirSportRealmMlsfcCodeNm) {
          if (record.support_method !== rawData.pldirSportRealmMlsfcCodeNm) {
            updates.support_method = rawData.pldirSportRealmMlsfcCodeNm
            needsUpdate = true
          }
        }

        // 금액과 이자율은 "확인 필요"로 초기화
        if (record.support_amount !== '확인 필요') {
          updates.support_amount = '확인 필요'
          needsUpdate = true
        }

        if (record.interest_rate !== '확인 필요') {
          updates.interest_rate = '확인 필요'
          needsUpdate = true
        }

        // 업데이트가 필요한 경우에만 실행
        if (needsUpdate) {
          const { error: updateError } = await supabase
            .from('government_supports')
            .update({
              ...updates,
              updated_at: new Date().toISOString()
            })
            .eq('id', record.id)

          if (updateError) {
            console.error(`    ❌ ID ${record.id.substring(0, 8)}... 업데이트 실패`)
            batchErrorCount++
          } else {
            batchUpdateCount++
          }
        } else {
          batchSkipCount++
        }
      }

      console.log(`  ✅ 배치 ${batchNum + 1} 완료:`)
      console.log(`     - 업데이트: ${batchUpdateCount}개`)
      console.log(`     - 스킵: ${batchSkipCount}개`)
      console.log(`     - 실패: ${batchErrorCount}개`)

      totalUpdateCount += batchUpdateCount
      totalSkipCount += batchSkipCount
      totalErrorCount += batchErrorCount
    }

    console.log('\n' + '='.repeat(50))
    console.log(`📊 전체 업데이트 결과:`)
    console.log(`   ✅ 성공: ${totalUpdateCount}개`)
    console.log(`   ⏭️ 스킵: ${totalSkipCount}개`)
    console.log(`   ❌ 실패: ${totalErrorCount}개`)
    console.log(`   📋 총계: ${totalUpdateCount + totalSkipCount + totalErrorCount}개`)
    console.log('='.repeat(50))

    // 업데이트된 데이터 샘플 확인
    console.log('\n📋 업데이트된 데이터 샘플:')
    const { data: samples } = await supabase
      .from('government_supports')
      .select('id, title, support_method, support_amount, interest_rate')
      .eq('source', '정책정보포털')
      .not('support_method', 'eq', '기타')
      .not('support_method', 'eq', '확인 필요')
      .limit(5)

    if (samples) {
      samples.forEach((sample, index) => {
        console.log(`\n${index + 1}. ${sample.title.substring(0, 50)}...`)
        console.log(`   지원방식: ${sample.support_method}`)
        console.log(`   지원금액: ${sample.support_amount}`)
        console.log(`   이자율: ${sample.interest_rate}`)
      })
    }

  } catch (error) {
    console.error('업데이트 중 오류:', error)
  }
}

// 실행
updateAllRecordsBatch()