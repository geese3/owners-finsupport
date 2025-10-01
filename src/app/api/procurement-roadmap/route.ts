import { NextRequest, NextResponse } from 'next/server';

// 공공조달 로드맵 미션 타입 정의 (기존 RoadmapMission과 동일)
export interface ProcurementMission {
  id: string;
  title: string;
  description: string;
  status: 'locked' | 'available' | 'in_progress' | 'completed';
  points: number;
  requiredFiles: string[];
  completedAt?: string;
  uploadedFiles?: string[];
}

// 메모리 저장소 (실제로는 DB 사용)
let procurementMissions: ProcurementMission[] = [
  {
    id: "procurement_01",
    title: "조달청 회원가입",
    description: "나라장터 회원가입을 완료하세요",
    status: "completed",
    points: 50,
    requiredFiles: ["회원가입완료증명서"],
    completedAt: "2024-01-15",
    uploadedFiles: ["membership_certificate.pdf"]
  },
  {
    id: "procurement_02",
    title: "사업자 등록",
    description: "조달청에 사업자 정보를 등록하세요",
    status: "available",
    points: 100,
    requiredFiles: ["사업자등록증", "통장사본"]
  },
  {
    id: "procurement_03",
    title: "업종 등록",
    description: "조달 가능한 업종코드를 등록하세요",
    status: "available",
    points: 150,
    requiredFiles: ["업종등록신청서", "사업실적증명서"]
  },
  {
    id: "procurement_04",
    title: "조달물품 등록",
    description: "판매할 물품을 조달청에 등록하세요",
    status: "available",
    points: 200,
    requiredFiles: ["물품등록신청서", "물품설명서", "가격증빙서류"]
  },
  {
    id: "procurement_05",
    title: "품질보증서 등록",
    description: "품질보증 관련 서류를 등록하세요",
    status: "available",
    points: 150,
    requiredFiles: ["품질보증서", "품질인증서"]
  },
  {
    id: "procurement_06",
    title: "계약이행능력 심사",
    description: "계약이행능력 심사를 통과하세요",
    status: "available",
    points: 300,
    requiredFiles: ["재무제표", "이행실적증명서", "기술능력증명서"]
  },
  {
    id: "procurement_07",
    title: "전자카탈로그 등록",
    description: "전자카탈로그에 상품을 등록하세요",
    status: "available",
    points: 250,
    requiredFiles: ["상품카탈로그", "가격표", "상품이미지"]
  },
  {
    id: "procurement_08",
    title: "입찰참가 자격등록",
    description: "공개입찰 참가자격을 등록하세요",
    status: "available",
    points: 200,
    requiredFiles: ["입찰참가자격등록신청서", "회사소개서"]
  },
  {
    id: "procurement_09",
    title: "첫 계약 체결",
    description: "첫 공공조달 계약을 체결하세요",
    status: "available",
    points: 400,
    requiredFiles: ["계약체결확인서", "납품확인서"]
  },
  {
    id: "procurement_10",
    title: "벤처나라 회원가입",
    description: "벤처나라(벤처IN)에 회원가입하고 기업정보를 등록하세요",
    status: "available",
    points: 100,
    requiredFiles: ["벤처나라가입증명서", "기업정보등록완료증명서"]
  },
  {
    id: "procurement_11",
    title: "비즈온 업체등록",
    description: "비즈온(BizON)에 공급업체로 등록하세요",
    status: "available",
    points: 150,
    requiredFiles: ["비즈온업체등록증명서", "공급능력평가서"]
  },
  {
    id: "procurement_12",
    title: "혁신제품 지정",
    description: "혁신제품 또는 우수제품으로 지정받으세요",
    status: "available",
    points: 400,
    requiredFiles: ["혁신제품지정서", "제품성능증명서", "기술혁신성평가서"]
  },
  {
    id: "procurement_13",
    title: "조달우수제품 등록",
    description: "조달우수제품으로 등록하여 우선구매 혜택을 받으세요",
    status: "available",
    points: 350,
    requiredFiles: ["우수제품등록신청서", "품질시험성적서"]
  },
  {
    id: "procurement_14",
    title: "우수공급업체 등록",
    description: "우수공급업체로 등록되세요",
    status: "available",
    points: 500,
    requiredFiles: ["우수공급업체신청서", "실적증명서", "고객만족도조사결과"]
  },
  {
    id: "procurement_15",
    title: "벤처기업확인서 연계",
    description: "벤처기업확인서를 조달청에 연계 등록하세요",
    status: "available",
    points: 200,
    requiredFiles: ["벤처기업확인서", "연계등록신청서"]
  }
];

// GET: 공공조달 로드맵 미션 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const missionId = searchParams.get('missionId');

    if (missionId) {
      // 특정 미션 조회
      const mission = procurementMissions.find(m => m.id === missionId);
      if (!mission) {
        return NextResponse.json(
          { success: false, error: '미션을 찾을 수 없습니다.' },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        data: mission
      });
    } else {
      // 전체 미션 조회
      const totalPoints = procurementMissions
        .filter(m => m.status === 'completed')
        .reduce((sum, m) => sum + m.points, 0);

      return NextResponse.json({
        success: true,
        data: {
          missions: procurementMissions,
          totalPoints,
          completedCount: procurementMissions.filter(m => m.status === 'completed').length,
          availableCount: procurementMissions.filter(m => m.status === 'available').length
        }
      });
    }
  } catch (error) {
    console.error('공공조달 로드맵 API 오류:', error);
    return NextResponse.json(
      { success: false, error: '공공조달 로드맵 데이터 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// POST: 미션 완료 처리
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { missionId, uploadedFiles } = body;

    if (!missionId || !uploadedFiles) {
      return NextResponse.json(
        { success: false, error: '필수 파라미터가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 미션 찾기
    const missionIndex = procurementMissions.findIndex(m => m.id === missionId);
    if (missionIndex === -1) {
      return NextResponse.json(
        { success: false, error: '미션을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const mission = procurementMissions[missionIndex];
    if (mission.status !== 'available' && mission.status !== 'in_progress') {
      return NextResponse.json(
        { success: false, error: '진행할 수 없는 미션입니다.' },
        { status: 400 }
      );
    }

    // 미션 완료 처리
    procurementMissions[missionIndex] = {
      ...mission,
      status: 'completed',
      uploadedFiles: uploadedFiles.map((file: File) => file.name),
      completedAt: new Date().toISOString().split('T')[0]
    };

    // 업데이트된 전체 데이터 반환
    const totalPoints = procurementMissions
      .filter(m => m.status === 'completed')
      .reduce((sum, m) => sum + m.points, 0);

    return NextResponse.json({
      success: true,
      data: {
        completedMission: procurementMissions[missionIndex],
        totalPoints,
        earnedPoints: mission.points,
        missions: procurementMissions
      },
      message: `${mission.title} 미션을 완료했습니다! +${mission.points}P`
    });

  } catch (error) {
    console.error('공공조달 미션 완료 API 오류:', error);
    return NextResponse.json(
      { success: false, error: '미션 완료 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// PUT: 미션 상태 업데이트
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { missionId, status } = body;

    if (!missionId || !status) {
      return NextResponse.json(
        { success: false, error: '필수 파라미터가 누락되었습니다.' },
        { status: 400 }
      );
    }

    const missionIndex = procurementMissions.findIndex(m => m.id === missionId);
    if (missionIndex === -1) {
      return NextResponse.json(
        { success: false, error: '미션을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 미션 상태 업데이트
    procurementMissions[missionIndex] = {
      ...procurementMissions[missionIndex],
      status
    };

    return NextResponse.json({
      success: true,
      data: procurementMissions[missionIndex],
      message: '미션 상태가 업데이트되었습니다.'
    });

  } catch (error) {
    console.error('공공조달 미션 상태 업데이트 API 오류:', error);
    return NextResponse.json(
      { success: false, error: '미션 상태 업데이트 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}