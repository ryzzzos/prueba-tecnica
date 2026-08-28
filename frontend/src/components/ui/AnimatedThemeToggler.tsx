import { Sun, Moon } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...classes: (string | undefined | null | false)[]) {
  return twMerge(clsx(classes));
}

interface AnimatedThemeTogglerProps {
  isDarkMode: boolean;
  onToggle: () => void;
  className?: string;
}

export function AnimatedThemeToggler({
  isDarkMode,
  onToggle,
  className,
}: AnimatedThemeTogglerProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      className={cn(
        'relative inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--surface-2)] text-[var(--text-secondary)] shadow-[var(--shadow-sm)] transition-all duration-200 hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-primary)]',
        className
      )}
    >
      <div className="relative h-4 w-4">
        <Sun
          className={cn(
            'absolute inset-0 h-4 w-4 transition-all duration-300 transform',
            isDarkMode ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100 text-amber-500'
          )}
        />
        <Moon
          className={cn(
            'absolute inset-0 h-4 w-4 transition-all duration-300 transform',
            isDarkMode ? 'rotate-0 scale-100 opacity-100 text-blue-400' : '-rotate-90 scale-0 opacity-0'
          )}
        />
      </div>
    </button>
  );
}
