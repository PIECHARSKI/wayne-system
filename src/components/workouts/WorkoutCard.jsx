import { MoreVertical, Edit2, Trash2, Play } from 'lucide-react'
import { useState } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

const WorkoutCard = ({ workout, onEdit, onDelete, onStart }) => {
    const [showMenu, setShowMenu] = useState(false)

    const dayLabels = {
        monday: 'Segunda',
        tuesday: 'Terça',
        wednesday: 'Quarta',
        thursday: 'Quinta',
        friday: 'Sexta',
        saturday: 'Sábado',
        sunday: 'Domingo'
    }

    const exercises = workout.exercises || []

    return (
        <Card className="relative">
            {/* Menu dropdown */}
            {showMenu && (
                <div className="absolute top-4 right-4 bg-bg-card border border-border rounded-lg shadow-xl z-10 min-w-[150px]">
                    <button
                        onClick={() => {
                            setShowMenu(false)
                            onEdit(workout)
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-text-primary hover:bg-bg-card-hover transition-base"
                    >
                        <Edit2 size={16} />
                        Editar
                    </button>
                    <button
                        onClick={() => {
                            setShowMenu(false)
                            onDelete(workout.id)
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-bg-card-hover transition-base"
                    >
                        <Trash2 size={16} />
                        Excluir
                    </button>
                </div>
            )}

            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-text-primary">{workout.name}</h3>
                    {workout.day_of_week && (
                        <p className="text-sm text-text-secondary">{dayLabels[workout.day_of_week]}</p>
                    )}
                </div>
                <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="text-text-secondary hover:text-text-primary transition-base"
                >
                    <MoreVertical size={20} />
                </button>
            </div>

            {/* Exercises count */}
            <div className="mb-4">
                <p className="text-sm text-text-secondary">
                    {exercises.length} {exercises.length === 1 ? 'exercício' : 'exercícios'}
                </p>
                {exercises.length > 0 && (
                    <div className="mt-2 space-y-1">
                        {exercises.slice(0, 3).map((ex, i) => (
                            <p key={i} className="text-xs text-text-muted">
                                • {ex.name} - {ex.sets}x{ex.reps} {ex.weight > 0 && `@ ${ex.weight}kg`}
                            </p>
                        ))}
                        {exercises.length > 3 && (
                            <p className="text-xs text-text-muted">+ {exercises.length - 3} mais...</p>
                        )}
                    </div>
                )}
            </div>

            {/* Start button */}
            <Button
                variant="primary"
                onClick={() => onStart(workout)}
                className="w-full"
            >
                <Play size={18} />
                Iniciar Treino
            </Button>
        </Card>
    )
}

export default WorkoutCard
