import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { NutriMasaProvider } from '@/lib/NutriMasaContext';
import { ThemeProvider } from '@/lib/ThemeContext';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'NutriMasa Pro | Plataforma de Hipertrofia y Nutrición Deportiva',
  description:
    'Supervisión nutricional exacta para hipertrofia muscular y sobrecarga progresiva. Plataforma integral adaptable para deportistas y nutriólogos.',
  applicationName: 'NutriMasa Pro',
  authors: [{ name: 'NutriMasa Team' }],
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/icons/icon-192.svg',
    shortcut: '/icons/icon-192.svg',
    apple: '/icons/icon-192.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'NutriMasa',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#059669' },
    { media: '(prefers-color-scheme: dark)', color: '#090e17' },
  ],
};

// Script inline para evitar parpadeo de tema (FOUC)
const themeScript = `
  (function() {
    try {
      var stored = localStorage.getItem('nutrimasa-theme');
      var isDark = false;
      if (stored === 'dark') {
        isDark = true;
      } else if (stored === 'light') {
        isDark = false;
      } else {
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      var root = document.documentElement;
      if (isDark) {
        root.classList.add('dark');
        root.setAttribute('data-theme', 'dark');
        root.style.colorScheme = 'dark';
      } else {
        root.classList.remove('dark');
        root.setAttribute('data-theme', 'light');
        root.style.colorScheme = 'light';
      }
    } catch(e) {}
  })();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <ThemeProvider>
          <NutriMasaProvider>
            {children}
          </NutriMasaProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
