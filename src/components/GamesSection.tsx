import React, { useState, useEffect, useRef } from 'react';
import { Gamepad2, Heart, RefreshCcw, Users, ChevronLeft, Dices, Circle, X, HelpCircle, Shuffle, Zap, Search, Film, Smartphone, UserPlus } from 'lucide-react';
import Confetti from 'react-confetti';

const EMOJIS = ['🌸', '🌻', '🍫', '🍦', '🍓', '🎀', '💌', '💖'];

const TRUTHS = [
  "What is a secret you've never told anyone?",
  "What is the most embarrassing thing you've ever done?",
  "If you could switch lives with someone in this room, who would it be?",
  "What's the worst lie you've ever told?",
  "What is your biggest fear?",
  "Who was your first crush?",
  "What's the most childish thing you still do?",
  "What is a weird habit you have?",
  "Have you ever stalked someone online?",
  "What is the most awkward text you've ever sent?",
  "What's something you secretly judge people for?",
  "Have you ever cried during a movie?",
  "If you had to delete all apps on your phone except 3, what would they be?",
  "Have you ever peed in a swimming pool?",
  "What's the weirdest thing you've ever eaten?",
  "Who was your first love?",
  "What's a secret habit you have when you're alone?",
  "Have you ever blamed a fart on someone else?",
  "What is your most irrational fear?",
  "If you were invisible for a day, what's the first thing you would do?",
  "What is the biggest lie you ever told your parents?",
  "What's the worst gift you've ever received and pretended to like?",
  "Who is the most annoying person in this room?",
  "What's the most cringe-worthy thing you did in high school?",
  "Have you ever stalked an ex on social media?"
];

const DARES = [
  "Do your best impression of someone in the room.",
  "Speak in an accent for the next 3 rounds.",
  "Do 10 pushups or squats right now.",
  "Let the group look through your phone gallery for 30 seconds.",
  "Sing the chorus of your favorite song out loud.",
  "Eat a spoonful of a condiment chosen by others.",
  "Tell a joke. If nobody laughs, do it again.",
  "Dance with no music for 1 minute.",
  "Send a random meme to the 5th person in your contacts.",
  "Do not blink for 30 seconds.",
  "Let someone write a word on your forehead with a pen.",
  "Bark like a dog for 30 seconds.",
  "Do 15 jumping jacks while singing the alphabet backwards.",
  "Let the group look through your photo gallery for 1 minute.",
  "Try to juggle 3 items of the group's choosing.",
  "Talk without opening your mouth for the next 2 rounds.",
  "Hold your breath for as long as you can.",
  "Act like a monkey until it is your turn again.",
  "Let the person to your right draw on your face with a pen.",
  "Smell everyone's shoes and rate them out of 10.",
  "Eat a piece of garlic or onion."
];

const SCRAMBLE_WORDS = [
  { word: "BUTTERFLY", hint: "A beautiful flying insect" },
  { word: "CHOCOLATE", hint: "Sweet brown treat" },
  { word: "SUNFLOWER", hint: "Yellow flower that follows the sun" },
  { word: "BIRTHDAY", hint: "A special day once a year" },
  { word: "VACATION", hint: "Time off from work or school" },
  { word: "ICE CREAM", hint: "Cold sweet dessert" },
  { word: "BICYCLE", hint: "Two-wheeled transport" },
  { word: "UMBRELLA", hint: "Keeps you dry in the rain" },
  { word: "COFFEE", hint: "Morning energy drink" },
  { word: "SUNSET", hint: "Evening sky view" },
  { word: "MOUNTAIN", hint: "High natural elevation" },
  { word: "ROMANCE", hint: "Feeling of love and mystery" },
  { word: "LAUGHTER", hint: "Sound of joy" },
  { word: "BREEZE", hint: "Gentle wind" },
  { word: "STARDUST", hint: "Magic from the night sky" },
  { word: "JOURNEY", hint: "Traveling from one place to another" },
  { word: "PROMISE", hint: "A declaration of assurance" },
  { word: "GALAXY", hint: "A massive system of stars" },
  { word: "OCEAN", hint: "A very large expanse of sea" },
  { word: "ADVENTURE", hint: "An unusual and exciting experience" },
  { word: "FIREWORK", hint: "Explosive pyrotechnic device" },
  { word: "WHISPER", hint: "Speaking very softly" },
  { word: "TREASURE", hint: "Hidden wealth or valuables" },
  { word: "RAINBOW", hint: "Colors appearing in the sky after rain" },
  { word: "FESTIVAL", hint: "A day or period of celebration" },
  { word: "BLOSSOM", hint: "A flower or a mass of flowers" },
  { word: "NOSTALGIA", hint: "A sentimental longing for the past" },
  { word: "MELODY", hint: "A sequence of single notes that is musically satisfying" }
];

const TELUGU_MOVIES = [
  "Eega", "Baahubali", "Pushpa", "Arjun Reddy", "Ala Vaikunthapurramuloo", 
  "Magadheera", "Rangasthalam", "Jersey", "Mahanati", "Geetha Govindam",
  "Bommarillu", "Pokiri", "Gabbar Singh", "Sita Ramam", "Okkadu",
  "Arya", "Darling", "Kushi", "Athadu", "Jalsa", "Fidaa", 
  "Nuvvostanante Nenoddantana", "Ye Maaya Chesave", "Mirchi", 
  "Chatrapathi", "Godavari", "Sathamanam Bhavati", "Karthikeya", 
  "Nene Raju Nene Mantri", "Kalki 2898 AD", "RRR", "Salaar", "Devara",
  "Hanuman", "KGF", "Evaru", "Goodachari", "Kshanam", "HIT", "DJ Tillu",
  "Tillu Square", "Premam", "Billa", "Julayi", "Race Gurram", "Srimanthudu",
  "Dookudu", "Businessman", "Yamadonga", "Simhadri", "Manmadhudu"
];

const PASS_PHONE_PROMPTS = [
  "Pass the phone to someone who is always late.",
  "Pass the phone to someone who takes the most selfies.",
  "Pass the phone to someone who is the most likely to fall asleep on the bus.",
  "Pass the phone to someone who has the best smile.",
  "Pass the phone to someone who gets scared easily.",
  "Pass the phone to someone who eats the most.",
  "Pass the phone to someone who gives the best advice.",
  "Pass the phone to someone you trust the most.",
  "Pass the phone to the funniest person here.",
  "Pass the phone to someone who never replies on time.",
  "Pass the phone to the person who takes the best photos.",
  "Pass the phone to the drama queen/king.",
  "Pass the phone to the one most likely to survive a zombie apocalypse.",
  "Pass the phone to the person who laughs the loudest.",
  "Pass the phone to the person most likely to become a millionaire.",
  "Pass the phone to the clumsiest person in the room.",
  "Pass the phone to the person with the best sense of style.",
  "Pass the phone to someone who is most likely to move to another country.",
  "Pass the phone to the person who watches the most movies.",
  "Pass the phone to someone who always has snacks."
];

const COUPLE_QUIZ = [
  "Who takes longer to get ready?",
  "Who says 'I love you' more often?",
  "Who is the better cook?",
  "Who falls asleep first?",
  "Who is more organized?",
  "Who talks more?",
  "Who is more likely to start an argument?",
  "Who apologizes first?",
  "Who is the bigger romantic?",
  "Who is more stubborn?",
  "Who is the better driver?",
  "Who spends more money?",
  "Who is the better listener?",
  "Who is more likely to lose their keys?",
  "Who has better taste in music?",
  "Who gets angry faster?",
  "Who is more likely to suggest ordering takeout?",
  "Who is the bigger flirt?",
  "Who takes the longest showers?",
  "Who is more likely to forget an important date?"
];

export default function GamesSection() {
  const [activeGame, setActiveGame] = useState<'menu' | 'memory' | 'tictactoe' | 'truthdare' | 'guessing' | 'wordscramble' | 'reactionspeed' | 'oddemoji' | 'moviecharades' | 'passthephone' | 'howwelldoyouknowme'>('menu');

  // Memory Match State
  const [cards, setCards] = useState<any[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [solved, setSolved] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);

  // Tic Tac Toe State
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);

  // Truth or Dare State
  const [todCard, setTodCard] = useState<{ type: string, text: string } | null>(null);

  // Guessing Game State
  const [targetNumber, setTargetNumber] = useState(0);
  const [guessInput, setGuessInput] = useState('');
  const [guessHistory, setGuessHistory] = useState<{guess: number, result: string}[]>([]);
  const [guessingWon, setGuessingWon] = useState(false);

  // Word Scramble State
  const [scrambleObj, setScrambleObj] = useState<{word: string, hint: string} | null>(null);
  const [scrambled, setScrambled] = useState('');
  const [scrambleInput, setScrambleInput] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [scrambleWon, setScrambleWon] = useState(false);

  // Reaction Speed State
  const [reactionState, setReactionState] = useState<'idle' | 'waiting' | 'ready' | 'finished'>('idle');
  const [reactionStartTime, setReactionStartTime] = useState(0);
  const [reactionTime, setReactionTime] = useState(0);
  const reactionTimerRef = useRef<any>(null);

  // Find Odd Emoji State
  const [oddLevel, setOddLevel] = useState(1);
  const [oddGrid, setOddGrid] = useState<string[]>([]);
  const [oddTargetIdx, setOddTargetIdx] = useState(-2);

  // Charades State
  const [charadesMovie, setCharadesMovie] = useState('');
  const [charadesTime, setCharadesTime] = useState(60);
  const [charadesActive, setCharadesActive] = useState(false);

  // Simple prompt games
  const [simplePrompt, setSimplePrompt] = useState<string>('');

  useEffect(() => {
    if (activeGame === 'memory') {
      initializeMemory();
    } else if (activeGame === 'tictactoe') {
      setBoard(Array(9).fill(null));
      setXIsNext(true);
    } else if (activeGame === 'truthdare') {
      setTodCard(null);
    } else if (activeGame === 'guessing') {
      initializeGuessing();
    } else if (activeGame === 'wordscramble') {
      initializeScramble();
    } else if (activeGame === 'reactionspeed') {
      setReactionState('idle');
    } else if (activeGame === 'oddemoji') {
      initializeOddEmoji(1);
    } else if (activeGame === 'moviecharades') {
      setCharadesMovie('');
      setCharadesTime(60);
      setCharadesActive(false);
    } else if (activeGame === 'passthephone') {
      nextSimplePrompt(PASS_PHONE_PROMPTS);
    } else if (activeGame === 'howwelldoyouknowme') {
      nextSimplePrompt(COUPLE_QUIZ);
    }
    
    // Clear reaction timer on unmount/switch
    return () => {
      if (reactionTimerRef.current) clearTimeout(reactionTimerRef.current);
    }
  }, [activeGame]);

  const nextSimplePrompt = (list: string[]) => {
    setSimplePrompt(list[Math.floor(Math.random() * list.length)]);
  };

  const initializeScramble = () => {
    const obj = SCRAMBLE_WORDS[Math.floor(Math.random() * SCRAMBLE_WORDS.length)];
    setScrambleObj(obj);
    let arr = obj.word.split('');
    // Scramble logic
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setScrambled(arr.join(''));
    setScrambleInput('');
    setShowHint(false);
    setScrambleWon(false);
  };

  const checkScramble = (e: React.FormEvent) => {
    e.preventDefault();
    if (scrambleObj && scrambleInput.toUpperCase() === scrambleObj.word) {
      setScrambleWon(true);
    }
  };

  const startReactionTest = () => {
    setReactionState('waiting');
    setReactionTime(0);
    const delay = Math.floor(Math.random() * 3000) + 2000; // 2 to 5 seconds
    reactionTimerRef.current = setTimeout(() => {
      setReactionState('ready');
      setReactionStartTime(Date.now());
    }, delay);
  };

  const clickReaction = () => {
    if (reactionState === 'waiting') {
      clearTimeout(reactionTimerRef.current);
      setReactionState('finished');
      setReactionTime(-1); // Too early
    } else if (reactionState === 'ready') {
      const time = Date.now() - reactionStartTime;
      setReactionTime(time);
      setReactionState('finished');
    }
  };

  const initializeOddEmoji = (level: number) => {
    setOddLevel(level);
    const normalEmojis = ['🙂', '😎', '😐', '😟', '😥', '😲', '😴', '😏'];
    const oddEmojis    = ['🙃', '🤓', '😑', '🥺', '😓', '🥱', '😪', '😒'];
    const pairIdx = Math.floor(Math.random() * normalEmojis.length);
    
    const size = level < 3 ? 9 : (level < 6 ? 16 : 25);
    let newGrid = Array(size).fill(normalEmojis[pairIdx]);
    const targetIdx = Math.floor(Math.random() * size);
    newGrid[targetIdx] = oddEmojis[pairIdx];
    
    setOddGrid(newGrid);
    setOddTargetIdx(targetIdx);
  };

  const handleOddEmojiClick = (idx: number) => {
    if (idx === oddTargetIdx) {
      if (oddLevel >= 10) {
        // You won all 10 levels
        setOddTargetIdx(-1); // mark win
      } else {
        initializeOddEmoji(oddLevel + 1);
      }
    } else {
      // Wrong
      initializeOddEmoji(1);
    }
  };

  useEffect(() => {
    let interval: any;
    if (charadesActive && charadesTime > 0) {
      interval = setInterval(() => setCharadesTime(t => t - 1), 1000);
    } else if (charadesTime === 0) {
      setCharadesActive(false);
    }
    return () => clearInterval(interval);
  }, [charadesActive, charadesTime]);

  const startCharades = () => {
    setCharadesMovie(TELUGU_MOVIES[Math.floor(Math.random() * TELUGU_MOVIES.length)]);
    setCharadesTime(60);
    setCharadesActive(true);
  };

  const initializeGuessing = () => {
    setTargetNumber(Math.floor(Math.random() * 100) + 1);
    setGuessInput('');
    setGuessHistory([]);
    setGuessingWon(false);
  };

  const handleGuessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (guessingWon) return;
    const num = parseInt(guessInput);
    if (!num || num < 1 || num > 100) return;

    let result = '';
    if (num === targetNumber) {
      result = 'Correct!';
      setGuessingWon(true);
    } else if (num < targetNumber) {
      result = 'Too low!';
    } else {
      result = 'Too high!';
    }
    
    setGuessHistory([{ guess: num, result }, ...guessHistory]);
    setGuessInput('');
  };

  const initializeMemory = () => {
    const deck = [...EMOJIS, ...EMOJIS]
      .sort(() => Math.random() - 0.5)
      .map((emoji, idx) => ({ id: idx, emoji }));
    setCards(deck);
    setFlipped([]);
    setSolved([]);
    setMoves(0);
  };

  const handleCardClick = (idx: number) => {
    if (flipped.includes(idx) || solved.includes(idx) || flipped.length === 2) return;
    
    const newFlipped = [...flipped, idx];
    setFlipped(newFlipped);
    
    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const isMatch = cards[newFlipped[0]].emoji === cards[newFlipped[1]].emoji;
      setTimeout(() => {
        if (isMatch) {
          setSolved(s => [...s, ...newFlipped]);
        }
        setFlipped([]);
      }, 1000);
    }
  };

  // Tic Tac Toe logic
  const calculateWinner = (squares: (string | null)[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const handleClickTTT = (i: number) => {
    if (board[i] || calculateWinner(board)) return;
    const newBoard = [...board];
    newBoard[i] = xIsNext ? 'X' : 'O';
    setBoard(newBoard);
    setXIsNext(!xIsNext);
  };

  const tttWinner = calculateWinner(board);
  const isDraw = !tttWinner && !board.includes(null);

  // Truth or Dare logic
  const drawTodCard = (type: 'Truth' | 'Dare') => {
    const list = type === 'Truth' ? TRUTHS : DARES;
    const randomItem = list[Math.floor(Math.random() * list.length)];
    setTodCard({ type, text: randomItem });
  };

  if (activeGame === 'menu') {
    return (
      <div className="flex flex-col gap-4 pb-8">
        <div className="dark-card text-center p-6 bg-black/40">
           <h2 className="heading-title text-amber-500 mb-6 flex justify-center items-center gap-2">
              <Gamepad2 className="w-6 h-6" /> Smiley's Arcade
           </h2>
           
           <h3 className="text-left text-rose-300 font-bold uppercase tracking-widest text-xs mb-3 flex items-center gap-2">
             <Circle className="w-3 h-3 fill-rose-500 stroke-rose-500" /> Solo Games
           </h3>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
              <button onClick={() => setActiveGame('memory')} className="flex items-center p-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl transition-colors">
                 <div className="w-10 h-10 bg-rose-500/20 rounded-full flex items-center justify-center mr-4 shrink-0">
                    <Heart className="w-5 h-5 text-rose-500" />
                 </div>
                 <div className="text-left">
                    <h3 className="text-white font-bold text-base leading-tight">Memory Match</h3>
                    <p className="text-[10px] text-rose-300">Find pairs</p>
                 </div>
              </button>
              <button onClick={() => setActiveGame('wordscramble')} className="flex items-center p-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl transition-colors">
                 <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center mr-4 shrink-0">
                    <Shuffle className="w-5 h-5 text-amber-500" />
                 </div>
                 <div className="text-left">
                    <h3 className="text-white font-bold text-base leading-tight">Word Scramble</h3>
                    <p className="text-[10px] text-amber-300">Unscramble words</p>
                 </div>
              </button>
              <button onClick={() => setActiveGame('reactionspeed')} className="flex items-center p-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl transition-colors">
                 <div className="w-10 h-10 bg-cyan-500/20 rounded-full flex items-center justify-center mr-4 shrink-0">
                    <Zap className="w-5 h-5 text-cyan-500" />
                 </div>
                 <div className="text-left">
                    <h3 className="text-white font-bold text-base leading-tight">Reaction Speed Test</h3>
                    <p className="text-[10px] text-cyan-300">Test your reflexes</p>
                 </div>
              </button>
              <button onClick={() => setActiveGame('oddemoji')} className="flex items-center p-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl transition-colors">
                 <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center mr-4 shrink-0">
                    <Search className="w-5 h-5 text-emerald-500" />
                 </div>
                 <div className="text-left">
                    <h3 className="text-white font-bold text-base leading-tight">Find The Odd Emoji</h3>
                    <p className="text-[10px] text-emerald-300">Find the hidden difference</p>
                 </div>
              </button>
              <button onClick={() => setActiveGame('guessing')} className="flex items-center p-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl transition-colors">
                 <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center mr-4 shrink-0">
                    <HelpCircle className="w-5 h-5 text-blue-500" />
                 </div>
                 <div className="text-left">
                    <h3 className="text-white font-bold text-base leading-tight">Number Guess</h3>
                    <p className="text-[10px] text-blue-300">Find the secret number</p>
                 </div>
              </button>
           </div>

           <h3 className="text-left text-fuchsia-300 font-bold uppercase tracking-widest text-xs mb-3 flex items-center gap-2">
             <Circle className="w-3 h-3 fill-fuchsia-500 stroke-fuchsia-500" /> Friend Games
           </h3>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
              <button onClick={() => setActiveGame('moviecharades')} className="flex items-center p-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl transition-colors">
                 <div className="w-10 h-10 bg-fuchsia-500/20 rounded-full flex items-center justify-center mr-4 shrink-0">
                    <Film className="w-5 h-5 text-fuchsia-500" />
                 </div>
                 <div className="text-left">
                    <h3 className="text-white font-bold text-base leading-tight">Telugu Charades</h3>
                    <p className="text-[10px] text-fuchsia-300">Act movies without speaking</p>
                 </div>
              </button>
              <button onClick={() => setActiveGame('tictactoe')} className="flex items-center p-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl transition-colors">
                 <div className="w-10 h-10 bg-teal-500/20 rounded-full flex items-center justify-center mr-4 shrink-0">
                    <Users className="w-5 h-5 text-teal-500" />
                 </div>
                 <div className="text-left">
                    <h3 className="text-white font-bold text-base leading-tight">Tic Tac Toe</h3>
                    <p className="text-[10px] text-teal-300">Classic rules</p>
                 </div>
              </button>
              <button onClick={() => setActiveGame('truthdare')} className="flex items-center p-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl transition-colors">
                 <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center mr-4 shrink-0">
                    <Dices className="w-5 h-5 text-purple-500" />
                 </div>
                 <div className="text-left">
                    <h3 className="text-white font-bold text-base leading-tight">Truth or Dare</h3>
                    <p className="text-[10px] text-purple-300">Party game</p>
                 </div>
              </button>
              <button onClick={() => setActiveGame('passthephone')} className="flex items-center p-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl transition-colors">
                 <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center mr-4 shrink-0">
                    <Smartphone className="w-5 h-5 text-orange-500" />
                 </div>
                 <div className="text-left">
                    <h3 className="text-white font-bold text-base leading-tight">Pass The Phone</h3>
                    <p className="text-[10px] text-orange-300">Perfect for bus trips</p>
                 </div>
              </button>
           </div>

           <h3 className="text-left text-pink-300 font-bold uppercase tracking-widest text-xs mb-3 flex items-center gap-2">
             <Circle className="w-3 h-3 fill-pink-500 stroke-pink-500" /> Couple Games
           </h3>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <button onClick={() => setActiveGame('howwelldoyouknowme')} className="flex items-center p-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl transition-colors">
                 <div className="w-10 h-10 bg-pink-500/20 rounded-full flex items-center justify-center mr-4 shrink-0">
                    <UserPlus className="w-5 h-5 text-pink-500" />
                 </div>
                 <div className="text-left">
                    <h3 className="text-white font-bold text-base leading-tight">How Well Do You Know Me?</h3>
                    <p className="text-[10px] text-pink-300">Relationship Quiz</p>
                 </div>
              </button>
           </div>

        </div>
      </div>
    );
  }

  const HeartIcon = Heart;

  const showConfetti = 
    (activeGame === 'memory' && solved.length === 16) ||
    (activeGame === 'guessing' && guessingWon) ||
    (activeGame === 'tictactoe' && tttWinner) ||
    (activeGame === 'wordscramble' && scrambleWon) ||
    (activeGame === 'oddemoji' && oddTargetIdx === -1);

  return (
    <div className="flex flex-col gap-4 relative">
      <button onClick={() => setActiveGame('menu')} className="text-sm font-bold text-gray-300 hover:text-white flex items-center transition-colors self-start uppercase tracking-wider mb-2">
        <ChevronLeft className="w-6 h-6 mr-1" /> Back to Arcade
      </button>

      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <Confetti 
            width={window.innerWidth} 
            height={window.innerHeight} 
            recycle={false} 
            numberOfPieces={600} 
            gravity={0.15}
            colors={['#f43f5e', '#ec4899', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b']}
          />
        </div>
      )}

      {activeGame === 'memory' && (
        <div className="dark-card text-center p-6 bg-black/40">
           <h2 className="heading-title text-rose-400 mb-2 font-sans tracking-tight">Memory Match</h2>
           
           <div className="flex justify-between items-center bg-white/5 border border-white/10 rounded-xl p-3 mb-6 font-bold font-sans">
              <span className="text-rose-400">Moves: {moves}</span>
              <span className="text-emerald-400">Matches: {solved.length / 2} / 8</span>
           </div>
           
           <div className="grid grid-cols-4 gap-3 mb-8 perspective-1000">
              {cards.map((card, idx) => {
                 const isFlipped = flipped.includes(idx) || solved.includes(idx);
                 return (
                   <div 
                     key={idx} 
                     onClick={() => handleCardClick(idx)}
                     className={`relative aspect-square cursor-pointer transition-transform duration-500 preserve-3d ${
                       isFlipped ? 'rotate-y-180' : ''
                     }`}
                     style={{ transformStyle: 'preserve-3d' }}
                   >
                     {/* Front (Hidden) */}
                     <div className="absolute inset-0 backface-hidden bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center justify-center shadow-md">
                       <HeartIcon className="w-6 h-6 text-rose-500/40" />
                     </div>
                     
                     {/* Back (Revealed) */}
                     <div 
                       className="absolute inset-0 backface-hidden bg-white/10 border border-white/20 rounded-xl flex items-center justify-center text-3xl shadow-lg"
                       style={{ transform: 'rotateY(180deg)' }}
                     >
                       {card.emoji}
                     </div>
                   </div>
                 )
              })}
           </div>

           {solved.length === 16 && (
              <div className="text-center mb-6 animate-pulse">
                 <h3 className="text-xl font-bold text-amber-400 flex items-center justify-center gap-2">
                   <Heart className="w-5 h-5 text-amber-500 fill-amber-500" /> You Won Smiley!
                 </h3>
                 <p className="text-xs text-amber-400/60 mt-1">Great job!</p>
              </div>
           )}
           
           <button onClick={initializeMemory} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-rose-600 text-white font-bold p-4 rounded-xl shadow-[0_0_20px_rgba(244,63,94,0.3)] hover:scale-[1.02] transition-transform">
              <RefreshCcw className="w-5 h-5" /> Restart Game
           </button>
        </div>
      )}

      {activeGame === 'tictactoe' && (
        <div className="dark-card text-center p-6 bg-black/40">
           <h2 className="heading-title text-emerald-400 mb-6 font-sans tracking-tight">Tic Tac Toe</h2>
           
           <div className="flex justify-center items-center mb-6">
              <span className={`px-4 py-2 rounded-full text-sm font-bold border ${tttWinner || isDraw ? (tttWinner ? 'bg-amber-500/20 border-amber-500 text-amber-400' : 'bg-gray-500/20 border-gray-500 text-gray-400') : (xIsNext ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' : 'bg-pink-500/20 border-pink-500 text-pink-400')}`}>
                 {tttWinner ? `Winner: ${tttWinner}` : isDraw ? "It's a Draw!" : `Next Player: ${xIsNext ? 'X' : 'O'}`}
              </span>
           </div>
           
           <div className="grid grid-cols-3 gap-2 w-64 mx-auto mb-8 bg-white/10 p-2 rounded-2xl">
              {board.map((cell, idx) => (
                 <button 
                   key={idx} 
                   onClick={() => handleClickTTT(idx)}
                   className="w-full aspect-square bg-gray-900/80 hover:bg-gray-800 rounded-xl flex items-center justify-center text-4xl font-black transition-colors"
                 >
                   {cell === 'X' && <X className="w-10 h-10 text-cyan-400" strokeWidth={3} />}
                   {cell === 'O' && <Circle className="w-8 h-8 text-pink-400" strokeWidth={3} />}
                 </button>
              ))}
           </div>
           
           <button onClick={() => { setBoard(Array(9).fill(null)); setXIsNext(true); }} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold p-4 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-[1.02] transition-transform">
              <RefreshCcw className="w-5 h-5" /> Restart Game
           </button>
        </div>
      )}

      {activeGame === 'truthdare' && (
        <div className="dark-card text-center p-6 bg-black/40">
           <h2 className="heading-title text-purple-400 mb-6 font-sans tracking-tight">Truth or Dare</h2>
           
           {todCard ? (
             <div className="w-full min-h-[220px] bg-gradient-to-br from-purple-900/40 to-fuchsia-900/40 border border-purple-500/30 rounded-2xl p-6 flex flex-col items-center justify-center mb-8 shadow-inner animate-fadeIn">
                <span className={`text-sm font-black uppercase tracking-widest mb-4 ${todCard.type === 'Truth' ? 'text-cyan-400' : 'text-rose-400'}`}>
                  {todCard.type}
                </span>
                <p className="text-xl text-white font-serif italic text-balance mb-6">{todCard.text}</p>
                <button onClick={() => setTodCard(null)} className="text-xs text-white/50 hover:text-white uppercase tracking-widest font-bold px-4 py-2 border border-white/10 rounded-full transition-colors">
                  Clear Card
                </button>
             </div>
           ) : (
             <div className="w-full min-h-[220px] border-2 border-dashed border-white/10 rounded-2xl flex items-center justify-center mb-8 p-6">
                <p className="text-sm text-white/40 uppercase tracking-widest font-bold text-balance">
                  Choose your fate
                </p>
             </div>
           )}
           
           <div className="grid grid-cols-2 gap-4">
              <button onClick={() => drawTodCard('Truth')} className="bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-300 font-bold p-4 rounded-xl transition-colors text-lg tracking-wide shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                 Truth
              </button>
              <button onClick={() => drawTodCard('Dare')} className="bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/50 text-rose-300 font-bold p-4 rounded-xl transition-colors text-lg tracking-wide shadow-[0_0_15px_rgba(244,63,94,0.2)]">
                 Dare
              </button>
           </div>
        </div>
      )}

      {activeGame === 'guessing' && (
        <div className="dark-card text-center p-6 bg-black/40">
           <h2 className="heading-title text-blue-400 mb-2 font-sans tracking-tight">Number Guess</h2>
           <p className="text-white/60 text-sm mb-6">I am thinking of a number between 1 and 100.</p>

           <div className="mb-6">
              {guessingWon ? (
                <div className="animate-pulse">
                  <h3 className="text-2xl font-black text-blue-400 mb-2">You Got It!</h3>
                  <p className="text-white text-lg">The number was {targetNumber}</p>
                </div>
              ) : (
                <form onSubmit={handleGuessSubmit} className="flex gap-2 justify-center">
                  <input 
                    type="number" 
                    value={guessInput}
                    onChange={(e) => setGuessInput(e.target.value)}
                    className="w-24 bg-white/10 border-2 border-white/20 rounded-xl text-center text-xl font-bold text-white focus:border-blue-500 outline-none p-3"
                    placeholder="??"
                    min="1"
                    max="100"
                  />
                  <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 rounded-xl transition-colors">
                    Guess
                  </button>
                </form>
              )}
           </div>

           <div className="bg-white/5 rounded-xl p-4 min-h-[120px] max-h-[160px] overflow-y-auto w-full max-w-[240px] mx-auto flex flex-col gap-2 mb-6">
              {guessHistory.length === 0 && !guessingWon && (
                <span className="text-white/30 text-sm italic my-auto">No guesses yet...</span>
              )}
              {guessHistory.map((g, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm font-bold border-b border-white/5 pb-1">
                  <span className="text-white">{g.guess}</span>
                  <span className={g.result === 'Correct!' ? 'text-blue-400' : (g.result === 'Too low!' ? 'text-cyan-400' : 'text-rose-400')}>
                    {g.result}
                  </span>
                </div>
              ))}
           </div>

           <button onClick={initializeGuessing} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold p-4 rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:scale-[1.02] transition-transform">
              <RefreshCcw className="w-5 h-5" /> {guessingWon ? 'Play Again' : 'Restart Game'}
           </button>
        </div>
      )}
      {activeGame === 'wordscramble' && (
        <div className="dark-card text-center p-6 bg-black/40">
           <h2 className="heading-title text-amber-500 mb-6 font-sans tracking-tight">Word Scramble</h2>
           
           <div className="mb-8">
              {scrambleWon ? (
                 <div className="animate-pulse">
                   <h3 className="text-2xl font-black text-amber-400 mb-2">Correct!</h3>
                   <p className="text-white text-lg">The word was {scrambleObj?.word}</p>
                 </div>
              ) : (
                <>
                  <div className="text-4xl font-black tracking-[0.2em] text-white mb-6 bg-white/5 p-6 rounded-2xl border border-white/10 break-all shadow-inner">
                    {scrambled}
                  </div>
                  
                  {showHint && (
                    <p className="text-amber-300/80 text-sm italic mb-6">Hint: {scrambleObj?.hint}</p>
                  )}
                  
                  <form onSubmit={checkScramble} className="flex flex-col gap-4 max-w-[240px] mx-auto">
                    <input 
                      type="text" 
                      value={scrambleInput}
                      onChange={(e) => setScrambleInput(e.target.value.toUpperCase())}
                      className="bg-white/10 border-2 border-white/20 rounded-xl text-center text-xl font-bold text-white focus:border-amber-500 outline-none p-3 uppercase"
                      placeholder="Type word..."
                    />
                    <button type="submit" className="bg-amber-600 hover:bg-amber-500 text-white font-bold p-3 rounded-xl transition-colors">
                      Check Word
                    </button>
                    {!showHint && (
                      <button type="button" onClick={() => setShowHint(true)} className="text-xs text-amber-400/60 hover:text-amber-400 font-bold uppercase tracking-widest mt-2 transition-colors">
                        Show Hint
                      </button>
                    )}
                  </form>
                </>
              )}
           </div>

           <button onClick={initializeScramble} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold p-4 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:scale-[1.02] transition-transform">
              <RefreshCcw className="w-5 h-5" /> {scrambleWon ? 'Next Word' : 'Skip Word'}
           </button>
        </div>
      )}

      {activeGame === 'reactionspeed' && (
        <div className="dark-card text-center p-6 bg-black/40">
           <h2 className="heading-title text-cyan-400 mb-6 font-sans tracking-tight">Reaction Speed Test</h2>
           
           <div 
             onClick={clickReaction}
             className={`w-full aspect-square max-w-[300px] mx-auto rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-colors border-4 shadow-xl mb-6 select-none ${
               reactionState === 'idle' ? 'bg-white/5 border-white/10 hover:bg-white/10' :
               reactionState === 'waiting' ? 'bg-rose-500 border-rose-400 shadow-[0_0_40px_rgba(244,63,94,0.5)]' :
               reactionState === 'ready' ? 'bg-emerald-500 border-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.5)] transform scale-[1.02]' :
               reactionTime > 0 ? 'bg-cyan-500/20 border-cyan-500/50' : 'bg-rose-500/20 border-rose-500/50'
             }`}
           >
             {reactionState === 'idle' && (
               <div className="text-white/60 font-bold">Tap here to start.<br/><br/>Wait for green.</div>
             )}
             {reactionState === 'waiting' && (
               <div className="text-white text-3xl font-black uppercase tracking-widest">Wait...</div>
             )}
             {reactionState === 'ready' && (
               <div className="text-white text-5xl font-black uppercase tracking-widest">TAP!</div>
             )}
             {reactionState === 'finished' && (
               <div className="flex flex-col items-center gap-2">
                 {reactionTime === -1 ? (
                   <>
                     <span className="text-4xl">🙈</span>
                     <span className="text-rose-400 font-bold text-xl uppercase tracking-widest">Too Early!</span>
                   </>
                 ) : (
                   <>
                     <span className="text-cyan-400 font-black text-5xl">{reactionTime}<span className="text-2xl text-cyan-500/70 ml-1">ms</span></span>
                     <span className="text-cyan-200 text-sm font-bold uppercase tracking-widest">Reaction Time</span>
                   </>
                 )}
               </div>
             )}
           </div>

           <button onClick={startReactionTest} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-bold p-4 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:scale-[1.02] transition-transform">
              <Zap className="w-5 h-5 fill-white" /> {(reactionState === 'idle') ? 'Start Test' : 'Try Again'}
           </button>
        </div>
      )}

      {activeGame === 'oddemoji' && (
        <div className="dark-card text-center p-6 bg-black/40">
           <h2 className="heading-title text-emerald-400 mb-2 font-sans tracking-tight">Find The Odd Emoji</h2>
           
           <div className="flex justify-between items-center mb-6">
              <span className="text-white/50 text-sm font-bold">Find the difference</span>
              <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-sm font-black border border-emerald-500/30">Level {oddLevel}</span>
           </div>
           
           {oddTargetIdx === -1 ? (
              <div className="py-12 animate-pulse">
                 <h3 className="text-3xl font-black text-emerald-400 mb-2">You Won Smiley!</h3>
                 <p className="text-white text-lg">Amazing Eyesight!</p>
              </div>
           ) : (
              <div 
                className="grid gap-2 mx-auto mb-8 bg-white/5 p-4 rounded-3xl"
                style={{ 
                  gridTemplateColumns: `repeat(${Math.sqrt(oddGrid.length)}, minmax(0, 1fr))`,
                  maxWidth: oddLevel < 3 ? '240px' : oddLevel < 6 ? '280px' : '320px'
                }}
              >
                {oddGrid.map((emoji, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => handleOddEmojiClick(idx)}
                    className="aspect-square bg-black/20 hover:bg-white/10 rounded-xl flex items-center justify-center text-3xl transition-transform active:scale-90"
                    style={{ fontSize: oddLevel < 3 ? '40px' : oddLevel < 6 ? '32px' : '24px' }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
           )}

           <button onClick={() => initializeOddEmoji(1)} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold p-4 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-[1.02] transition-transform">
              <RefreshCcw className="w-5 h-5" /> {oddTargetIdx === -1 ? 'Play Again' : 'Restart Game'}
           </button>
        </div>
      )}

      {activeGame === 'moviecharades' && (
        <div className="dark-card text-center p-6 bg-black/40">
           <h2 className="heading-title text-fuchsia-400 mb-6 font-sans tracking-tight">Telugu Charades</h2>
           
           <div className="w-full min-h-[220px] bg-gradient-to-br from-fuchsia-900/40 to-pink-900/40 border border-fuchsia-500/30 rounded-2xl p-6 flex flex-col items-center justify-center mb-8 shadow-inner shadow-[inset_0_0_40px_rgba(217,70,239,0.1)]">
              {charadesActive ? (
                <>
                  <p className="text-sm text-fuchsia-300 font-bold uppercase tracking-widest mb-4">Act this movie:</p>
                  <h3 className="text-4xl text-white font-black mb-8 leading-tight drop-shadow-md">{charadesMovie}</h3>
                  <div className="flex items-center gap-2 text-3xl font-mono text-fuchsia-400 font-bold">
                    <span className="w-3 h-3 rounded-full bg-fuchsia-500 animate-pulse"></span>
                    {charadesTime}s
                  </div>
                </>
              ) : (
                <div className="text-center opacity-60">
                  <Film className="w-16 h-16 text-white mb-4 mx-auto" />
                  <p className="text-white font-bold uppercase tracking-widest text-sm">Tap start to get a movie</p>
                </div>
              )}
           </div>

           <button onClick={startCharades} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-fuchsia-500 to-fuchsia-600 text-white font-bold p-4 rounded-xl shadow-[0_0_20px_rgba(217,70,239,0.3)] hover:scale-[1.02] transition-transform">
              {charadesActive ? <RefreshCcw className="w-5 h-5" /> : <Film className="w-5 h-5" />} 
              {charadesActive ? 'Skip & Draw New' : 'Start Timer'}
           </button>
        </div>
      )}

      {(activeGame === 'passthephone' || activeGame === 'howwelldoyouknowme') && (
        <div className="dark-card text-center p-6 bg-black/40">
           <h2 className="heading-title mb-6 font-sans tracking-tight" style={{ color: activeGame === 'passthephone' ? '#f97316' : '#ec4899' }}>
             {activeGame === 'passthephone' ? 'Pass The Phone' : 'Relationship Quiz'}
           </h2>
           
           <div className={`w-full min-h-[260px] bg-gradient-to-br ${activeGame === 'passthephone' ? 'from-orange-900/40 to-red-900/40 border-orange-500/30' : 'from-pink-900/40 to-rose-900/40 border-pink-500/30'} border rounded-2xl p-8 flex flex-col items-center justify-center mb-8 shadow-inner`}>
              <p className="text-2xl text-white font-serif italic text-balance mb-6">{simplePrompt}</p>
           </div>
           
           <button 
             onClick={() => nextSimplePrompt(activeGame === 'passthephone' ? PASS_PHONE_PROMPTS : COUPLE_QUIZ)} 
             className={`w-full flex items-center justify-center gap-2 bg-gradient-to-r text-white font-bold p-4 rounded-xl hover:scale-[1.02] transition-transform ${activeGame === 'passthephone' ? 'from-orange-500 to-orange-600 shadow-[0_0_20px_rgba(249,115,22,0.3)]' : 'from-pink-500 to-pink-600 shadow-[0_0_20px_rgba(236,72,153,0.3)]'}`}
           >
              <Shuffle className="w-5 h-5" /> {activeGame === 'passthephone' ? 'Next Prompt' : 'Next Question'}
           </button>
        </div>
      )}
    </div>
  );
}

function HeartIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
    </svg>
  );
}
