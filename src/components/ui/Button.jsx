import { memo } from 'react'
import { cn } from '@/lib/utils'

const Button = ({
    children,
    variant = 'primary',
    className = '',
    disabled = false,
    loading = false,
    ...props
}) => {
    const baseStyles = 'px-5 py-2.5 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-mono tracking-wide'

    const variants = {
        primary: 'bg-white text-black hover:bg-gray-200 border border-transparent shadow-[0_0_10px_rgba(255,255,255,0.1)] hover:shadow-[0_0_15px_rgba(255,255,255,0.3)]',
        secondary: 'bg-transparent border border-white/10 text-text-primary hover:bg-white/5 hover:border-white/20',
        ghost: 'bg-transparent text-text-muted hover:text-text-primary hover:bg-white/5',
        danger: 'bg-white/5 text-white border border-white/20 hover:bg-white/10 hover:border-white/40',
    }

    return (
        <button
            className={cn(baseStyles, variants[variant], className)}
            disabled={disabled || loading}
            {...props}
        >
            {loading && (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            )}
            {children}
        </button>
    )
}

export default memo(Button)
