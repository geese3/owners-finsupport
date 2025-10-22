'use client';

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import {
  Rocket,
  BarChart3,
  Coins,
  FileText,
  PartyPopper,
  Bot,
  Mail,
  Phone,
  MessageCircle,
  Target,
  ChevronUp
} from 'lucide-react';

export default function Home() {
  const { user, loading } = useAuth();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);

  // 섹션 정의
  const sections = ['hero', 'stats', 'features', 'process', 'cta'];

  // 스크롤 이벤트 처리
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      setShowScrollTop(scrolled > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fullpage 스크롤 핸들러
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (isScrolling) return;

      e.preventDefault();
      setIsScrolling(true);

      const delta = e.deltaY;
      const nextSection = delta > 0 ?
        Math.min(currentSection + 1, sections.length - 1) :
        Math.max(currentSection - 1, 0);

      if (nextSection !== currentSection) {
        setCurrentSection(nextSection);
        scrollToSection(nextSection);
      }

      setTimeout(() => setIsScrolling(false), 1000);
    };

    const scrollToSection = (sectionIndex: number) => {
      const sectionElement = document.querySelector(`[data-section="${sections[sectionIndex]}"]`);
      if (sectionElement) {
        sectionElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    };

    // 키보드 이벤트 (화살표 키)
    const handleKeydown = (e: KeyboardEvent) => {
      if (isScrolling) return;

      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        const nextSection = Math.min(currentSection + 1, sections.length - 1);
        if (nextSection !== currentSection) {
          setCurrentSection(nextSection);
          scrollToSection(nextSection);
          setIsScrolling(true);
          setTimeout(() => setIsScrolling(false), 1000);
        }
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        const prevSection = Math.max(currentSection - 1, 0);
        if (prevSection !== currentSection) {
          setCurrentSection(prevSection);
          scrollToSection(prevSection);
          setIsScrolling(true);
          setTimeout(() => setIsScrolling(false), 1000);
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeydown);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeydown);
    };
  }, [currentSection, isScrolling, sections]);

  // 맨 위로 스크롤
  const scrollToTop = () => {
    setCurrentSection(0);
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className="min-h-screen" style={{
      background: 'var(--color-primary-light)',
      overflow: 'hidden' // fullpage 모드에서는 스크롤바 숨김
    }}>

      {/* Hero Section */}
      <section
        data-section="hero"
        className="hero-modern animate-fade-in min-h-screen flex items-center justify-center relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, var(--color-primary-dark) 0%, #0f0f0f 100%)',
          color: 'var(--color-primary-light)'
        }}>
        <div className="container-modern relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <div className="badge badge-primary mb-8 shadow-lg animate-slide-up">
              <Rocket className="w-4 h-4 mr-2" />
              AI 기반 정부지원사업 플랫폼
            </div>
            <h1 className="mb-12 animate-slide-up" style={{
              fontSize: 'clamp(var(--fs-4xl), 6vw, var(--fs-5xl))',
              fontWeight: 'var(--fw-extrabold)',
              lineHeight: 'var(--lh-tight)',
              letterSpacing: 'var(--ls-tight)',
              color: 'var(--color-primary-light)'
            }}>
              정부지원사업을
              <br />
              <span className="gradient-text">더 쉽게, 더 정확하게</span>
            </h1>
            <p className="mb-16 max-w-4xl mx-auto animate-slide-up" style={{
              fontSize: 'clamp(var(--fs-lg), 2vw, var(--fs-xl))',
              color: 'rgba(255, 255, 255, 0.9)',
              lineHeight: 'var(--lh-relaxed)'
            }}>
              복잡한 정부지원사업 검색은 이제 그만!
              <br />
              <span style={{
                fontWeight: 'var(--fw-bold)',
                fontSize: 'clamp(var(--fs-xl), 2.5vw, var(--fs-2xl))',
                color: 'var(--color-accent-cyan)'
              }}>우리 회사에 딱 맞는 지원사업</span>을 AI가 찾아드립니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-slide-up">
              {!loading && !user ? (
                <>
                  <Link
                    href="/auth/signup"
                    className="btn-modern btn-primary-modern text-xl animate-float"
                  >
                    무료체험 시작하기 →
                  </Link>
                  <Link
                    href="/demo"
                    className="btn-modern btn-outline-modern text-xl glass-effect"
                    style={{
                      borderColor: 'var(--color-primary-light)',
                      color: 'var(--color-primary-light)'
                    }}
                  >
                    서비스 둘러보기
                  </Link>
                </>
              ) : !loading && user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="btn-modern btn-primary-modern text-xl animate-float"
                  >
                    지원사업 찾기 →
                  </Link>
                  <Link
                    href="/procurement"
                    className="btn-modern btn-outline-modern text-xl glass-effect"
                    style={{
                      borderColor: 'var(--color-primary-light)',
                      color: 'var(--color-primary-light)'
                    }}
                  >
                    공공조달 보기
                  </Link>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Cards Section */}
      <section
        data-section="stats"
        className="min-h-screen flex items-center justify-center relative"
        style={{
          background: 'linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-primary-gray) 100%)'
        }}>
        <div className="container-modern">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="mb-4" style={{
              fontSize: 'clamp(var(--fs-2xl), 4vw, var(--fs-3xl))',
              fontWeight: 'var(--fw-bold)',
              color: 'var(--color-primary-dark)'
            }}>
              <span className="gradient-text">실시간 현황</span>
            </h2>
            <p style={{
              fontSize: 'var(--fs-lg)',
              color: 'var(--color-neutral-medium)'
            }}>오너스 핀서포트가 만들어내는 성과</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 max-w-7xl mx-auto">
            <div className="card-modern text-center group animate-slide-up p-16 min-h-[400px] flex flex-col justify-center">
              <div className="w-32 h-32 mx-auto mb-8 rounded-full flex items-center justify-center animate-float" style={{
                background: 'linear-gradient(135deg, var(--color-accent-blue) 0%, var(--color-accent-cyan) 100%)',
                boxShadow: 'var(--shadow-2xl)'
              }}>
                <BarChart3 className="w-16 h-16 text-white" />
              </div>
              <div className="mb-4 gradient-text" style={{
                fontSize: 'clamp(var(--fs-4xl), 6vw, var(--fs-5xl))',
                fontWeight: 'var(--fw-extrabold)'
              }}>1,500+</div>
              <div className="font-bold text-2xl mb-3" style={{ color: 'var(--color-neutral-dark)' }}>활성 지원사업</div>
              <div className="text-lg" style={{ color: 'var(--color-neutral-medium)' }}>매일 업데이트</div>
            </div>
            <div className="card-modern text-center group animate-slide-up p-16 min-h-[400px] flex flex-col justify-center">
              <div className="w-32 h-32 mx-auto mb-8 rounded-full flex items-center justify-center animate-float" style={{
                background: 'linear-gradient(135deg, var(--color-accent-blue) 0%, var(--color-accent-cyan) 100%)',
                boxShadow: 'var(--shadow-2xl)',
                animationDelay: '0.2s'
              }}>
                <Target className="w-16 h-16 text-white" />
              </div>
              <div className="mb-4 gradient-text" style={{
                fontSize: 'clamp(var(--fs-4xl), 6vw, var(--fs-5xl))',
                fontWeight: 'var(--fw-extrabold)'
              }}>98%</div>
              <div className="font-bold text-2xl mb-3" style={{ color: 'var(--color-neutral-dark)' }}>고객 만족도</div>
              <div className="text-lg" style={{ color: 'var(--color-neutral-medium)' }}>1,200+ 고객 기준</div>
            </div>
            <div className="card-modern text-center group animate-slide-up p-16 min-h-[400px] flex flex-col justify-center">
              <div className="w-32 h-32 mx-auto mb-8 rounded-full flex items-center justify-center animate-float" style={{
                background: 'linear-gradient(135deg, var(--color-accent-blue) 0%, var(--color-accent-cyan) 100%)',
                boxShadow: 'var(--shadow-2xl)',
                animationDelay: '0.4s'
              }}>
                <Coins className="w-16 h-16 text-white" />
              </div>
              <div className="mb-4 gradient-text" style={{
                fontSize: 'clamp(var(--fs-4xl), 6vw, var(--fs-5xl))',
                fontWeight: 'var(--fw-extrabold)'
              }}>50억+</div>
              <div className="font-bold text-2xl mb-3" style={{ color: 'var(--color-neutral-dark)' }}>누적 지원금액</div>
              <div className="text-lg" style={{ color: 'var(--color-neutral-medium)' }}>2024년 기준</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        data-section="features"
        className="min-h-screen flex items-center justify-center relative"
        style={{
          background: 'linear-gradient(135deg, var(--color-primary-gray) 0%, var(--color-primary-light) 100%)'
        }}>
        <div className="container-modern">
          <div className="text-center mb-24 animate-fade-in">
            <h2 className="mb-8 leading-tight"
                style={{
                  fontSize: 'clamp(var(--fs-4xl), 6vw, var(--fs-5xl))',
                  fontWeight: 'var(--fw-bold)',
                  lineHeight: 'var(--lh-tight)',
                  color: 'var(--color-primary-dark)'
                }}>
              왜 <span className="gradient-text">오너스 핀서포트</span>인가요?
            </h2>
            <p className="max-w-3xl mx-auto leading-relaxed"
               style={{
                 fontSize: 'clamp(var(--fs-lg), 3vw, var(--fs-xl))',
                 color: 'var(--color-neutral-medium)',
                 lineHeight: 'var(--lh-relaxed)'
               }}>
              수많은 기업들이 선택한 <span style={{
                fontWeight: 'var(--fw-semibold)',
                color: 'var(--color-accent-blue)'
              }}>차별화된 이유</span>가 있습니다
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 animate-slide-up">
            {/* Feature 1 */}
            <div className="card-modern text-center group">
              <div className="w-24 h-24 mx-auto mb-8 rounded-3xl flex items-center justify-center transition-all duration-300 group-hover:rotate-3 animate-float"
                   style={{
                     background: 'linear-gradient(135deg, var(--color-accent-blue) 0%, var(--color-accent-cyan) 100%)',
                     boxShadow: 'var(--shadow-xl)'
                   }}>
                <svg className="w-12 h-12 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                     style={{ color: 'var(--color-primary-light)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="mb-6"
                  style={{
                    fontSize: 'var(--fs-2xl)',
                    fontWeight: 'var(--fw-bold)',
                    color: 'var(--color-primary-dark)'
                  }}>AI 맞춤 추천</h3>
              <p className="leading-relaxed"
                 style={{
                   fontSize: 'var(--fs-lg)',
                   color: 'var(--color-neutral-medium)',
                   lineHeight: 'var(--lh-relaxed)'
                 }}>
                머신러닝 기반으로 <span style={{
                  fontWeight: 'var(--fw-semibold)',
                  color: 'var(--color-accent-blue)'
                }}>우리 회사에 가장 적합한</span> 지원사업만 골라서 추천해드립니다.
              </p>
              <div className="mt-6 badge badge-primary">
                정확도 98%
              </div>
            </div>

            {/* Feature 2 */}
            <div className="card-modern text-center group">
              <div className="w-24 h-24 mx-auto mb-8 rounded-3xl flex items-center justify-center transition-all duration-300 group-hover:rotate-3 animate-float"
                   style={{
                     background: 'linear-gradient(135deg, var(--color-accent-blue) 0%, var(--color-accent-cyan) 100%)',
                     boxShadow: 'var(--shadow-xl)',
                     animationDelay: '0.2s'
                   }}>
                <svg className="w-12 h-12 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                     style={{ color: 'var(--color-primary-light)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="mb-6"
                  style={{
                    fontSize: 'var(--fs-2xl)',
                    fontWeight: 'var(--fw-bold)',
                    color: 'var(--color-primary-dark)'
                  }}>실시간 알림</h3>
              <p className="leading-relaxed"
                 style={{
                   fontSize: 'var(--fs-lg)',
                   color: 'var(--color-neutral-medium)',
                   lineHeight: 'var(--lh-relaxed)'
                 }}>
                새로운 지원사업이 공고되면 <span style={{
                  fontWeight: 'var(--fw-semibold)',
                  color: 'var(--color-accent-blue)'
                }}>즉시 알려드려</span> 기회를 놓치지 않도록 도와드립니다.
              </p>
              <div className="mt-6 badge badge-primary">
                24/7 모니터링
              </div>
            </div>

            {/* Feature 3 */}
            <div className="card-modern text-center group">
              <div className="w-24 h-24 mx-auto mb-8 rounded-3xl flex items-center justify-center transition-all duration-300 group-hover:rotate-3 animate-float"
                   style={{
                     background: 'linear-gradient(135deg, var(--color-accent-blue) 0%, var(--color-accent-cyan) 100%)',
                     boxShadow: 'var(--shadow-xl)',
                     animationDelay: '0.4s'
                   }}>
                <BarChart3 className="w-12 h-12 text-white" />
              </div>
              <h3 className="mb-6" style={{
                fontSize: 'var(--fs-2xl)',
                fontWeight: 'var(--fw-bold)',
                color: 'var(--color-primary-dark)'
              }}>
                간편한 관리
              </h3>
              <p className="leading-relaxed" style={{
                fontSize: 'var(--fs-lg)',
                color: 'var(--color-neutral-medium)',
                lineHeight: 'var(--lh-relaxed)'
              }}>
                복잡한 서류 작업부터 진행 상황까지 <span style={{
                  fontWeight: 'var(--fw-semibold)',
                  color: 'var(--color-accent-blue)'
                }}>한 곳에서 쉽게</span> 관리할 수 있습니다.
              </p>
              <div className="mt-6 badge badge-primary">
                올인원 대시보드
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section
        data-section="process"
        className="min-h-screen flex items-center justify-center relative"
        style={{
          background: 'linear-gradient(135deg, rgba(0, 102, 255, 0.05) 0%, rgba(0, 102, 255, 0.03) 50%, var(--color-primary-light) 100%)'
        }}>
        <div className="container-modern">
          <div className="text-center mb-24 animate-fade-in">
            <h2 className="mb-8 leading-tight"
                style={{
                  fontSize: 'clamp(var(--fs-4xl), 6vw, var(--fs-5xl))',
                  fontWeight: 'var(--fw-bold)',
                  lineHeight: 'var(--lh-tight)',
                  color: 'var(--color-primary-dark)'
                }}>
              <span className="gradient-text">3단계</span>로 간단하게
            </h2>
            <p className="max-w-3xl mx-auto leading-relaxed"
               style={{
                 fontSize: 'clamp(var(--fs-lg), 3vw, var(--fs-xl))',
                 color: 'var(--color-neutral-medium)',
                 lineHeight: 'var(--lh-relaxed)'
               }}>
              복잡한 과정 없이 <span style={{
                fontWeight: 'var(--fw-semibold)',
                color: 'var(--color-accent-blue)'
              }}>단 3분</span>이면 바로 시작할 수 있습니다
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 animate-slide-up">
            <div className="card-modern text-center group">
              <div className="w-24 h-24 bg-gradient-to-br from-brand to-brand-600 text-white rounded-full flex items-center justify-center mx-auto mb-8 text-3xl font-bold shadow-xl group-hover:shadow-2xl transition-all duration-500 group-hover:rotate-12">
                1
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6"><FileText className="w-6 h-6 inline mr-2" />회사 정보 입력</h3>
              <p className="text-gray-600 leading-relaxed text-lg mb-6">
                업종, 규모, 지역 등 <span className="font-semibold text-brand">기본 정보만</span> 입력하시면 됩니다.
              </p>
              <div className="inline-flex items-center px-4 py-2 bg-brand/10 text-brand rounded-full text-sm font-medium">
                소요시간: 1분
              </div>
            </div>

            <div className="card-modern text-center group">
              <div className="w-24 h-24 bg-gradient-to-br from-brand to-brand-600 text-white rounded-full flex items-center justify-center mx-auto mb-8 text-3xl font-bold shadow-xl group-hover:shadow-2xl transition-all duration-500 group-hover:rotate-12">
                2
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6"><Bot className="w-6 h-6 inline mr-2" />AI 분석</h3>
              <p className="text-gray-600 leading-relaxed text-lg mb-6">
                AI가 <span className="font-semibold text-brand">1,500개 이상의 지원사업</span>을 분석해 맞춤 추천을 제공합니다.
              </p>
              <div className="inline-flex items-center px-4 py-2 bg-brand/10 text-brand rounded-full text-sm font-medium">
                소요시간: 실시간
              </div>
            </div>

            <div className="card-modern text-center group">
              <div className="w-24 h-24 bg-gradient-to-br from-brand to-brand-600 text-white rounded-full flex items-center justify-center mx-auto mb-8 text-3xl font-bold shadow-xl group-hover:shadow-2xl transition-all duration-500 group-hover:rotate-12">
                3
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6"><Rocket className="w-6 h-6 inline mr-2" />신청 및 관리</h3>
              <p className="text-gray-600 leading-relaxed text-lg mb-6">
                추천받은 지원사업에 <span className="font-semibold text-brand">바로 신청</span>하고 진행상황을 확인하세요.
              </p>
              <div className="inline-flex items-center px-4 py-2 bg-brand/10 text-brand rounded-full text-sm font-medium">
                원클릭 신청
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section with Footer */}
      <section
        data-section="cta"
        className="min-h-screen flex flex-col relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, var(--color-accent-blue) 0%, #0052cc 50%, #0369a1 100%)',
          color: 'var(--color-primary-light)'
        }}>
        <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/10"></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        {/* CTA Main Content */}
        <div className="flex-grow flex items-center justify-center px-4 py-16">
          <div className="text-center relative z-10" style={{ maxWidth: '80rem' }}>
          <div className="badge mb-8 glass-effect"
               style={{
                 background: 'rgba(255, 255, 255, 0.2)',
                 color: 'var(--color-primary-light)',
                 border: '1px solid rgba(255, 255, 255, 0.3)',
                 fontSize: 'var(--fs-sm)',
                 fontWeight: 'var(--fw-semibold)'
               }}>
            <PartyPopper className="w-4 h-4 mr-2" />
            지금 가입하면 7일 무료체험
          </div>
          <h2 className="mb-8 leading-tight"
              style={{
                fontSize: 'clamp(var(--fs-4xl), 8vw, var(--fs-5xl))',
                fontWeight: 'var(--fw-bold)',
                lineHeight: 'var(--lh-tight)',
                color: 'var(--color-primary-light)'
              }}>
            우리 회사 맞춤 지원사업을
            <br />
            <span style={{
              opacity: '0.9',
              color: 'var(--color-primary-light)'
            }}>지금 바로 찾아보세요</span>
          </h2>
          <p className="mb-16 max-w-3xl mx-auto leading-relaxed"
             style={{
               fontSize: 'clamp(var(--fs-lg), 3vw, var(--fs-xl))',
               lineHeight: 'var(--lh-relaxed)',
               color: 'var(--color-primary-light)',
               opacity: '0.95'
             }}>
            복잡한 검색은 그만! <span style={{
              fontWeight: 'var(--fw-bold)',
              color: 'var(--color-accent-cyan)'
            }}>AI가 1분 만에</span> 우리 회사에 딱 맞는 지원사업을 찾아드립니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            {!loading && !user ? (
              <>
                <Link
                  href="/auth/signup"
                  className="btn-modern btn-primary-modern text-xl"
                  style={{
                    fontSize: 'var(--fs-xl)',
                    padding: 'var(--space-5) var(--space-12)'
                  }}
                >
                  무료체험 시작하기 →
                </Link>
                <Link
                  href="/contact"
                  className="btn-modern btn-outline-modern glass-effect"
                  style={{
                    fontSize: 'var(--fs-xl)',
                    padding: 'var(--space-5) var(--space-10)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'var(--color-primary-light)',
                    border: '2px solid rgba(255, 255, 255, 0.4)'
                  }}
                >
                  1:1 상담 받기
                </Link>
              </>
            ) : !loading && user ? (
              <>
                <Link
                  href="/dashboard"
                  className="btn-modern btn-primary-modern text-xl"
                  style={{
                    fontSize: 'var(--fs-xl)',
                    padding: 'var(--space-5) var(--space-12)'
                  }}
                >
                  지원사업 검색하기 →
                </Link>
                <Link
                  href="/mypage"
                  className="btn-modern btn-outline-modern glass-effect"
                  style={{
                    fontSize: 'var(--fs-xl)',
                    padding: 'var(--space-5) var(--space-10)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'var(--color-primary-light)',
                    border: '2px solid rgba(255, 255, 255, 0.4)'
                  }}
                >
                  내 정보 관리
                </Link>
              </>
            ) : null}
          </div>
          <div className="mt-12 flex flex-col sm:flex-row gap-8 justify-center items-center"
               style={{
                 color: 'var(--color-primary-light)',
                 fontSize: 'var(--fs-base)',
                 fontWeight: 'var(--fw-medium)'
               }}>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>신용카드 등록 불필요</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>언제든 해지 가능</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>24시간 고객지원</span>
            </div>
          </div>
          </div>
        </div>

        {/* Integrated Footer */}
        <div className="relative z-10 border-t border-white/20" style={{
          background: 'var(--color-primary-dark)',
          color: 'var(--color-primary-light)'
        }}>
          <div className="container-modern py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-white/90">
              {/* Company Info */}
              <div className="md:col-span-2">
                <h3 className="text-2xl font-bold mb-4 gradient-text" style={{
                  background: 'linear-gradient(135deg, var(--color-accent-blue) 0%, var(--color-accent-cyan) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  오너스경영연구소
                </h3>
                <p className="text-white/70 mb-4">
                  AI 기반 정부지원사업 매칭 플랫폼
                </p>
                <div className="flex gap-4">
                  <a href="mailto:info@owners.co.kr" className="text-white/60 hover:text-white transition-colors">
                    <Mail className="w-5 h-5" />
                  </a>
                  <a href="tel:02-1234-5678" className="text-white/60 hover:text-white transition-colors">
                    <Phone className="w-5 h-5" />
                  </a>
                  <a href="#" className="text-white/60 hover:text-white transition-colors">
                    <MessageCircle className="w-5 h-5" />
                  </a>
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h4 className="font-semibold mb-3 text-white/90">서비스</h4>
                <ul className="space-y-2 text-white/60">
                  <li><Link href="/dashboard" className="hover:text-white transition-colors">지원사업 검색</Link></li>
                  <li><Link href="/procurement" className="hover:text-white transition-colors">공공조달</Link></li>
                  <li><Link href="/mypage" className="hover:text-white transition-colors">마이페이지</Link></li>
                </ul>
              </div>

              {/* Support */}
              <div>
                <h4 className="font-semibold mb-3 text-white/90">지원</h4>
                <ul className="space-y-2 text-white/60">
                  <li><Link href="/about" className="hover:text-white transition-colors">서비스 소개</Link></li>
                  <li><Link href="/contact" className="hover:text-white transition-colors">문의하기</Link></li>
                  <li><Link href="/privacy" className="hover:text-white transition-colors">개인정보처리방침</Link></li>
                </ul>
              </div>
            </div>

            {/* Copyright */}
            <div className="mt-8 pt-8 border-t border-white/50 text-center text-white/80 text-sm">
              <p style={{ color: 'rgba(255, 255, 255, 0.8)' }}>© 2025 오너스경영연구소. All rights reserved.</p>
            </div>
          </div>
        </div>
      </section>


      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className={`fixed bottom-8 right-8 btn-modern btn-primary-modern p-4 rounded-full shadow-xl z-50 transition-all duration-300 hover:scale-110 ${
            showScrollTop ? 'animate-slide-up' : ''
          }`}
          style={{
            background: 'linear-gradient(135deg, var(--color-accent-blue) 0%, #0052cc 100%)',
            boxShadow: 'var(--shadow-xl)'
          }}
          aria-label="맨 위로 이동"
        >
          <ChevronUp className="w-6 h-6 text-white" />
        </button>
      )}
    </div>
  );
}