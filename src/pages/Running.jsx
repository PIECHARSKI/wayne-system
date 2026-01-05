import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useRuns } from '@/hooks/useRuns'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import DatePicker from '@/components/ui/DatePicker'
import Spinner from '@/components/ui/Spinner'
import toast from 'react-hot-toast'
import { formatDate } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const Running = () => {
    const {
        runs,
        stats,
        monthlyData,
        loading,
        addRun,
        removeRun,
        formatPace,
        formatDuration
    } = useRuns()

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [formData, setFormData] = useState({
        distance: '',
        duration: '',
        run_date: new Date().toISOString().split('T')[0],
        notes: ''
    })

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            await addRun({
                distance: parseFloat(formData.distance),
                duration: parseInt(formData.duration),
                run_date: formData.run_date,
                notes: formData.notes
            })
            toast.success('Corrida registrada! 🏃')
            setIsModalOpen(false)
            setFormData({
                distance: '',
                duration: '',
                run_date: new Date().toISOString().split('T')[0],
                notes: ''
            })
        } catch (error) {
            toast.error('Erro ao registrar corrida')
            console.error(error)
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('Deseja realmente excluir esta corrida?')) return

        try {
            await removeRun(id)
            toast.success('Corrida excluída!')
        } catch (error) {
            toast.error('Erro ao excluir corrida')
            console.error(error)
        }
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
                    <h1 className="text-3xl font-bold text-text-primary">Corrida</h1>
                    <p className="text-text-secondary mt-1">
                        Acompanhe suas corridas e melhore seu desempenho
                    </p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus size={20} />
                    Nova Corrida
                </Button>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card className="text-center">
                    <p className="text-text-secondary text-sm mb-2">Total de Corridas</p>
                    <p className="text-3xl font-bold text-text-primary">{stats.totalRuns}</p>
                </Card>

                <Card className="text-center">
                    <p className="text-text-secondary text-sm mb-2">Distância Total</p>
                    <p className="text-3xl font-bold text-text-primary">{stats.totalDistance} km</p>
                </Card>

                <Card className="text-center">
                    <p className="text-text-secondary text-sm mb-2">Tempo Total</p>
                    <p className="text-3xl font-bold text-text-primary">
                        {formatDuration(stats.totalDuration)}
                    </p>
                </Card>

                <Card className="text-center">
                    <p className="text-text-secondary text-sm mb-2">Pace Médio</p>
                    <p className="text-3xl font-bold text-text-primary">
                        {formatPace(parseFloat(stats.averagePace))} /km
                    </p>
                </Card>
            </div>

            {/* Chart */}
            {monthlyData.length > 0 && (
                <Card className="mb-8">
                    <h3 className="text-lg font-semibold text-text-primary mb-4">
                        Evolução Mensal (km)
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={monthlyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                            <XAxis dataKey="month" stroke="#8a8a8a" />
                            <YAxis stroke="#8a8a8a" />
                            <Tooltip
                                contentStyle={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}
                                formatter={(value) => `${value} km`}
                            />
                            <Bar dataKey="distance" fill="#ffffff" />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            )}

            {/* Runs List */}
            <Card>
                <h3 className="text-lg font-semibold text-text-primary mb-4">
                    Histórico de Corridas
                </h3>

                {runs.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="text-6xl mb-4">🏃</div>
                        <h2 className="text-xl font-semibold text-text-primary mb-2">
                            Nenhuma corrida registrada
                        </h2>
                        <p className="text-text-secondary mb-6">
                            Comece a registrar suas corridas e acompanhe seu progresso!
                        </p>
                        <Button onClick={() => setIsModalOpen(true)}>
                            <Plus size={20} />
                            Registrar Primeira Corrida
                        </Button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left text-text-secondary text-sm font-medium pb-3">Data</th>
                                    <th className="text-right text-text-secondary text-sm font-medium pb-3">Distância</th>
                                    <th className="text-right text-text-secondary text-sm font-medium pb-3">Tempo</th>
                                    <th className="text-right text-text-secondary text-sm font-medium pb-3">Pace</th>
                                    <th className="text-left text-text-secondary text-sm font-medium pb-3">Notas</th>
                                    <th className="text-right text-text-secondary text-sm font-medium pb-3">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {runs.map((run) => (
                                    <tr key={run.id} className="border-b border-border">
                                        <td className="py-3 text-text-primary">
                                            {formatDate(run.run_date)}
                                        </td>
                                        <td className="py-3 text-right text-text-primary font-semibold">
                                            {run.distance} km
                                        </td>
                                        <td className="py-3 text-right text-text-secondary">
                                            {formatDuration(run.duration)}
                                        </td>
                                        <td className="py-3 text-right text-text-secondary">
                                            {formatPace(run.pace)} /km
                                        </td>
                                        <td className="py-3 text-text-secondary text-sm">
                                            {run.notes || '-'}
                                        </td>
                                        <td className="py-3 text-right">
                                            <button
                                                onClick={() => handleDelete(run.id)}
                                                className="text-red-400 hover:text-red-300 transition-base"
                                            >
                                                Excluir
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            {/* Create Run Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Registrar Corrida"
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleSubmit}>
                            Registrar
                        </Button>
                    </>
                }
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Distância (km)"
                        type="number"
                        step="0.01"
                        placeholder="5.0"
                        value={formData.distance}
                        onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                        required
                    />

                    <Input
                        label="Tempo (minutos)"
                        type="number"
                        placeholder="30"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        required
                    />

                    <DatePicker
                        label="Data"
                        value={formData.run_date}
                        onChange={(e) => setFormData({ ...formData, run_date: e.target.value })}
                        required
                    />

                    <Textarea
                        label="Notas (opcional)"
                        placeholder="Como foi a corrida? Como se sentiu?"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />

                    {formData.distance && formData.duration && (
                        <div className="p-4 bg-bg-secondary rounded-lg">
                            <p className="text-sm text-text-secondary mb-1">Pace calculado:</p>
                            <p className="text-2xl font-bold text-text-primary">
                                {formatPace(parseInt(formData.duration) / parseFloat(formData.distance))} /km
                            </p>
                        </div>
                    )}
                </form>
            </Modal>
        </div>
    )
}

export default Running
