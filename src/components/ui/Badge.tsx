import { ComponentPropsWithoutRef, ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface BadgeProps extends ComponentPropsWithoutRef<'span'> {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  children?: ReactNode;
  className?: string;
}

export function Badge({ children, variant = 'neutral', className, ...props }: BadgeProps) {
  const variants = {
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    danger: 'bg-danger/10 text-danger',
    info: 'bg-accent/10 text-accent',
    neutral: 'bg-surface text-text-secondary',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-xl text-xs font-medium',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
