import { useId, type SVGProps } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...classes: (string | undefined | null | false)[]) {
  return twMerge(clsx(classes));
}

interface BrandLogoProps extends Omit<SVGProps<SVGSVGElement>, 'width' | 'height'> {
  size?: number;
  variant?: 'full' | 'icon';
  containerClassName?: string;
}

export default function BrandLogo({
  size = 32,
  variant = 'full',
  containerClassName,
  className,
  ...props
}: BrandLogoProps) {
  const rawId = useId();
  const uid = rawId.replace(/:/g, '');

  const brandGradId = `brandGrad_${uid}`;
  const brandGlowId = `brandGlow_${uid}`;

  return (
    <div className={cn('inline-flex items-center gap-3 select-none', containerClassName)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn('shrink-0 transition-transform duration-300 hover:scale-105', className)}
        {...props}
      >
        <defs>
          <linearGradient id={brandGradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1d4ed8" />
            <stop offset="30%" stopColor="#2563eb" />
            <stop offset="70%" stopColor="#9333ea" />
            <stop offset="100%" stopColor="#c026d3" />
          </linearGradient>
          <filter id={brandGlowId} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#2563eb" floodOpacity="0.35" />
          </filter>
        </defs>

        {/* Outer squircle */}
        <rect
          x="3"
          y="3"
          width="42"
          height="42"
          rx="12"
          fill={`url(#${brandGradId})`}
          filter={`url(#${brandGlowId})`}
        />

        {/* Inner geometric discount & retail POS icon */}
        <path
          d="M17 17L31 31M19 31C19 32.1046 18.1046 33 17 33C15.8954 33 15 32.1046 15 31C15 29.8954 15.8954 29 17 29C18.1046 29 19 29.8954 19 31ZM33 17C33 18.1046 32.1046 19 31 19C29.8954 19 29 18.1046 29 17C29 15.8954 29.8954 15 31 15C32.1046 15 33 15.8954 33 17Z"
          stroke="white"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="31" cy="17" r="1.5" fill="white" />
        <circle cx="17" cy="31" r="1.5" fill="white" />
      </svg>

      {variant === 'full' && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1.5">
            <span className="text-base font-extrabold tracking-tight text-[var(--text-primary)]">
              Kodigo
            </span>
            <span className="text-base font-extrabold tracking-tight bg-gradient-to-r from-blue-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
              POS
            </span>
          </div>
          <span className="text-[10px] font-semibold tracking-wider text-[var(--text-muted)] uppercase mt-0.5">
            Promociones
          </span>
        </div>
      )}
    </div>
  );
}
