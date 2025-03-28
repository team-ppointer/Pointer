import { Suspense } from 'react';
import type { Metadata, Viewport } from 'next';

import Providers from './providers';

import '../styles/globals.css';

// 환경에 따른 메타데이터 설정
const isDevelopment =
  process.env.NODE_ENV === 'development' ||
  process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview' ||
  process.env.NEXT_PUBLIC_VERCEL_ENV === 'development';

export const metadata: Metadata = {
  title: '포인터',
  description: '포인터',
  robots: isDevelopment
    ? {
        index: false,
        follow: false,
        googleBot: {
          index: false,
          follow: false,
        },
      }
    : {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
        },
      },
  openGraph: {
    title: '포인터',
    description: '포인터 - 여러분의 디지털 가이드',
    url: 'https://www.math-pointer.com',
    siteName: '포인터',
    locale: 'ko_KR',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  return (
    <html lang='ko'>
      <body className={`antialiased`}>
        <Providers>
          <div>{children}</div>
          <Suspense fallback={<></>}>
            <div>{modal}</div>
          </Suspense>
          <div id='modal'></div>
        </Providers>
      </body>
    </html>
  );
}
