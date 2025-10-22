-- user_profiles 테이블에 법인등록번호 컬럼 추가
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS corporate_number TEXT;