import { useState } from 'react'
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { useAppointments } from '@/hooks/useAppointments'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Spinner from '@/components/ui/Spinner'
import toast from 'react-hot-toast'
import { Trash2 } from 'lucide-react'

const locales = {
    'pt-BR': ptBR,
}

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
})

const CalendarPage = () => {
    const { appointments, loading, addAppointment, editAppointment, removeAppointment } = useAppointments()

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedSlot, setSelectedSlot] = useState(null)
    const [selectedEvent, setSelectedEvent] = useState(null)
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        location: '',
        category: ''
    })

    const handleSelectSlot = ({ start, end }) => {
        // When clicking on a day/time slot
        setSelectedSlot({ start, end })
        setSelectedEvent(null)
        setFormData({
            title: '',
            description: '',
            start_time: start.toISOString().slice(0, 16),
            end_time: end.toISOString().slice(0, 16),
            location: '',
            category: ''
        })
        setIsModalOpen(true)
    }

    const handleSelectEvent = (event) => {
        // When clicking on an existing event
        setSelectedEvent(event)
        setSelectedSlot(null)
        setFormData({
            title: event.title,
            description: event.description || '',
            start_time: new Date(event.start_time).toISOString().slice(0, 16),
            end_time: event.end_time ? new Date(event.end_time).toISOString().slice(0, 16) : '',
            location: event.location || '',
            category: event.category || ''
        })
        setIsModalOpen(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            const appointmentData = {
                title: formData.title,
                description: formData.description,
                start_time: new Date(formData.start_time).toISOString(),
                end_time: formData.end_time ? new Date(formData.end_time).toISOString() : null,
                location: formData.location,
                category: formData.category
            }

            if (selectedEvent) {
                await editAppointment(selectedEvent.id, appointmentData)
                toast.success('Compromisso atualizado!')
            } else {
                await addAppointment(appointmentData)
                toast.success('Compromisso criado!')
            }

            setIsModalOpen(false)
            resetForm()
        } catch (error) {
            toast.error('Erro ao salvar compromisso')
            console.error(error)
        }
    }

    const handleDelete = async () => {
        if (!selectedEvent || !confirm('Deseja realmente excluir este compromisso?')) return

        try {
            await removeAppointment(selectedEvent.id)
            toast.success('Compromisso excluído!')
            setIsModalOpen(false)
            resetForm()
        } catch (error) {
            toast.error('Erro ao excluir compromisso')
            console.error(error)
        }
    }

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            start_time: '',
            end_time: '',
            location: '',
            category: ''
        })
        setSelectedSlot(null)
        setSelectedEvent(null)
    }

    const eventStyleGetter = (event) => {
        const style = {
            backgroundColor: '#ffffff',
            borderRadius: '6px',
            opacity: 1,
            color: '#000000',
            border: '1px solid #2a2a2a',
            display: 'block',
            padding: '4px 8px'
        }
        return { style }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Spinner size="lg" />
            </div>
        )
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-text-primary">Agenda</h1>
                <p className="text-text-secondary mt-1">
                    Clique em um dia para criar um compromisso
                </p>
            </div>

            {/* Calendar */}
            <div className="bg-bg-card border border-border rounded-xl p-6" style={{ height: '700px' }}>
                <BigCalendar
                    localizer={localizer}
                    events={appointments}
                    startAccessor="start"
                    endAccessor="end"
                    culture="pt-BR"
                    onSelectSlot={handleSelectSlot}
                    onSelectEvent={handleSelectEvent}
                    selectable
                    eventPropGetter={eventStyleGetter}
                    messages={{
                        next: 'Próximo',
                        previous: 'Anterior',
                        today: 'Hoje',
                        month: 'Mês',
                        week: 'Semana',
                        day: 'Dia',
                        agenda: 'Agenda',
                        date: 'Data',
                        time: 'Hora',
                        event: 'Compromisso',
                        noEventsInRange: 'Sem compromissos neste período',
                        showMore: (total) => `+ ${total} mais`
                    }}
                />
            </div>

            {/* Create/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false)
                    resetForm()
                }}
                title={selectedEvent ? 'Editar Compromisso' : 'Novo Compromisso'}
                footer={
                    <>
                        {selectedEvent && (
                            <Button variant="danger" onClick={handleDelete}>
                                <Trash2 size={18} />
                                Excluir
                            </Button>
                        )}
                        <div className="flex gap-2 ml-auto">
                            <Button variant="ghost" onClick={() => {
                                setIsModalOpen(false)
                                resetForm()
                            }}>
                                Cancelar
                            </Button>
                            <Button onClick={handleSubmit}>
                                {selectedEvent ? 'Salvar' : 'Criar'}
                            </Button>
                        </div>
                    </>
                }
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Título"
                        type="text"
                        placeholder="Ex: Reunião com cliente"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-mono font-medium text-text-secondary mb-2 uppercase tracking-wider">
                                Data/Hora Início
                            </label>
                            <input
                                type="datetime-local"
                                className="w-full bg-zinc-900/50 border border-white/10 rounded-lg px-4 py-3 text-text-primary placeholder:text-text-muted outline-none transition-all duration-300 focus:border-white/30 focus:ring-1 focus:ring-white/10 focus:bg-zinc-900/80"
                                value={formData.start_time}
                                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-mono font-medium text-text-secondary mb-2 uppercase tracking-wider">
                                Data/Hora Fim (opcional)
                            </label>
                            <input
                                type="datetime-local"
                                className="w-full bg-zinc-900/50 border border-white/10 rounded-lg px-4 py-3 text-text-primary placeholder:text-text-muted outline-none transition-all duration-300 focus:border-white/30 focus:ring-1 focus:ring-white/10 focus:bg-zinc-900/80"
                                value={formData.end_time}
                                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                            />
                        </div>
                    </div>

                    <Input
                        label="Local (opcional)"
                        type="text"
                        placeholder="Ex: Sala de reuniões"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />

                    <Input
                        label="Categoria (opcional)"
                        type="text"
                        placeholder="Ex: Trabalho, Pessoal, Saúde"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    />

                    <Textarea
                        label="Descrição (opcional)"
                        placeholder="Detalhes do compromisso..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                </form>
            </Modal>

            {/* Custom styles for calendar in dark theme */}
            <style>{`
        .rbc-calendar {
          font-family: Inter, sans-serif;
          color: #ffffff;
        }
        .rbc-header {
          padding: 12px 4px;
          font-weight: 600;
          color: #ffffff;
          background: #0a0a0a;
          border-bottom: 1px solid #2a2a2a;
        }
        .rbc-month-view, .rbc-time-view {
          background: #000000;
          border: 1px solid #2a2a2a;
        }
        .rbc-day-bg {
          border-left: 1px solid #2a2a2a;
        }
        .rbc-month-row {
          border-top: 1px solid #2a2a2a;
        }
        .rbc-date-cell {
          padding: 8px;
          color: #8a8a8a;
        }
        .rbc-today {
          background-color: #1a1a1a;
        }
        .rbc-off-range-bg {
          background: #0a0a0a;
        }
        .rbc-toolbar {
          padding: 16px;
          margin-bottom: 16px;
          background: #0a0a0a;
          border-radius: 8px;
          border: 1px solid #2a2a2a;
        }
        .rbc-toolbar button {
          color: #ffffff;
          background: #1a1a1a;
          border: 1px solid #2a2a2a;
          padding: 8px 16px;
          border-radius: 6px;
          transition: all 0.2s;
        }
        .rbc-toolbar button:hover {
          background: #2a2a2a;
        }
        .rbc-toolbar button.rbc-active {
          background: #ffffff;
          color: #000000;
        }
        .rbc-event {
          background: #ffffff !important;
          color: #000000 !important;
          border: none !important;
          padding: 4px 8px !important;
          border-radius: 4px !important;
          font-size: 13px !important;
        }
        .rbc-event:hover {
          opacity: 0.9 !important;
        }
        .rbc-show-more {
          color: #ffffff;
          background: #2a2a2a;
          padding: 4px 8px;
          border-radius: 4px;
        }
        .rbc-time-slot {
          border-top: 1px solid #2a2a2a;
          color: #8a8a8a;
        }
        .rbc-time-content {
          border-top: 1px solid #2a2a2a;
        }
        .rbc-current-time-indicator {
          background-color: #ffffff;
        }
      `}</style>
        </div>
    )
}

export default CalendarPage
