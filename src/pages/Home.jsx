import { useEffect, useState, useMemo, useCallback, memo } from 'react'
import Card from '@/components/ui/Card'
import Spinner from '@/components/ui/Spinner'
import Pomodoro from '@/components/Pomodoro'
import PerformanceChart from '@/components/PerformanceChart'
import { Link } from 'react-router-dom'
import { DollarSign, Target, Dumbbell, Activity, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { getTransactions } from '@/lib/api/transactions'
import { getHabits, getRecentCheckins } from '@/lib/api/habits'
import { getWorkoutLogs } from '@/lib/api/workouts'
import { getRuns } from '@/lib/api/runs'
import { withCache, createCacheKey } from '@/lib/cache'

const Home = () => {
    const [loading, setLoading] = useState(true)
    const [financeData, setFinanceData] = useState({ balance: 0, trend: [], income: 0, expenses: 0 })
    const [habitsData, setHabitsData] = useState({ total: 0, completed: 0, percentage: 0, trend: [] })
    const [workoutsData, setWorkoutsData] = useState({ thisWeek: 0, lastWeek: 0, weeklyData: [] })
    const [runningData, setRunningData] = useState({ totalDistance: 0, totalTime: 0, trend: [] })

    useEffect(() => {
        loadDashboardData()
    }, [])

    const loadDashboardData = useCallback(async () => {
        try {
            await Promise.all([
                loadFinanceData(),
                loadHabitsData(),
                loadWorkoutsData(),
                loadRunningData()
            ])
        } catch (error) {
            console.error('Error loading dashboard data:', error)
        } finally {
            setLoading(false)
        }
    }, [])

    const loadFinanceData = useCallback(async () => {
        try {
            const transactions = await withCache(
                createCacheKey('transactions'),
                () => getTransactions(),
                5 * 60 * 1000 // 5 minutes
            )

            // Calculate balance
            const income = transactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + parseFloat(t.amount), 0)
            const expenses = transactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + parseFloat(t.amount), 0)
            const balance = income - expenses

            // Get last 7 days trend
            const last7Days = Array.from({ length: 7 }, (_, i) => {
                const date = new Date()
                date.setDate(date.getDate() - (6 - i))
                return date.toISOString().split('T')[0]
            })

            const trend = last7Days.map(date => {
                const dayTransactions = transactions.filter(t => t.transaction_date === date)
                const dayIncome = dayTransactions
                    .filter(t => t.type === 'income')
                    .reduce((sum, t) => sum + parseFloat(t.amount), 0)
                const dayExpenses = dayTransactions
                    .filter(t => t.type === 'expense')
                    .reduce((sum, t) => sum + parseFloat(t.amount), 0)

                return {
                    date: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
                    income: dayIncome,
                    expenses: dayExpenses,
                    balance: dayIncome - dayExpenses
                }
            })

            setFinanceData({ balance, trend, income, expenses })
        } catch (error) {
            console.error('Error loading finance data:', error)
        }
    }, [])

    const loadHabitsData = useCallback(async () => {
        try {
            const [habits, checkins] = await Promise.all([
                withCache(createCacheKey('habits'), () => getHabits(), 5 * 60 * 1000),
                withCache(createCacheKey('habits-checkins-7d'), () => getRecentCheckins(7), 5 * 60 * 1000)
            ])
            const total = habits.length

            // Calculate completed for today (simple approximation based on checkins)
            // ideally we filtered checkins by today's date
            const today = new Date().toISOString().split('T')[0]
            const todayCheckins = checkins.filter(c => c.completed_date === today).length
            const completed = todayCheckins
            const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

            // Calculate trend for last 7 days
            const last7Days = Array.from({ length: 7 }, (_, i) => {
                const date = new Date()
                date.setDate(date.getDate() - (6 - i))
                return date.toISOString().split('T')[0]
            })

            const trend = last7Days.map(date => {
                const dayCheckins = checkins.filter(c => c.completed_date === date).length
                const dayPercentage = total > 0 ? Math.round((dayCheckins / total) * 100) : 0
                return {
                    date: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
                    value: dayPercentage
                }
            })

            setHabitsData({ total, completed, percentage, trend })
        } catch (error) {
            console.error('Error loading habits data:', error)
        }
    }, [])

    const loadWorkoutsData = useCallback(async () => {
        try {
            const logs = await withCache(
                createCacheKey('workout-logs'),
                () => getWorkoutLogs(),
                5 * 60 * 1000
            )

            // Get this week and last week counts
            const now = new Date()
            const weekStart = new Date(now.setDate(now.getDate() - now.getDay()))
            const lastWeekStart = new Date(weekStart)
            lastWeekStart.setDate(lastWeekStart.getDate() - 7)

            const thisWeek = logs.filter(log => new Date(log.completed_at) >= weekStart).length
            const lastWeek = logs.filter(log => {
                const date = new Date(log.completed_at)
                return date >= lastWeekStart && date < weekStart
            }).length

            // Weekly data for chart
            const weeklyData = Array.from({ length: 7 }, (_, i) => {
                const date = new Date()
                date.setDate(date.getDate() - (6 - i))
                const dayLogs = logs.filter(log => {
                    const logDate = new Date(log.completed_at).toDateString()
                    return logDate === date.toDateString()
                })
                return {
                    day: date.toLocaleDateString('pt-BR', { weekday: 'short' }),
                    workouts: dayLogs.length
                }
            })

            setWorkoutsData({ thisWeek, lastWeek, weeklyData })
        } catch (error) {
            console.error('Error loading workouts data:', error)
        }
    }, [])

    const loadRunningData = useCallback(async () => {
        try {
            const runs = await withCache(
                createCacheKey('runs'),
                () => getRuns(),
                5 * 60 * 1000
            )

            const totalDistance = runs.reduce((sum, run) => sum + (run.distance_km || 0), 0)
            const totalTime = runs.reduce((sum, run) => sum + (run.duration_minutes || 0), 0)

            // Last 7 runs trend
            const recentRuns = runs.slice(0, 7).reverse()
            const trend = recentRuns.map((run, index) => ({
                run: `#${index + 1}`,
                distance: run.distance_km || 0,
                pace: run.pace_min_per_km || 0
            }))

            setRunningData({ totalDistance, totalTime, trend })
        } catch (error) {
            console.error('Error loading running data:', error)
        }
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Spinner size="lg" />
            </div>
        )
    }

    return (
        <div className="space-y-6 sm:space-y-8 animate-fade-in">
            {/* Page Title */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-text-primary font-mono">Dashboard</h1>
                <p className="text-text-secondary mt-1 text-sm sm:text-base">Visão geral dos seus módulos</p>
            </div>

            {/* Pomodoro and Performance Chart Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <Pomodoro />
                <PerformanceChart />
            </div>

            {/* Module Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Finance Card */}
                <Link to="/finance">
                    <Card className="group cursor-pointer hover:border-white/20 transition-all">
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                                    <DollarSign className="text-white" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-text-primary">Finanças</h3>
                                    <p className="text-sm text-text-muted">Saldo atual</p>
                                </div>
                            </div>
                            <ArrowRight className="text-text-muted group-hover:text-text-primary transition-colors" size={20} />
                        </div>

                        <div className="mb-4">
                            <p className="text-3xl font-bold text-text-primary">
                                R$ {financeData.balance.toFixed(2)}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-sm">
                                <span className="text-white flex items-center gap-1">
                                    <TrendingUp size={16} />
                                    R$ {financeData.income.toFixed(2)}
                                </span>
                                <span className="text-gray-400 flex items-center gap-1">
                                    <TrendingDown size={16} />
                                    R$ {financeData.expenses.toFixed(2)}
                                </span>
                            </div>
                        </div>

                        {financeData.trend.length > 0 && (
                            <ResponsiveContainer width="100%" height={120}>
                                <LineChart data={financeData.trend}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                                    <XAxis dataKey="date" stroke="#666" style={{ fontSize: '12px' }} />
                                    <YAxis stroke="#666" style={{ fontSize: '12px' }} />
                                    <Tooltip
                                        contentStyle={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '8px' }}
                                        labelStyle={{ color: '#fff' }}
                                    />
                                    <Line type="monotone" dataKey="income" stroke="#FFFFFF" strokeWidth={2} dot={false} />
                                    <Line type="monotone" dataKey="expenses" stroke="#666666" strokeWidth={2} dot={false} strokeDasharray="3 3" />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </Card>
                </Link>

                {/* Workouts Card */}
                <Link to="/workouts">
                    <Card className="group cursor-pointer hover:border-white/20 transition-all">
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                                    <Dumbbell className="text-white" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-text-primary">Treinos</h3>
                                    <p className="text-sm text-text-muted">Esta semana</p>
                                </div>
                            </div>
                            <ArrowRight className="text-text-muted group-hover:text-text-primary transition-colors" size={20} />
                        </div>

                        <div className="mb-4">
                            <p className="text-3xl font-bold text-text-primary">
                                {workoutsData.thisWeek} treinos
                            </p>
                            <p className="text-sm text-text-secondary mt-1">
                                {workoutsData.thisWeek > workoutsData.lastWeek ? '+' : ''}
                                {workoutsData.thisWeek - workoutsData.lastWeek} vs semana passada
                            </p>
                        </div>

                        {workoutsData.weeklyData.length > 0 && (
                            <ResponsiveContainer width="100%" height={120}>
                                <BarChart data={workoutsData.weeklyData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                                    <XAxis dataKey="day" stroke="#666" style={{ fontSize: '12px' }} />
                                    <YAxis stroke="#666" style={{ fontSize: '12px' }} />
                                    <Tooltip
                                        contentStyle={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '8px' }}
                                        labelStyle={{ color: '#fff' }}
                                    />
                                    <Bar dataKey="workouts" fill="#FFFFFF" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </Card>
                </Link>

                {/* Habits Card */}
                <Link to="/habits">
                    <Card className="group cursor-pointer hover:border-white/20 transition-all">
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                                    <Target className="text-white" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-text-primary">Hábitos</h3>
                                    <p className="text-sm text-text-muted">Progresso hoje</p>
                                </div>
                            </div>
                            <ArrowRight className="text-text-muted group-hover:text-text-primary transition-colors" size={20} />
                        </div>

                        <div className="mb-4">
                            <p className="text-3xl font-bold text-text-primary">
                                {habitsData.percentage}%
                            </p>
                            <p className="text-sm text-text-secondary mt-1">
                                {habitsData.completed} de {habitsData.total} hábitos completados
                            </p>
                        </div>

                        {habitsData.trend.length > 0 && (
                            <ResponsiveContainer width="100%" height={120}>
                                <LineChart data={habitsData.trend}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                                    <XAxis dataKey="date" stroke="#666" style={{ fontSize: '12px' }} />
                                    <YAxis stroke="#666" style={{ fontSize: '12px' }} domain={[0, 100]} />
                                    <Tooltip
                                        contentStyle={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '8px' }}
                                        labelStyle={{ color: '#fff' }}
                                        formatter={(value) => [`${value}%`, 'Conclusão']}
                                    />
                                    <Line type="monotone" dataKey="value" stroke="#FFFFFF" strokeWidth={2} dot={{ fill: '#FFFFFF', r: 3 }} activeDot={{ r: 5 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </Card>
                </Link>

                {/* Running Card */}
                <Link to="/running">
                    <Card className="group cursor-pointer hover:border-white/20 transition-all">
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                                    <Activity className="text-white" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-text-primary">Corrida</h3>
                                    <p className="text-sm text-text-muted">Total acumulado</p>
                                </div>
                            </div>
                            <ArrowRight className="text-text-muted group-hover:text-text-primary transition-colors" size={20} />
                        </div>

                        <div className="mb-4">
                            <p className="text-3xl font-bold text-text-primary">
                                {runningData.totalDistance.toFixed(1)} km
                            </p>
                            <p className="text-sm text-text-secondary mt-1">
                                {Math.floor(runningData.totalTime / 60)}h {runningData.totalTime % 60}min total
                            </p>
                        </div>

                        {runningData.trend.length > 0 && (
                            <ResponsiveContainer width="100%" height={120}>
                                <LineChart data={runningData.trend}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                                    <XAxis dataKey="run" stroke="#666" style={{ fontSize: '12px' }} />
                                    <YAxis stroke="#666" style={{ fontSize: '12px' }} />
                                    <Tooltip
                                        contentStyle={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '8px' }}
                                        labelStyle={{ color: '#fff' }}
                                    />
                                    <Line type="monotone" dataKey="distance" stroke="#FFFFFF" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </Card>
                </Link>
            </div>
        </div>
    )
}

export default memo(Home)
