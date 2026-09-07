/**
 * 🎂 Kanna's Birthday Surprise World - Central Content & Configuration
 * 
 * Edit this file to customize the questions, romantic letter text,
 * and birthday cake celebration messages anytime!
 */

export interface ChallengeOption {
  id: string;
  text: string;
  reaction: string;
}

export interface ChallengeQuestion {
  id: number;
  question: string;
  subtitle: string;
  options: ChallengeOption[];
}

export interface BirthdayLetterContent {
  salutation: string;
  title: string;
  paragraphs: string[];
  closing: string;
  signature: string;
  date: string;
  postscript: string;
}

export interface BirthdayCakeContent {
  preBlowTitle: string;
  preBlowSubtitle: string;
  buttonLabel: string;
  celebrationTitle: string;
  celebrationSubtitle: string;
  celebrationQuote: string;
}

/* ==========================================================================
   ACT 0: Celestial Portal Gate Config
   ========================================================================== */
export const BIRTHDAY_PORTAL_CONFIG = {
  welcomeTagline: "Happy Birthday, Kanna",
  welcomeSubtitle: "Welcome to a little universe created entirely for you...",
  unlockKeyText: "Tap the Heart Key to Enter Your World",
  annualUnlockMonth: 9, // September (1-indexed)
  annualUnlockDay: 8,   // September 8th
};

/* ==========================================================================
   ACT 1: The Sweetheart Trivia / Love Challenge Bank (10 Questions)
   ========================================================================== */
export const ALL_CHALLENGE_QUESTIONS: ChallengeQuestion[] = [
  {
    id: 1,
    question: "Who fell in love first?",
    subtitle: "Be completely honest, birthday girl...",
    options: [
      {
        id: "q1_a",
        text: "You did, undeniably!",
        reaction: "Guilty as charged! From the very first glance, my heart didn't stand a chance against you. 💖"
      },
      {
        id: "q1_b",
        text: "I did, without a single doubt!",
        reaction: "The sweetest confession ever! Hearing that makes my heart skip a million beats. 🥰"
      },
      {
        id: "q1_c",
        text: "Heaven wrote our story before we even met.",
        reaction: "100% correct! Destined by God before time itself began. 💖"
      }
    ]
  },
  {
    id: 2,
    question: "What is Kanna's greatest superpower?",
    subtitle: "Choose carefully, my princess...",
    options: [
      {
        id: "q2_a",
        text: "Melting my whole universe with one smile",
        reaction: "Every single day! One smile from you and whatever was bothering me instantly disappears. 😊"
      },
      {
        id: "q2_b",
        text: "Being the prettiest, sweetest girl alive",
        reaction: "An undeniable universal fact across every dimension! 👑"
      },
      {
        id: "q2_c",
        text: "All of the above, and a thousand wonders more",
        reaction: "Spot on! You are my miracle, my peace, and my entire happiness forever. 💖"
      }
    ]
  },
  {
    id: 3,
    question: "Where is my absolute favorite place in the whole universe?",
    subtitle: "Think about where I feel most at peace...",
    options: [
      {
        id: "q3_a",
        text: "Wherever your hand is holding mine",
        reaction: "Bingo! Anywhere with you is heaven. Home is wherever you are, Kanna. 💖"
      },
      {
        id: "q3_b",
        text: "In the middle of a late-night call listening to you laugh",
        reaction: "My favorite sound in existence! Your laugh is pure medicine to my soul. 🥰"
      },
      {
        id: "q3_c",
        text: "Right beside you, safe in your warmth",
        reaction: "That is my sanctuary. Nothing in this world feels softer or safer. 💖"
      }
    ]
  },
  {
    id: 4,
    question: "If I could grant you any gift today, what would it be?",
    subtitle: "Beyond all the boxes and ribbons...",
    options: [
      {
        id: "q4_a",
        text: "A lifetime of pure happiness and peaceful days",
        reaction: "My daily prayer for you! You deserve endless peace and joy, my love. 💖"
      },
      {
        id: "q4_b",
        text: "A magical mirror showing how breathtakingly gorgeous you are",
        reaction: "If you could see yourself through my eyes for one minute, you'd never doubt your beauty again! 👑"
      },
      {
        id: "q4_c",
        text: "Me loving you even more with every single heartbeat",
        reaction: "Consider it guaranteed! My love for you only grows deeper every single day. 💖"
      }
    ]
  },
  {
    id: 5,
    question: "Who is the cutest trouble-maker in this relationship?",
    subtitle: "We both know the answer to this one...",
    options: [
      {
        id: "q5_a",
        text: "Obviously Kanna, with zero competition!",
        reaction: "Haha, caught red-handed! But you are the most adorable trouble-maker in the universe. 🥰"
      },
      {
        id: "q5_b",
        text: "Nanna, teasing me all day long!",
        reaction: "Guilty! Teasing you and seeing your sweet smile is my favorite hobby! 😄"
      },
      {
        id: "q5_c",
        text: "A perfect tie, equally mischievous!",
        reaction: "Partners in crime forever! That's why we make the perfect team. 💖"
      }
    ]
  },
  {
    id: 6,
    question: "What made my heart skip the fastest when I first saw you?",
    subtitle: "A memory etched into my soul...",
    options: [
      {
        id: "q6_a",
        text: "Your gentle eyes that hold the whole sky",
        reaction: "The moment I looked into your eyes, I knew I was looking at my future. 💖"
      },
      {
        id: "q6_b",
        text: "That unforgettable, shy smile of yours",
        reaction: "It lit up the entire room and completely melted my heart on the spot! 🥰"
      },
      {
        id: "q6_c",
        text: "The pure, sweet warmth radiating from your presence",
        reaction: "You have a soul so gentle and beautiful that heaven itself smiles upon you. 💖"
      }
    ]
  },
  {
    id: 7,
    question: "What is our official love story genre?",
    subtitle: "If our journey was written as a novel...",
    options: [
      {
        id: "q7_a",
        text: "A sweet anime romance with infinite butterfly moments",
        reaction: "Complete with soft acoustic songs, gentle breezes, and endless love! 🌸"
      },
      {
        id: "q7_b",
        text: "A legendary eternal love written across destiny",
        reaction: "Written in the heavens before the stars were created! 💖"
      },
      {
        id: "q7_c",
        text: "A cozy, laughter-filled comedy where two best friends fall in love",
        reaction: "The purest kind of love. You are my best friend and my queen forever. 🥰"
      }
    ]
  },
  {
    id: 8,
    question: "How much does Nanna love Kanna?",
    subtitle: "Can this even be measured?",
    options: [
      {
        id: "q8_a",
        text: "More than all the drops of water in all the oceans",
        reaction: "And that's just on an ordinary Tuesday morning! My love is infinite. 💖"
      },
      {
        id: "q8_b",
        text: "More than every breath I will ever take",
        reaction: "Every single heartbeat belongs to you, today and for all my years. 🥰"
      },
      {
        id: "q8_c",
        text: "To infinity, beyond every horizon, and back again",
        reaction: "No boundaries, no limits, and no end. You are my everything, Kanna. 💖"
      }
    ]
  }
];

// Helper to pick 3 completely randomized questions each time she plays
export const getRandomChallengeQuestions = (count: number = 3): ChallengeQuestion[] => {
  const shuffled = [...ALL_CHALLENGE_QUESTIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

/* ==========================================================================
   ACT 2: The 3D Wax-Sealed Birthday Love Letter
   ========================================================================== */
export const BIRTHDAY_LETTER_DATA: BirthdayLetterContent = {
  salutation: "My Dearest, Sweetest Chinnoda,",
  title: "To the Girl Who Fills My Life With Sunshine",
  paragraphs: [
    "Today the entire universe celebrates the arrival of the most beautiful soul I have ever known. September 8th is not just another date on a calendar to me—it is the anniversary of the day God blessed this world with the person who would one day become my smile, my peace, and my entire heart.",
    "Every day spent loving you feels like reading my favorite poetry and living my dream life. You have this rare, tender grace about you that softens the hardest days and turns ordinary moments into memories I treasure with all my soul. Your laughter is my favorite melody, and your happiness will forever be my highest purpose.",
    "I couldn't imagine my life without you, and the thought of it is just unbearable. I just want you to be happy and to know that I am always here for you no matter what. I'll always love you and take care of you.",
    "No matter how many cold wars we have walked through, or whatever storms we might face in the future, we will always stand together and walk hand in hand into every new day with love. We will live our lives caring for and cherishing each other. Soon, we will build a world where we can lean on each other without the slightest hesitation—and with every passing day, I promise to keep learning how to make you feel even more deeply loved than the day before.",
    "As you celebrate another year of life, my only prayer is that God showers your path with boundless joy, overflowing laughter, unbreakable health, and dreams fulfilled beyond your wildest imagination.",
    "Thank you for being born, my bujji kannoda. Thank you for choosing me, for trusting me with your gentle heart, and for making this journey so profoundly beautiful. No matter where life leads us or how many years go by, my hand will always be holding yours."
  ],
  closing: "Forever and always yours,",
  signature: "Your Kanna 💖",
  date: `September 8th, ${new Date().getFullYear()}`,
  postscript: "P.S. Make sure you make a big, beautiful wish at the cake... because every prayer of mine already has your name written upon it, and i mean it."
};

/* ==========================================================================
   ACT 3: The Virtual Candle Cake Ceremony & Confetti
   ========================================================================== */
export const BIRTHDAY_CAKE_DATA: BirthdayCakeContent = {
  preBlowTitle: "Make a Birthday Wish",
  preBlowSubtitle: "Close your pretty eyes, make the deepest wish in your heart, and blow out your candle...",
  buttonLabel: "Tap to Blow Out Candle & Make a Wish",
  celebrationTitle: "Happy Birthday, Smiley!",
  celebrationSubtitle: "May every wish whispered in your heart today bloom into pure reality this year.",
  celebrationQuote: "You are my smile, my prayer answered, and my forever love. Have the most magical birthday, my queen!"
};
