import React, { ReactNode } from 'react';
import { clsx } from 'clsx';

export interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray';
  className?: string;
  onClick?: () => void;
}

const colorStyles = {
  blue: {
    bg: 'bg-blue-50',
    icon: 'bg-blue-100 text-blue-600',
    trend: 'text-blue-600',
  },
  green: {
    bg: 'bg-green-50',
    icon: 'bg-green-100 text-green-600',
    trend: 'text-green-600',
  },
  yellow: {
    bg: 'bg-yellow-50',
    icon: 'bg-yellow-100 text-yellow-600',
    trend: 'text-yellow-600',
  },
  red: {
    bg: 'bg-red-50',
    icon: 'bg-red-100 text-red-600',
    trend: 'text-red-600',
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'bg-purple-100 text-purple-600',
    trend: 'text-purple-600',
  },
  gray: {
    bg: 'bg-gray-50',
    icon: 'bg-gray-100 text-gray-600',
    trend: 'text-gray-600',
  },
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  subtitle,
  color = 'blue',
  className,
  onClick,
}) => {
  const styles = colorStyles[color];

  return (
    <div
      className={clsx(
        'bg-white rounded-lg border border-gray-200 p-6 shadow-sm',
        onClick && 'cursor-pointer hover:shadow-md transition-shadow duration-200',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
          <div className="mt-1 flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
            {trend && (
              <span
                className={clsx(
                  'ml-2 text-sm font-medium',
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                )}
              >
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
            )}
          </div>
          {subtitle && (
            <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div
            className={clsx(
              'flex-shrink-0 p-3 rounded-full',
              styles.icon
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
