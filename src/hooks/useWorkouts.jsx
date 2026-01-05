import { useState, useEffect } from 'react'
import {
    getWorkouts,
    createWorkout,
    updateWorkout,
    deleteWorkout,
    getWorkoutLogs,
    createWorkoutLog
} from '@/lib/api/workouts'

export const useWorkouts = () => {
    const [workouts, setWorkouts] = useState([])
    const [workoutLogs, setWorkoutLogs] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadWorkouts()
        loadWorkoutLogs()
    }, [])

    const loadWorkouts = async () => {
        try {
            const data = await getWorkouts()
            setWorkouts(data)
        } catch (error) {
            console.error('Error loading workouts:', error)
        } finally {
            setLoading(false)
        }
    }

    const loadWorkoutLogs = async () => {
        try {
            const data = await getWorkoutLogs()
            setWorkoutLogs(data)
        } catch (error) {
            console.error('Error loading workout logs:', error)
        }
    }

    const addWorkout = async (workoutData) => {
        const newWorkout = await createWorkout(workoutData)
        setWorkouts([newWorkout, ...workouts])
        return newWorkout
    }

    const editWorkout = async (id, updates) => {
        const updated = await updateWorkout(id, updates)
        setWorkouts(workouts.map(w => w.id === id ? updated : w))
        return updated
    }

    const removeWorkout = async (id) => {
        await deleteWorkout(id)
        setWorkouts(workouts.filter(w => w.id !== id))
    }

    const logWorkout = async (logData) => {
        const newLog = await createWorkoutLog(logData)
        setWorkoutLogs([newLog, ...workoutLogs])
        return newLog
    }

    return {
        workouts,
        workoutLogs,
        loading,
        addWorkout,
        editWorkout,
        removeWorkout,
        logWorkout,
        refreshWorkouts: loadWorkouts,
        refreshLogs: loadWorkoutLogs
    }
}
