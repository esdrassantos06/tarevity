import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/profile/',
          '/settings/',
          '/auth/',
          '/tasks/',
        ],
      },
    ],
    sitemap: 'https://tarevity.pt/sitemap.xml',
  };
}
