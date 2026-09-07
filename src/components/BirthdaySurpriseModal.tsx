import React, { useState, useEffect, useRef } from 'react';
import { Heart, X, ChevronRight, Mail, RefreshCw, Wind, Download } from 'lucide-react';
import Confetti from 'react-confetti';
import { toPng } from 'html-to-image';
import {
  playTapChime,
  playSuccessChime,
  playScreenTapChime
} from '../utils/sound';
import {
  BIRTHDAY_PORTAL_CONFIG,
  getRandomChallengeQuestions,
  BIRTHDAY_LETTER_DATA,
  BIRTHDAY_CAKE_DATA,
  ChallengeQuestion
} from '../birthdayData';

interface BirthdaySurpriseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BirthdaySurpriseModal({ isOpen, onClose }: BirthdaySurpriseModalProps) {
  // Scenes: 0 = Portal Gate, 1 = Romantic Whispers Quiz, 2 = 3D Love Letter, 3 = Birthday Cake & Wish
  const [currentScene, setCurrentScene] = useState<0 | 1 | 2 | 3>(0);

  // Scene 1: Randomized 3-Question State
  const [questions, setQuestions] = useState<ChallengeQuestion[]>(() => getRandomChallengeQuestions(3));
  const [questionIdx, setQuestionIdx] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [activeReaction, setActiveReaction] = useState<string | null>(null);
  const [isQuizFinished, setIsQuizFinished] = useState(false);

  // Scene 2: 3D Envelope & Handwritten Letter States
  const [envelopePhase, setEnvelopePhase] = useState<'summoning' | 'closed' | 'flap-open' | 'letter-emerging' | 'reading'>('summoning');
  const [sealCracked, setSealCracked] = useState(false);
  const [showCakeTrigger, setShowCakeTrigger] = useState(false);
  const [envelopeTeaseCount, setEnvelopeTeaseCount] = useState(0);
  const [envelopeTeaseMsg, setEnvelopeTeaseMsg] = useState<string | null>(null);
  const [envelopeDodge, setEnvelopeDodge] = useState({ x: 0, y: 0, rotate: 0 });
  const [isDodging, setIsDodging] = useState(false);
  const letterPaperRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadLetter = async () => {
    const el = letterPaperRef.current;
    if (!el || isDownloading) return;
    try {
      setIsDownloading(true);
      playTapChime();

      const dataUrl = await toPng(el, {
        quality: 0.98,
        pixelRatio: 2,
        backgroundColor: '#fffcf7',
        cacheBust: true,
        height: el.scrollHeight,
        filter: (node) => {
          if (node instanceof HTMLElement && node.classList.contains('no-export')) {
            return false;
          }
          return true;
        },
        style: {
          maxHeight: 'none',
          overflow: 'visible'
        }
      });

      const link = document.createElement('a');
      link.download = 'Kannas_Birthday_Letter_From_Nanna.png';
      link.href = dataUrl;
      link.click();
      playSuccessChime();
    } catch (err) {
      console.error('Failed to download letter image', err);
    } finally {
      setIsDownloading(false);
    }
  };

  // Scene 3: 3D Birthday Cake & Playful Multi-Blow States (4-5 blows)
  const [isCandleBlown, setIsCandleBlown] = useState(false);
  const [blowsNeeded, setBlowsNeeded] = useState<number>(() => Math.floor(Math.random() * 2) + 4); // 4 or 5 random blows
  const [blowCount, setBlowCount] = useState<number>(0);
  const [isBlowingWind, setIsBlowingWind] = useState<boolean>(false);
  const [playfulHint, setPlayfulHint] = useState<string | null>(null);
  const [confettiKey, setConfettiKey] = useState<number>(0);

  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 390,
    height: typeof window !== 'undefined' ? window.innerHeight : 844
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Explosive Confetti Cannon Burst
  const [burstParticles, setBurstParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    color: string;
    scale: number;
    rotation: number;
    duration: number;
    delay: number;
    isHeart: boolean;
  }>>([]);

  // Background floating ambient particles
  const [ambientHearts, setAmbientHearts] = useState<Array<{ id: number; left: number; delay: number; duration: number; scale: number }>>([]);
  const [petals, setPetals] = useState<Array<{ id: number; left: number; delay: number; duration: number; size: number }>>([]);

  useEffect(() => {
    if (isOpen) {
      // Spawn ambient floating stardust hearts
      const hearts = Array.from({ length: 12 }).map((_, i) => ({
        id: i,
        left: Math.random() * 92 + 4,
        delay: Math.random() * 4,
        duration: Math.random() * 6 + 6,
        scale: Math.random() * 0.4 + 0.5
      }));
      setAmbientHearts(hearts);

      // Spawn stylized anime petals
      const p = Array.from({ length: 14 }).map((_, i) => ({
        id: i,
        left: Math.random() * 95,
        delay: Math.random() * 5,
        duration: Math.random() * 6 + 7,
        size: Math.random() * 6 + 10
      }));
      setPetals(p);
    }
  }, [isOpen]);

  // Star Wars style galaxy zoom on Scene 2 entry
  useEffect(() => {
    if (currentScene === 2) {
      setEnvelopePhase('summoning');
      setSealCracked(false);
      setShowCakeTrigger(false);
      const timer = setTimeout(() => {
        setEnvelopePhase('closed');
      }, 2400);
      return () => clearTimeout(timer);
    }
  }, [currentScene]);

  // After letter unfolds, delay cake button by 3.2 seconds so she reads first!
  useEffect(() => {
    if (currentScene === 2 && envelopePhase === 'reading') {
      const timer = setTimeout(() => {
        setShowCakeTrigger(true);
      }, 3200);
      return () => clearTimeout(timer);
    }
  }, [currentScene, envelopePhase]);

  if (!isOpen) return null;

  const currentQ = questions[questionIdx] || questions[0];

  const handleSelectOption = (optId: string, reaction: string) => {
    playTapChime();
    setSelectedOptionId(optId);
    setActiveReaction(reaction);
  };

  const handleNextQuestion = () => {
    playSuccessChime();
    if (questionIdx < questions.length - 1) {
      setQuestionIdx(prev => prev + 1);
      setSelectedOptionId(null);
      setActiveReaction(null);
    } else {
      setIsQuizFinished(true);
    }
  };

  // Harry Potter style teasing letter & sequential 3D Envelope Opening sequence
  const handleOpenEnvelope = () => {
    if (envelopePhase !== 'closed') return;

    // Harry Potter letter teasing: on first 3 clicks, the letter swoops/dodges playfully!
    if (envelopeTeaseCount < 3) {
      const nextCount = envelopeTeaseCount + 1;
      setEnvelopeTeaseCount(nextCount);
      playScreenTapChime();
      setIsDodging(true);

      const dodges = [
        { x: -35, y: -20, rotate: -8, msg: "Whoosh! The letter swoops away playfully! Catch it, Kanna! 💌" },
        { x: 35, y: -24, rotate: 8, msg: "Almost! It's fluttering like a mischievous Hogwarts letter! 🕊️" },
        { x: 0, y: -15, rotate: -4, msg: "The ruby seal is glowing warm... one more touch breaks the magic seal! 💖" }
      ];

      const currentDodge = dodges[envelopeTeaseCount];
      setEnvelopeDodge({ x: currentDodge.x, y: currentDodge.y, rotate: currentDodge.rotate });
      setEnvelopeTeaseMsg(currentDodge.msg);

      setTimeout(() => {
        setIsDodging(false);
        setEnvelopeDodge({ x: 0, y: 0, rotate: 0 });
      }, 550);

      return;
    }

    // 4th click: The magic wax seal breaks!
    playSuccessChime();
    setSealCracked(true);
    setEnvelopeTeaseMsg(null);

    // 1. Seal cracks & flap flips upward
    setEnvelopePhase('flap-open');

    // 2. Paper slides up out of envelope pocket
    setTimeout(() => {
      setEnvelopePhase('letter-emerging');
    }, 650);

    // 3. Unfolds into full reading letter view
    setTimeout(() => {
      setEnvelopePhase('reading');
    }, 1450);
  };

  // Trigger explosive 65-particle confetti cannon
  const triggerConfettiCannon = () => {
    const colors = [
      '#f43f5e', '#fb7185', '#f59e0b', '#ec4899', '#d946ef',
      '#fda4af', '#fcd34d', '#38bdf8', '#c084fc', '#ffffff'
    ];
    const count = 65;
    const particles = Array.from({ length: count }).map((_, i) => {
      const angle = (Math.PI * 2 * i) / count + (Math.random() * 0.25 - 0.12);
      const speed = Math.random() * 240 + 80;
      const x = Math.cos(angle) * speed;
      const y = Math.sin(angle) * speed - (Math.random() * 100 + 40); // upward blast!

      return {
        id: i,
        x,
        y,
        color: colors[i % colors.length],
        scale: Math.random() * 0.6 + 0.7,
        rotation: Math.random() * 720 - 360,
        duration: Math.random() * 1.5 + 2.2,
        delay: Math.random() * 0.12,
        isHeart: i % 2 === 0
      };
    });
    setBurstParticles(particles);
  };

  // Playful multi-blow candle interaction (4-5 blows)
  const handleBlowOutCandle = () => {
    if (isCandleBlown) return;

    const nextBlow = blowCount + 1;
    setBlowCount(nextBlow);
    setIsBlowingWind(true);

    // Reset wind gust after animation
    setTimeout(() => {
      setIsBlowingWind(false);
    }, 550);

    if (nextBlow < blowsNeeded) {
      // Candle flame flickers wildly and resists playfully!
      playScreenTapChime();
      const hints = [
        "The flame flickers playfully! Take a deeper breath, my love... 🌬️",
        "It's bending in the wind! The flame wants to hear your wish! 💖",
        "Almost there! Close your pretty eyes and blow with all your heart, Kanna! 🥰",
        "One last giant breath—make your deepest birthday wish now! 🎂💖"
      ];
      setPlayfulHint(hints[(nextBlow - 1) % hints.length]);
    } else {
      // SUCCESS! Flame extinguishes with glorious confetti blast
      playSuccessChime();
      setIsCandleBlown(true);
      setConfettiKey(prev => prev + 1);
      setPlayfulHint(null);
      triggerConfettiCannon();
    }
  };

  const handleRelightCandle = () => {
    playTapChime();
    setIsCandleBlown(false);
    setBlowCount(0);
    setBlowsNeeded(Math.floor(Math.random() * 2) + 4); // Randomize 4 or 5 blows!
    setBurstParticles([]);
    setPlayfulHint(null);
  };

  return (
    <div className="fixed inset-0 z-[300] flex flex-col justify-between overflow-hidden animate-fadeIn select-none h-[100dvh]">
      <style>{`
        /* Star Wars Style Deep Galaxy Crawl Zoom (2.4s Majestic Flight) */
        @keyframes starWarsHeartGalaxyWarp {
          0% {
            transform: perspective(1200px) translateZ(-1600px) translateY(120px) scale(0.015) rotateX(28deg);
            opacity: 0;
            filter: blur(14px);
          }
          20% {
            opacity: 0.8;
            filter: blur(8px);
          }
          55% {
            transform: perspective(1200px) translateZ(-400px) translateY(30px) scale(0.4) rotateX(16deg);
            opacity: 0.95;
            filter: blur(2px);
          }
          80% {
            transform: perspective(1200px) translateZ(80px) translateY(-10px) scale(1.08) rotateX(4deg);
            opacity: 1;
            filter: blur(0px);
          }
          100% {
            transform: perspective(1200px) translateZ(0px) translateY(0px) scale(1) rotateX(0deg);
            opacity: 1;
            filter: blur(0px);
          }
        }

        /* Hyperspace Speed Trails */
        @keyframes starWarsSpeedTrail {
          0% { transform: scale(0.1); opacity: 0; }
          50% { transform: scale(1.6); opacity: 0.9; }
          100% { transform: scale(3.5); opacity: 0; }
        }

        /* Gentle Floating Hover on GPU */
        @keyframes animeFloatEnvelope {
          0%, 100% { transform: translateY(0px) rotateX(4deg) rotateZ(0deg); }
          50% { transform: translateY(-8px) rotateX(7deg) rotateZ(-1deg); }
        }

        /* Stylized Falling Petal Drift */
        @keyframes animePetalFall {
          0% { transform: translateY(-20px) translateX(0px) rotate(0deg); opacity: 0; }
          15% { opacity: 0.8; }
          50% { transform: translateY(50vh) translateX(30px) rotate(180deg); }
          100% { transform: translateY(105vh) translateX(-20px) rotate(360deg); opacity: 0; }
        }

        /* Living Candle Flame Flickering Shader (Anchored to wick at 0,0) */
        @keyframes livingFlameFlicker {
          0%, 100% { transform: rotate(-1deg) scaleY(1); }
          25% { transform: rotate(3deg) scaleY(1.12) scaleX(0.94); }
          50% { transform: rotate(-2.5deg) scaleY(0.92) scaleX(1.06); }
          75% { transform: rotate(2deg) scaleY(1.08) scaleX(0.96); }
        }

        /* Wind gust when user blows */
        @keyframes flameWindGust {
          0% { transform: rotate(0deg) scale(1); }
          30% { transform: rotate(-45deg) scaleY(0.55) scaleX(1.3); opacity: 0.7; }
          70% { transform: rotate(-35deg) scaleY(0.75) scaleX(1.1); opacity: 0.85; }
          100% { transform: rotate(0deg) scale(1); opacity: 1; }
        }

        /* Candle Smoke Rise on Blowout */
        @keyframes candleSmokeRise {
          0% { transform: translateY(0px) scale(0.6); opacity: 0.9; }
          50% { transform: translateY(-35px) translateX(10px) scale(1.3); opacity: 0.5; }
          100% { transform: translateY(-75px) translateX(-12px) scale(2); opacity: 0; }
        }

        /* Explosive Confetti Cannon Blast from Candle */
        @keyframes confettiCannonBlast {
          0% {
            transform: translate(0px, 0px) scale(0) rotate(0deg);
            opacity: 1;
          }
          20% {
            opacity: 1;
            transform: translate(var(--cx), var(--cy)) scale(var(--cs)) rotate(calc(var(--crot) * 0.35));
          }
          65% {
            opacity: 0.95;
            transform: translate(calc(var(--cx) * 1.05), calc(var(--cy) + 140px)) scale(var(--cs)) rotate(calc(var(--crot) * 0.75));
          }
          100% {
            opacity: 0;
            transform: translate(calc(var(--cx) * 1.1), calc(var(--cy) + 400px)) scale(calc(var(--cs) * 0.6)) rotate(var(--crot));
          }
        }

        .starwars-envelope-summon {
          animation: starWarsHeartGalaxyWarp 2.4s cubic-bezier(0.25, 1, 0.5, 1) forwards;
          will-change: transform, opacity;
        }

        .starwars-speed-trail {
          animation: starWarsSpeedTrail 2.2s ease-out forwards;
        }

        /* Harry Potter Magic Envelope Shake & Vibration */
        @keyframes envelopeShakeVibrate {
          0% { transform: translate(0, 0) rotate(0deg) scale(1); }
          10% { transform: translate(-10px, -6px) rotate(-7deg) scale(1.06); }
          20% { transform: translate(12px, 5px) rotate(8deg) scale(1.07); }
          30% { transform: translate(-12px, 4px) rotate(-8deg) scale(1.08); }
          40% { transform: translate(14px, -4px) rotate(7deg) scale(1.07); }
          50% { transform: translate(-10px, -5px) rotate(-6deg) scale(1.06); }
          60% { transform: translate(8px, 4px) rotate(5deg) scale(1.05); }
          70% { transform: translate(-6px, 2px) rotate(-4deg) scale(1.04); }
          80% { transform: translate(4px, -2px) rotate(3deg) scale(1.02); }
          90% { transform: translate(-2px, 1px) rotate(-1deg) scale(1.01); }
          100% { transform: translate(0, 0) rotate(0deg) scale(1); }
        }

        .envelope-shake-vibrate {
          animation: envelopeShakeVibrate 0.65s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
        }

        .anime-envelope-hover {
          animation: animeFloatEnvelope 5s ease-in-out infinite;
          will-change: transform;
        }

        .living-candle-flame {
          transform-origin: 0px 0px;
          animation: livingFlameFlicker 0.45s ease-in-out infinite;
        }

        .flame-wind-anim {
          transform-origin: 0px 0px;
          animation: flameWindGust 0.55s ease-out forwards;
        }

        .candle-smoke-anim {
          animation: candleSmokeRise 2.4s ease-out forwards;
        }

        .confetti-cannon-burst {
          animation: confettiCannonBlast cubic-bezier(0.12, 0.9, 0.32, 1) forwards;
          will-change: transform, opacity;
        }
      `}</style>

      {/* 1. Deep Celestial Cosmos Background */}
      <div className="absolute inset-0 bg-[#07020d] bg-gradient-to-b from-[#090212] via-[#0d041a] to-[#05010a] pointer-events-none" />

      {/* 2. Ambient Candlelight Bokeh & Glow Halos */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-rose-600/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 rounded-full bg-amber-500/10 blur-[100px] pointer-events-none" />

      {/* 3. Floating Ambient Particles (Hearts & Petals) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {ambientHearts.map((h) => (
          <div
            key={h.id}
            className="absolute -bottom-8 pointer-events-none animate-floatUpSlow opacity-35 text-rose-400"
            style={{
              left: `${h.left}%`,
              transform: `scale(${h.scale})`,
              animationDelay: `${h.delay}s`,
              animationDuration: `${h.duration}s`
            }}
          >
            <Heart className="w-5 h-5 fill-current" />
          </div>
        ))}

        {/* Petals in Scene 2 & 3 */}
        {(currentScene === 2 || currentScene === 3) && petals.map((p) => (
          <div
            key={`petal-${p.id}`}
            className="absolute -top-6 rounded-full bg-gradient-to-br from-pink-300 to-rose-400 opacity-60 pointer-events-none"
            style={{
              left: `${p.left}%`,
              width: `${p.size}px`,
              height: `${p.size * 1.5}px`,
              borderRadius: '50% 0 50% 50%',
              animation: `animePetalFall ${p.duration}s linear ${p.delay}s infinite`,
              filter: 'drop-shadow(0 2px 6px rgba(244,63,94,0.3))'
            }}
          />
        ))}

        {/* Explosive Full-Screen Confetti Cannon Burst from Candle */}
        {currentScene === 3 && isCandleBlown && (
          <div className="fixed inset-0 pointer-events-none z-[350] overflow-hidden">
            <Confetti
              key={confettiKey}
              width={windowSize.width}
              height={windowSize.height}
              numberOfPieces={320}
              recycle={false}
              gravity={0.25}
              initialVelocityY={26}
              initialVelocityX={16}
              confettiSource={{
                x: Math.max(0, windowSize.width / 2 - 5),
                y: Math.max(0, windowSize.height * 0.40),
                w: 10,
                h: 10
              }}
              colors={[
                '#f43f5e', '#fb7185', '#f59e0b', '#ec4899', '#d946ef',
                '#fda4af', '#fcd34d', '#38bdf8', '#c084fc', '#ffffff'
              ]}
            />
          </div>
        )}
      </div>

      {/* 4. Top Minimal Header: Cinematic, Whisper-Quiet, No Tech Badges */}
      <header className="relative z-30 flex items-center justify-between px-5 pt-3 pb-1 shrink-0">
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse" />
          <span className="text-xs font-serif italic text-rose-200/90 tracking-wide">
            Kanna's Birthday Sanctuary
          </span>
        </div>

        <button
          onClick={() => {
            playTapChime();
            onClose();
          }}
          className="w-8 h-8 rounded-full bg-black/40 hover:bg-white/15 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer"
          title="Close Sanctuary"
        >
          <X className="w-4 h-4" />
        </button>
      </header>

      {/* 5. MAIN CINEMATIC STAGE */}
      <main className="relative z-10 flex-1 w-full max-w-md mx-auto px-4 flex flex-col items-center justify-center text-center overflow-y-auto custom-scrollbar min-h-0">

        {/* ==================================================================
            SCENE 0: THE PORTAL GATE
            ================================================================== */}
        {currentScene === 0 && (
          <div className="flex flex-col items-center animate-fadeIn w-full py-4 my-auto">
            {/* Pulsing Heart Key in Rotating Halo */}
            <div className="relative mb-6 flex items-center justify-center">
              <div className="absolute -inset-3.5 rounded-full border border-dashed border-rose-500/50 animate-spin pointer-events-none" style={{ animationDuration: '16s' }} />
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-400 p-0.5 shadow-[0_0_40px_rgba(244,63,94,0.45)] flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-[#140416] flex items-center justify-center">
                  <Heart className="w-9 h-9 text-rose-400 fill-rose-400 animate-lubdub" />
                </div>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white mb-2.5 tracking-tight text-shimmer-glow">
              {BIRTHDAY_PORTAL_CONFIG.welcomeTagline}
            </h1>

            <p className="text-sm text-rose-200/80 leading-relaxed mb-8 px-3 font-serif italic max-w-xs">
              "{BIRTHDAY_PORTAL_CONFIG.welcomeSubtitle}"
            </p>

            {/* Refined Romantic Round Button */}
            <button
              onClick={() => {
                playSuccessChime();
                setCurrentScene(1);
              }}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 text-white font-serif font-bold text-xs tracking-wider shadow-[0_4px_18px_rgba(244,63,94,0.5)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer border border-rose-300/40"
            >
              <Heart className="w-3.5 h-3.5 fill-white text-white shrink-0" />
              <span>Enter Our Sanctuary</span>
            </button>
            <span className="text-[11px] text-rose-300/60 font-serif italic mt-3">
              A secret universe made with all my love, just for you
            </span>
          </div>
        )}

        {/* ==================================================================
            SCENE 1: ROMANTIC WHISPERS (OUR STORY QUIZ)
            ================================================================== */}
        {currentScene === 1 && !isQuizFinished && (
          <div className="flex flex-col items-center animate-fadeIn w-full py-2 my-auto">
            {/* Question Counter Indicator */}
            <div className="flex items-center gap-2 mb-3">
              {[0, 1, 2].map(idx => (
                <div
                  key={idx}
                  className={`h-2 rounded-full transition-all duration-300 ${questionIdx === idx ? 'w-6 bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.9)]' : 'w-2 bg-white/20'
                    }`}
                />
              ))}
            </div>

            {/* Question Card */}
            <div className="dark-card w-full p-5 sm:p-6 rounded-3xl bg-black/60 backdrop-blur-xl border border-rose-500/30 shadow-[0_15px_45px_rgba(0,0,0,0.6)] mb-3 text-center">
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-white mb-1.5 tracking-tight">
                {currentQ.question}
              </h2>
              <p className="text-xs text-rose-300/75 font-serif italic mb-4">
                {currentQ.subtitle}
              </p>

              {/* Options */}
              <div className="flex flex-col gap-2.5 mb-4">
                {currentQ.options.map((opt) => {
                  const isSelected = selectedOptionId === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectOption(opt.id, opt.reaction)}
                      className={`w-full p-3.5 sm:p-4 rounded-2xl border text-left flex items-center justify-between transition-all duration-200 cursor-pointer ${isSelected
                          ? 'bg-rose-500/20 border-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.3)] scale-[1.01]'
                          : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/85'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <Heart className={`w-4 h-4 shrink-0 ${isSelected ? 'text-rose-400 fill-rose-400' : 'text-white/40'}`} />
                        <span className="text-xs sm:text-sm font-medium leading-snug">
                          {opt.text}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Sweet Reaction Box */}
              {activeReaction && (
                <div className="p-3.5 rounded-2xl bg-rose-950/50 border border-rose-500/40 animate-fadeIn mb-4 text-left flex items-start gap-2.5">
                  <Heart className="w-4 h-4 text-rose-400 fill-rose-400 shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm text-rose-100 italic leading-relaxed font-serif">
                    "{activeReaction}"
                  </p>
                </div>
              )}

              {/* Refined Small Round Next Button */}
              {selectedOptionId && (
                <div className="flex justify-center mt-2">
                  <button
                    onClick={handleNextQuestion}
                    className="px-5 py-2.5 rounded-full bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 text-white font-serif font-bold text-xs tracking-wide shadow-[0_4px_16px_rgba(244,63,94,0.45)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-rose-300/40"
                  >
                    <Heart className="w-3 h-3 fill-white text-white shrink-0" />
                    <span>{questionIdx < questions.length - 1 ? 'Next Memory' : 'Read My Letter'}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-white/80" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================================================================
            SCENE 1 COMPLETION: ACCESS TO LETTER
            ================================================================== */}
        {currentScene === 1 && isQuizFinished && (
          <div className="flex flex-col items-center animate-fadeIn w-full py-4 my-auto">
            {/* Heart Emblem */}
            <div className="relative mb-6 flex items-center justify-center">
              <div className="absolute -inset-3.5 rounded-full border border-dashed border-amber-400/50 animate-spin pointer-events-none" style={{ animationDuration: '10s' }} />
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-amber-400 p-0.5 shadow-[0_0_40px_rgba(251,191,36,0.5)] flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-[#14061a] flex items-center justify-center">
                  <Heart className="w-9 h-9 text-amber-300 fill-amber-300 animate-lubdub" />
                </div>
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-2 tracking-tight">
              A Letter From My Soul
            </h2>

            <p className="text-xs sm:text-sm text-rose-200/80 leading-relaxed mb-8 px-4 font-serif italic max-w-xs">
              "You know my heart better than anyone in this universe. An envelope carrying my deepest love now arrives for you..."
            </p>

            <button
              onClick={() => {
                playSuccessChime();
                setCurrentScene(2);
              }}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-500 via-rose-600 to-pink-600 text-white font-serif font-bold text-xs tracking-wider shadow-[0_4px_20px_rgba(251,191,36,0.5)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer border border-amber-200/40"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Open Love Letter</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ==================================================================
            SCENE 2: 3D FLOATING ENVELOPE & ANIME LETTER
            ================================================================== */}
        {currentScene === 2 && (
          <div className="flex flex-col items-center w-full my-auto">

            {/* A. CLOSED ENVELOPE (Floating with 2.4s Star Wars zoom) */}
            {envelopePhase !== 'reading' && (
              <div className="flex flex-col items-center w-full py-4 relative">

                {/* Star Wars Hyperspace Trails */}
                {envelopePhase === 'summoning' && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                    <div className="w-80 h-48 rounded-full border border-rose-500/50 starwars-speed-trail" />
                    <div className="absolute w-64 h-36 rounded-full border border-amber-400/40 starwars-speed-trail" style={{ animationDelay: '0.4s' }} />
                  </div>
                )}

                {/* The Floating 3D Envelope (With Harry Potter Letter Swooping & Vibrating) */}
                <div
                  className={`relative cursor-pointer select-none ${envelopePhase === 'summoning'
                      ? 'starwars-envelope-summon'
                      : (isDodging ? 'envelope-shake-vibrate' : 'anime-envelope-hover')
                    }`}
                  style={{
                    perspective: '1000px',
                    width: '300px',
                    height: '195px'
                  }}
                  onClick={handleOpenEnvelope}
                  title="Touch the wax seal to open your love letter"
                >
                  {/* Ambient Depth Shadow */}
                  <div className="absolute -inset-2 rounded-2xl bg-black/70 blur-xl pointer-events-none transform translate-y-6" />

                  {/* Inside Back Wall */}
                  <div
                    className="absolute inset-0 rounded-2xl border border-[#c9b497] overflow-hidden"
                    style={{
                      backgroundColor: '#d8c4a6',
                      backgroundImage: 'radial-gradient(#baa383 1px, transparent 1px), linear-gradient(180deg, #d3bea0 0%, #caa980 100%)',
                      backgroundSize: '14px 14px, 100% 100%'
                    }}
                  />

                  {/* Letter Sheet Sliding Up Out of Pocket */}
                  <div
                    className="absolute left-4 right-4 rounded-t-xl transition-all duration-700 ease-out border border-[#dec5a2] p-3 text-left shadow-lg"
                    style={{
                      backgroundColor: '#fffdfa',
                      height: '170px',
                      bottom: '8px',
                      zIndex: 10,
                      transform: (envelopePhase === 'letter-emerging' || envelopePhase === 'reading')
                        ? 'translateY(-120px) scale(1.03)'
                        : 'translateY(0px) scale(0.96)'
                    }}
                  >
                    <div className="w-full h-1 bg-gradient-to-r from-amber-300 via-rose-400 to-amber-300 rounded-full mb-2" />
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[9px] font-bold text-amber-900/60 uppercase">September 8, {new Date().getFullYear()} • Kanna</span>
                      <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                    </div>
                    <p className="font-serif italic text-[11px] text-[#3b1222] line-clamp-3 leading-relaxed">
                      "Today the entire universe celebrates the arrival of the most beautiful soul..."
                    </p>
                  </div>

                  {/* Front Flaps forming pocket */}
                  <div className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden" style={{ zIndex: 15 }}>
                    <div className="absolute inset-0" style={{ clipPath: 'polygon(0 0, 0 100%, 50% 50%)', backgroundColor: '#efe3cf' }} />
                    <div className="absolute inset-0" style={{ clipPath: 'polygon(100% 0, 100% 100%, 50% 50%)', backgroundColor: '#ebdcbf' }} />
                    <div className="absolute inset-0" style={{ clipPath: 'polygon(0 100%, 100% 100%, 50% 50%)', backgroundColor: '#e7d6b8' }} />

                    <div className="absolute bottom-3 left-0 right-0 text-center">
                      <span className="text-[8px] font-serif italic text-amber-900/60">
                        To My Kanna • With All My Soul
                      </span>
                    </div>
                  </div>

                  {/* Top Flap Cover (Cleanly folds up) */}
                  <div
                    className="absolute top-0 left-0 right-0 h-24 origin-top pointer-events-none transition-transform duration-700 ease-in-out"
                    style={{
                      clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
                      backgroundColor: '#f6ecdc',
                      backgroundImage: 'linear-gradient(to bottom, #fcf8f0 0%, #e6d3b4 100%)',
                      transform: (envelopePhase === 'flap-open' || envelopePhase === 'letter-emerging' || envelopePhase === 'reading')
                        ? 'rotateX(-175deg)'
                        : 'rotateX(0deg)',
                      transformStyle: 'preserve-3d',
                      zIndex: (envelopePhase === 'flap-open' || envelopePhase === 'letter-emerging' || envelopePhase === 'reading') ? 5 : 25
                    }}
                  />

                  {/* Embossed Ruby Wax Seal */}
                  <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex items-center justify-center transition-all duration-500"
                    style={{
                      transform: sealCracked ? 'translate(-50%, -50%) scale(1.4)' : 'translate(-50%, -50%) scale(1)',
                      opacity: sealCracked ? 0 : 1
                    }}
                  >
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-rose-600 via-rose-700 to-rose-900 p-1 shadow-[0_6px_20px_rgba(225,29,72,0.6)] flex items-center justify-center border border-amber-300/60">
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-rose-700 to-rose-950 flex flex-col items-center justify-center">
                        <Heart className="w-5 h-5 text-rose-200 fill-rose-300 drop-shadow" />
                        <span className="text-[6px] font-black uppercase tracking-tighter text-amber-200/90 -mt-0.5">FOREVER</span>
                      </div>
                    </div>
                  </div>

                </div>

                {envelopeTeaseMsg ? (
                  <div className="mt-6 px-4 py-2 rounded-2xl bg-rose-950/85 border border-amber-400/50 text-amber-200 text-xs font-serif italic text-center animate-bounce shadow-lg max-w-xs">
                    {envelopeTeaseMsg}
                  </div>
                ) : (
                  <p className="text-xs text-rose-200/90 mt-6 font-serif italic animate-pulse">
                    Touch the wax seal to open your letter 💌
                  </p>
                )}
              </div>
            )}

            {/* B. READING LETTER VIEW */}
            {envelopePhase === 'reading' && (
              <div className="flex flex-col items-center w-full animate-fadeIn pb-24">
                <div
                  ref={letterPaperRef}
                  className="relative w-full rounded-3xl p-5 sm:p-7 text-left shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-[#e5d4bc] overflow-hidden max-h-[58vh] overflow-y-auto custom-scrollbar"
                  style={{
                    backgroundColor: '#fffcf7',
                    backgroundImage: 'linear-gradient(180deg, #fffefb 0%, #fdf6eb 100%)'
                  }}
                >
                  {/* Full-Cover Seamless Cathedral & Couple Watermark */}
                  <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden rounded-3xl">
                    <img
                      src="./couple-bg.jpg"
                      alt=""
                      className="w-full h-full object-cover object-[center_25%] pointer-events-none select-none"
                      style={{
                        opacity: 0.14,
                        filter: 'sepia(0.2) contrast(1.05)'
                      }}
                      loading="eager"
                      crossOrigin="anonymous"
                    />
                  </div>

                  {/* Header */}
                  <div className="relative z-10 flex items-center justify-between border-b border-amber-900/15 pb-3 mb-4">
                    <div className="flex items-center gap-1.5">
                      <Heart className="w-3.5 h-3.5 text-rose-600 fill-rose-600" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900/60">
                        {BIRTHDAY_LETTER_DATA.date}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Small Download Button (hidden in exported PNG) */}
                      <button
                        onClick={handleDownloadLetter}
                        disabled={isDownloading}
                        className="no-export w-7 h-7 rounded-full bg-amber-900/10 hover:bg-rose-600 hover:text-white text-amber-950 transition-all flex items-center justify-center cursor-pointer border border-amber-900/20 active:scale-95 shadow-xs"
                        title="Save Love Letter as Image"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      <div className="w-6 h-6 rounded-full bg-rose-700 flex items-center justify-center">
                        <Heart className="w-3 h-3 text-rose-100 fill-rose-200" />
                      </div>
                    </div>
                  </div>

                  <div className="relative z-10">
                    {/* Salutation */}
                    <h3 className="font-serif italic font-bold text-xl sm:text-2xl text-[#3b1222] tracking-tight mb-2">
                      {BIRTHDAY_LETTER_DATA.salutation}
                    </h3>

                    <p className="text-[11px] font-bold text-rose-800/80 mb-4 uppercase tracking-wider">
                      {BIRTHDAY_LETTER_DATA.title}
                    </p>

                    {/* Paragraphs with Evenly Distributed Cutout Stickers */}
                    <div className="space-y-3 font-serif text-[#3f1929] leading-relaxed text-xs sm:text-sm">
                      {BIRTHDAY_LETTER_DATA.paragraphs.map((para, pIdx) => (
                        <div key={pIdx} className="overflow-hidden">
                          {/* Cutout 1: Peace sign in car (Upper right margin beside Paragraph 2) */}
                          {pIdx === 1 && (
                            <div className="float-right ml-3 mb-1 w-20 sm:w-24 select-none group">
                              <img
                                src="./cutout-1.png"
                                alt="Us"
                                className="w-full h-auto drop-shadow-[0_4px_10px_rgba(0,0,0,0.18)] rotate-2 group-hover:rotate-0 group-hover:scale-105 transition-all duration-300 pointer-events-auto"
                                loading="eager"
                              />
                            </div>
                          )}

                          {/* Cutout 2: Cuddle with hearts (Middle left margin beside Paragraph 4 - Leaning on Each Other) */}
                          {pIdx === 3 && (
                            <div className="float-left mr-3 mb-1 w-20 sm:w-24 select-none group">
                              <img
                                src="./cutout-2.png"
                                alt="Us"
                                className="w-full h-auto drop-shadow-[0_4px_10px_rgba(0,0,0,0.18)] -rotate-3 group-hover:rotate-0 group-hover:scale-105 transition-all duration-300 pointer-events-auto"
                                loading="eager"
                              />
                            </div>
                          )}

                          {/* Photo Cutout: Couple in white with brick wall (Lower right margin beside Paragraph 6) */}
                          {pIdx === 5 && (
                            <div className="float-right ml-3 mb-1 w-20 sm:w-24 select-none group">
                              <div className="p-1 bg-white rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.18)] rotate-2 group-hover:rotate-0 group-hover:scale-105 transition-all duration-300">
                                <img
                                  src="./letter-bg-bottom.jpg"
                                  alt="Us"
                                  className="w-full h-24 sm:h-28 object-cover object-[center_20%] rounded-xl pointer-events-auto"
                                  loading="eager"
                                />
                              </div>
                            </div>
                          )}

                          <p className="indent-3 text-justify">
                            {para}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Signature Area with Cutout 3 on Bottom Left */}
                    <div className="flex items-end justify-between mt-6 font-serif">
                      <div className="w-20 sm:w-24 select-none group">
                        <img
                          src="./cutout-3.png"
                          alt="Us"
                          className="w-full h-auto drop-shadow-[0_4px_10px_rgba(0,0,0,0.18)] rotate-1 group-hover:scale-105 transition-all duration-300 pointer-events-auto"
                          loading="eager"
                        />
                      </div>

                      <div className="text-right flex flex-col items-end">
                        <p className="italic text-[11px] text-amber-950/70 mb-0.5">
                          {BIRTHDAY_LETTER_DATA.closing}
                        </p>
                        <div className="flex items-center gap-2">
                          <p className="font-bold italic text-base text-[#3b1222]">
                            {BIRTHDAY_LETTER_DATA.signature}
                          </p>
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-rose-700 via-rose-800 to-rose-950 flex items-center justify-center shadow-md border border-amber-300/50 shrink-0">
                            <Heart className="w-3.5 h-3.5 text-rose-200 fill-rose-300" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* P.S. Note */}
                    <div className="mt-5 pt-3 border-t border-amber-900/15 text-[11px] text-rose-900/80 font-serif italic bg-rose-50/60 p-2.5 rounded-xl">
                      {BIRTHDAY_LETTER_DATA.postscript}
                    </div>
                  </div>
                </div>

                {/* Floating Luminous Birthday Cake Button: Appears after 3.2s of reading! */}
                {showCakeTrigger && (
                  <div className="fixed bottom-6 left-0 right-0 z-40 flex justify-center px-4 animate-fadeIn">
                    <button
                      onClick={() => {
                        playSuccessChime();
                        setCurrentScene(3);
                      }}
                      className="group px-6 py-2.5 rounded-full bg-gradient-to-r from-[#200516]/95 via-[#350c22]/95 to-[#200516]/95 border border-amber-400/70 shadow-[0_8px_25px_rgba(244,63,94,0.5)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5 cursor-pointer backdrop-blur-xl"
                    >
                      <span className="text-base leading-none">🎂</span>
                      <span className="text-xs font-serif font-bold text-white tracking-wide">
                        Make Your Birthday Wish
                      </span>
                      <Heart className="w-3 h-3 text-rose-400 fill-rose-400 shrink-0" />
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>
        )}
{/* ==================================================================
            SCENE 3: THE GOURMET 3D BIRTHDAY CAKE & CANDLE (MOVIE SCENE)
            ================================================================== */}
        {currentScene === 3 && (
          <div className="flex-1 w-full max-w-md flex flex-col items-center justify-between py-1 text-center min-h-0 animate-fadeIn">

            {/* Header Title & Subtitle with Exquisite Heart Emblem */}
            <div className="shrink-0 mb-1 flex flex-col items-center">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-950/60 border border-rose-400/40 shadow-[0_0_15px_rgba(244,63,94,0.3)] mb-1.5 backdrop-blur-md">
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-rose-600 via-pink-500 to-amber-400 flex items-center justify-center shadow-xs">
                  <Heart className="w-3 h-3 text-white fill-white animate-pulse" />
                </div>
                <span className="text-[10px] font-serif font-bold uppercase tracking-widest text-amber-200">
                  {isCandleBlown ? "A Prayer Granted" : "Make a Wish, My Sweet Chinnoda"}
                </span>
              </div>

              <h2 className="font-serif font-bold text-2xl sm:text-3xl text-white mb-1 tracking-tight text-shimmer-glow flex items-center justify-center gap-2.5">
                <span>{isCandleBlown ? "Wish Sealed in the Heavens" : "Happy Birthday, Kanna"}</span>
                <span className="relative inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-rose-600 via-pink-500 to-amber-400 p-0.5 shadow-[0_0_16px_rgba(244,63,94,0.7)] border border-pink-200/60">
                  <span className="absolute inset-0 rounded-full bg-rose-500/30 animate-ping opacity-40 pointer-events-none" />
                  <Heart className="w-4 h-4 text-white fill-rose-50 drop-shadow-[0_0_6px_rgba(255,255,255,0.9)] animate-lubdub" />
                </span>
              </h2>

              <p className="text-xs sm:text-sm text-rose-200/85 font-serif italic max-w-xs px-2 leading-relaxed">
                {isCandleBlown 
                  ? "Your wish has taken flight into eternity..." 
                  : "Close your pretty eyes, make the deepest wish in your heart, and blow out your candle..."}
              </p>
            </div>

            {/* -------------------------------------------------------------
                GOURMET 3D BIRTHDAY CAKE (Responsive Vector SVG)
                ------------------------------------------------------------- */}
            <div
              className="relative shrink-0 flex items-center justify-center cursor-pointer select-none my-auto transition-transform active:scale-95"
              onClick={handleBlowOutCandle}
              title={isCandleBlown ? "Candle is blown out" : "Tap the cake to blow out your candle!"}
            >
              <svg
                viewBox="0 0 280 225"
                className="w-60 sm:w-72 max-h-[25vh] sm:max-h-[27vh] h-auto mx-auto select-none drop-shadow-[0_15px_35px_rgba(0,0,0,0.8)]"
              >
                <defs>
                  {/* Metallic Stand Gold */}
                  <linearGradient id="standGold" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#92400e" />
                    <stop offset="25%" stopColor="#d97706" />
                    <stop offset="50%" stopColor="#fef3c7" />
                    <stop offset="75%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#78350f" />
                  </linearGradient>

                  {/* Tier 2: Velvet Strawberry Ganache */}
                  <linearGradient id="cakeBaseGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#4a0422" />
                    <stop offset="25%" stopColor="#831843" />
                    <stop offset="55%" stopColor="#9d174d" />
                    <stop offset="85%" stopColor="#be185d" />
                    <stop offset="100%" stopColor="#500724" />
                  </linearGradient>
                  <linearGradient id="cakeBaseTop" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#fda4af" />
                    <stop offset="100%" stopColor="#f43f5e" />
                  </linearGradient>

                  {/* Tier 1: Ivory Vanilla Cream */}
                  <linearGradient id="cakeTopGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#fdf2f8" />
                    <stop offset="30%" stopColor="#ffffff" />
                    <stop offset="70%" stopColor="#fce7f3" />
                    <stop offset="100%" stopColor="#fbcfe8" />
                  </linearGradient>

                  {/* Strawberry Gloss Gradient */}
                  <linearGradient id="strawberryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f87171" />
                    <stop offset="40%" stopColor="#ef4444" />
                    <stop offset="100%" stopColor="#881337" />
                  </linearGradient>

                  {/* Blueberry Gradient */}
                  <linearGradient id="blueberryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4338ca" />
                    <stop offset="60%" stopColor="#1e1b4b" />
                    <stop offset="100%" stopColor="#0f172a" />
                  </linearGradient>

                  {/* Soft Radial Candlelight Halo (No SVG Filter Bug!) */}
                  <radialGradient id="flameHaloGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.85" />
                    <stop offset="40%" stopColor="#f97316" stopOpacity="0.4" />
                    <stop offset="80%" stopColor="#ef4444" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
                  </radialGradient>

                  {/* Pedestal Shadow Filter */}
                  <filter id="standShadowFilter" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
                  </filter>
                </defs>

                {/* 1. Pedestal Stand */}
                <ellipse cx="140" cy="216" rx="90" ry="7" fill="#000000" opacity="0.5" filter="url(#standShadowFilter)" />
                <ellipse cx="140" cy="210" rx="65" ry="9" fill="url(#standGold)" />
                <path d="M 124 195 Q 140 205 156 195 L 150 210 Q 140 215 130 210 Z" fill="url(#standGold)" />
                <ellipse cx="140" cy="193" rx="105" ry="14" fill="url(#standGold)" />
                <ellipse cx="140" cy="191" rx="102" ry="11" fill="#fffbeb" opacity="0.35" />

                {/* 2. Lower Tier (Strawberry Ganache) */}
                <path d="M 45 138 L 45 178 Q 140 204 235 178 L 235 138 Q 140 164 45 138 Z" fill="url(#cakeBaseGrad)" />
                {/* Gold Ribbon Trim */}
                <path d="M 45 170 Q 140 196 235 170 L 235 178 Q 140 204 45 178 Z" fill="url(#standGold)" />
                {/* Golden Buttercream Piped Inscription */}
                <text
                  x="140"
                  y="166"
                  textAnchor="middle"
                  fill="#fef3c7"
                  fontSize="9.5"
                  fontWeight="bold"
                  fontFamily="serif"
                  fontStyle="italic"
                  letterSpacing="0.4"
                  opacity="0.95"
                >
                  Happy Birthday Smiley 💖
                </text>
                {/* Lower Tier Top Ellipse */}
                <ellipse cx="140" cy="138" rx="95" ry="19" fill="url(#cakeBaseTop)" />
                {/* Dripping Vanilla Cream Glaze */}
                <path d="M 45 138 Q 70 158 85 144 Q 105 162 125 146 Q 140 164 160 148 Q 185 162 205 145 Q 220 156 235 138 Q 140 162 45 138 Z" fill="#fffaf0" opacity="0.95" />

                {/* 3. Upper Tier (Ivory Vanilla Cream) */}
                <path d="M 78 88 L 78 124 Q 140 144 202 124 L 202 88 Q 140 108 78 88 Z" fill="url(#cakeTopGrad)" />
                {/* Drips on Upper Tier */}
                <path d="M 78 88 Q 95 112 108 94 Q 124 118 140 98 Q 156 116 172 94 Q 190 110 202 88 Q 140 108 78 88 Z" fill="#ffe4e6" />
                {/* Upper Tier Top Ellipse */}
                <ellipse cx="140" cy="88" rx="62" ry="15" fill="#fffcf7" />
                <ellipse cx="140" cy="87" rx="58" ry="13" fill="#ffffff" opacity="0.75" />

                {/* Piped Buttercream Rosettes */}
                <circle cx="88" cy="90" r="5" fill="#fdf2f8" stroke="#fbcfe8" strokeWidth="0.5" />
                <circle cx="106" cy="98" r="5.5" fill="#fdf2f8" stroke="#fbcfe8" strokeWidth="0.5" />
                <circle cx="140" cy="101" r="6" fill="#fdf2f8" stroke="#fbcfe8" strokeWidth="0.5" />
                <circle cx="174" cy="98" r="5.5" fill="#fdf2f8" stroke="#fbcfe8" strokeWidth="0.5" />
                <circle cx="192" cy="90" r="5" fill="#fdf2f8" stroke="#fbcfe8" strokeWidth="0.5" />

                {/* Gourmet Fruit Toppings: Strawberries & Blueberries */}
                {/* Left Strawberry */}
                <g transform="translate(100, 70)">
                  <path d="M 12 2 C 7 2, 2 8, 5 18 C 8 26, 12 28, 14 28 C 16 28, 20 26, 23 18 C 26 8, 21 2, 16 2 Z" fill="url(#strawberryGrad)" />
                  <circle cx="9" cy="10" r="0.6" fill="#fef08a" />
                  <circle cx="14" cy="12" r="0.6" fill="#fef08a" />
                  <circle cx="18" cy="11" r="0.6" fill="#fef08a" />
                  <circle cx="11" cy="18" r="0.6" fill="#fef08a" />
                  <circle cx="16" cy="19" r="0.6" fill="#fef08a" />
                  <path d="M 14 3 Q 11 0 7 2 Q 13 4 14 3 Q 17 0 21 2 Q 15 4 14 3" fill="#15803d" stroke="#22c55e" strokeWidth="0.5" />
                </g>

                {/* Right Strawberry */}
                <g transform="translate(152, 71) scale(0.95)">
                  <path d="M 12 2 C 7 2, 2 8, 5 18 C 8 26, 12 28, 14 28 C 16 28, 20 26, 23 18 C 26 8, 21 2, 16 2 Z" fill="url(#strawberryGrad)" />
                  <circle cx="10" cy="11" r="0.6" fill="#fef08a" />
                  <circle cx="15" cy="13" r="0.6" fill="#fef08a" />
                  <circle cx="13" cy="20" r="0.6" fill="#fef08a" />
                  <path d="M 14 3 Q 11 0 7 2 Q 13 4 14 3 Q 17 0 21 2 Q 15 4 14 3" fill="#15803d" stroke="#22c55e" strokeWidth="0.5" />
                </g>

                {/* Blueberries */}
                <g transform="translate(122, 81)">
                  <circle cx="6" cy="6" r="4.5" fill="url(#blueberryGrad)" />
                  <circle cx="4.5" cy="4.5" r="1.2" fill="#ffffff" opacity="0.6" />
                </g>
                <g transform="translate(148, 82)">
                  <circle cx="5" cy="5" r="4" fill="url(#blueberryGrad)" />
                  <circle cx="3.8" cy="3.8" r="1" fill="#ffffff" opacity="0.6" />
                </g>

                {/* Golden Heart Sprinkles */}
                <path d="M 130 90 Q 132 87 134 90 Q 134 92 132 94 Q 130 92 130 90 Z" fill="#fbbf24" />
                <path d="M 148 91 Q 150 88 152 91 Q 152 93 150 95 Q 148 93 148 91 Z" fill="#fbbf24" />

                {/* 4. The Candle */}
                {/* Candle Ambient Radial Light on Top Tier */}
                {!isCandleBlown && (
                  <ellipse cx="140" cy="71" rx="40" ry="14" fill="url(#flameHaloGlow)" opacity="0.75" />
                )}

                {/* Candle Stick: Golden Spiraled Taper */}
                <g transform="translate(137, 38)">
                  <rect x="0" y="0" width="6" height="36" rx="2" fill="#fffbeb" stroke="#fcd34d" strokeWidth="0.6" />
                  <path d="M 0 6 L 6 11 L 6 15 L 0 10 Z" fill="#f59e0b" />
                  <path d="M 0 16 L 6 21 L 6 25 L 0 20 Z" fill="#f59e0b" />
                  <path d="M 0 26 L 6 31 L 6 35 L 0 30 Z" fill="#f59e0b" />
                  <line x1="3" y1="0" x2="3" y2="-5" stroke="#1c1917" strokeWidth="1.2" strokeLinecap="round" />
                </g>

                {/* 5. Candle Flame (100% Rock-Solid Anchored to Tip at 140, 33) */}
                {!isCandleBlown ? (
                  <g transform="translate(140, 33)">
                    <g
                      className={isBlowingWind ? "flame-wind-anim" : "living-candle-flame"}
                      style={{ transformOrigin: "0px 0px" }}
                    >
                      {/* Ambient Halo Glow */}
                      <circle cx="0" cy="-12" r="22" fill="url(#flameHaloGlow)" opacity="0.7" pointerEvents="none" />
                      {/* Outer Flame Teardrop (base at 0 0, tip at 0 -24) */}
                      <path d="M 0 0 C -7 -4, -9 -13, 0 -24 C 9 -13, 7 -4, 0 0 Z" fill="#f97316" />
                      {/* Middle Golden Flame (base at 0 0, tip at 0 -18) */}
                      <path d="M 0 0 C -5 -3, -6 -10, 0 -18 C 6 -10, 5 -3, 0 0 Z" fill="#fde047" />
                      {/* Inner White Hot Core (base at 0 0, tip at 0 -10) */}
                      <path d="M 0 0 C -2 -2, -3 -6, 0 -10 C 3 -6, 2 -2, 0 0 Z" fill="#ffffff" />
                    </g>
                  </g>
                ) : (
                  <g transform="translate(140, 33)" className="pointer-events-none">
                    {/* Glowing dying ember on wick tip */}
                    <circle cx="0" cy="0" r="1.5" fill="#ef4444" opacity="0.9" />
                    <circle cx="0" cy="0" r="0.8" fill="#fbbf24" />
                    {/* Rising Wisps of Candle Smoke */}
                    <g className="candle-smoke-anim">
                      <path d="M 0 0 Q -5 -14 3 -28 T -3 -52" stroke="#f1f5f9" strokeWidth="2.5" fill="none" opacity="0.8" strokeLinecap="round" />
                      <path d="M 1 -3 Q 6 -18 -2 -34 T 4 -58" stroke="#cbd5e1" strokeWidth="1.6" fill="none" opacity="0.55" strokeLinecap="round" />
                    </g>
                  </g>
                )}
              </svg>
            </div>

            {/* -------------------------------------------------------------
                ACTION SECTION: Playful Multi-Blow & Generous Romantic Buttons
                ------------------------------------------------------------- */}
            <div className="shrink-0 w-full flex flex-col items-center pt-2 pb-3">
              {!isCandleBlown ? (
                <div className="w-full flex flex-col items-center">

                  {/* Playful Reaction Bubble when she blows */}
                  {playfulHint && (
                    <div className="mb-2.5 px-4 py-1.5 rounded-full bg-rose-950/80 border border-rose-400/50 text-rose-200 font-serif italic text-xs animate-bounce shadow-md">
                      {playfulHint}
                    </div>
                  )}

                  <button
                    onClick={handleBlowOutCandle}
                    className="px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-500 via-rose-600 to-amber-500 text-white font-serif font-bold text-xs tracking-wider shadow-[0_4px_20px_rgba(251,191,36,0.5)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer border border-amber-300/50"
                  >
                    <Wind className="w-3.5 h-3.5 text-amber-200 shrink-0" />
                    <span>
                      {blowCount === 0
                        ? "Blow Candle 🎂"
                        : "Blow Again 🌬️"}
                    </span>
                  </button>

                  <span className="text-[11px] text-amber-300/70 font-serif italic mt-2.5">
                    (or gently tap the cake to blow with your touch)
                  </span>
                </div>
              ) : (
                <div className="w-full flex flex-col items-center animate-fadeIn">

                  {/* Heartfelt Blessing Card */}
                  <div className="w-full p-4 sm:p-5 rounded-2xl bg-black/65 backdrop-blur-xl border border-amber-400/40 shadow-[0_15px_40px_rgba(0,0,0,0.8)] mb-3 text-center">
                    <p className="font-serif italic text-xs sm:text-sm text-rose-100 leading-relaxed mb-2.5">
                      "{BIRTHDAY_CAKE_DATA.celebrationQuote}"
                    </p>
                    <div className="flex items-center justify-center gap-1.5 text-[11px] sm:text-xs font-serif font-bold text-amber-300">
                      <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                      <span>May every prayer for you be answered today, Smiley 💖</span>
                    </div>
                  </div>

                  {/* Refined Small Round Action Buttons */}
                  <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-xs">
                    <button
                      onClick={() => {
                        playTapChime();
                        onClose();
                      }}
                      className="px-5 py-2.5 rounded-full bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 text-white font-serif font-bold text-xs tracking-wide shadow-[0_4px_16px_rgba(244,63,94,0.5)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-rose-300/40"
                    >
                      <Heart className="w-3.5 h-3.5 fill-white text-white shrink-0" />
                      <span>Keep in My Heart</span>
                    </button>

                    <button
                      onClick={handleRelightCandle}
                      className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 text-rose-200/90 font-serif italic text-[11px] tracking-wide transition-colors cursor-pointer flex items-center justify-center gap-1.5 border border-white/10"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Relight Candle 🕯️</span>
                    </button>
                  </div>

                </div>
              )}
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
