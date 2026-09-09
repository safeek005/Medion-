import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'destructive' | 'danger' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  className = '',
  disabled,
  style,
  ...props
}) => {
  let variantClass = 'btn-primary-ui';
  if (variant === 'secondary') variantClass = 'btn-secondary-ui';
  else if (variant === 'tertiary' || variant === 'ghost') variantClass = 'btn-ghost-ui';
  else if (variant === 'destructive' || variant === 'danger') variantClass = 'btn-destructive-ui';
  else if (variant === 'icon') variantClass = 'btn-icon-ui';

  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: { padding: '0.35rem 0.75rem', fontSize: '0.78rem', gap: '0.35rem' },
    md: { padding: '0.55rem 1.15rem', fontSize: '0.86rem', gap: '0.5rem' },
    lg: { padding: '0.75rem 1.5rem', fontSize: '0.96rem', gap: '0.65rem' },
  };

  return (
    <button
      className={`btn-ui ${variantClass} ${className}`}
      disabled={disabled || loading}
      style={{
        ...(variant !== 'icon' ? sizeStyles[size] : {}),
        opacity: disabled || loading ? 0.6 : 1,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        ...style,
      }}
      {...props}
    >
      {loading ? (
        <span
          style={{
            width: 14,
            height: 14,
            border: '2px solid currentColor',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.6s linear infinite',
            display: 'inline-block',
          }}
        />
      ) : (
        icon && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{icon}</span>
      )}
      {children}
    </button>
  );
};
