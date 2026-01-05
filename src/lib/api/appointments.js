import { supabase } from '../supabase'

/**
 * Get all appointments for the current user
 */
export const getAppointments = async () => {
    const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('start_time', { ascending: true })

    if (error) throw error
    return data
}

/**
 * Get appointments for a specific date range
 */
export const getAppointmentsByRange = async (startDate, endDate) => {
    const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .gte('start_time', startDate)
        .lte('start_time', endDate)
        .order('start_time', { ascending: true })

    if (error) throw error
    return data
}

/**
 * Get a single appointment by ID
 */
export const getAppointment = async (id) => {
    const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('id', id)
        .single()

    if (error) throw error
    return data
}

/**
 * Create a new appointment
 */
export const createAppointment = async (appointment) => {
    const { data: { user } } = await supabase.auth.getUser()

    const { data, error } = await supabase
        .from('appointments')
        .insert([{ ...appointment, user_id: user.id }])
        .select()
        .single()

    if (error) throw error
    return data
}

/**
 * Update an existing appointment
 */
export const updateAppointment = async (id, updates) => {
    const { data, error } = await supabase
        .from('appointments')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

    if (error) throw error
    return data
}

/**
 * Delete an appointment
 */
export const deleteAppointment = async (id) => {
    const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id)

    if (error) throw error
}

/**
 * Get upcoming appointments
 */
export const getUpcomingAppointments = async (limit = 5) => {
    const now = new Date().toISOString()

    const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .gte('start_time', now)
        .order('start_time', { ascending: true })
        .limit(limit)

    if (error) throw error
    return data
}
