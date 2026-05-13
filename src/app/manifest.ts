import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Organize - Sistema de Gestão',
    short_name: 'Organize',
    description: 'Gestão de Clientes e Orçamentos',
    start_url: '/',
    display: 'standalone',
    background_color: '#020617',
    theme_color: '#6366f1',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
      {
        src: '/apple-icon',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
