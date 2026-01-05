import { useState } from 'react'
import { useVisionBoard } from '@/hooks/useVisionBoard'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import Card from '@/components/ui/Card'
import toast from 'react-hot-toast'
import { Upload, Trash2, Eye, Play } from 'lucide-react'

const VisionBoard = () => {
    const { visionItems, loading, uploading, addVisionItem, removeVisionItem } = useVisionBoard()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedFile, setSelectedFile] = useState(null)
    const [previewUrl, setPreviewUrl] = useState(null)
    const [viewMode, setViewMode] = useState('grid') // 'grid' or 'slideshow'
    const [currentSlide, setCurrentSlide] = useState(0)

    const handleFileSelect = (e) => {
        const file = e.target.files[0]
        if (file) {
            setSelectedFile(file)
            // Create preview URL
            const url = URL.createObjectURL(file)
            setPreviewUrl(url)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!selectedFile) {
            toast.error('Por favor, selecione uma imagem ou vídeo')
            return
        }

        try {
            // Simple upload without title/description
            await addVisionItem({}, selectedFile)
            toast.success('Item adicionado ao quadro de visão!')
            setIsModalOpen(false)
            resetForm()
        } catch (error) {
            toast.error('Erro ao adicionar item')
            console.error(error)
        }
    }

    const handleDelete = async (item) => {
        if (!confirm('Deseja realmente excluir este item?')) return

        try {
            await removeVisionItem(item.id, item.media_url)
            toast.success('Item excluído!')
        } catch (error) {
            toast.error('Erro ao excluir item')
            console.error(error)
        }
    }

    const resetForm = () => {
        setSelectedFile(null)
        setPreviewUrl(null)
    }

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % visionItems.length)
    }

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + visionItems.length) % visionItems.length)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Spinner size="lg" />
            </div>
        )
    }

    return (
        <div className="space-y-6 sm:space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">Quadro de Visão</h1>
                    <p className="text-text-secondary mt-1 text-sm sm:text-base">
                        Visualize seus objetivos diariamente
                    </p>
                </div>
                <div className="flex gap-2 sm:gap-3">
                    <Button
                        variant={viewMode === 'grid' ? 'primary' : 'secondary'}
                        onClick={() => setViewMode('grid')}
                        className="flex-1 sm:flex-none"
                    >
                        Grade
                    </Button>
                    <Button
                        variant={viewMode === 'slideshow' ? 'primary' : 'secondary'}
                        onClick={() => setViewMode('slideshow')}
                        disabled={visionItems.length === 0}
                        className="flex-1 sm:flex-none"
                    >
                        <Eye size={18} />
                        <span className="hidden sm:inline">Apresentação</span>
                    </Button>
                    <Button onClick={() => setIsModalOpen(true)} className="flex-1 sm:flex-none">
                        <Upload size={18} />
                        <span className="hidden sm:inline">Adicionar</span>
                    </Button>
                </div>
            </div>

            {/* Content */}
            {visionItems.length === 0 ? (
                <Card className="text-center py-16">
                    <Eye size={48} className="mx-auto text-text-muted mb-4" />
                    <h3 className="text-xl font-semibold text-text-primary mb-2">
                        Seu quadro de visão está vazio
                    </h3>
                    <p className="text-text-secondary mb-6">
                        Adicione imagens e vídeos que representam seus objetivos
                    </p>
                    <Button onClick={() => setIsModalOpen(true)}>
                        <Upload size={18} />
                        Adicionar Primeiro Item
                    </Button>
                </Card>
            ) : viewMode === 'grid' ? (
                /* Grid View - 9:16 Portrait Format */
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                    {visionItems.map((item) => (
                        <Card key={item.id} className="group relative overflow-hidden p-0">
                            {/* Media - 9:16 aspect ratio */}
                            <div className="aspect-[9/16] bg-bg-secondary rounded-lg overflow-hidden relative">
                                {item.media_type === 'video' ? (
                                    <video
                                        src={item.media_url}
                                        className="w-full h-full object-cover"
                                        controls
                                    />
                                ) : (
                                    <img
                                        src={item.media_url}
                                        alt="Vision item"
                                        className="w-full h-full object-cover"
                                    />
                                )}

                                {/* Delete button overlay */}
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                        variant="danger"
                                        onClick={() => handleDelete(item)}
                                        className="!p-2"
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                /* Slideshow View - 9:16 Portrait Format */
                <div className="relative flex justify-center">
                    <Card className="p-0 overflow-hidden max-w-md w-full">
                        <div className="aspect-[9/16] bg-bg-secondary relative">
                            {visionItems[currentSlide]?.media_type === 'video' ? (
                                <video
                                    src={visionItems[currentSlide]?.media_url}
                                    className="w-full h-full object-cover"
                                    controls
                                    autoPlay
                                />
                            ) : (
                                <img
                                    src={visionItems[currentSlide]?.media_url}
                                    alt="Vision item"
                                    className="w-full h-full object-cover"
                                />
                            )}

                            {/* Navigation */}
                            <div className="absolute inset-0 flex items-center justify-between p-4">
                                <Button
                                    variant="secondary"
                                    onClick={prevSlide}
                                    className="!p-3 opacity-80 hover:opacity-100"
                                >
                                    ←
                                </Button>
                                <Button
                                    variant="secondary"
                                    onClick={nextSlide}
                                    className="!p-3 opacity-80 hover:opacity-100"
                                >
                                    →
                                </Button>
                            </div>

                            {/* Counter */}
                            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                                <span className="bg-black/60 text-white px-3 py-1 rounded-full text-sm font-mono">
                                    {currentSlide + 1} / {visionItems.length}
                                </span>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* Add Modal - Simplified without title/description */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false)
                    resetForm()
                }}
                title="Adicionar ao Quadro de Visão"
                size="sm"
                footer={
                    <div className="flex gap-2 ml-auto">
                        <Button
                            variant="ghost"
                            onClick={() => {
                                setIsModalOpen(false)
                                resetForm()
                            }}
                        >
                            Cancelar
                        </Button>
                        <Button onClick={handleSubmit} loading={uploading}>
                            Adicionar
                        </Button>
                    </div>
                }
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-mono font-medium text-text-secondary mb-2 uppercase tracking-wider">
                            Selecione uma Imagem ou Vídeo
                        </label>
                        <input
                            type="file"
                            accept="image/*,video/*"
                            onChange={handleFileSelect}
                            className="w-full bg-zinc-900/50 border border-white/10 rounded-lg px-4 py-3 text-text-primary file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-white file:text-black hover:file:bg-gray-200 cursor-pointer"
                            required
                        />
                        <p className="text-xs text-text-muted mt-2">
                            Formato recomendado: 9:16 (vertical/portrait)
                        </p>
                    </div>

                    {/* Preview - 9:16 aspect ratio */}
                    {previewUrl && (
                        <div className="mt-4">
                            <label className="block text-xs font-mono font-medium text-text-secondary mb-2 uppercase tracking-wider">
                                Pré-visualização
                            </label>
                            <div className="aspect-[9/16] bg-bg-secondary rounded-lg overflow-hidden max-w-xs mx-auto">
                                {selectedFile?.type.startsWith('video/') ? (
                                    <video
                                        src={previewUrl}
                                        className="w-full h-full object-cover"
                                        controls
                                    />
                                ) : (
                                    <img
                                        src={previewUrl}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                    />
                                )}
                            </div>
                        </div>
                    )}
                </form>
            </Modal>
        </div>
    )
}

export default VisionBoard
