"use client";

import { useState } from 'react';

// 첨부파일 타입
interface AttachmentFile {
  url: string;
  name: string;
}

// 지원사업 카드 props 타입
interface SupportCardProps {
  // 기본 정보
  title: string;
  hostInstitution: string;
  supportMethod: string;
  supportAmount: string;
  applicationDeadline: string;
  source: string;

  // 선택적 정보
  region?: string; // 지역 정보
  interestRate?: string;
  applicationMethod?: string;
  announcementUrl?: string;
  attachments?: AttachmentFile[];
  createdAt?: string; // 관심 등록일 (마이페이지용)
  subventionId?: string; // 북마크 로딩 상태용
  favoriteLoading?: Set<string>; // 북마크 로딩 상태

  // 액션 버튼
  onBookmark?: () => void;
  onRemoveBookmark?: () => void;
  isBookmarked?: boolean;
  showBookmarkButton?: boolean;
  showRemoveButton?: boolean;

  // 레이아웃
  variant?: 'dashboard' | 'mypage'; // 스타일 변형
}

export function SupportCard({
  title,
  hostInstitution,
  supportMethod,
  supportAmount,
  applicationDeadline,
  source,
  region,
  interestRate,
  applicationMethod,
  announcementUrl,
  attachments = [],
  createdAt,
  subventionId,
  favoriteLoading,
  onBookmark,
  onRemoveBookmark,
  isBookmarked = false,
  showBookmarkButton = false,
  showRemoveButton = false,
  variant = 'dashboard'
}: SupportCardProps) {
  const [showMethodDetail, setShowMethodDetail] = useState(false);

  // 접수방법 파싱 함수 (dashboard와 동일한 로직)
  const parseApplicationMethod = (method: string) => {
    if (!method || method === '확인 필요') {
      return {
        summary: '확인 필요',
        detail: method || '확인 필요'
      };
    }

    const methods = [];
    const hasEmail = method.includes('이메일') || method.includes('email') || method.includes('E-mail');

    // 주요 접수 방식 추출 (우선순위 순서)
    if (method.includes('방문')) methods.push('방문');
    if (method.includes('우편')) methods.push('우편');
    if (hasEmail) methods.push('이메일');

    // 이메일이 없는 경우에만 온라인 도메인 체크
    if (!hasEmail && (method.includes('온라인') || method.includes('사이트') || method.includes('.kr') || method.includes('.com') || method.includes('www.') || method.includes('시스템'))) {
      methods.push('온라인');
    }
    // 이메일이 있어도 명시적으로 온라인이 언급된 경우
    else if (hasEmail && (method.includes('온라인') || method.includes('시스템을 통한') || method.includes('접수시스템'))) {
      methods.push('온라인');
    }

    if (method.includes('팩스') || method.includes('팩시밀리') || method.includes('FAX') || method.includes('fax')) methods.push('팩스');
    if (method.includes('전화') || method.includes('유선')) methods.push('전화');
    if (method.includes('모바일') || method.includes('앱') || method.includes('APP')) methods.push('모바일앱');

    // 아무것도 감지되지 않았지만 "접수" 관련 키워드가 있는 경우
    if (methods.length === 0 && (method.includes('접수') || method.includes('신청'))) {
      return {
        summary: '기타 접수',
        detail: method
      };
    }

    return {
      summary: methods.length > 0 ? methods.join(', ') + ' 접수' : '확인 필요',
      detail: method
    };
  };

  // 접수방법 컴포넌트
  const ApplicationMethodDisplay = ({ method }: { method: string }) => {
    const methodInfo = parseApplicationMethod(method);

    const handleToggle = () => {
      setShowMethodDetail(!showMethodDetail);
    };

    return (
      <div className="flex items-center gap-2">
        <span className="badge badge-primary whitespace-nowrap">
          {methodInfo.summary}
        </span>
        {methodInfo.detail.length > 50 && (
          <button
            onClick={handleToggle}
            className="text-xs underline whitespace-nowrap transition-colors duration-200"
            style={{
              color: 'var(--color-accent-blue)',
              fontWeight: 'var(--fw-medium)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--color-accent-cyan)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--color-accent-blue)';
            }}
          >
            {showMethodDetail ? '접기' : '상세보기'}
          </button>
        )}
      </div>
    );
  };

  // 접수방법 상세 정보 컴포넌트
  const ApplicationMethodDetail = ({ method, show }: { method: string, show: boolean }) => {
    const methodInfo = parseApplicationMethod(method);

    if (!show) return null;

    return (
      <div className="mt-2 p-3 text-xs leading-relaxed border-l-2 transition-colors duration-200"
           style={{
             backgroundColor: 'var(--color-primary-gray)',
             borderColor: 'var(--color-accent-blue)',
             borderRadius: 'var(--radius-base)',
             color: 'var(--color-neutral-dark)'
           }}>
        {methodInfo.detail.split('\n').map((line, index) => (
          <div key={index} className="mb-1 last:mb-0">
            {line.trim()}
          </div>
        ))}
      </div>
    );
  };

  // 첨부파일 드롭다운 컴포넌트
  const AttachmentDropdown = ({ attachments }: { attachments: AttachmentFile[] }) => {
    const [isOpen, setIsOpen] = useState(false);

    if (!attachments || attachments.length === 0) {
      return (
        <span className="px-3 py-1.5 text-sm bg-gray-100 text-gray-400 rounded-lg cursor-not-allowed opacity-60 flex items-center gap-2">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          첨부파일 없음
        </span>
      );
    }

    if (attachments.length === 1) {
      return (
        <a
          href={attachments[0].url}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 text-sm bg-white border border-purple-200 rounded-lg hover:bg-purple-50 transition-all duration-200 flex items-center gap-2 shadow-sm"
          style={{
            backgroundColor: 'rgba(124, 58, 237, 0.1)',
            color: 'var(--color-accent-purple)',
            borderColor: 'var(--color-accent-purple)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(124, 58, 237, 0.2)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(124, 58, 237, 0.1)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          첨부파일
        </a>
      );
    }

    return (
      <div className="relative"
           onMouseLeave={() => setIsOpen(false)}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-3 py-1.5 text-sm bg-white border border-purple-200 rounded-lg hover:bg-purple-50 transition-all duration-200 flex items-center gap-2 shadow-sm"
          style={{
            backgroundColor: 'rgba(124, 58, 237, 0.1)',
            color: 'var(--color-accent-purple)',
            borderColor: 'var(--color-accent-purple)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(124, 58, 237, 0.2)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(124, 58, 237, 0.1)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          첨부파일 ({attachments.length}개)
          <svg className={`w-4 h-4 ml-1 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute left-0 top-full mt-1 w-72 card-modern z-20"
                 style={{
                   boxShadow: 'var(--shadow-lg)',
                   borderRadius: 'var(--radius-md)'
                 }}>
              <div className="py-1">
                {attachments.map((file, index) => (
                  <a
                    key={index}
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-4 py-2 text-sm transition-colors duration-200"
                    style={{
                      color: 'var(--color-neutral-dark)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-primary-gray)';
                      e.currentTarget.style.color = 'var(--color-primary-dark)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--color-neutral-dark)';
                    }}
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                           style={{ color: 'var(--color-accent-purple)' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="truncate">{file.name}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  // 마감일 계산 함수 (대시보드와 동일한 로직)
  const getDaysUntilDeadline = (deadline: string) => {
    if (!deadline || deadline === 'N/A' || deadline === '확인 필요') {
      return { status: '확인 필요', color: 'text-gray-500 bg-gray-100' };
    }

    // 날짜 형식이 아닌 텍스트는 그대로 표시 (예산 소진시까지 등)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(deadline)) {
      return { status: deadline, color: 'text-blue-600 bg-blue-50' };
    }

    // 실제 날짜인 경우만 D-day 계산
    try {
      const deadlineDate = new Date(deadline);
      if (isNaN(deadlineDate.getTime())) {
        return { status: deadline, color: 'text-blue-600 bg-blue-50' };
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      deadlineDate.setHours(0, 0, 0, 0);

      const diffTime = deadlineDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        return { status: '마감', color: 'text-red-600 bg-red-50' };
      } else if (diffDays === 0) {
        return { status: '오늘마감', color: 'text-red-600 bg-red-50' };
      } else if (diffDays <= 3) {
        return { status: `${diffDays}일 남음`, color: 'text-orange-600 bg-orange-50' };
      } else if (diffDays <= 7) {
        return { status: `${diffDays}일 남음`, color: 'text-yellow-600 bg-yellow-50' };
      } else {
        return { status: `${diffDays}일 남음`, color: 'text-green-600 bg-green-50' };
      }
    } catch (error) {
      return { status: deadline, color: 'text-blue-600 bg-blue-50' };
    }
  };

  // 금액 포맷팅 함수
  const formatAmount = (amount: string): string => {
    if (!amount || amount === "확인 필요" || amount === "N/A") return "확인 필요";
    if (amount.includes(',')) return amount;
    const num = parseInt(amount.replace(/[^0-9]/g, ''));
    if (isNaN(num)) return amount;
    return num.toLocaleString() + '원';
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateStr: string): string => {
    if (!dateStr || dateStr === 'N/A' || dateStr === '확인 필요') return '확인 필요';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).replace(/\s/g, '');
    } catch {
      return dateStr;
    }
  };

  const deadline = getDaysUntilDeadline(applicationDeadline);

  return (
    <div className="card-modern animate-slide-up group">
      <div className="mb-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
              <h3 className="font-semibold leading-tight group-hover:text-blue-600 transition-colors duration-200" style={{
                fontSize: 'clamp(var(--fs-base), 1.5vw, var(--fs-lg))',
                fontWeight: 'var(--fw-semibold)',
                color: 'var(--color-primary-dark)'
              }}>
                {title}
              </h3>
              <div className="flex-shrink-0">
                <span className={`badge text-xs font-medium w-fit`}
                      style={{
                        backgroundColor: deadline.color.includes('red') ? 'rgba(239, 68, 68, 0.1)' :
                                       deadline.color.includes('orange') ? 'rgba(245, 158, 11, 0.1)' :
                                       deadline.color.includes('yellow') ? 'rgba(245, 158, 11, 0.1)' :
                                       deadline.color.includes('green') ? 'rgba(16, 185, 129, 0.1)' :
                                       deadline.color.includes('blue') ? 'rgba(59, 130, 246, 0.1)' :
                                       'rgba(107, 114, 128, 0.1)',
                        color: deadline.color.includes('red') ? 'var(--color-error)' :
                               deadline.color.includes('orange') ? 'var(--color-warning)' :
                               deadline.color.includes('yellow') ? 'var(--color-warning)' :
                               deadline.color.includes('green') ? 'var(--color-success)' :
                               deadline.color.includes('blue') ? 'var(--color-info)' :
                               'var(--color-neutral-medium)'
                      }}>
                  {deadline.status}
                </span>
              </div>
            </div>
          </div>

          {/* 액션 버튼들 */}
          <div className="flex gap-2">
            {showBookmarkButton && onBookmark && (
              <button
                onClick={onBookmark}
                disabled={!!(subventionId && favoriteLoading?.has(subventionId))}
                className="p-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  color: isBookmarked ? 'var(--color-error)' : 'var(--color-neutral-light)',
                  borderRadius: 'var(--radius-base)'
                }}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.color = 'var(--color-error)';
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = isBookmarked ? 'var(--color-error)' : 'var(--color-neutral-light)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                {subventionId && favoriteLoading?.has(subventionId) ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                  </svg>
                )}
              </button>
            )}

            {showRemoveButton && onRemoveBookmark && (
              <button
                onClick={onRemoveBookmark}
                className="p-2 transition-all duration-200"
                style={{
                  color: 'var(--color-error)',
                  borderRadius: 'var(--radius-base)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.1)';
                  e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* 기본 정보 */}
        <div className="space-y-2 text-sm mb-4"
             style={{ color: 'var(--color-neutral-medium)' }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
            <p><span style={{ fontWeight: 'var(--fw-semibold)', color: 'var(--color-primary-dark)' }}>접수기관:</span> {hostInstitution}</p>
            <p><span style={{ fontWeight: 'var(--fw-semibold)', color: 'var(--color-primary-dark)' }}>지원방식:</span> {supportMethod}</p>
            {region && (
              <p><span style={{ fontWeight: 'var(--fw-semibold)', color: 'var(--color-primary-dark)' }}>지역:</span> {region}</p>
            )}
            {applicationMethod && (
              <div className="flex items-center gap-2">
                <span style={{ fontWeight: 'var(--fw-semibold)', color: 'var(--color-primary-dark)' }}>접수방법:</span>
                <ApplicationMethodDisplay method={applicationMethod} />
              </div>
            )}
          </div>

          {/* 접수방법 상세 정보 */}
          {applicationMethod && (
            <ApplicationMethodDetail method={applicationMethod} show={showMethodDetail} />
          )}

          {/* 상세 정보 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm pt-2"
               style={{ color: 'var(--color-neutral-medium)' }}>
            <span className="flex items-center gap-1">
              💰 <span style={{ fontWeight: 'var(--fw-medium)' }}>지원금액:</span> {formatAmount(supportAmount)}
            </span>

            {interestRate && (
              <span className="flex items-center gap-1">
                📈 <span style={{ fontWeight: 'var(--fw-medium)' }}>금리:</span> {interestRate}
              </span>
            )}

            <span className="flex items-center gap-1">
              📅 <span style={{ fontWeight: 'var(--fw-medium)' }}>마감일:</span> {formatDate(applicationDeadline)}
            </span>

            <span className="flex items-center gap-1">
              🏢 <span style={{ fontWeight: 'var(--fw-medium)' }}>출처:</span> {source}
            </span>

            {createdAt && (
              <span className="flex items-center gap-1">
                ⭐ <span style={{ fontWeight: 'var(--fw-medium)' }}>등록일:</span> {formatDate(createdAt)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 하단 액션 영역 */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div className="flex flex-wrap gap-3">
          {announcementUrl && (
            <a
              href={announcementUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 flex items-center gap-2 shadow-sm"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              공고 보기
            </a>
          )}

          <AttachmentDropdown attachments={attachments} />
        </div>

        {/* 모바일용 북마크/삭제 버튼 */}
        <div className="flex gap-2 sm:hidden">
          {showBookmarkButton && onBookmark && (
            <button
              onClick={onBookmark}
              disabled={!!(subventionId && favoriteLoading?.has(subventionId))}
              className="btn-modern btn-secondary-modern flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {subventionId && favoriteLoading?.has(subventionId) ? '처리중...' : (isBookmarked ? '북마크 해제' : '북마크')}
            </button>
          )}

          {showRemoveButton && onRemoveBookmark && (
            <button
              onClick={onRemoveBookmark}
              className="btn-modern flex-1 transition-all duration-200"
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                color: 'var(--color-error)',
                borderColor: 'var(--color-error)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              삭제
            </button>
          )}
        </div>
      </div>
    </div>
  );
}