-- 기존 테이블 삭제하고 실제 사용하는 구조로 재생성
DROP TABLE IF EXISTS public.user_support_applications;
DROP TABLE IF EXISTS public.user_support_bookmarks;
DROP TABLE IF EXISTS public.government_supports;

-- 정부지원사업 정보를 저장하는 테이블 (실제 사용 구조에 맞게)
CREATE TABLE public.government_supports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- 기본 정보 (현재 사용 중인 필드들)
  subvention_id TEXT UNIQUE NOT NULL, -- subventionId
  title TEXT NOT NULL, -- 지원사업명
  region TEXT, -- 지역
  host_institution TEXT, -- 접수기관
  support_method TEXT, -- "지원 방식"
  support_amount TEXT, -- 지원금액
  interest_rate TEXT, -- 금리
  application_deadline TEXT, -- "접수 마감일"
  application_method TEXT, -- "접수 방법"
  announcement_url TEXT, -- "공고 URL"
  source TEXT, -- 출처
  attachment_files TEXT, -- 첨부파일
  business_type_code TEXT, -- businessTypeCode

  -- 추가 유용한 필드들
  status TEXT DEFAULT 'active', -- 상태 (active, closed, expired)
  view_count INTEGER DEFAULT 0, -- 조회수
  bookmark_count INTEGER DEFAULT 0, -- 북마크 수

  -- API 정보
  api_source TEXT DEFAULT 'naver', -- API 출처
  api_last_updated_at TIMESTAMP WITH TIME ZONE, -- API에서 마지막 업데이트된 시간
  raw_data JSONB, -- API 원본 데이터

  -- 시스템 정보
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 인덱스 추가 (검색 성능 향상)
CREATE INDEX idx_government_supports_subvention_id ON public.government_supports(subvention_id);
CREATE INDEX idx_government_supports_status ON public.government_supports(status);
CREATE INDEX idx_government_supports_region ON public.government_supports(region);
CREATE INDEX idx_government_supports_business_type_code ON public.government_supports(business_type_code);
CREATE INDEX idx_government_supports_title ON public.government_supports(title);
CREATE INDEX idx_government_supports_host_institution ON public.government_supports(host_institution);

-- 전문 검색을 위한 인덱스 (제목과 기관명)
CREATE INDEX idx_government_supports_title_search ON public.government_supports USING GIN(to_tsvector('english', title));
CREATE INDEX idx_government_supports_institution_search ON public.government_supports USING GIN(to_tsvector('english', host_institution));

-- RLS 정책 설정
ALTER TABLE public.government_supports ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 정부지원사업 목록을 조회할 수 있도록 설정
CREATE POLICY "Anyone can view government supports" ON public.government_supports
  FOR SELECT
  USING (true);

-- 관리자만 정부지원사업을 생성/수정/삭제할 수 있도록 설정 (현재는 모든 인증된 사용자가 가능)
CREATE POLICY "Authenticated users can insert government supports" ON public.government_supports
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update government supports" ON public.government_supports
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- 사용자별 북마크 테이블 (기존 bookmarks 테이블과 통합 가능)
CREATE TABLE public.user_government_support_bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users ON DELETE CASCADE NOT NULL,
  support_id UUID REFERENCES public.government_supports ON DELETE CASCADE NOT NULL,
  notes TEXT, -- 사용자 메모
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, support_id)
);

-- RLS 정책 설정
ALTER TABLE public.user_government_support_bookmarks ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 북마크만 관리할 수 있도록 설정
CREATE POLICY "Users can view their own government support bookmarks" ON public.user_government_support_bookmarks
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own government support bookmarks" ON public.user_government_support_bookmarks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own government support bookmarks" ON public.user_government_support_bookmarks
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own government support bookmarks" ON public.user_government_support_bookmarks
  FOR DELETE
  USING (auth.uid() = user_id);

-- updated_at 자동 업데이트 트리거 추가
CREATE TRIGGER update_government_supports_updated_at BEFORE UPDATE ON public.government_supports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();