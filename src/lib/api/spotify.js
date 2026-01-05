import SpotifyWebApi from 'spotify-web-api-js'

const spotify = new SpotifyWebApi()

// Spotify OAuth configuration
const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID || ''
const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI || 'http://localhost:5173/callback'
const SCOPES = [
    'user-read-currently-playing',
    'user-read-playback-state',
    'user-modify-playback-state',
    'playlist-read-private',
    'playlist-read-collaborative'
]

/**
 * Generate Spotify authorization URL
 */
export const getAuthUrl = () => {
    const authEndpoint = 'https://accounts.spotify.com/authorize'
    const params = new URLSearchParams({
        client_id: CLIENT_ID,
        response_type: 'token',
        redirect_uri: REDIRECT_URI,
        scope: SCOPES.join(' '),
        show_dialog: 'false'
    })
    return `${authEndpoint}?${params.toString()}`
}

/**
 * Extract access token from URL hash
 */
export const getTokenFromUrl = () => {
    const hash = window.location.hash
        .substring(1)
        .split('&')
        .reduce((acc, item) => {
            const parts = item.split('=')
            acc[parts[0]] = decodeURIComponent(parts[1])
            return acc
        }, {})

    window.location.hash = ''
    return hash.access_token
}

/**
 * Set access token
 */
export const setAccessToken = (token) => {
    spotify.setAccessToken(token)
    localStorage.setItem('spotify_token', token)
}

/**
 * Get stored access token
 */
export const getStoredToken = () => {
    return localStorage.getItem('spotify_token')
}

/**
 * Clear access token
 */
export const clearToken = () => {
    localStorage.removeItem('spotify_token')
    spotify.setAccessToken(null)
}

/**
 * Get user's playlists
 */
export const getUserPlaylists = async () => {
    try {
        const response = await spotify.getUserPlaylists()
        return response.items
    } catch (error) {
        console.error('Error fetching playlists:', error)
        throw error
    }
}

/**
 * Get playlist tracks
 */
export const getPlaylistTracks = async (playlistId) => {
    try {
        const response = await spotify.getPlaylistTracks(playlistId)
        return response.items
    } catch (error) {
        console.error('Error fetching playlist tracks:', error)
        throw error
    }
}

/**
 * Get current playback state
 */
export const getCurrentPlayback = async () => {
    try {
        const response = await spotify.getMyCurrentPlaybackState()
        return response
    } catch (error) {
        console.error('Error fetching playback state:', error)
        return null
    }
}

/**
 * Play a track
 */
export const playTrack = async (trackUri) => {
    try {
        await spotify.play({
            uris: [trackUri]
        })
    } catch (error) {
        console.error('Error playing track:', error)
        throw error
    }
}

/**
 * Pause playback
 */
export const pausePlayback = async () => {
    try {
        await spotify.pause()
    } catch (error) {
        console.error('Error pausing playback:', error)
        throw error
    }
}

/**
 * Resume playback
 */
export const resumePlayback = async () => {
    try {
        await spotify.play()
    } catch (error) {
        console.error('Error resuming playback:', error)
        throw error
    }
}

/**
 * Get user profile
 */
export const getUserProfile = async () => {
    try {
        const response = await spotify.getMe()
        return response
    } catch (error) {
        console.error('Error fetching user profile:', error)
        throw error
    }
}

export default spotify
