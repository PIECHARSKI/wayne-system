import { supabase } from '../supabase'

// Get all runs for the current user
export const getRuns = async () => {
    const { data, error } = await supabase
        .from('runs')
        .select('*')
        .order('run_date', { ascending: false })

    if (error) throw error
    return data
}

// Create a new run
export const createRun = async (runData) => {
    // Calculate pace (min/km)
    const pace = runData.duration / runData.distance

    const { data, error } = await supabase
        .from('runs')
        .insert([{ ...runData, pace }])
        .select()
        .single()

    if (error) throw error
    return data
}

// Update a run
export const updateRun = async (id, updates) => {
    // Recalculate pace if distance or duration changed
    if (updates.distance || updates.duration) {
        const { data: currentRun } = await supabase
            .from('runs')
            .select('distance, duration')
            .eq('id', id)
            .single()

        const distance = updates.distance || currentRun.distance
        const duration = updates.duration || currentRun.duration
        updates.pace = duration / distance
    }

    const { data, error } = await supabase
        .from('runs')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

    if (error) throw error
    return data
}

// Delete a run
export const deleteRun = async (id) => {
    const { error } = await supabase
        .from('runs')
        .delete()
        .eq('id', id)

    if (error) throw error
}

// Get running statistics
export const getRunningStats = async () => {
    const { data, error } = await supabase
        .from('runs')
        .select('distance, duration, pace')

    if (error) throw error

    const totalDistance = data.reduce((sum, run) => sum + Number(run.distance), 0)
    const totalDuration = data.reduce((sum, run) => sum + Number(run.duration), 0)
    const averagePace = data.length > 0
        ? data.reduce((sum, run) => sum + Number(run.pace), 0) / data.length
        : 0

    return {
        totalRuns: data.length,
        totalDistance: totalDistance.toFixed(2),
        totalDuration,
        averagePace: averagePace.toFixed(2)
    }
}

// Get runs by month for charts
export const getRunsByMonth = async () => {
    const { data, error } = await supabase
        .from('runs')
        .select('distance, duration, run_date')
        .order('run_date', { ascending: true })

    if (error) throw error

    // Group by month
    const monthlyData = data.reduce((acc, run) => {
        const month = new Date(run.run_date).toISOString().slice(0, 7) // YYYY-MM
        if (!acc[month]) {
            acc[month] = { month, distance: 0, runs: 0, duration: 0 }
        }
        acc[month].distance += Number(run.distance)
        acc[month].duration += Number(run.duration)
        acc[month].runs += 1
        return acc
    }, {})

    return Object.values(monthlyData)
}
