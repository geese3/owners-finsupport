import { NextRequest, NextResponse } from 'next/server';

// 검증 규칙 인터페이스
interface ValidationRule {
  field: string;
  type: 'required' | 'format' | 'range' | 'length' | 'enum' | 'custom' | 'duplicate';
  message: string;
  params?: any;
  validator?: (value: any, item?: any, dataset?: any[]) => boolean;
}

// 검증 결과 인터페이스
interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  stats: ValidationStats;
}

interface ValidationError {
  field: string;
  rule: string;
  message: string;
  value?: any;
  index?: number;
}

interface ValidationWarning {
  field: string;
  message: string;
  value?: any;
  index?: number;
}

interface ValidationStats {
  totalItems: number;
  validItems: number;
  invalidItems: number;
  errorCount: number;
  warningCount: number;
  completenessScore: number; // 0-100%
  qualityScore: number; // 0-100%
}

// 데이터 소스별 검증 규칙
const VALIDATION_RULES: Record<string, ValidationRule[]> = {
  // 네이버 내부 API 검증 규칙
  "naver_internal": [
    {
      field: "subventionId",
      type: "required",
      message: "지원사업 ID는 필수입니다"
    },
    {
      field: "subventionId",
      type: "format",
      message: "지원사업 ID는 8자리 이상이어야 합니다",
      params: { minLength: 8 }
    },
    {
      field: "지원사업명",
      type: "required",
      message: "지원사업명은 필수입니다"
    },
    {
      field: "지원사업명",
      type: "length",
      message: "지원사업명은 5자 이상이어야 합니다",
      params: { min: 5 }
    },
    {
      field: "접수기관",
      type: "required",
      message: "접수기관은 필수입니다"
    },
    {
      field: "지원금액",
      type: "format",
      message: "지원금액은 유효한 형식이어야 합니다",
      validator: (value) => {
        if (!value || value === "확인 필요") return true;
        return /\d+/.test(String(value));
      }
    },
    {
      field: "접수 마감일",
      type: "format",
      message: "접수 마감일은 YYYY-MM-DD 또는 YYYYMMDD 형식이어야 합니다",
      validator: (value) => {
        if (!value || value === "확인 필요") return true;
        return /^\d{4}-\d{2}-\d{2}$/.test(value) || /^\d{8}$/.test(value);
      }
    },
    {
      field: "공고 URL",
      type: "format",
      message: "공고 URL은 유효한 URL 형식이어야 합니다",
      validator: (value) => {
        if (!value || value === "확인 필요") return true;
        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }
      }
    },
    {
      field: "subventionId",
      type: "duplicate",
      message: "중복된 지원사업 ID입니다",
      validator: (value, item, dataset) => {
        if (!dataset) return true;
        const duplicates = dataset.filter(d => d.subventionId === value);
        return duplicates.length <= 1;
      }
    }
  ],

  // 공공데이터 포털 검증 규칙
  "public_data": [
    {
      field: "bidNtceNo",
      type: "required",
      message: "입찰공고번호는 필수입니다"
    },
    {
      field: "bidNtceNm",
      type: "required",
      message: "입찰공고명은 필수입니다"
    },
    {
      field: "ntceInsttNm",
      type: "required",
      message: "공고기관명은 필수입니다"
    },
    {
      field: "presmptPrce",
      type: "format",
      message: "추정가격은 숫자 형식이어야 합니다",
      validator: (value) => {
        if (!value) return true;
        return !isNaN(Number(value));
      }
    },
    {
      field: "bidNtceDt",
      type: "format",
      message: "입찰공고일시는 YYYYMMDDHHMM 형식이어야 합니다",
      validator: (value) => {
        if (!value) return true;
        return /^\d{12}$/.test(value);
      }
    }
  ],

  // 중소벤처기업부 검증 규칙
  "smes": [
    {
      field: "사업명",
      type: "required",
      message: "사업명은 필수입니다"
    },
    {
      field: "지원기관",
      type: "required",
      message: "지원기관은 필수입니다"
    },
    {
      field: "지원대상",
      type: "required",
      message: "지원대상은 필수입니다"
    },
    {
      field: "접수기간",
      type: "format",
      message: "접수기간은 날짜 형식을 포함해야 합니다",
      validator: (value) => {
        if (!value) return true;
        return /\d{4}/.test(String(value)); // 최소한 연도가 포함되어야 함
      }
    }
  ]
};

// 개별 데이터 검증 함수
function validateItem(item: any, rules: ValidationRule[], index?: number, dataset?: any[]): { errors: ValidationError[], warnings: ValidationWarning[] } {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  for (const rule of rules) {
    const value = item[rule.field];

    switch (rule.type) {
      case 'required':
        if (value === undefined || value === null || value === '' || value === '확인 필요') {
          errors.push({
            field: rule.field,
            rule: 'required',
            message: rule.message,
            value,
            index
          });
        }
        break;

      case 'format':
        if (value && rule.validator && !rule.validator(value, item, dataset)) {
          errors.push({
            field: rule.field,
            rule: 'format',
            message: rule.message,
            value,
            index
          });
        } else if (value && rule.params?.minLength && String(value).length < rule.params.minLength) {
          errors.push({
            field: rule.field,
            rule: 'format',
            message: rule.message,
            value,
            index
          });
        }
        break;

      case 'length':
        if (value && rule.params) {
          const length = String(value).length;
          if (rule.params.min && length < rule.params.min) {
            errors.push({
              field: rule.field,
              rule: 'length',
              message: rule.message,
              value,
              index
            });
          }
          if (rule.params.max && length > rule.params.max) {
            errors.push({
              field: rule.field,
              rule: 'length',
              message: rule.message,
              value,
              index
            });
          }
        }
        break;

      case 'range':
        if (value && rule.params) {
          const num = Number(value);
          if (!isNaN(num)) {
            if (rule.params.min && num < rule.params.min) {
              errors.push({
                field: rule.field,
                rule: 'range',
                message: rule.message,
                value,
                index
              });
            }
            if (rule.params.max && num > rule.params.max) {
              errors.push({
                field: rule.field,
                rule: 'range',
                message: rule.message,
                value,
                index
              });
            }
          }
        }
        break;

      case 'enum':
        if (value && rule.params?.values && !rule.params.values.includes(value)) {
          errors.push({
            field: rule.field,
            rule: 'enum',
            message: rule.message,
            value,
            index
          });
        }
        break;

      case 'custom':
        if (rule.validator && !rule.validator(value, item, dataset)) {
          errors.push({
            field: rule.field,
            rule: 'custom',
            message: rule.message,
            value,
            index
          });
        }
        break;

      case 'duplicate':
        if (rule.validator && !rule.validator(value, item, dataset)) {
          warnings.push({
            field: rule.field,
            message: rule.message,
            value,
            index
          });
        }
        break;
    }
  }

  return { errors, warnings };
}

// 데이터셋 전체 검증 함수
function validateDataset(dataset: any[], rules: ValidationRule[]): ValidationResult {
  const allErrors: ValidationError[] = [];
  const allWarnings: ValidationWarning[] = [];
  let validItems = 0;

  // 각 항목 검증
  for (let i = 0; i < dataset.length; i++) {
    const { errors, warnings } = validateItem(dataset[i], rules, i, dataset);

    if (errors.length === 0) {
      validItems++;
    }

    allErrors.push(...errors);
    allWarnings.push(...warnings);
  }

  // 통계 계산
  const totalItems = dataset.length;
  const invalidItems = totalItems - validItems;
  const errorCount = allErrors.length;
  const warningCount = allWarnings.length;

  // 완성도 점수 (필수 필드가 모두 채워진 비율)
  const requiredFields = rules.filter(r => r.type === 'required').length;
  const completenessScore = totalItems > 0 ? Math.round((validItems / totalItems) * 100) : 0;

  // 품질 점수 (전체 검증 규칙 대비 통과 비율)
  const totalChecks = totalItems * rules.length;
  const passedChecks = totalChecks - errorCount;
  const qualityScore = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 0;

  return {
    isValid: invalidItems === 0,
    errors: allErrors,
    warnings: allWarnings,
    stats: {
      totalItems,
      validItems,
      invalidItems,
      errorCount,
      warningCount,
      completenessScore,
      qualityScore
    }
  };
}

// 데이터 품질 분석 함수
function analyzeDataQuality(dataset: any[]): any {
  const analysis: any = {
    fieldCoverage: {},
    dataTypes: {},
    patterns: {},
    anomalies: []
  };

  if (dataset.length === 0) return analysis;

  const fields = Object.keys(dataset[0]);

  // 필드별 커버리지 분석
  for (const field of fields) {
    const filledCount = dataset.filter(item =>
      item[field] !== undefined &&
      item[field] !== null &&
      item[field] !== '' &&
      item[field] !== '확인 필요'
    ).length;

    analysis.fieldCoverage[field] = {
      total: dataset.length,
      filled: filledCount,
      coverage: Math.round((filledCount / dataset.length) * 100)
    };
  }

  // 데이터 타입 분석
  for (const field of fields) {
    const types: Record<string, number> = {};

    for (const item of dataset) {
      const value = item[field];
      let type = typeof value;

      if (value === null) type = 'null';
      else if (value === '') type = 'empty';
      else if (value === '확인 필요') type = 'placeholder';
      else if (!isNaN(Date.parse(value))) type = 'date-like';
      else if (!isNaN(Number(value)) && isFinite(Number(value))) type = 'number-like';
      else if (typeof value === 'string' && value.startsWith('http')) type = 'url-like';

      types[type] = (types[type] || 0) + 1;
    }

    analysis.dataTypes[field] = types;
  }

  return analysis;
}

// GET: 검증 규칙 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const source = searchParams.get('source');

    switch (action) {
      case 'rules':
        // 특정 소스의 검증 규칙 반환
        if (source && VALIDATION_RULES[source]) {
          return NextResponse.json({
            success: true,
            data: {
              source: source,
              rules: VALIDATION_RULES[source]
            }
          });
        }

        // 전체 규칙 반환
        return NextResponse.json({
          success: true,
          data: {
            sources: Object.keys(VALIDATION_RULES),
            rules: VALIDATION_RULES
          }
        });

      case 'sources':
        // 지원하는 데이터 소스 목록
        return NextResponse.json({
          success: true,
          data: {
            sources: Object.keys(VALIDATION_RULES),
            descriptions: {
              "naver_internal": "네이버 내부 API 데이터 검증",
              "public_data": "공공데이터 포털 API 데이터 검증",
              "smes": "중소벤처기업부 데이터 검증"
            }
          }
        });

      default:
        return NextResponse.json({
          success: true,
          data: {
            actions: ['rules', 'sources'],
            description: "크롤링 결과 검증 API"
          }
        });
    }

  } catch (error) {
    console.error('검증 API 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '검증 규칙 조회 중 오류가 발생했습니다.'
      },
      { status: 500 }
    );
  }
}

// POST: 데이터 검증 실행
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, source, data, rules, options = {} } = body;

    switch (action) {
      case 'validate':
        // 단일 데이터 검증
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

        let validationRules: ValidationRule[];
        if (rules) {
          validationRules = rules;
        } else if (source && VALIDATION_RULES[source]) {
          validationRules = VALIDATION_RULES[source];
        } else {
          return NextResponse.json(
            { success: false, error: `지원하지 않는 데이터 소스입니다: ${source}` },
            { status: 400 }
          );
        }

        const singleData = Array.isArray(data) ? data : [data];
        const result = validateDataset(singleData, validationRules);

        return NextResponse.json({
          success: true,
          data: {
            source: source,
            validation: result,
            originalData: data
          }
        });

      case 'batch':
        // 배치 데이터 검증
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

        let batchRules: ValidationRule[];
        if (rules) {
          batchRules = rules;
        } else if (source && VALIDATION_RULES[source]) {
          batchRules = VALIDATION_RULES[source];
        } else {
          return NextResponse.json(
            { success: false, error: `지원하지 않는 데이터 소스입니다: ${source}` },
            { status: 400 }
          );
        }

        const batchResult = validateDataset(data, batchRules);

        return NextResponse.json({
          success: true,
          data: {
            source: source,
            validation: batchResult,
            totalItems: data.length
          }
        });

      case 'analyze':
        // 데이터 품질 분석
        if (!data || !Array.isArray(data)) {
          return NextResponse.json(
            { success: false, error: 'data는 배열 형태여야 합니다.' },
            { status: 400 }
          );
        }

        const qualityAnalysis = analyzeDataQuality(data);

        return NextResponse.json({
          success: true,
          data: {
            analysis: qualityAnalysis,
            summary: {
              totalItems: data.length,
              totalFields: data.length > 0 ? Object.keys(data[0]).length : 0,
              recommendation: data.length > 100 ? "대용량 데이터셋" : "소규모 데이터셋"
            }
          }
        });

      case 'add_rule':
        // 새로운 검증 규칙 추가
        if (!source || !rules) {
          return NextResponse.json(
            { success: false, error: 'source와 rules 파라미터가 필요합니다.' },
            { status: 400 }
          );
        }

        if (!VALIDATION_RULES[source]) {
          VALIDATION_RULES[source] = [];
        }

        VALIDATION_RULES[source] = rules;

        return NextResponse.json({
          success: true,
          message: `소스 '${source}'의 검증 규칙이 추가되었습니다.`,
          data: VALIDATION_RULES[source]
        });

      default:
        return NextResponse.json(
          { success: false, error: '지원하지 않는 액션입니다.' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('검증 API 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '데이터 검증 중 오류가 발생했습니다.'
      },
      { status: 500 }
    );
  }
}