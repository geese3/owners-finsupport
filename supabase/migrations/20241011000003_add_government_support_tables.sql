-- 정부지원사업 정보를 저장하는 테이블
CREATE TABLE public.government_supports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- 기본 정보
  support_id TEXT UNIQUE NOT NULL, -- 고유 사업 ID (API에서 제공하는 ID)
  title TEXT NOT NULL, -- 사업명
  description TEXT, -- 사업 설명
  summary TEXT, -- 요약 설명

  -- 지원 기관 정보
  host_institution TEXT, -- 주관기관
  operating_institution TEXT, -- 운영기관
  department TEXT, -- 담당부서
  contact_person TEXT, -- 담당자
  contact_phone TEXT, -- 연락처
  contact_email TEXT, -- 이메일

  -- 지원 대상 및 조건
  target_business_type TEXT[], -- 대상 사업자 유형 (개인사업자, 법인사업자 등)
  target_company_size TEXT[], -- 대상 기업 규모 (소기업, 중기업, 대기업)
  target_industry TEXT[], -- 대상 업종
  target_region TEXT[], -- 대상 지역
  target_age_group TEXT[], -- 대상 연령대
  eligibility_criteria TEXT, -- 자격 요건 상세

  -- 지원 내용
  support_type TEXT[], -- 지원 유형 (자금, 교육, 컨설팅, 시설 등)
  support_amount TEXT, -- 지원 금액/규모
  support_rate TEXT, -- 지원율
  support_details TEXT, -- 지원 내용 상세

  -- 신청 정보
  application_start_date DATE, -- 신청 시작일
  application_end_date DATE, -- 신청 마감일
  application_method TEXT, -- 신청 방법
  application_url TEXT, -- 신청 URL
  required_documents TEXT[], -- 필요 서류

  -- 진행 상태
  status TEXT DEFAULT 'active', -- 상태 (active, closed, pending, cancelled)
  is_always_open BOOLEAN DEFAULT false, -- 상시 모집 여부

  -- 부가 정보
  tags TEXT[], -- 태그
  view_count INTEGER DEFAULT 0, -- 조회수
  bookmark_count INTEGER DEFAULT 0, -- 북마크 수

  -- API 정보
  api_source TEXT, -- API 출처 (예: 'k-startup', 'bizinfo', etc.)
  api_last_updated_at TIMESTAMP WITH TIME ZONE, -- API에서 마지막 업데이트된 시간
  raw_data JSONB, -- API 원본 데이터 (나중에 참고용)

  -- 시스템 정보
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 인덱스 추가 (검색 성능 향상)
CREATE INDEX idx_government_supports_support_id ON public.government_supports(support_id);
CREATE INDEX idx_government_supports_status ON public.government_supports(status);
CREATE INDEX idx_government_supports_application_dates ON public.government_supports(application_start_date, application_end_date);
CREATE INDEX idx_government_supports_target_company_size ON public.government_supports USING GIN(target_company_size);
CREATE INDEX idx_government_supports_target_industry ON public.government_supports USING GIN(target_industry);
CREATE INDEX idx_government_supports_target_region ON public.government_supports USING GIN(target_region);
CREATE INDEX idx_government_supports_support_type ON public.government_supports USING GIN(support_type);
CREATE INDEX idx_government_supports_tags ON public.government_supports USING GIN(tags);

-- RLS 정책 설정
ALTER TABLE public.government_supports ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 정부지원사업 목록을 조회할 수 있도록 설정
CREATE POLICY "Anyone can view government supports" ON public.government_supports
  FOR SELECT
  USING (true);

-- 관리자만 정부지원사업을 생성/수정/삭제할 수 있도록 설정 (추후 관리자 role 추가 시 수정 필요)
-- CREATE POLICY "Only admins can insert government supports" ON public.government_supports
--   FOR INSERT
--   WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- CREATE POLICY "Only admins can update government supports" ON public.government_supports
--   FOR UPDATE
--   USING (auth.jwt() ->> 'role' = 'admin');

-- CREATE POLICY "Only admins can delete government supports" ON public.government_supports
--   FOR DELETE
--   USING (auth.jwt() ->> 'role' = 'admin');

-- 사용자별 정부지원사업 북마크/관심 테이블
CREATE TABLE public.user_support_bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users ON DELETE CASCADE NOT NULL,
  support_id UUID REFERENCES public.government_supports ON DELETE CASCADE NOT NULL,
  notes TEXT, -- 사용자 메모
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, support_id)
);

-- RLS 정책 설정
ALTER TABLE public.user_support_bookmarks ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 북마크만 관리할 수 있도록 설정
CREATE POLICY "Users can view their own bookmarks" ON public.user_support_bookmarks
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bookmarks" ON public.user_support_bookmarks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookmarks" ON public.user_support_bookmarks
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks" ON public.user_support_bookmarks
  FOR DELETE
  USING (auth.uid() = user_id);

-- 사용자별 정부지원사업 신청 기록 테이블
CREATE TABLE public.user_support_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users ON DELETE CASCADE NOT NULL,
  support_id UUID REFERENCES public.government_supports ON DELETE CASCADE NOT NULL,
  application_date DATE NOT NULL, -- 신청일
  status TEXT DEFAULT 'applied', -- applied, approved, rejected, cancelled
  notes TEXT, -- 메모
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS 정책 설정
ALTER TABLE public.user_support_applications ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 신청 기록만 관리할 수 있도록 설정
CREATE POLICY "Users can view their own applications" ON public.user_support_applications
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own applications" ON public.user_support_applications
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own applications" ON public.user_support_applications
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own applications" ON public.user_support_applications
  FOR DELETE
  USING (auth.uid() = user_id);

-- updated_at 자동 업데이트 트리거 추가
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_government_supports_updated_at BEFORE UPDATE ON public.government_supports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_support_applications_updated_at BEFORE UPDATE ON public.user_support_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();