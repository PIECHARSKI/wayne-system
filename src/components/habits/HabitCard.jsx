import { useState, useEffect } from 'react'
import { Check, MoreVertical, Trash2, Edit2, Flame } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { calculateStreak, calculateWeeklyCompletion } from '@/lib/utils'
import { getHabitCheckins } from '@/lib/api/habits'

const HabitCard = ({ habit, isChecked, onToggleCheck, onEdit, onDelete }) => {
    const [showMenu, setShowMenu] = useState(false)
    const [checkins, setCheckins] = useState([])
    const [streak, setStreak] = useState(0)
    const [weeklyCompletion, setWeeklyCompletion] = useState(0)

    useEffect(() => {
        loadCheckins()
    }, [habit.id])

    const loadCheckins = async () => {
        try {
            const data = await getHabitCheckins(habit.id)
            setCheckins(data)
            setStreak(calculateStreak(data))
            setWeeklyCompletion(calculateWeeklyCompletion(data))
        } catch (error) {
            console.error('Error loading checkins:', error)
        }
    }

    // Refresh stats when check is toggled
    useEffect(() => {
        if (checkins.length > 0) {
            loadCheckins()
        }
    }, [isChecked])

    return (
        <Card className="relative">
            {/* Menu dropdown */}
            {showMenu && (
                <div className="absolute top-4 right-4 bg-bg-card border border-border rounded-lg shadow-xl z-10 min-w-[150px]">
                    <button
                        onClick={() => {
                            setShowMenu(false)
                            onEdit(habit)
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-text-primary hover:bg-bg-card-hover transition-base"
                    >
                        <Edit2 size={16} />
                        Editar
                    </button>
                    <button
                        onClick={() => {
                            setShowMenu(false)
                            onDelete(habit.id)
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
                <div className="flex items-center gap-3">
                    <div className="text-2xl">{habit.icon || '⭐'}</div>
                    <div>
                        <h3 className="text-lg font-semibold text-text-primary">{habit.name}</h3>
                        {habit.description && (
                            <p className="text-sm text-text-secondary">{habit.description}</p>
                        )}
                    </div>
                </div>
                <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="text-text-secondary hover:text-text-primary transition-base"
                >
                    <MoreVertical size={20} />
                </button>
            </div>

            {/* Stats */}
            <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-text-secondary">
                    <Flame size={18} className="text-orange-400" />
                    <span className="text-sm">
                        Streak: <span className="text-text-primary font-semibold">{streak} dias</span>
                    </span>
                </div>
                <div className="flex items-center gap-2 text-text-secondary">
                    <Check size={18} />
                    <span className="text-sm">
                        Semana: <span className="text-text-primary font-semibold">{weeklyCompletion}%</span>
                    </span>
                </div>
            </div>

            {/* Check-in button */}
            <Button
                variant={isChecked ? 'primary' : 'secondary'}
                onClick={onToggleCheck}
                className="w-full"
            >
                {isChecked ? (
                    <>
                        <Check size={18} />
                        Completado hoje
                    </>
                ) : (
                    'Marcar como concluído'
                )}
            </Button>
        </Card>
    )
}

export default HabitCard
