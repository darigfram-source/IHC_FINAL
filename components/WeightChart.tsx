'use client';

import React, { useState } from 'react';
import { RegistroDiario } from '@/lib/types';

interface WeightChartProps {
  registros: RegistroDiario[];
  pesoObjetivo?: number;
  height?: number;
  showDetails?: boolean;
}

export const WeightChart: React.FC<WeightChartProps> = ({
  registros,
  pesoObjetivo,
  height = 140,
  showDetails = false,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<RegistroDiario | null>(null);

  if (!registros || registros.length === 0) {
    return (
      <div
        className="flex items-center justify-center bg-emerald-950/20 rounded-lg text-emerald-600/70 text-xs border border-emerald-900/20"
        style={{ height }}
      >
        Sin registros de peso en el periodo
      </div>
    );
  }

  // Ordenar cronológicamente
  const sorted = [...registros].sort(
    (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
  );

  const weights = sorted.map((r) => r.peso_ayunas);
  const minWeight = Math.min(...weights) - 0.5;
  const maxWeight = Math.max(...weights) + 0.5;
  const range = maxWeight - minWeight || 1;

  const width = 360;
  const paddingX = 24;
  const paddingY = 20;
  const innerWidth = width - paddingX * 2;
  const innerHeight = height - paddingY * 2;

  const points = sorted.map((r, index) => {
    const x =
      sorted.length > 1
        ? paddingX + (index / (sorted.length - 1)) * innerWidth
        : width / 2;
    const y = height - paddingY - ((r.peso_ayunas - minWeight) / range) * innerHeight;
    return { x, y, record: r };
  });

  const pathD = points.reduce((acc, curr, index) => {
    if (index === 0) return `M ${curr.x} ${curr.y}`;
    // Curva suave
    const prev = points[index - 1];
    const cpX = (prev.x + curr.x) / 2;
    return `${acc} C ${cpX} ${prev.y}, ${cpX} ${curr.y}, ${curr.x} ${curr.y}`;
  }, '');

  // Área sombreada debajo de la curva
  const areaD =
    points.length > 0
      ? `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`
      : '';

  return (
    <div className="relative w-full select-none">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full overflow-visible"
        style={{ height }}
      >
        <defs>
          <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Líneas guía horizontales */}
        <line
          x1={paddingX}
          y1={paddingY}
          x2={width - paddingX}
          y2={paddingY}
          stroke="#e2e8f0"
          strokeDasharray="3 3"
          strokeWidth="0.8"
        />
        <line
          x1={paddingX}
          y1={height - paddingY}
          x2={width - paddingX}
          y2={height - paddingY}
          stroke="#cbd5e1"
          strokeWidth="1"
        />

        {/* Línea de objetivo si existe */}
        {pesoObjetivo && pesoObjetivo >= minWeight && pesoObjetivo <= maxWeight && (
          <g>
            <line
              x1={paddingX}
              y1={height - paddingY - ((pesoObjetivo - minWeight) / range) * innerHeight}
              x2={width - paddingX}
              y2={height - paddingY - ((pesoObjetivo - minWeight) / range) * innerHeight}
              stroke="#059669"
              strokeDasharray="4 2"
              strokeWidth="1"
            />
          </g>
        )}

        {/* Área sombreada */}
        <path d={areaD} fill="url(#weightGradient)" />

        {/* Curva principal */}
        <path
          d={pathD}
          fill="none"
          stroke="#10b981"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Puntos interactivos */}
        {points.map((pt, i) => (
          <g key={i}>
            <circle
              cx={pt.x}
              cy={pt.y}
              r={hoveredPoint?.id === pt.record.id ? 5 : 3.5}
              fill="#ffffff"
              stroke="#059669"
              strokeWidth="2"
              className="transition-all cursor-pointer hover:r-5"
              onMouseEnter={() => setHoveredPoint(pt.record)}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          </g>
        ))}
      </svg>

      {/* Etiquetas mín/máx */}
      <div className="flex justify-between items-center text-[11px] text-slate-500 font-medium px-2 mt-1">
        <span>{sorted[0]?.fecha ? new Date(sorted[0].fecha).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' }) : 'Inicio'}</span>
        <span className="text-emerald-700 font-semibold">
          Último: {weights[weights.length - 1]} kg
        </span>
        <span>{sorted[sorted.length - 1]?.fecha ? new Date(sorted[sorted.length - 1].fecha).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' }) : 'Hoy'}</span>
      </div>

      {/* Tooltip flotante */}
      {hoveredPoint && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white text-[11px] px-2.5 py-1 rounded shadow-md pointer-events-none flex gap-2 items-center">
          <span className="text-emerald-400 font-bold">{hoveredPoint.peso_ayunas} kg</span>
          <span className="text-slate-300">({hoveredPoint.fecha})</span>
          {hoveredPoint.sentadilla_kg && (
            <span className="text-slate-400 border-l border-slate-700 pl-2">
              Sq: {hoveredPoint.sentadilla_kg}kg
            </span>
          )}
        </div>
      )}
    </div>
  );
};
