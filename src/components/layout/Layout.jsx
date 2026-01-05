import { useState } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'

const Layout = ({ children }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    return (
        <div className="flex h-screen bg-bg-primary overflow-hidden">
            {/* Sidebar - Desktop: fixed, Mobile: overlay */}
            <Sidebar
                isMobileMenuOpen={isMobileMenuOpen}
                setIsMobileMenuOpen={setIsMobileMenuOpen}
            />

            {/* Mobile overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Main content */}
            <div className="flex-1 flex flex-col w-full lg:ml-64">
                <Header
                    isMobileMenuOpen={isMobileMenuOpen}
                    setIsMobileMenuOpen={setIsMobileMenuOpen}
                />

                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    )
}

export default Layout
