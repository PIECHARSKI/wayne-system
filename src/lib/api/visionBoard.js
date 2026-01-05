import { supabase } from '../supabase'

/**
 * Get all vision items for the current user
 */
export const getVisionItems = async () => {
    const { data, error } = await supabase
        .from('vision_items')
        .select('*')
        .order('display_order', { ascending: true })

    if (error) throw error
    return data
}

/**
 * Get a single vision item by ID
 */
export const getVisionItem = async (id) => {
    const { data, error } = await supabase
        .from('vision_items')
        .select('*')
        .eq('id', id)
        .single()

    if (error) throw error
    return data
}

/**
 * Create a new vision item
 */
export const createVisionItem = async (visionItem) => {
    const { data: { user } } = await supabase.auth.getUser()

    const { data, error } = await supabase
        .from('vision_items')
        .insert([{ ...visionItem, user_id: user.id }])
        .select()
        .single()

    if (error) throw error
    return data
}

/**
 * Update an existing vision item
 */
export const updateVisionItem = async (id, updates) => {
    const { data, error } = await supabase
        .from('vision_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

    if (error) throw error
    return data
}

/**
 * Delete a vision item
 */
export const deleteVisionItem = async (id) => {
    const { error } = await supabase
        .from('vision_items')
        .delete()
        .eq('id', id)

    if (error) throw error
}

/**
 * Reorder vision items
 */
export const reorderVisionItems = async (items) => {
    // Update display_order for each item
    const updates = items.map((item, index) =>
        supabase
            .from('vision_items')
            .update({ display_order: index })
            .eq('id', item.id)
    )

    const results = await Promise.all(updates)

    const error = results.find(r => r.error)?.error
    if (error) throw error
}

/**
 * Upload media file to Supabase Storage
 */
export const uploadVisionMedia = async (file, userId) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/${Date.now()}.${fileExt}`

    const { data, error } = await supabase.storage
        .from('vision-media')
        .upload(fileName, file)

    if (error) throw error

    // Get public URL
    const { data: urlData } = supabase.storage
        .from('vision-media')
        .getPublicUrl(fileName)

    return urlData.publicUrl
}

/**
 * Delete media file from Supabase Storage
 */
export const deleteVisionMedia = async (mediaUrl) => {
    // Extract file path from URL
    const urlParts = mediaUrl.split('/vision-media/')
    if (urlParts.length < 2) return

    const filePath = urlParts[1]

    const { error } = await supabase.storage
        .from('vision-media')
        .remove([filePath])

    if (error) throw error
}
