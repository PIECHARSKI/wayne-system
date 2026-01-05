import { useState, useEffect, useMemo, useCallback, memo } from 'react'
import { Plus, Trash2, Filter, DollarSign, TrendingUp, TrendingDown } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import DatePicker from '@/components/ui/DatePicker'
import Spinner from '@/components/ui/Spinner'
import {
    getTransactions,
    createTransaction,
    deleteTransaction,
    getFinancialSummary
} from '@/lib/api/transactions'
import { formatCurrency, formatDate } from '@/lib/utils'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts'
import toast from 'react-hot-toast'
import { withCache, createCacheKey, invalidateCache } from '@/lib/cache'

const Finance = () => {
    const [transactions, setTransactions] = useState([])
    const [summary, setSummary] = useState({ totalIncome: 0, totalExpenses: 0, balance: 0 })
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [formData, setFormData] = useState({
        type: 'expense',
        amount: '',
        category: '',
        description: '',
        transaction_date: new Date().toISOString().split('T')[0]
    })

    const expenseCategories = [
        'Alimentação',
        'Transporte',
        'Moradia',
        'Saúde',
        'Lazer',
        'Educação',
        'Outros'
    ]

    const incomeCategories = [
        'Salário',
        'Freelance',
        'Investimentos',
        'Outros'
    ]

    useEffect(() => {
        loadTransactions()
    }, [])

    const loadTransactions = useCallback(async () => {
        try {
            const [txData, summaryData] = await Promise.all([
                withCache(createCacheKey('transactions'), () => getTransactions(), 5 * 60 * 1000),
                withCache(createCacheKey('financial-summary'), () => getFinancialSummary(), 5 * 60 * 1000)
            ])
            setTransactions(txData)
            setSummary(summaryData)
        } catch (error) {
            toast.error('Erro ao carregar transações')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }, [])

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault()

        try {
            await createTransaction({
                ...formData,
                amount: parseFloat(formData.amount)
            })
            // Invalidate cache
            invalidateCache(/^transactions/)
            invalidateCache(/^financial-summary/)
            toast.success('Transação criada com sucesso!')
            setIsModalOpen(false)
            setFormData({
                type: 'expense',
                amount: '',
                category: '',
                description: '',
                transaction_date: new Date().toISOString().split('T')[0]
            })
            loadTransactions()
        } catch (error) {
            toast.error('Erro ao criar transação')
            console.error(error)
        }
    }, [formData, loadTransactions])

    const handleDelete = useCallback(async (id) => {
        if (!confirm('Deseja realmente excluir esta transação?')) return

        try {
            await deleteTransaction(id)
            // Invalidate cache
            invalidateCache(/^transactions/)
            invalidateCache(/^financial-summary/)
            toast.success('Transação excluída!')
            await loadTransactions()
        } catch (error) {
            toast.error('Erro ao excluir transação')
            console.error(error)
        }
    }, [loadTransactions])

    // Memoize chart data calculations
    const pieData = useMemo(() => {
        const categoryData = transactions
            .filter(t => t.type === 'expense')
            .reduce((acc, t) => {
                const category = t.category || 'Outros'
                acc[category] = (acc[category] || 0) + Number(t.amount)
                return acc
            }, {})

        return Object.entries(categoryData).map(([name, value], index) => ({
            name,
            value,
            color: `hsl(0, 0%, ${30 + index * 10}%)`
        }))
    }, [transactions])

    const COLORS = useMemo(() => pieData.map(d => d.color), [pieData])

    const lineData = useMemo(() => {
        const monthlyData = transactions.reduce((acc, t) => {
            const month = formatDate(t.transaction_date, 'MMM/yy')
            if (!acc[month]) {
                acc[month] = { month, receitas: 0, despesas: 0, saldo: 0 }
            }
            if (t.type === 'income') {
                acc[month].receitas += Number(t.amount)
            } else {
                acc[month].despesas += Number(t.amount)
            }
            acc[month].saldo = acc[month].receitas - acc[month].despesas
            return acc
        }, {})

        return Object.values(monthlyData).slice(-6)
    }, [transactions])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Spinner size="lg" />
            </div>
        )
    }

    return (
        <div className="space-y-6 sm:space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-text-primary font-mono">Finanças</h1>
                <Button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto">
                    <Plus size={18} />
                    <span className="hidden sm:inline">Nova Transação</span>
                    <span className="sm:hidden">Nova</span>
                </Button>
            </div>

            {/* Dashboard Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <Card className="relative overflow-hidden">
                    <div className="absolute inset-0 opacity-5 bg-gradient-to-br from-white to-gray-500" />
                    <div className="relative flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
                            <DollarSign className="text-white" size={24} />
                        </div>
                        <div>
                            <p className="text-text-secondary text-xs font-mono uppercase tracking-wider mb-1">Saldo Atual</p>
                            <p className="text-3xl font-bold text-text-primary font-mono">
                                {formatCurrency(summary.balance)}
                            </p>
                        </div>
                    </div>
                </Card>

                <Card className="relative overflow-hidden">
                    <div className="absolute inset-0 opacity-5 bg-gradient-to-br from-green-500 to-emerald-500" />
                    <div className="relative flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                            <TrendingUp className="text-green-500" size={24} />
                        </div>
                        <div>
                            <p className="text-text-secondary text-xs font-mono uppercase tracking-wider mb-1">Receitas</p>
                            <p className="text-3xl font-bold text-green-500 font-mono">
                                + {formatCurrency(summary.totalIncome)}
                            </p>
                        </div>
                    </div>
                </Card>

                <Card className="relative overflow-hidden">
                    <div className="absolute inset-0 opacity-5 bg-gradient-to-br from-red-500 to-orange-500" />
                    <div className="relative flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                            <TrendingDown className="text-red-500" size={24} />
                        </div>
                        <div>
                            <p className="text-text-secondary text-xs font-mono uppercase tracking-wider mb-1">Despesas</p>
                            <p className="text-3xl font-bold text-red-500 font-mono">
                                - {formatCurrency(summary.totalExpenses)}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Charts */}
            {transactions.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                    {pieData.length > 0 && (
                        <Card>
                            <h3 className="text-base sm:text-lg font-semibold text-text-primary font-mono mb-4">
                                Despesas por Categoria
                            </h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={(entry) => `${entry.name}: ${formatCurrency(entry.value)}`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => formatCurrency(value)} />
                                </PieChart>
                            </ResponsiveContainer>
                        </Card>
                    )}

                    {lineData.length > 0 && (
                        <Card>
                            <h3 className="text-base sm:text-lg font-semibold text-text-primary font-mono mb-4">
                                Evolução Mensal
                            </h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={lineData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                                    <XAxis dataKey="month" stroke="#8a8a8a" />
                                    <YAxis stroke="#8a8a8a" />
                                    <Tooltip
                                        contentStyle={{
                                            background: '#0A0A0A',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            borderRadius: '8px',
                                            color: '#fff',
                                            fontFamily: 'JetBrains Mono'
                                        }}
                                        formatter={(value) => formatCurrency(value)}
                                    />
                                    <Line type="monotone" dataKey="saldo" stroke="#ffffff" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </Card>
                    )}
                </div>
            )}

            {/* Transactions List */}
            <Card>
                <h3 className="text-base sm:text-lg font-semibold text-text-primary font-mono mb-4">
                    Transações Recentes
                </h3>

                {transactions.length === 0 ? (
                    <p className="text-text-secondary text-center py-8 text-sm sm:text-base">
                        Nenhuma transação encontrada. Crie sua primeira transação!
                    </p>
                ) : (
                    <div className="overflow-x-auto -mx-6 px-6 sm:mx-0 sm:px-0">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left text-text-secondary text-xs font-mono font-medium pb-3 uppercase tracking-wider">Data</th>
                                    <th className="text-left text-text-secondary text-xs font-mono font-medium pb-3 uppercase tracking-wider">Descrição</th>
                                    <th className="text-left text-text-secondary text-xs font-mono font-medium pb-3 uppercase tracking-wider">Categoria</th>
                                    <th className="text-right text-text-secondary text-xs font-mono font-medium pb-3 uppercase tracking-wider">Valor</th>
                                    <th className="text-right text-text-secondary text-xs font-mono font-medium pb-3 uppercase tracking-wider">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((transaction) => (
                                    <tr key={transaction.id} className="border-b border-border">
                                        <td className="py-3 text-text-secondary text-sm font-mono">
                                            {formatDate(transaction.transaction_date)}
                                        </td>
                                        <td className="py-3 text-text-primary text-sm">{transaction.description}</td>
                                        <td className="py-3 text-text-secondary text-sm">{transaction.category}</td>
                                        <td className={`py-3 text-right font-bold font-mono text-sm ${transaction.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                                            {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                                        </td>
                                        <td className="py-3 text-right">
                                            <button
                                                onClick={() => handleDelete(transaction.id)}
                                                className="text-red-400 hover:text-red-300 transition-base"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            {/* Create Transaction Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Nova Transação"
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleSubmit}>
                            Criar
                        </Button>
                    </>
                }
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="type"
                                value="expense"
                                checked={formData.type === 'expense'}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value, category: '' })}
                                className="w-4 h-4"
                            />
                            <span className="text-text-primary">Despesa</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="type"
                                value="income"
                                checked={formData.type === 'income'}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value, category: '' })}
                                className="w-4 h-4"
                            />
                            <span className="text-text-primary">Receita</span>
                        </label>
                    </div>

                    <Input
                        label="Valor (R$)"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        required
                    />

                    <Select
                        label="Categoria"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        options={[
                            { value: '', label: 'Selecione...' },
                            ...(formData.type === 'expense' ? expenseCategories : incomeCategories).map(cat => ({
                                value: cat,
                                label: cat
                            }))
                        ]}
                        required
                    />

                    <DatePicker
                        label="Data"
                        value={formData.transaction_date}
                        onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
                        required
                    />

                    <Input
                        label="Descrição"
                        type="text"
                        placeholder="Ex: Compra no supermercado"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                </form>
            </Modal>
        </div>
    )
}

export default memo(Finance)
