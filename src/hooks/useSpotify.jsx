import { useState, useEffect } from 'react'
import {
    getAuthUrl,
    getTokenFromUrl,
    setAccessToken,
    getStoredToken,
    clearToken,
    getUserPlaylists,
    getPlaylistTracks,
    getCurrentPlayback,
    playTrack,
    pausePlayback,
    resumePlayback,
    getUserProfile
} from '@/lib/api/spotify'

export const useSpotify = () => {
    const [token, setToken] = useState(null)
    const [user, setUser] = useState(null)
    const [playlists, setPlaylists] = useState([])
    const [currentTrack, setCurrentTrack] = useState(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Check for token in URL (after OAuth redirect)
        const tokenFromUrl = getTokenFromUrl()
        if (tokenFromUrl) {
            setAccessToken(tokenFromUrl)
            setToken(tokenFromUrl)
        } else {
            // Check for stored token
            const storedToken = getStoredToken()
            if (storedToken) {
                setAccessToken(storedToken)
                setToken(storedToken)
            }
        }
        setLoading(false)
    }, [])

    useEffect(() => {
        if (token) {
            loadUserData()
            loadPlaylists()
            // Poll for current playback every 5 seconds
            const interval = setInterval(loadCurrentPlayback, 5000)
            return () => clearInterval(interval)
        }
    }, [token])

    const loadUserData = async () => {
        try {
            const userData = await getUserProfile()
            setUser(userData)
        } catch (error) {
            console.error('Error loading user data:', error)
            // Token might be expired
            handleLogout()
        }
    }

    const loadPlaylists = async () => {
        try {
            const playlistsData = await getUserPlaylists()
            setPlaylists(playlistsData)
        } catch (error) {
            console.error('Error loading playlists:', error)
        }
    }

    const loadCurrentPlayback = async () => {
        try {
            const playback = await getCurrentPlayback()
            if (playback && playback.item) {
                setCurrentTrack(playback.item)
                setIsPlaying(playback.is_playing)
            }
        } catch (error) {
            // Silently fail - user might not be playing anything
        }
    }

    const handleLogin = () => {
        window.location.href = getAuthUrl()
    }

    const handleLogout = () => {
        clearToken()
        setToken(null)
        setUser(null)
        setPlaylists([])
        setCurrentTrack(null)
        setIsPlaying(false)
    }

    const handlePlayTrack = async (trackUri) => {
        try {
            await playTrack(trackUri)
            await loadCurrentPlayback()
        } catch (error) {
            console.error('Error playing track:', error)
            throw error
        }
    }

    const handlePause = async () => {
        try {
            await pausePlayback()
            setIsPlaying(false)
        } catch (error) {
            console.error('Error pausing:', error)
            throw error
        }
    }

    const handleResume = async () => {
        try {
            await resumePlayback()
            setIsPlaying(true)
        } catch (error) {
            console.error('Error resuming:', error)
            throw error
        }
    }

    const getPlaylistTracksData = async (playlistId) => {
        try {
            return await getPlaylistTracks(playlistId)
        } catch (error) {
            console.error('Error loading playlist tracks:', error)
            throw error
        }
    }

    return {
        token,
        user,
        playlists,
        currentTrack,
        isPlaying,
        loading,
        login: handleLogin,
        logout: handleLogout,
        playTrack: handlePlayTrack,
        pause: handlePause,
        resume: handleResume,
        getPlaylistTracks: getPlaylistTracksData,
        refreshPlayback: loadCurrentPlayback
    }
}
