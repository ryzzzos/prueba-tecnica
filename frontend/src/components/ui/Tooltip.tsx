import { type ReactNode, useId, useState, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';

export interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  tooltipClassName?: string;
}

export default function Tooltip({
  content,
  children,
  side = 'top',
  className = '',
  tooltipClassName = '',
}: TooltipProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const tooltipId = useId();
  const [coords, setCoords] = useState({ top: -9999, left: -9999 });

  useLayoutEffect(() => {
    const updatePosition = () => {
      if (open && triggerRef.current && tooltipRef.current) {
        const triggerRect = triggerRef.current.getBoundingClientRect();
        const tooltipRect = tooltipRef.current.getBoundingClientRect();
        
        let top = 0;
        let left = 0;
        const gap = 8;
        
        if (side === 'top') {
          top = triggerRect.top - tooltipRect.height - gap;
          left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);
        } else if (side === 'bottom') {
          top = triggerRect.bottom + gap;
          left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);
        } else if (side === 'left') {
          top = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2);
          left = triggerRect.left - tooltipRect.width - gap;
        } else if (side === 'right') {
          top = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2);
          left = triggerRect.right + gap;
        }
        
        setCoords({ top, left });
      }
    };

    updatePosition();
    
    if (open) {
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
    }
    
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [open, side, content]);

  // Animations
  let initialAnim: { opacity: number; x?: number; y?: number; scale: number } = { opacity: 0, y: 4, scale: 0.96 };
  let exitAnim: { opacity: number; x?: number; y?: number; scale: number } = { opacity: 0, y: 4, scale: 0.96 };

  if (side === 'bottom') {
    initialAnim = { opacity: 0, y: -4, scale: 0.96 };
    exitAnim = { opacity: 0, y: -4, scale: 0.96 };
  } else if (side === 'left') {
    initialAnim = { opacity: 0, x: 4, scale: 0.96 };
    exitAnim = { opacity: 0, x: 4, scale: 0.96 };
  } else if (side === 'right') {
    initialAnim = { opacity: 0, x: -4, scale: 0.96 };
    exitAnim = { opacity: 0, x: -4, scale: 0.96 };
  }

  if (!content) {
    return <>{children}</>;
  }

  return (
    <>
      <div
        ref={triggerRef}
        className={`relative inline-flex ${className}`}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        aria-describedby={open ? tooltipId : undefined}
      >
        {children}
      </div>

      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                id={tooltipId}
                role="tooltip"
                ref={tooltipRef}
                initial={initialAnim}
                animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                exit={exitAnim}
                transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                className={`pointer-events-none fixed z-[2147483647] w-max max-w-[20rem] whitespace-normal break-words rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--surface-3)] px-4 py-2 text-xs font-semibold text-[var(--text-primary)] shadow-[var(--shadow-md)] backdrop-blur-md ${tooltipClassName}`}
                style={{
                  top: coords.top !== -9999 ? coords.top : -9999,
                  left: coords.left !== -9999 ? coords.left : -9999,
                  visibility: coords.top === -9999 ? 'hidden' : 'visible',
                }}
              >
                {content}
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}

export { Tooltip };
