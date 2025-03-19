import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tarevity.pt'

  return {
    rules: {
      userAgent: '*',
      allow: ['/'],
      disallow: [
        '/api/',
        '/auth/',
        '/profile/',
        '/settings/',
        '/dashboard/',
        '/todo/',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
