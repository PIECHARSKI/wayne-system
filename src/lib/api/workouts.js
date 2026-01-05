import { supabase } from '../supabase'

/**
 * Get all workouts for the current user
 */
export const getWorkouts = async () => {
    const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) throw error
    return data
}

/**
 * Get a single workout by ID
 */
export const getWorkout = async (id) => {
    const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('id', id)
        .single()

    if (error) throw error
    return data
}

/**
 * Create a new workout
 */
export const createWorkout = async (workout) => {
    const { data: { user } } = await supabase.auth.getUser()

    const { data, error } = await supabase
        .from('workouts')
        .insert([{ ...workout, user_id: user.id }])
        .select()
        .single()

    if (error) throw error
    return data
}

/**
 * Update an existing workout
 */
export const updateWorkout = async (id, updates) => {
    const { data, error } = await supabase
        .from('workouts')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

    if (error) throw error
    return data
}

/**
 * Delete a workout
 */
export const deleteWorkout = async (id) => {
    const { error } = await supabase
        .from('workouts')
        .delete()
        .eq('id', id)

    if (error) throw error
}

/**
 * Get all workout logs
 */
export const getWorkoutLogs = async () => {
    const { data, error } = await supabase
        .from('workout_logs')
        .select('*')
        .order('completed_at', { ascending: false })

    if (error) throw error
    return data
}

/**
 * Create a workout log
 */
export const createWorkoutLog = async (log) => {
    const { data: { user } } = await supabase.auth.getUser()

    const { data, error } = await supabase
        .from('workout_logs')
        .insert([{ ...log, user_id: user.id }])
        .select()
        .single()

    if (error) throw error
    return data
}

/**
 * Delete a workout log
 */
export const deleteWorkoutLog = async (id) => {
    const { error } = await supabase
        .from('workout_logs')
        .delete()
        .eq('id', id)

    if (error) throw error
}
