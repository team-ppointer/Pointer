import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  // 환경 확인 (개발 환경인지 상용 환경인지)
  const isDevelopment =
    process.env.NODE_ENV === 'development' ||
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview' ||
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'development' ||
    (typeof window !== 'undefined' && window.location.hostname.includes('dev.math-pointer.com'));

  // 개발 환경이면 빈 사이트맵 반환
  if (isDevelopment) {
    return [];
  }

  // 상용 환경에서는 실제 사이트맵 생성
  const baseUrl = 'https://www.math-pointer.com';

  const routes = ['', '/problem', '/report', '/login', '/my-page'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  return routes;
}
