import React from 'react';

export interface BadgeProps {
  variant?: 'blue' | 'green' | 'emerald' | 'amber' | 'red' | 'neutral' | 'brand';
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'brand',
  children,
  icon,
  className = '',
  style,
}) => {
  let variantClass = 'badge-brand';
  if (variant === 'green' || variant === 'emerald') variantClass = 'badge-green';
  else if (variant === 'amber') variantClass = 'badge-amber';
  else if (variant === 'red') variantClass = 'badge-red';
  else if (variant === 'neutral') variantClass = 'badge-neutral';
  else if (variant === 'blue') variantClass = 'badge-neutral';

  return (
    <span className={`badge-ui ${variantClass} ${className}`} style={style}>
      {icon && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{icon}</span>}
      {children}
    </span>
  );
};
