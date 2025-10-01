import { NextRequest, NextResponse } from 'next/server';

// 로드맵 미션 타입 정의
export interface RoadmapMission {
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
let roadmapMissions: RoadmapMission[] = [
  {
    id: "mission_01",
    title: "기업 설립",
    description: "사업자등록증을 업로드하여 기업 설립을 인증하세요",
    status: "completed",
    points: 100,
    requiredFiles: ["사업자등록증"],
    completedAt: "2024-01-15",
    uploadedFiles: ["business_registration.pdf"]
  },
  {
    id: "mission_02",
    title: "연구소 설립",
    description: "기업부설연구소 설립 신고서를 업로드하세요",
    status: "available",
    points: 150,
    requiredFiles: ["연구소설립신고서", "연구소현황신고서"]
  },
  {
    id: "mission_03",
    title: "특허 등록",
    description: "특허증 또는 실용신안증을 업로드하세요",
    status: "available",
    points: 200,
    requiredFiles: ["특허증", "실용신안증"]
  },
  {
    id: "mission_04",
    title: "정책자금 실행",
    description: "정책자금 대출 승인서를 업로드하세요",
    status: "available",
    points: 120,
    requiredFiles: ["대출승인서", "자금지원확인서"]
  },
  {
    id: "mission_05",
    title: "고용 증대",
    description: "고용보험 가입자 명부를 업로드하세요 (5명 이상)",
    status: "available",
    points: 100,
    requiredFiles: ["고용보험가입자명부", "4대보험가입확인서"]
  },
  {
    id: "mission_06",
    title: "벤처기업인증",
    description: "벤처기업 확인서를 업로드하세요",
    status: "available",
    points: 300,
    requiredFiles: ["벤처기업확인서"]
  },
  {
    id: "mission_07",
    title: "초기창업패키지",
    description: "초기창업패키지 선정 확인서를 업로드하세요",
    status: "available",
    points: 400,
    requiredFiles: ["창업패키지선정확인서", "사업계획서"]
  },
  {
    id: "mission_08",
    title: "ISO 인증",
    description: "ISO 9001 또는 ISO 14001 인증서를 업로드하세요",
    status: "available",
    points: 250,
    requiredFiles: ["ISO인증서"]
  },
  {
    id: "mission_09",
    title: "이노비즈/메인비즈 인증",
    description: "이노비즈 또는 메인비즈 인증서를 업로드하세요",
    status: "available",
    points: 200,
    requiredFiles: ["이노비즈인증서", "메인비즈인증서"]
  },
  {
    id: "mission_10",
    title: "Scale Up",
    description: "창업도약패키지 선정 확인서를 업로드하세요",
    status: "available",
    points: 500,
    requiredFiles: ["창업도약패키지선정확인서", "사업실적보고서"]
  }
];

// GET: 로드맵 미션 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const missionId = searchParams.get('missionId');

    if (missionId) {
      // 특정 미션 조회
      const mission = roadmapMissions.find(m => m.id === missionId);
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
      const totalPoints = roadmapMissions
        .filter(m => m.status === 'completed')
        .reduce((sum, m) => sum + m.points, 0);

      return NextResponse.json({
        success: true,
        data: {
          missions: roadmapMissions,
          totalPoints,
          completedCount: roadmapMissions.filter(m => m.status === 'completed').length,
          availableCount: roadmapMissions.filter(m => m.status === 'available').length
        }
      });
    }
  } catch (error) {
    console.error('로드맵 API 오류:', error);
    return NextResponse.json(
      { success: false, error: '로드맵 데이터 조회 중 오류가 발생했습니다.' },
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
    const missionIndex = roadmapMissions.findIndex(m => m.id === missionId);
    if (missionIndex === -1) {
      return NextResponse.json(
        { success: false, error: '미션을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const mission = roadmapMissions[missionIndex];
    if (mission.status !== 'available' && mission.status !== 'in_progress') {
      return NextResponse.json(
        { success: false, error: '진행할 수 없는 미션입니다.' },
        { status: 400 }
      );
    }

    // 미션 완료 처리
    roadmapMissions[missionIndex] = {
      ...mission,
      status: 'completed',
      uploadedFiles: uploadedFiles.map((file: File) => file.name),
      completedAt: new Date().toISOString().split('T')[0]
    };

    // 업데이트된 전체 데이터 반환
    const totalPoints = roadmapMissions
      .filter(m => m.status === 'completed')
      .reduce((sum, m) => sum + m.points, 0);

    return NextResponse.json({
      success: true,
      data: {
        completedMission: roadmapMissions[missionIndex],
        totalPoints,
        earnedPoints: mission.points,
        missions: roadmapMissions
      },
      message: `${mission.title} 미션을 완료했습니다! +${mission.points}P`
    });

  } catch (error) {
    console.error('미션 완료 API 오류:', error);
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

    const missionIndex = roadmapMissions.findIndex(m => m.id === missionId);
    if (missionIndex === -1) {
      return NextResponse.json(
        { success: false, error: '미션을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 미션 상태 업데이트
    roadmapMissions[missionIndex] = {
      ...roadmapMissions[missionIndex],
      status
    };

    return NextResponse.json({
      success: true,
      data: roadmapMissions[missionIndex],
      message: '미션 상태가 업데이트되었습니다.'
    });

  } catch (error) {
    console.error('미션 상태 업데이트 API 오류:', error);
    return NextResponse.json(
      { success: false, error: '미션 상태 업데이트 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}