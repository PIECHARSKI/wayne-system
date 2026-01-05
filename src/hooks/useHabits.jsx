import { useState, useEffect } from 'react'
import {
    getHabits,
    createHabit,
    updateHabit,
    deleteHabit,
    getHabitCheckins,
    createCheckin,
    deleteCheckin,
    getTodayCheckins
} from '@/lib/api/habits'

export const useHabits = () => {
    const [habits, setHabits] = useState([])
    const [loading, setLoading] = useState(true)
    const [todayCheckins, setTodayCheckins] = useState([])

    useEffect(() => {
        loadHabits()
        loadTodayCheckins()
    }, [])

    const loadHabits = async () => {
        try {
            const data = await getHabits()
            setHabits(data)
        } catch (error) {
            console.error('Error loading habits:', error)
        } finally {
            setLoading(false)
        }
    }

    const loadTodayCheckins = async () => {
        try {
            const data = await getTodayCheckins()
            setTodayCheckins(data)
        } catch (error) {
            console.error('Error loading checkins:', error)
        }
    }

    const addHabit = async (habitData) => {
        const newHabit = await createHabit(habitData)
        setHabits([newHabit, ...habits])
        return newHabit
    }

    const editHabit = async (id, updates) => {
        const updated = await updateHabit(id, updates)
        setHabits(habits.map(h => h.id === id ? updated : h))
        return updated
    }

    const removeHabit = async (id) => {
        await deleteHabit(id)
        setHabits(habits.filter(h => h.id !== id))
    }

    const toggleCheckin = async (habitId) => {
        const today = new Date().toISOString().split('T')[0]
        const existingCheckin = todayCheckins.find(c => c.habit_id === habitId)

        if (existingCheckin) {
            // Remove check-in
            await deleteCheckin(habitId, today)
            setTodayCheckins(todayCheckins.filter(c => c.habit_id !== habitId))
        } else {
            // Add check-in
            const newCheckin = await createCheckin(habitId, today)
            setTodayCheckins([...todayCheckins, newCheckin])
        }
    }

    const isCheckedToday = (habitId) => {
        return todayCheckins.some(c => c.habit_id === habitId)
    }

    return {
        habits,
        loading,
        todayCheckins,
        addHabit,
        editHabit,
        removeHabit,
        toggleCheckin,
        isCheckedToday,
        refreshHabits: loadHabits,
        refreshCheckins: loadTodayCheckins
    }
}
