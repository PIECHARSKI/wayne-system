import { memo } from 'react'
import { cn } from '@/lib/utils'

const Card = ({ children, className = '', hover = true, ...props }) => {
    return (
        <div
            className={cn(
                'bg-bg-card border border-white/5 rounded-2xl p-6 transition-all duration-300',
                hover && 'hover:border-white/20 hover:bg-bg-card-hover',
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
}

export default memo(Card)
