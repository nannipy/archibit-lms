import { createClient } from '@/lib/supabase/client'

const BUCKETS = {
    VIDEOS: 'course-videos',
    THUMBNAILS: 'course-thumbnails',
} as const

// ===== VIDEO STORAGE =====

/**
 * Upload a video to Supabase Storage
 */
export async function uploadVideo(
    file: File,
    courseId: string,
    lessonId: string
): Promise<{ path: string; url: string }> {
    const supabase = createClient()

    const path = `${courseId}/${lessonId}/${file.name}`

    const { error } = await supabase.storage
        .from(BUCKETS.VIDEOS)
        .upload(path, file, {
            cacheControl: '3600',
            upsert: true,
        })

    if (error) {
        throw new Error(`Failed to upload video: ${error.message}`)
    }

    const url = await getVideoUrl(path)
    return { path, url }
}

/**
 * Get public URL for a video (for thumbnails/public content)
 */
export async function getVideoUrl(path: string): Promise<string> {
    const supabase = createClient()

    const { data } = supabase.storage
        .from(BUCKETS.VIDEOS)
        .getPublicUrl(path)

    return data.publicUrl
}

/**
 * Get signed URL for a video (time-limited access for enrolled users)
 */
export async function getSignedVideoUrl(
    path: string,
    expiresIn: number = 3600
): Promise<string> {
    const supabase = createClient()

    const { data, error } = await supabase.storage
        .from(BUCKETS.VIDEOS)
        .createSignedUrl(path, expiresIn)

    if (error) {
        throw new Error(`Failed to create signed URL: ${error.message}`)
    }

    return data.signedUrl
}

/**
 * Delete a video from storage
 */
export async function deleteVideo(path: string): Promise<void> {
    const supabase = createClient()

    const { error } = await supabase.storage
        .from(BUCKETS.VIDEOS)
        .remove([path])

    if (error) {
        throw new Error(`Failed to delete video: ${error.message}`)
    }
}

// ===== THUMBNAIL STORAGE =====

/**
 * Upload a course thumbnail
 */
export async function uploadThumbnail(
    file: File,
    courseId: string
): Promise<{ path: string; url: string }> {
    const supabase = createClient()

    const ext = file.name.split('.').pop()
    const path = `${courseId}/thumbnail.${ext}`

    const { error } = await supabase.storage
        .from(BUCKETS.THUMBNAILS)
        .upload(path, file, {
            cacheControl: '3600',
            upsert: true,
        })

    if (error) {
        throw new Error(`Failed to upload thumbnail: ${error.message}`)
    }

    const url = getThumbnailUrl(path)
    return { path, url }
}

/**
 * Get public URL for a thumbnail
 */
export function getThumbnailUrl(path: string): string {
    const supabase = createClient()

    const { data } = supabase.storage
        .from(BUCKETS.THUMBNAILS)
        .getPublicUrl(path)

    return data.publicUrl
}

/**
 * Delete a thumbnail
 */
export async function deleteThumbnail(path: string): Promise<void> {
    const supabase = createClient()

    const { error } = await supabase.storage
        .from(BUCKETS.THUMBNAILS)
        .remove([path])

    if (error) {
        throw new Error(`Failed to delete thumbnail: ${error.message}`)
    }
}
