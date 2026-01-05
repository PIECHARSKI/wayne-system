import { useState, useEffect } from 'react'
import { getRuns, createRun, updateRun, deleteRun, getRunningStats, getRunsByMonth } from '@/lib/api/runs'

export const useRuns = () => {
    const [runs, setRuns] = useState([])
    const [stats, setStats] = useState({ totalRuns: 0, totalDistance: 0, totalDuration: 0, averagePace: 0 })
    const [monthlyData, setMonthlyData] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadRuns()
        loadStats()
        loadMonthlyData()
    }, [])

    const loadRuns = async () => {
        try {
            const data = await getRuns()
            setRuns(data)
        } catch (error) {
            console.error('Error loading runs:', error)
        } finally {
            setLoading(false)
        }
    }

    const loadStats = async () => {
        try {
            const data = await getRunningStats()
            setStats(data)
        } catch (error) {
            console.error('Error loading stats:', error)
        }
    }

    const loadMonthlyData = async () => {
        try {
            const data = await getRunsByMonth()
            setMonthlyData(data)
        } catch (error) {
            console.error('Error loading monthly data:', error)
        }
    }

    const addRun = async (runData) => {
        const newRun = await createRun(runData)
        setRuns([newRun, ...runs])
        loadStats()
        loadMonthlyData()
        return newRun
    }

    const editRun = async (id, updates) => {
        const updated = await updateRun(id, updates)
        setRuns(runs.map(r => r.id === id ? updated : r))
        loadStats()
        loadMonthlyData()
        return updated
    }

    const removeRun = async (id) => {
        await deleteRun(id)
        setRuns(runs.filter(r => r.id !== id))
        loadStats()
        loadMonthlyData()
    }

    const formatPace = (pace) => {
        const minutes = Math.floor(pace)
        const seconds = Math.round((pace - minutes) * 60)
        return `${minutes}:${seconds.toString().padStart(2, '0')}`
    }

    const formatDuration = (minutes) => {
        const hours = Math.floor(minutes / 60)
        const mins = minutes % 60
        return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`
    }

    return {
        runs,
        stats,
        monthlyData,
        loading,
        addRun,
        editRun,
        removeRun,
        formatPace,
        formatDuration,
        refreshRuns: loadRuns,
        refreshStats: loadStats
    }
}
