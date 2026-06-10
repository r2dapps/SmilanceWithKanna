// Backend push script to be executed out-of-band via GitHub Actions

import webpush from 'web-push';

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

  // 3. Payload Content
  const payload = {
    title: 'Good morning! ☀️',
    body: 'Time to open the app!',
    icon: 'smilance-192.png',
    badge: 'smilance-192.png',
    url: './'
  };

  // 4. Send notification
  try {
    const response = await webpush.sendNotification(
      subscription,
      JSON.stringify(payload)
    );
    console.log('Push sent! Status:', response.statusCode);
  } catch (err: any) {
    // 5. Clean up expired subscriptions
    if (err.statusCode === 410 || err.statusCode === 404) {
      console.log('Subscription expired. Deleting...');
      await fetch(KVDB_URL, { method: 'DELETE' });
    } else {
      console.error('Error sending push:', err);
    }
  }
}

run();
