import { useState } from 'react'
import { useSpotify } from '@/hooks/useSpotify'
import Button from './ui/Button'
import Card from './ui/Card'
import Modal from './ui/Modal'
import Spinner from './ui/Spinner'
import { Music, Play, Pause, LogOut, List } from 'lucide-react'
import toast from 'react-hot-toast'

const SpotifyPlayer = () => {
    const {
        token,
        user,
        playlists,
        currentTrack,
        isPlaying,
        loading,
        login,
        logout,
        playTrack,
        pause,
        resume,
        getPlaylistTracks
    } = useSpotify()

    const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false)
    const [selectedPlaylist, setSelectedPlaylist] = useState(null)
    const [playlistTracks, setPlaylistTracks] = useState([])
    const [loadingTracks, setLoadingTracks] = useState(false)

    const handlePlaylistSelect = async (playlist) => {
        setSelectedPlaylist(playlist)
        setLoadingTracks(true)
        try {
            const tracks = await getPlaylistTracks(playlist.id)
            setPlaylistTracks(tracks)
        } catch (error) {
            toast.error('Erro ao carregar músicas')
        } finally {
            setLoadingTracks(false)
        }
    }

    const handleTrackPlay = async (track) => {
        try {
            await playTrack(track.track.uri)
            toast.success(`Tocando: ${track.track.name}`)
            setIsPlaylistModalOpen(false)
        } catch (error) {
            toast.error('Erro ao tocar música. Certifique-se de ter um dispositivo Spotify ativo.')
        }
    }

    const togglePlayback = async () => {
        try {
            if (isPlaying) {
                await pause()
            } else {
                await resume()
            }
        } catch (error) {
            toast.error('Erro ao controlar reprodução')
        }
    }

    if (loading) {
        return (
            <Card className="flex items-center justify-center p-4">
                <Spinner size="sm" />
            </Card>
        )
    }

    if (!token) {
        return (
            <Card className="relative overflow-hidden">
                <div className="absolute inset-0 opacity-5 bg-gradient-to-br from-green-500 to-emerald-500" />
                <div className="relative space-y-3">
                    <div className="flex items-center gap-2">
                        <Music className="text-green-500" size={20} />
                        <h3 className="text-lg font-semibold text-text-primary font-mono">
                            Spotify
                        </h3>
                    </div>
                    <p className="text-sm text-text-secondary">
                        Conecte sua conta Spotify para controlar sua música
                    </p>
                    <Button onClick={login} className="w-full">
                        <Music size={16} />
                        Conectar Spotify
                    </Button>
                </div>
            </Card>
        )
    }

    return (
        <>
            <Card className="relative overflow-hidden">
                <div className="absolute inset-0 opacity-5 bg-gradient-to-br from-green-500 to-emerald-500" />

                <div className="relative space-y-3">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Music className="text-green-500" size={20} />
                            <h3 className="text-lg font-semibold text-text-primary font-mono">
                                Spotify
                            </h3>
                        </div>
                        <Button
                            variant="ghost"
                            onClick={logout}
                            className="!p-2"
                        >
                            <LogOut size={16} />
                        </Button>
                    </div>

                    {/* Current Track */}
                    {currentTrack ? (
                        <div className="flex items-center gap-3 p-3 bg-zinc-900/50 rounded-lg">
                            {currentTrack.album?.images?.[0] && (
                                <img
                                    src={currentTrack.album.images[0].url}
                                    alt={currentTrack.name}
                                    className="w-12 h-12 rounded"
                                />
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-text-primary truncate">
                                    {currentTrack.name}
                                </p>
                                <p className="text-xs text-text-muted truncate">
                                    {currentTrack.artists?.map(a => a.name).join(', ')}
                                </p>
                            </div>
                            <Button
                                variant="secondary"
                                onClick={togglePlayback}
                                className="!p-2"
                            >
                                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                            </Button>
                        </div>
                    ) : (
                        <div className="text-center text-sm text-text-muted py-2">
                            Nenhuma música tocando
                        </div>
                    )}

                    {/* Select Track Button */}
                    <Button
                        variant="secondary"
                        onClick={() => setIsPlaylistModalOpen(true)}
                        className="w-full"
                    >
                        <List size={16} />
                        Selecionar Música
                    </Button>
                </div>
            </Card>

            {/* Playlist/Track Selection Modal */}
            <Modal
                isOpen={isPlaylistModalOpen}
                onClose={() => {
                    setIsPlaylistModalOpen(false)
                    setSelectedPlaylist(null)
                    setPlaylistTracks([])
                }}
                title={selectedPlaylist ? selectedPlaylist.name : 'Suas Playlists'}
                size="md"
            >
                {!selectedPlaylist ? (
                    /* Playlist List */
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {playlists.map((playlist) => (
                            <button
                                key={playlist.id}
                                onClick={() => handlePlaylistSelect(playlist)}
                                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors text-left"
                            >
                                {playlist.images?.[0] && (
                                    <img
                                        src={playlist.images[0].url}
                                        alt={playlist.name}
                                        className="w-12 h-12 rounded"
                                    />
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-text-primary truncate">
                                        {playlist.name}
                                    </p>
                                    <p className="text-xs text-text-muted">
                                        {playlist.tracks.total} músicas
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>
                ) : loadingTracks ? (
                    <div className="flex items-center justify-center py-8">
                        <Spinner size="md" />
                    </div>
                ) : (
                    /* Track List */
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        <Button
                            variant="ghost"
                            onClick={() => {
                                setSelectedPlaylist(null)
                                setPlaylistTracks([])
                            }}
                            className="mb-2"
                        >
                            ← Voltar
                        </Button>
                        {playlistTracks.map((item, index) => (
                            <button
                                key={index}
                                onClick={() => handleTrackPlay(item)}
                                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors text-left"
                            >
                                {item.track.album?.images?.[0] && (
                                    <img
                                        src={item.track.album.images[0].url}
                                        alt={item.track.name}
                                        className="w-10 h-10 rounded"
                                    />
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-text-primary truncate">
                                        {item.track.name}
                                    </p>
                                    <p className="text-xs text-text-muted truncate">
                                        {item.track.artists?.map(a => a.name).join(', ')}
                                    </p>
                                </div>
                                <Play size={16} className="text-green-500" />
                            </button>
                        ))}
                    </div>
                )}
            </Modal>
        </>
    )
}

export default SpotifyPlayer
