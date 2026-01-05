import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

const Login = () => {
    const navigate = useNavigate()
    const { signIn } = useAuth()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        const { error } = await signIn(formData.email, formData.password)

        if (error) {
            toast.error(error.message || 'Erro ao fazer login')
            setLoading(false)
        } else {
            toast.success('Login realizado com sucesso!')
            navigate('/')
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-bg-primary p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <img src="/batman-logo.svg" alt="Wayne System" className="w-16 h-16 mx-auto mb-4" />
                    <h1 className="text-3xl font-bold text-text-primary font-mono">WAYNE SYSTEM</h1>
                    <p className="text-text-secondary mt-2">Sistema de Produtividade Pessoal</p>
                </div>

                {/* Login Form */}
                <div className="card-base">
                    <h2 className="text-2xl font-semibold text-text-primary mb-6">Login</h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="Email"
                            type="email"
                            placeholder="seu@email.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />

                        <Input
                            label="Senha"
                            type="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />

                        <Button type="submit" className="w-full" loading={loading}>
                            Entrar
                        </Button>
                    </form>

                    <div className="mt-6 text-center space-y-2">
                        <p className="text-sm text-text-secondary">
                            Não tem uma conta?{' '}
                            <Link to="/register" className="text-text-primary hover:underline font-medium">
                                Criar conta
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login
