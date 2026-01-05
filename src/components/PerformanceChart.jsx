import { useState, useEffect, useMemo, useCallback, memo } from 'react'
import Card from '@/components/ui/Card'
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts'
import { TrendingUp, Activity } from 'lucide-react'
import { getHabits } from '@/lib/api/habits'
import { getWorkoutLogs } from '@/lib/api/workouts'
import { getRuns } from '@/lib/api/runs'
import { getTransactions } from '@/lib/api/transactions'
import { withCache, createCacheKey } from '@/lib/cache'

const PerformanceChart = () => {
    const [performanceData, setPerformanceData] = useState([])
    const [loading, setLoading] = useState(true)
    const [overallScore, setOverallScore] = useState(0)

    useEffect(() => {
        loadPerformanceData()
    }, [])

    const loadPerformanceData = useCallback(async () => {
        try {
            // Load all module data with caching
            const [habits, workouts, runs, transactions] = await Promise.all([
                withCache(createCacheKey('habits'), () => getHabits(), 5 * 60 * 1000),
                withCache(createCacheKey('workout-logs'), () => getWorkoutLogs(), 5 * 60 * 1000),
                withCache(createCacheKey('runs'), () => getRuns(), 5 * 60 * 1000),
                withCache(createCacheKey('transactions'), () => getTransactions(), 5 * 60 * 1000)
            ])

            // Calculate scores for each category (0-100)
            const scores = {
                habits: calculateHabitsScore(habits),
                workouts: calculateWorkoutsScore(workouts),
                running: calculateRunningScore(runs),
                finance: calculateFinanceScore(transactions),
                consistency: calculateConsistencyScore(workouts, runs),
                focus: calculateFocusScore() // Based on Pomodoro usage
            }

            // Format data for radar chart
            const chartData = [
                { category: 'Hábitos', value: scores.habits, fullMark: 100 },
                { category: 'Treinos', value: scores.workouts, fullMark: 100 },
                { category: 'Corrida', value: scores.running, fullMark: 100 },
                { category: 'Finanças', value: scores.finance, fullMark: 100 },
                { category: 'Consistência', value: scores.consistency, fullMark: 100 },
                { category: 'Foco', value: scores.focus, fullMark: 100 }
            ]

            setPerformanceData(chartData)

            // Calculate overall score
            const overall = Math.round(
                Object.values(scores).reduce((sum, score) => sum + score, 0) / Object.keys(scores).length
            )
            setOverallScore(overall)
        } catch (error) {
            console.error('Error loading performance data:', error)
        } finally {
            setLoading(false)
        }
    }, [])

    const calculateHabitsScore = (habits) => {
        if (habits.length === 0) return 0
        // Simple calculation: 100 if user has habits, scaled by count
        return Math.min(100, habits.length * 20)
    }

    const calculateWorkoutsScore = (workouts) => {
        // Get workouts from last 7 days
        const now = new Date()
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        const recentWorkouts = workouts.filter(w => new Date(w.completed_at) >= sevenDaysAgo)

        // Score based on frequency (3+ workouts per week = 100)
        return Math.min(100, (recentWorkouts.length / 3) * 100)
    }

    const calculateRunningScore = (runs) => {
        // Get runs from last 7 days
        const now = new Date()
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        const recentRuns = runs.filter(r => new Date(r.run_date) >= sevenDaysAgo)

        // Score based on total distance (10km per week = 100)
        const totalDistance = recentRuns.reduce((sum, run) => sum + (run.distance_km || 0), 0)
        return Math.min(100, (totalDistance / 10) * 100)
    }

    const calculateFinanceScore = (transactions) => {
        // Calculate income vs expenses ratio
        const income = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + parseFloat(t.amount), 0)
        const expenses = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + parseFloat(t.amount), 0)

        if (income === 0) return 0

        // Score based on positive balance and savings rate
        const balance = income - expenses
        const savingsRate = balance / income

        if (balance < 0) return 30 // Negative balance
        if (savingsRate >= 0.3) return 100 // Saving 30%+ is excellent
        return 50 + (savingsRate * 100) // Scale between 50-100
    }

    const calculateConsistencyScore = (workouts, runs) => {
        // Check activity over last 7 days
        const now = new Date()
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = new Date(now)
            date.setDate(date.getDate() - i)
            return date.toDateString()
        })

        const activeDays = last7Days.filter(day => {
            const hasWorkout = workouts.some(w => new Date(w.completed_at).toDateString() === day)
            const hasRun = runs.some(r => new Date(r.run_date).toDateString() === day)
            return hasWorkout || hasRun
        })

        // Score based on active days (5+ days = 100)
        return Math.min(100, (activeDays.length / 5) * 100)
    }

    const calculateFocusScore = () => {
        // Placeholder - could integrate with Pomodoro component
        // For now, return a moderate score
        return 70
    }

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-white'
        if (score >= 60) return 'text-gray-300'
        if (score >= 40) return 'text-gray-400'
        return 'text-gray-500'
    }

    const getScoreLabel = (score) => {
        if (score >= 80) return 'Excelente'
        if (score >= 60) return 'Bom'
        if (score >= 40) return 'Regular'
        return 'Precisa Melhorar'
    }

    return (
        <Card className="h-full relative overflow-hidden">
            {/* Subtle background gradient - monochrome */}
            <div className="absolute inset-0 opacity-5 bg-gradient-to-br from-white to-gray-500" />

            <div className="relative space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                            <Activity className="text-white" size={20} />
                        </div>
                        <div>
                            <h3 className="text-base sm:text-lg font-semibold text-text-primary font-mono">Desempenho</h3>
                            <p className="text-xs sm:text-sm text-text-muted">Análise hexagonal</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className={`text-2xl sm:text-3xl font-bold font-mono ${getScoreColor(overallScore)}`}>
                            {overallScore}%
                        </p>
                        <p className="text-xs text-text-muted mt-1 font-mono">
                            {getScoreLabel(overallScore)}
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    </div>
                ) : (
                    <>
                        {/* Hexagonal Chart */}
                        <ResponsiveContainer width="100%" height={220}>
                            <RadarChart data={performanceData}>
                                <PolarGrid stroke="#2a2a2a" />
                                <PolarAngleAxis
                                    dataKey="category"
                                    stroke="#666"
                                    tick={{ fill: '#888', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                                />
                                <PolarRadiusAxis
                                    angle={90}
                                    domain={[0, 100]}
                                    stroke="#444"
                                    tick={{ fill: '#444', fontSize: 10 }}
                                />
                                <Radar
                                    name="Desempenho"
                                    dataKey="value"
                                    stroke="#FFFFFF"
                                    fill="#FFFFFF"
                                    fillOpacity={0.3}
                                    strokeWidth={2}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: '#0A0A0A',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '8px',
                                        color: '#fff',
                                        fontFamily: 'JetBrains Mono'
                                    }}
                                    formatter={(value) => [`${Math.round(value)}%`, 'Score']}
                                />
                            </RadarChart>
                        </ResponsiveContainer>

                        {/* Category breakdown */}
                        <div className="grid grid-cols-2 gap-3">
                            {performanceData.map((item, index) => (
                                <div
                                    key={index}
                                    className="bg-zinc-900/50 rounded-lg p-3 border border-white/5 hover:border-white/10 transition-all duration-300"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs text-text-muted font-mono uppercase tracking-wider">{item.category}</span>
                                        <span className={`text-sm font-bold font-mono ${getScoreColor(item.value)}`}>
                                            {Math.round(item.value)}%
                                        </span>
                                    </div>
                                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-white transition-all duration-500"
                                            style={{
                                                width: `${item.value}%`,
                                                opacity: 0.8
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </Card>
    )
}

export default memo(PerformanceChart)
