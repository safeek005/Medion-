import React from 'react';

interface CardProps {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ title, subtitle, action, children, className = '' }) => {
  return (
    <div className={`card-ui ${className}`}>
      {(title || action) && (
        <div className="card-header-ui">
          <div>
            {title && <h3 className="h3">{title}</h3>}
            {subtitle && <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '0.15rem' }}>{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
