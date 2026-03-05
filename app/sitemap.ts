import { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://tarevity.pt';
  const currentDate = new Date();

  const publicRoutes = [
    {
      path: '',
      changeFrequency: 'weekly' as const,
      priority: 1.0,
    },
    {
      path: '/privacy',
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      path: '/terms',
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
  ];

  const routes: MetadataRoute.Sitemap = [];

  routing.locales.forEach((locale) => {
    publicRoutes.forEach((route) => {
      routes.push({
        url: `${baseUrl}/${locale}${route.path}`,
        lastModified: currentDate,
        changeFrequency: route.changeFrequency,
        priority: route.priority,
        alternates: {
          languages: Object.fromEntries(
            routing.locales.map((loc) => [
              loc,
              `${baseUrl}/${loc}${route.path}`,
            ]),
          ),
        },
      });
    });
  });

  return routes;
}
