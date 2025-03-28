import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const isDevelopment =
    process.env.NODE_ENV === 'development' ||
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview' ||
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'development';

  // 개발 환경이나 도메인이 dev를 포함하는 경우 크롤링 차단
  if (isDevelopment) {
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
    };
  }

  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: 'https://www.math-pointer.com/sitemap.xml',
  };
}
