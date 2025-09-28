export type Mood = 'happy' | 'sad' | 'relaxed' | 'energetic' | 'focused';

export interface Song {
  id: string;
  title: string;
  artist: string;
  coverImage: string;
  youtubeId: string;
  duration: string;
}

export interface MoodPlaylist {
  mood: Mood;
  name: string;
  description: string;
  songs: Song[];
}

export interface MusicPlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  volume: number;
  progress: number;
  currentPlaylist: Song[];
  currentIndex: number;
}