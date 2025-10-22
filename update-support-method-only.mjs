import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qgttcblwdtizcmyrwhht.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFndHRjYmx3ZHRpemNteXJ3aGh0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDE1OTI2MywiZXhwIjoyMDc1NzM1MjYzfQ.f0uC8dvlKZ3qr9BnmlyLzmuXupxxxPiLvxCRI65jDK0'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function updateSupportMethodOnly() {
  try {
    console.log('🔄 지원 방식만 업데이트 시작 (금액/이자율은 "확인 필요"로 초기화)...')

    // 1. 먼저 현재 데이터 조회 (limit 제거하여 모든 레코드 조회)
    const { data: records, error: fetchError } = await supabase
      .from('government_supports')
      .select('id, raw_data, support_method, support_amount, interest_rate')
      .eq('source', '정책정보포털')
      .not('raw_data', 'is', null)

    if (fetchError) {
      console.error('데이터 조회 오류:', fetchError)
      return
    }

    console.log(`📊 총 ${records.length}개 레코드 조회 완료`)

    let updateCount = 0
    let skipCount = 0
    let errorCount = 0

    // 2. 각 레코드별로 업데이트
    for (const record of records) {
      const rawData = record.raw_data

      // raw_data가 없거나 객체가 아닌 경우 스킵
      if (!rawData || typeof rawData !== 'object') {
        skipCount++
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
      // (이미 파싱된 값이 있거나 없거나 관계없이 모두 "확인 필요"로 설정)
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
          console.error(`❌ ID ${record.id} 업데이트 실패:`, updateError)
          errorCount++
        } else {
          updateCount++

          // 업데이트 내용 로그
          const updateFields = []
          if (updates.support_method) updateFields.push('support_method')
          if (updates.support_amount) updateFields.push('support_amount')
          if (updates.interest_rate) updateFields.push('interest_rate')

          console.log(`✅ ID ${record.id.substring(0, 8)}... 업데이트: ${updateFields.join(', ')}`)
        }
      } else {
        skipCount++
      }
    }

    console.log(`\n📊 업데이트 결과:`)
    console.log(`   ✅ 성공: ${updateCount}개`)
    console.log(`   ⏭️ 스킵: ${skipCount}개 (이미 최신 상태)`)
    console.log(`   ❌ 실패: ${errorCount}개`)

    // 3. 업데이트된 데이터 샘플 확인
    console.log('\n📋 업데이트된 데이터 샘플 (지원방식이 있는 데이터):')
    const { data: samples, error: sampleError } = await supabase
      .from('government_supports')
      .select('id, title, support_method, support_amount, interest_rate')
      .eq('source', '정책정보포털')
      .not('support_method', 'eq', '기타')
      .not('support_method', 'eq', '확인 필요')
      .limit(5)

    if (!sampleError && samples) {
      samples.forEach((sample, index) => {
        console.log(`\n${index + 1}. ${sample.title.substring(0, 50)}...`)
        console.log(`   지원방식: ${sample.support_method}`)
        console.log(`   지원금액: ${sample.support_amount}`)
        console.log(`   이자율: ${sample.interest_rate}`)
      })
    }

    // 4. 지원방식별 통계
    console.log('\n📊 지원방식별 통계:')
    const { data: methodStats, error: statsError } = await supabase
      .from('government_supports')
      .select('support_method')
      .eq('source', '정책정보포털')

    if (!statsError && methodStats) {
      const methodCounts = {}
      methodStats.forEach(item => {
        const method = item.support_method || '미분류'
        methodCounts[method] = (methodCounts[method] || 0) + 1
      })

      Object.entries(methodCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .forEach(([method, count]) => {
          console.log(`   ${method}: ${count}개`)
        })
    }

  } catch (error) {
    console.error('업데이트 중 오류:', error)
  }
}

// 실행
updateSupportMethodOnly()