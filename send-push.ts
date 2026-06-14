// Backend push script to be executed out-of-band via GitHub Actions

import webpush from 'web-push';
import { 
  DAILY_QUOTES, 
  NICKNAMES, 
  MORNING_MESSAGES, 
  REMINDER_MESSAGES, 
  LUNCH_MESSAGES, 
  EVENING_MESSAGES,
  BIBLE_VERSES,
  WATER_MESSAGES
} from './src/data';

const KVDB_URL = 'https://kvdb.io/ZP1mwWeRkfGeafHJtg3yA/subscription';

async function run() {
  // 1. Fetch Subscription from Database
  let subscription;
  try {
    const res = await fetch(KVDB_URL);
    if (!res.ok) return;
    const data = await res.text();
    if (!data.trim()) return;
    subscription = JSON.parse(data);
  } catch (err) {
    console.error('Error fetching subscription:', err);
    return;
  }

  // 2. Setup VAPID Credentials
  const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

  if (!vapidPublicKey || !vapidPrivateKey) {
    console.error('Missing VAPID_PUBLIC_KEY or VAPID_PRIVATE_KEY environment variables');
    return;
  }

  webpush.setVapidDetails(
    'mailto:hello@example.com',
    vapidPublicKey,
    vapidPrivateKey
  );

  // 3. Calculate current date in IST (UTC + 5:30) to sync the exact quote of the day
  const nowUtc = new Date();
  const nowIst = new Date(nowUtc.getTime() + 5.5 * 60 * 60 * 1000);
  const start = new Date(nowIst.getFullYear(), 0, 0);
  const diff = nowIst.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  const dailyQuote = DAILY_QUOTES[dayOfYear % DAILY_QUOTES.length];

  const nickname = NICKNAMES[Math.floor(Math.random() * NICKNAMES.length)];

  const hour = nowIst.getHours();
  let title = 'Hello Smiley! 💖';
  let body = 'Thinking of you!';
  let url = './';

  if (hour === 5) {
    // 5:40 AM IST
    const dailyVerse = BIBLE_VERSES[dayOfYear % BIBLE_VERSES.length];
    const morningMsg = MORNING_MESSAGES[Math.floor(Math.random() * MORNING_MESSAGES.length)];
    title = `Good morning ${nickname}! ☀️📖`;
    body = `${morningMsg}\nToday's Verse: ${dailyVerse.ref} - "${dailyVerse.eng}"`;
    url = './?tab=bible';
  } else if (hour === 8) {
    // 8:45 AM IST
    title = `Morning Reminder ${nickname}! 📚`;
    body = REMINDER_MESSAGES[Math.floor(Math.random() * REMINDER_MESSAGES.length)];
    url = './';
  } else if ([10, 12, 14, 16, 20, 22].includes(hour)) {
    // Water reminders every 2 hours: 10 AM, 12 PM, 2 PM, 4 PM, 8 PM, 10 PM IST
    title = `Hydration Check ${nickname}! 💧`;
    body = WATER_MESSAGES[Math.floor(Math.random() * WATER_MESSAGES.length)];
    url = './';
  } else if (hour === 13) {
    // 1:10 PM IST
    title = `Lunch time ${nickname}! 🍱`;
    body = LUNCH_MESSAGES[Math.floor(Math.random() * LUNCH_MESSAGES.length)];
    // Route to games during lunch to cheer her up!
    url = './?tab=games';
  } else if (hour === 18 || hour === 17) {
    // 6:00 PM IST
    title = `Evening ${nickname}! 🌅`;
    body = EVENING_MESSAGES[Math.floor(Math.random() * EVENING_MESSAGES.length)];
    // Route to radio in the evening so she can relax to music!
    url = './?tab=radio';
  } else {
    // default
    title = `Hey ${nickname}! 💖`;
    body = dailyQuote;
    // Default fallback alternates between games, radio, and bible to make manual tests interesting!
    const r = Math.random();
    if (r < 0.33) {
      url = './?tab=games';
    } else if (r < 0.66) {
      url = './?tab=radio';
    } else {
      url = './?tab=bible';
    }
  }

  // 4. Payload Content
  const payload = {
    title,
    body,
    icon: 'smilance-192.png',
    badge: 'smilance-192.png',
    url
  };

  // 5. Send notification
  try {
    const response = await webpush.sendNotification(
      subscription,
      JSON.stringify(payload)
    );
    console.log('Push sent! Status:', response.statusCode);
  } catch (err: any) {
    // 6. Clean up expired subscriptions
    if (err.statusCode === 410 || err.statusCode === 404) {
      console.log('Subscription expired. Deleting...');
      await fetch(KVDB_URL, { method: 'DELETE' });
    } else {
      console.error('Error sending push:', err);
    }
  }
}

run();
