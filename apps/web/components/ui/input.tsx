import * as React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, helperText, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-[hsl(var(--foreground))]"
          >
            {label}
          </label>
        )}
        <input
          type={type}
          id={inputId}
          className={cn(
            'flex h-10 w-full rounded-lg border bg-transparent px-3 py-2 text-sm outline-none transition-all duration-200',
            'placeholder:text-[hsl(var(--muted-foreground))]',
            'focus:ring-2 focus:ring-[hsl(var(--ring)/0.4)] focus:border-[hsl(var(--ring))]',
            error
              ? 'border-[hsl(var(--destructive))] focus:ring-[hsl(var(--destructive)/0.3)]'
              : 'border-[hsl(var(--border))]',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="text-xs text-[hsl(var(--destructive))]">{error}</p>}
        {helperText && !error && (
          <p className="text-xs text-[hsl(var(--muted-foreground))]">{helperText}</p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-[hsl(var(--foreground))]">
            {label}
          </label>
        )}
        <textarea
          id={inputId}
          className={cn(
            'flex min-h-[80px] w-full rounded-lg border bg-transparent px-3 py-2 text-sm outline-none transition-all duration-200 resize-y',
            'placeholder:text-[hsl(var(--muted-foreground))]',
            'focus:ring-2 focus:ring-[hsl(var(--ring)/0.4)] focus:border-[hsl(var(--ring))]',
            error
              ? 'border-[hsl(var(--destructive))] focus:ring-[hsl(var(--destructive)/0.3)]'
              : 'border-[hsl(var(--border))]',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="text-xs text-[hsl(var(--destructive))]">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

export { Input, Textarea };
