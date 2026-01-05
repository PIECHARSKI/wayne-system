import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { LogOut, CloudFog, Clock, Menu } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'
import { getInitials } from '@/lib/utils'

const Header = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => {
    const { user, signOut } = useAuth()
    const [currentTime, setCurrentTime] = useState(new Date())

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date())
        }, 1000)

        return () => clearInterval(timer)
    }, [])

    const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Bruce'

    return (
        <header className="h-auto py-4 sm:py-6 lg:py-8 bg-transparent px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            {/* Mobile menu button */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="lg:hidden text-text-muted hover:text-text-primary transition-colors p-2"
                >
                    <Menu size={24} />
                </button>

                {/* Title */}
                <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-normal text-text-primary tracking-tight">
                        Hello, <span className="text-text-secondary">{userName}</span>
                    </h1>
                </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-6 lg:gap-8">
                {/* Weather Widget - Hidden on mobile */}
                <div className="hidden md:flex items-center gap-3 text-text-muted">
                    <CloudFog size={20} strokeWidth={1.5} />
                    <span className="font-mono text-xs sm:text-sm tracking-widest uppercase">Foggy Night</span>
                </div>

                {/* Time Widget */}
                <div className="flex items-center gap-2 sm:gap-3 text-text-muted">
                    <Clock size={20} strokeWidth={1.5} />
                    <span className="font-mono text-xs sm:text-sm tracking-widest">
                        {format(currentTime, "hh:mm a")}
                    </span>
                </div>

                {/* User/Logout */}
                <button
                    onClick={signOut}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-bg-card border border-white/10 flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-white/30 transition-all"
                    title="Sair"
                >
                    <LogOut size={16} strokeWidth={1.5} />
                </button>
            </div>
        </header>
    )
}

export default Header
