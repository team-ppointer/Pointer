import { Suspense } from 'react';
import type { Metadata, Viewport } from 'next';

import Providers from './providers';

import '../styles/globals.css';

export const metadata: Metadata = {
  title: '포인터',
  description: '포인터',
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
