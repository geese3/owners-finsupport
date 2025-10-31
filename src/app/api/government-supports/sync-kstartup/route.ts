import { NextRequest, NextResponse } from 'next/server'
import { syncKStartupSupports, getKStartupSupportStats } from '@/lib/kstartup-sync'

export async function POST(request: NextRequest) {
  try {
    // 인증 검증 (선택적)
    const authHeader = request.headers.get('Authorization')
    const expectedToken = process.env.API_SYNC_TOKEN || 'dev-sync-token-2024'

    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 요청 본문 파싱 (선택적 옵션)
    let options = {}
    try {
      const body = await request.json()
      options = {
        mode: body.mode || 'upsert',
        dryRun: body.dryRun || false
      }
    } catch {
      // 본문이 없거나 파싱 실패시 기본값 사용
      options = {
        mode: 'upsert',
        dryRun: false
      }
    }

    console.log('🚀 K-Startup 동기화 시작:', options)

    // K-Startup 데이터 동기화 실행
    const result = await syncKStartupSupports(options)

    if (result.success) {
      // 동기화 후 통계 조회
      const stats = await getKStartupSupportStats()

      return NextResponse.json({
        success: true,
        message: `K-Startup 데이터 동기화 완료`,
        count: result.count,
        stats: stats,
        timestamp: new Date().toISOString(),
        logs: result.logs
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          logs: result.logs
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('K-Startup 동기화 오류:', error)
    return NextResponse.json(
      {
        error: 'K-Startup 동기화 중 오류가 발생했습니다',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    )
  }
}

// GET 메서드: K-Startup 데이터 통계 조회
export async function GET() {
  try {
    const stats = await getKStartupSupportStats()

    return NextResponse.json({
      success: true,
      stats: stats,
      message: 'K-Startup 데이터 통계',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('K-Startup 통계 조회 오류:', error)
    return NextResponse.json(
      {
        error: 'K-Startup 통계 조회 중 오류가 발생했습니다',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    )
  }
}