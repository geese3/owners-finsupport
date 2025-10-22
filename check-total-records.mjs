import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qgttcblwdtizcmyrwhht.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFndHRjYmx3ZHRpemNteXJ3aGh0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDE1OTI2MywiZXhwIjoyMDc1NzM1MjYzfQ.f0uC8dvlKZ3qr9BnmlyLzmuXupxxxPiLvxCRI65jDK0'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkTotalRecords() {
  try {
    // 전체 레코드 수 확인
    const { count: totalCount } = await supabase
      .from('government_supports')
      .select('*', { count: 'exact', head: true })

    console.log('📊 전체 레코드 수:', totalCount)

    // 정책정보포털 소스만 확인
    const { count: policyCount } = await supabase
      .from('government_supports')
      .select('*', { count: 'exact', head: true })
      .eq('source', '정책정보포털')

    console.log('📊 정책정보포털 레코드 수:', policyCount)

    // raw_data가 있는 정책정보포털 레코드
    const { count: policyWithRawCount } = await supabase
      .from('government_supports')
      .select('*', { count: 'exact', head: true })
      .eq('source', '정책정보포털')
      .not('raw_data', 'is', null)

    console.log('📊 정책정보포털 (raw_data 있음) 레코드 수:', policyWithRawCount)

    // 배치로 처리해보기 (1000개씩)
    if (policyWithRawCount > 1000) {
      console.log('\n⚠️ 1000개 이상의 레코드가 있습니다. 배치 처리가 필요합니다.')
      const batches = Math.ceil(policyWithRawCount / 1000)
      console.log(`📦 필요한 배치 수: ${batches}개 (각 1000개씩)`)

      for (let i = 0; i < batches; i++) {
        const start = i * 1000
        const end = start + 999
        console.log(`  배치 ${i + 1}: 레코드 ${start} ~ ${end}`)
      }
    }

  } catch (error) {
    console.error('오류:', error)
  }
}

checkTotalRecords()