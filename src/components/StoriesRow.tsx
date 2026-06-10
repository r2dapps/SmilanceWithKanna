import React, { useState, useEffect } from 'react';
import { X, Play, Pause, Heart, Flame, Check } from 'lucide-react';

interface StoriesRowProps {
  wish: string;
  dailyVerse: { ref: string; eng: string; tel: string };
  cycleStats: any;
  prayerStreak: number;
  flowerGrowth: number;
}

export default function StoriesRow({
  wish,
  dailyVerse,
  cycleStats,
  prayerStreak,
  flowerGrowth
}: StoriesRowProps) {
  const [activeStoryIdx, setActiveStoryIdx] = useState<number | null>(null);

  const stories = [
    {
      id: 'wish',
      label: "Today's Wish",
      emoji: '🌸',
      gradient: 'from-pink-400 to-rose-500',
      title: 'Wish for Smiley',
      content: (
        <div className="flex flex-col items-center justify-center text-center h-full gap-4 px-4">
          <Heart className="w-12 h-12 text-rose-500 fill-rose-500 animate-pulse" />
          <p className="font-serif text-lg italic text-indigo-900 leading-relaxed font-semibold">
            "{wish}"
          </p>
          <p className="text-xs text-rose-600 font-bold uppercase tracking-wider">
            — From Kanna ❤️
          </p>
        </div>
      )
    },
    {
      id: 'word',
      label: 'Daily Word',
      emoji: '📖',
      gradient: 'from-purple-400 to-indigo-600',
      title: 'Bilingual Blessing',
      content: (
        <div className="flex flex-col items-center justify-center text-center h-full gap-5 px-4 overflow-y-auto pt-4">
          <Heart className="w-10 h-10 text-violet-600 animate-pulse fill-violet-600" />
          <p className="font-serif text-base italic text-indigo-900 leading-relaxed font-semibold">
            "{dailyVerse.eng}"
          </p>
          <p className="font-serif text-base text-indigo-800 leading-relaxed">
            "{dailyVerse.tel}"
          </p>
          <span className="text-xs font-bold text-violet-700 bg-violet-100 px-3 py-1 rounded-full">
            {dailyVerse.ref}
          </span>
        </div>
      )
    },
    {
      id: 'cycle',
      label: 'Cycle status',
      emoji: '🩸',
      gradient: 'from-red-400 to-rose-600',
      title: 'Your Health Status',
      content: (
        <div className="flex flex-col items-center justify-center text-center h-full gap-4 px-4">
          <div className="bg-red-50 p-4 rounded-3xl border border-red-200">
            <span className="text-4xl">🩸</span>
          </div>
          <h4 className="text-base font-bold text-red-700">
            {cycleStats ? cycleStats.phase : 'Not configured yet'}
          </h4>
          <p className="text-xs text-gray-600 leading-relaxed italic px-2">
            {cycleStats ? cycleStats.message : "Configure parameters in the 'Cycle' tab to see daily comfort logs."}
          </p>
          {cycleStats && (
            <div className="mt-2 text-xs bg-red-100 text-red-800 px-3 py-1 rounded-full font-bold">
              Cycle Day {cycleStats.currentCycleDay} of {cycleStats.daysUntilNextPeriod} days remaining
            </div>
          )}
        </div>
      )
    },
    {
      id: 'streak',
      label: 'Prayer Streak',
      emoji: '🙏',
      gradient: 'from-amber-400 to-orange-500',
      title: 'Our Faith Goal',
      content: (
        <div className="flex flex-col items-center justify-center text-center h-full gap-4 px-4">
          <Flame className="w-14 h-14 text-orange-500 fill-orange-500 animate-bounce" />
          <p className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
            {prayerStreak} Days Active
          </p>
          <p className="text-xs text-gray-600 leading-relaxed px-4">
            "For where two or three gather in My name, there am I with them." (Matthew 18:20)
          </p>
          <p className="text-xs text-indigo-700 font-bold bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            Logging daily prayers together 🙏
          </p>
        </div>
      )
    },
    {
      id: 'garden',
      label: 'Rose growth',
      emoji: '🌹',
      gradient: 'from-emerald-400 to-teal-600',
      title: 'Love Seed Progress',
      content: (
        <div className="flex flex-col items-center justify-center text-center h-full gap-4 px-4">
          <div className="text-5xl">🌹</div>
          <p className="text-sm font-bold text-emerald-700">
            Current Rose Growth: {flowerGrowth}%
          </p>
          <div className="w-48 bg-gray-200 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full" style={{ width: `${flowerGrowth}%` }}></div>
          </div>
          <p className="text-xs text-gray-600 italic px-4">
            Water it in the 'Garden' tab to bloom a beautiful rose of complete love! 💧
          </p>
        </div>
      )
    }
  ];

  // Auto progression for stories
  useEffect(() => {
    if (activeStoryIdx === null) return;
    const timer = setTimeout(() => {
      if (activeStoryIdx < stories.length - 1) {
        setActiveStoryIdx(activeStoryIdx + 1);
      } else {
        setActiveStoryIdx(null);
      }
    }, 6000); // 6 seconds per story Slide

    return () => clearTimeout(timer);
  }, [activeStoryIdx]);

  return (
    <>
      <div className="stories-strip">
        {stories.map((s, idx) => (
          <div
            key={s.id}
            className="story-bubble"
            onClick={() => setActiveStoryIdx(idx)}
          >
            <div className="story-ring">
              <div className="story-inner">
                <span className="select-none text-2xl">{s.emoji}</span>
              </div>
            </div>
            <span className="story-title">{s.label}</span>
          </div>
        ))}
      </div>

      {activeStoryIdx !== null && (
        <div
          className="story-viewer-modal"
          onClick={() => setActiveStoryIdx(null)}
        >
          <div
            className="story-viewer-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'linear-gradient(135deg, #fff3f5 0%, #fffbe8 100%)',
              border: '2px solid rgba(255, 107, 139, 0.25)',
              color: '#3730a3'
            }}
          >
            {/* Slide load progress segments */}
            <div className="story-progress-bar">
              {stories.map((_, idx) => (
                <div key={idx} className="story-progress-segment">
                  <div
                    className={`story-progress-filled ${
                      idx < activeStoryIdx
                        ? 'w-full bg-rose-500'
                        : idx === activeStoryIdx
                        ? 'active'
                        : 'w-0'
                    }`}
                  />
                </div>
              ))}
            </div>

            {/* Header info */}
            <div className="flex items-center justify-between w-full mt-4 border-b border-rose-100/50 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold text-xs">
                  K
                </div>
                <div>
                  <div className="text-xs font-bold text-indigo-900 leading-none">kanna_smilance</div>
                  <span className="text-[9px] text-gray-500 tracking-wider">Anchored in Love ☁️</span>
                </div>
              </div>
              <button
                onClick={() => setActiveStoryIdx(null)}
                className="text-indigo-800 hover:text-rose-500 p-1 bg-white/60 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Slot Content */}
            <div className="flex-1 my-6 flex flex-col justify-center">
              {stories[activeStoryIdx].content}
            </div>

            {/* Bottom Actions footer */}
            <div className="w-full flex justify-between items-center bg-white/40 backdrop-blur-sm p-3 rounded-2xl border border-rose-200/50">
              <span className="text-xs font-semibold text-indigo-950">
                Story category: {stories[activeStoryIdx].title}
              </span>
              <div className="flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                <span className="text-xs text-rose-600 font-bold">1M likes</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
