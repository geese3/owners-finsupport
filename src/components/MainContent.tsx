'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

interface MainContentProps {
  children: ReactNode;
}

export const MainContent: React.FC<MainContentProps> = ({ children }) => {
  const pathname = usePathname();

  // 메인 페이지는 fullpage이므로 padding 없음
  const isMainPage = pathname === '/';

  return (
    <main
      className={`flex-1 ${
        isMainPage ? '' : 'pt-16 sm:pt-18 lg:pt-20'
      }`}
    >
      {children}
    </main>
  );
};