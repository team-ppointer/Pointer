import { Suspense } from 'react';
import type { Metadata, Viewport } from 'next';
import Script from 'next/script';

import Providers from './providers';

import '../styles/globals.css';

// 환경에 따른 메타데이터 설정
const isDevelopment =
  process.env.NODE_ENV === 'development' ||
  process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview' ||
  process.env.NEXT_PUBLIC_VERCEL_ENV === 'development';

export const metadata: Metadata = {
  metadataBase: isDevelopment
    ? new URL('http://www.dev.math-pointer.com')
    : new URL('https://math-pointer.com'),
  title: '포인터',
  description: '진단과 학습은 꼼꼼하게 성적 향상은 빠르게',
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
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
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
      <head>
        <link rel='preconnect' href='https://www.google-analytics.com' crossOrigin='anonymous' />
        <link rel='preconnect' href='https://prod.math-pointer.com' crossOrigin='anonymous' />
      </head>
      <body className={`antialiased`}>
        <Providers>
          <Suspense fallback={<></>}>
            <div>{children}</div>
            <div>{modal}</div>
          </Suspense>
          <div id='modal'></div>
        </Providers>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=G-7C9ETDHB0G`}
          strategy='lazyOnload'
        />
        <Script id='google-analytics' strategy='lazyOnload'>
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-7C9ETDHB0G');
          `}
        </Script>
      </body>
    </html>
  );
}
