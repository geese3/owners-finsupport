import { NextRequest, NextResponse } from 'next/server';

// 투자 로드맵 미션 타입 정의
export interface InvestmentMission {
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
let investmentMissions: InvestmentMission[] = [
  {
    id: "investment_01",
    title: "엔젤투자 & 시드투자",
    description: "초기 아이디어와 MVP로 엔젤투자 또는 시드투자를 유치하세요",
    status: "completed",
    points: 500,
    requiredFiles: ["투자계약서", "투자금입금확인서", "사업계획서"],
    completedAt: "2024-01-15",
    uploadedFiles: ["angel_investment_contract.pdf"]
  },
  {
    id: "investment_02",
    title: "프리팁스 (Pre-TIPS)",
    description: "TIPS 도약 이전 단계로 민간액셀러레이터와 프로그램을 진행하세요",
    status: "available",
    points: 300,
    requiredFiles: ["프리팁스선정서", "액셀러레이터계약서", "데모데이발표자료"]
  },
  {
    id: "investment_03",
    title: "팁스 (TIPS)",
    description: "TIPS 프로그램에 선정되어 정부 매칭펀드를 받으세요",
    status: "available",
    points: 800,
    requiredFiles: ["TIPS선정서", "정부지원확인서", "민간투자유치증명서"]
  },
  {
    id: "investment_04",
    title: "시리즈 A",
    description: "제품 검증 완료 후 본격적인 성장을 위한 시리즈 A 투자를 유치하세요",
    status: "available",
    points: 1000,
    requiredFiles: ["시리즈A투자계약서", "실사자료", "재무제표", "사업실적보고서"]
  },
  {
    id: "investment_05",
    title: "시리즈 B",
    description: "시장 확장과 규모의 경제를 위한 시리즈 B 투자를 유치하세요",
    status: "available",
    points: 1500,
    requiredFiles: ["시리즈B투자계약서", "시장확장계획서", "재무성과보고서"]
  },
  {
    id: "investment_06",
    title: "시리즈 C",
    description: "글로벌 확장과 신사업 개발을 위한 시리즈 C 투자를 유치하세요",
    status: "available",
    points: 2000,
    requiredFiles: ["시리즈C투자계약서", "글로벌확장계획서", "신사업개발계획서"]
  },
  {
    id: "investment_07",
    title: "시리즈 D",
    description: "IPO 준비 또는 대규모 확장을 위한 시리즈 D 투자를 유치하세요",
    status: "available",
    points: 2500,
    requiredFiles: ["시리즈D투자계약서", "IPO준비계획서", "대규모확장계획서"]
  },
  {
    id: "investment_08",
    title: "상장(IPO) 또는 M&A",
    description: "IPO를 통한 상장 또는 전략적 M&A로 Exit을 달성하세요",
    status: "available",
    points: 5000,
    requiredFiles: ["상장승인서", "M&A계약서", "기업공개신고서", "Exit확인서"]
  }
];

// GET: 투자 로드맵 미션 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const missionId = searchParams.get('missionId');

    if (missionId) {
      // 특정 미션 조회
      const mission = investmentMissions.find(m => m.id === missionId);
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
      const totalPoints = investmentMissions
        .filter(m => m.status === 'completed')
        .reduce((sum, m) => sum + m.points, 0);

      return NextResponse.json({
        success: true,
        data: {
          missions: investmentMissions,
          totalPoints,
          completedCount: investmentMissions.filter(m => m.status === 'completed').length,
          availableCount: investmentMissions.filter(m => m.status === 'available').length
        }
      });
    }
  } catch (error) {
    console.error('투자 로드맵 API 오류:', error);
    return NextResponse.json(
      { success: false, error: '투자 로드맵 데이터 조회 중 오류가 발생했습니다.' },
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
    const missionIndex = investmentMissions.findIndex(m => m.id === missionId);
    if (missionIndex === -1) {
      return NextResponse.json(
        { success: false, error: '미션을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const mission = investmentMissions[missionIndex];
    if (mission.status !== 'available' && mission.status !== 'in_progress') {
      return NextResponse.json(
        { success: false, error: '진행할 수 없는 미션입니다.' },
        { status: 400 }
      );
    }

    // 미션 완료 처리
    investmentMissions[missionIndex] = {
      ...mission,
      status: 'completed',
      uploadedFiles: uploadedFiles.map((file: File) => file.name),
      completedAt: new Date().toISOString().split('T')[0]
    };

    // 업데이트된 전체 데이터 반환
    const totalPoints = investmentMissions
      .filter(m => m.status === 'completed')
      .reduce((sum, m) => sum + m.points, 0);

    return NextResponse.json({
      success: true,
      data: {
        completedMission: investmentMissions[missionIndex],
        totalPoints,
        earnedPoints: mission.points,
        missions: investmentMissions
      },
      message: `${mission.title} 미션을 완료했습니다! +${mission.points}P`
    });

  } catch (error) {
    console.error('투자 미션 완료 API 오류:', error);
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

    const missionIndex = investmentMissions.findIndex(m => m.id === missionId);
    if (missionIndex === -1) {
      return NextResponse.json(
        { success: false, error: '미션을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 미션 상태 업데이트
    investmentMissions[missionIndex] = {
      ...investmentMissions[missionIndex],
      status
    };

    return NextResponse.json({
      success: true,
      data: investmentMissions[missionIndex],
      message: '미션 상태가 업데이트되었습니다.'
    });

  } catch (error) {
    console.error('투자 미션 상태 업데이트 API 오류:', error);
    return NextResponse.json(
      { success: false, error: '미션 상태 업데이트 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}