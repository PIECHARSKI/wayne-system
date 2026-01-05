import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useHabits } from '@/hooks/useHabits'
import HabitCard from '@/components/habits/HabitCard'
import HabitForm from '@/components/habits/HabitForm'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import toast from 'react-hot-toast'

const Habits = () => {
    const {
        habits,
        loading,
        addHabit,
        editHabit,
        removeHabit,
        toggleCheckin,
        isCheckedToday
    } = useHabits()

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingHabit, setEditingHabit] = useState(null)

    const handleSubmit = async (formData) => {
        try {
            if (editingHabit) {
                await editHabit(editingHabit.id, formData)
                toast.success('Hábito atualizado!')
            } else {
                await addHabit(formData)
                toast.success('Hábito criado!')
            }
            setIsModalOpen(false)
            setEditingHabit(null)
        } catch (error) {
            toast.error('Erro ao salvar hábito')
            console.error(error)
        }
    }

    const handleEdit = (habit) => {
        setEditingHabit(habit)
        setIsModalOpen(true)
    }

    const handleDelete = async (id) => {
        if (!confirm('Deseja realmente excluir este hábito?')) return

        try {
            await removeHabit(id)
            toast.success('Hábito excluído!')
        } catch (error) {
            toast.error('Erro ao excluir hábito')
            console.error(error)
        }
    }

    const handleToggleCheckin = async (habitId) => {
        try {
            await toggleCheckin(habitId)
            const isNowChecked = isCheckedToday(habitId)
            toast.success(isNowChecked ? 'Check-in realizado! 🎉' : 'Check-in removido')
        } catch (error) {
            toast.error('Erro ao atualizar check-in')
            console.error(error)
        }
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setEditingHabit(null)
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
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-text-primary">Hábitos</h1>
                    <p className="text-text-secondary mt-1">
                        Acompanhe seus hábitos diários e construa sua rotina ideal
                    </p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus size={20} />
                    Novo Hábito
                </Button>
            </div>

            {/* Empty state */}
            {habits.length === 0 ? (
                <div className="text-center py-16">
                    <div className="text-6xl mb-4">🎯</div>
                    <h2 className="text-xl font-semibold text-text-primary mb-2">
                        Nenhum hábito criado ainda
                    </h2>
                    <p className="text-text-secondary mb-6">
                        Comece criando seu primeiro hábito e construa uma rotina poderosa!
                    </p>
                    <Button onClick={() => setIsModalOpen(true)}>
                        <Plus size={20} />
                        Criar Primeiro Hábito
                    </Button>
                </div>
            ) : (
                <>
                    {/* Stats summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="bg-bg-card border border-border rounded-xl p-4">
                            <p className="text-text-secondary text-sm mb-1">Total de Hábitos</p>
                            <p className="text-3xl font-bold text-text-primary">{habits.length}</p>
                        </div>
                        <div className="bg-bg-card border border-border rounded-xl p-4">
                            <p className="text-text-secondary text-sm mb-1">Completados Hoje</p>
                            <p className="text-3xl font-bold text-green-400">
                                {habits.filter(h => isCheckedToday(h.id)).length}
                            </p>
                        </div>
                        <div className="bg-bg-card border border-border rounded-xl p-4">
                            <p className="text-text-secondary text-sm mb-1">Taxa de Conclusão</p>
                            <p className="text-3xl font-bold text-text-primary">
                                {habits.length > 0
                                    ? Math.round((habits.filter(h => isCheckedToday(h.id)).length / habits.length) * 100)
                                    : 0}%
                            </p>
                        </div>
                    </div>

                    {/* Habits grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {habits.map((habit) => (
                            <HabitCard
                                key={habit.id}
                                habit={habit}
                                isChecked={isCheckedToday(habit.id)}
                                onToggleCheck={() => handleToggleCheckin(habit.id)}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                </>
            )}

            {/* Modal for create/edit */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingHabit ? 'Editar Hábito' : 'Novo Hábito'}
                footer={
                    <>
                        <Button variant="ghost" onClick={handleCloseModal}>
                            Cancelar
                        </Button>
                        <Button onClick={() => {
                            const form = document.querySelector('form')
                            if (form) {
                                form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))
                            }
                        }}>
                            {editingHabit ? 'Salvar' : 'Criar'}
                        </Button>
                    </>
                }
            >
                <HabitForm
                    habit={editingHabit}
                    onSubmit={handleSubmit}
                    onCancel={handleCloseModal}
                />
            </Modal>
        </div>
    )
}

export default Habits
