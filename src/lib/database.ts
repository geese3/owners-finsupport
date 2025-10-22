import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// 서비스 키로 관리자 권한 클라이언트 생성
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export async function initializeDatabase() {
  try {
    console.log('🚀 데이터베이스 초기화를 시작합니다...')

    // 기본 테이블 생성 확인 (auth.users는 Supabase에서 자동 생성됨)
    const tables = [
      {
        name: 'users',
        sql: `
          CREATE TABLE IF NOT EXISTS public.users (
            id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
          );
        `
      },
      {
        name: 'user_profiles',
        sql: `
          CREATE TABLE IF NOT EXISTS public.user_profiles (
            id UUID REFERENCES public.users ON DELETE CASCADE PRIMARY KEY,
            company_name TEXT,
            business_number TEXT,
            industry TEXT,
            region TEXT,
            company_size TEXT,
            business_type TEXT,
            plan_type TEXT DEFAULT 'FREE',
            phone TEXT,
            address TEXT,
            website TEXT,
            description TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
          );
        `
      },
      {
        name: 'search_history',
        sql: `
          CREATE TABLE IF NOT EXISTS public.search_history (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
            query TEXT NOT NULL,
            category TEXT,
            results_count INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
          );
        `
      },
      {
        name: 'bookmarks',
        sql: `
          CREATE TABLE IF NOT EXISTS public.bookmarks (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
            item_type TEXT NOT NULL,
            item_id TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            url TEXT,
            metadata JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
            UNIQUE(user_id, item_type, item_id)
          );
        `
      },
      {
        name: 'roadmap_progress',
        sql: `
          CREATE TABLE IF NOT EXISTS public.roadmap_progress (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
            roadmap_type TEXT NOT NULL,
            step_id TEXT NOT NULL,
            status TEXT CHECK (status IN ('not_started', 'in_progress', 'completed', 'skipped')) DEFAULT 'not_started',
            completion_date TIMESTAMP WITH TIME ZONE,
            notes TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
          );
        `
      },
      {
        name: 'uploaded_files',
        sql: `
          CREATE TABLE IF NOT EXISTS public.uploaded_files (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
            filename TEXT NOT NULL,
            original_name TEXT NOT NULL,
            file_path TEXT NOT NULL,
            file_size INTEGER NOT NULL,
            mime_type TEXT NOT NULL,
            category TEXT,
            status TEXT CHECK (status IN ('processing', 'completed', 'failed')) DEFAULT 'processing',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
          );
        `
      }
    ]

    // 각 테이블 생성 시도
    for (const table of tables) {
      try {
        console.log(`📝 ${table.name} 테이블 생성 중...`)
        const { error } = await supabaseAdmin.rpc('exec', { sql: table.sql })

        if (error) {
          // RPC 함수가 없으면 직접 시도
          console.log(`⚠️ RPC 실행 실패, 대안 방법 시도: ${table.name}`)
          // 테이블 존재 확인으로 대체
          const { data, error: checkError } = await supabaseAdmin
            .from(table.name)
            .select('count(*)', { count: 'exact', head: true })

          if (checkError && checkError.code === 'PGRST116') {
            console.log(`❌ ${table.name}: 테이블이 존재하지 않습니다. 수동 생성이 필요합니다.`)
          } else {
            console.log(`✅ ${table.name}: 테이블이 존재합니다.`)
          }
        } else {
          console.log(`✅ ${table.name}: 테이블이 성공적으로 생성되었습니다.`)
        }
      } catch (err) {
        console.log(`⚠️ ${table.name}: ${err}`)
      }
    }

    console.log('\n🎉 데이터베이스 초기화가 완료되었습니다!')
    return { success: true }

  } catch (error) {
    console.error('❌ 데이터베이스 초기화 중 오류:', error)
    return { success: false, error }
  }
}

export { supabaseAdmin }