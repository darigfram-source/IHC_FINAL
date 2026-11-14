import { PacienteTopBar } from '@/components/paciente/PacienteNavigation';
import { BibliotecaPaciente } from '@/components/paciente/BibliotecaPaciente';

export default function PacienteBibliotecaPage() {
  return (
    <div className="w-full min-h-full">
      <PacienteTopBar titulo="Biblioteca educativa" subtitulo="Guías con referencias científicas" badge="Biblioteca" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <BibliotecaPaciente />
      </div>
    </div>
  );
}
