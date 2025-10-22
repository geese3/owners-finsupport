-- 오너스 금융지원 플랫폼 데이터베이스 스키마

-- 1. 사용자 기본 정보 테이블 (Supabase Auth와 연동)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. 사용자 확장 프로필 정보
CREATE TABLE public.user_profiles (
  id UUID REFERENCES public.users ON DELETE CASCADE PRIMARY KEY,
  company_name TEXT,
  business_number TEXT,
  industry TEXT,
  region TEXT,
  company_size TEXT, -- '소기업', '중기업', '대기업'
  business_type TEXT, -- '개인사업자', '법인사업자'
  plan_type TEXT DEFAULT 'FREE', -- 'FREE', 'BASIC', 'PREMIUM'
  phone TEXT,
  address TEXT,
  website TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. 검색 기록
CREATE TABLE public.search_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users ON DELETE CASCADE NOT NULL,
  search_type TEXT NOT NULL, -- 'government_support', 'procurement', 'investment'
  keyword TEXT,
  filters JSONB, -- 검색 필터 정보 (업종, 지역 등)
  results_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. 즐겨찾기
CREATE TABLE public.bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users ON DELETE CASCADE NOT NULL,
  item_type TEXT NOT NULL, -- 'government_support', 'procurement', 'investment'
  item_id TEXT NOT NULL, -- 외부 API의 ID
  title TEXT NOT NULL,
  description TEXT,
  url TEXT,
  metadata JSONB, -- 추가 정보 저장
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, item_type, item_id)
);

-- 5. 로드맵 진행상황
CREATE TABLE public.roadmap_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users ON DELETE CASCADE NOT NULL,
  roadmap_type TEXT NOT NULL, -- 'growth', 'procurement', 'investment'
  mission_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'locked', -- 'locked', 'available', 'in_progress', 'completed'
  completed_at TIMESTAMP WITH TIME ZONE,
  points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, roadmap_type, mission_id)
);

-- 6. 업로드된 파일 정보
CREATE TABLE public.uploaded_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users ON DELETE CASCADE NOT NULL,
  roadmap_type TEXT NOT NULL,
  mission_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  storage_path TEXT NOT NULL, -- Supabase Storage 경로
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 인덱스 생성
CREATE INDEX idx_search_history_user_id ON public.search_history(user_id);
CREATE INDEX idx_search_history_created_at ON public.search_history(created_at DESC);
CREATE INDEX idx_bookmarks_user_id ON public.bookmarks(user_id);
CREATE INDEX idx_roadmap_progress_user_id ON public.roadmap_progress(user_id);
CREATE INDEX idx_roadmap_progress_status ON public.roadmap_progress(roadmap_type, status);
CREATE INDEX idx_uploaded_files_user_id ON public.uploaded_files(user_id);

-- RLS (Row Level Security) 정책 설정
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uploaded_files ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 데이터만 접근 가능
CREATE POLICY "Users can view own data" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON public.users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own search history" ON public.search_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own search history" ON public.search_history FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own bookmarks" ON public.bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own bookmarks" ON public.bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own bookmarks" ON public.bookmarks FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own roadmap progress" ON public.roadmap_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own roadmap progress" ON public.roadmap_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own roadmap progress" ON public.roadmap_progress FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own uploaded files" ON public.uploaded_files FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own uploaded files" ON public.uploaded_files FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 업데이트 시간 자동 업데이트 함수
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 업데이트 트리거 생성
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_roadmap_progress_updated_at
  BEFORE UPDATE ON public.roadmap_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();