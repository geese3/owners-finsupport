const https = require('https')
require('dotenv').config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

async function executeSQL(sql) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ query: sql })

    const options = {
      hostname: SUPABASE_URL.replace('https://', '').replace('http://', ''),
      port: 443,
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY,
        'Content-Length': Buffer.byteLength(postData)
      }
    }

    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => {
        data += chunk
      })
      res.on('end', () => {
        try {
          const result = JSON.parse(data)
          resolve({ status: res.statusCode, data: result })
        } catch (e) {
          resolve({ status: res.statusCode, data: data })
        }
      })
    })

    req.on('error', (e) => {
      reject(e)
    })

    req.write(postData)
    req.end()
  })
}

async function createTables() {
  console.log('🚀 Supabase에 직접 SQL 실행을 시도합니다...')

  const sqls = [
    `CREATE TABLE IF NOT EXISTS public.users (
      id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
    );`,

    `CREATE TABLE IF NOT EXISTS public.user_profiles (
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
    );`
  ]

  for (let i = 0; i < sqls.length; i++) {
    try {
      console.log(`테이블 ${i + 1} 생성 중...`)
      const result = await executeSQL(sqls[i])
      console.log(`결과: ${result.status}`, result.data)
    } catch (error) {
      console.error(`오류:`, error.message)
    }
  }
}

createTables()