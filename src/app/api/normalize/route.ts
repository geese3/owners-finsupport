import { NextRequest, NextResponse } from 'next/server';

// 정규화 규칙 정의
interface NormalizationRule {
  field: string;
  type: 'currency' | 'date' | 'text' | 'phone' | 'email' | 'url' | 'enum' | 'number';
  required?: boolean;
  defaultValue?: any;
  validation?: RegExp;
  transform?: (value: any) => any;
  enumValues?: string[];
}

// 사이트별 정규화 규칙
const NORMALIZATION_RULES: Record<string, NormalizationRule[]> = {
  // 네이버 내부 API 데이터 정규화
  "naver_internal": [
    {
      field: "subventionId",
      type: "text",
      required: true,
      transform: (value) => String(value).trim()
    },
    {
      field: "지역",
      type: "text",
      required: true,
      defaultValue: "확인 필요",
      transform: (value) => value || "확인 필요"
    },
    {
      field: "접수기관",
      type: "text",
      required: true,
      defaultValue: "확인 필요"
    },
    {
      field: "지원사업명",
      type: "text",
      required: true,
      defaultValue: "확인 필요"
    },
    {
      field: "지원금액",
      type: "currency",
      required: false,
      defaultValue: "확인 필요",
      transform: (value) => {
        if (!value || value === "확인 필요") return "확인 필요";
        if (typeof value === 'number') {
          return `${value.toLocaleString()} 원`;
        }
        return String(value);
      }
    },
    {
      field: "접수 마감일",
      type: "date",
      required: false,
      defaultValue: "확인 필요",
      validation: /^\d{8}$/,
      transform: (value) => {
        if (!value || value === "확인 필요") return "확인 필요";
        // YYYYMMDD 형식을 YYYY-MM-DD 형식으로 변환
        if (/^\d{8}$/.test(value)) {
          return `${value.substr(0, 4)}-${value.substr(4, 2)}-${value.substr(6, 2)}`;
        }
        return value;
      }
    },
    {
      field: "공고 URL",
      type: "url",
      required: false,
      defaultValue: "확인 필요",
      validation: /^https?:\/\/.+/,
      transform: (value) => {
        if (!value || value === "확인 필요") return "확인 필요";
        // URL 형식 검증 및 정규화
        try {
          const url = new URL(value);
          return url.toString();
        } catch {
          return value;
        }
      }
    }
  ],

  // 공공데이터 포털 API 데이터 정규화
  "public_data": [
    {
      field: "bidNtceNo",
      type: "text",
      required: true
    },
    {
      field: "bidNtceNm",
      type: "text",
      required: true
    },
    {
      field: "ntceInsttNm",
      type: "text",
      required: true
    },
    {
      field: "presmptPrce",
      type: "currency",
      transform: (value) => {
        if (!value) return "";
        const num = Number(value);
        return isNaN(num) ? String(value) : num.toLocaleString();
      }
    },
    {
      field: "bidNtceDt",
      type: "date",
      validation: /^\d{12}$/,
      transform: (value) => {
        if (!value) return "";
        // YYYYMMDDHHMM 형식을 YYYY-MM-DD HH:MM 형식으로 변환
        if (/^\d{12}$/.test(value)) {
          return `${value.substr(0, 4)}-${value.substr(4, 2)}-${value.substr(6, 2)} ${value.substr(8, 2)}:${value.substr(10, 2)}`;
        }
        return value;
      }
    }
  ],

  // 중소벤처기업부 데이터 정규화
  "smes": [
    {
      field: "사업명",
      type: "text",
      required: true
    },
    {
      field: "지원기관",
      type: "text",
      required: true
    },
    {
      field: "지원대상",
      type: "text",
      required: true
    },
    {
      field: "지원규모",
      type: "currency",
      transform: (value) => {
        if (!value) return "확인 필요";
        // 억원, 만원 등의 단위 처리
        const koreanUnits = {
          '억': 100000000,
          '만': 10000,
          '천': 1000
        };

        let result = String(value);
        for (const [unit, multiplier] of Object.entries(koreanUnits)) {
          if (result.includes(unit)) {
            const match = result.match(new RegExp(`(\\d+(?:\\.\\d+)?)${unit}`));
            if (match) {
              const amount = parseFloat(match[1]) * multiplier;
              result = result.replace(match[0], `${amount.toLocaleString()}원`);
            }
          }
        }
        return result;
      }
    }
  ]
};

// 데이터 정규화 함수
function normalizeData(data: any, rules: NormalizationRule[]): any {
  const normalized: any = {};

  for (const rule of rules) {
    let value = data[rule.field];

    // 필수 필드 체크
    if (rule.required && (value === undefined || value === null || value === '')) {
      if (rule.defaultValue !== undefined) {
        value = rule.defaultValue;
      } else {
        throw new Error(`필수 필드가 누락되었습니다: ${rule.field}`);
      }
    }

    // 기본값 적용
    if ((value === undefined || value === null || value === '') && rule.defaultValue !== undefined) {
      value = rule.defaultValue;
    }

    // 변환 함수 적용
    if (rule.transform && value !== undefined && value !== null) {
      value = rule.transform(value);
    }

    // 유효성 검증
    if (rule.validation && value && !rule.validation.test(String(value))) {
      console.warn(`필드 ${rule.field}의 값이 유효하지 않습니다: ${value}`);
    }

    // enum 값 검증
    if (rule.enumValues && value && !rule.enumValues.includes(value)) {
      console.warn(`필드 ${rule.field}의 값이 허용된 값이 아닙니다: ${value}`);
    }

    normalized[rule.field] = value;
  }

  // 규칙에 없는 필드도 그대로 포함
  for (const [key, value] of Object.entries(data)) {
    if (!rules.find(rule => rule.field === key)) {
      normalized[key] = value;
    }
  }

  return normalized;
}

// 배치 정규화 함수
function normalizeBatch(items: any[], rules: NormalizationRule[]): any[] {
  const results = [];
  const errors = [];

  for (let i = 0; i < items.length; i++) {
    try {
      const normalized = normalizeData(items[i], rules);
      results.push({
        index: i,
        success: true,
        data: normalized
      });
    } catch (error) {
      errors.push({
        index: i,
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        originalData: items[i]
      });
    }
  }

  return results;
}

// GET: 정규화 규칙 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const source = searchParams.get('source');

    switch (action) {
      case 'rules':
        // 특정 소스의 정규화 규칙 반환
        if (source && NORMALIZATION_RULES[source]) {
          return NextResponse.json({
            success: true,
            data: {
              source: source,
              rules: NORMALIZATION_RULES[source]
            }
          });
        }

        // 전체 규칙 반환
        return NextResponse.json({
          success: true,
          data: {
            sources: Object.keys(NORMALIZATION_RULES),
            rules: NORMALIZATION_RULES
          }
        });

      case 'sources':
        // 지원하는 데이터 소스 목록
        return NextResponse.json({
          success: true,
          data: {
            sources: Object.keys(NORMALIZATION_RULES),
            descriptions: {
              "naver_internal": "네이버 내부 API 데이터",
              "public_data": "공공데이터 포털 API 데이터",
              "smes": "중소벤처기업부 데이터"
            }
          }
        });

      default:
        return NextResponse.json({
          success: true,
          data: {
            actions: ['rules', 'sources'],
            description: "데이터 정규화/표준화 API"
          }
        });
    }

  } catch (error) {
    console.error('정규화 API 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '정규화 규칙 조회 중 오류가 발생했습니다.'
      },
      { status: 500 }
    );
  }
}

// POST: 데이터 정규화 실행
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, source, data, rules } = body;

    switch (action) {
      case 'normalize':
        // 단일 데이터 정규화
        if (!source && !rules) {
          return NextResponse.json(
            { success: false, error: 'source 또는 rules 파라미터가 필요합니다.' },
            { status: 400 }
          );
        }

        if (!data) {
          return NextResponse.json(
            { success: false, error: 'data 파라미터가 필요합니다.' },
            { status: 400 }
          );
        }

        let normalizationRules: NormalizationRule[];
        if (rules) {
          normalizationRules = rules;
        } else if (source && NORMALIZATION_RULES[source]) {
          normalizationRules = NORMALIZATION_RULES[source];
        } else {
          return NextResponse.json(
            { success: false, error: `지원하지 않는 데이터 소스입니다: ${source}` },
            { status: 400 }
          );
        }

        try {
          const normalized = normalizeData(data, normalizationRules);
          return NextResponse.json({
            success: true,
            data: {
              source: source,
              original: data,
              normalized: normalized
            }
          });
        } catch (normalizationError) {
          return NextResponse.json(
            {
              success: false,
              error: normalizationError instanceof Error ? normalizationError.message : '정규화 중 오류가 발생했습니다.',
              data: data
            },
            { status: 422 }
          );
        }

      case 'batch':
        // 배치 데이터 정규화
        if (!source && !rules) {
          return NextResponse.json(
            { success: false, error: 'source 또는 rules 파라미터가 필요합니다.' },
            { status: 400 }
          );
        }

        if (!data || !Array.isArray(data)) {
          return NextResponse.json(
            { success: false, error: 'data는 배열 형태여야 합니다.' },
            { status: 400 }
          );
        }

        let batchRules: NormalizationRule[];
        if (rules) {
          batchRules = rules;
        } else if (source && NORMALIZATION_RULES[source]) {
          batchRules = NORMALIZATION_RULES[source];
        } else {
          return NextResponse.json(
            { success: false, error: `지원하지 않는 데이터 소스입니다: ${source}` },
            { status: 400 }
          );
        }

        const batchResults = normalizeBatch(data, batchRules);
        const successCount = batchResults.filter(r => r.success).length;
        const errorCount = batchResults.filter(r => !r.success).length;

        return NextResponse.json({
          success: true,
          data: {
            source: source,
            totalItems: data.length,
            successCount: successCount,
            errorCount: errorCount,
            results: batchResults
          }
        });

      case 'add_rule':
        // 새로운 정규화 규칙 추가
        if (!source || !rules) {
          return NextResponse.json(
            { success: false, error: 'source와 rules 파라미터가 필요합니다.' },
            { status: 400 }
          );
        }

        if (!NORMALIZATION_RULES[source]) {
          NORMALIZATION_RULES[source] = [];
        }

        NORMALIZATION_RULES[source] = rules;

        return NextResponse.json({
          success: true,
          message: `소스 '${source}'의 정규화 규칙이 추가되었습니다.`,
          data: NORMALIZATION_RULES[source]
        });

      default:
        return NextResponse.json(
          { success: false, error: '지원하지 않는 액션입니다.' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('정규화 API 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '데이터 정규화 중 오류가 발생했습니다.'
      },
      { status: 500 }
    );
  }
}