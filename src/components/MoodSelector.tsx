import { Button } from '@/components/ui/button';
import { Mood } from '@/types/music';
import { Sun, CloudRain, Leaf, Zap, Target, Shuffle } from 'lucide-react';

interface MoodSelectorProps {
  selectedMood: Mood | null;
  onMoodSelect: (mood: Mood) => void;
  onSurpriseMe: () => void;
}

const moodIcons = {
  happy: Sun,
  sad: CloudRain,
  relaxed: Leaf,
  energetic: Zap,
  focused: Target,
};

const moodLabels = {
  happy: 'Happy',
  sad: 'Sad',
  relaxed: 'Relaxed',
  energetic: 'Energetic',
  focused: 'Focused',
};

export const MoodSelector = ({ selectedMood, onMoodSelect, onSurpriseMe }: MoodSelectorProps) => {
  return (
    <div className="w-full max-w-4xl mx-auto px-6">
      <div className="text-center mb-12">
        <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent animate-fade-in">
          Moodify
        </h1>
        <p className="text-xl md:text-2xl text-white/80 mb-12 animate-fade-in">
          Music that matches your vibe.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {(Object.keys(moodIcons) as Mood[]).map((mood) => {
          const Icon = moodIcons[mood];
          const isSelected = selectedMood === mood;
          
          return (
            <Button
              key={mood}
              onClick={() => onMoodSelect(mood)}
              variant="outline"
              size="lg"
              className={`
                h-24 md:h-32 flex flex-col items-center justify-center gap-2 p-4
                glass-card transition-smooth border-white/20 hover:border-white/40
                ${isSelected 
                  ? 'bg-white/20 border-white/50 scale-105' 
                  : 'bg-white/10 hover:bg-white/15'
                }
                text-white hover:text-white animate-bounce-in
              `}
              style={{ animationDelay: `${Object.keys(moodIcons).indexOf(mood) * 0.1}s` }}
            >
              <Icon className="h-6 w-6 md:h-8 md:w-8" />
              <span className="text-sm md:text-base font-medium">
                {moodLabels[mood]}
              </span>
            </Button>
          );
        })}
      </div>

      <div className="text-center">
        <Button
          onClick={onSurpriseMe}
          variant="outline"
          size="lg"
          className="glass-card bg-white/10 hover:bg-white/20 border-white/30 hover:border-white/50 text-white hover:text-white transition-smooth animate-fade-in"
        >
          <Shuffle className="h-5 w-5 mr-2" />
          Surprise Me
        </Button>
      </div>
    </div>
  );
};