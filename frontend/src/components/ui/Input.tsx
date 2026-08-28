import React, { InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  isRequired?: boolean;
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
  inputSize?: 'sm' | 'md' | 'lg';
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      isRequired,
      required: _unusedRequired,
      startContent,
      endContent,
      inputSize = 'md',
      id,
      className = '',
      containerClassName = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const isMandatory = isRequired;

    const sizeClass =
      inputSize === 'sm'
        ? 'h-9 px-3 text-xs rounded-[var(--radius-sm)]'
        : inputSize === 'lg'
          ? 'h-12 px-4 text-base rounded-[var(--radius-lg)]'
          : 'h-11 px-3.5 text-sm rounded-[var(--radius-md)]';

    return (
      <div className={`flex flex-col gap-1.5 w-full ${containerClassName}`}>
        {label && (
          <label
            htmlFor={id}
            className="text-xs font-semibold text-[var(--text-secondary)] flex items-center gap-1 select-none"
          >
            {label}
            {isMandatory && <span className="text-[var(--color-error)] font-bold">*</span>}
          </label>
        )}

        <div
          className={`relative flex items-center w-full border border-[var(--border-strong)] bg-[var(--surface-2)] shadow-[var(--shadow-sm)] transition-all focus-within:border-[var(--app-primary)] focus-within:ring-2 focus-within:ring-[var(--app-primary)]/20 ${
            error
              ? 'border-[var(--color-error)] focus-within:border-[var(--color-error)] focus-within:ring-[var(--color-error)]/20'
              : ''
          } ${disabled ? 'opacity-50 cursor-not-allowed bg-[var(--surface-1)]' : ''} ${sizeClass}`}
        >
          {startContent && (
            <div className="flex items-center justify-center shrink-0 mr-2.5 text-[var(--text-muted)]">
              {startContent}
            </div>
          )}

          <input
            ref={ref}
            id={id}
            disabled={disabled}
            className={`w-full h-full bg-transparent text-[var(--text-primary)] font-medium placeholder:text-[var(--text-muted)] focus:outline-none disabled:cursor-not-allowed ${className}`}
            {...props}
          />

          {endContent && (
            <div className="flex items-center justify-center shrink-0 ml-2.5 text-[var(--text-muted)]">
              {endContent}
            </div>
          )}
        </div>

        {error && <p className="text-[11px] font-medium text-[var(--color-error)] mt-0.5">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
