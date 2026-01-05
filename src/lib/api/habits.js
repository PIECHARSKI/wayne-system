import { supabase } from '../supabase'

/**
 * Get all habits for the current user
 */
export const getHabits = async () => {
    const { data, error } = await supabase
        .from('habits')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) throw error
    return data
}

/**
 * Get a single habit by ID
 */
export const getHabit = async (id) => {
    const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('id', id)
        .single()

    if (error) throw error
    return data
}

/**
 * Create a new habit
 */
export const createHabit = async (habit) => {
    const { data: { user } } = await supabase.auth.getUser()

    const { data, error } = await supabase
        .from('habits')
        .insert([{ ...habit, user_id: user.id }])
        .select()
        .single()

    if (error) throw error
    return data
}

/**
 * Update an existing habit
 */
export const updateHabit = async (id, updates) => {
    const { data, error } = await supabase
        .from('habits')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

    if (error) throw error
    return data
}

/**
 * Delete a habit
 */
export const deleteHabit = async (id) => {
    const { error } = await supabase
        .from('habits')
        .delete()
        .eq('id', id)

    if (error) throw error
}

/**
 * Get all check-ins for a habit
 */
export const getHabitCheckins = async (habitId) => {
    const { data, error } = await supabase
        .from('habit_checkins')
        .select('*')
        .eq('habit_id', habitId)
        .order('completed_date', { ascending: false })

    if (error) throw error
    return data
}

/**
 * Create a check-in for a habit
 */
export const createCheckin = async (habitId, date) => {
    const { data: { user } } = await supabase.auth.getUser()

    const { data, error } = await supabase
        .from('habit_checkins')
        .insert([{
            habit_id: habitId,
            user_id: user.id,
            completed_date: date
        }])
        .select()
        .single()

    if (error) throw error
    return data
}

/**
 * Delete a check-in
 */
export const deleteCheckin = async (habitId, date) => {
    const { error } = await supabase
        .from('habit_checkins')
        .delete()
        .eq('habit_id', habitId)
        .eq('completed_date', date)

    if (error) throw error
}

/**
 * Get all check-ins for today
 */
export const getTodayCheckins = async () => {
    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
        .from('habit_checkins')
        .select('*')
        .eq('completed_date', today)

    if (error) throw error
    return data
}

/**
 * Get all check-ins for the last X days
 */
export const getRecentCheckins = async (days = 7) => {
    const today = new Date()
    const startDate = new Date(today)
    startDate.setDate(today.getDate() - days)

    const { data: { user } } = await supabase.auth.getUser()

    const { data, error } = await supabase
        .from('habit_checkins')
        .select('*')
        .eq('user_id', user.id)
        .gte('completed_date', startDate.toISOString().split('T')[0])
        .order('completed_date', { ascending: true })

    if (error) throw error
    return data
}
