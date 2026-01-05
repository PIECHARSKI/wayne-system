import { useState, useEffect } from 'react'
import { getAppointments, createAppointment, updateAppointment, deleteAppointment } from '@/lib/api/appointments'

export const useAppointments = () => {
    const [appointments, setAppointments] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadAppointments()
    }, [])

    const loadAppointments = async () => {
        try {
            const data = await getAppointments()
            // Convert to calendar event format
            const events = data.map(apt => ({
                ...apt,
                start: new Date(apt.start_time),
                end: apt.end_time ? new Date(apt.end_time) : new Date(apt.start_time),
                title: apt.title
            }))
            setAppointments(events)
        } catch (error) {
            console.error('Error loading appointments:', error)
        } finally {
            setLoading(false)
        }
    }

    const addAppointment = async (appointmentData) => {
        const newApt = await createAppointment(appointmentData)
        await loadAppointments()
        return newApt
    }

    const editAppointment = async (id, updates) => {
        const updated = await updateAppointment(id, updates)
        await loadAppointments()
        return updated
    }

    const removeAppointment = async (id) => {
        await deleteAppointment(id)
        await loadAppointments()
    }

    return {
        appointments,
        loading,
        addAppointment,
        editAppointment,
        removeAppointment,
        refreshAppointments: loadAppointments
    }
}
