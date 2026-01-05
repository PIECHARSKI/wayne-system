import { format, formatDistanceToNow, isToday, isTomorrow, differenceInDays, startOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'

/**
 * Format currency value
 */
export const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value)
}

/**
 * Format date
 */
export const formatDate = (date, formatStr = 'dd/MM/yyyy') => {
    return format(new Date(date), formatStr, { locale: ptBR })
}

/**
 * Format date relative to now
 */
export const formatRelative = (date) => {
    const dateObj = new Date(date)

    if (isToday(dateObj)) {
        return 'Hoje'
    }

    if (isTomorrow(dateObj)) {
        return 'Amanhã'
    }

    return formatDistanceToNow(dateObj, { addSuffix: true, locale: ptBR })
}

/**
 * Calculate streak from checkins
 */
export const calculateStreak = (checkins) => {
    if (!checkins || checkins.length === 0) return 0

    // Sort by date descending
    const sorted = [...checkins].sort((a, b) =>
        new Date(b.completed_date) - new Date(a.completed_date)
    )

    const today = startOfDay(new Date())
    const lastCheckin = startOfDay(new Date(sorted[0].completed_date))

    // Check if last checkin was today or yesterday
    const daysSinceLastCheckin = differenceInDays(today, lastCheckin)
    if (daysSinceLastCheckin > 1) return 0

    let streak = 0
    let currentDate = today

    for (const checkin of sorted) {
        const checkinDate = startOfDay(new Date(checkin.completed_date))
        const diff = differenceInDays(currentDate, checkinDate)

        if (diff === 0 || diff === 1) {
            streak++
            currentDate = checkinDate
        } else {
            break
        }
    }

    return streak
}

/**
 * Calculate weekly completion percentage
 */
export const calculateWeeklyCompletion = (checkins) => {
    if (!checkins || checkins.length === 0) return 0

    const today = new Date()
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

    const recentCheckins = checkins.filter(c =>
        new Date(c.completed_date) >= weekAgo
    )

    return Math.round((recentCheckins.length / 7) * 100)
}

/**
 * Group transactions by category
 */
export const groupByCategory = (transactions) => {
    return transactions.reduce((acc, transaction) => {
        const category = transaction.category || 'Outros'
        if (!acc[category]) {
            acc[category] = 0
        }
        acc[category] += transaction.amount
        return acc
    }, {})
}

/**
 * Calculate monthly balance evolution
 */
export const calculateMonthlyEvolution = (transactions) => {
    const monthlyData = {}

    transactions.forEach(transaction => {
        const month = format(new Date(transaction.transaction_date), 'MMM/yy', { locale: ptBR })

        if (!monthlyData[month]) {
            monthlyData[month] = { income: 0, expenses: 0 }
        }

        if (transaction.type === 'income') {
            monthlyData[month].income += transaction.amount
        } else {
            monthlyData[month].expenses += transaction.amount
        }
    })

    return Object.entries(monthlyData).map(([month, data]) => ({
        month,
        saldo: data.income - data.expenses,
        receitas: data.income,
        despesas: data.expenses
    }))
}

/**
 * Get initials from name
 */
export const getInitials = (name) => {
    if (!name) return '?'
    return name
        .split(' ')
        .map(part => part[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
}

/**
 * Debounce function
 */
export const debounce = (func, wait) => {
    let timeout
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout)
            func(...args)
        }
        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
    }
}

/**
 * Class name helper
 */
export const cn = (...classes) => {
    return classes.filter(Boolean).join(' ')
}
