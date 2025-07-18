import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Download, Volume2 } from 'lucide-react';

interface VoiceMessagePlayerProps {
  audioData: string;
  duration: number;
  isOwn?: boolean;
}

export default function VoiceMessagePlayer({ audioData, duration, isOwn = false }: VoiceMessagePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioLoaded, setAudioLoaded] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    const audio = new Audio(audioData);
    audioRef.current = audio;
    
    const handleLoadedData = () => setAudioLoaded(true);
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    
    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    
    return () => {
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
  }, [audioData]);

  const togglePlayback = () => {
    if (!audioRef.current || !audioLoaded) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = audioData;
    link.download = `voice-message-${Date.now()}.webm`;
    link.click();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={`flex items-center space-x-3 p-3 rounded-2xl ${
      isOwn 
        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white' 
        : 'bg-white border border-gray-200'
    }`}>
      {/* Play/Pause Button */}
      <Button
        onClick={togglePlayback}
        disabled={!audioLoaded}
        size="sm"
        className={`w-10 h-10 p-0 rounded-full ${
          isOwn 
            ? 'bg-white/20 hover:bg-white/30 text-white' 
            : 'bg-blue-100 hover:bg-blue-200 text-blue-600'
        }`}
      >
        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
      </Button>

      {/* Waveform / Progress */}
      <div className="flex-1 space-y-1">
        <div className="flex items-center space-x-2">
          <Volume2 className={`w-4 h-4 ${isOwn ? 'text-white' : 'text-blue-600'}`} />
          <Badge 
            variant="secondary" 
            className={`text-xs ${
              isOwn 
                ? 'bg-white/20 text-white border-white/30' 
                : 'bg-blue-100 text-blue-800 border-blue-200'
            }`}
          >
            Voice Message
          </Badge>
        </div>
        
        <div className="flex items-center space-x-2">
          <Progress 
            value={progress} 
            className={`flex-1 h-1 ${
              isOwn ? 'bg-white/20' : 'bg-gray-200'
            }`}
          />
          <span className={`text-xs ${isOwn ? 'text-white/80' : 'text-gray-500'}`}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Download Button */}
      <Button
        onClick={handleDownload}
        size="sm"
        variant="ghost"
        className={`w-8 h-8 p-0 ${
          isOwn 
            ? 'hover:bg-white/20 text-white' 
            : 'hover:bg-gray-100 text-gray-500'
        }`}
      >
        <Download className="w-3 h-3" />
      </Button>
    </div>
  );
}