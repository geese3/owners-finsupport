import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'

const supabase = createSupabaseServerClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')

    if (!userId) {
      return NextResponse.json(
        { error: '사용자 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    // 사용자의 관심 등록된 지원사업 목록 조회
    const { data: bookmarks, error: bookmarksError } = await supabase
      .from('bookmarks')
      .select('item_id, created_at')
      .eq('user_id', userId)
      .eq('item_type', 'government_support')
      .order('created_at', { ascending: false })

    if (bookmarksError) {
      console.error('관심 목록 조회 실패:', bookmarksError)
      throw bookmarksError
    }

    if (!bookmarks || bookmarks.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        count: 0
      })
    }

    // bookmarks에서 item_id 목록 추출
    const itemIds = bookmarks.map(bookmark => bookmark.item_id)

    // government_supports 테이블에서 실제 데이터 조회
    const { data: governmentSupports, error: govError } = await supabase
      .from('government_supports')
      .select('*')
      .in('subvention_id', itemIds)

    if (govError) {
      console.error('정부지원사업 데이터 조회 실패:', govError)
      throw govError
    }

    // bookmarks와 government_supports 데이터를 매칭하여 결합
    const favoritesWithData = bookmarks.map(bookmark => {
      const govData = governmentSupports?.find(gov => gov.subvention_id === bookmark.item_id)
      if (!govData) return null

      return {
        id: `bookmark_${bookmark.item_id}`,
        item_id: bookmark.item_id,
        title: govData.title, // 실제 데이터베이스 스키마에 맞춘 필드명
        description: `${govData.host_institution} - ${govData.support_method}`,
        url: govData.announcement_url,
        metadata: {
          host_institution: govData.host_institution,
          support_method: govData.support_method,
          support_amount: govData.support_amount,
          application_deadline: (() => {
            // 마감일 파싱 (dashboard와 동일한 로직)
            const rawData = govData.raw_data || {}
            if (rawData.reqstBeginEndDe) {
              return extractDeadline(rawData.reqstBeginEndDe)
            } else if (govData.application_deadline && govData.application_deadline.includes('~')) {
              return extractDeadline(govData.application_deadline)
            }
            return govData.application_deadline
          })(),
          source: govData.source,
          attachments: (() => {
            try {
              // raw_data에서 첨부파일 정보 추출 (dashboard와 동일한 로직)
              const rawData = govData.raw_data || {}
              let attachmentFiles = []

              // 여러 파일 URL이 @ 구분자로 있는 경우
              if (rawData.flpthNm && rawData.flpthNm.includes('@')) {
                const urls = rawData.flpthNm.split('@').filter((url: string) => url.trim() && url.startsWith('http'))
                const names = rawData.fileNm ? rawData.fileNm.split('@').filter((name: string) => name.trim()) : []

                attachmentFiles = urls.map((url: string, index: number) => ({
                  url: url.trim(),
                  name: names[index] ? names[index].trim().replace(/\+/g, ' ') : `첨부파일${index + 1}`
                }))
              }
              // 단일 파일인 경우
              else if (rawData.printFlpthNm && rawData.printFlpthNm.startsWith('http')) {
                attachmentFiles = [{
                  url: rawData.printFlpthNm,
                  name: govData.attachment_files || '첨부파일'
                }]
              } else if (rawData.flpthNm && rawData.flpthNm.startsWith('http')) {
                attachmentFiles = [{
                  url: rawData.flpthNm,
                  name: govData.attachment_files || '첨부파일'
                }]
              }
              // govData.attachment_files에서 직접 파싱 시도
              else if (govData.attachment_files) {
                if (typeof govData.attachment_files === 'string') {
                  return JSON.parse(govData.attachment_files);
                }
                if (Array.isArray(govData.attachment_files)) {
                  return govData.attachment_files;
                }
              }

              return attachmentFiles;
            } catch (e) {
              console.warn('첨부파일 파싱 실패:', govData.attachment_files);
              return [];
            }
          })()
        },
        created_at: bookmark.created_at,
        // 추가 정부지원사업 데이터
        ...govData
      }
    }).filter(item => item !== null) // null 항목 제거

    return NextResponse.json({
      success: true,
      data: favoritesWithData,
      count: favoritesWithData.length
    })

  } catch (error) {
    console.error('관심 목록 API 오류:', error)
    return NextResponse.json(
      {
        error: '관심 목록을 가져올 수 없습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      user_id,
      subvention_id,
      support_title,
      host_institution,
      support_method,
      support_amount,
      application_deadline,
      announcement_url,
      source,
      attachments
    } = body

    if (!user_id || !subvention_id || !support_title) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      )
    }

    // 관심 지원사업 등록 (기존 bookmarks 테이블 활용)
    const { data, error } = await supabase
      .from('bookmarks')
      .insert({
        user_id,
        item_type: 'government_support',
        item_id: subvention_id,
        title: support_title,
        description: `${host_institution} - ${support_method}`,
        url: announcement_url,
        metadata: {
          host_institution,
          support_method,
          support_amount,
          application_deadline,
          source,
          attachments: attachments || []
        }
      })
      .select()
      .single()

    if (error) {
      // 중복 등록인 경우
      if (error.code === '23505') {
        return NextResponse.json(
          { error: '이미 관심 등록된 지원사업입니다.' },
          { status: 409 }
        )
      }
      console.error('관심 등록 실패:', error)
      throw error
    }

    return NextResponse.json({
      success: true,
      data,
      message: '관심 등록이 완료되었습니다.'
    })

  } catch (error) {
    console.error('관심 등록 API 오류:', error)
    return NextResponse.json(
      {
        error: '관심 등록에 실패했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const subventionId = searchParams.get('subvention_id')

    if (!userId || !subventionId) {
      return NextResponse.json(
        { error: '사용자 ID와 지원사업 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    // 관심 지원사업 해제 (기존 bookmarks 테이블 활용)
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('user_id', userId)
      .eq('item_type', 'government_support')
      .eq('item_id', subventionId)

    if (error) {
      console.error('관심 해제 실패:', error)
      throw error
    }

    return NextResponse.json({
      success: true,
      message: '관심 해제가 완료되었습니다.'
    })

  } catch (error) {
    console.error('관심 해제 API 오류:', error)
    return NextResponse.json(
      {
        error: '관심 해제에 실패했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    )
  }
}

// 신청 마감일 추출 함수 (dashboard와 동일한 로직)
function extractDeadline(reqstBeginEndDe: string): string {
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