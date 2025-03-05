import type { Metadata } from 'next';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: '포인터',
  description: '포인터',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='ko'>
      <body className={`antialiased`}>{children}</body>
    </html>
  );
}
