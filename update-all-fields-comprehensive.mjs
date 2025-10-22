import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qgttcblwdtizcmyrwhht.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFndHRjYmx3ZHRpemNteXJ3aGh0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDE1OTI2MywiZXhwIjoyMDc1NzM1MjYzfQ.f0uC8dvlKZ3qr9BnmlyLzmuXupxxxPiLvxCRI65jDK0'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// 지역 추출 함수 (4단계 우선순위)
function extractRegion(title, hashtags, institution) {
  // 우선순위 1: hashtags에서 지역 추출
  if (hashtags) {
    const regionFromHashtags = extractRegionFromText(hashtags)
    if (regionFromHashtags !== '전국') {
      return regionFromHashtags
    }
  }

  // 우선순위 2: 제목에서 [지역] 패턴 추출
  const titleMatch = title?.match(/\[([가-힣]+)\]/)
  if (titleMatch) {
    const extracted = normalizeRegionName(titleMatch[1])
    if (extracted !== '전국') {
      return extracted
    }
  }

  // 우선순위 3: 제목에서 지역명 직접 찾기
  const regionFromTitle = extractRegionFromText(title || '')
  if (regionFromTitle !== '전국') {
    return regionFromTitle
  }

  // 우선순위 4: 기관명에서 지역 추출
  const regionFromInstitution = extractRegionFromText(institution || '')
  if (regionFromInstitution !== '전국') {
    return regionFromInstitution
  }

  return '전국'
}

// 텍스트에서 지역 추출
function extractRegionFromText(text) {
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
function normalizeRegionName(name) {
  const regionMap = {
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

// 신청 마감일 추출 함수
function extractDeadline(reqstBeginEndDe) {
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

async function updateAllFieldsComprehensive() {
  try {
    console.log('🔄 모든 필드 종합 업데이트 시작...')
    console.log('   - 지역명 (4단계 우선순위)')
    console.log('   - 지원방식 (pldirSportRealmMlsfcCodeNm)')
    console.log('   - 신청마감일 (reqstBeginEndDe에서 마감일 추출)')
    console.log('   - 신청방법 (reqstMthPapersCn)')
    console.log('   - 지원금액/이자율 → "확인 필요"')

    // 전체 레코드 수 확인
    const { count: totalCount } = await supabase
      .from('government_supports')
      .select('*', { count: 'exact', head: true })
      .eq('source', '정책정보포털')
      .not('raw_data', 'is', null)

    console.log(`\n📊 총 레코드 수: ${totalCount}개`)

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

      // 배치 데이터 조회
      const { data: records, error: fetchError } = await supabase
        .from('government_supports')
        .select('id, raw_data, title, region, support_method, application_deadline, application_method, support_amount, interest_rate, host_institution')
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

        if (!rawData || typeof rawData !== 'object') {
          batchSkipCount++
          continue
        }

        const updates = {}
        let needsUpdate = false

        // 1. 지역명 업데이트 (4단계 우선순위)
        const newRegion = extractRegion(
          rawData.pblancNm || record.title,
          rawData.hashtags,
          rawData.jrsdInsttNm || record.host_institution
        )
        if (record.region !== newRegion) {
          updates.region = newRegion
          needsUpdate = true
        }

        // 2. 지원 방식 업데이트
        if (rawData.pldirSportRealmMlsfcCodeNm && record.support_method !== rawData.pldirSportRealmMlsfcCodeNm) {
          updates.support_method = rawData.pldirSportRealmMlsfcCodeNm
          needsUpdate = true
        }

        // 3. 신청 마감일 업데이트 (마감일만 추출)
        if (rawData.reqstBeginEndDe) {
          const newDeadline = extractDeadline(rawData.reqstBeginEndDe)
          if (record.application_deadline !== newDeadline) {
            updates.application_deadline = newDeadline
            needsUpdate = true
          }
        }

        // 4. 신청 방법 업데이트
        if (rawData.reqstMthPapersCn) {
          const applicationMethod = rawData.reqstMthPapersCn.substring(0, 200) // 200자 제한
          if (record.application_method !== applicationMethod) {
            updates.application_method = applicationMethod
            needsUpdate = true
          }
        }

        // 5. 금액과 이자율은 "확인 필요"로 통일
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

            // 업데이트 내용 표시 (5개마다)
            if (batchUpdateCount % 5 === 0) {
              const updateFields = Object.keys(updates)
              console.log(`    ✅ ${batchUpdateCount}개 완료 (최근: ${updateFields.join(', ')})`)
            }
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

    console.log('\n' + '='.repeat(60))
    console.log(`📊 전체 업데이트 결과:`)
    console.log(`   ✅ 성공: ${totalUpdateCount}개`)
    console.log(`   ⏭️ 스킵: ${totalSkipCount}개`)
    console.log(`   ❌ 실패: ${totalErrorCount}개`)
    console.log(`   📋 총계: ${totalUpdateCount + totalSkipCount + totalErrorCount}개`)
    console.log('='.repeat(60))

    // 업데이트된 데이터 샘플 확인
    console.log('\n📋 업데이트된 데이터 샘플:')
    const { data: samples } = await supabase
      .from('government_supports')
      .select('id, title, region, support_method, application_deadline, application_method, support_amount, interest_rate')
      .eq('source', '정책정보포털')
      .limit(5)

    if (samples) {
      samples.forEach((sample, index) => {
        console.log(`\n${index + 1}. ${sample.title.substring(0, 40)}...`)
        console.log(`   지역: ${sample.region}`)
        console.log(`   지원방식: ${sample.support_method}`)
        console.log(`   마감일: ${sample.application_deadline}`)
        console.log(`   신청방법: ${sample.application_method?.substring(0, 30)}...`)
        console.log(`   지원금액: ${sample.support_amount}`)
        console.log(`   이자율: ${sample.interest_rate}`)
      })
    }

    // 지역별 분포 확인
    console.log('\n📊 지역별 분포 (상위 10개):')
    const { data: regionStats } = await supabase
      .from('government_supports')
      .select('region')
      .eq('source', '정책정보포털')

    if (regionStats) {
      const regionCounts = {}
      regionStats.forEach(item => {
        regionCounts[item.region] = (regionCounts[item.region] || 0) + 1
      })

      Object.entries(regionCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .forEach(([region, count]) => {
          console.log(`   ${region}: ${count}개`)
        })
    }

  } catch (error) {
    console.error('업데이트 중 오류:', error)
  }
}

// 실행
updateAllFieldsComprehensive()