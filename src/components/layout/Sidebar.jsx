import { NavLink } from 'react-router-dom'
import { Home, Target, Dumbbell, Activity, Calendar, DollarSign, Eye, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const Sidebar = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => {
    const originalNavItems = [
        { icon: Home, label: 'Home', path: '/' },
        { icon: Target, label: 'Hábitos', path: '/habits' },
        { icon: Dumbbell, label: 'Treinos', path: '/workouts' },
        { icon: Activity, label: 'Corrida', path: '/running' },
        { icon: Calendar, label: 'Agenda', path: '/calendar' },
        { icon: DollarSign, label: 'Finanças', path: '/finance' },
    ]

    const handleLinkClick = () => {
        if (isMobileMenuOpen) {
            setIsMobileMenuOpen(false)
        }
    }

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className={cn(
                "w-64 h-screen bg-transparent flex flex-col fixed left-0 top-0 pl-6 py-8 transition-transform duration-300 z-50",
                "hidden lg:flex"
            )}>
                {/* Logo */}
                <div className="mb-12 pl-4">
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="Wayne System" className="w-12 h-auto opacity-90" />
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1">
                    <ul className="space-y-6">
                        {originalNavItems.map((item) => {
                            const Icon = item.icon
                            return (
                                <li key={item.path}>
                                    <NavLink
                                        to={item.path}
                                        className={({ isActive }) =>
                                            cn(
                                                "flex items-center gap-4 px-4 py-2 transition-all duration-300 group",
                                                isActive
                                                    ? "text-text-primary"
                                                    : "text-text-muted hover:text-text-secondary"
                                            )
                                        }
                                    >
                                        {({ isActive }) => (
                                            <>
                                                <Icon
                                                    size={24}
                                                    strokeWidth={1.5}
                                                    className={cn(
                                                        "transition-all duration-300",
                                                        isActive ? "text-text-primary" : "text-text-muted group-hover:text-text-secondary"
                                                    )}
                                                />
                                                <span className={cn(
                                                    "font-mono text-base tracking-wide",
                                                    isActive ? "font-medium" : "font-normal"
                                                )}>
                                                    {item.label}
                                                </span>
                                            </>
                                        )}
                                    </NavLink>
                                </li>
                            )
                        })}
                    </ul>
                </nav>
            </aside>

            {/* Mobile Sidebar Drawer */}
            <aside className={cn(
                "w-64 h-screen bg-bg-primary border-r border-white/10 flex flex-col fixed left-0 top-0 px-6 py-6 transition-transform duration-300 z-50",
                "lg:hidden",
                isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {/* Header with close button */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="Wayne System" className="w-10 h-auto opacity-90" />
                    </div>
                    <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-text-muted hover:text-text-primary transition-colors p-2"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1">
                    <ul className="space-y-4">
                        {originalNavItems.map((item) => {
                            const Icon = item.icon
                            return (
                                <li key={item.path}>
                                    <NavLink
                                        to={item.path}
                                        onClick={handleLinkClick}
                                        className={({ isActive }) =>
                                            cn(
                                                "flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-300",
                                                isActive
                                                    ? "text-text-primary bg-white/5 border border-white/10"
                                                    : "text-text-muted hover:text-text-secondary hover:bg-white/5"
                                            )
                                        }
                                    >
                                        {({ isActive }) => (
                                            <>
                                                <Icon
                                                    size={22}
                                                    strokeWidth={1.5}
                                                    className={cn(
                                                        "transition-all duration-300",
                                                        isActive ? "text-text-primary" : "text-text-muted"
                                                    )}
                                                />
                                                <span className={cn(
                                                    "font-mono text-sm tracking-wide",
                                                    isActive ? "font-medium" : "font-normal"
                                                )}>
                                                    {item.label}
                                                </span>
                                            </>
                                        )}
                                    </NavLink>
                                </li>
                            )
                        })}
                    </ul>
                </nav>
            </aside>
        </>
    )
}

export default Sidebar
