import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// 검색 및 필터링 파라미터 인터페이스
interface SearchParams {
  keyword?: string
  region?: string
  business_type?: string
  support_type?: string
  status?: string
  limit?: number
  offset?: number
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // 검색 파라미터 추출
    const rawRegion = searchParams.get('region')
    let decodedRegion = rawRegion ? decodeURIComponent(rawRegion) : undefined

    const params: SearchParams = {
      keyword: searchParams.get('keyword') ? decodeURIComponent(searchParams.get('keyword')!) : undefined,
      region: decodedRegion,
      business_type: searchParams.get('business_type') ? decodeURIComponent(searchParams.get('business_type')!) : undefined,
      support_type: searchParams.get('support_type') ? decodeURIComponent(searchParams.get('support_type')!) : undefined,
      status: searchParams.get('status') || 'active',
      limit: parseInt(searchParams.get('limit') || '50'),
      offset: parseInt(searchParams.get('offset') || '0')
    }

    // 기본 쿼리 구성
    let query = supabase
      .from('government_supports')
      .select('*')
      .eq('status', params.status)
      .order('raw_data->creatPnttm', { ascending: false })
      .order('created_at', { ascending: false })

    // 키워드 검색 (제목 또는 기관명)
    if (params.keyword) {
      query = query.or(`title.ilike.%${params.keyword}%,host_institution.ilike.%${params.keyword}%`)
    }

    // 지역 필터링 (유연한 매칭)
    if (params.region && params.region !== '전체') {
      console.log('🔍 지역 필터링 요청:', params.region)

      // 지역명 매핑 함수
      const normalizeRegion = (region: string): string[] => {
        const regionMap: Record<string, string[]> = {
          '서울': ['서울', '서울특별시', '서울시'],
          '부산': ['부산', '부산광역시', '부산시'],
          '대구': ['대구', '대구광역시', '대구시'],
          '인천': ['인천', '인천광역시', '인천시'],
          '광주': ['광주', '광주광역시', '광주시'],
          '대전': ['대전', '대전광역시', '대전시'],
          '울산': ['울산', '울산광역시', '울산시'],
          '세종': ['세종', '세종특별자치시', '세종시'],
          '경기': ['경기', '경기도'],
          '강원': ['강원', '강원도', '강원특별자치도'],
          '충북': ['충북', '충청북도'],
          '충남': ['충남', '충청남도'],
          '전북': ['전북', '전라북도', '전북특별자치도'],
          '전남': ['전남', '전라남도'],
          '경북': ['경북', '경상북도'],
          '경남': ['경남', '경상남도'],
          '제주': ['제주', '제주특별자치도', '제주도']
        }

        // 입력된 지역명이 어떤 표준 지역과 매칭되는지 찾기
        for (const [standardRegion, variations] of Object.entries(regionMap)) {
          if (variations.some(variation =>
            region.includes(variation) || variation.includes(region)
          )) {
            return [standardRegion]; // 표준 지역명 반환
          }
        }

        return [region]; // 매칭되지 않으면 원래 값 반환
      }

      const matchingRegions = normalizeRegion(params.region)
      console.log('🎯 매칭된 지역들:', matchingRegions)

      if (matchingRegions.length === 1) {
        console.log('📍 단일 지역 매칭:', matchingRegions[0])
        query = query.eq('region', matchingRegions[0])
      } else {
        console.log('📍 다중 지역 매칭:', matchingRegions)
        query = query.in('region', matchingRegions)
      }
    }

    // 사업자 유형 필터링
    if (params.business_type) {
      query = query.eq('business_type_code', params.business_type)
    }

    // 지원 방식 필터링
    if (params.support_type) {
      query = query.ilike('support_method', `%${params.support_type}%`)
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

    // 응답 데이터를 기존 SubventionItem 형식으로 변환
    const transformedData = data?.map(item => {
      // raw_data에서 실제 API 데이터 추출
      const rawData = item.raw_data || {}

      // 공고 URL 처리 - pblancUrl이 있으면 완전한 URL로 변환
      let announcementUrl = item.announcement_url
      if (rawData.pblancUrl && !rawData.pblancUrl.startsWith('http')) {
        announcementUrl = `https://www.bizinfo.go.kr${rawData.pblancUrl}`
      }

      // 첨부파일 URL 처리 - printFlpthNm이 있으면 그대로 사용
      let attachmentUrl = ''
      if (rawData.printFlpthNm && rawData.printFlpthNm.startsWith('http')) {
        attachmentUrl = rawData.printFlpthNm
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
        첨부파일URL: attachmentUrl, // 새로운 필드 추가
        businessTypeCode: item.business_type_code,
        rawData: rawData // 디버깅용으로 raw_data도 포함
      }
    }) || []

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
        support_type: params.support_type
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
        .select('region, business_type_code, support_method, status', { count: 'exact' })

      if (totalError) throw totalError

      // 지역별 통계
      const { data: regionStats, error: regionError } = await supabase
        .from('government_supports')
        .select('region')
        .eq('status', 'active')

      if (regionError) throw regionError

      // 사업자 유형별 통계
      const { data: businessTypeStats, error: businessError } = await supabase
        .from('government_supports')
        .select('business_type_code')
        .eq('status', 'active')

      if (businessError) throw businessError

      // 통계 집계
      const regionCounts = regionStats?.reduce((acc: Record<string, number>, item) => {
        acc[item.region] = (acc[item.region] || 0) + 1
        return acc
      }, {}) || {}

      const businessTypeCounts = businessTypeStats?.reduce((acc: Record<string, number>, item) => {
        acc[item.business_type_code] = (acc[item.business_type_code] || 0) + 1
        return acc
      }, {}) || {}

      return NextResponse.json({
        success: true,
        stats: {
          total: totalData?.length || 0,
          by_region: regionCounts,
          by_business_type: businessTypeCounts,
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