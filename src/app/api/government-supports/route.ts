import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// 통합 API 엔드포인트
// 모든 정부지원사업 데이터를 통합하여 제공
// 각 데이터 소스별 API는 별도 폴더에서 관리

interface SearchParams {
  keyword?: string
  region?: string
  business_type?: string
  support_type?: string
  status?: string
  limit?: number
  offset?: number
  source?: string // 데이터 출처 필터 (legacy 호환성)
  api_source?: string // 새로운 모듈화 시스템 API 소스 필터
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // 검색 파라미터 추출
    const params: SearchParams = {
      keyword: searchParams.get('keyword') ? decodeURIComponent(searchParams.get('keyword')!) : undefined,
      region: searchParams.get('region') ? decodeURIComponent(searchParams.get('region')!) : undefined,
      business_type: searchParams.get('business_type') ? decodeURIComponent(searchParams.get('business_type')!) : undefined,
      support_type: searchParams.get('support_type') ? decodeURIComponent(searchParams.get('support_type')!) : undefined,
      status: searchParams.get('status') || 'active',
      source: searchParams.get('source') ? decodeURIComponent(searchParams.get('source')!) : undefined,
      api_source: searchParams.get('api_source') ? decodeURIComponent(searchParams.get('api_source')!) : undefined,
      limit: parseInt(searchParams.get('limit') || '50'),
      offset: parseInt(searchParams.get('offset') || '0')
    }

    // 기본 쿼리 구성
    let query = supabase
      .from('government_supports')
      .select('*', { count: 'exact' })
      .eq('status', params.status)
      .order('raw_data->creatPnttm', { ascending: false })
      .order('created_at', { ascending: false })
      .order('id', { ascending: true })

    // 키워드 검색 (제목 또는 기관명)
    if (params.keyword) {
      query = query.or(`title.ilike.%${params.keyword}%,host_institution.ilike.%${params.keyword}%`)
    }

    // 지역 필터링
    if (params.region && params.region !== '전체') {
      // 지역명 정규화
      const normalizedRegion = normalizeRegion(params.region)
      query = query.eq('region', normalizedRegion)
    }

    // 사업자 유형 필터링
    if (params.business_type) {
      query = query.eq('business_type_code', params.business_type)
    }

    // 지원 방식 필터링
    if (params.support_type) {
      query = query.ilike('support_method', `%${params.support_type}%`)
    }

    // 데이터 출처 필터링 (legacy 호환성)
    if (params.source) {
      query = query.eq('source', params.source)
    }

    // API 소스 필터링 (새로운 모듈화 시스템)
    if (params.api_source) {
      query = query.eq('api_source', params.api_source)
    }

    // 페이지네이션
    if (params.limit) {
      query = query.range(params.offset || 0, (params.offset || 0) + params.limit - 1)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('정부지원사업 데이터 조회 실패:', error)
      throw error
    }

    // 응답 데이터 변환 (기존 형식 유지)
    const transformedData = data?.map(item => transformToLegacyFormat(item)) || []

    return NextResponse.json({
      success: true,
      data: transformedData,
      total: count,
      params: {
        limit: params.limit,
        offset: params.offset,
        keyword: params.keyword,
        region: params.region,
        business_type: params.business_type,
        support_type: params.support_type,
        source: params.source,
        api_source: params.api_source
      }
    })

  } catch (error) {
    console.error('정부지원사업 API 오류:', error)

    return NextResponse.json(
      {
        error: '정부지원사업 데이터를 가져올 수 없습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    )
  }
}

// 통계 정보를 가져오는 엔드포인트
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (body.action === 'stats') {
      // 전체 통계
      const { data: totalData, error: totalError } = await supabase
        .from('government_supports')
        .select('region, business_type_code, support_method, status, source, api_source', { count: 'exact' })

      if (totalError) throw totalError

      // 지역별 통계
      const { data: regionStats, error: regionError } = await supabase
        .from('government_supports')
        .select('region')
        .eq('status', 'active')

      if (regionError) throw regionError

      // 출처별 통계 (legacy)
      const { data: sourceStats, error: sourceError } = await supabase
        .from('government_supports')
        .select('source')
        .eq('status', 'active')

      if (sourceError) throw sourceError

      // API 소스별 통계 (새로운 모듈화 시스템)
      const { data: apiSourceStats, error: apiSourceError } = await supabase
        .from('government_supports')
        .select('api_source')
        .eq('status', 'active')

      if (apiSourceError) throw apiSourceError

      // 통계 집계
      const regionCounts = regionStats?.reduce((acc: Record<string, number>, item) => {
        acc[item.region] = (acc[item.region] || 0) + 1
        return acc
      }, {}) || {}

      const sourceCounts = sourceStats?.reduce((acc: Record<string, number>, item) => {
        acc[item.source] = (acc[item.source] || 0) + 1
        return acc
      }, {}) || {}

      const apiSourceCounts = apiSourceStats?.reduce((acc: Record<string, number>, item) => {
        acc[item.api_source] = (acc[item.api_source] || 0) + 1
        return acc
      }, {}) || {}

      return NextResponse.json({
        success: true,
        stats: {
          total: totalData?.length || 0,
          by_region: regionCounts,
          by_source: sourceCounts, // legacy 호환성
          by_api_source: apiSourceCounts, // 새로운 모듈화 시스템
          last_updated: new Date().toISOString()
        }
      })
    }

    return NextResponse.json(
      { error: '지원되지 않는 액션입니다.' },
      { status: 400 }
    )

  } catch (error) {
    console.error('통계 API 오류:', error)

    return NextResponse.json(
      {
        error: '통계 데이터를 가져올 수 없습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    )
  }
}

// 지역명 정규화 함수
function normalizeRegion(region: string): string {
  const regionMap: Record<string, string> = {
    '서울특별시': '서울',
    '서울시': '서울',
    '부산광역시': '부산',
    '부산시': '부산',
    '대구광역시': '대구',
    '대구시': '대구',
    '인천광역시': '인천',
    '인천시': '인천',
    '광주광역시': '광주',
    '광주시': '광주',
    '대전광역시': '대전',
    '대전시': '대전',
    '울산광역시': '울산',
    '울산시': '울산',
    '세종특별자치시': '세종',
    '세종시': '세종',
    '경기도': '경기',
    '강원도': '강원',
    '강원특별자치도': '강원',
    '충청북도': '충북',
    '충북': '충북',
    '충청남도': '충남',
    '충남': '충남',
    '전라북도': '전북',
    '전북특별자치도': '전북',
    '전북': '전북',
    '전라남도': '전남',
    '전남': '전남',
    '경상북도': '경북',
    '경북': '경북',
    '경상남도': '경남',
    '경남': '경남',
    '제주특별자치도': '제주',
    '제주도': '제주',
    '제주': '제주'
  }

  return regionMap[region] || region
}

// 신청 마감일 추출 함수
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

// 레거시 형식으로 변환 (기존 프론트엔드 호환성 유지)
function transformToLegacyFormat(item: any) {
  // raw_data에서 실제 API 데이터 추출
  const rawData = item.raw_data || {}

  // 공고 URL 처리
  let announcementUrl = item.announcement_url
  if (rawData.pblancUrl && !rawData.pblancUrl.startsWith('http')) {
    announcementUrl = `https://www.bizinfo.go.kr${rawData.pblancUrl}`
  }

  // 첨부파일 URL 처리 (여러 파일 지원)
  let attachmentUrl = ''
  let attachmentFiles = []

  // 여러 파일 URL이 @ 구분자로 있는 경우
  if (rawData.flpthNm && rawData.flpthNm.includes('@')) {
    const urls = rawData.flpthNm.split('@').filter((url: string) => url.trim() && url.startsWith('http'))
    const names = rawData.fileNm ? rawData.fileNm.split('@').filter((name: string) => name.trim()) : []

    attachmentFiles = urls.map((url: string, index: number) => ({
      url: url.trim(),
      name: names[index] ? names[index].trim().replace(/\+/g, ' ') : `첨부파일${index + 1}`
    }))

    // 첫 번째 파일을 기본 URL로 설정 (기존 호환성)
    attachmentUrl = urls[0] || ''
  }
  // 단일 파일인 경우
  else if (rawData.printFlpthNm && rawData.printFlpthNm.startsWith('http')) {
    attachmentUrl = rawData.printFlpthNm
    attachmentFiles = [{
      url: rawData.printFlpthNm,
      name: item.attachment_files || '첨부파일'
    }]
  } else if (rawData.flpthNm && rawData.flpthNm.startsWith('http')) {
    attachmentUrl = rawData.flpthNm
    attachmentFiles = [{
      url: rawData.flpthNm,
      name: item.attachment_files || '첨부파일'
    }]
  }

  // 신청 마감일 파싱 (실시간 처리)
  let formattedDeadline = item.application_deadline
  if (rawData.reqstBeginEndDe) {
    formattedDeadline = extractDeadline(rawData.reqstBeginEndDe)
  } else if (item.application_deadline && item.application_deadline.includes('~')) {
    // 데이터베이스에 저장된 값이 아직 파싱되지 않은 경우
    formattedDeadline = extractDeadline(item.application_deadline)
  }

  return {
    subventionId: item.subvention_id,
    지역: item.region,
    접수기관: item.host_institution,
    지원사업명: item.title,
    "지원 방식": item.support_method,
    지원금액: item.support_amount,
    금리: item.interest_rate,
    "접수 마감일": formattedDeadline, // 파싱된 마감일 사용
    "접수 방법": item.application_method,
    "공고 URL": announcementUrl,
    출처: item.source,
    첨부파일: item.attachment_files,
    첨부파일URL: attachmentUrl,
    첨부파일목록: attachmentFiles, // 여러 첨부파일 배열
    businessTypeCode: item.business_type_code,
    rawData: rawData // 디버깅용
  }
}