import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'safe' | 'warning' | 'critical' | 'offline' | 'review' | 'neutral' | 'blue';
  withDot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'neutral',
  withDot = true,
  children,
  ...props
}) => {
  const styles = {
    safe: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    critical: 'bg-rose-50 text-rose-800 border-rose-200',
    offline: 'bg-slate-100 text-slate-700 border-slate-300',
    review: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    neutral: 'bg-slate-100 text-slate-800 border-slate-200',
    blue: 'bg-blue-50 text-blue-800 border-blue-200',
  };

  const dots = {
    safe: 'bg-emerald-500',
    warning: 'bg-amber-500',
    critical: 'bg-rose-500',
    offline: 'bg-slate-400',
    review: 'bg-indigo-500',
    neutral: 'bg-slate-400',
    blue: 'bg-blue-500',
  };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium border tabular-nums',
          styles[variant],
          className
        )
      )}
      {...props}
    >
      {withDot && (
        <span className={clsx('w-1.5 h-1.5 rounded-full flex-shrink-0', dots[variant])} />
      )}
      {children}
    </span>
  );
};
