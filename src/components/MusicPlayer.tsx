import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { Song } from '@/types/music';

interface MusicPlayerProps {
  currentSong: Song | null;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  playlist: Song[];
  currentIndex: number;
}

export const MusicPlayer = ({
  currentSong,
  isPlaying,
  onPlay,
  onPause,
  onNext,
  onPrevious,
  playlist,
  currentIndex
}: MusicPlayerProps) => {
  const [volume, setVolume] = useState([50]);
  const [progress, setProgress] = useState([0]);
  const [duration, setDuration] = useState(0);
  const [apiReady, setApiReady] = useState(false);
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  console.log('MusicPlayer render:', { currentSong: currentSong?.title, isPlaying, apiReady });

  // Initialize YouTube API
  const initializeYouTubeAPI = useCallback(() => {
    console.log('Initializing YouTube API...');
    
    // Check if script already exists
    const existingScript = document.querySelector('script[src*="youtube.com/iframe_api"]');
    if (existingScript) {
      console.log('YouTube API script already exists');
      if ((window as any).YT && (window as any).YT.Player) {
        console.log('YouTube API already ready');
        setApiReady(true);
        return;
      }
    }

    // Set up global callback before loading script
    (window as any).onYouTubeIframeAPIReady = () => {
      console.log('YouTube API is ready!');
      setApiReady(true);
    };

    if (!existingScript) {
      console.log('Loading YouTube API script...');
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.async = true;
      tag.onload = () => console.log('YouTube API script loaded');
      tag.onerror = () => console.error('Failed to load YouTube API script');
      
      const firstScriptTag = document.getElementsByTagName('script')[0];
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      }
    }
  }, []);

  // Initialize API on mount
  useEffect(() => {
    initializeYouTubeAPI();
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {
          console.warn('Error destroying player:', e);
        }
        playerRef.current = null;
      }
    };
  }, [initializeYouTubeAPI]);

  // Create YouTube player when song changes and API is ready
  useEffect(() => {
    if (!currentSong || !apiReady || !(window as any).YT?.Player) {
      console.log('Cannot create player:', { currentSong: !!currentSong, apiReady, YT: !!(window as any).YT?.Player });
      return;
    }

    console.log('Creating YouTube player for:', currentSong.title);

    // Destroy existing player
    if (playerRef.current) {
      try {
        playerRef.current.destroy();
      } catch (e) {
        console.warn('Error destroying previous player:', e);
      }
      playerRef.current = null;
    }

    // Stop any existing progress tracking
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Reset progress
    setProgress([0]);
    setDuration(0);

    // Create new player
    try {
      playerRef.current = new (window as any).YT.Player('youtube-player', {
        height: '1',
        width: '1',
        videoId: currentSong.youtubeId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          showinfo: 0,
        },
        events: {
          onReady: (event: any) => {
            console.log('Player ready for:', currentSong.title);
            const player = event.target;
            const videoDuration = player.getDuration();
            setDuration(videoDuration);
            player.setVolume(volume[0]);
            
            if (isPlaying) {
              console.log('Auto-playing...');
              player.playVideo();
            }
          },
          onStateChange: (event: any) => {
            const state = event.data;
            console.log('Player state changed:', state);
            
            if (state === (window as any).YT.PlayerState.PLAYING) {
              startProgressTracking();
            } else if (state === (window as any).YT.PlayerState.PAUSED) {
              stopProgressTracking();
            } else if (state === (window as any).YT.PlayerState.ENDED) {
              console.log('Song ended, moving to next...');
              stopProgressTracking();
              onNext();
            }
          },
          onError: (event: any) => {
            console.error('YouTube player error:', event.data);
            // Try next song on error
            onNext();
          }
        },
      });
    } catch (error) {
      console.error('Failed to create YouTube player:', error);
    }
  }, [currentSong, apiReady, volume]);

  // Handle play/pause
  useEffect(() => {
    if (!playerRef.current) return;

    try {
      if (isPlaying) {
        console.log('Playing video...');
        playerRef.current.playVideo();
      } else {
        console.log('Pausing video...');
        playerRef.current.pauseVideo();
      }
    } catch (error) {
      console.error('Error controlling playback:', error);
    }
  }, [isPlaying]);

  // Handle volume changes
  useEffect(() => {
    if (playerRef.current) {
      try {
        playerRef.current.setVolume(volume[0]);
      } catch (error) {
        console.error('Error setting volume:', error);
      }
    }
  }, [volume]);

  const startProgressTracking = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime && playerRef.current.getDuration) {
        try {
          const currentTime = playerRef.current.getCurrentTime();
          const videoDuration = playerRef.current.getDuration();
          if (videoDuration > 0) {
            const progressPercent = (currentTime / videoDuration) * 100;
            setProgress([Math.min(progressPercent, 100)]);
          }
        } catch (error) {
          console.warn('Error updating progress:', error);
        }
      }
    }, 1000);
  }, []);

  const stopProgressTracking = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const handleSeek = useCallback((value: number[]) => {
    if (playerRef.current && duration > 0) {
      try {
        const seekTime = (value[0] / 100) * duration;
        playerRef.current.seekTo(seekTime, true);
        setProgress(value);
      } catch (error) {
        console.error('Error seeking:', error);
      }
    }
  }, [duration]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentSong) return null;

  return (
    <>
      {/* Hidden YouTube player */}
      <div id="youtube-player" style={{ display: 'none' }} />
      
      {/* Music Player UI */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-lg border-t border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Song Info */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <img
                src={currentSong.coverImage}
                alt={`${currentSong.title} by ${currentSong.artist}`}
                className="w-12 h-12 rounded-lg object-cover"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  // Try alternative YouTube thumbnail first
                  if (!img.src.includes('hqdefault')) {
                    img.src = `https://img.youtube.com/vi/${currentSong.youtubeId}/hqdefault.jpg`;
                  } else {
                    // Fallback to placeholder
                    img.src = `https://via.placeholder.com/48x48/666/fff?text=${encodeURIComponent(currentSong.title.charAt(0))}`;
                  }
                }}
              />
              <div className="min-w-0 flex-1">
                <h4 className="text-white font-medium truncate">{currentSong.title}</h4>
                <p className="text-white/70 text-sm truncate">{currentSong.artist}</p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <Button
                onClick={onPrevious}
                size="icon"
                variant="ghost"
                className="text-white hover:text-white hover:bg-white/20"
                disabled={currentIndex === 0}
              >
                <SkipBack className="h-5 w-5" />
              </Button>
              
              <Button
                onClick={isPlaying ? onPause : onPlay}
                size="icon"
                className="bg-white text-black hover:bg-white/90"
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5 ml-0.5" />
                )}
              </Button>

              <Button
                onClick={onNext}
                size="icon"
                variant="ghost"
                className="text-white hover:text-white hover:bg-white/20"
                disabled={currentIndex === playlist.length - 1}
              >
                <SkipForward className="h-5 w-5" />
              </Button>
            </div>

            {/* Volume Control */}
            <div className="hidden md:flex items-center gap-2 w-32">
              <Volume2 className="h-4 w-4 text-white" />
              <Slider
                value={volume}
                onValueChange={setVolume}
                max={100}
                step={1}
                className="flex-1"
              />
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-3 flex items-center gap-3">
            <span className="text-white/70 text-xs min-w-0">
              {formatTime((progress[0] / 100) * duration)}
            </span>
            <Slider
              value={progress}
              onValueChange={handleSeek}
              max={100}
              step={0.1}
              className="flex-1"
            />
            <span className="text-white/70 text-xs min-w-0">
              {formatTime(duration)}
            </span>
          </div>
        </div>
      </div>
    </>
  );
};