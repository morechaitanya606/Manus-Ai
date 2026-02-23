import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
    'inline-flex items-center rounded-none border border-border-std border-dashed px-2.5 py-0.5 text-xs font-semibold transition-colors',
    {
        variants: {
            variant: {
                default: 'bg-cyan/10 text-cyan',
                secondary: 'bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))]',
                success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
                warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
                destructive: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
                info: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-400',
                outline: 'border border-border-std text-white',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

export interface BadgeProps
    extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> { }

export function Badge({ className, variant, ...props }: BadgeProps) {
    return <span className={cn(badgeVariants({ variant, className }))} {...props} />;
}

const STATUS_VARIANT_MAP: Record<string, BadgeProps['variant']> = {
    CREATED: 'info',
    PAYMENT_PENDING: 'warning',
    PAID: 'success',
    PROCESSING: 'info',
    SHIPPED: 'default',
    DELIVERED: 'success',
    CANCELLED: 'destructive',
    PAYMENT_FAILED: 'destructive',
    QUEUED: 'secondary',
    COMPLETED: 'success',
    FAILED: 'destructive',
    PENDING: 'warning',
    SUCCEEDED: 'success',
    REFUNDED: 'info',
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
    const variant = STATUS_VARIANT_MAP[status] || 'secondary';
    return (
        <Badge variant={variant} className={className}>
            {status.replace(/_/g, ' ')}
        </Badge>
    );
}
