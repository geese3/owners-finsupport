import { NextRequest, NextResponse } from 'next/server';

// 워크플로우 단계 정의
interface WorkflowStep {
  id: string;
  name: string;
  type: 'crawl' | 'normalize' | 'validate' | 'transform' | 'save';
  config: any;
  retryCount?: number;
  timeout?: number;
}

// 워크플로우 정의
interface Workflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  schedule?: string;
  enabled: boolean;
  notifications?: string[];
  createdAt: string;
  updatedAt: string;
}

// 워크플로우 실행 상태
interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  currentStep: number;
  startTime: string;
  endTime?: string;
  progress: number;
  results: any[];
  errors: any[];
  logs: string[];
}

// 메모리 저장소 (실제로는 DB 사용)
let workflows: Workflow[] = [];
let executions: WorkflowExecution[] = [];

// 사전 정의된 워크플로우
const PREDEFINED_WORKFLOWS: Workflow[] = [
  {
    id: 'naver_finsupport_full',
    name: '네이버 지원사업 전체 크롤링',
    description: '네이버 내부 API에서 지원사업 데이터를 크롤링하고 정규화/검증하는 전체 파이프라인',
    steps: [
      {
        id: 'crawl_naver',
        name: '네이버 데이터 크롤링',
        type: 'crawl',
        config: {
          api: '/api/crawl-finsupport',
          method: 'GET',
          params: {
            industry: '전체',
            area: '전체',
            page: 1,
            size: 10
          }
        }
      },
      {
        id: 'normalize_data',
        name: '데이터 정규화',
        type: 'normalize',
        config: {
          api: '/api/normalize',
          method: 'POST',
          params: {
            action: 'batch',
            source: 'naver_internal'
          }
        }
      },
      {
        id: 'validate_data',
        name: '데이터 검증',
        type: 'validate',
        config: {
          api: '/api/validate',
          method: 'POST',
          params: {
            action: 'batch',
            source: 'naver_internal'
          }
        }
      }
    ],
    enabled: true,
    notifications: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'naver_batch_crawl',
    name: '네이버 대량 크롤링',
    description: '여러 페이지의 네이버 지원사업 데이터를 배치로 크롤링',
    steps: [
      {
        id: 'batch_crawl_naver',
        name: '네이버 대량 크롤링',
        type: 'crawl',
        config: {
          api: '/api/crawl-finsupport',
          method: 'POST',
          params: {
            industry: '전체',
            area: '전체',
            maxPages: 3
          }
        }
      },
      {
        id: 'normalize_batch',
        name: '배치 데이터 정규화',
        type: 'normalize',
        config: {
          api: '/api/normalize',
          method: 'POST',
          params: {
            action: 'batch',
            source: 'naver_internal'
          }
        }
      },
      {
        id: 'validate_batch',
        name: '배치 데이터 검증',
        type: 'validate',
        config: {
          api: '/api/validate',
          method: 'POST',
          params: {
            action: 'batch',
            source: 'naver_internal'
          }
        }
      }
    ],
    enabled: true,
    notifications: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// 워크플로우 초기화
if (workflows.length === 0) {
  workflows = [...PREDEFINED_WORKFLOWS];
}

// 워크플로우 단계 실행 함수
async function executeStep(step: WorkflowStep, previousResult: any): Promise<any> {
  const { config } = step;
  const baseUrl = process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : process.env.NEXT_PUBLIC_BASE_URL || '';

  try {
    let requestBody: any = undefined;
    let url = baseUrl + config.api;

    if (config.method === 'GET') {
      const params = new URLSearchParams(config.params);
      url += `?${params.toString()}`;
    } else {
      // 이전 단계 결과를 현재 단계의 데이터로 사용
      if (previousResult && step.type !== 'crawl') {
        requestBody = {
          ...config.params,
          data: previousResult.data?.items || previousResult.data || previousResult
        };
      } else {
        requestBody = config.params;
      }
    }

    const response = await fetch(url, {
      method: config.method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: requestBody ? JSON.stringify(requestBody) : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    return result;

  } catch (error) {
    console.error(`단계 ${step.name} 실행 오류:`, error);
    throw error;
  }
}

// 워크플로우 실행 함수
async function executeWorkflow(workflowId: string, params?: any): Promise<string> {
  const workflow = workflows.find(w => w.id === workflowId);
  if (!workflow) {
    throw new Error(`워크플로우를 찾을 수 없습니다: ${workflowId}`);
  }

  const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const execution: WorkflowExecution = {
    id: executionId,
    workflowId,
    status: 'running',
    currentStep: 0,
    startTime: new Date().toISOString(),
    progress: 0,
    results: [],
    errors: [],
    logs: []
  };

  executions.push(execution);

  // 비동기로 워크플로우 실행
  (async () => {
    try {
      let previousResult: any = null;

      for (let i = 0; i < workflow.steps.length; i++) {
        execution.currentStep = i;
        execution.progress = Math.round(((i) / workflow.steps.length) * 100);

        const step = workflow.steps[i];
        execution.logs.push(`${new Date().toISOString()}: 단계 ${i + 1}/${workflow.steps.length} 시작: ${step.name}`);

        try {
          // 파라미터 오버라이드
          if (params && step.type === 'crawl') {
            step.config.params = { ...step.config.params, ...params };
          }

          const result = await executeStep(step, previousResult);
          execution.results.push({
            stepId: step.id,
            stepName: step.name,
            result: result,
            timestamp: new Date().toISOString()
          });

          previousResult = result;
          execution.logs.push(`${new Date().toISOString()}: 단계 ${i + 1}/${workflow.steps.length} 완료: ${step.name}`);

        } catch (stepError) {
          const error = {
            stepId: step.id,
            stepName: step.name,
            error: stepError instanceof Error ? stepError.message : String(stepError),
            timestamp: new Date().toISOString()
          };

          execution.errors.push(error);
          execution.logs.push(`${new Date().toISOString()}: 단계 ${i + 1}/${workflow.steps.length} 실패: ${step.name} - ${error.error}`);

          // 재시도 로직
          if (step.retryCount && step.retryCount > 0) {
            execution.logs.push(`${new Date().toISOString()}: 재시도 준비 중...`);
            // 재시도 구현 (간단히 넘어감)
          }

          // 실패 시 워크플로우 중단
          execution.status = 'failed';
          execution.endTime = new Date().toISOString();
          return;
        }
      }

      execution.status = 'completed';
      execution.progress = 100;
      execution.endTime = new Date().toISOString();
      execution.logs.push(`${new Date().toISOString()}: 워크플로우 완료`);

    } catch (error) {
      execution.status = 'failed';
      execution.endTime = new Date().toISOString();
      execution.errors.push({
        stepId: 'workflow',
        stepName: '워크플로우 실행',
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      });
    }
  })();

  return executionId;
}

// GET: 워크플로우 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const id = searchParams.get('id');
    const executionId = searchParams.get('executionId');

    switch (action) {
      case 'list':
        return NextResponse.json({
          success: true,
          data: {
            workflows: workflows,
            count: workflows.length
          }
        });

      case 'get':
        if (!id) {
          return NextResponse.json(
            { success: false, error: 'id 파라미터가 필요합니다.' },
            { status: 400 }
          );
        }

        const workflow = workflows.find(w => w.id === id);
        if (!workflow) {
          return NextResponse.json(
            { success: false, error: `워크플로우를 찾을 수 없습니다: ${id}` },
            { status: 404 }
          );
        }

        return NextResponse.json({
          success: true,
          data: workflow
        });

      case 'executions':
        const filteredExecutions = executionId
          ? executions.filter(e => e.id === executionId)
          : executions;

        return NextResponse.json({
          success: true,
          data: {
            executions: filteredExecutions,
            count: filteredExecutions.length
          }
        });

      case 'status':
        if (!executionId) {
          return NextResponse.json(
            { success: false, error: 'executionId 파라미터가 필요합니다.' },
            { status: 400 }
          );
        }

        const execution = executions.find(e => e.id === executionId);
        if (!execution) {
          return NextResponse.json(
            { success: false, error: `실행을 찾을 수 없습니다: ${executionId}` },
            { status: 404 }
          );
        }

        return NextResponse.json({
          success: true,
          data: execution
        });

      default:
        return NextResponse.json({
          success: true,
          data: {
            actions: ['list', 'get', 'executions', 'status'],
            description: "워크플로우 관리 API",
            predefinedWorkflows: workflows.map(w => ({ id: w.id, name: w.name, description: w.description }))
          }
        });
    }

  } catch (error) {
    console.error('워크플로우 API 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '워크플로우 조회 중 오류가 발생했습니다.'
      },
      { status: 500 }
    );
  }
}

// POST: 워크플로우 실행 및 관리
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, workflowId, params, workflow } = body;

    switch (action) {
      case 'run':
        if (!workflowId) {
          return NextResponse.json(
            { success: false, error: 'workflowId 파라미터가 필요합니다.' },
            { status: 400 }
          );
        }

        try {
          const executionId = await executeWorkflow(workflowId, params);
          return NextResponse.json({
            success: true,
            data: {
              executionId: executionId,
              message: '워크플로우 실행이 시작되었습니다.',
              statusUrl: `/api/workflow?action=status&executionId=${executionId}`
            }
          });
        } catch (runError) {
          return NextResponse.json(
            {
              success: false,
              error: runError instanceof Error ? runError.message : '워크플로우 실행 중 오류가 발생했습니다.'
            },
            { status: 500 }
          );
        }

      case 'create':
        if (!workflow) {
          return NextResponse.json(
            { success: false, error: 'workflow 파라미터가 필요합니다.' },
            { status: 400 }
          );
        }

        const newWorkflow: Workflow = {
          id: `custom_${Date.now()}`,
          ...workflow,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        workflows.push(newWorkflow);

        return NextResponse.json({
          success: true,
          data: newWorkflow,
          message: '워크플로우가 생성되었습니다.'
        });

      case 'cancel':
        const { executionId } = body;
        if (!executionId) {
          return NextResponse.json(
            { success: false, error: 'executionId 파라미터가 필요합니다.' },
            { status: 400 }
          );
        }

        const execution = executions.find(e => e.id === executionId);
        if (!execution) {
          return NextResponse.json(
            { success: false, error: `실행을 찾을 수 없습니다: ${executionId}` },
            { status: 404 }
          );
        }

        if (execution.status === 'running') {
          execution.status = 'cancelled';
          execution.endTime = new Date().toISOString();
          execution.logs.push(`${new Date().toISOString()}: 사용자에 의해 취소됨`);
        }

        return NextResponse.json({
          success: true,
          data: execution,
          message: '워크플로우 실행이 취소되었습니다.'
        });

      default:
        return NextResponse.json(
          { success: false, error: '지원하지 않는 액션입니다.' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('워크플로우 API 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '워크플로우 처리 중 오류가 발생했습니다.'
      },
      { status: 500 }
    );
  }
}

// DELETE: 워크플로우 삭제
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'id 파라미터가 필요합니다.' },
        { status: 400 }
      );
    }

    const index = workflows.findIndex(w => w.id === id);
    if (index === -1) {
      return NextResponse.json(
        { success: false, error: `워크플로우를 찾을 수 없습니다: ${id}` },
        { status: 404 }
      );
    }

    // 사전 정의된 워크플로우는 삭제 불가
    if (PREDEFINED_WORKFLOWS.find(w => w.id === id)) {
      return NextResponse.json(
        { success: false, error: '사전 정의된 워크플로우는 삭제할 수 없습니다.' },
        { status: 403 }
      );
    }

    workflows.splice(index, 1);

    return NextResponse.json({
      success: true,
      message: `워크플로우 '${id}'가 삭제되었습니다.`
    });

  } catch (error) {
    console.error('워크플로우 삭제 API 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '워크플로우 삭제 중 오류가 발생했습니다.'
      },
      { status: 500 }
    );
  }
}