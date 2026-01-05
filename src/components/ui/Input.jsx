import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

const Input = forwardRef(({
    label,
    error,
    className = '',
    ...props
}, ref) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-xs font-mono font-medium text-text-secondary mb-2 uppercase tracking-wider">
                    {label}
                </label>
            )}
            <input
                ref={ref}
                className={cn(
                    'w-full bg-zinc-900/50 border border-white/10 rounded-lg px-4 py-3 text-text-primary placeholder:text-text-muted outline-none transition-all duration-300 focus:border-white/30 focus:ring-1 focus:ring-white/10 focus:bg-zinc-900/80',
                    error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
                    className
                )}
                {...props}
            />
            {error && (
                <p className="mt-1 text-xs text-red-500 font-mono">{error}</p>
            )}
        </div>
    )
})

Input.displayName = 'Input'

export default Input
