"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { INDUSTRY_OPTIONS, REGION_OPTIONS } from "@/data/industry-codes";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    companyName: "",
    businessNumber: "",
    industryCode: "",
    regionCode: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    agreeTerms: false,
    agreePrivacy: false,
    agreeMarketing: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;

    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));

    // 실시간 유효성 검사
    if (name === "confirmPassword") {
      if (value !== formData.password) {
        setErrors(prev => ({ ...prev, confirmPassword: "비밀번호가 일치하지 않습니다." }));
      } else {
        setErrors(prev => ({ ...prev, confirmPassword: "" }));
      }
    }

    // 사업자등록번호 포맷 검사
    if (name === "businessNumber") {
      const businessNumberRegex = /^\d{3}-\d{2}-\d{5}$/;
      if (value && !businessNumberRegex.test(value)) {
        setErrors(prev => ({ ...prev, businessNumber: "올바른 사업자등록번호 형식이 아닙니다. (예: 123-45-67890)" }));
      } else {
        setErrors(prev => ({ ...prev, businessNumber: "" }));
      }
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.companyName) newErrors.companyName = "회사명을 입력해주세요.";
    if (!formData.businessNumber) newErrors.businessNumber = "사업자등록번호를 입력해주세요.";
    if (!formData.industryCode) newErrors.industryCode = "업종을 선택해주세요.";
    if (!formData.regionCode) newErrors.regionCode = "지역을 선택해주세요.";
    if (!formData.email) newErrors.email = "이메일을 입력해주세요.";
    if (!formData.password) newErrors.password = "비밀번호를 입력해주세요.";
    if (formData.password.length < 8) newErrors.password = "비밀번호는 8자 이상이어야 합니다.";
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "비밀번호가 일치하지 않습니다.";
    }
    if (!formData.phone) newErrors.phone = "전화번호를 입력해주세요.";
    if (!formData.agreeTerms) newErrors.agreeTerms = "이용약관에 동의해주세요.";
    if (!formData.agreePrivacy) newErrors.agreePrivacy = "개인정보처리방침에 동의해주세요.";

    // 사업자등록번호 형식 검사
    const businessNumberRegex = /^\d{3}-\d{2}-\d{5}$/;
    if (formData.businessNumber && !businessNumberRegex.test(formData.businessNumber)) {
      newErrors.businessNumber = "올바른 사업자등록번호 형식이 아닙니다. (예: 123-45-67890)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    // TODO: 실제 회원가입 API 연동
    console.log("회원가입 데이터:", formData);

    // 임시 로딩
    setTimeout(() => {
      setIsLoading(false);
      alert("회원가입 기능은 아직 개발 중입니다.");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex justify-center">
          <Image
            src="/owners-logo.png"
            alt="오너스경영연구소"
            width={350}
            height={105}
            className="h-24 w-auto"
          />
        </Link>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          무료 체험 시작하기
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          이미 계정이 있으시다면{" "}
          <Link
            href="/auth/login"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            로그인하기
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                회사명 *
              </label>
              <div className="mt-1">
                <input
                  id="companyName"
                  name="companyName"
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={handleInputChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="회사명을 입력하세요"
                />
                {errors.companyName && (
                  <p className="mt-1 text-sm text-red-600">{errors.companyName}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="businessNumber" className="block text-sm font-medium text-gray-700">
                사업자등록번호 *
              </label>
              <div className="mt-1">
                <input
                  id="businessNumber"
                  name="businessNumber"
                  type="text"
                  required
                  value={formData.businessNumber}
                  onChange={handleInputChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="123-45-67890"
                />
                {errors.businessNumber && (
                  <p className="mt-1 text-sm text-red-600">{errors.businessNumber}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="industryCode" className="block text-sm font-medium text-gray-700">
                업종 *
              </label>
              <div className="mt-1">
                <select
                  id="industryCode"
                  name="industryCode"
                  required
                  value={formData.industryCode}
                  onChange={handleInputChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">업종을 선택하세요</option>
                  {INDUSTRY_OPTIONS.map((industry) => (
                    <option key={industry.code} value={industry.code}>
                      {industry.name}
                    </option>
                  ))}
                </select>
                {errors.industryCode && (
                  <p className="mt-1 text-sm text-red-600">{errors.industryCode}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="regionCode" className="block text-sm font-medium text-gray-700">
                지역 *
              </label>
              <div className="mt-1">
                <select
                  id="regionCode"
                  name="regionCode"
                  required
                  value={formData.regionCode}
                  onChange={handleInputChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">지역을 선택하세요</option>
                  {REGION_OPTIONS.map((region) => (
                    <option key={region.code} value={region.code}>
                      {region.name}
                    </option>
                  ))}
                </select>
                {errors.regionCode && (
                  <p className="mt-1 text-sm text-red-600">{errors.regionCode}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                이메일 주소 *
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="example@company.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                전화번호 *
              </label>
              <div className="mt-1">
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="010-1234-5678"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                비밀번호 *
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="8자 이상 입력하세요"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                비밀번호 확인 *
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="비밀번호를 다시 입력하세요"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  id="agreeTerms"
                  name="agreeTerms"
                  type="checkbox"
                  checked={formData.agreeTerms}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="agreeTerms" className="ml-2 block text-sm text-gray-900">
                  <span className="text-red-500">*</span>
                  <a href="#" className="text-blue-600 hover:text-blue-500 underline ml-1">
                    이용약관
                  </a>에 동의합니다
                </label>
              </div>
              {errors.agreeTerms && (
                <p className="text-sm text-red-600">{errors.agreeTerms}</p>
              )}

              <div className="flex items-center">
                <input
                  id="agreePrivacy"
                  name="agreePrivacy"
                  type="checkbox"
                  checked={formData.agreePrivacy}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="agreePrivacy" className="ml-2 block text-sm text-gray-900">
                  <span className="text-red-500">*</span>
                  <a href="#" className="text-blue-600 hover:text-blue-500 underline ml-1">
                    개인정보처리방침
                  </a>에 동의합니다
                </label>
              </div>
              {errors.agreePrivacy && (
                <p className="text-sm text-red-600">{errors.agreePrivacy}</p>
              )}

              <div className="flex items-center">
                <input
                  id="agreeMarketing"
                  name="agreeMarketing"
                  type="checkbox"
                  checked={formData.agreeMarketing}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="agreeMarketing" className="ml-2 block text-sm text-gray-900">
                  마케팅 정보 수신에 동의합니다 (선택)
                </label>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    가입 처리 중...
                  </div>
                ) : (
                  "7일 무료체험 시작하기"
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">또는</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href="/auth/login"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                이미 계정이 있나요? 로그인하기
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}