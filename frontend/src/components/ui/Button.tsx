import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
  ...props
}) => {
  const variantClass =
    variant === 'primary'
      ? 'btn-primary-ui'
      : variant === 'secondary'
      ? 'btn-secondary-ui'
      : variant === 'ghost'
      ? 'btn-ghost-ui'
      : 'btn-danger-ui';

  const sizePadding =
    size === 'sm' ? 'padding: 0.35rem 0.75rem; font-size: 0.78rem;' : size === 'lg' ? 'padding: 0.75rem 1.5rem; font-size: 0.95rem;' : '';

  return (
    <button className={`btn-ui ${variantClass} ${className}`} {...props}>
      {icon && <span className="btn-icon">{icon}</span>}
      {children}
    </button>
  );
};
