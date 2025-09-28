import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause } from 'lucide-react';
import { Song } from '@/types/music';
import vinylPlaceholder from '@/assets/vinyl-placeholder.png';

interface SongCardProps {
  song: Song;
  isPlaying: boolean;
  isCurrentSong: boolean;
  onPlay: (song: Song) => void;
  onPause: () => void;
}

export const SongCard = ({ song, isPlaying, isCurrentSong, onPlay, onPause }: SongCardProps) => {
  const handlePlayPause = () => {
    if (isCurrentSong && isPlaying) {
      onPause();
    } else {
      onPlay(song);
    }
  };

  return (
    <Card className={`
      glass-card transition-smooth hover:scale-105 cursor-pointer group
      ${isCurrentSong ? 'ring-2 ring-white/50' : ''}
    `}>
      <CardContent className="p-4">
        <div className="relative mb-4">
          <img
            src={song.coverImage}
            alt={`${song.title} by ${song.artist}`}
            className="w-full aspect-square object-cover rounded-lg"
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              // Try alternative YouTube thumbnail first
              if (!img.src.includes('hqdefault') && !img.src.includes('vinyl-placeholder')) {
                img.src = `https://img.youtube.com/vi/${song.youtubeId}/hqdefault.jpg`;
              } else if (!img.src.includes('vinyl-placeholder')) {
                // Fallback to vinyl record placeholder
                img.src = vinylPlaceholder;
              }
            }}
            loading="lazy"
          />
          <Button
            onClick={handlePlayPause}
            size="icon"
            className={`
              absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
              w-16 h-16 rounded-full bg-white/90 hover:bg-white text-black
              opacity-0 group-hover:opacity-100 transition-smooth
              ${isCurrentSong && isPlaying ? 'opacity-100' : ''}
            `}
          >
            {isCurrentSong && isPlaying ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6 ml-1" />
            )}
          </Button>
        </div>
        
        <div className="text-center">
          <h3 className="font-semibold text-white mb-1 truncate" title={song.title}>
            {song.title}
          </h3>
          <p className="text-white/70 text-sm truncate" title={song.artist}>
            {song.artist}
          </p>
          <p className="text-white/50 text-xs mt-1">
            {song.duration}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};