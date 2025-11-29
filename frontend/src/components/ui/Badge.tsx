import React, { ReactNode } from 'react';
import { clsx } from 'clsx';

export interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  rounded?: boolean;
  className?: string;
}

const variantStyles = {
  default: 'bg-gray-100 text-gray-800',
  primary: 'bg-blue-100 text-blue-800',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  danger: 'bg-red-100 text-red-800',
  info: 'bg-purple-100 text-purple-800',
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-0.5 text-sm',
  lg: 'px-3 py-1 text-sm',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  rounded = false,
  className,
}) => {
  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium',
        rounded ? 'rounded-full' : 'rounded-md',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  );
};

// Componente auxiliar para status
export interface StatusBadgeProps {
  status: string;
  statusLabels: Record<string, string>;
  statusColors: Record<string, string>;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  statusLabels,
  statusColors,
  size = 'md',
}) => {
  const label = statusLabels[status] || status;
  const colorClass = statusColors[status] || 'bg-gray-100 text-gray-800';

  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium rounded-full',
        sizeStyles[size],
        colorClass
      )}
    >
      {label}
    </span>
  );
};

export default Badge;
