import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'NutriMasa Pro - Hipertrofia & Nutrición Deportiva',
    short_name: 'NutriMasa',
    description:
      'Plataforma integral de supervisión nutricional e hipertrofia para atletas de fuerza y especialistas.',
    start_url: '/paciente/dashboard',
    display: 'standalone',
    background_color: '#090e17',
    theme_color: '#059669',
    orientation: 'portrait-primary',
    scope: '/',
    categories: ['fitness', 'health', 'medical', 'sports'],
    icons: [
      {
        src: '/icons/icon-192.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icons/icon-maskable-512.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
  };
}
