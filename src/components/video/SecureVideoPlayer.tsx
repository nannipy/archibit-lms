'use client';

import { useRef, useEffect, useState } from 'react';
import { QuizMarker } from '@/types';

interface SecureVideoPlayerProps {
  lessonId: string;
  videoUrl: string;
  duration: number;
  maxViewedTime: number; // from DB
  quizMarkers: QuizMarker[];
  onProgress: (time: number) => void;
  onQuizTrigger: (marker: QuizMarker) => void;
  onPlayStateChange?: (isPlaying: boolean) => void;
}

export default function SecureVideoPlayer({
  lessonId,
  videoUrl,
  duration,
  maxViewedTime,
  quizMarkers,
  onProgress,
  onQuizTrigger,
  onPlayStateChange,
}: SecureVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const lastTimeRef = useRef(0);
  const triggeredQuizzesRef = useRef<Set<string>>(new Set());

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
  }, []);

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
  }, [maxViewedTime]);

  // ===== QUIZ MARKER DETECTION =====
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const checkQuizMarkers = () => {
      const currentTime = video.currentTime;
      
      for (const marker of quizMarkers) {
        // Check if we've reached a quiz marker (within 0.5s tolerance)
        if (
          Math.abs(currentTime - marker.timestamp) < 0.5 &&
          !triggeredQuizzesRef.current.has(marker.id)
        ) {
          // Pause video and trigger quiz
          video.pause();
          setIsPlaying(false);
          triggeredQuizzesRef.current.add(marker.id);
          onQuizTrigger(marker);
          break;
        }
      }
    };

    video.addEventListener('timeupdate', checkQuizMarkers);
    
    return () => {
      video.removeEventListener('timeupdate', checkQuizMarkers);
    };
  }, [quizMarkers, onQuizTrigger]);

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
      
      // Update max viewed time if we've progressed
      if (time > lastTimeRef.current) {
        lastTimeRef.current = time;
        onProgress(time);
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [onProgress]);

  // ===== PLAYBACK CONTROLS =====
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

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
    <div className="relative w-full max-w-5xl mx-auto bg-black rounded-lg overflow-hidden shadow-2xl">
      {/* Video Element */}
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full aspect-video"
        onContextMenu={handleContextMenu}
        controlsList="nodownload nofullscreen noremoteplayback"
        disablePictureInPicture
        playsInline
      />

      {/* Custom Controls */}
      <div className="bg-gradient-to-t from-black/80 to-transparent p-4">
        {/* Progress Bar */}
        <div className="mb-4">
          <input
            type="range"
            min="0"
            max={duration}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
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
              className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full transition-colors"
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
