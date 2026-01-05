import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import {
    getVisionItems,
    createVisionItem,
    updateVisionItem,
    deleteVisionItem,
    reorderVisionItems,
    uploadVisionMedia,
    deleteVisionMedia
} from '@/lib/api/visionBoard'

export const useVisionBoard = () => {
    const [visionItems, setVisionItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)

    useEffect(() => {
        loadVisionItems()
    }, [])

    const loadVisionItems = async () => {
        try {
            const data = await getVisionItems()
            setVisionItems(data)
        } catch (error) {
            console.error('Error loading vision items:', error)
        } finally {
            setLoading(false)
        }
    }

    const addVisionItem = async (itemData, file) => {
        try {
            setUploading(true)

            // Upload media file first
            const { data: { user } } = await supabase.auth.getUser()
            const mediaUrl = await uploadVisionMedia(file, user.id)

            // Determine media type
            const mediaType = file.type.startsWith('video/') ? 'video' : 'image'

            // Create vision item
            const newItem = await createVisionItem({
                ...itemData,
                media_url: mediaUrl,
                media_type: mediaType,
                display_order: visionItems.length
            })

            await loadVisionItems()
            return newItem
        } catch (error) {
            console.error('Error adding vision item:', error)
            throw error
        } finally {
            setUploading(false)
        }
    }

    const editVisionItem = async (id, updates) => {
        try {
            const updated = await updateVisionItem(id, updates)
            await loadVisionItems()
            return updated
        } catch (error) {
            console.error('Error updating vision item:', error)
            throw error
        }
    }

    const removeVisionItem = async (id, mediaUrl) => {
        try {
            // Delete media file from storage
            if (mediaUrl) {
                await deleteVisionMedia(mediaUrl)
            }

            // Delete vision item from database
            await deleteVisionItem(id)
            await loadVisionItems()
        } catch (error) {
            console.error('Error deleting vision item:', error)
            throw error
        }
    }

    const reorder = async (reorderedItems) => {
        try {
            // Optimistically update UI
            setVisionItems(reorderedItems)

            // Update in database
            await reorderVisionItems(reorderedItems)
        } catch (error) {
            console.error('Error reordering vision items:', error)
            // Reload to revert optimistic update
            await loadVisionItems()
            throw error
        }
    }

    return {
        visionItems,
        loading,
        uploading,
        addVisionItem,
        editVisionItem,
        removeVisionItem,
        reorder,
        refreshVisionItems: loadVisionItems
    }
}
