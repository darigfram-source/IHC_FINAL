import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { NutriMasaProvider } from '@/lib/NutriMasaContext';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'NutriMasa | Panel del Nutriólogo Deportivo',
  description: 'Plataforma web de supervisión nutricional e hipertrofia para nutriólogos certificados. Plataforma Integral Especialista y Paciente.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-100 text-slate-900 font-sans">
        <NutriMasaProvider>
          {children}
        </NutriMasaProvider>
      </body>
    </html>
  );
}
