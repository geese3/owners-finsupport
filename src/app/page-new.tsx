import Link from "next/link";
import Image from "next/image";

export default function HomeNew() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100">
      {/* Navigation */}
      <nav className="absolute top-0 w-full z-50 py-6 px-6 bg-white/80 backdrop-blur-md border-b border-purple-100">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/">
              <Image
                src="/owners-logo.png"
                alt="오너스경영연구소"
                width={300}
                height={90}
                className="h-12 sm:h-16 lg:h-20 w-auto"
                priority
              />
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/dashboard" className="text-gray-600 hover:text-purple-600 transition-colors font-medium">
              지원사업 검색
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-purple-600 transition-colors font-medium">
              서비스 소개
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-purple-600 transition-colors font-medium">
              문의하기
            </Link>
            <Link
              href="/auth/signup"
              className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-2 rounded-full hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
            >
              시작하기
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-purple-400/5 to-transparent"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-8">
              🚀 AI 기반 정부지원사업 플랫폼
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 leading-tight mb-8">
              정부지원사업을
              <br />
              <span className="bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">더 쉽게, 더 정확하게</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 leading-relaxed mb-12 max-w-3xl mx-auto">
              복잡한 정부지원사업 검색은 이제 그만!
              <br />
              <span className="font-semibold text-purple-700">우리 회사에 딱 맞는 지원사업</span>을 AI가 찾아드립니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/dashboard"
                className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-10 py-4 rounded-full text-lg font-semibold hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
              >
                무료로 시작하기
              </Link>
              <Link
                href="/demo"
                className="text-purple-600 px-8 py-4 rounded-full text-lg font-semibold hover:text-purple-800 transition-colors border-2 border-purple-200 hover:border-purple-300 bg-white/50"
              >
                서비스 둘러보기
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Cards Section */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-purple-100 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent mb-2">1,500+</div>
              <div className="text-gray-600 font-medium">활성 지원사업</div>
            </div>
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-purple-100 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💯</span>
              </div>
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent mb-2">98%</div>
              <div className="text-gray-600 font-medium">고객 만족도</div>
            </div>
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-purple-100 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent mb-2">50억+</div>
              <div className="text-gray-600 font-medium">누적 지원금액</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              왜 <span className="bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">오너스 핀서포트</span>인가요?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              수많은 기업들이 선택한 이유가 있습니다
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-purple-100 text-center group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:from-purple-600 group-hover:to-purple-700 transition-all duration-300">
                <svg className="w-10 h-10 text-purple-600 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">AI 맞춤 추천</h3>
              <p className="text-gray-600 leading-relaxed">
                머신러닝 기반으로 우리 회사에 가장 적합한 지원사업만 골라서 추천해드립니다.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-purple-100 text-center group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:from-purple-600 group-hover:to-purple-700 transition-all duration-300">
                <svg className="w-10 h-10 text-purple-600 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">실시간 알림</h3>
              <p className="text-gray-600 leading-relaxed">
                새로운 지원사업이 공고되면 즉시 알려드려 기회를 놓치지 않도록 도와드립니다.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-purple-100 text-center group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:from-purple-600 group-hover:to-purple-700 transition-all duration-300">
                <svg className="w-10 h-10 text-purple-600 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">간편한 관리</h3>
              <p className="text-gray-600 leading-relaxed">
                복잡한 서류 작업부터 진행 상황까지 모든 것을 한 곳에서 관리할 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-24 px-6 bg-gradient-to-br from-purple-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">3단계</span>로 간단하게
            </h2>
            <p className="text-xl text-gray-600">
              복잡한 과정 없이 바로 시작하세요
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center bg-white rounded-3xl p-8 shadow-lg border border-purple-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">회사 정보 입력</h3>
              <p className="text-gray-600">
                업종, 규모, 지역 등 기본 정보만 입력하시면 됩니다.
              </p>
            </div>

            <div className="text-center bg-white rounded-3xl p-8 shadow-lg border border-purple-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">AI 분석</h3>
              <p className="text-gray-600">
                AI가 1,500개 이상의 지원사업을 분석해 맞춤 추천을 제공합니다.
              </p>
            </div>

            <div className="text-center bg-white rounded-3xl p-8 shadow-lg border border-purple-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">신청 및 관리</h3>
              <p className="text-gray-600">
                추천받은 지원사업에 바로 신청하고 진행상황을 확인하세요.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-gradient-to-br from-purple-600 to-purple-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            지금 시작해보세요
          </h2>
          <p className="text-xl mb-12 text-purple-100">
            7일 무료체험으로 모든 기능을 경험해보실 수 있습니다
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/auth/signup"
              className="bg-white text-purple-700 px-10 py-4 rounded-full text-lg font-bold hover:bg-purple-50 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
            >
              무료체험 시작하기
            </Link>
            <Link
              href="/contact"
              className="text-white px-8 py-4 rounded-full text-lg font-semibold hover:text-purple-200 transition-colors border-2 border-white/30 hover:border-white/50"
            >
              문의하기
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="text-2xl font-bold mb-4">
                <span className="text-purple-400">오너스</span> 핀서포트
              </div>
              <p className="text-gray-400 leading-relaxed max-w-md">
                정부지원사업 정보를 AI로 분석하여 기업에게 최적화된 맞춤형 솔루션을 제공합니다.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">서비스</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/dashboard" className="hover:text-purple-400 transition-colors">지원사업 검색</Link></li>
                <li><Link href="/pricing" className="hover:text-purple-400 transition-colors">요금 안내</Link></li>
                <li><Link href="/about" className="hover:text-purple-400 transition-colors">회사 소개</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">고객지원</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/contact" className="hover:text-purple-400 transition-colors">문의하기</Link></li>
                <li><Link href="/help" className="hover:text-purple-400 transition-colors">도움말</Link></li>
                <li><Link href="/privacy" className="hover:text-purple-400 transition-colors">개인정보처리방침</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>© 2025 오너스경영연구소. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}