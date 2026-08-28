import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Check, X, Search, LucideIcon } from 'lucide-react';
import AppIcon from './AppIcon.tsx';

export interface MultiSelectOption {
  value: string;
  label: string;
  sublabel?: string;
  badge?: string;
}

interface MultiSelectProps {
  id?: string;
  label?: string;
  placeholder?: string;
  options: MultiSelectOption[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  icon?: LucideIcon;
  error?: string;
  isRequired?: boolean;
  className?: string;
  maxDisplayChips?: number;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  id,
  label,
  placeholder = 'Seleccionar opciones...',
  options,
  selectedValues,
  onChange,
  icon,
  error,
  isRequired = false,
  className = '',
  maxDisplayChips = 4,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter((opt) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      opt.label.toLowerCase().includes(term) ||
      (opt.sublabel && opt.sublabel.toLowerCase().includes(term)) ||
      (opt.badge && opt.badge.toLowerCase().includes(term))
    );
  });

  const toggleOption = (val: string) => {
    if (selectedValues.includes(val)) {
      onChange(selectedValues.filter((v) => v !== val));
    } else {
      onChange([...selectedValues, val]);
    }
  };

  const removeValue = (e: React.MouseEvent, val: string) => {
    e.stopPropagation();
    onChange(selectedValues.filter((v) => v !== val));
  };

  const selectAll = () => {
    onChange(options.map((o) => o.value));
  };

  const clearAll = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    onChange([]);
  };

  const selectedOptions = options.filter((opt) => selectedValues.includes(opt.value));
  const isAllSelected = options.length > 0 && selectedValues.length === options.length;

  return (
    <div className={`relative flex flex-col gap-1.5 ${className}`} ref={containerRef}>
      {label && (
        <div className="flex items-center justify-between">
          <label
            htmlFor={id}
            className="text-xs font-semibold text-[var(--text-secondary)] select-none"
          >
            {label} {isRequired && <span className="text-[var(--color-error)]">*</span>}
          </label>

          {options.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={isAllSelected ? () => clearAll() : selectAll}
                className="text-[11px] font-bold text-[var(--app-primary)] hover:underline cursor-pointer"
              >
                {isAllSelected ? 'Deseleccionar todos' : 'Seleccionar todos'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main Trigger Box */}
      <div
        id={id}
        tabIndex={0}
        role="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`min-h-11 w-full rounded-[var(--radius-lg)] border px-3.5 py-2 text-xs font-medium transition-all cursor-pointer flex items-center justify-between gap-2 shadow-[var(--shadow-sm)] ${
          error
            ? 'border-[var(--color-error)] bg-[var(--surface-3)]'
            : isOpen
              ? 'border-[var(--app-primary)] bg-[var(--surface-3)] ring-2 ring-[var(--app-primary)]/20'
              : 'border-[var(--border-strong)] bg-[var(--surface-2)] hover:bg-[var(--surface-3)]'
        }`}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0 flex-wrap py-0.5">
          {icon && (
            <AppIcon icon={icon} size="xs" className="text-[var(--text-muted)] shrink-0" />
          )}

          {selectedOptions.length === 0 ? (
            <span className="text-[var(--text-muted)]">{placeholder}</span>
          ) : (
            <div className="flex items-center gap-1.5 flex-wrap">
              {selectedOptions.slice(0, maxDisplayChips).map((opt) => (
                <span
                  key={opt.value}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--app-primary)]/10 text-[var(--app-primary)] dark:text-blue-400 border border-[var(--app-primary)]/25 text-[11px] font-semibold"
                >
                  <span className="truncate max-w-[120px]">{opt.label}</span>
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => removeValue(e, opt.value)}
                    className="flex h-3.5 w-3.5 items-center justify-center rounded-full hover:bg-[var(--app-primary)]/20 cursor-pointer"
                  >
                    <X className="w-2.5 h-2.5" />
                  </span>
                </span>
              ))}

              {selectedOptions.length > maxDisplayChips && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[var(--surface-1)] text-[var(--text-secondary)] border border-[var(--border-strong)] text-[11px] font-bold">
                  +{selectedOptions.length - maxDisplayChips} más
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {selectedValues.length > 0 && (
            <span
              role="button"
              tabIndex={0}
              onClick={clearAll}
              className="text-[10px] font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)] px-1.5 py-0.5 rounded bg-[var(--surface-1)] hover:bg-[var(--surface-2)] cursor-pointer"
              title="Limpiar selección"
            >
              {selectedValues.length}
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 text-[var(--text-muted)] transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-[var(--app-primary)]' : ''
            }`}
          />
        </div>
      </div>

      {error && <span className="text-[11px] font-medium text-[var(--color-error)]">{error}</span>}

      {/* Animated Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: [0.32, 0.72, 0, 1] }}
            className="absolute left-0 right-0 top-full z-50 mt-1.5 max-h-72 rounded-[var(--radius-xl)] border border-[var(--border-strong)] bg-[var(--surface-2)] p-2 shadow-[var(--shadow-lg)] flex flex-col gap-2 backdrop-blur-md"
          >
            {/* Search filter input */}
            <div className="relative shrink-0">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)]" />
              <input
                type="text"
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar opción..."
                className="w-full h-8 pl-8 pr-3 rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--surface-3)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--app-primary)]"
              />
            </div>

            {/* Options list */}
            <div className="flex-1 overflow-y-auto space-y-1 max-h-56 pr-1">
              {filteredOptions.length === 0 ? (
                <div className="py-6 text-center text-xs text-[var(--text-muted)]">
                  No se encontraron resultados para &quot;{search}&quot;
                </div>
              ) : (
                filteredOptions.map((opt) => {
                  const isSelected = selectedValues.includes(opt.value);
                  return (
                    <div
                      key={opt.value}
                      onClick={() => toggleOption(opt.value)}
                      className={`flex items-center justify-between gap-2 px-3 py-2 rounded-[var(--radius-md)] text-xs font-semibold cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-[var(--app-primary)]/15 text-[var(--app-primary)] dark:text-blue-400'
                          : 'text-[var(--text-primary)] hover:bg-[var(--surface-3)]'
                      }`}
                    >
                      <div className="flex flex-col min-w-0 pr-2">
                        <span className="truncate">{opt.label}</span>
                        {opt.sublabel && (
                          <span className="text-[10px] text-[var(--text-muted)] truncate font-normal">
                            {opt.sublabel}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {opt.badge && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-[var(--surface-1)] border border-[var(--border-strong)] text-[10px] font-bold text-[var(--text-secondary)]">
                            {opt.badge}
                          </span>
                        )}
                        <div
                          className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${
                            isSelected
                              ? 'bg-[var(--app-primary)] border-[var(--app-primary)] text-white'
                              : 'border-[var(--border-strong)] bg-[var(--surface-1)]'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MultiSelect;
