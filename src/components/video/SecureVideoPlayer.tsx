'use client';

import { useRef, useEffect, useState } from 'react';
import { QuizMarker } from '@/types';
import { getSignedVideoUrl } from '@/app/(admin)/admin/courses/video-actions';
import { Loader2 } from 'lucide-react';

interface SecureVideoPlayerProps {
  lessonId: string;
  videoUrl: string;
  duration: number;
  maxViewedTime: number; // from DB
  initialCurrentTime?: number;
  quizMarkers?: QuizMarker[];
  onProgress: (time: number) => void;
  onPlayStateChange?: (isPlaying: boolean) => void;
  onQuizTrigger?: (marker: QuizMarker) => void;
}

export default function SecureVideoPlayer({
  lessonId,
  videoUrl,
  duration,
  maxViewedTime,
  initialCurrentTime = 0,
  quizMarkers = [],
  onProgress,
  onPlayStateChange,
  onQuizTrigger,
}: SecureVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState(initialCurrentTime);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [volume, setVolume] = useState(1);
  const [playableUrl, setPlayableUrl] = useState<string | null>(null);
  const [loadingUrl, setLoadingUrl] = useState(true);
  
  const lastTimeRef = useRef(0);

  // ===== FETCH SIGNED URL =====
  useEffect(() => {
    let isMounted = true;

    async function fetchSignedUrl() {
       // Reset states on url change
       setLoadingUrl(true);
       setError(null);
       setPlayableUrl(null);

       if (!videoUrl) {
           setLoadingUrl(false);
           return;
       }

       // Only attempt to sign if it looks like a supabase storage url 
       // (Optimization: can also just always try if we want to support other providers later via same action)
       try {
           const signed = await getSignedVideoUrl(videoUrl);
           if (isMounted) {
               if (signed) {
                   setPlayableUrl(signed);
               } else {
                   // Fallback to original if signing fails (might be public)
                   setPlayableUrl(videoUrl);
               }
           }
       } catch (err) {
           console.error("Failed to get signed url", err);
           if (isMounted) setPlayableUrl(videoUrl);
       } finally {
           if (isMounted) setLoadingUrl(false);
       }
    }

    fetchSignedUrl();

    return () => { isMounted = false; };
  }, [videoUrl]);

  // ===== RESUME PLAYBACK =====
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !playableUrl || initialCurrentTime <= 0) return;

    const handleCanPlay = () => {
        if (Math.abs(video.currentTime - initialCurrentTime) > 1) {
             video.currentTime = initialCurrentTime;
             lastTimeRef.current = initialCurrentTime;
        }
    };
    
    // Attempt seek immediately if ready, else wait for event
    if (video.readyState >= 1) {
        handleCanPlay();
    } else {
        video.addEventListener('loadedmetadata', handleCanPlay);
    }

    return () => {
        video.removeEventListener('loadedmetadata', handleCanPlay);
    };
  }, [playableUrl, initialCurrentTime]);

  // ===== SECURITY: Disable Context Menu =====
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    return false;
  };

  // ===== SECURITY: Enforce Playback Rate =====
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const enforcePlaybackRate = () => {
      if (video.playbackRate !== 1.0) {
        console.warn('Attempted playback rate manipulation detected');
        video.playbackRate = 1.0;
      }
    };

    video.addEventListener('ratechange', enforcePlaybackRate);
    
    // Periodic check every 100ms
    const interval = setInterval(enforcePlaybackRate, 100);

    return () => {
      video.removeEventListener('ratechange', enforcePlaybackRate);
      clearInterval(interval);
    };
  }, [loadingUrl]); // Add dep

  // ===== SECURITY: Prevent Forward Seeking =====
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleSeeking = () => {
      const seekTo = video.currentTime;
      const allowedMax = Math.max(maxViewedTime, lastTimeRef.current);

      // If seeking forward beyond allowed position, revert
      if (seekTo > allowedMax + 0.5) { // 0.5s tolerance for buffering
        console.warn('Forward seek blocked');
        video.currentTime = allowedMax;
      } else {
        lastTimeRef.current = video.currentTime;
      }
    };

    video.addEventListener('seeking', handleSeeking);
    
    return () => {
      video.removeEventListener('seeking', handleSeeking);
    };
  }, [maxViewedTime, loadingUrl]);



  // ===== PAGE VISIBILITY API =====
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && videoRef.current && !videoRef.current.paused) {
        videoRef.current.pause();
        setIsPlaying(false);
        console.log('Video paused due to tab switch');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // ===== PROGRESS TRACKING =====
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const time = video.currentTime;
      setCurrentTime(time);
      
      // Check for quizzes
      if (onQuizTrigger && quizMarkers.length > 0) {
          // Find if we just crossed a quiz timestamp
          // Use a small epsilon or range to ensure we don't miss it if frame rate is low,
          // but relying on lastTimeRef check is better.
          const quizToTrigger = quizMarkers.find(q => q.timestamp > lastTimeRef.current && q.timestamp <= time);
          
          if (quizToTrigger) {
              video.pause();
              setIsPlaying(false);
              onPlayStateChange?.(false);
              onQuizTrigger(quizToTrigger);
          }
      }

      // Update max viewed time if we've progressed
      if (time > lastTimeRef.current) {
        lastTimeRef.current = time;
        onProgress(time);
      }
    };

    const handleEnded = () => {
        // Force update to max duration when video ends
        lastTimeRef.current = duration;
        onProgress(duration);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, [onProgress, loadingUrl, duration, quizMarkers, onQuizTrigger, onPlayStateChange]);

  // ===== PLAYBACK CONTROLS =====
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video || error || !video.src) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
      onPlayStateChange?.(true);
    } else {
      video.pause();
      setIsPlaying(false);
      onPlayStateChange?.(false);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const seekTo = parseFloat(e.target.value);
    const allowedMax = Math.max(maxViewedTime, lastTimeRef.current);

    // Only allow seeking to already-watched portions
    if (seekTo <= allowedMax) {
      video.currentTime = seekTo;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto bg-black rounded-lg overflow-hidden shadow-2xl min-h-[300px] flex flex-col">
      {/* Video Element */}
      {playableUrl && !loadingUrl && (
          <video
            ref={videoRef}
            src={playableUrl}
            className="w-full aspect-video"
            onContextMenu={handleContextMenu}
            controlsList="nodownload nofullscreen noremoteplayback"
            disablePictureInPicture
            playsInline
            onError={() => {
                const err = videoRef.current?.error;
                let msg = 'Error loading video.';
                if (err) {
                     if (err.code === 3) msg = 'Video decoding failed.';
                     if (err.code === 4) msg = 'Video source not accessible.';
                }
                console.error('Video Error:', err, playableUrl);
                setError(msg);
            }}
          />
      )}

      {loadingUrl && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="ml-2">Loading secure video...</span>
          </div>
      )}
      
      {error && !loadingUrl && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-50">
           <div className="text-center p-6 max-w-md">
             <div className="text-red-500 mb-2">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
               </svg>
             </div>
             <p className="text-white font-medium mb-1">Playback Error</p>
             <p className="text-gray-400 text-sm mb-4">{error}</p>
             <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-white text-black rounded hover:bg-gray-200 text-sm"
             >
                Reload Page
             </button>
           </div>
        </div>
      )}

      {/* Custom Controls */}
      <div className="bg-gradient-to-t from-black/80 to-transparent p-4 mt-auto">
        {/* Progress Bar */}
        <div className="mb-4">
          <input
            type="range"
            min="0"
            max={duration}
            value={currentTime}
            onChange={handleSeek}
            disabled={!!error || loadingUrl}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(currentTime / duration) * 100}%, #374151 ${(currentTime / duration) * 100}%, #374151 100%)`
            }}
          />
          <div className="flex justify-between text-xs text-gray-300 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Play/Pause Button */}
            <button
              onClick={togglePlay}
              disabled={!!error || loadingUrl}
              className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPlaying ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              )}
            </button>

            {/* Volume Control */}
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
              </svg>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          <div className="text-white text-sm font-mono bg-red-600 px-3 py-1 rounded">
            PLAYBACK LOCKED AT 1.0x
          </div>
        </div>
      </div>
    </div>
  );
}
