import { TextareaHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/cn';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={textareaId} className="block text-sm font-medium text-text-primary mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          <textarea
            id={textareaId}
            ref={ref}
            className={cn(
              'block w-full rounded-md border-transparent bg-surface text-text-primary placeholder-text-tertiary focus:bg-background focus:border-accent focus:ring-1 focus:ring-accent sm:text-sm transition-all duration-280 ease-[cubic-bezier(0.4,0,0.2,1)] py-2 px-3 min-h-[100px]',
              error && 'border-danger focus:border-danger focus:ring-danger bg-danger/5',
              !error && 'border-border-light hover:border-border',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="mt-1.5 text-sm text-danger">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
