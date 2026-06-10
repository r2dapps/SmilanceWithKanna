import React, { useState, useEffect } from 'react';
import { BookOpen, Heart, Play, HandHeart, Flame } from 'lucide-react';
import { BIBLE_VERSES } from '../data';

export default function BibleSection() {
  const [dailyMode, setDailyMode] = useState(true);
  const [prayerStreak, setPrayerStreak] = useState(0);
  const [lastPrayed, setLastPrayed] = useState<string | null>(null);

  useEffect(() => {
    const streak = parseInt(localStorage.getItem('smilance_prayer_streak') || '0', 10);
    const last = localStorage.getItem('smilance_last_prayed');
    setPrayerStreak(streak);
    setLastPrayed(last);
  }, []);
  
  const today = new Date();
  const start = new Date(today.getFullYear(), 0, 0);
  const diff = today.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  const dailyVerse = BIBLE_VERSES[dayOfYear % BIBLE_VERSES.length];

  const handlePrayerStreak = () => {
    const todayStr = new Date().toDateString();
    if (lastPrayed === todayStr) {
      (window as any).showSmilanceToast?.("💖 We already prayed today! God is with us.");
      return;
    }

    const newStreak = prayerStreak + 1;
    setPrayerStreak(newStreak);
    setLastPrayed(todayStr);
    
    localStorage.setItem('smilance_prayer_streak', newStreak.toString());
    localStorage.setItem('smilance_last_prayed', todayStr);

    (window as any).showSmilanceToast?.(`🔥 Prayer Streak Logged: ${newStreak} days! Amen!`);
  };

  return (
    <div className="flex flex-col gap-4 relative z-10 text-left">
      <div className="dark-card !py-6 text-center border-b-4 border-b-purple-500 overflow-hidden relative">
        <div className="absolute -top-10 -right-10 opacity-10">
          <BookOpen className="w-48 h-48 text-purple-300" />
        </div>
        <Heart className="w-8 h-8 text-amber-400 fill-amber-400 mx-auto mb-3" />
        <h2 className="heading-title text-purple-300 text-2xl mb-1">Our Spiritual Space</h2>
        <p className="text-xs text-purple-200">A quiet corner for Smiley's soul.</p>
        
        {prayerStreak > 0 && (
          <div className="mt-4 flex items-center justify-center gap-2 bg-purple-500/20 px-3 py-1.5 rounded-full w-fit mx-auto border border-purple-400/30">
            <Flame className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-bold text-amber-100">{prayerStreak} Day Streak</span>
          </div>
        )}
      </div>

      <div className="dark-card border-l-4 border-l-amber-400 relative p-6 bg-gradient-to-br from-black/40 to-purple-900/10">
        <h3 className="flex items-center gap-2 font-serif text-[22px] text-amber-400 mb-6 font-bold">
           <BookOpen className="w-5 h-5" /> Verse of the Day
        </h3>
        <p className="text-[15px] font-bold font-serif italic text-white mb-6 leading-relaxed">
          "{dailyVerse.eng}"
        </p>
        <p className="text-[14px] font-serif text-white/80 mb-6 leading-relaxed">
          "{dailyVerse.tel}"
        </p>
        <p className="text-[11px] font-bold uppercase tracking-widest text-amber-500 text-right">
          — {dailyVerse.ref}
        </p>
      </div>

      <div className="dark-card p-6 bg-purple-900/10 border-purple-500/20">
        <h3 className="heading-title text-purple-300 flex items-center gap-2 mb-4">
          <HandHeart className="w-5 h-5 text-purple-400" /> Daily Prayer
        </h3>
        <p className="text-sm font-serif italic text-white/70 mb-5 leading-relaxed">
          Take a moment to close your eyes, breathe deeply, and surrender your worries to God. He loves you so much, Smiley.
        </p>
        <button onClick={handlePrayerStreak} className="w-full bg-purple-600 active:bg-purple-700 text-white font-bold p-3.5 rounded-xl shadow-[0_0_20px_rgba(147,51,234,0.3)] flex items-center justify-center gap-2 transition-transform active:scale-95">
          <HandHeart className="w-5 h-5" /> Amen. We Prayed Today.
        </button>
      </div>
    </div>
  );
}
