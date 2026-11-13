import { Metadata } from 'next';
import { MobileApp } from '@/components/mobile/MobileApp';

export const metadata: Metadata = {
  title: 'NutriMasa Móvil | App del Paciente',
  description: 'Registro diario en menos de 30 segundos, seguimiento de hipertrofia y chat con tu nutriólogo.',
};

export default function AppPage() {
  return <MobileApp />;
}
