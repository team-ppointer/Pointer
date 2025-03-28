import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const isDevelopment =
    process.env.NODE_ENV === 'development' ||
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview' ||
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'development';

  // Next.js의 App Router에서는 sitemap.xml이 빌드 타임에 생성되므로
  // 동적으로 호스트 확인은 할 수 없고, 환경 변수에 의존해야 합니다.

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
