import React, { useState, useEffect, useRef } from 'react';
import {
  Heart,
  Info,
  Home,
  Music,
  BookHeart,
  Settings,
  CalendarHeart,
  HeartPulse,
  Circle,
  Route,
  Mail,
  Gamepad2,
  Lock
} from 'lucide-react';
import { FaHeart, FaRegHeart, FaHeartbeat } from 'react-icons/fa';
import { GiHeartWings, GiHeartBottle } from 'react-icons/gi';
import { FiHeart } from 'react-icons/fi';

import CycleSection from './components/CycleSection';
import MusicSection from './components/MusicSection';
import BibleSection from './components/BibleSection';
import SettingsSection from './components/SettingsSection';
import JourneySection from './components/JourneySection';
import GamesSection from './components/GamesSection';

import { 
  playTapChime,
  playScreenTapChime,
  playPinChime, 
  playSuccessChime, 
  playErrorChime 
} from './utils/sound';

import {
  DAILY_QUOTES,
  BIBLE_VERSES
} from './data';

export default function App() {
  const [appUnlocked, setAppUnlocked] = useState(() => {
    const isPinEnabled = localStorage.getItem('smilance_pin_enabled') !== 'false';
    if (!isPinEnabled) return true;
    return sessionStorage.getItem('smilance_unlocked') === 'true';
  });
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [appPin, setAppPin] = useState('');
  const [appPinError, setAppPinError] = useState(false);

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPwaBanner, setShowPwaBanner] = useState(() => {
    return !localStorage.getItem('smilance_pwa_dismissed');
  });

  const [activeTab, setActiveTab] = useState<'home' | 'radio' | 'cycle' | 'bible' | 'settings' | 'journey' | 'games'>('home');

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!localStorage.getItem('smilance_pwa_dismissed')) {
        setShowPwaBanner(true);
      }
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPwaBanner(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleLaterClick = () => {
    setShowPwaBanner(false);
    localStorage.setItem('smilance_pwa_dismissed', 'true');
  };
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const [showWish, setShowWish] = useState(false);
  const [wish, setWish] = useState('');
  
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('smilance_theme_color') || 'dark';
    return saved === 'light' ? 'dark' : saved;
  });
  const [currentEffect, setCurrentEffect] = useState(() => localStorage.getItem('smilance_effect') || 'hearts');

  const [toast, setToast] = useState<{ message: string; visible: boolean; id: string } | null>(null);

  const showGlobalToast = (message: string) => {
    setToast({ message, visible: true, id: Date.now().toString() });
  };

  useEffect(() => {
    (window as any).showSmilanceToast = showGlobalToast;
    return () => {
      delete (window as any).showSmilanceToast;
    };
  }, []);

  useEffect(() => {
    if (toast && toast.visible) {
      const t = setTimeout(() => {
        setToast(prev => prev ? { ...prev, visible: false } : null);
      }, 2500);
      return () => clearTimeout(t);
    }
  }, [toast]);

  // Shared States (Cycle & Vault)
  const [lastPeriodDate, setLastPeriodDate] = useState(() => localStorage.getItem('smilance_last_period') || '');
  const [cycleLength, setCycleLength] = useState(() => parseInt(localStorage.getItem('smilance_cycle_length') || '28', 10));
  const [periodDuration, setPeriodDuration] = useState(() => parseInt(localStorage.getItem('smilance_period_duration') || '5', 10));
  const [cycleSymptoms, setCycleSymptoms] = useState(() => JSON.parse(localStorage.getItem('smilance_cycle_symptoms') || '{}'));

  // Heart Effects
  const [tapHearts, setTapHearts] = useState<any[]>([]);
  const [bgHearts, setBgHearts] = useState<any[]>([]);

  // Music Player States
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentSongIdx, setCurrentSongIdx] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeProgress, setCurrentTimeProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(e => console.log(e));
    }
  };

  const handleNextTrack = () => setCurrentSongIdx(p => p + 1);
  const handlePrevTrack = () => setCurrentSongIdx(p => Math.max(1, p - 1));

  const handleAudioError = () => {
    // If the song doesn't exist, loop back to the first song.
    setCurrentSongIdx(1);
    setIsPlaying(false); 
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play().catch(e => console.log(e));
      }
    }
  }, [currentSongIdx]);

  const [secondHearts, setSecondHearts] = useState<{id: string}[]>([]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsAppLoading(false);
    }, 2000);
    return () => clearTimeout(timeout);
  }, []);
  // Clock Update
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      setSecondHearts(prev => [...prev.slice(-3), { id: Date.now().toString() }]);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Apply Theme CSS variables
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
       root.style.setProperty('--bg-top', '#15060b');
       root.style.setProperty('--bg-bottom', '#241119');
       root.style.setProperty('--card-border', 'rgba(244, 63, 94, 0.15)');
       root.style.setProperty('--accent-color', '#e11d48');
       root.style.setProperty('--accent-light', 'rgba(244, 63, 94, 0.15)');
       root.style.setProperty('--accent-text', '#fda4af');
    } else if (theme === 'midnight') {
       root.style.setProperty('--bg-top', '#0b0c15');
       root.style.setProperty('--bg-bottom', '#171124');
       root.style.setProperty('--card-border', 'rgba(168, 85, 247, 0.15)');
       root.style.setProperty('--accent-color', '#9333ea');
       root.style.setProperty('--accent-light', 'rgba(168, 85, 247, 0.15)');
       root.style.setProperty('--accent-text', '#d8b4fe');
    } else if (theme === 'ocean') {
       root.style.setProperty('--bg-top', '#03111a');
       root.style.setProperty('--bg-bottom', '#0f2231');
       root.style.setProperty('--card-border', 'rgba(56, 189, 248, 0.15)');
       root.style.setProperty('--accent-color', '#0284c7');
       root.style.setProperty('--accent-light', 'rgba(56, 189, 248, 0.15)');
       root.style.setProperty('--accent-text', '#7dd3fc');
    } else if (theme === 'emerald') {
       root.style.setProperty('--bg-top', '#02130c');
       root.style.setProperty('--bg-bottom', '#0b2416');
       root.style.setProperty('--card-border', 'rgba(52, 211, 153, 0.15)');
       root.style.setProperty('--accent-color', '#059669');
       root.style.setProperty('--accent-light', 'rgba(52, 211, 153, 0.15)');
       root.style.setProperty('--accent-text', '#6ee7b7');
    } else if (theme === 'gold') {
       root.style.setProperty('--bg-top', '#1a1003');
       root.style.setProperty('--bg-bottom', '#31200f');
       root.style.setProperty('--card-border', 'rgba(251, 191, 36, 0.15)');
       root.style.setProperty('--accent-color', '#d97706');
       root.style.setProperty('--accent-light', 'rgba(251, 191, 36, 0.15)');
       root.style.setProperty('--accent-text', '#fcd34d');
    } else if (theme === 'sunset') {
       root.style.setProperty('--bg-top', '#1f0d06');
       root.style.setProperty('--bg-bottom', '#291108');
       root.style.setProperty('--card-border', 'rgba(249, 115, 22, 0.15)');
       root.style.setProperty('--accent-color', '#ea580c');
       root.style.setProperty('--accent-light', 'rgba(249, 115, 22, 0.15)');
       root.style.setProperty('--accent-text', '#fdba74');
    } else if (theme === 'sakura') {
       root.style.setProperty('--bg-top', '#1a0b12');
       root.style.setProperty('--bg-bottom', '#26121b');
       root.style.setProperty('--card-border', 'rgba(244, 114, 182, 0.15)');
       root.style.setProperty('--accent-color', '#db2777');
       root.style.setProperty('--accent-light', 'rgba(244, 114, 182, 0.15)');
       root.style.setProperty('--accent-text', '#f9a8d4');
    } else if (theme === 'lavender') {
       root.style.setProperty('--bg-top', '#10061a');
       root.style.setProperty('--bg-bottom', '#1c092e');
       root.style.setProperty('--card-border', 'rgba(192, 132, 252, 0.15)');
       root.style.setProperty('--accent-color', '#c084fc');
       root.style.setProperty('--accent-light', 'rgba(192, 132, 252, 0.15)');
       root.style.setProperty('--accent-text', '#e9d5ff');
    } else if (theme === 'candy') {
       root.style.setProperty('--bg-top', '#1a0208');
       root.style.setProperty('--bg-bottom', '#300410');
       root.style.setProperty('--card-border', 'rgba(244, 63, 94, 0.2)');
       root.style.setProperty('--accent-color', '#e11d48');
       root.style.setProperty('--accent-light', 'rgba(244, 63, 94, 0.15)');
       root.style.setProperty('--accent-text', '#fecdd3');
    } else if (theme === 'light') {
       root.style.setProperty('--bg-top', '#ffffff');
       root.style.setProperty('--bg-bottom', '#ffe4e6');
       root.style.setProperty('--card-border', 'rgba(251, 113, 133, 0.15)');
       root.style.setProperty('--accent-color', '#e11d48');
       root.style.setProperty('--accent-light', 'rgba(251, 113, 133, 0.15)');
       root.style.setProperty('--accent-text', '#fda4af');
    }
    localStorage.setItem('smilance_theme_color', theme);
  }, [theme]);

  // Daily Data Logic
  useEffect(() => {
    const start = new Date(currentTime.getFullYear(), 0, 0);
    const diff = currentTime.getTime() - start.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

    setWish(DAILY_QUOTES[dayOfYear % DAILY_QUOTES.length]);
  }, []);

  // Background Hearts Spawner
  useEffect(() => {
    const generateBgHeart = () => {
      setBgHearts(prev => [...prev.slice(-8), {
        id: Math.random(),
        left: Math.random() * 100,
        scale: Math.random() * 0.4 + 0.3,
        duration: Math.random() * 8 + 8,
        delay: Math.random() * 5
      }]);
    };
    const interval = setInterval(generateBgHeart, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleScreenTap = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a') || target.closest('nav') || target.closest('input')) return;
    
    playScreenTapChime();

    const id = Math.random();
    const newHeart = {
      id,
      x: e.clientX,
      y: e.clientY,
      rotation: Math.random() * 60 - 30,
      scale: Math.random() * 0.5 + 0.5,
      variant: Math.floor(Math.random() * 5)
    };
    setTapHearts(prev => [...prev.slice(-10), newHeart]);
    setTimeout(() => {
      setTapHearts(prev => prev.filter(h => h.id !== id));
    }, 1200);
  };

  const timeStr = currentTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const dateStr = currentTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  
  const displayHours = currentTime.getHours() % 12 || 12;
  const displayMinutes = currentTime.getMinutes().toString().padStart(2, '0');
  const displaySeconds = currentTime.getSeconds().toString().padStart(2, '0');
  const displayAmPm = currentTime.getHours() >= 12 ? 'PM' : 'AM';

  const getEffectIcon = ({ id, ...rest }: any) => {
    if (currentEffect === 'none') return null;
    if (currentEffect === 'magic') {
      const items = ['🍬', '🍫', '💋', '❤️', '💝'];
      const item = items[Math.floor(id * 1000) % items.length];
      if (item === '❤️' || item === '💝') {
        return <Heart key={id} {...rest} strokeWidth={1.5} className={`${rest.className} fill-current`} style={rest.style} />;
      }
      return <span key={id} {...rest} className={`${rest.className} flex items-center justify-center text-xs`} style={{...rest.style, color: undefined}}>{item}</span>;
    }
    if (currentEffect === 'stars') {
      const items = ['💋', '💖', '🍫', '💝', '🍬'];
      const item = items[Math.floor(id * 1000) % items.length];
      if (item === '💖' || item === '💝') {
        return <Heart key={id} {...rest} strokeWidth={1.5} className={`${rest.className} fill-current`} style={rest.style} />;
      }
      return <span key={id} {...rest} className={`${rest.className} flex items-center justify-center text-xs`} style={{...rest.style, color: undefined}}>{item}</span>;
    }
    if (currentEffect === 'blossoms') return <span key={id} {...rest} className={`${rest.className} flex items-center justify-center text-xs opacity-70 drop-shadow-md`} style={{...rest.style, color: undefined}}>🌸</span>;
    if (currentEffect === 'heartPulse') return <HeartPulse key={id} {...rest} strokeWidth={1.5} className={`${rest.className} fill-rose-500`} />;
    if (currentEffect === 'bubbles') return <Circle key={id} {...rest} strokeWidth={1} className={`${rest.className} bg-current rounded-full`} />;
    
    // Auto match logic based on theme
    if (currentEffect === 'themeSync') {
      if (theme === 'sakura') {
        const isHeart = Math.floor(id * 1000) % 2 === 0;
        return isHeart ? (
          <Heart key={id} {...rest} strokeWidth={1.5} className={`${rest.className} fill-current`} />
        ) : (
          <span key={id} {...rest} className={`${rest.className} flex items-center justify-center text-xs drop-shadow-md opacity-80`} style={{...rest.style, color: undefined}}>🌸</span>
        );
      }
      if (theme === 'ocean') {
        return <Circle key={id} {...rest} strokeWidth={1} className={`${rest.className} bg-current rounded-full opacity-60`} />;
      }
      if (theme === 'candy') {
        const items = ['🍬', '🍫', '💋', '❤️', '💝'];
        const item = items[Math.floor(id * 1000) % items.length];
        if (item === '❤️' || item === '💝') {
          return <Heart key={id} {...rest} strokeWidth={1.5} className={`${rest.className} fill-current`} style={rest.style} />;
        }
        return <span key={id} {...rest} className={`${rest.className} flex items-center justify-center text-xs`} style={{...rest.style, color: undefined}}>{item}</span>;
      }
      if (theme === 'lavender') {
        const items = ['💜', '💖', '💋', '❤️'];
        const item = items[Math.floor(id * 1000) % items.length];
        if (item === '❤️') {
          return <Heart key={id} {...rest} strokeWidth={1.5} className={`${rest.className} fill-current`} style={rest.style} />;
        }
        return <span key={id} {...rest} className={`${rest.className} flex items-center justify-center text-xs`} style={{...rest.style, color: undefined}}>{item}</span>;
      }
      // default / dark / midnight / sunset / gold
      const items = ['❤️', '💝', '🍫', '💋', '💖'];
      const item = items[Math.floor(id * 1000) % items.length];
      if (item === '❤️' || item === '💝' || item === '💖') {
        return <Heart key={id} {...rest} strokeWidth={1.5} className={`${rest.className} fill-current`} style={rest.style} />;
      }
      return <span key={id} {...rest} className={`${rest.className} flex items-center justify-center text-xs`} style={{...rest.style, color: undefined}}>{item}</span>;
    }

    return <Heart key={id} {...rest} strokeWidth={1.5} className={`${rest.className} fill-current`} />;
  };

  if (isAppLoading) {
    return (
      <div className={`app-wrapper theme-${theme} flex flex-col items-center justify-center p-4`}>
        <div className="flex flex-col items-center justify-center animate-fadeIn">
           <div className="w-24 h-24 bg-rose-500/10 rounded-full flex flex-col items-center justify-center mb-6 shadow-[0_0_40px_rgba(244,63,94,0.3)] border border-rose-500/20 relative">
             <Heart className="w-12 h-12 text-rose-500 fill-rose-500 animate-pulse" />
           </div>
           <h2 className="text-4xl font-serif text-white mb-2 tracking-tight">Welcome, Smiley</h2>
           <p className="text-rose-300/80 tracking-widest uppercase text-sm font-bold animate-pulse mt-2">Initializing</p>
        </div>
      </div>
    );
  }

  if (!appUnlocked) {

    const handlePinPadClick = (digit: string) => {
      setAppPinError(false);
      playPinChime(digit);
      if (appPin.length < 4) {
        const newPin = appPin + digit;
        setAppPin(newPin);
        
        if (newPin.length === 4) {
          const correctPin = localStorage.getItem('smilance_pin') || '0809';
          if (newPin === correctPin) {
            playSuccessChime();
            setTimeout(() => {
              setAppUnlocked(true);
              sessionStorage.setItem('smilance_unlocked', 'true');
            }, 300);
          } else {
            playErrorChime();
            if (navigator.vibrate) navigator.vibrate([200]);
            setAppPinError(true);
            setTimeout(() => {
              setAppPin('');
              setAppPinError(false);
            }, 600);
          }
        }
      }
    };

    const handleDelete = () => {
      playTapChime();
      setAppPinError(false);
      setAppPin(prev => prev.slice(0, -1));
    };

    return (
      <div className={`app-wrapper theme-${theme} flex flex-col items-center justify-center p-4`}>
        <div className={`dark-card p-8 flex flex-col items-center w-full max-w-sm rounded-[2rem] shadow-[0_20px_60px_rgba(244,63,94,0.15)] mb-20 ${appPinError ? 'animate-shake border-red-500/50' : 'animate-fadeIn'}`}>
          <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mb-4 shadow-inner border border-rose-500/20">
            <Heart className="w-10 h-10 text-rose-500 fill-rose-500" />
          </div>
          <h2 className="text-3xl font-serif text-white mb-2 tracking-tight">Smilance</h2>
          <p className="text-gray-400 mb-6 text-sm uppercase tracking-widest font-bold">Encrypted Space</p>
          
          <div className="flex items-center justify-center gap-4 mb-2">
            {[0, 1, 2, 3].map((idx) => (
               <div key={idx} className="w-8 h-8 flex items-center justify-center">
                 {appPin.length > idx ? (
                   <div className={`w-4 h-4 rounded-full animate-fadeIn ${appPinError ? 'bg-red-500' : 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.6)]'}`} />
                 ) : (
                   <Heart className={`w-6 h-6 ${appPinError ? 'text-red-500/50' : 'text-white/20'}`} />
                 )}
               </div>
            ))}
          </div>
          <div className="h-4 mb-6 mt-1 text-center">
            {appPinError ? (
              <span className="text-[11px] text-red-500 font-bold uppercase tracking-widest animate-pulse">Incorrect PIN</span>
            ) : (
              <span className="text-[11px] text-gray-500 font-bold uppercase tracking-widest">Enter code to unlock</span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-6 mb-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button 
                key={num} 
                onClick={() => handlePinPadClick(num.toString())}
                className="w-14 h-14 relative flex items-center justify-center active:scale-95 transition-transform group"
              >
                <Heart className="absolute inset-0 w-full h-full text-rose-500/20 fill-rose-500/5 group-hover:text-rose-500/40 group-hover:fill-rose-500/20 transition-colors pointer-events-none" />
                <span className="relative text-2xl font-black text-white pointer-events-none">{num}</span>
              </button>
            ))}
            <div className="w-14 h-14"></div>
            <button 
              onClick={() => handlePinPadClick('0')}
              className="w-14 h-14 relative flex items-center justify-center active:scale-95 transition-transform group"
            >
              <Heart className="absolute inset-0 w-full h-full text-rose-500/20 fill-rose-500/5 group-hover:text-rose-500/40 group-hover:fill-rose-500/20 transition-colors pointer-events-none" />
              <span className="relative text-2xl font-black text-white pointer-events-none">0</span>
            </button>
            <button 
              onClick={handleDelete}
              className="w-14 h-14 relative flex items-center justify-center active:scale-95 transition-transform"
            >
              <span className="relative text-lg font-black text-rose-400">DEL</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`app-wrapper theme-${theme}`} onClick={handleScreenTap}>
      {/* Global Audio Player */}
      <audio
        ref={audioRef}
        src={`music/Love (${currentSongIdx}).mp3`}
        onTimeUpdate={() => audioRef.current && setCurrentTimeProgress(audioRef.current.currentTime)}
        onLoadedMetadata={() => audioRef.current && setDuration(audioRef.current.duration)}
        onEnded={handleNextTrack}
        onError={handleAudioError}
      />

      {/* Global Header */}
      <div className="sticky top-2 z-40 mx-4 mt-2">
        <div className="dark-card flex items-center justify-between p-3.5 bg-gradient-to-r from-[#1a0b12]/95 to-[#12050A]/95 backdrop-blur-xl border border-rose-500/20 rounded-[2rem] shadow-[0_8px_30px_rgba(244,63,94,0.15)] overflow-hidden relative">
          
          {/* Subtle light/glow effect */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-rose-400/30 to-transparent"></div>
          <div className="absolute -left-10 -top-10 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl"></div>

          <div className="flex items-center gap-2.5 z-10">
            <div className="relative flex items-center justify-center shrink-0 w-6 h-6 mr-0.5">
              {/* Concentric expanding background pulse rings matching Lub & Dub beats */}
              <div className="absolute w-4 h-4 bg-rose-500/35 rounded-full animate-lubEcho pointer-events-none"></div>
              <div className="absolute w-4 h-4 bg-rose-500/20 rounded-full animate-dubEcho pointer-events-none"></div>
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)] animate-lubdub z-10" />
            </div>
            <h1 className="font-serif text-[20px] text-rose-200 font-bold tracking-wide mt-0.5">Smilance</h1>
          </div>

          {/* ECG Heartbeat Line Scanner */}
          <div className="absolute bottom-0 left-0 right-0 h-3 overflow-hidden pointer-events-none opacity-40">
            <svg className="w-full h-full" viewBox="0 0 400 12" preserveAspectRatio="none">
              {/* Background faint path */}
              <path
                d="M 0 6 L 70 6 L 76 3 L 80 9 L 84 0 L 88 12 L 92 4 L 96 8 L 100 6 L 150 6 L 156 3 L 160 9 L 164 0 L 168 12 L 172 4 L 176 8 L 180 6 L 230 6 L 236 3 L 240 9 L 244 0 L 248 12 L 252 4 L 256 8 L 260 6 L 310 6 L 316 3 L 320 9 L 324 0 L 328 12 L 332 4 L 336 8 L 340 6 L 400 6"
                fill="none"
                stroke="var(--accent-light, rgba(244,63,94,0.15))"
                strokeWidth="1.2"
              />
              {/* Glowing animated path */}
              <path
                d="M 0 6 L 70 6 L 76 3 L 80 9 L 84 0 L 88 12 L 92 4 L 96 8 L 100 6 L 150 6 L 156 3 L 160 9 L 164 0 L 168 12 L 172 4 L 176 8 L 180 6 L 230 6 L 236 3 L 240 9 L 244 0 L 248 12 L 252 4 L 256 8 L 260 6 L 310 6 L 316 3 L 320 9 L 324 0 L 328 12 L 332 4 L 336 8 L 340 6 L 400 6"
                fill="none"
                stroke="var(--accent-color, #e11d48)"
                strokeWidth="1.6"
                strokeDasharray="100 500"
                className="animate-ecgScan"
                style={{ filter: 'drop-shadow(0 0 2px var(--accent-color, #e11d48))' }}
              />
            </svg>
          </div>

          <div className="flex flex-col items-end z-10">
            <div className="flex items-end gap-1">
              <div className="flex items-center gap-1 font-sans font-bold text-white tracking-tight leading-none text-[1.35rem]">
                {displayHours}
                <span className="animate-pulse duration-1000 mb-0.5">
                  <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 drop-shadow-[0_0_5px_rgba(244,63,94,0.5)]" />
                </span>
                {displayMinutes}
              </div>
              <div className="flex flex-col pb-0.5 ml-0.5 items-start">
                <span className="text-rose-400 font-black text-[9px] uppercase tracking-widest leading-none">{displayAmPm}</span>
                <span className="text-gray-400 font-bold text-[9px] tracking-wider leading-none mt-0.5">{displaySeconds}s</span>
              </div>
            </div>
            {secondHearts.map(h => (
              <Heart key={h.id} className="absolute right-2 bottom-1 w-2 h-2 text-rose-500/50 fill-rose-500/50 animate-floatUpAndFade" />
            ))}
          </div>
        </div>
      </div>

      {/* Dynamic Background Hearts */}
      {currentEffect !== 'none' && bgHearts.map(h => {
        const IconChild = getEffectIcon({
          id: h.id,
          className: "bg-heart-icon opacity-50",
          style: {
            left: `${h.left}%`,
            transform: `scale(${h.scale})`,
            animationDuration: `${h.duration}s`,
            animationDelay: `${h.delay}s`,
            color: 'var(--accent-color)'
          }
        });
        return IconChild;
      })}

      {/* Tap Effects */}
      {currentEffect !== 'none' && tapHearts.map(h => {
        let Icon = FaHeart;
        if (h.variant === 1) Icon = GiHeartWings;
        else if (h.variant === 2) Icon = GiHeartBottle;
        else if (h.variant === 3) Icon = FaHeartbeat;
        else if (h.variant === 4) Icon = FiHeart;

        const romanticColors = [
          '#f43f5e', // rose-500
          '#e11d48', // rose-600
          '#fb7185', // rose-400
          '#ec4899', // pink-500
          '#d946ef', // fuchsia-500
          '#be185d', // pink-700
          '#db2777', // pink-600
          '#9d174d', // pink-800
          '#fda4af', // rose-300
        ];
        
        const hColor = romanticColors[h.id % romanticColors.length];

        const IconComp = Icon as any;

        return (
          <div 
             key={h.id} 
             className="tap-heart-icon flex items-center justify-center opacity-80" 
             style={{
               left: h.x,
               top: h.y,
               transform: `translate(-50%, -50%) scale(${h.scale}) rotate(${h.rotation}deg)`,
               color: hColor
             }}>
             <IconComp className="w-6 h-6" />
          </div>
        );
      })}

      <div className="flex-1 p-4 pb-24 overflow-y-auto z-10 w-full relative">
        {activeTab === 'home' && (
          <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full animate-fadeIn pb-8">
            
            {/* 3. Touch My Heart Card */}
            <div className="dark-card flex flex-col items-center py-10 px-6 bg-black/40 text-center border-t-2 border-t-amber-500/30">
              <h3 className="font-serif text-[24px] text-amber-500 mb-6 font-semibold tracking-wide">
                Touch My Heart
              </h3>
              
              <button
                onClick={(e) => {
                  playSuccessChime();
                  const rect = e.currentTarget.getBoundingClientRect();
                  const cx = rect.left + rect.width / 2;
                  const cy = rect.top + rect.height / 2;
                  const bursts = Array.from({ length: 12 }).map((_, i) => ({
                    id: Math.random() + i,
                    x: cx + (Math.random() - 0.5) * 200,
                    y: cy + (Math.random() - 0.5) * 200,
                    rotation: Math.random() * 360,
                    scale: Math.random() * 0.8 + 0.5,
                    variant: Math.floor(Math.random() * 5)
                  }));
                  setTapHearts(prev => [...prev.slice(-30), ...bursts]);
                  setTimeout(() => {
                    const ids = new Set(bursts.map(b => b.id));
                    setTapHearts(prev => prev.filter(h => !ids.has(h.id)));
                  }, 1200);
                  setShowWish(!showWish);
                }}
                className="w-28 h-28 rounded-full bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center shadow-[0_0_40px_rgba(244,63,94,0.4)] transition-transform hover:scale-105 active:scale-95 mb-6 cursor-pointer"
              >
                <Heart className="w-12 h-12 text-white fill-white" />
              </button>
              
              <p className="text-sm text-gray-400 italic">
                Click to unlock today's message, Smiley
              </p>
            </div>

            {/* Hidden Wish Reveal */}
            {showWish && (
              <div className="dark-card border-t-2 border-t-rose-500 animate-fadeIn bg-[rgba(30,10,18,0.9)] py-8 px-6">
                 <h3 className="flex items-center justify-center gap-2 font-serif text-xl text-rose-400 mb-4">
                   <Heart className="w-5 h-5 fill-current text-rose-500" /> Today's Wish
                 </h3>
                 <p className="font-serif italic text-white/90 text-center text-lg md:text-xl leading-relaxed">
                   "{wish}"
                 </p>
              </div>
            )}

            {/* 4. Smiley's Arcade - Mini Game Card */}
            <div 
              onClick={() => setActiveTab('games')}
              className="dark-card flex items-center justify-between p-6 cursor-pointer hover:scale-[1.02] active:scale-95 transition-transform shadow-[0_10px_30px_rgba(244,63,94,0.15)] group"
            >
               <div className="flex items-center gap-5">
                 <div className="w-14 h-14 rounded-2xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30 group-hover:bg-amber-500/30 transition-colors shrink-0">
                   <Gamepad2 className="w-7 h-7 text-amber-400" />
                 </div>
                 <div className="text-left">
                   <h3 className="font-serif text-xl text-amber-500 font-bold">Smiley's Arcade</h3>
                   <p className="text-xs text-white/50 tracking-wider">PLAY A QUICK GAME 🎮</p>
                 </div>
               </div>
               <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 group-hover:translate-x-1 transition-all">
                 <span className="text-white/60 font-bold text-sm">→</span>
               </div>
            </div>
            
          </div>
        )}

        {/* Tab Routers for other functionalities requested implicitly */}
        {activeTab === 'games' && <GamesSection />}
        {activeTab === 'radio' && (
          <MusicSection 
            isPlaying={isPlaying}
            togglePlay={togglePlay}
            currentSongIdx={currentSongIdx}
            handleNext={handleNextTrack}
            handlePrev={handlePrevTrack}
            currentTimeProgress={currentTimeProgress}
            duration={duration}
            volume={volume}
            setVolume={setVolume}
            audioRef={audioRef}
          />
        )}
        {activeTab === 'cycle' && (
          <CycleSection 
            lastPeriodDate={lastPeriodDate}
            setLastPeriodDate={setLastPeriodDate}
            cycleLength={cycleLength}
            setCycleLength={setCycleLength}
            periodDuration={periodDuration}
            setPeriodDuration={setPeriodDuration}
            cycleSymptoms={cycleSymptoms}
            setCycleSymptoms={setCycleSymptoms}
          />
        )}
        {activeTab === 'bible' && <BibleSection />}
        {activeTab === 'journey' && <JourneySection />}
        {activeTab === 'settings' && (
          <SettingsSection 
            lastPeriodDate={lastPeriodDate}
            cycleLength={cycleLength}
            periodDuration={periodDuration}
            theme={theme}
            setTheme={setTheme}
            currentEffect={currentEffect}
            setCurrentEffect={setCurrentEffect}
          />
        )}

      </div>
      
      {/* PWA Install Banner */}
      {showPwaBanner && (
        <div className="fixed bottom-24 left-4 right-4 z-50 animate-fadeIn">
          <div className="dark-card p-4 rounded-3xl bg-[#12050A]/95 backdrop-blur-xl border border-rose-500/30 shadow-[0_10px_40px_rgba(244,63,94,0.3)]">
            <div className="flex gap-4 items-center">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-900 via-purple-900 to-rose-900 flex items-center justify-center p-0.5 shadow-inner flex-shrink-0">
                <div className="w-full h-full rounded-[10px] bg-black/40 flex items-center justify-center border border-white/10">
                  <Heart className="w-6 h-6 text-rose-400 fill-rose-500 drop-shadow-md" />
                </div>
              </div>
              <div>
                <h3 className="text-white font-bold text-[15px] font-serif tracking-wide mb-1">Install Smilance</h3>
                <p className="text-gray-400 text-[11px] leading-tight pr-2">Add to your home screen for quick daily wishes.</p>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button 
                onClick={handleLaterClick}
                className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-bold text-[13px] tracking-wide transition-colors"
               >
                 Later
              </button>
              <button 
                onClick={handleInstallClick}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-[13px] tracking-wide shadow-[0_0_15px_rgba(244,63,94,0.4)] transition-all active:scale-95"
               >
                 Install App
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Beautiful Pop-up Heart Toast Notification */}
      {toast && toast.visible && (
        <div className="fixed top-8 left-0 right-0 z-[250] flex justify-center pointer-events-none px-4">
          <div className="flex items-center justify-center gap-3 border border-rose-500/30 px-5 sm:px-6 py-2.5 sm:py-3.5 rounded-full shadow-[0_10px_45px_rgba(244,63,94,0.30)] backdrop-blur-xl max-w-[95vw] sm:max-w-md text-center pointer-events-auto animate-toastIn" style={{ backgroundColor: 'var(--bg-top, #12050A)' }}>
            <Heart className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-rose-500 fill-rose-500 animate-heartBeat shrink-0" />
            <span className="text-xs sm:text-xs font-bold tracking-wide leading-tight" style={{ color: 'var(--text-primary)' }}>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] sm:max-w-[480px] md:max-w-[720px] lg:max-w-[960px] xl:max-w-[1200px] bg-[#12050A]/95 backdrop-blur-2xl border-t border-rose-900/20 flex justify-around py-3 pb-8 md:pb-5 z-50 shadow-[0_-15px_40px_rgba(0,0,0,0.6)] md:rounded-t-[2rem] transition-all duration-300">
        {[
          { id: 'home', icon: Home, label: 'Home' },
          { id: 'radio', icon: Music, label: 'Radio' },
          { id: 'cycle', icon: CalendarHeart, label: 'Cycle' },
          { id: 'journey', icon: Route, label: 'Journey' },
          { id: 'bible', icon: BookHeart, label: 'Bible' },
          { id: 'settings', icon: Settings, label: 'Settings' }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button 
              key={tab.id}
              onClick={() => {
                playTapChime();
                setActiveTab(tab.id as any);
              }} 
              className={`flex flex-col items-center justify-center gap-1.5 transition-all duration-300 w-16 cursor-pointer ${
                isActive 
                  ? 'text-rose-500 drop-shadow-[0_0_10px_rgba(244,63,94,0.6)] scale-105' 
                  : 'text-white/40 hover:text-white/60 hover:scale-105'
              }`}
            >
               <Icon className={`w-6 h-6 transition-transform duration-300 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
               <span className={`text-[10px] tracking-wide ${isActive ? 'font-bold' : 'font-medium'}`}>{tab.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  );
}
