import { useState, useEffect } from 'react'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import { Trash2, Plus } from 'lucide-react'

const WorkoutForm = ({ workout, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        day_of_week: '',
        exercises: [],
        notes: ''
    })

    useEffect(() => {
        if (workout) {
            setFormData({
                ...workout,
                exercises: workout.exercises || []
            })
        }
    }, [workout])

    const handleSubmit = (e) => {
        e.preventDefault()
        onSubmit(formData)
    }

    const addExercise = () => {
        setFormData({
            ...formData,
            exercises: [
                ...formData.exercises,
                { name: '', sets: 3, reps: 12, weight: 0, order: formData.exercises.length + 1 }
            ]
        })
    }

    const removeExercise = (index) => {
        setFormData({
            ...formData,
            exercises: formData.exercises.filter((_, i) => i !== index)
        })
    }

    const updateExercise = (index, field, value) => {
        const updated = [...formData.exercises]
        updated[index] = { ...updated[index], [field]: value }
        setFormData({ ...formData, exercises: updated })
    }

    const daysOfWeek = [
        { value: '', label: 'Selecione...' },
        { value: 'monday', label: 'Segunda-feira' },
        { value: 'tuesday', label: 'Terça-feira' },
        { value: 'wednesday', label: 'Quarta-feira' },
        { value: 'thursday', label: 'Quinta-feira' },
        { value: 'friday', label: 'Sexta-feira' },
        { value: 'saturday', label: 'Sábado' },
        { value: 'sunday', label: 'Domingo' }
    ]

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input
                label="Nome do Treino"
                type="text"
                placeholder="Ex: Treino A - Peito e Tríceps"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
            />

            <Select
                label="Dia da Semana"
                value={formData.day_of_week}
                onChange={(e) => setFormData({ ...formData, day_of_week: e.target.value })}
                options={daysOfWeek}
            />

            {/* Exercises List */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-text-secondary">
                        Exercícios
                    </label>
                    <Button type="button" variant="ghost" size="sm" onClick={addExercise}>
                        <Plus size={16} />
                        Adicionar
                    </Button>
                </div>

                {formData.exercises.length === 0 ? (
                    <div className="text-center py-8 border border-border rounded-lg bg-bg-secondary">
                        <p className="text-text-secondary text-sm">Nenhum exercício adicionado</p>
                        <Button type="button" variant="secondary" onClick={addExercise} className="mt-2">
                            <Plus size={16} />
                            Adicionar Primeiro Exercício
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {formData.exercises.map((exercise, index) => (
                            <div key={index} className="bg-bg-secondary border border-border rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <div className="flex-1 space-y-3">
                                        <Input
                                            label="Nome do Exercício"
                                            type="text"
                                            placeholder="Ex: Supino Reto"
                                            value={exercise.name}
                                            onChange={(e) => updateExercise(index, 'name', e.target.value)}
                                            required
                                        />
                                        <div className="grid grid-cols-3 gap-3">
                                            <Input
                                                label="Séries"
                                                type="number"
                                                min="1"
                                                value={exercise.sets}
                                                onChange={(e) => updateExercise(index, 'sets', parseInt(e.target.value))}
                                                required
                                            />
                                            <Input
                                                label="Reps"
                                                type="number"
                                                min="1"
                                                value={exercise.reps}
                                                onChange={(e) => updateExercise(index, 'reps', parseInt(e.target.value))}
                                                required
                                            />
                                            <Input
                                                label="Carga (kg)"
                                                type="number"
                                                min="0"
                                                step="0.5"
                                                value={exercise.weight}
                                                onChange={(e) => updateExercise(index, 'weight', parseFloat(e.target.value))}
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeExercise(index)}
                                        className="text-red-400 hover:text-red-300 transition-base mt-6"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                    Observações (opcional)
                </label>
                <textarea
                    className="input-base w-full min-h-[80px] resize-y"
                    placeholder="Anotações sobre o treino..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
            </div>
        </form>
    )
}

export default WorkoutForm
