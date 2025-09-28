import { useState, useEffect } from 'react';
import { MoodSelector } from '@/components/MoodSelector';
import { PlaylistView } from '@/components/PlaylistView';
import { MusicPlayer } from '@/components/MusicPlayer';
import { Mood, Song, MoodPlaylist } from '@/types/music';
import { moodPlaylists } from '@/data/playlists';

const Index = () => {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlaylist, setCurrentPlaylist] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Get URL parameters for direct mood access
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const moodParam = urlParams.get('mood') as Mood;
    if (moodParam && ['happy', 'sad', 'relaxed', 'energetic', 'focused'].includes(moodParam)) {
      setSelectedMood(moodParam);
    }
  }, []);

  // Update background based on selected mood
  useEffect(() => {
    const body = document.body;
    body.className = ''; // Clear existing classes
    
    if (selectedMood) {
      body.classList.add(`mood-${selectedMood}`);
    }
    
    return () => {
      body.className = '';
    };
  }, [selectedMood]);

  const handleMoodSelect = (mood: Mood) => {
    setSelectedMood(mood);
    const playlist = moodPlaylists.find(p => p.mood === mood);
    if (playlist) {
      setCurrentPlaylist(playlist.songs);
      setCurrentIndex(0);
    }
  };

  const handleSurpriseMe = () => {
    const moods: Mood[] = ['happy', 'sad', 'relaxed', 'energetic', 'focused'];
    const randomMood = moods[Math.floor(Math.random() * moods.length)];
    handleMoodSelect(randomMood);
  };

  const handlePlay = (song: Song) => {
    setCurrentSong(song);
    setIsPlaying(true);
    
    // Update current index
    const index = currentPlaylist.findIndex(s => s.id === song.id);
    if (index !== -1) {
      setCurrentIndex(index);
    }
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      handlePause();
    } else {
      setIsPlaying(true);
    }
  };

  const handleNext = () => {
    if (currentIndex < currentPlaylist.length - 1) {
      const nextIndex = currentIndex + 1;
      const nextSong = currentPlaylist[nextIndex];
      setCurrentSong(nextSong);
      setCurrentIndex(nextIndex);
      setIsPlaying(true);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      const prevSong = currentPlaylist[prevIndex];
      setCurrentSong(prevSong);
      setCurrentIndex(prevIndex);
      setIsPlaying(true);
    }
  };

  const handleBack = () => {
    setSelectedMood(null);
    // Update URL without mood parameter
    window.history.pushState({}, '', window.location.pathname);
  };

  const getCurrentPlaylist = (): MoodPlaylist | null => {
    return selectedMood ? moodPlaylists.find(p => p.mood === selectedMood) || null : null;
  };

  const currentPlaylistData = getCurrentPlaylist();

  return (
    <div className="min-h-screen transition-smooth">
      <div className="container mx-auto py-8 md:py-16">
        {!selectedMood ? (
          <MoodSelector
            selectedMood={selectedMood}
            onMoodSelect={handleMoodSelect}
            onSurpriseMe={handleSurpriseMe}
          />
        ) : currentPlaylistData ? (
          <PlaylistView
            playlist={currentPlaylistData}
            currentSong={currentSong}
            isPlaying={isPlaying}
            onPlay={handlePlay}
            onPause={handlePause}
            onBack={handleBack}
          />
        ) : null}
      </div>

      {/* Footer */}
      <footer className="text-center py-8 pb-24 text-white/60">
        <p>Made with ❤️ at a Hackathon</p>
      </footer>

      {/* Music Player */}
      {currentSong && (
        <MusicPlayer
          currentSong={currentSong}
          isPlaying={isPlaying}
          onPlay={handlePlayPause}
          onPause={handlePause}
          onNext={handleNext}
          onPrevious={handlePrevious}
          playlist={currentPlaylist}
          currentIndex={currentIndex}
        />
      )}
    </div>
  );
};

export default Index;