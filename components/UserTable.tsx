'use client';

import React, { useState } from 'react';
import { useNutriMasa } from '@/lib/NutriMasaContext';
import { Usuario } from '@/lib/types';
import {
  Search,
  ArrowUpRight,
  ArrowRight,
  ArrowDownRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  Sliders,
  MessageSquare,
  FileSpreadsheet,
  MinusCircle,
} from 'lucide-react';

export const UserTable: React.FC = () => {
  const {
    usuarios,
    selectedUsuarioId,
    setSelectedUsuarioId,
    setIsDetailModalOpen,
    setIsAdjustModalOpen,
    setActiveTab,
  } = useNutriMasa();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState<'Todos' | 'En progreso' | 'Estancado' | 'Alerta'>('Todos');

  // Filtrado de usuarios
  const filteredUsers = usuarios.filter((user) => {
    const matchesSearch =
      user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filterEstado === 'Todos') return true;
    if (filterEstado === 'En progreso') return user.estado === 'En progreso';
    if (filterEstado === 'Estancado') return user.estado === 'Estancado';
    if (filterEstado === 'Alerta') return user.estado === 'Peso sube, cargas no';
    return true;
  });

  const getEstadoBadge = (estado: Usuario['estado']) => {
    switch (estado) {
      case 'En progreso':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            En progreso
          </span>
        );
      case 'Estancado':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="w-3 h-3 text-amber-600" />
            Estancado
          </span>
        );
      case 'Peso sube, cargas no':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            Peso sube, cargas no
          </span>
        );
      case 'Sin datos':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-300">
            <MinusCircle className="w-3 h-3 text-slate-500" />
            Sin datos
          </span>
        );
    }
  };

  const getCargasIndicator = (tendencia: Usuario['tendencia_cargas']) => {
    switch (tendencia) {
      case 'Suben':
        return (
          <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-xs">
            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
            Suben
          </span>
        );
      case 'Sin cambio':
        return (
          <span className="inline-flex items-center gap-1 text-slate-600 font-medium text-xs">
            <ArrowRight className="w-4 h-4 text-slate-400" />
            Sin cambio
          </span>
        );
      case 'Bajan':
        return (
          <span className="inline-flex items-center gap-1 text-rose-600 font-semibold text-xs">
            <ArrowDownRight className="w-4 h-4 text-rose-500" />
            Bajan
          </span>
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Mis usuarios</h2>
          <p className="text-xs text-slate-500">
            Supervisión diaria de composición corporal y sobrecarga progresiva
          </p>
        </div>

        {/* Buscador y Filtros */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por usuario o ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 w-56 text-slate-800"
            />
          </div>

          <div className="flex bg-slate-200/80 p-0.5 rounded-lg text-xs font-medium">
            {(['Todos', 'En progreso', 'Estancado', 'Alerta'] as const).map((filtro) => (
              <button
                key={filtro}
                onClick={() => setFilterEstado(filtro)}
                className={`px-3 py-1 rounded-md transition-all ${
                  filterEstado === filtro
                    ? 'bg-white text-emerald-800 shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {filtro}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Table (Matches Figure 8 layout) */}
      <div className="flex-1 overflow-x-auto overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-100/70 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              <th className="py-3 px-4">Usuario</th>
              <th className="py-3 px-4">Peso</th>
              <th className="py-3 px-4">Cargas</th>
              <th className="py-3 px-4">Estado</th>
              <th className="py-3 px-4 text-right">Acción rápida</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                  {usuarios.length === 0
                    ? 'Todavía no tienes pacientes asignados. Aparecerán aquí cuando un usuario termine su registro.'
                    : 'No se encontraron usuarios asignados con el filtro seleccionado.'}
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => {
                const isSelected = user.id === selectedUsuarioId;
                return (
                  <tr
                    key={user.id}
                    onClick={() => setSelectedUsuarioId(user.id)}
                    className={`cursor-pointer transition-colors duration-150 group ${
                      isSelected
                        ? 'bg-emerald-50/80 hover:bg-emerald-50 font-medium'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    {/* Usuario */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                            isSelected
                              ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-300'
                              : 'bg-slate-100 text-slate-700 group-hover:bg-emerald-100 group-hover:text-emerald-800'
                          }`}
                        >
                          {user.nombre.includes('0')
                            ? user.nombre.split(' ')[1] || 'U'
                            : user.nombre.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 group-hover:text-emerald-900">
                            {user.nombre}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {user.nivel_entrenamiento} • {user.edad} años
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Peso */}
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      <span>{user.peso_actual.toFixed(1)} kg</span>
                      <span className="text-[11px] text-slate-400 font-normal ml-1">
                        (meta {user.peso_objetivo} kg)
                      </span>
                    </td>

                    {/* Cargas */}
                    <td className="py-3.5 px-4">
                      {getCargasIndicator(user.tendencia_cargas)}
                    </td>

                    {/* Estado */}
                    <td className="py-3.5 px-4">
                      {getEstadoBadge(user.estado)}
                    </td>

                    {/* Acciones */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-90 group-hover:opacity-100">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedUsuarioId(user.id);
                            setIsDetailModalOpen(true);
                          }}
                          title="Ver evolución completa y gráficas"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-100/60 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedUsuarioId(user.id);
                            setIsAdjustModalOpen(true);
                          }}
                          title="Ajustar superávit o macros"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-100/60 transition-colors"
                        >
                          <Sliders className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedUsuarioId(user.id);
                            setActiveTab('mensajes');
                          }}
                          title="Enviar mensaje en chat"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-100/60 transition-colors"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer bar */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
        <div>
          Mostrando <span className="font-semibold text-slate-700">{filteredUsers.length}</span> de{' '}
          <span className="font-semibold text-slate-700">{usuarios.length}</span> pacientes asignados
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            En meta de cargas
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            Meseta (&gt;14 días)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            Desbalance calórico
          </span>
        </div>
      </div>
    </div>
  );
};
