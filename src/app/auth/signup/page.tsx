"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { INDUSTRY_OPTIONS, REGION_OPTIONS } from "@/data/industry-codes";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    companyName: "",
    businessType: "개인사업자", // 개인사업자/법인사업자 선택
    businessNumber: "",
    corporateNumber: "", // 법인등록번호 (법인인 경우만)
    companySize: "", // 기업 규모
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
  const [successMessage, setSuccessMessage] = useState("");
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // 이미 로그인된 사용자는 대시보드로 리디렉션
  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  // 사업자등록번호 포맷팅 (123-45-67890)
  const formatBusinessNumber = (value: string) => {
    const numbers = value.replace(/[^\d]/g, '');
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 5) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    } else if (numbers.length <= 10) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 5)}-${numbers.slice(5)}`;
    }
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 5)}-${numbers.slice(5, 10)}`;
  };

  // 법인등록번호 포맷팅 (123456-1234567)
  const formatCorporateNumber = (value: string) => {
    const numbers = value.replace(/[^\d]/g, '');
    if (numbers.length <= 6) {
      return numbers;
    } else if (numbers.length <= 13) {
      return `${numbers.slice(0, 6)}-${numbers.slice(6)}`;
    }
    return `${numbers.slice(0, 6)}-${numbers.slice(6, 13)}`;
  };

  // 전화번호 포맷팅 (010-1234-5678)
  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/[^\d]/g, '');
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    } else if (numbers.length <= 11) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
    }
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;

    let formattedValue = value;

    // 숫자 포맷팅 적용
    if (name === "businessNumber") {
      formattedValue = formatBusinessNumber(value);
    } else if (name === "corporateNumber") {
      formattedValue = formatCorporateNumber(value);
    } else if (name === "phone") {
      formattedValue = formatPhoneNumber(value);
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : formattedValue
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
      const cleanNumber = formattedValue.replace(/-/g, '');
      if (cleanNumber.length === 10) {
        setErrors(prev => ({ ...prev, businessNumber: "" }));
      } else if (cleanNumber.length > 0) {
        setErrors(prev => ({ ...prev, businessNumber: "사업자등록번호는 10자리입니다." }));
      }
    }

    // 법인등록번호 포맷 검사
    if (name === "corporateNumber") {
      const cleanNumber = formattedValue.replace(/-/g, '');
      if (cleanNumber.length === 13) {
        setErrors(prev => ({ ...prev, corporateNumber: "" }));
      } else if (cleanNumber.length > 0) {
        setErrors(prev => ({ ...prev, corporateNumber: "법인등록번호는 13자리입니다." }));
      }
    }

    // 전화번호 포맷 검사
    if (name === "phone") {
      const cleanNumber = formattedValue.replace(/-/g, '');
      if (cleanNumber.length >= 10 && cleanNumber.length <= 11) {
        setErrors(prev => ({ ...prev, phone: "" }));
      } else if (cleanNumber.length > 0) {
        setErrors(prev => ({ ...prev, phone: "올바른 전화번호 형식이 아닙니다." }));
      }
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.companyName) newErrors.companyName = "회사명을 입력해주세요.";
    if (!formData.businessNumber) newErrors.businessNumber = "사업자등록번호를 입력해주세요.";
    if (formData.businessType === "법인사업자" && !formData.corporateNumber) {
      newErrors.corporateNumber = "법인등록번호를 입력해주세요.";
    }
    if (!formData.companySize) newErrors.companySize = "기업 규모를 선택해주세요.";
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
    const cleanBusinessNumber = formData.businessNumber.replace(/-/g, '');
    if (cleanBusinessNumber && cleanBusinessNumber.length !== 10) {
      newErrors.businessNumber = "사업자등록번호는 10자리여야 합니다.";
    }

    // 법인등록번호 형식 검사
    if (formData.businessType === "법인사업자" && formData.corporateNumber) {
      const cleanCorporateNumber = formData.corporateNumber.replace(/-/g, '');
      if (cleanCorporateNumber.length !== 13) {
        newErrors.corporateNumber = "법인등록번호는 13자리여야 합니다.";
      }
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
    setErrors({});
    setSuccessMessage('');

    try {
      // 선택된 업종과 지역 이름 찾기
      const selectedIndustry = INDUSTRY_OPTIONS.find(item => item.code === formData.industryCode);
      const selectedRegion = REGION_OPTIONS.find(item => item.code === formData.regionCode);

      // 프로덕션 환경에서는 Vercel 도메인 사용
      const redirectUrl = process.env.NEXT_PUBLIC_APP_ENV === 'production'
        ? 'https://owners-finsupport.vercel.app/auth/callback'
        : `${window.location.origin}/auth/callback`;

      console.log('🔗 Email redirect URL:', redirectUrl);

      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name: formData.companyName, // 회사명을 이름으로 사용
            company: formData.companyName,
            businessNumber: formData.businessNumber,
            businessType: formData.businessType,
            corporateNumber: formData.businessType === "법인사업자" ? formData.corporateNumber : null,
            companySize: formData.companySize,
            industry: selectedIndustry?.name || formData.industryCode,
            region: selectedRegion?.name || formData.regionCode,
            phone: formData.phone,
            planType: 'FREE',
            agreeMarketing: formData.agreeMarketing
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        setSuccessMessage('회원가입이 완료되었습니다! 이메일을 확인해주세요.');
        // 이메일 확인 후 로그인하라는 안내를 위해 바로 리디렉션하지 않음
      }
    } catch (error: any) {
      if (error.message.includes('already registered')) {
        setErrors({ email: '이미 가입된 이메일 주소입니다.' });
      } else {
        setErrors({ general: error.message || '회원가입 중 오류가 발생했습니다.' });
      }
    } finally {
      setIsLoading(false);
    }
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
            className="font-medium text-brand hover:text-brand-500"
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
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-500 focus:border-brand-500"
                  placeholder="회사명을 입력하세요"
                />
                {errors.companyName && (
                  <p className="mt-1 text-sm text-red-600">{errors.companyName}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="businessType" className="block text-sm font-medium text-gray-700">
                사업자 유형 *
              </label>
              <div className="mt-1">
                <select
                  id="businessType"
                  name="businessType"
                  required
                  value={formData.businessType}
                  onChange={handleInputChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500"
                >
                  <option value="개인사업자">개인사업자</option>
                  <option value="법인사업자">법인사업자</option>
                </select>
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
                  inputMode="numeric"
                  required
                  value={formData.businessNumber}
                  onChange={handleInputChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-500 focus:border-brand-500"
                  placeholder="숫자만 입력"
                  maxLength={12}
                />
                {errors.businessNumber && (
                  <p className="mt-1 text-sm text-red-600">{errors.businessNumber}</p>
                )}
              </div>
            </div>

            {/* 법인사업자인 경우만 법인등록번호 입력 표시 */}
            {formData.businessType === "법인사업자" && (
              <div>
                <label htmlFor="corporateNumber" className="block text-sm font-medium text-gray-700">
                  법인등록번호 *
                </label>
                <div className="mt-1">
                  <input
                    id="corporateNumber"
                    name="corporateNumber"
                    type="text"
                    inputMode="numeric"
                    required={formData.businessType === "법인사업자"}
                    value={formData.corporateNumber}
                    onChange={handleInputChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-500 focus:border-brand-500"
                    placeholder="숫자만 입력"
                    maxLength={14}
                  />
                  {errors.corporateNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.corporateNumber}</p>
                  )}
                </div>
              </div>
            )}

            <div>
              <label htmlFor="companySize" className="block text-sm font-medium text-gray-700">
                기업 규모 *
              </label>
              <div className="mt-1">
                <select
                  id="companySize"
                  name="companySize"
                  required
                  value={formData.companySize}
                  onChange={handleInputChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500"
                >
                  <option value="">기업 규모를 선택하세요</option>
                  <option value="소기업">소기업 (50명 미만)</option>
                  <option value="중기업">중기업 (50명 이상 ~ 300명 미만)</option>
                  <option value="대기업">대기업 (300명 이상)</option>
                </select>
                {errors.companySize && (
                  <p className="mt-1 text-sm text-red-600">{errors.companySize}</p>
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
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500"
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
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500"
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
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-500 focus:border-brand-500"
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
                  inputMode="numeric"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-500 focus:border-brand-500"
                  placeholder="숫자만 입력"
                  maxLength={13}
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
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-500 focus:border-brand-500"
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
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-500 focus:border-brand-500"
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
                  className="h-4 w-4 text-brand focus:ring-brand-500 border-gray-300 rounded"
                />
                <label htmlFor="agreeTerms" className="ml-2 block text-sm text-gray-900">
                  <span className="text-red-500">*</span>
                  <a href="#" className="text-brand hover:text-brand-500 underline ml-1">
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
                  className="h-4 w-4 text-brand focus:ring-brand-500 border-gray-300 rounded"
                />
                <label htmlFor="agreePrivacy" className="ml-2 block text-sm text-gray-900">
                  <span className="text-red-500">*</span>
                  <a href="#" className="text-brand hover:text-brand-500 underline ml-1">
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
                  className="h-4 w-4 text-brand focus:ring-brand-500 border-gray-300 rounded"
                />
                <label htmlFor="agreeMarketing" className="ml-2 block text-sm text-gray-900">
                  마케팅 정보 수신에 동의합니다 (선택)
                </label>
              </div>
            </div>

            {/* 성공 메시지 */}
            {successMessage && (
              <div className="text-sm text-center p-3 rounded-md text-green-800 bg-green-100 border border-green-200">
                {successMessage}
              </div>
            )}

            {/* 일반 에러 메시지 */}
            {errors.general && (
              <div className="text-sm text-center p-3 rounded-md text-red-800 bg-red-100 border border-red-200">
                {errors.general}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brand hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:bg-brand-400 disabled:cursor-not-allowed"
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
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
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