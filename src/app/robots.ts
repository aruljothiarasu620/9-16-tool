import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/privacy', '/deletion'],
      disallow: ['/admin', '/builder', '/settings', '/api/'],
    },
    sitemap: 'https://fullsizepost.online/sitemap.xml',
  };
}
