import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { useWorkouts } from '@/hooks/useWorkouts'
import WorkoutCard from '@/components/workouts/WorkoutCard'
import WorkoutForm from '@/components/workouts/WorkoutForm'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import toast from 'react-hot-toast'
import { formatDate } from '@/lib/utils'

const Workouts = () => {
    const {
        workouts,
        workoutLogs,
        loading,
        addWorkout,
        editWorkout,
        removeWorkout,
        logWorkout
    } = useWorkouts()

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingWorkout, setEditingWorkout] = useState(null)
    const [activeWorkout, setActiveWorkout] = useState(null)
    const [activeTab, setActiveTab] = useState('workouts') // 'workouts' or 'history'

    const handleSubmit = async (formData) => {
        try {
            if (editingWorkout) {
                await editWorkout(editingWorkout.id, formData)
                toast.success('Treino atualizado!')
            } else {
                await addWorkout(formData)
                toast.success('Treino criado!')
            }
            setIsModalOpen(false)
            setEditingWorkout(null)
        } catch (error) {
            toast.error('Erro ao salvar treino')
            console.error(error)
        }
    }

    const handleEdit = (workout) => {
        setEditingWorkout(workout)
        setIsModalOpen(true)
    }

    const handleDelete = async (id) => {
        if (!confirm('Deseja realmente excluir este treino?')) return

        try {
            await removeWorkout(id)
            toast.success('Treino excluído!')
        } catch (error) {
            toast.error('Erro ao excluir treino')
            console.error(error)
        }
    }

    const handleStartWorkout = (workout) => {
        setActiveWorkout(workout)
    }

    const handleFinishWorkout = async () => {
        if (!activeWorkout) return

        try {
            await logWorkout({
                workout_id: activeWorkout.id,
                workout_name: activeWorkout.name,
                exercises_performed: activeWorkout.exercises,
                duration_minutes: 0,
                notes: ''
            })
            toast.success('Treino concluído! 💪')
            setActiveWorkout(null)
        } catch (error) {
            toast.error('Erro ao registrar treino')
            console.error(error)
        }
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setEditingWorkout(null)
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
                    <h1 className="text-3xl font-bold text-text-primary">Treinos</h1>
                    <p className="text-text-secondary mt-1">
                        Organize seus treinos e acompanhe seu progresso
                    </p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus size={20} />
                    Novo Treino
                </Button>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-border">
                <button
                    onClick={() => setActiveTab('workouts')}
                    className={`pb-3 px-1 font-medium transition-base ${activeTab === 'workouts'
                            ? 'text-text-primary border-b-2 border-text-primary'
                            : 'text-text-secondary hover:text-text-primary'
                        }`}
                >
                    Meus Treinos ({workouts.length})
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`pb-3 px-1 font-medium transition-base ${activeTab === 'history'
                            ? 'text-text-primary border-b-2 border-text-primary'
                            : 'text-text-secondary hover:text-text-primary'
                        }`}
                >
                    Histórico ({workoutLogs.length})
                </button>
            </div>

            {/* Workouts Tab */}
            {activeTab === 'workouts' && (
                <>
                    {workouts.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="text-6xl mb-4">💪</div>
                            <h2 className="text-xl font-semibold text-text-primary mb-2">
                                Nenhum treino criado ainda
                            </h2>
                            <p className="text-text-secondary mb-6">
                                Comece criando seu primeiro treino e alcance seus objetivos!
                            </p>
                            <Button onClick={() => setIsModalOpen(true)}>
                                <Plus size={20} />
                                Criar Primeiro Treino
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {workouts.map((workout) => (
                                <WorkoutCard
                                    key={workout.id}
                                    workout={workout}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    onStart={handleStartWorkout}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
                <div>
                    {workoutLogs.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="text-6xl mb-4">📊</div>
                            <h2 className="text-xl font-semibold text-text-primary mb-2">
                                Sem histórico ainda
                            </h2>
                            <p className="text-text-secondary">
                                Complete treinos para ver seu histórico aqui!
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {workoutLogs.map((log) => (
                                <div key={log.id} className="card-base">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold text-text-primary">{log.workout_name}</h3>
                                            <p className="text-sm text-text-secondary">
                                                {formatDate(log.completed_at, 'dd/MM/yyyy HH:mm')}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-text-secondary">
                                                {log.exercises_performed?.length || 0} exercícios
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Create/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingWorkout ? 'Editar Treino' : 'Novo Treino'}
                size="lg"
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
                            {editingWorkout ? 'Salvar' : 'Criar'}
                        </Button>
                    </>
                }
            >
                <WorkoutForm
                    workout={editingWorkout}
                    onSubmit={handleSubmit}
                    onCancel={handleCloseModal}
                />
            </Modal>

            {/* Active Workout Modal */}
            {activeWorkout && (
                <Modal
                    isOpen={true}
                    onClose={() => setActiveWorkout(null)}
                    title={`Treino: ${activeWorkout.name}`}
                    footer={
                        <>
                            <Button variant="ghost" onClick={() => setActiveWorkout(null)}>
                                Cancelar
                            </Button>
                            <Button onClick={handleFinishWorkout}>
                                Finalizar Treino
                            </Button>
                        </>
                    }
                >
                    <div className="space-y-3">
                        {activeWorkout.exercises.map((exercise, index) => (
                            <div key={index} className="p-4 bg-bg-secondary rounded-lg border border-border">
                                <h4 className="font-semibold text-text-primary mb-2">{exercise.name}</h4>
                                <p className="text-sm text-text-secondary">
                                    {exercise.sets} séries × {exercise.reps} repetições
                                    {exercise.weight > 0 && ` @ ${exercise.weight}kg`}
                                </p>
                            </div>
                        ))}
                    </div>
                </Modal>
            )}
        </div>
    )
}

export default Workouts
