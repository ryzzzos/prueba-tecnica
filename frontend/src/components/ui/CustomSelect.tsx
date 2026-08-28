import { useEffect, useRef, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ChevronDown, Check } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import AppIcon from './AppIcon.tsx';

export interface Option<T> {
  value: T;
  label: string;
  icon?: LucideIcon;
}

export interface CustomSelectProps<T> {
  id?: string;
  label?: string;
  error?: string;
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  icon?: LucideIcon;
  menuClassName?: string;
  variant?: 'solid' | 'glass' | 'ghost';
  align?: 'left' | 'right';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  isRequired?: boolean;
}

export default function CustomSelect<T extends string | number>({
  id,
  label,
  error,
  value,
  options,
  onChange,
  placeholder = 'Seleccionar...',
  className = '',
  buttonClassName = '',
  icon,
  menuClassName = '',
  variant = 'glass',
  align = 'left',
  size = 'md',
  disabled = false,
  isRequired = false,
}: CustomSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  // Variant Styles (with complete glassmorphism support)
  let buttonVariantStyles =
    'bg-[var(--surface-3)] border border-[var(--border-strong)] shadow-[var(--shadow-sm)] text-[var(--text-primary)] hover:bg-[var(--surface-2)]';
  let menuVariantStyles =
    'bg-[var(--surface-2)] border border-[var(--border-strong)] shadow-[var(--shadow-lg)]';

  if (variant === 'glass') {
    buttonVariantStyles =
      'bg-[var(--surface-glass)] backdrop-blur-md border border-[var(--glass-border)] shadow-[var(--glass-shadow)] text-[var(--text-primary)] hover:bg-[var(--surface-2)]/80';
    menuVariantStyles =
      'bg-[var(--surface-glass)] backdrop-blur-2xl border border-[var(--glass-border)] shadow-[var(--glass-shadow)]';
  } else if (variant === 'ghost') {
    buttonVariantStyles =
      'bg-transparent border border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)]/70';
    menuVariantStyles =
      'bg-[var(--surface-3)] border border-[var(--border-strong)] shadow-[var(--shadow-lg)]';
  }

  // Size Styles
  const isSm = size === 'sm';
  const isLg = size === 'lg';
  const sizeStyles = isSm
    ? 'h-9 px-3 text-xs rounded-[var(--radius-sm)]'
    : isLg
      ? 'h-12 px-4 text-base rounded-[var(--radius-lg)]'
      : 'h-11 px-3.5 text-sm rounded-[var(--radius-md)]';

  // Alignment
  const alignStyles = align === 'right' ? 'right-0 left-auto' : 'left-0';

  return (
    <div ref={containerRef} className={`relative flex flex-col gap-1.5 ${className}`} id={id}>
      {label && (
        <label className="text-xs font-semibold text-[var(--text-secondary)] flex items-center gap-1 select-none">
          {label} {isRequired && <span className="text-[var(--color-error)] font-bold">*</span>}
        </label>
      )}

      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between gap-2 font-medium transition-all text-left focus:outline-none focus:ring-2 focus:ring-[var(--app-primary)]/20 focus:border-[var(--app-primary)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
          error ? '!border-[var(--color-error)] focus:ring-[var(--color-error)]/20' : ''
        } ${sizeStyles} ${buttonVariantStyles} ${buttonClassName}`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {icon && <AppIcon icon={icon} className="text-[var(--text-muted)] shrink-0" size="sm" />}
          <span className={`truncate font-medium ${selectedOption ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>
            {selectedOption?.label ?? placeholder}
          </span>
        </div>
        <ChevronDown
          className={`text-[var(--text-muted)] shrink-0 transition-transform duration-200 ${
            isSm ? 'h-3 w-3' : 'h-3.5 w-3.5'
          }`}
          style={{ transform: open ? 'rotate(180deg)' : 'none' }}
        />
      </button>

      {error && <p className="text-[11px] font-medium text-[var(--color-error)] mt-0.5">{error}</p>}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.96, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -6, scale: 0.95, filter: 'blur(6px)' }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className={`absolute top-[calc(100%+6px)] z-[999] min-w-[170px] w-full max-h-64 overflow-y-auto rounded-[var(--radius-lg)] p-1.5 ${alignStyles} ${menuVariantStyles} ${menuClassName}`}
          >
            <div className="space-y-0.5">
              {options.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={String(opt.value)}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-semibold rounded-[var(--radius-md)] transition-all focus:outline-none cursor-pointer whitespace-nowrap ${
                      isSelected
                        ? 'bg-[var(--app-primary)] text-white shadow-[var(--shadow-sm)]'
                        : 'text-[var(--text-primary)] hover:bg-[var(--surface-3)]/90'
                    }`}
                  >
                    <div className="w-4 h-4 flex items-center justify-center shrink-0">
                      {isSelected ? (
                        <Check className="h-3.5 w-3.5 text-white stroke-[2.5]" />
                      ) : opt.icon ? (
                        <AppIcon icon={opt.icon} size="xs" className="text-[var(--text-muted)]" />
                      ) : null}
                    </div>
                    <span className="flex-1 truncate">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export { CustomSelect };
