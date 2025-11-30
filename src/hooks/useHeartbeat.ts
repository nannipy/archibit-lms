'use client';

import { useEffect, useRef, useCallback } from 'react';
import { HeartbeatPayload } from '@/types';

interface UseHeartbeatOptions {
    lessonId: string;
    getCurrentTime: () => number;
    getMaxViewedTime: () => number;
    getPlaybackRate: () => number;
    isPlaying: boolean;
    interval?: number; // milliseconds, default 10000 (10s)
}

export function useHeartbeat({
    lessonId,
    getCurrentTime,
    getMaxViewedTime,
    getPlaybackRate,
    isPlaying,
    interval = 10000,
}: UseHeartbeatOptions) {
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const sendHeartbeat = useCallback(async () => {
        try {
            const payload: HeartbeatPayload = {
                lessonId,
                currentTime: Math.floor(getCurrentTime()),
                maxViewedTime: Math.floor(getMaxViewedTime()),
                playbackRate: getPlaybackRate(),
                isVisible: !document.hidden,
            };

            const response = await fetch('/api/heartbeat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error(`Heartbeat failed: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Heartbeat sent:', data);
        } catch (error) {
            console.error('Heartbeat error:', error);

            // Retry after 5 seconds
            retryTimeoutRef.current = setTimeout(() => {
                sendHeartbeat();
            }, 5000);
        }
    }, [lessonId, getCurrentTime, getMaxViewedTime, getPlaybackRate]);

    useEffect(() => {
        // Clear any existing intervals
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        // Only send heartbeat when video is playing
        if (isPlaying) {
            // Send immediately on play
            sendHeartbeat();

            // Then send every interval
            intervalRef.current = setInterval(sendHeartbeat, interval);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            if (retryTimeoutRef.current) {
                clearTimeout(retryTimeoutRef.current);
            }
        };
    }, [isPlaying, interval, sendHeartbeat]);

    return { sendHeartbeat };
}
