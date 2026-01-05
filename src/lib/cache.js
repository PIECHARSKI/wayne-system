// Simple in-memory cache with TTL (Time To Live)
class Cache {
    constructor() {
        this.cache = new Map()
        this.timestamps = new Map()
    }

    set(key, value, ttl = 5 * 60 * 1000) { // Default 5 minutes
        this.cache.set(key, value)
        this.timestamps.set(key, Date.now() + ttl)
    }

    get(key) {
        const timestamp = this.timestamps.get(key)

        // Check if cache exists and is not expired
        if (!timestamp || Date.now() > timestamp) {
            this.delete(key)
            return null
        }

        return this.cache.get(key)
    }

    delete(key) {
        this.cache.delete(key)
        this.timestamps.delete(key)
    }

    clear() {
        this.cache.clear()
        this.timestamps.clear()
    }

    has(key) {
        const timestamp = this.timestamps.get(key)
        if (!timestamp || Date.now() > timestamp) {
            this.delete(key)
            return false
        }
        return this.cache.has(key)
    }
}

// Create singleton instance
const cache = new Cache()

// Helper function to create cache key
export const createCacheKey = (...parts) => parts.join(':')

// Wrapper for API calls with caching
export const withCache = async (key, fetcher, ttl) => {
    // Check cache first
    const cached = cache.get(key)
    if (cached !== null) {
        return cached
    }

    // Fetch fresh data
    const data = await fetcher()

    // Store in cache
    cache.set(key, data, ttl)

    return data
}

// Invalidate cache by key or pattern
export const invalidateCache = (keyOrPattern) => {
    if (typeof keyOrPattern === 'string') {
        cache.delete(keyOrPattern)
    } else if (keyOrPattern instanceof RegExp) {
        // Invalidate all keys matching pattern
        for (const key of cache.cache.keys()) {
            if (keyOrPattern.test(key)) {
                cache.delete(key)
            }
        }
    }
}

// Clear all cache
export const clearCache = () => {
    cache.clear()
}

export default cache
