# OwnersFinsupport - 정부지원사업 통합 플랫폼

중소기업과 개인사업자를 위한 정부지원사업 맞춤형 추천 서비스

## 🚀 빠른 시작

### 개발 환경 설정
```bash
# 프로젝트 클론
git clone <repository-url>
cd owners_finsupport

# 의존성 설치
npm install

# 환경변수 설정
cp .env.example .env.local
# .env.local 파일을 편집하여 필요한 환경변수 설정

# 개발 서버 실행
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 결과를 확인하세요.

### 📋 환경변수 설정
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
POLICY_API_KEY=your_policy_api_key
POLICY_API_BASE_URL=https://www.bizinfo.go.kr/uss/rss/bizinfoApi.do
API_SYNC_TOKEN=your_sync_token
```

## 🏗️ 프로젝트 구조

### 기술 스택
- **Frontend**: Next.js 15.5.4 + React 19.1.0 + TypeScript
- **Backend**: Next.js API Routes + Supabase PostgreSQL
- **Styling**: Tailwind CSS 3.x
- **Authentication**: Supabase Auth
- **Development**: Turbopack

### 주요 기능
- ✅ 정부지원사업 통합 검색 및 필터링
- ✅ 사용자 맞춤형 추천 시스템
- ✅ 실시간 데이터 동기화 (Bizinfo API 연동)
- ✅ 즐겨찾기 및 개인화 관리
- ✅ 반응형 웹 디자인
- ✅ 안전한 사용자 인증

## 📊 데이터 동기화

### 수동 동기화 실행
```bash
# Bizinfo API 테스트
node test-bizinfo-sync.js

# 전체 동기화 실행
node scripts/sync-bizinfo.js

# API를 통한 동기화
curl -X POST http://localhost:3000/api/government-supports/sync \
  -H "Authorization: Bearer your_sync_token"
```

### 지원되는 데이터 소스
- **기업마당 API**: 8개 분야별 정부지원사업
- **정책정보포털**: Legacy 시스템 지원
- **자동 중복 제거**: 고유 ID 기반 데이터 정리

## 📚 상세 문서

프로젝트의 전체 문서는 `CLAUDE.md`를 참조하세요:

### 📑 문서 구성
1. **프로젝트 개요** - 서비스 목적 및 핵심 기능
2. **시스템 아키텍처** - 전체 구조 및 데이터 플로우
3. **API 문서** - 내부/외부 API 명세
4. **데이터베이스 설계** - 스키마 및 RLS 정책
5. **개발 가이드** - 코딩 컨벤션 및 개발 패턴
6. **디자인 시스템** - Tailwind 기반 UI 가이드
7. **추천 알고리즘** - 매칭 스코어 시스템 (130점 체계)
8. **배포 및 운영** - 프로덕션 배포 가이드

### 📄 추가 참고 자료
- `enhanced_matching_algorithm.md` - 상세 추천 알고리즘 명세
- API 엔드포인트: `/api/government-supports`
- 동기화 시스템: `/api/government-supports/sync`

## 🧪 테스트 및 빌드

```bash
# 개발 서버 (Turbopack)
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm run start

# 타입 체크
npx tsc --noEmit

# 린팅
npx eslint src/
```

## 📈 현재 상태

- **Backend**: 95% 완료 (API 시스템, 데이터 동기화)
- **Frontend**: 90% 완료 (UI 컴포넌트, 페이지)
- **Database**: 100% 완료 (스키마, 타입 정의)
- **Authentication**: 100% 완료 (Supabase Auth)

**전체 완성도**: 95% (프로덕션 준비 완료)

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 지원 및 문의

- **이슈 리포트**: GitHub Issues
- **기능 요청**: GitHub Discussions
- **문서 업데이트**: 2025년 1월 21일
