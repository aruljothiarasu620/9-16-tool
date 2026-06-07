import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import AuthGuard from '@/components/AuthGuard';
import MobileBottomNav from '@/components/MobileBottomNav';
import MobileHeader from '@/components/MobileHeader';
import MobileMainWrapper from '@/components/MobileMainWrapper';

export const metadata: Metadata = {
  title: 'InstaFlow - Instagram Automation Builder | FullSizePost',
  description: 'Powerful drag-and-drop Instagram automation inspired by Make.com on FullSizePost. Schedule posts, carousels, reels and more.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="theme-color" content="#0f0f1a" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthGuard>
          <div style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
            <Sidebar />
            <MobileHeader />
            <MobileMainWrapper>
              {children}
            </MobileMainWrapper>
            <MobileBottomNav />
          </div>
        </AuthGuard>
      </body>
    </html>
  );
}
