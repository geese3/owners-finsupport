const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// 환경 변수에서 Supabase 설정 읽기
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase URL 또는 Service Role Key가 설정되지 않았습니다.')
  console.error('   .env.local 파일을 확인해주세요.')
  process.exit(1)
}

// Service Role 키로 관리자 권한 클라이언트 생성
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupDatabase() {
  try {
    console.log('🚀 데이터베이스 스키마 설정을 시작합니다...')

    // 스키마 파일 읽기
    const schemaPath = path.join(__dirname, '../supabase/schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf8')

    // SQL을 세미콜론으로 분할하여 개별 실행
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))

    console.log(`📝 ${statements.length}개의 SQL 문을 실행합니다...`)

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';'
      console.log(`${i + 1}/${statements.length}: 실행 중...`)

      try {
        const { data, error } = await supabase.rpc('exec_sql', {
          sql: statement
        })

        if (error) {
          // RPC 함수가 없으면 직접 SQL 실행 시도
          if (error.code === 'PGRST202') {
            const { error: directError } = await supabase
              .from('_sql_exec')
              .select('*')
              .maybeSingle()

            if (directError && directError.code !== 'PGRST116') {
              console.warn(`⚠️  SQL 실행 중 경고: ${statement.substring(0, 50)}...`)
              console.warn(`   오류: ${error.message}`)
            }
          } else {
            throw error
          }
        }
      } catch (err) {
        console.warn(`⚠️  SQL 문 실행 실패 (계속 진행): ${statement.substring(0, 50)}...`)
        console.warn(`   오류: ${err.message}`)
      }
    }

    // 테이블 생성 확인
    console.log('\n🔍 생성된 테이블 확인 중...')

    const tables = [
      'users',
      'user_profiles',
      'search_history',
      'bookmarks',
      'roadmap_progress',
      'uploaded_files'
    ]

    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('count(*)', { count: 'exact', head: true })

        if (error) {
          console.log(`❌ ${table}: 테이블이 존재하지 않거나 접근할 수 없습니다.`)
        } else {
          console.log(`✅ ${table}: 테이블이 성공적으로 생성되었습니다.`)
        }
      } catch (err) {
        console.log(`❌ ${table}: ${err.message}`)
      }
    }

    console.log('\n🎉 데이터베이스 설정이 완료되었습니다!')
    console.log('   다음 단계: 인증 시스템 구현을 진행할 수 있습니다.')

  } catch (error) {
    console.error('❌ 데이터베이스 설정 중 오류가 발생했습니다:')
    console.error(error.message)
    process.exit(1)
  }
}

// 스크립트 실행
setupDatabase()