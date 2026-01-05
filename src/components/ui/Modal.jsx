import { useEffect } from 'react'
import { X } from 'lucide-react'
import Button from './Button'

const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    footer,
    size = 'md'
}) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }

        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen])

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose()
        }
    }

    if (!isOpen) return null

    const sizes = {
        sm: 'max-w-md',
        md: 'max-w-2xl',
        lg: 'max-w-4xl',
        full: 'max-w-6xl'
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
            onClick={handleBackdropClick}
        >
            <div className={`bg-[#050505] border border-white/10 rounded-2xl shadow-2xl w-full ${sizes[size]} animate-slide-in relative overflow-hidden`}>
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/[0.02]">
                    <h2 className="text-lg font-mono font-semibold text-text-primary tracking-wider uppercase">{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-text-muted hover:text-text-primary transition-colors p-1 rounded-md hover:bg-white/5"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Modal
