import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qgttcblwdtizcmyrwhht.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFndHRjYmx3ZHRpemNteXJ3aGh0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDE1OTI2MywiZXhwIjoyMDc1NzM1MjYzfQ.f0uC8dvlKZ3qr9BnmlyLzmuXupxxxPiLvxCRI65jDK0'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkGyeonggiData() {
  try {
    console.log('경기 데이터 확인 중...')

    // 경기 데이터 직접 조회
    const { data: gyeonggiData, error: gyeonggiError } = await supabase
      .from('government_supports')
      .select('id, title, region')
      .eq('region', '경기')
      .limit(5)

    if (gyeonggiError) {
      console.error('경기 데이터 조회 오류:', gyeonggiError)
      return
    }

    console.log(`경기 데이터 ${gyeonggiData.length}개 발견:`)
    gyeonggiData.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.title} (ID: ${item.id})`)
    })

    // 전체 지역별 분포 확인
    const { data: allRegions, error: regionError } = await supabase
      .from('government_supports')
      .select('region')
      .limit(1000)

    if (regionError) {
      console.error('지역 분포 조회 오류:', regionError)
      return
    }

    const regionStats = {}
    allRegions.forEach(item => {
      regionStats[item.region] = (regionStats[item.region] || 0) + 1
    })

    console.log('\n📊 지역별 분포 (상위 10개):')
    Object.entries(regionStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([region, count]) => {
        console.log(`   ${region}: ${count}개`)
      })

    // created_at 최신 순으로 경기 데이터 확인
    const { data: recentGyeonggi, error: recentError } = await supabase
      .from('government_supports')
      .select('id, title, region, created_at')
      .eq('region', '경기')
      .order('created_at', { ascending: false })
      .limit(3)

    if (!recentError && recentGyeonggi.length > 0) {
      console.log('\n🕒 최신 경기 데이터:')
      recentGyeonggi.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.title}`)
        console.log(`      생성일: ${item.created_at}`)
      })
    }

  } catch (error) {
    console.error('확인 중 오류:', error)
  }
}

checkGyeonggiData()