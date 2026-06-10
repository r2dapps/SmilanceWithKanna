import React from 'react';
import { Play, Pause, SkipForward, SkipBack, Music, Volume2, Radio } from 'lucide-react';

interface MusicSectionProps {
  isPlaying: boolean;
  togglePlay: () => void;
  currentSongIdx: number;
  handleNext: () => void;
  handlePrev: () => void;
  currentTimeProgress: number;
  duration: number;
  volume: number;
  setVolume: (val: number) => void;
  audioRef: React.RefObject<HTMLAudioElement>;
}

export default function MusicSection({
  isPlaying, togglePlay, currentSongIdx, handleNext, handlePrev,
  currentTimeProgress, duration, volume, setVolume, audioRef
}: MusicSectionProps) {
  
  const tracks = [
    { title: "Kanna's Anchor", artist: "Divine Strings" },
    { title: "Walking on Campus", artist: "Smiley Beats" },
    { title: "Sweet Midnight Talk", artist: "Acoustic Love" },
    { title: "Lost in Your Eyes", artist: "Divine Strings" },
    { title: "Always Yours", artist: "Smiley Beats" },
    { title: "Together Forever", artist: "Acoustic Love" },
    { title: "You Are My Sunshine", artist: "Divine Strings" },
    { title: "Safe in My Arms", artist: "Smiley Beats" },
    { title: "Beautiful Journey", artist: "Acoustic Love" },
  ];

  // currentTrack maps directly to currentSongIdx - 1
  const displayTrack = tracks[currentSongIdx - 1] || { title: `Love Melody #${currentSongIdx}`, artist: "Smilance Radio" };
  const trackProgress = duration > 0 ? (currentTimeProgress / duration) * 100 : 0;

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || duration === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;
    audioRef.current.currentTime = newTime;
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="dark-card text-left">
      <div className="flex justify-between items-center mb-6">
        <h3 className="heading-title text-xl text-rose-300 flex items-center gap-2">
          <Radio className="w-5 h-5 text-amber-500 animate-pulse" /> Smiley's Radio
        </h3>
        <span className="text-[10px] text-rose-400 font-bold border border-rose-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider">Live</span>
      </div>

      <div className="flex items-center gap-4 mb-8">
        <div className={`w-16 h-16 rounded-full bg-gradient-to-tr from-rose-600 to-purple-600 p-1 flex items-center justify-center shadow-[0_0_15px_rgba(244,63,94,0.4)] ${isPlaying?'animate-spin-slow':''}`}>
          <div className="w-14 h-14 bg-[#1b0a13] rounded-full flex items-center justify-center">
            <Music className="w-5 h-5 text-rose-400" />
          </div>
        </div>
        <div className="flex-1">
          <h4 className="text-white font-bold">{displayTrack.title}</h4>
          <p className="text-[11px] text-gray-400">{displayTrack.artist}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-[10px] font-mono text-gray-400 mb-2 mt-4 px-1">
        <span>{formatTime(currentTimeProgress)}</span>
        <div 
          className="flex-1 bg-white/5 h-1.5 rounded-full relative cursor-pointer"
          onClick={handleProgressClick}
        >
          <div className="bg-rose-500 h-full rounded-full relative pointer-events-none" style={{ width: `${trackProgress}%` }}>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow" />
          </div>
        </div>
        <span>{formatTime(duration)}</span>
      </div>

      <div className="flex justify-center items-center gap-8 mb-4 mt-6">
        <button onClick={handlePrev} className="text-white/70 hover:text-white">
          <SkipBack className="w-6 h-6 fill-current" />
        </button>
        <button onClick={togglePlay} className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-rose-600 hover:scale-105 transition shadow-lg shadow-white/10">
          {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
        </button>
        <button onClick={handleNext} className="text-white/70 hover:text-white">
          <SkipForward className="w-6 h-6 fill-current" />
        </button>
      </div>

      <div className="flex justify-center items-center gap-3 mt-6 text-gray-500">
        <Volume2 className="w-4 h-4" />
        <input type="range" min="0" max="1" step="0.1" value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} className="w-24 accent-rose-500" />
      </div>
    </div>
  );
}
