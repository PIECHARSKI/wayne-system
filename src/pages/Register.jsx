import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

const Register = () => {
    const navigate = useNavigate()
    const { signUp } = useAuth()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    })

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (formData.password !== formData.confirmPassword) {
            toast.error('As senhas não coincidem')
            return
        }

        if (formData.password.length < 6) {
            toast.error('A senha deve ter pelo menos 6 caracteres')
            return
        }

        setLoading(true)

        const { error } = await signUp(formData.email, formData.password, formData.name)

        if (error) {
            toast.error(error.message || 'Erro ao criar conta')
            setLoading(false)
        } else {
            toast.success('Conta criada com sucesso!')
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

                {/* Register Form */}
                <div className="card-base">
                    <h2 className="text-2xl font-semibold text-text-primary mb-6">Criar Conta</h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="Nome"
                            type="text"
                            placeholder="Seu nome"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />

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

                        <Input
                            label="Confirmar Senha"
                            type="password"
                            placeholder="••••••••"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            required
                        />

                        <Button type="submit" className="w-full" loading={loading}>
                            Criar Conta
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-text-secondary">
                            Já tem uma conta?{' '}
                            <Link to="/login" className="text-text-primary hover:underline font-medium">
                                Fazer login
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Register
