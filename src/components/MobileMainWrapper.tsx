'use client';

import { usePathname } from 'next/navigation';

export default function MobileMainWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isBuilder = pathname?.startsWith('/builder');

  return (
    <main className={isBuilder ? 'main-content-builder' : 'main-content'}>
      {children}
    </main>
  );
}
