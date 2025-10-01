'use client';

import React, { useState } from 'react';

interface EnhancedUserProfile {
  // 기업 기본 정보
  employeeCount: string;
  annualRevenue: string;
  establishedYear: string;
  mainBusiness: string;
  products: string;

  // 기술/역량 정보
  certifications: string[];
  rdInvestment: string;
  rdEmployees: string;
  patents: string;

  // 사업 방향성
  businessPlan: string;
  investmentPriorities: string[];
  interestAreas: string[];

  // 지원사업 선호도
  preferredSupportTypes: string[];
  preferredInstitutions: string[];
  pastExperience: string;
}

interface EnhancedProfileFormProps {
  onSubmit: (profile: EnhancedUserProfile) => void;
  onClose: () => void;
  className?: string;
}

export const EnhancedProfileForm: React.FC<EnhancedProfileFormProps> = ({
  onSubmit,
  onClose,
  className = ''
}) => {
  const [formData, setFormData] = useState<EnhancedUserProfile>({
    employeeCount: '',
    annualRevenue: '',
    establishedYear: '',
    mainBusiness: '',
    products: '',
    certifications: [],
    rdInvestment: '',
    rdEmployees: '',
    patents: '',
    businessPlan: '',
    investmentPriorities: [],
    interestAreas: [],
    preferredSupportTypes: [],
    preferredInstitutions: [],
    pastExperience: ''
  });

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // 선택 옵션들
  const employeeOptions = ['1-9명', '10-49명', '50-299명', '300명 이상'];
  const revenueOptions = ['1억원 미만', '1-10억원', '10-100억원', '100억원 이상'];
  const certificationOptions = ['벤처기업', '이노비즈', '메인비즈', 'ISO 9001', 'ISO 14001', 'ISO 45001', '여성기업인증', '기타'];
  const rdInvestmentOptions = ['투자 없음', '연매출의 1% 미만', '1-3%', '3-5%', '5% 이상'];
  const investmentPriorityOptions = ['R&D', '설비투자', '인력채용', '마케팅', '해외진출', 'IT/디지털화'];
  const interestAreaOptions = ['스마트팩토리', '친환경/ESG', '디지털전환', '바이오', '신소재', 'AI/빅데이터'];
  const supportTypeOptions = ['자금지원', '컨설팅', '교육/훈련', '인증지원', '해외진출', '네트워킹'];
  const institutionOptions = ['중소벤처기업부', '산업통상자원부', '과학기술정보통신부', '환경부', '지방자치단체'];

  const handleInputChange = (field: keyof EnhancedUserProfile, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCheckboxChange = (field: keyof EnhancedUserProfile, option: string) => {
    const currentArray = formData[field] as string[];
    const updatedArray = currentArray.includes(option)
      ? currentArray.filter(item => item !== option)
      : [...currentArray, option];

    setFormData(prev => ({
      ...prev,
      [field]: updatedArray
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">기업 기본 정보</h3>

            {/* 직원 수 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">직원 수</label>
              <div className="grid grid-cols-2 gap-2">
                {employeeOptions.map(option => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleInputChange('employeeCount', option)}
                    className={`p-2 text-sm border rounded-md transition-colors ${
                      formData.employeeCount === option
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* 연매출 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">연매출</label>
              <div className="grid grid-cols-2 gap-2">
                {revenueOptions.map(option => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleInputChange('annualRevenue', option)}
                    className={`p-2 text-sm border rounded-md transition-colors ${
                      formData.annualRevenue === option
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* 설립연도 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">설립연도</label>
              <input
                type="number"
                min="1900"
                max="2025"
                value={formData.establishedYear}
                onChange={(e) => handleInputChange('establishedYear', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="예: 2020"
              />
            </div>

            {/* 주력 사업 분야 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">주력 사업 분야</label>
              <input
                type="text"
                value={formData.mainBusiness}
                onChange={(e) => handleInputChange('mainBusiness', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="예: 자동차 부품 제조"
              />
            </div>

            {/* 주요 제품/서비스 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">주요 제품/서비스</label>
              <textarea
                value={formData.products}
                onChange={(e) => handleInputChange('products', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="주요 제품이나 서비스를 간단히 설명해주세요"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">기술/역량 정보</h3>

            {/* 보유 인증 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">보유 인증 (중복 선택 가능)</label>
              <div className="grid grid-cols-2 gap-2">
                {certificationOptions.map(option => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleCheckboxChange('certifications', option)}
                    className={`p-2 text-sm border rounded-md transition-colors ${
                      formData.certifications.includes(option)
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* R&D 투자 현황 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">R&D 투자 규모</label>
              <div className="grid grid-cols-1 gap-2">
                {rdInvestmentOptions.map(option => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleInputChange('rdInvestment', option)}
                    className={`p-2 text-sm border rounded-md transition-colors ${
                      formData.rdInvestment === option
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* R&D 인력 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">R&D 전담 인력 수</label>
              <input
                type="number"
                min="0"
                value={formData.rdEmployees}
                onChange={(e) => handleInputChange('rdEmployees', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="명"
              />
            </div>

            {/* 특허/지적재산권 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">보유 특허/지적재산권 수</label>
              <input
                type="text"
                value={formData.patents}
                onChange={(e) => handleInputChange('patents', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="예: 특허 5건, 상표권 2건"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">사업 방향성</h3>

            {/* 향후 3년 사업 계획 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">향후 3년 주요 사업 계획</label>
              <textarea
                value={formData.businessPlan}
                onChange={(e) => handleInputChange('businessPlan', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="향후 3년간의 주요 사업 계획이나 목표를 간단히 작성해주세요"
              />
            </div>

            {/* 투자 우선순위 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">투자 우선순위 분야 (중복 선택 가능)</label>
              <div className="grid grid-cols-2 gap-2">
                {investmentPriorityOptions.map(option => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleCheckboxChange('investmentPriorities', option)}
                    className={`p-2 text-sm border rounded-md transition-colors ${
                      formData.investmentPriorities.includes(option)
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* 관심 분야 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">관심 기술/트렌드 분야 (중복 선택 가능)</label>
              <div className="grid grid-cols-2 gap-2">
                {interestAreaOptions.map(option => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleCheckboxChange('interestAreas', option)}
                    className={`p-2 text-sm border rounded-md transition-colors ${
                      formData.interestAreas.includes(option)
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">지원사업 선호도</h3>

            {/* 선호 지원 형태 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">선호하는 지원 형태 (중복 선택 가능)</label>
              <div className="grid grid-cols-2 gap-2">
                {supportTypeOptions.map(option => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleCheckboxChange('preferredSupportTypes', option)}
                    className={`p-2 text-sm border rounded-md transition-colors ${
                      formData.preferredSupportTypes.includes(option)
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* 선호 지원 기관 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">선호하는 지원 기관 (중복 선택 가능)</label>
              <div className="grid grid-cols-1 gap-2">
                {institutionOptions.map(option => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleCheckboxChange('preferredInstitutions', option)}
                    className={`p-2 text-sm border rounded-md transition-colors ${
                      formData.preferredInstitutions.includes(option)
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* 과거 지원사업 경험 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">과거 지원사업 참여 경험</label>
              <textarea
                value={formData.pastExperience}
                onChange={(e) => handleInputChange('pastExperience', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="과거에 참여한 지원사업이나 관련 경험을 간단히 작성해주세요 (선택사항)"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      <div className="p-6">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">맞춤형 추천을 위한 추가 정보</h2>
            <p className="text-sm text-gray-600 mt-1">
              더 정확한 지원사업 추천을 위해 추가 정보를 입력해주세요
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 진행률 표시 */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>{currentStep}단계 / {totalSteps}단계</span>
            <span>{Math.round((currentStep / totalSteps) * 100)}% 완료</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* 폼 내용 */}
        <form onSubmit={handleSubmit}>
          {renderStep()}

          {/* 네비게이션 버튼 */}
          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              이전
            </button>

            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={() => setCurrentStep(Math.min(totalSteps, currentStep + 1))}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                다음
              </button>
            ) : (
              <button
                type="submit"
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                저장하고 추천받기
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};