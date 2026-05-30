import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import AuthGuard from '@/components/AuthGuard';
import MobileBottomNav from '@/components/MobileBottomNav';
import MobileHeader from '@/components/MobileHeader';

export const metadata: Metadata = {
  title: 'InstaFlow - Instagram Automation Builder',
  description: 'Powerful drag-and-drop Instagram automation inspired by Make.com. Schedule posts, carousels, reels and more.',
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
            {/* Desktop sidebar — hidden on mobile via CSS */}
            <Sidebar />
            {/* Mobile top header — shown only on mobile */}
            <MobileHeader />
            <main
              className="main-content"
              style={{
                flex: 1,
                minHeight: '100vh',
                marginLeft: '220px',
                transition: 'margin-left 0.3s ease',
              }}
            >
              {children}
            </main>
            {/* Mobile bottom nav — shown only on mobile */}
            <MobileBottomNav />
          </div>
        </AuthGuard>
      </body>
    </html>
  );
}
