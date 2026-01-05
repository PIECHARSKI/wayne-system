import { useState, useEffect } from 'react'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'

const HabitForm = ({ habit, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        frequency: 'daily',
        category: '',
        icon: '⭐'
    })

    useEffect(() => {
        if (habit) {
            setFormData(habit)
        }
    }, [habit])

    const handleSubmit = (e) => {
        e.preventDefault()
        onSubmit(formData)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input
                label="Nome do Hábito"
                type="text"
                placeholder="Ex: Beber 2L de água"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
            />

            <Input
                label="Descrição (opcional)"
                type="text"
                placeholder="Detalhes sobre o hábito..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />

            <Select
                label="Frequência"
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                options={[
                    { value: 'daily', label: 'Diário' },
                    { value: 'weekly', label: 'Semanal' }
                ]}
            />

            <Input
                label="Categoria (opcional)"
                type="text"
                placeholder="Ex: Saúde, Produtividade, Bem-estar"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            />
        </form>
    )
}

export default HabitForm
