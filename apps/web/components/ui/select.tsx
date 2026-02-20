import * as React from 'react';
import { cn } from '../../lib/utils';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: Array<{ value: string; label: string }>;
    placeholder?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, label, error, options, placeholder, id, ...props }, ref) => {
        const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

        return (
            <div className="w-full space-y-1.5">
                {label && (
                    <label htmlFor={selectId} className="block text-sm font-medium text-[hsl(var(--foreground))]">
                        {label}
                    </label>
                )}
                <select
                    id={selectId}
                    className={cn(
                        'flex h-10 w-full appearance-none rounded-lg border bg-transparent px-3 py-2 text-sm outline-none transition-all duration-200',
                        'focus:ring-2 focus:ring-[hsl(var(--ring)/0.4)] focus:border-[hsl(var(--ring))]',
                        error
                            ? 'border-[hsl(var(--destructive))]'
                            : 'border-[hsl(var(--border))]',
                        className
                    )}
                    ref={ref}
                    {...props}
                >
                    {placeholder && <option value="">{placeholder}</option>}
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                {error && <p className="text-xs text-[hsl(var(--destructive))]">{error}</p>}
            </div>
        );
    }
);
Select.displayName = 'Select';

export { Select };
