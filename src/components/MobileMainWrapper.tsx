'use client';

import { useIsMobile } from '@/lib/useIsMobile';

export default function MobileMainWrapper({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();

  return (
    <main
      className="main-content"
      style={{
        flex: 1,
        minHeight: '100vh',
        marginLeft: isMobile ? '0' : '220px',
        transition: 'margin-left 0.3s ease',
        // On mobile: add top padding (header 56px) + bottom padding (nav 64px)
        paddingTop: isMobile ? '68px' : undefined,
        paddingBottom: isMobile ? '76px' : undefined,
        paddingLeft: isMobile ? '16px' : undefined,
        paddingRight: isMobile ? '16px' : undefined,
        boxSizing: 'border-box',
        width: isMobile ? '100%' : undefined,
      }}
    >
      {children}
    </main>
  );
}
