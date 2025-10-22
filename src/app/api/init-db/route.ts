import { NextRequest, NextResponse } from 'next/server'
import { initializeDatabase } from '@/lib/database'

export async function POST() {
  try {
    const result = await initializeDatabase()

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: '데이터베이스 초기화가 완료되었습니다.'
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Database initialization error:', error)
    return NextResponse.json({
      success: false,
      error: 'Database initialization failed'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST method to initialize database'
  })
}