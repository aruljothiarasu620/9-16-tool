import type { Metadata } from 'next';
import './globals.css';
import AuthGuard from '@/components/AuthGuard';

export const metadata: Metadata = {
  title: 'InstaFlow - Instagram Automation Builder | FullSizePost',
  description: 'Powerful drag-and-drop Instagram automation inspired by Make.com on FullSizePost. Schedule and automate full size 9:16 ratio posts, reels, stories, and carousels without cropping.',
  keywords: [
    '9:16 ratio post',
    '9:16 post',
    '9:16 poat',
    'full size post',
    'full size post instagram',
    'no crop post',
    'instagram',
    'instagram post',
    'make.com',
    'automation tool',
    'instagram automation tool',
    'instagram no crop photo',
    'full size post scheduler',
    '9:16 layout instagram',
    'no crop instagram post builder',
    'make.com instagram automation',
    'full size image to url converter',
    'instagram 9:16 post creator',
    'insta automation flow',
    'fullsizepost',
    'fullsizepost online',
    'instagram scheduler without cropping',
    '9 16 aspect ratio post maker'
  ]
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
          {children}
        </AuthGuard>
      </body>
    </html>
  );
}
