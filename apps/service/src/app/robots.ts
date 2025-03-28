import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  // 환경 확인
  const isDevelopment =
    process.env.NODE_ENV === 'development' ||
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview' ||
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'development';

  // 개발 환경에서는 모든 로봇 접근 차단
  if (isDevelopment) {
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
    };
  }

  // 상용 환경에서는 접근 허용 및 사이트맵 제공
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: 'https://www.math-pointer.com/sitemap.xml',
  };
}
