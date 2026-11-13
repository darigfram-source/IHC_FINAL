'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Laptop, ChevronDown, Check } from 'lucide-react';
import { useTheme, Theme } from '@/lib/ThemeContext';

interface ThemeToggleProps {
  variant?: 'compact' | 'segmented' | 'dropdown';
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'compact',
  className = '',
}) => {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  // Cerrar con Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  // VARIANTE: SEGMENTED (Para la vista de Menú > Ajustes)
  if (variant === 'segmented') {
    const options: { value: Theme; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
      { value: 'light', label: 'Claro', icon: Sun },
      { value: 'dark', label: 'Oscuro', icon: Moon },
      { value: 'system', label: 'Auto', icon: Laptop },
    ];

    return (
      <div
        role="radiogroup"
        aria-label="Selección de tema"
        className={`inline-flex p-1 rounded-xl bg-slate-200/70 dark:bg-slate-800/80 border border-slate-300/60 dark:border-slate-700/60 ${className}`}
      >
        {options.map((opt) => {
          const Icon = opt.icon;
          const isSelected = theme === opt.value;
          return (
            <button
              key={opt.value}
              role="radio"
              aria-checked={isSelected}
              onClick={() => setTheme(opt.value)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all min-h-[44px] min-w-[70px] justify-center cursor-pointer focus-visible:outline-2 focus-visible:outline-emerald-500 ${
                isSelected
                  ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // VARIANTE: COMPACT (Botón con menú desplegable para el Header)
  const currentIcon =
    theme === 'system' ? (
      <Laptop className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
    ) : resolvedTheme === 'dark' ? (
      <Moon className="w-4 h-4 text-emerald-400" />
    ) : (
      <Sun className="w-4 h-4 text-amber-500" />
    );

  const getLabel = () => {
    if (theme === 'system') return 'Auto';
    return theme === 'dark' ? 'Oscuro' : 'Claro';
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        aria-label={`Cambiar tema (actual: ${getLabel()})`}
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors min-h-[44px] min-w-[44px] justify-center cursor-pointer focus-visible:outline-2 focus-visible:outline-emerald-500"
      >
        {currentIcon}
        <span className="hidden sm:inline text-xs">{getLabel()}</span>
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 mt-2 w-40 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Apariencia
          </div>

          <button
            role="menuitem"
            onClick={() => {
              setTheme('light');
              setOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium transition-colors cursor-pointer min-h-[40px] ${
              theme === 'light'
                ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 font-bold'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            <span className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-500" />
              <span>Claro</span>
            </span>
            {theme === 'light' && <Check className="w-3.5 h-3.5" />}
          </button>

          <button
            role="menuitem"
            onClick={() => {
              setTheme('dark');
              setOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium transition-colors cursor-pointer min-h-[40px] ${
              theme === 'dark'
                ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 font-bold'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            <span className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-emerald-400" />
              <span>Oscuro</span>
            </span>
            {theme === 'dark' && <Check className="w-3.5 h-3.5" />}
          </button>

          <button
            role="menuitem"
            onClick={() => {
              setTheme('system');
              setOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium transition-colors cursor-pointer min-h-[40px] ${
              theme === 'system'
                ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 font-bold'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            <span className="flex items-center gap-2">
              <Laptop className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span>Automático</span>
            </span>
            {theme === 'system' && <Check className="w-3.5 h-3.5" />}
          </button>
        </div>
      )}
    </div>
  );
};
