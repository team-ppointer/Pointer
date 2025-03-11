import type { Metadata } from 'next';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: '포인터',
  description: '포인터',
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
        <div>{children}</div>
        <div>{modal}</div>
      </body>
    </html>
  );
}
