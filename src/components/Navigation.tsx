'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export const Navigation: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { user, loading, signOut } = useAuth();

  const publicMenuItems = [
    { href: '/about', label: '서비스 소개' },
    { href: '/contact', label: '문의하기' },
  ];

  const privateMenuItems = [
    { href: '/dashboard', label: '지원사업' },
    { href: '/procurement', label: '공공조달' },
    { href: '/mypage', label: '마이페이지' },
  ];

  // 로딩 중일 때는 항상 publicMenuItems를 사용하여 hydration mismatch 방지
  const menuItems = (loading || !user) ? publicMenuItems : privateMenuItems;

  const isActive = (href: string) => pathname === href;

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // 스크롤 이벤트 감지 (페이지별 다른 동작)
  useEffect(() => {
    if (!pathname) return; // pathname이 없으면 아무것도 하지 않음

    const handleScroll = () => {
      const scrolled = window.scrollY > 0;
      setIsScrolled(scrolled);
    };

    // Hero 섹션이 있는 페이지인지 확인 (메인 페이지)
    const heroSection = document.querySelector('section[data-section="hero"]');
    const isMainPage = pathname === '/';

    // 다른 페이지들 (대시보드, 마이페이지 등): 항상 고정 네비게이션
    if (!isMainPage) {
      setIsScrolled(true);
      return; // cleanup 함수 없음
    }

    // 메인 페이지인 경우
    if (heroSection) {
      // Intersection Observer를 사용하여 Hero 섹션 감지
      const observer = new IntersectionObserver(
        (entries) => {
          const heroEntry = entries[0];
          // Hero 섹션이 화면에서 벗어나면 네비게이션을 고정
          setIsScrolled(!heroEntry.isIntersecting);
        },
        {
          threshold: 0.1,
          rootMargin: '-10px 0px 0px 0px'
        }
      );

      observer.observe(heroSection);

      // 스크롤 이벤트도 함께 사용 (백업용)
      window.addEventListener('scroll', handleScroll, { passive: true });

      return () => {
        observer.disconnect();
        window.removeEventListener('scroll', handleScroll);
      };
    } else {
      // 메인 페이지이지만 Hero 섹션이 없는 경우 스크롤 이벤트 사용
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [pathname]);

  return (
    <header
      className={`z-50 transition-all duration-300 ${
        isScrolled
          ? 'fixed top-0 left-0 right-0 shadow-lg backdrop-blur-sm'
          : 'absolute top-0 left-0 right-0'
      }`}
      style={{
        background: isScrolled
          ? 'rgba(255, 255, 255, 0.95)'
          : 'transparent',
        backdropFilter: isScrolled ? 'blur(10px)' : 'none',
        WebkitBackdropFilter: isScrolled ? 'blur(10px)' : 'none'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex justify-between items-center ${
          pathname === '/' ? 'py-4' : 'py-2 lg:py-3'
        }`}>
          {/* 로고 */}
          <div className="flex items-center">
            <Link href="/" onClick={closeMenu}>
              <Image
                src={isScrolled ? "/owners-logo.png" : "/owners_logo(white).png"}
                alt="오너스경영연구소"
                width={350}
                height={105}
                className={`w-auto transition-opacity duration-300 ${
                  pathname === '/'
                    ? 'h-14 sm:h-18 lg:h-24'
                    : 'h-10 sm:h-12 lg:h-16'
                }`}
                priority
              />
            </Link>
          </div>

          {/* 데스크톱 네비게이션 */}
          <nav className="hidden md:flex items-center space-x-4">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? isScrolled
                      ? 'text-brand bg-brand-50'
                      : 'text-white bg-white bg-opacity-20'
                    : isScrolled
                      ? 'text-gray-600 hover:text-brand hover:bg-gray-50'
                      : 'text-white text-opacity-90 hover:text-white hover:bg-white hover:bg-opacity-20'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="flex items-center space-x-2 ml-4">
              {!loading && user ? (
                <>
                  <span className={`text-sm transition-colors ${
                    isScrolled ? 'text-gray-600' : 'text-white text-opacity-90'
                  }`}>
                    {user.user_metadata?.name || user.email?.split('@')[0]}님
                  </span>
                  <button
                    onClick={() => {
                      console.log('🖱️ Desktop logout button clicked');
                      signOut();
                    }}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isScrolled
                        ? 'text-gray-600 hover:text-brand'
                        : 'text-white text-opacity-90 hover:text-white hover:bg-white hover:bg-opacity-20'
                    }`}
                  >
                    로그아웃
                  </button>
                </>
              ) : !loading ? (
                <>
                  <Link
                    href="/auth/login"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isScrolled
                        ? 'text-gray-600 hover:text-brand'
                        : 'text-white text-opacity-90 hover:text-white hover:bg-white hover:bg-opacity-20'
                    }`}
                  >
                    로그인
                  </Link>
                  <Link
                    href="/auth/signup"
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      isScrolled
                        ? 'bg-brand text-white hover:bg-brand-700'
                        : 'bg-white bg-opacity-20 text-white hover:bg-white hover:bg-opacity-30 border border-white border-opacity-30'
                    }`}
                  >
                    무료 체험
                  </Link>
                </>
              ) : null}
            </div>
          </nav>

          {/* 모바일 햄버거 메뉴 버튼 */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-500"
              aria-expanded="false"
            >
              <span className="sr-only">메뉴 열기</span>
              {/* 햄버거 아이콘 */}
              <svg
                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              {/* X 아이콘 */}
              <svg
                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* 모바일 메뉴 드롭다운 */}
        <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200 shadow-lg">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive(item.href)
                    ? 'text-brand bg-brand-50'
                    : 'text-gray-600 hover:text-brand hover:bg-gray-50'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex flex-col space-y-2">
                {!loading && user ? (
                  <>
                    <div className="px-3 py-2 text-base font-medium text-gray-600">
                      {user.user_metadata?.name || user.email?.split('@')[0]}님
                    </div>
                    <button
                      onClick={() => {
                        console.log('📱 Mobile logout button clicked');
                        signOut();
                        closeMenu();
                      }}
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-brand hover:bg-gray-50 transition-colors text-left"
                    >
                      로그아웃
                    </button>
                  </>
                ) : !loading ? (
                  <>
                    <Link
                      href="/auth/login"
                      onClick={closeMenu}
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-brand hover:bg-gray-50 transition-colors"
                    >
                      로그인
                    </Link>
                    <Link
                      href="/auth/signup"
                      onClick={closeMenu}
                      className="block px-3 py-2 rounded-md text-base font-medium bg-brand text-white hover:bg-brand-700 transition-colors text-center"
                    >
                      무료 체험
                    </Link>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};