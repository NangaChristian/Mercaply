import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/cn';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'product' | 'seller' | 'order' | 'stat';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const baseStyles = 'bg-background rounded-lg border border-border-light transition-all duration-280 ease-[cubic-bezier(0.4,0,0.2,1)]';
    
    const variants = {
      default: 'shadow-sm hover:shadow-md',
      product: 'shadow-sm hover:shadow-md hover:-translate-y-1 overflow-hidden cursor-pointer',
      seller: 'shadow-sm hover:shadow-md p-6',
      order: 'shadow-sm p-4',
      stat: 'shadow-sm p-6 flex flex-col items-center justify-center text-center',
    };

    return (
      <div
        ref={ref}
        className={cn(baseStyles, variants[variant], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
