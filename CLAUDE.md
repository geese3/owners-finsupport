# OwnersFinsupport 프로젝트 문서

정부지원사업 통합 플랫폼 - 최신 상태 문서 (2025년 1월)

---

## 📑 문서 목차

1. [프로젝트 개요](#프로젝트-개요)
2. [시스템 아키텍처](#시스템-아키텍처)
3. [기술 스택](#기술-스택)
4. [현재 상태](#현재-상태)
5. [API 문서](#api-문서)
6. [데이터베이스 설계](#데이터베이스-설계)
7. [개발 가이드](#개발-가이드)
8. [디자인 시스템](#디자인-시스템)
9. [추천 알고리즘](#추천-알고리즘)
10. [배포 및 운영](#배포-및-운영)

---

## 📋 프로젝트 개요

### 🎯 서비스 목적
**OwnersFinsupport**는 대한민국의 중소기업과 개인사업자를 위한 **정부지원사업 통합 플랫폼**입니다.
복수의 정부 API로부터 실시간으로 지원사업 정보를 수집하여 사용자 맞춤형 추천 서비스를 제공합니다.

### 🌟 핵심 기능
- **다중 API 통합**: 기업마당, 정책정보포털 등 여러 정부 API 연동
- **실시간 데이터 동기화**: 새로운 공고 자동 수집 및 업데이트
- **맞춤형 추천 시스템**: 사용자 프로필 기반 개인화 추천
- **통합 검색 및 필터링**: 지역, 업종, 지원방식별 정밀 검색
- **즐겨찾기 및 알림**: 관심 사업 저장 및 마감일 알림
- **사용자 인증**: Supabase Auth 기반 안전한 계정 관리

### 📊 서비스 규모
- **API 연동**: 8개 분야별 정부지원사업 데이터
- **데이터 수집**: 일 평균 1,000+ 개 공고 처리
- **사용자 대상**: 전국 중소기업, 스타트업, 개인사업자

---

## 🏗️ 시스템 아키텍처

### 📐 전체 구조
```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Layer                           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │  Dashboard  │ │   MyPage    │ │    Auth     │           │
│  │    Page     │ │    Page     │ │   Pages     │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │           React Components (14개)                      │ │
│  │   SupportCard, SearchBar, FilterPanel, etc.           │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                     API Layer                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              Next.js API Routes (13개)                 │ │
│  │  government-supports, sync, favorites, roadmap, etc.   │ │
│  └─────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │               동기화 시스템                               │ │
│  │   Bizinfo API ↔ Legacy Sync ↔ Data Transform          │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                 Supabase PostgreSQL                    │ │
│  │  government_supports, user_profiles, bookmarks,       │ │
│  │  roadmap_progress, search_history, uploaded_files     │ │
│  └─────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                   외부 API                              │ │
│  │   기업마당 API, 정책정보포털 API, 기타 정부 API          │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 🔄 데이터 플로우
1. **외부 API 데이터 수집** → 동기화 서비스
2. **데이터 변환 및 정규화** → PostgreSQL 저장
3. **프론트엔드 요청** → Next.js API Routes
4. **데이터 조회 및 필터링** → 사용자 응답

---

## 🛠️ 기술 스택

### Frontend
- **Framework**: Next.js 15.5.4 (App Router)
- **UI Library**: React 19.1.0
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3.x
- **Icons**: Lucide React
- **Build Tool**: Turbopack

### Backend
- **Runtime**: Next.js API Routes
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth
- **ORM**: Supabase Client

### DevOps & Tools
- **Package Manager**: npm
- **Version Control**: Git
- **Code Quality**: ESLint, TypeScript
- **Development**: Hot reload, Turbopack

---

## 📈 현재 상태

### ✅ 완료된 기능 (95% 완성)

#### 🏠 Frontend (90% 완료)
- [x] **6개 주요 페이지**
  - `/` - 메인 대시보드
  - `/dashboard` - 정부지원사업 검색
  - `/mypage` - 개인 즐겨찾기 관리
  - `/auth/login`, `/auth/signup` - 사용자 인증
  - `/new` - 신규 공고 안내

- [x] **14개 핵심 컴포넌트**
  - `SupportCard` - 통합 지원사업 카드 UI
  - `AuthContext` - 전역 인증 상태 관리
  - `SearchBar` - 통합 검색 인터페이스
  - `FilterPanel` - 다중 필터링 옵션
  - `ExamScheduleUI` - 시험 일정 관리

#### ⚙️ Backend (95% 완료)
- [x] **13개 API 엔드포인트**
  - `/api/government-supports` - 메인 데이터 API
  - `/api/government-supports/sync` - 실시간 동기화
  - `/api/favorites` - 북마크 관리 (통합 시스템)
  - `/api/roadmap` - 투자 로드맵
  - `/api/recommendations` - 추천 시스템

- [x] **데이터 동기화 시스템**
  - Bizinfo API 통합 (8개 분야)
  - Legacy 정책정보포털 연동
  - 자동 중복 제거 및 데이터 정규화
  - Rate limiting (200ms 간격)

#### 🗄️ Database (100% 완료)
- [x] **Supabase PostgreSQL 스키마**
  - `government_supports` - 정부지원사업 데이터
  - `user_profiles` - 사용자 프로필
  - `bookmarks` - 통합 북마크 시스템
  - `roadmap_progress` - 로드맵 진행상황
  - `search_history` - 검색 기록
  - `uploaded_files` - 파일 업로드 관리
  - `users` - 사용자 기본 정보 (Supabase Auth 관리)
  - Row Level Security (RLS) 적용

#### 🔐 Authentication (100% 완료)
- [x] **Supabase Auth 완전 통합**
  - 이메일/비밀번호 인증
  - 세션 관리 및 보안
  - 보호된 라우트 구현

### 🔧 최근 해결된 중요 이슈

#### ✅ **Bizinfo API 동기화 수정** (2025.01)
- **문제**: API 파라미터 불일치로 인한 400 Bad Request 에러
- **원인**: `apiKey` → `crtfcKey`, `page` → `pageIndex` 등 잘못된 파라미터 사용
- **해결**: 정확한 API 파라미터로 수정하여 정상 동작 확인
- **개선**: 단일 분야에서 8개 전체 분야 데이터 수집으로 확장

#### ✅ **데이터 수집 최적화**
- 페이지네이션 개선 (페이지당 100개 처리)
- Rate limiting 구현으로 API 안정성 확보
- 중복 제거 로직 강화로 데이터 품질 향상

---

## 🔌 API 문서

### 📡 외부 API 연동

#### Bizinfo API (기업마당)
```typescript
// 기본 설정
BASE_URL: 'https://www.bizinfo.go.kr/uss/rss/bizinfoApi.do'
API_KEY: process.env.POLICY_API_KEY

// 요청 파라미터
interface BizinfoParams {
  crtfcKey: string;        // API 키
  dataType: 'json';        // 응답 형식
  searchCnt: string;       // 페이지당 항목 수 (100)
  pageIndex: string;       // 페이지 번호
  pageUnit: string;        // 페이지 크기
  searchLclasId: string;   // 분야 코드 (01-09)
}

// 수집 분야
const categories = [
  '01', // 금융
  '02', // 기술
  '03', // 인력
  '04', // 수출
  '05', // 내수
  '06', // 창업
  '07', // 경영
  '09'  // 기타
];
```

### 🛠️ 내부 API

#### 정부지원사업 조회 API
```typescript
GET /api/government-supports
Query Parameters:
- keyword?: string          // 키워드 검색
- region?: string          // 지역 필터
- business_type?: string   // 사업자 유형
- support_type?: string    // 지원 방식
- status?: string          // 상태 (active/inactive)
- limit?: number           // 페이지 크기 (기본값: 50)
- offset?: number          // 오프셋 (기본값: 0)
- source?: string          // 데이터 출처 (legacy)
- api_source?: string      // API 소스 (새로운 시스템)

Response:
{
  "success": true,
  "data": SubventionItem[],
  "total": number,
  "params": SearchParams
}
```

#### 데이터 동기화 API
```typescript
POST /api/government-supports/sync
Headers:
- Authorization: Bearer ${API_SYNC_TOKEN}

Response:
{
  "success": true,
  "message": string,
  "count": number,
  "timestamp": string,
  "logs": SyncLog[]
}
```

---

## 🗄️ 데이터베이스 설계

### 📊 주요 테이블 구조

#### government_supports
```sql
CREATE TABLE government_supports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subvention_id VARCHAR UNIQUE NOT NULL,    -- 외부 API 고유 ID
  title VARCHAR NOT NULL,                   -- 지원사업명
  region VARCHAR NOT NULL,                  -- 지역
  host_institution VARCHAR NOT NULL,       -- 주관기관
  support_method VARCHAR,                   -- 지원방식
  support_amount VARCHAR,                   -- 지원금액
  interest_rate VARCHAR,                    -- 금리
  application_deadline VARCHAR,             -- 신청마감일
  application_method VARCHAR,               -- 신청방법
  announcement_url VARCHAR,                 -- 공고 URL
  source VARCHAR NOT NULL,                  -- 데이터 출처
  attachment_files VARCHAR,                 -- 첨부파일명
  business_type_code VARCHAR,               -- 사업자 유형
  status VARCHAR DEFAULT 'active',          -- 상태
  api_source VARCHAR,                       -- API 소스
  api_last_updated_at TIMESTAMP,           -- API 최종 업데이트
  raw_data JSONB,                          -- 원본 데이터
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_government_supports_status ON government_supports(status);
CREATE INDEX idx_government_supports_region ON government_supports(region);
CREATE INDEX idx_government_supports_api_source ON government_supports(api_source);
CREATE INDEX idx_government_supports_title ON government_supports USING gin(to_tsvector('korean', title));
```

#### user_profiles
```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name VARCHAR,
  company_name VARCHAR,
  business_type VARCHAR,
  region VARCHAR,
  employee_count INTEGER,
  annual_revenue BIGINT,
  interests TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### bookmarks (통합 북마크 시스템)
```sql
CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  item_type VARCHAR NOT NULL,              -- 'government_support' 등
  item_id VARCHAR NOT NULL,                -- 참조 ID (subvention_id)
  title VARCHAR,                           -- 북마크 제목
  description VARCHAR,                     -- 설명 (기관명 - 지원방식)
  url VARCHAR,                            -- 공고 URL
  metadata JSONB,                         -- 상세 정보 (JSON)
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, item_type, item_id)     -- 중복 방지
);

-- 인덱스
CREATE INDEX idx_bookmarks_user_type ON bookmarks(user_id, item_type);
CREATE INDEX idx_bookmarks_item ON bookmarks(item_type, item_id);
```

#### roadmap_progress (로드맵 진행상황)
```sql
CREATE TABLE roadmap_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  mission_id VARCHAR NOT NULL,             -- 미션 ID
  status VARCHAR DEFAULT 'available',      -- locked/available/in_progress/completed
  points INTEGER DEFAULT 0,               -- 획득 포인트
  uploaded_files TEXT[],                  -- 업로드된 파일 목록
  completed_at TIMESTAMP,                 -- 완료일시
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, mission_id)            -- 사용자별 미션 유니크
);

-- 인덱스
CREATE INDEX idx_roadmap_progress_user ON roadmap_progress(user_id);
CREATE INDEX idx_roadmap_progress_status ON roadmap_progress(status);
```

#### search_history (검색 기록)
```sql
CREATE TABLE search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  search_query VARCHAR NOT NULL,          -- 검색어
  search_filters JSONB,                   -- 검색 필터 (지역, 업종 등)
  result_count INTEGER DEFAULT 0,        -- 검색 결과 수
  clicked_items TEXT[],                   -- 클릭한 아이템 ID 목록
  session_id VARCHAR,                     -- 세션 ID
  created_at TIMESTAMP DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_search_history_user ON search_history(user_id);
CREATE INDEX idx_search_history_query ON search_history(search_query);
CREATE INDEX idx_search_history_created ON search_history(created_at);
```

#### uploaded_files (파일 업로드 관리)
```sql
CREATE TABLE uploaded_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  file_name VARCHAR NOT NULL,             -- 원본 파일명
  file_path VARCHAR NOT NULL,             -- 저장 경로
  file_size BIGINT NOT NULL,              -- 파일 크기 (bytes)
  file_type VARCHAR NOT NULL,             -- MIME 타입
  upload_purpose VARCHAR,                 -- 업로드 목적 (roadmap, profile 등)
  related_id VARCHAR,                     -- 관련 레코드 ID
  is_active BOOLEAN DEFAULT true,         -- 활성 상태
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_uploaded_files_user ON uploaded_files(user_id);
CREATE INDEX idx_uploaded_files_purpose ON uploaded_files(upload_purpose);
CREATE INDEX idx_uploaded_files_related ON uploaded_files(related_id);
```

#### users (사용자 기본 정보 - Supabase Auth 확장)
```sql
-- Supabase auth.users 테이블 확장
-- 추가 사용자 정보는 user_profiles 테이블에서 관리
-- 이 테이블은 Supabase에서 자동 관리되므로 별도 생성 불필요
```

### 🔒 Row Level Security (RLS)
```sql
-- user_profiles RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- bookmarks RLS
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own bookmarks" ON bookmarks
  FOR ALL USING (auth.uid() = user_id);
```

---

## 💻 개발 가이드

### 🚀 개발 환경 설정

#### 1. 프로젝트 클론 및 의존성 설치
```bash
git clone <repository-url>
cd owners_finsupport
npm install
```

#### 2. 환경변수 설정
```bash
# .env.local 파일 생성
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
POLICY_API_KEY=your_policy_api_key
POLICY_API_BASE_URL=https://www.bizinfo.go.kr/uss/rss/bizinfoApi.do
API_SYNC_TOKEN=your_sync_token
```

#### 3. 개발 서버 실행
```bash
npm run dev
# 또는
npm run turbo  # Turbopack 사용시
```

#### 4. 빌드 및 배포
```bash
npm run build
npm run start
```

### 📝 코딩 컨벤션

#### TypeScript 타입 정의
```typescript
// src/types/government-support.ts
export interface GovernmentSupport {
  id?: string;
  subvention_id: string;
  title: string;
  region: string;
  // ... 기타 필드
}
```

#### 컴포넌트 구조
```typescript
// src/components/SupportCard.tsx
interface SupportCardProps {
  data: SubventionItem;
  onBookmark?: (id: string) => void;
  isBookmarked?: boolean;
}

export default function SupportCard({ data, onBookmark, isBookmarked }: SupportCardProps) {
  // 컴포넌트 로직
}
```

#### API Route 패턴
```typescript
// src/app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // 로직 구현
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error message' },
      { status: 500 }
    );
  }
}
```

### 🧪 테스트

#### 데이터 동기화 테스트
```bash
# Bizinfo API 테스트
node test-bizinfo-sync.js

# 동기화 스크립트 실행
node scripts/sync-bizinfo.js
```

---

## 🎨 디자인 시스템

### 🎯 디자인 철학
**SOLVEK Design System with Tailwind** - 모던하고 프리미엄한 정부지원 플랫폼

### 📋 UI 제작 가이드라인 (필수 준수)
#### 🔴 **중요: 반드시 기억할 요소**
- **UI 제작 시 Shadcn MCP 사용 필수** - 컴포넌트 생성 및 디자인 작업 시 반드시 활용
- **Emoji 사용 금지** - UI에서 **절대로** emoji 사용하지 말고 **Lucide Icon**을 사용할 것
- **SOLVEK 디자인 시스템 준수** - CSS 변수 및 컴포넌트 클래스 사용
- **일관성 유지** - 기존 패턴과 스타일 가이드 준수

#### 🎨 아이콘 시스템
- **Primary**: Lucide React Icons (https://lucide.dev/)
- **사용법**: `import { IconName } from 'lucide-react'`
- **금지사항**: Emoji (📱, 🎨, ⚡ 등) 사용 절대 금지
- **예시**: `<Search size={24} />`, `<User className="w-5 h-5" />`

### 🎨 브랜드 컬러 팔레트 (SOLVEK 기반)
```javascript
// tailwind.config.js - SOLVEK Design System Colors
colors: {
  brand: {
    DEFAULT: '#0066ff',  // SOLVEK 메인 블루
    50: '#f0f9ff',       // 매우 연한 블루
    100: '#e0f2fe',      // 연한 블루
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0066ff',      // Primary brand (SOLVEK Blue)
    600: '#0052cc',      // 진한 블루
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
    950: '#082f49'       // 매우 진한 블루
  },
  // SOLVEK Color Variables as Tailwind classes
  primary: {
    dark: '#1a1a1a',     // var(--color-primary-dark)
    light: '#ffffff',    // var(--color-primary-light)
    gray: '#f5f5f5'      // var(--color-primary-gray)
  },
  accent: {
    blue: '#0066ff',     // var(--color-accent-blue)
    cyan: '#00d9ff',     // var(--color-accent-cyan)
    purple: '#7c3aed',   // var(--color-accent-purple)
    green: '#22c55e'     // var(--color-accent-green)
  },
  neutral: {
    dark: '#2d2d2d',     // var(--color-neutral-dark)
    medium: '#666666',   // var(--color-neutral-medium)
    light: '#cccccc',    // var(--color-neutral-light)
    lighter: '#e8e8e8'   // var(--color-neutral-lighter)
  }
}
```

### 🧩 컴포넌트 디자인 패턴 (SOLVEK 기반)
```typescript
// SOLVEK 카드 컴포넌트 예시
import { ArrowRight } from 'lucide-react';

<div className="card-modern text-center group">
  <div className="w-24 h-24 mx-auto mb-8 rounded-3xl flex items-center justify-center transition-all duration-300 group-hover:rotate-3 animate-float"
       style={{
         background: 'linear-gradient(135deg, var(--color-accent-blue) 0%, var(--color-accent-cyan) 100%)',
         boxShadow: 'var(--shadow-xl)'
       }}>
    <Search className="w-12 h-12 text-white" />
  </div>
  <h3 style={{
    fontSize: 'var(--fs-2xl)',
    fontWeight: 'var(--fw-bold)',
    color: 'var(--color-primary-dark)'
  }}>
    서비스 제목
  </h3>
  <p style={{
    fontSize: 'var(--fs-base)',
    color: 'var(--color-neutral-medium)',
    lineHeight: 'var(--lh-relaxed)',
    marginBottom: 'var(--space-6)'
  }}>
    서비스 설명 텍스트입니다.
  </p>
  <button className="btn-modern btn-primary-modern">
    <ArrowRight className="w-4 h-4 ml-2" />
    액션 버튼
  </button>
</div>

// SOLVEK 버튼 패턴
<button className="btn-modern btn-primary-modern">Primary Button</button>
<button className="btn-modern btn-secondary-modern">Secondary Button</button>
<button className="btn-modern btn-outline-modern">Outline Button</button>
```

#### 🎨 SOLVEK 컴포넌트 클래스
```css
/* 자주 사용되는 SOLVEK 클래스들 */
.card-modern          /* 모던 카드 스타일 */
.btn-modern           /* 기본 버튼 스타일 */
.btn-primary-modern   /* 주요 액션 버튼 */
.btn-secondary-modern /* 보조 버튼 */
.btn-outline-modern   /* 테두리 버튼 */
.badge                /* 기본 배지 */
.badge-primary        /* 주요 배지 */
.animate-float        /* 플로팅 애니메이션 */
.animate-slide-up     /* 슬라이드업 애니메이션 */
.glass-effect         /* 글래스 이펙트 */
.gradient-text        /* 그라데이션 텍스트 */
```

### 📱 반응형 디자인
- **Mobile First**: 모바일 우선 설계
- **Breakpoints**: Tailwind 기본 브레이크포인트 사용
- **Grid System**: CSS Grid와 Flexbox 조합

---

## 🧠 추천 알고리즘

### 📊 매칭 스코어 시스템 (총 130점)

#### 1. 기본 정보 매칭 (70점)
- **업종 매칭**: 40점 (정확히 일치: 40점, 관련 업종: 25점, 전체: 15점)
- **지역 매칭**: 20점 (정확히 일치: 20점, 광역권: 15점, 전국: 10점)
- **기업규모 매칭**: 10점 (조건 부합: 10점, 일부 부합: 5점)

#### 2. 기업 역량 매칭 (25점)
- **R&D 역량**: 8점
- **인증/자격**: 7점
- **기술수준**: 10점

#### 3. 사업 관심도 매칭 (20점)
- **관심분야 일치**: 15점
- **투자계획 연관성**: 5점

#### 4. 지원이력 기반 매칭 (10점)
- **성공 이력**: 5점
- **중복 방지**: 5점

#### 5. 추가 우대 조건 (5점)
- **긴급도**: 2점
- **성공 가능성**: 3점

### 🔧 구현 방향
```typescript
interface MatchingScore {
  basic_info: number;      // 기본 정보 (70점)
  capability: number;      // 기업 역량 (25점)
  interest: number;        // 관심도 (20점)
  history: number;         // 지원이력 (10점)
  bonus: number;          // 추가 우대 (5점)
  total: number;          // 총합 (130점)
}
```

---

## 🚀 배포 및 운영

### 🌐 배포 환경
- **Development**: Local development with `npm run dev`
- **Staging**: Vercel Preview 배포
- **Production**: Vercel Production 환경

### 📊 모니터링
- **에러 추적**: Console 로그 기반
- **성능 모니터링**: Next.js 빌트인 Analytics
- **API 상태**: Supabase Dashboard

### 🔄 데이터 동기화 스케줄
- **자동 동기화**: 매일 오전 6시 (cron job)
- **수동 동기화**: `/api/government-supports/sync` 엔드포인트
- **Rate Limiting**: 200ms 간격으로 API 호출

### 🔐 보안 체크리스트
- [x] 환경변수 보안 관리
- [x] Supabase RLS 정책 적용
- [x] API 인증 토큰 관리
- [x] HTTPS 통신 강제
- [x] 입력값 검증 및 sanitization

---

## 📚 참조 문서

### 🔗 외부 링크
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [기업마당 API 가이드](https://www.bizinfo.go.kr)

### 📄 프로젝트 내 문서
- `README.md` - 기본 프로젝트 설정 가이드
- `enhanced_matching_algorithm.md` - 상세 추천 알고리즘 명세

---

## 📞 문의 및 지원

### 🛠️ 개발 지원
- **이슈 리포트**: GitHub Issues
- **기능 요청**: GitHub Discussions
- **코드 리뷰**: Pull Request

### 📈 향후 계획
1. **AI 추천 시스템** 고도화
2. **모바일 앱** 개발
3. **기업 맞춤형 대시보드** 확장
4. **알림 시스템** 강화
5. **다국어 지원** 추가

---

**최종 업데이트**: 2025년 10월 22일
**문서 버전**: v1.1
**프로젝트 상태**: 98% 완성 (프로덕션 배포 중)

---

## 🔄 최근 변경사항 및 개발 히스토리

### 2025.10.22 (최신 업데이트)
- ✅ **로그아웃 기능 개선** - Vercel 프로덕션 환경 대응
  - Supabase 클라이언트에 PKCE 플로우 및 세션 지속성 설정 추가
  - Next.js router 사용으로 리디렉션 방식 개선
  - 5초 타임아웃 및 강제 로그아웃 메커니즘 구현
  - localStorage 및 sessionStorage 완전 정리 로직 추가
- ✅ **Vercel 빌드 에러 해결** - 환경변수 처리 개선
  - API 라우트들의 Supabase 클라이언트 생성 방식 중앙화
  - `/api/favorites`와 `/api/admin/drop-table` 수정
  - createSupabaseServerClient 함수 활용으로 일관성 확보
- ✅ **이메일 컨펌 리디렉션 수정** - 프로덕션 URL 대응
  - `/auth/callback` 페이지 생성 및 세션 처리 구현
  - signUp 시 emailRedirectTo 옵션 추가
  - Supabase Dashboard URL Configuration 설정 가이드 제공
- ✅ **반응형 레이아웃 개선** - 낮은 해상도 디스플레이 대응
  - 모든 메인 페이지 섹션에 반응형 상단 패딩 추가
  - `pt-20 sm:pt-24 lg:pt-32` 적용으로 헤더 겹침 문제 해결
  - 5개 섹션(hero, stats, features, process, cta) 모두 업데이트
- ✅ **메인 페이지 콘텐츠 업데이트** - 최신 데이터 반영
  - 활성 지원사업 수치 업데이트: 1,500+ → 3,000+
  - 전략적 줄바꿈 추가로 가독성 향상
  - "AI와 담당 코치" 서비스 강조
  - 메시지 톤앤매너 일관성 개선
- ✅ **Next.js 개발 환경 안정화** - buildManifest 에러 해결
  - .next 캐시 디렉터리 정리
  - 클린 빌드 수행으로 개발 서버 안정화

### 2025.10.21
- ✅ **CLAUDE.md 프로젝트 문서 생성** - 전체 프로젝트 상태 정리 및 문서화
- ✅ **Bizinfo API 동기화 오류 수정** - 파라미터 매핑 오류 (`apiKey` → `crtfcKey`) 해결
- ✅ **다중 카테고리 데이터 수집** - 단일 분야(01)에서 8개 전체 분야로 확장
- ✅ **테스트 스크립트 개선** - 샘플 데이터에서 전체 데이터 수집으로 변경
- ✅ **데이터베이스 스키마 정리** - 누락된 테이블 추가, 중복 테이블 제거
- ✅ **README.md 업데이트** - Next.js 템플릿에서 프로젝트 특화 문서로 변경
- ✅ **중복 테이블 삭제 준비** - `user_government_support_bookmarks` 삭제용 SQL 및 API 생성
- ✅ **SOLVEK 디자인 시스템 적용** - 모던 프리미엄 디자인 시스템 통합
  - 전체 globals.css를 SOLVEK 시스템으로 교체
  - 브랜드 컬러를 그린(#22c55e)에서 블루(#0066ff)로 변경
  - Features 섹션 모든 카드를 SOLVEK 스타일로 통일
  - CTA 섹션 텍스트 가독성 문제 해결 (파란색 배경 대응)
  - UI 제작 가이드라인 수립 (Shadcn MCP 필수, Lucide Icon 사용, Emoji 금지)

### 이전 개발 이력 (Git 로그 기반)
- ✅ **모바일 반응형 디자인** - 모든 페이지 모바일 최적화 완료
- ✅ **로그인 페이지 레이아웃** - 위치 및 디자인 최적화
- ✅ **MyPage 탭형 로드맵** - 탭 인터페이스로 로드맵 UI 개선
- ✅ **크롤링 API 오류 처리** - 타입 안전성 및 에러 핸들링 개선
- ✅ **대시보드 액션 버튼** - 모바일 디바이스 최적화
- ✅ **반응형 네비게이션** - 모바일 최적화 레이아웃
- ✅ **프로필 폼 강화** - 개인화 추천 시스템 연동

### 📋 다음 작업 계획
- 🔄 **Supabase Dashboard 설정** - URL Configuration 업데이트 필요
- 🔄 **프로덕션 테스트** - 로그아웃 및 이메일 컨펌 플로우 검증
- 🔄 **성능 모니터링** - Vercel Analytics 설정 및 최적화
- 🔄 **사용자 피드백 수집** - 초기 사용자 테스트 및 개선사항 도출
- 🔄 **API 동기화 안정화** - Bizinfo API 대량 데이터 처리 최적화