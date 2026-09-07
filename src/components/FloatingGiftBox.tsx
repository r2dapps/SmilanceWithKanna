import React, { useState, useEffect } from 'react';
import { Heart, X, Clock, Gift } from 'lucide-react';
import { playSuccessChime, playTapChime, playScreenTapChime } from '../utils/sound';

interface FloatingGiftBoxProps {
  forceShow?: boolean;
  onOpenBirthdaySurprise?: () => void;
}

// Calculate current Indian Standard Time (UTC+5:30)
export const getISTDate = (): Date => {
  const now = new Date();
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utcMs + 5.5 * 3600000);
};

// Check if current IST date matches Birthday Season (Sept 7 or Sept 8 of any year)
export const isBirthdaySeason = (): boolean => {
  const ist = getISTDate();
  const month = ist.getMonth() + 1; // 9 = September (1-indexed)
  const date = ist.getDate();
  return month === 9 && (date === 7 || date === 8);
};

export const isSept7TeaserDay = (): boolean => {
  const ist = getISTDate();
  return (ist.getMonth() + 1) === 9 && ist.getDate() === 7;
};

export const isSept8BirthdayDay = (): boolean => {
  const ist = getISTDate();
  return (ist.getMonth() + 1) === 9 && ist.getDate() === 8;
};

// Massive bank of 80+ romantic advance birthday thoughts, countdown notes, and sweet love whispers
const ADVANCE_BIRTHDAY_QUOTES = [
  "Every ticking second brings me closer to celebrating the most beautiful heart in my universe. Just a little more patience, my sweet Kanna...",
  "The stars in the sky are taking their positions just to illuminate the day my favorite person was born.",
  "Tomorrow isn't just another date on the calendar; it's the annual celebration of God's most precious gift to my life.",
  "I have a heart overflowing with love and a secret wrapped in ribbons, just waiting for midnight to shower your world with magic.",
  "Counting down every hour, every minute, and every heartbeat until I can look at you and say: Happy Birthday, my queen.",
  "You make my ordinary days feel like poetry, so imagine the magic preparing for your special day tomorrow!",
  "Just a few more hours until the clock strikes midnight and the whole world celebrates the arrival of my happiness.",
  "Every heartbeat of mine today whispers: Tomorrow belongs to Kanna, only Kanna, forever Kanna.",
  "I don't think tomorrow is just your birthday... I think it's the official anniversary of love finding its purest home.",
  "Watching the clock tick down toward your birthday feels like waiting for dawn after a long winter night.",
  "You deserve a universe full of laughter, a galaxy of peace, and a lifetime of me loving you endlessly.",
  "If I could wrap up every smile you've ever given me and gift it back to you tomorrow, it would outshine the sun.",
  "Behind this little gift box is a mountain of love, a sky full of prayers, and a heart that beats entirely for you.",
  "Almost your birthday, baby! Rest your pretty head knowing someone out here is thanking heaven for you every single breath.",
  "No countdown in history has ever been as sweet as counting down to the day you entered this world.",
  "I hope you feel the butterflies today, because the love preparing to celebrate you tomorrow is boundless.",
  "Tomorrow is the day the angels sent their brightest star down to earth, and I was lucky enough to find her.",
  "Every second that ticks by is one second closer to celebrating the girl who turned my whole world into a melody.",
  "A little mystery, a lot of love, and a thousand silent wishes already rushing toward your tomorrow.",
  "Hold on tight, my love... something truly magical is baking in the stars just for your eyes.",
  "You are my today, my tomorrow, and the best birthday girl this universe has ever seen.",
  "Your smile is my favorite song, and tomorrow is the day the music was born.",
  "If love had a calendar, September 8th would be the only national holiday worth celebrating.",
  "I'm keeping this secret guarded tight, but I promise your heart will flutter when the time comes.",
  "Just looking at the countdown makes my heart race. I love you more than words will ever be able to capture.",
  "You bring so much gentle warmth into this cold world. Tomorrow, all that warmth is coming right back to you.",
  "Every year on this day, the universe gets a little softer, a little kinder, knowing your birthday is only hours away.",
  "Sleep well tonight, baby, because tomorrow your smile is going to be the headline of my universe.",
  "My heart has been practicing saying 'Happy Birthday' all year long, and tomorrow it finally gets to sing it.",
  "The best chapter of the year is about to begin at midnight tonight.",
  "You make loving you feel as natural as breathing. Happy early birthday, my precious angel.",
  "I asked God for a miracle, and on September 8th He answered by bringing you into this world.",
  "Tomorrow we celebrate your birth, but honestly, every single day with you is a celebration for me.",
  "There isn't enough wrapping paper in the world to cover how much love I have packed for you.",
  "Stay curious, my love! The clock is running, the magic is preparing, and my love for you is growing with every tick.",
  "I love the way your eyes light up when you're surprised. I can't wait to see that sparkle tomorrow.",
  "May this countdown remind you that you are deeply cherished, endlessly adored, and never alone.",
  "Whatever happens tomorrow, remember that my heart chose you, chooses you today, and will choose you forever.",
  "Tomorrow we paint the whole world in your favorite colors.",
  "You are the peace in my chaos and the light in my dark. Just a few hours left until your day!",
  "A sweet kiss on your forehead as we wait for the midnight bells to ring your special year into life.",
  "You're not just getting a year older tomorrow; you're getting even more breathtakingly lovely.",
  "I promise that every birthday you celebrate with me will be filled with genuine reverence and gentle tenderness.",
  "Tick, tock, my darling. The sweetest celebration of our year is standing right outside the door.",
  "I have whispered your name to every prayer, and tomorrow all of them will surround you with blessings.",
  "You are my favorite miracle, Kanna. Hold your breath, tomorrow is pure wonder.",
  "The clock moves slowly when I'm eager to spoil you, but midnight is bringing all the love you deserve.",
  "Happy Birthday Eve to the woman who owns every single room of my heart without paying rent.",
  "A quiet reminder before tomorrow's celebrations: You are my greatest pride and deepest affection.",
  "Let the butterflies dance in your stomach today—tomorrow's surprise was crafted with all my soul.",
  "Every second you wait today is one more reason tomorrow's hug will be tighter and warmer.",
  "God spent extra time painting your soul with grace. Tomorrow is the anniversary of that masterpiece.",
  "My love for you doesn't fit into cards or boxes, but I tried my best to turn it into magic for you.",
  "I can't wait to see your face when the surprise unlocks. You are worth every ounce of love in existence.",
  "Sweet dreams in advance, my birthday princess. Tomorrow the kingdom is completely yours.",
  "Only hours remain until the celebration of the softest, kindest, most radiant heart I know.",
  "You deserve all the flowers that have ever bloomed and all the love that has ever been written.",
  "Thank you for being born, Kanna. Today we wait with bated breath, tomorrow we celebrate with all our hearts.",
  "A thousand kisses waiting in the wings for the clock to strike twelve.",
  "You are the sweetest thought in my mind from morning until night. Tomorrow is all about honoring you.",
  "Whenever I think of pure joy, I think of your laugh. Tomorrow, my sole mission is making you laugh.",
  "The world became ten times softer the day you were born.",
  "Almost there, my love. Close your eyes, make a pre-birthday wish, and trust that tomorrow is yours.",
  "My heart is counting every beat until your birthday officially arrives.",
  "Every tick of this countdown is a reminder of how lucky I am to walk through life beside you.",
  "You are loved more than yesterday, but not as much as tomorrow.",
  "Tomorrow is your day, but honestly, having you in my life makes every day feel like a celebration.",
  "If I could give you the moon tomorrow, I'd bring it down with a bow. For now, my whole heart will have to do.",
  "Midnight is coming to crown the queen of my heart. Get ready, Kanna!",
  "The best days of our lives are always the ones where I get to see your eyes crinkle with pure happiness.",
  "You are the song that never leaves my head and the prayer that never leaves my lips.",
  "Just a little longer, baby. The gift is locked with love, and midnight holds the key.",
  "Your presence is my favorite sanctuary. Happy Birthday Eve to my whole universe.",
  "Everything beautiful about this world feels like it took lessons from your kindness.",
  "Counting the seconds with you in my heart is the sweetest kind of waiting.",
  "Tomorrow, every wish whispered by your heart has my full dedication behind it.",
  "You are the girl of my dreams, my present peace, and my future forever.",
  "One more sunset, one sweet night of sleep, and then your magical day begins!",
  "I love you across every hour, every timezone, and every heartbeat.",
  "Tomorrow is Kanna Day, and the whole universe agrees!"
];

// Heart balloon definitions rising up across the screen
const BALLOON_CONFIGS = [
  { id: 1, left: 10, delay: 0.2, duration: 14, color: '#f43f5e', size: 40 },
  { id: 2, left: 28, delay: 3.8, duration: 16, color: '#fb7185', size: 34 },
  { id: 3, left: 48, delay: 1.2, duration: 15, color: '#e11d48', size: 38 },
  { id: 4, left: 68, delay: 5.5, duration: 17, color: '#f43f5e', size: 36 },
  { id: 5, left: 86, delay: 2.2, duration: 15, color: '#fda4af', size: 32 }
];

export default function FloatingGiftBox({ forceShow = false, onOpenBirthdaySurprise }: FloatingGiftBoxProps) {
  const [visible, setVisible] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ hours: '00', minutes: '00', seconds: '00' });
  const [isBirthdayToday, setIsBirthdayToday] = useState(false);
  const [randomQuote, setRandomQuote] = useState(ADVANCE_BIRTHDAY_QUOTES[0]);

  // Track hidden balloons (after popping) so they don't jump back, and render instant pop at exact coordinate
  const [hiddenBalloons, setHiddenBalloons] = useState<Record<number, boolean>>({});
  const [popBurstList, setPopBurstList] = useState<
    { id: number; x: number; y: number; color: string; size: number }[]
  >([]);

  // Evaluate date visibility and recurrence every year
  useEffect(() => {
    const checkDate = () => {
      const active = forceShow || isBirthdaySeason();
      setVisible(active);
      setIsBirthdayToday(isSept8BirthdayDay());
    };

    checkDate();
    const timer = setInterval(checkDate, 60000);
    return () => clearInterval(timer);
  }, [forceShow]);

  // Live ticking countdown to Sept 8 00:00:00 IST
  useEffect(() => {
    if (!visible) return;

    const updateCountdown = () => {
      const ist = getISTDate();
      const currentYear = ist.getFullYear();
      
      // Target: Sept 8, 00:00:00 IST of current year (Sept 7 18:30 UTC)
      const targetMidnight = new Date(Date.UTC(currentYear, 8, 7, 18, 30, 0));
      
      const diffMs = targetMidnight.getTime() - ist.getTime();

      if (diffMs <= 0) {
        setIsBirthdayToday(true);
        setTimeLeft({ hours: '00', minutes: '00', seconds: '00' });
      } else {
        const totalSeconds = Math.floor(diffMs / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        setTimeLeft({
          hours: hours.toString().padStart(2, '0'),
          minutes: minutes.toString().padStart(2, '0'),
          seconds: seconds.toString().padStart(2, '0')
        });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [visible]);

  if (!visible) return null;

  // Auto-pick a fresh random quote from the 80+ bank on every click
  const handleBoxClick = () => {
    playSuccessChime();
    if (isBirthdayToday && onOpenBirthdaySurprise) {
      onOpenBirthdaySurprise();
    } else {
      const randomIndex = Math.floor(Math.random() * ADVANCE_BIRTHDAY_QUOTES.length);
      setRandomQuote(ADVANCE_BIRTHDAY_QUOTES[randomIndex]);
      setShowModal(true);
    }
  };

  const handleCloseModal = () => {
    playTapChime();
    setShowModal(false);
  };

  // Instant In-Place Balloon Pop (NO jumping back!)
  const handlePopBalloon = (
    id: number,
    color: string,
    size: number,
    e: React.MouseEvent<HTMLDivElement>
  ) => {
    e.stopPropagation();
    playScreenTapChime();

    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    // Immediately hide the rising balloon
    setHiddenBalloons((prev) => ({ ...prev, [id]: true }));

    // Spawn the pop burst exactly at (cx, cy)
    const burstId = Date.now() + Math.random();
    setPopBurstList((prev) => [
      ...prev.slice(-10),
      { id: burstId, x: cx, y: cy, color, size }
    ]);

    // Respawn the rising balloon after 4.5 seconds
    setTimeout(() => {
      setHiddenBalloons((prev) => ({ ...prev, [id]: false }));
    }, 4500);

    // Clean up burst
    setTimeout(() => {
      setPopBurstList((prev) => prev.filter((p) => p.id !== burstId));
    }, 900);
  };

  return (
    <>
      <style>{`
        /* Gentle Corner Hover & Floating Flight (Never obscures card text) */
        @keyframes gentleCornerFloat {
          0% {
            transform: translate3d(0px, 0px, 0) scale(1) rotate(0deg);
          }
          25% {
            transform: translate3d(-18px, -24px, 0) scale(1.04) rotate(4deg);
          }
          50% {
            transform: translate3d(-8px, -45px, 0) scale(0.98) rotate(-3deg);
          }
          75% {
            transform: translate3d(-25px, -18px, 0) scale(1.02) rotate(2deg);
          }
          100% {
            transform: translate3d(0px, 0px, 0) scale(1) rotate(0deg);
          }
        }

        @keyframes pulseGlowRing {
          0%, 100% { transform: scale(1); opacity: 0.55; }
          50% { transform: scale(1.3); opacity: 0.9; }
        }

        /* Falling Confetti */
        @keyframes confettiFall {
          0% {
            transform: translateY(-20px) rotate(0deg) scale(0.8);
            opacity: 0;
          }
          15% {
            opacity: 0.85;
          }
          100% {
            transform: translateY(105vh) rotate(720deg) scale(1.1);
            opacity: 0;
          }
        }

        /* Heart Balloon Floating from below the bottom nav bar all the way up off the top */
        @keyframes heartBalloonAscend {
          0% {
            transform: translateY(90px) rotate(-5deg);
            opacity: 0;
          }
          8% {
            opacity: 0.88;
          }
          90% {
            opacity: 0.88;
          }
          100% {
            transform: translateY(calc(-100vh - 120px)) rotate(6deg);
            opacity: 0;
          }
        }

        /* In-Place Pop Explosion Keyframes */
        @keyframes popHeartBurstRing {
          0% {
            transform: translate(-50%, -50%) scale(0.8);
            opacity: 1;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.5);
            opacity: 0.8;
          }
          100% {
            transform: translate(-50%, -50%) scale(2.2);
            opacity: 0;
          }
        }

        @keyframes popFlyingMiniHeart {
          0% {
            transform: translate(-50%, -50%) scale(0.4);
            opacity: 1;
          }
          100% {
            transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(1.2);
            opacity: 0;
          }
        }

        .gift-box-wander-active {
          animation: gentleCornerFloat 10s ease-in-out infinite;
        }

        .gift-box-glow {
          animation: pulseGlowRing 2.4s ease-in-out infinite;
        }
      `}</style>

      {/* 2. FALLING CONFETTI OVERLAY */}
      <div className="fixed inset-0 pointer-events-none z-[105] overflow-hidden">
        {[
          { left: 8, delay: 0.2, duration: 6, color: 'var(--accent-color, #f43f5e)', width: 6, height: 14 },
          { left: 22, delay: 2.1, duration: 7.5, color: '#f59e0b', width: 8, height: 10 },
          { left: 38, delay: 1.0, duration: 5.5, color: '#ec4899', width: 5, height: 16 },
          { left: 54, delay: 3.2, duration: 8, color: '#fb7185', width: 7, height: 12 },
          { left: 68, delay: 0.5, duration: 6.8, color: '#e11d48', width: 6, height: 15 },
          { left: 82, delay: 2.8, duration: 7, color: '#f59e0b', width: 8, height: 11 },
          { left: 93, delay: 1.5, duration: 6.2, color: 'var(--accent-color, #f43f5e)', width: 6, height: 14 }
        ].map((c, i) => (
          <div
            key={`confetti-${i}`}
            className="absolute -top-6 rounded-sm shadow-sm opacity-80 pointer-events-none"
            style={{
              left: `${c.left}%`,
              width: `${c.width}px`,
              height: `${c.height}px`,
              backgroundColor: c.color,
              animation: `confettiFall ${c.duration}s linear ${c.delay}s infinite`
            }}
          />
        ))}
      </div>

      {/* 3. INTERACTIVE HEART-SHAPED BALLOONS (Rising to top, Tap to Pop!) */}
      <div className="fixed inset-0 pointer-events-none z-[115] overflow-hidden">
        {BALLOON_CONFIGS.map((b) => {
          const isHidden = !!hiddenBalloons[b.id];
          return (
            <div
              key={`balloon-${b.id}`}
              onClick={(e) => !isHidden && handlePopBalloon(b.id, b.color, b.size, e)}
              className={`absolute bottom-0 flex flex-col items-center pointer-events-auto cursor-pointer transition-transform active:scale-90 ${
                isHidden ? 'invisible pointer-events-none' : ''
              }`}
              style={{
                left: `${b.left}%`,
                animation: `heartBalloonAscend ${b.duration}s ease-in-out ${b.delay}s infinite`
              }}
              title="Tap to pop my heart balloon! 💖"
            >
              {/* 3D Glossy Heart-Shaped Balloon SVG */}
              <div
                className="relative select-none drop-shadow-[0_6px_16px_rgba(225,29,72,0.5)]"
                style={{ width: `${b.size}px`, height: `${b.size}px` }}
              >
                <svg
                  viewBox="0 0 32 32"
                  className="w-full h-full"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <radialGradient
                      id={`heartBalloonGrad-${b.id}`}
                      cx="30%"
                      cy="25%"
                      r="65%"
                      fx="30%"
                      fy="25%"
                    >
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="40%" stopColor={b.color} />
                      <stop offset="100%" stopColor="#700a29" />
                    </radialGradient>
                  </defs>
                  {/* Heart Balloon Shape */}
                  <path
                    d="M16 29 C14 26 3 18 3 10.5 C3 5.5 7 2 11.8 2 C14.2 2 15.5 3.5 16 4.3 C16.5 3.5 17.8 2 20.2 2 C25 2 29 5.5 29 10.5 C29 18 18 26 16 29 Z"
                    fill={`url(#heartBalloonGrad-${b.id})`}
                  />
                  {/* Glossy Specular Reflection on Left Lobe */}
                  <ellipse
                    cx="10"
                    cy="8"
                    rx="3.5"
                    ry="2"
                    fill="#ffffff"
                    fillOpacity="0.55"
                    transform="rotate(-25 10 8)"
                  />
                  {/* Balloon Tie Knot */}
                  <polygon points="15,28 17,28 16.5,30.5 15.5,30.5" fill={b.color} />
                </svg>
              </div>

              {/* Trailing Wavy String */}
              <div className="w-[1px] h-11 bg-white/40 shadow-sm" />
            </div>
          );
        })}
      </div>

      {/* 4. IN-PLACE BALLOON POP BURST (Rendered exactly at popped coordinate cx, cy) */}
      {popBurstList.map((burst) => (
        <div
          key={burst.id}
          className="fixed pointer-events-none z-[160]"
          style={{ left: burst.x, top: burst.y }}
        >
          {/* Shockwave expanding ring */}
          <div
            className="absolute w-12 h-12 rounded-full border-2 border-rose-400"
            style={{
              animation: 'popHeartBurstRing 0.5s ease-out forwards'
            }}
          />

          {/* 5 Scattering Mini Hearts flying outward */}
          {[
            { tx: '-32px', ty: '-35px', color: '#f43f5e', size: 18 },
            { tx: '32px', ty: '-30px', color: '#fb7185', size: 16 },
            { tx: '0px', ty: '-50px', color: '#e11d48', size: 20 },
            { tx: '-28px', ty: '20px', color: '#fda4af', size: 14 },
            { tx: '28px', ty: '20px', color: '#f43f5e', size: 15 }
          ].map((p, idx) => (
            <div
              key={idx}
              className="absolute"
              style={
                {
                  '--tx': p.tx,
                  '--ty': p.ty,
                  animation: 'popFlyingMiniHeart 0.65s ease-out forwards'
                } as any
              }
            >
              <Heart
                className="fill-current"
                style={{ width: p.size, height: p.size, color: p.color }}
              />
            </div>
          ))}
        </div>
      ))}

      {/* 5. FLOATING WANDERING GIFT BOX (FOREGROUND: z-[150] in front of top cards & screen) */}
      <div className="fixed bottom-24 right-4 sm:right-6 md:right-8 z-[150] select-none">
        <div className="gift-box-wander-active">
          <button
            onClick={handleBoxClick}
            aria-label="Birthday Surprise"
            className="relative group flex items-center justify-center p-2 focus:outline-none transition-transform active:scale-95 cursor-pointer"
          >
            {/* Ambient Radial Glow Aura */}
            <div className="absolute inset-0 bg-gradient-to-r from-rose-500 via-pink-500 to-amber-400 rounded-full blur-xl opacity-75 gift-box-glow" />

            {/* Floating Luxury Metallic & Satin Gift Box Vector */}
            <div className="relative drop-shadow-[0_12px_28px_rgba(225,29,72,0.6)]">
              <svg
                className="w-16 h-16 sm:w-18 sm:h-18"
                viewBox="0 0 72 72"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  {/* Metallic Rose-Gold Box Body Gradient */}
                  <linearGradient id="boxBodyGrad" x1="12" y1="28" x2="60" y2="64" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#f43f5e" />
                    <stop offset="45%" stopColor="#be123c" />
                    <stop offset="100%" stopColor="#881337" />
                  </linearGradient>

                  {/* Box Lid Gradient */}
                  <linearGradient id="boxLidGrad" x1="10" y1="20" x2="62" y2="30" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#fb7185" />
                    <stop offset="50%" stopColor="#e11d48" />
                    <stop offset="100%" stopColor="#9f1239" />
                  </linearGradient>

                  {/* Sparkling Golden Satin Ribbon */}
                  <linearGradient id="goldRibbonGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#fef08a" />
                    <stop offset="50%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#b45309" />
                  </linearGradient>

                  {/* Ribbon Sheen */}
                  <linearGradient id="sheen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Box Lower Shadow */}
                <ellipse cx="36" cy="65" rx="22" ry="5" fill="#000000" fillOpacity="0.45" />

                {/* Box Main Body */}
                <rect x="15" y="28" width="42" height="34" rx="5" fill="url(#boxBodyGrad)" stroke="#fda4af" strokeWidth="0.8" />

                {/* Box Lid */}
                <rect x="12" y="20" width="48" height="11" rx="3.5" fill="url(#boxLidGrad)" stroke="#fecdd3" strokeWidth="0.8" />
                {/* Lid Top Specular Highlight */}
                <rect x="14" y="21.5" width="44" height="2" rx="1" fill="url(#sheen)" />

                {/* Vertical Satin Ribbon */}
                <rect x="32" y="20" width="8" height="42" fill="url(#goldRibbonGrad)" />
                <rect x="34" y="20" width="1.5" height="42" fill="#fff" fillOpacity="0.4" />

                {/* Horizontal Satin Ribbon on Body */}
                <rect x="15" y="42" width="42" height="7" fill="url(#goldRibbonGrad)" />
                <rect x="15" y="43" width="42" height="1.5" fill="#fff" fillOpacity="0.3" />

                {/* Ribbon Bow Loops */}
                <path d="M34 20 C24 10 18 16 33 19.5 Z" fill="url(#goldRibbonGrad)" stroke="#d97706" strokeWidth="0.8" />
                <path d="M38 20 C48 10 54 16 39 19.5 Z" fill="url(#goldRibbonGrad)" stroke="#d97706" strokeWidth="0.8" />

                {/* Bow Center Knot */}
                <ellipse cx="36" cy="19.5" rx="3.5" ry="3" fill="#fef08a" stroke="#b45309" strokeWidth="0.8" />

                {/* Ribbon Ends */}
                <path d="M34 21 Q28 26 25 31" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                <path d="M38 21 Q44 26 47 31" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              </svg>

              {/* Romantic Heart Pill Badge */}
              <span className="absolute -top-2 -left-2 bg-gradient-to-r from-rose-600 to-pink-500 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-lg border border-pink-300/40 flex items-center gap-1 whitespace-nowrap">
                <Heart className="w-2.5 h-2.5 fill-white text-white" />
                <span>{isBirthdayToday ? 'Open Me' : 'Wait For It'}</span>
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* 6. ROMANTIC TEASER MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#1e0a14] via-[#14060c] to-[#0a0206] border border-rose-500/30 p-6 text-center shadow-[0_20px_60px_rgba(244,63,94,0.4)] overflow-hidden">
            
            {/* Background Warm Radial Glow */}
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-52 h-52 bg-rose-500/25 rounded-full blur-3xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-white/50 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Glowing Icon Header */}
            <div className="relative mx-auto mb-4 w-16 h-16 flex items-center justify-center">
              <div className="absolute inset-0 bg-rose-500/30 rounded-full blur-lg animate-pulse" />
              <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-900/80 to-pink-600/40 border border-rose-400/40 flex items-center justify-center shadow-inner">
                <Gift className="w-7 h-7 text-rose-300" />
              </div>
            </div>

            {/* Title with Heart Theme */}
            <h3 className="font-serif text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-100 via-pink-200 to-rose-300 mb-1 tracking-wide flex items-center justify-center gap-1.5">
              <span>Oh baby, wait for it...</span>
              <Heart className="w-5 h-5 text-rose-400 fill-rose-500 animate-heartBeat shrink-0" />
            </h3>
            <p className="text-xs text-rose-200/80 mb-5 font-light tracking-wide">
              A special magic is preparing with all my heart just for you!
            </p>

            {/* Glowing Live Countdown Timer Card */}
            <div className="bg-black/60 border border-rose-500/25 rounded-2xl p-4 mb-4 shadow-inner">
              <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold tracking-wider uppercase text-rose-300/90 mb-3">
                <Clock className="w-3.5 h-3.5 text-rose-400" />
                <span>Special Day Starts In</span>
              </div>

              {/* Countdown Digits */}
              <div className="flex items-center justify-center gap-2 font-mono">
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-b from-rose-950/90 to-black border border-rose-500/40 flex items-center justify-center text-2xl font-bold text-rose-100 shadow-[0_0_15px_rgba(244,63,94,0.3)]">
                    {timeLeft.hours}
                  </div>
                  <span className="text-[10px] text-rose-300/70 mt-1 uppercase tracking-wider font-sans">Hours</span>
                </div>

                <div className="pb-4">
                  <Heart className="w-4 h-4 text-rose-500 fill-rose-500 animate-heartBeat" />
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-b from-rose-950/90 to-black border border-rose-500/40 flex items-center justify-center text-2xl font-bold text-rose-100 shadow-[0_0_15px_rgba(244,63,94,0.3)]">
                    {timeLeft.minutes}
                  </div>
                  <span className="text-[10px] text-rose-300/70 mt-1 uppercase tracking-wider font-sans">Mins</span>
                </div>

                <div className="pb-4">
                  <Heart className="w-4 h-4 text-rose-500 fill-rose-500 animate-heartBeat" />
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-b from-rose-950/90 to-black border border-rose-500/40 flex items-center justify-center text-2xl font-bold text-rose-100 shadow-[0_0_15px_rgba(244,63,94,0.3)]">
                    {timeLeft.seconds}
                  </div>
                  <span className="text-[10px] text-rose-300/70 mt-1 uppercase tracking-wider font-sans">Secs</span>
                </div>
              </div>
            </div>

            {/* Auto-Refreshed Heartfelt Birthday Whisper Note */}
            <div className="relative bg-white/5 border border-rose-500/20 rounded-2xl p-4 mb-5 min-h-[95px] flex flex-col justify-center shadow-inner">
              <div className="flex items-center justify-center gap-1.5 text-[10px] text-rose-300/80 font-semibold tracking-wider uppercase mb-2">
                <Heart className="w-3 h-3 text-rose-400 fill-rose-400 animate-pulse" />
                <span>Sweet Love Whisper</span>
                <Heart className="w-3 h-3 text-rose-400 fill-rose-400 animate-pulse" />
              </div>

              <p className="text-xs italic text-rose-100/95 leading-relaxed my-auto">
                &ldquo;{randomQuote}&rdquo;
              </p>
            </div>

            {/* Confirmation Close Button */}
            <button
              onClick={handleCloseModal}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 text-white font-semibold text-sm shadow-lg shadow-rose-900/40 hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>I will wait for you, my love</span>
              <Heart className="w-4 h-4 fill-white text-white" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
