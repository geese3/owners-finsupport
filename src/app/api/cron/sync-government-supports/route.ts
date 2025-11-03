import { NextRequest, NextResponse } from 'next/server'
import { scheduledSync } from '@/lib/government-support-sync'

export const runtime = 'nodejs'
export const maxDuration = 300 // 5분 타임아웃

/**
 * 정부지원사업 데이터 정기 동기화 크론잡 엔드포인트
 *
 * 사용법:
 * 1. Vercel Cron Jobs: vercel.json에 설정
 * 2. 외부 크론 서비스: curl 요청
 * 3. GitHub Actions: 스케줄된 워크플로우
 */
export async function GET(request: NextRequest) {
  try {
    // 크론잡 인증 (선택사항 - 보안을 위해)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    console.log(`[${new Date().toISOString()}] 정부지원사업 데이터 정기 동기화 시작`)

    let totalCount = 0
    let allLogs: any[] = []
    let errors: string[] = []

    try {
      // 1. Bizinfo (기업마당) 동기화 실행
      console.log(`[${new Date().toISOString()}] Bizinfo 동기화 시작...`)
      const bizinfoResult = await scheduledSync()

      if (bizinfoResult.success) {
        totalCount += bizinfoResult.count
        allLogs.push(...(bizinfoResult.logs || []))
        console.log(`[${new Date().toISOString()}] Bizinfo 동기화 완료: ${bizinfoResult.count}개 항목`)
      } else {
        errors.push(`Bizinfo 동기화 실패: ${bizinfoResult.error}`)
        allLogs.push(...(bizinfoResult.logs || []))
      }

      // 2. K-Startup 동기화 실행
      console.log(`[${new Date().toISOString()}] K-Startup 동기화 시작...`)
      const { kstartupSyncService } = await import('@/lib/kstartup-sync')
      const kstartupResult = await kstartupSyncService.syncData({ mode: 'upsert', dryRun: false })

      if (kstartupResult.success) {
        totalCount += kstartupResult.count
        allLogs.push(...(kstartupResult.logs || []))
        console.log(`[${new Date().toISOString()}] K-Startup 동기화 완료: ${kstartupResult.count}개 항목`)
      } else {
        errors.push(`K-Startup 동기화 실패: ${kstartupResult.error}`)
        allLogs.push(...(kstartupResult.logs || []))
      }

      // 결과 처리
      if (errors.length === 0) {
        console.log(`[${new Date().toISOString()}] 전체 정기 동기화 완료: ${totalCount}개 항목 (Bizinfo + K-Startup)`)

        return NextResponse.json({
          success: true,
          message: `정기 동기화가 성공적으로 완료되었습니다. (Bizinfo + K-Startup)`,
          count: totalCount,
          details: {
            bizinfo: bizinfoResult.count,
            kstartup: kstartupResult.count
          },
          timestamp: new Date().toISOString(),
          logs: allLogs
        })
      } else {
        console.error(`[${new Date().toISOString()}] 일부 동기화 실패:`, errors)

        return NextResponse.json(
          {
            success: false,
            error: errors.join('; '),
            message: `일부 동기화가 실패했습니다: ${errors.join(', ')}`,
            count: totalCount,
            timestamp: new Date().toISOString(),
            logs: allLogs
          },
          { status: 500 }
        )
      }
    } catch (error) {
      console.error(`[${new Date().toISOString()}] 동기화 실행 중 오류:`, error)

      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : '알 수 없는 오류',
          message: '동기화 실행 중 오류가 발생했습니다.',
          count: totalCount,
          timestamp: new Date().toISOString(),
          logs: allLogs
        },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error(`[${new Date().toISOString()}] 크론잡 실행 오류:`, error)

    return NextResponse.json(
      {
        success: false,
        error: '크론잡 실행 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// POST 요청으로 수동 동기화 실행
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { mode = 'replace', dryRun = false } = body

    console.log(`[${new Date().toISOString()}] 수동 동기화 요청: mode=${mode}, dryRun=${dryRun}`)

    const { syncGovernmentSupports } = await import('@/lib/government-support-sync')
    const result = await syncGovernmentSupports({ mode, dryRun })

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: dryRun
          ? `드라이런 완료: ${result.count}개 항목이 처리될 예정입니다.`
          : `수동 동기화 완료: ${result.count}개 항목이 처리되었습니다.`,
        count: result.count,
        mode,
        dryRun,
        timestamp: new Date().toISOString(),
        logs: result.logs
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          mode,
          dryRun,
          timestamp: new Date().toISOString(),
          logs: result.logs
        },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error(`[${new Date().toISOString()}] 수동 동기화 오류:`, error)

    return NextResponse.json(
      {
        success: false,
        error: '수동 동기화 실행 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}