'use client';

import React, { useState } from 'react';
import { useNutriMasa } from '@/lib/NutriMasaContext';
import { ArticuloEducativo } from '@/lib/types';
import {
  BookOpen,
  Plus,
  Eye,
  EyeOff,
  Clock,
  Sparkles,
  Bookmark,
  CheckCircle2,
  X,
  FileText,
  Quote,
} from 'lucide-react';

export const LibraryView: React.FC = () => {
  const { articulos, toggleArticuloVisibility, agregarArticulo } = useNutriMasa();

  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [selectedArticle, setSelectedArticle] = useState<ArticuloEducativo | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Formulario nuevo artículo
  const [nuevoTitulo, setNuevoTitulo] = useState('');
  const [nuevaCategoria, setNuevaCategoria] = useState<ArticuloEducativo['categoria']>('Proteína & Salud Renal');
  const [nuevoResumen, setNuevoResumen] = useState('');
  const [nuevoContenido, setNuevoContenido] = useState('');
  const [nuevasCitas, setNuevasCitas] = useState('');
  const [nuevoTiempo, setNuevoTiempo] = useState(3);

  const categorias = [
    'Todas',
    'Proteína & Salud Renal',
    'Superávit Calórico',
    'Suplementación',
    'Entrenamiento',
  ];

  const filteredArticles = articulos.filter((art) => {
    if (selectedCategory === 'Todas') return true;
    return art.categoria === selectedCategory;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoTitulo || !nuevoContenido) return;

    agregarArticulo({
      titulo: nuevoTitulo,
      categoria: nuevaCategoria,
      resumen: nuevoResumen,
      contenido_completo: nuevoContenido,
      citas_cientificas: nuevasCitas || 'Literatura científica revisada.',
      tiempo_lectura_min: nuevoTiempo,
      visible_en_app: true,
    });

    setIsCreateModalOpen(false);
    setNuevoTitulo('');
    setNuevoResumen('');
    setNuevoContenido('');
    setNuevasCitas('');
  };

  return (
    <div className="flex-1 flex flex-col bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden h-[calc(100vh-6.5rem)]">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Biblioteca Educativa Validada
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Material científico contra la desinformación en gimnasios (&quot;bro-science&quot;) sincronizado con la app móvil
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Guía Educativa</span>
        </button>
      </div>

      {/* Filtros por Categoría */}
      <div className="px-4 py-2.5 bg-white border-b border-slate-100 flex items-center gap-2 overflow-x-auto text-xs">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
          Filtrar:
        </span>
        {categorias.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 ${
              selectedCategory === cat
                ? 'bg-emerald-100 text-emerald-900 font-bold border border-emerald-300'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid de Artículos */}
      <div className="flex-1 p-5 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredArticles.map((art) => (
          <div
            key={art.id}
            className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                  {art.categoria}
                </span>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {art.tiempo_lectura_min} min
                  </span>

                  {/* Toggle para mostrar/ocultar en la app móvil */}
                  <button
                    onClick={() => toggleArticuloVisibility(art.id)}
                    title={art.visible_en_app ? 'Visible en app móvil (clic para ocultar)' : 'Oculto en app móvil (clic para mostrar)'}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold transition-colors ${
                      art.visible_en_app
                        ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20'
                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                    }`}
                  >
                    {art.visible_en_app ? (
                      <>
                        <Eye className="w-3 h-3 text-emerald-600" />
                        <span>Visible en App</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3 h-3 text-slate-400" />
                        <span>Oculto</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <h3 className="font-bold text-slate-900 text-sm leading-snug hover:text-emerald-700 transition-colors">
                {art.titulo}
              </h3>
              <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                {art.resumen}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[10px] text-slate-400 truncate max-w-[200px]" title={art.citas_cientificas}>
                {art.citas_cientificas}
              </span>
              <button
                onClick={() => setSelectedArticle(art)}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-900 hover:underline"
              >
                Leer guía completa →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Lector de Artículo Completo */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden max-h-[85vh] flex flex-col">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  {selectedArticle.categoria}
                </span>
                <h3 className="font-bold text-base text-slate-900 mt-1">
                  {selectedArticle.titulo}
                </h3>
              </div>
              <button
                onClick={() => setSelectedArticle(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs leading-relaxed text-slate-700">
              <div className="bg-emerald-50/70 border-l-4 border-emerald-600 p-3.5 rounded-r-lg font-medium text-emerald-950">
                {selectedArticle.resumen}
              </div>

              <div className="whitespace-pre-line text-slate-800 space-y-3">
                {selectedArticle.contenido_completo}
              </div>

              <div className="bg-slate-100 p-3.5 rounded-xl border border-slate-200 mt-4">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 mb-1">
                  <Quote className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Referencias bibliográficas indexadas:</span>
                </div>
                <p className="text-[10px] text-slate-600 italic">
                  {selectedArticle.citas_cientificas}
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedArticle(null)}
                className="px-4 py-2 bg-slate-800 text-white font-bold text-xs rounded-lg hover:bg-slate-900"
              >
                Cerrar Lectura
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Crear Nueva Guía */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm text-white">Nueva Guía de Nutrición e Hipertrofia</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Título de la guía</label>
                <input
                  type="text"
                  required
                  value={nuevoTitulo}
                  onChange={(e) => setNuevoTitulo(e.target.value)}
                  placeholder="ej. Distribución de proteínas a lo largo del día..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Categoría</label>
                  <select
                    value={nuevaCategoria}
                    onChange={(e) => setNuevaCategoria(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  >
                    <option value="Proteína & Salud Renal">Proteína & Salud Renal</option>
                    <option value="Superávit Calórico">Superávit Calórico</option>
                    <option value="Suplementación">Suplementación</option>
                    <option value="Entrenamiento">Entrenamiento</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tiempo de lectura</label>
                  <input
                    type="number"
                    min="1"
                    max="15"
                    value={nuevoTiempo}
                    onChange={(e) => setNuevoTiempo(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Resumen ejecutivo</label>
                <textarea
                  rows={2}
                  required
                  value={nuevoResumen}
                  onChange={(e) => setNuevoResumen(e.target.value)}
                  placeholder="Breve sinopsis para mostrar en la tarjeta de la app..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Contenido completo</label>
                <textarea
                  rows={4}
                  required
                  value={nuevoContenido}
                  onChange={(e) => setNuevoContenido(e.target.value)}
                  placeholder="Desarrollo del artículo con explicación bioquímica y práctica..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Citas científicas</label>
                <input
                  type="text"
                  value={nuevasCitas}
                  onChange={(e) => setNuevasCitas(e.target.value)}
                  placeholder="ej. Morton et al. (2018); Jäger et al. (2017)"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3 py-2 text-slate-600 hover:text-slate-800 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg"
                >
                  Publicar en Biblioteca
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
