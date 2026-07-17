import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/cn';
import { Skeleton } from './Skeleton';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-full font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]';
    
    const variants = {
      primary: 'bg-black text-white hover:bg-black/90 focus:ring-black shadow-sm',
      secondary: 'bg-white border-2 border-border-light text-text-primary hover:bg-surface focus:ring-black',
      ghost: 'bg-transparent text-text-primary hover:bg-surface focus:ring-surface',
      danger: 'bg-danger text-white hover:bg-danger/90 focus:ring-danger shadow-sm',
    };

    const sizes = {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 text-sm',
      lg: 'h-12 px-6 text-base',
    };

    return (
      <button
        ref={ref}
        className={cn("relative overflow-hidden", baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <Skeleton className={cn("h-4 w-1/2 rounded", variant === 'primary' || variant === 'danger' ? "bg-white/30" : "bg-black/10")} />
          </div>
        )}
        <span className={cn("flex items-center justify-center transition-opacity", isLoading ? "opacity-0" : "opacity-100")}>
          {children}
        </span>
      </button>
    );
  }
);

Button.displayName = 'Button';
