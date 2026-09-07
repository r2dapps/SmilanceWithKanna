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
  const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || "BHpbJJPWCjx_tee8Ep9CLwCTzdmHKV4H086ualf8vHZxYyi70dvhMQh8nVIKGt1ZB-1c2ldbRFP3TSmWHcR_kHk";
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || "B1_biQnifPSdD_ivghoS_RmuJ1X5L9Q9Yu3ME1bNGJo";

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
  
  // Define scheduled times to handle GitHub Action delays
  const SCHEDULED_TIMES = [
    { h: 5, m: 40 }, { h: 8, m: 45 }, { h: 10, m: 0 },
    { h: 12, m: 0 }, { h: 13, m: 10 }, { h: 14, m: 0 },
    { h: 16, m: 0 }, { h: 18, m: 0 }, { h: 20, m: 0 }, { h: 22, m: 0 }
  ];

  let targetTime: Date | null = null;
  let targetHour = nowIst.getHours();

  // Find the nearest scheduled time (within 40 mins)
  let minDiff = Infinity;
  for (const t of SCHEDULED_TIMES) {
    const scheduledIst = new Date(nowIst);
    scheduledIst.setHours(t.h, t.m, 0, 0);
    const diffMs = scheduledIst.getTime() - nowIst.getTime();
    if (Math.abs(diffMs) < 40 * 60 * 1000) {
      if (Math.abs(diffMs) < minDiff) {
        minDiff = diffMs;
        targetTime = scheduledIst;
        targetHour = t.h;
      }
    }
  }

  if (targetTime) {
    const waitMs = targetTime.getTime() - new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000).getTime();
    if (process.env.IS_GITHUB_ACTION === 'true') {
      if (waitMs > 0) {
        console.log(`Action ran early. Waiting ${Math.round(waitMs / 1000 / 60)} minutes until exactly ${targetTime.getHours()}:${targetTime.getMinutes().toString().padStart(2, '0')} IST...`);
        await new Promise(r => setTimeout(r, waitMs));
      } else {
        console.log(`Action is running slightly late or exactly on time. Sending immediately.`);
      }
    } else {
      console.log(`Local run detected. Skipping the ${Math.round(waitMs / 1000 / 60)} minute wait delay.`);
    }
  }

  const start = new Date(nowIst.getFullYear(), 0, 0);
  const diff = nowIst.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  const dailyQuote = DAILY_QUOTES[dayOfYear % DAILY_QUOTES.length];

  const nickname = NICKNAMES[Math.floor(Math.random() * NICKNAMES.length)];

  // Use targetHour so we select the correct message even if the action ran in the previous hour
  const hour = targetHour;
  let title = 'Hello Smiley! 💖';
  let body = 'Thinking of you!';
  let url = './';

  // Check if a custom push message was queued from the Admin console
  let isCustomPush = false;
  try {
    const customRes = await fetch('https://kvdb.io/ZP1mwWeRkfGeafHJtg3yA/custom_push');
    if (customRes.ok) {
      const text = await customRes.text();
      if (text && text.trim()) {
        const customData = JSON.parse(text);
        if (customData && customData.title && customData.body) {
          title = customData.title;
          body = customData.body;
          if (customData.url) url = customData.url;
          isCustomPush = true;
          console.log(`Discovered queued admin push: "${title}"`);
          // Clean up consumed custom push
          await fetch('https://kvdb.io/ZP1mwWeRkfGeafHJtg3yA/custom_push', { method: 'DELETE' });
        }
      }
    }
  } catch (err) {
    // Silently continue to scheduled messages
  }

  // If not a custom push, use scheduled date-based messages
  if (!isCustomPush) {
    // Birthday Season Check (Annual recurrence in IST)
    const isSept7 = (nowIst.getMonth() + 1) === 9 && nowIst.getDate() === 7;
    const isSept8 = (nowIst.getMonth() + 1) === 9 && nowIst.getDate() === 8;

  if (isSept8) {
    title = `HAPPY BIRTHDAY ${nickname}! 🎂🎉💖`;
    body = `Today is YOUR day, my love! A magical birthday surprise is waiting for you inside... open your gift! 🎁`;
    url = './';
  } else if (isSept7) {
    // Calculate remaining hours until midnight Sept 8 (00:00 IST)
    const targetMidnight = new Date(nowIst.getFullYear(), 8, 8, 0, 0, 0);
    const diffHours = Math.max(1, Math.round((targetMidnight.getTime() - nowIst.getTime()) / (1000 * 60 * 60)));
    title = `Almost Your Birthday ${nickname}! 💖`;
    body = `Only ${diffHours} hours left until your special day, my love! A little magic is already ticking for you inside the app... 🎁`;
    url = './';
  } else if (hour === 5) {
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
