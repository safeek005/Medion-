import React from 'react';

interface BadgeProps {
  variant?: 'blue' | 'green' | 'amber' | 'red';
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'blue', children, icon }) => {
  const variantClass =
    variant === 'green'
      ? 'badge-green'
      : variant === 'amber'
      ? 'badge-amber'
      : variant === 'red'
      ? 'badge-red'
      : 'badge-blue';

  return (
    <span className={`badge-ui ${variantClass}`}>
      {icon}
      {children}
    </span>
  );
};
