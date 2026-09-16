import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  helperText?: string;
  icon?: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  hint,
  helperText,
  icon,
  leftIcon,
  rightIcon,
  className = '',
  id,
  style,
  disabled,
  ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  const effectiveIcon = icon || leftIcon;
  const effectiveHint = helperText || hint;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', width: '100%', ...style }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontSize: '0.78rem',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            letterSpacing: '0.2px',
          }}
        >
          {label}
        </label>
      )}

      <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
        {effectiveIcon && (
          <div
            style={{
              position: 'absolute',
              left: 12,
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'none',
              color: 'var(--text-muted)',
            }}
          >
            {effectiveIcon}
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          className={`input-ui ${error ? 'input-error' : ''} ${className}`}
          style={{
            width: '100%',
            height: 42,
            padding: effectiveIcon ? '0 1rem 0 2.5rem' : rightIcon ? '0 2.5rem 0 1rem' : '0 1rem',
            background: disabled ? 'var(--bg-surface-secondary)' : 'var(--bg-surface)',
            border: error ? '1px solid var(--danger-red)' : '1px solid var(--border-strong)',
            borderRadius: 'var(--radius-md, 10px)',
            fontSize: '0.88rem',
            color: 'var(--text-primary)',
            outline: 'none',
            transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
            cursor: disabled ? 'not-allowed' : 'text',
            opacity: disabled ? 0.7 : 1,
          }}
          {...props}
        />

        {rightIcon && (
          <div
            style={{
              position: 'absolute',
              right: 12,
              display: 'flex',
              alignItems: 'center',
              color: 'var(--text-muted)',
            }}
          >
            {rightIcon}
          </div>
        )}
      </div>

      {error && (
        <span style={{ fontSize: '0.75rem', color: 'var(--danger-red)', fontWeight: 500 }}>
          {error}
        </span>
      )}

      {effectiveHint && !error && (
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          {effectiveHint}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: Array<{ value: string; label: string }>;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  error,
  hint,
  options,
  id,
  style,
  disabled,
  ...props
}, ref) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', width: '100%', ...style }}>
      {label && (
        <label
          htmlFor={selectId}
          style={{
            fontSize: '0.78rem',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            letterSpacing: '0.2px',
          }}
        >
          {label}
        </label>
      )}

      <select
        ref={ref}
        id={selectId}
        disabled={disabled}
        className="select-field"
        style={{
          width: '100%',
          height: 42,
          padding: '0 1rem',
          background: disabled ? 'var(--bg-surface-secondary)' : 'var(--bg-surface)',
          border: error ? '1px solid var(--danger-red)' : '1px solid var(--border-strong)',
          borderRadius: 'var(--radius-md, 10px)',
          fontSize: '0.88rem',
          color: 'var(--text-primary)',
          outline: 'none',
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {error && (
        <span style={{ fontSize: '0.75rem', color: 'var(--danger-red)', fontWeight: 500 }}>
          {error}
        </span>
      )}

      {hint && !error && (
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          {hint}
        </span>
      )}
    </div>
  );
});

Select.displayName = 'Select';
