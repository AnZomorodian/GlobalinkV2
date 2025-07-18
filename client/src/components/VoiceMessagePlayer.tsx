import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VoiceMessagePlayerProps {
  audioData: string;
  duration?: number;
  className?: string;
}

export function VoiceMessagePlayer({ audioData, duration, className = '' }: VoiceMessagePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(duration || 0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setTotalDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        await audio.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  const handleProgressClick = (e: React.MouseEvent) => {
    const audio = audioRef.current;
    const progress = progressRef.current;
    if (!audio || !progress) return;

    const rect = progress.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickPercent = clickX / rect.width;
    const newTime = clickPercent * totalDuration;
    
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercent = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  return (
    <div className={`flex items-center space-x-3 bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg max-w-xs ${className}`}>
      <audio ref={audioRef} preload="metadata">
        <source src={audioData} type="audio/wav" />
        <source src={audioData} type="audio/mpeg" />
        <source src={audioData} type="audio/ogg" />
      </audio>
      
      <Button
        size="sm"
        onClick={togglePlayPause}
        className="w-8 h-8 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-lg transition-all duration-200"
      >
        {isPlaying ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4 ml-0.5" />
        )}
      </Button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 mb-1">
          <Volume2 className="w-3 h-3 text-gray-500" />
          <span className="text-xs text-gray-500">
            {formatTime(currentTime)} / {formatTime(totalDuration)}
          </span>
        </div>
        
        <div
          ref={progressRef}
          className="w-full h-2 bg-gray-200 rounded-full cursor-pointer overflow-hidden"
          onClick={handleProgressClick}
        >
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-200 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}