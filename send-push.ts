// Backend push script to be executed out-of-band via GitHub Actions

import webpush from 'web-push';
import { DAILY_QUOTES } from './src/data';

const KVDB_URL = 'https://kvdb.io/smileywishes_sub_v1_987654321/subscription';

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

  // 4. Payload Content
  const payload = {
    title: 'Good morning, Smiley! ☀️💖',
    body: dailyQuote,
    icon: 'smilance-192.png',
    badge: 'smilance-192.png',
    url: './'
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
