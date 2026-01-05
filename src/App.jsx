import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { Suspense, lazy } from 'react'
import { AuthProvider, useAuth } from '@/hooks/useAuth'
import Layout from '@/components/layout/Layout'
import Spinner from '@/components/ui/Spinner'

// Lazy load pages for code splitting
const Login = lazy(() => import('@/pages/Login'))
const Register = lazy(() => import('@/pages/Register'))
const Home = lazy(() => import('@/pages/Home'))
const Habits = lazy(() => import('@/pages/Habits'))
const Workouts = lazy(() => import('@/pages/Workouts'))
const Running = lazy(() => import('@/pages/Running'))
const CalendarPage = lazy(() => import('@/pages/Calendar'))
const Finance = lazy(() => import('@/pages/Finance'))

// Loading fallback component
const PageLoader = () => (
    <div className="h-screen flex items-center justify-center bg-bg-primary">
        <Spinner size="lg" />
    </div>
)

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth()

    if (loading) {
        return <PageLoader />
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    return <Layout>{children}</Layout>
}

// Public Route Component (redirect to home if already authenticated)
const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth()

    if (loading) {
        return <PageLoader />
    }

    if (user) {
        return <Navigate to="/" replace />
    }

    return children
}

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Suspense fallback={<PageLoader />}>
                    <Routes>
                        {/* Public routes */}
                        <Route
                            path="/login"
                            element={
                                <PublicRoute>
                                    <Login />
                                </PublicRoute>
                            }
                        />
                        <Route
                            path="/register"
                            element={
                                <PublicRoute>
                                    <Register />
                                </PublicRoute>
                            }
                        />

                        {/* Protected routes */}
                        <Route
                            path="/"
                            element={
                                <ProtectedRoute>
                                    <Home />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/habits"
                            element={
                                <ProtectedRoute>
                                    <Habits />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/workouts"
                            element={
                                <ProtectedRoute>
                                    <Workouts />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/running"
                            element={
                                <ProtectedRoute>
                                    <Running />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/calendar"
                            element={
                                <ProtectedRoute>
                                    <CalendarPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/finance"
                            element={
                                <ProtectedRoute>
                                    <Finance />
                                </ProtectedRoute>
                            }
                        />

                        {/* Catch all */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Suspense>
            </BrowserRouter>

            {/* Toast notifications */}
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: '#1a1a1a',
                        color: '#ffffff',
                        border: '1px solid #2a2a2a',
                    },
                    success: {
                        iconTheme: {
                            primary: '#ffffff',
                            secondary: '#000000',
                        },
                    },
                }}
            />
        </AuthProvider>
    )
}

export default App
