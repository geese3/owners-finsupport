import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qgttcblwdtizcmyrwhht.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFndHRjYmx3ZHRpemNteXJ3aGh0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDE1OTI2MywiZXhwIjoyMDc1NzM1MjYzfQ.f0uC8dvlKZ3qr9BnmlyLzmuXupxxxPiLvxCRI65jDK0'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function updateBizinfoFields() {
  try {
    console.log('🔄 Bizinfo 필드 업데이트 시작...')

    // 1. 먼저 현재 데이터 조회
    const { data: records, error: fetchError } = await supabase
      .from('government_supports')
      .select('id, raw_data, support_method, application_deadline, application_method')
      .eq('source', '정책정보포털')
      .not('raw_data', 'is', null)
      .limit(1000)

    if (fetchError) {
      console.error('데이터 조회 오류:', fetchError)
      return
    }

    console.log(`📊 총 ${records.length}개 레코드 조회 완료`)

    let updateCount = 0
    let errorCount = 0

    // 2. 각 레코드별로 업데이트
    for (const record of records) {
      const rawData = record.raw_data

      // raw_data가 없거나 객체가 아닌 경우 스킵
      if (!rawData || typeof rawData !== 'object') {
        continue
      }

      const updates = {}
      let needsUpdate = false

      // 지원 방식 업데이트 (pldirSportRealmMlsfcCodeNm)
      if (rawData.pldirSportRealmMlsfcCodeNm && record.support_method !== rawData.pldirSportRealmMlsfcCodeNm) {
        updates.support_method = rawData.pldirSportRealmMlsfcCodeNm
        needsUpdate = true
      }

      // 신청 기간 업데이트 (reqstBeginEndDe)
      if (rawData.reqstBeginEndDe && record.application_deadline !== rawData.reqstBeginEndDe) {
        updates.application_deadline = rawData.reqstBeginEndDe
        needsUpdate = true
      }

      // 신청 방법 업데이트 (reqstMthPapersCn)
      if (rawData.reqstMthPapersCn) {
        // 신청 방법은 텍스트가 길 수 있으므로 첫 100자만 저장
        const applicationMethod = rawData.reqstMthPapersCn.substring(0, 100)
        if (record.application_method !== applicationMethod) {
          updates.application_method = applicationMethod
          needsUpdate = true
        }
      }

      // 지원 금액 및 이자율 추출 (bsnsSumryCn에서)
      if (rawData.bsnsSumryCn) {
        const summary = rawData.bsnsSumryCn

        // 금액 정보 추출
        const amountMatch = summary.match(/(\d+[\d,]*)\s*(억|천만|백만|만)?\s*원/i)
        if (amountMatch) {
          updates.support_amount = amountMatch[0]
          needsUpdate = true
        }

        // 이자율 정보 추출
        const interestMatch = summary.match(/(\d+\.?\d*)\s*%/i)
        if (interestMatch) {
          updates.interest_rate = interestMatch[0]
          needsUpdate = true
        } else if (summary.includes('이자차액') || summary.includes('이차보전')) {
          const subsidyMatch = summary.match(/(\d+\.?\d*)\s*%.*보전/i)
          if (subsidyMatch) {
            updates.interest_rate = `${subsidyMatch[1]}% 이차보전`
            needsUpdate = true
          }
        }
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
          console.log(`✅ ID ${record.id} 업데이트 완료:`, Object.keys(updates).join(', '))
        }
      }
    }

    console.log(`\n📊 업데이트 결과:`)
    console.log(`   성공: ${updateCount}개`)
    console.log(`   실패: ${errorCount}개`)
    console.log(`   스킵: ${records.length - updateCount - errorCount}개`)

    // 3. 업데이트된 데이터 샘플 확인
    console.log('\n📋 업데이트된 데이터 샘플:')
    const { data: samples, error: sampleError } = await supabase
      .from('government_supports')
      .select('id, title, support_method, application_deadline, support_amount, interest_rate')
      .eq('source', '정책정보포털')
      .not('support_method', 'eq', '기타')
      .limit(5)

    if (!sampleError && samples) {
      samples.forEach((sample, index) => {
        console.log(`\n${index + 1}. ${sample.title}`)
        console.log(`   지원방식: ${sample.support_method}`)
        console.log(`   신청기간: ${sample.application_deadline}`)
        console.log(`   지원금액: ${sample.support_amount}`)
        console.log(`   이자율: ${sample.interest_rate}`)
      })
    }

  } catch (error) {
    console.error('업데이트 중 오류:', error)
  }
}

// 실행
updateBizinfoFields()