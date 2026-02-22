import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--background))] disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-md shadow-[hsl(var(--primary)/0.25)] hover:shadow-lg hover:shadow-[hsl(var(--primary)/0.3)] hover:brightness-110',
        secondary:
          'bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] hover:bg-[hsl(var(--muted))]',
        outline:
          'border border-[hsl(var(--border))] bg-transparent hover:bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]',
        ghost:
          'hover:bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]',
        destructive:
          'bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))] shadow-md shadow-[hsl(var(--destructive)/0.25)] hover:brightness-110',
        success:
          'bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))] shadow-md shadow-[hsl(var(--success)/0.25)] hover:brightness-110',
        gradient:
          'bg-gradient-to-r from-[hsl(262,83%,58%)] to-[hsl(280,80%,65%)] text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]',
        'gradient-warm':
          'bg-gradient-to-r from-[hsl(25,95%,55%)] to-[hsl(280,80%,55%)] text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        default: 'h-10 px-4 py-2',
        lg: 'h-12 px-6 text-base',
        xl: 'h-14 px-8 text-lg',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  )
);
Button.displayName = 'Button';

export { Button, buttonVariants };
