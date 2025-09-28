import { MoodPlaylist, Song } from '@/types/music';
import { SongCard } from './SongCard';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PlaylistViewProps {
  playlist: MoodPlaylist;
  currentSong: Song | null;
  isPlaying: boolean;
  onPlay: (song: Song) => void;
  onPause: () => void;
  onBack: () => void;
}

export const PlaylistView = ({
  playlist,
  currentSong,
  isPlaying,
  onPlay,
  onPause,
  onBack
}: PlaylistViewProps) => {
  const { toast } = useToast();

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}?mood=${playlist.mood}`;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copied!",
        description: `${playlist.name} playlist link copied to clipboard.`,
      });
    } catch (err) {
      toast({
        title: "Share failed",
        description: "Could not copy link to clipboard.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-6 pb-32">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Button
          onClick={onBack}
          variant="ghost"
          size="lg"
          className="text-white hover:text-white hover:bg-white/20"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Moods
        </Button>

        <Button
          onClick={handleShare}
          variant="outline"
          size="lg"
          className="glass-card bg-white/10 hover:bg-white/20 border-white/30 hover:border-white/50 text-white hover:text-white"
        >
          <Share2 className="h-5 w-5 mr-2" />
          Share Playlist
        </Button>
      </div>

      {/* Playlist Info */}
      <div className="text-center mb-12 animate-fade-in">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white">
          {playlist.name}
        </h1>
        <p className="text-lg md:text-xl text-white/80 mb-6">
          {playlist.description}
        </p>
        <p className="text-white/60">
          {playlist.songs.length} songs
        </p>
      </div>

      {/* Songs Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 animate-slide-up">
        {playlist.songs.map((song, index) => (
          <div
            key={song.id}
            className="animate-fade-in"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <SongCard
              song={song}
              isPlaying={isPlaying}
              isCurrentSong={currentSong?.id === song.id}
              onPlay={onPlay}
              onPause={onPause}
            />
          </div>
        ))}
      </div>
    </div>
  );
};