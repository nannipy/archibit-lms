'use server';

import { createClient } from '@/lib/supabase/server';

export async function getSignedVideoUrl(videoPath: string) {
    const supabase = await createClient();

    // Extract the relative path from the full URL if necessary
    // Example input: https://xyz.supabase.co/.../public/course-videos/courses/123/video.mp4
    // We need: courses/123/video.mp4

    let path = videoPath;
    if (videoPath.includes('course-videos/')) {
        path = videoPath.split('course-videos/')[1];
    }

    const { data, error } = await supabase.storage
        .from('course-videos')
        .createSignedUrl(path, 3600); // 1 hour validity

    if (error) {
        console.error('Error signing URL:', error);
        return null;
    }

    return data.signedUrl;
}
