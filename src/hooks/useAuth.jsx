import { useState, useEffect, createContext, useContext } from 'react'
import { supabase } from '@/lib/supabase'

const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!supabase) {
            setLoading(false)
            return
        }

        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null)
            setLoading(false)
        })

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
        })

        return () => subscription.unsubscribe()
    }, [])

    const signUp = async (email, password, name) => {
        if (!supabase) return { error: { message: "Supabase não configurado" } }
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name
                }
            }
        })
        return { data, error }
    }

    const signIn = async (email, password) => {
        if (!supabase) return { error: { message: "Supabase não configurado" } }
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        })
        return { data, error }
    }

    const signOut = async () => {
        if (!supabase) return { error: { message: "Supabase não configurado" } }
        const { error } = await supabase.auth.signOut()
        return { error }
    }

    const resetPassword = async (email) => {
        if (!supabase) return { error: { message: "Supabase não configurado" } }
        const { data, error } = await supabase.auth.resetPasswordForEmail(email)
        return { data, error }
    }

    const value = {
        user,
        loading,
        signUp,
        signIn,
        signOut,
        resetPassword
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
