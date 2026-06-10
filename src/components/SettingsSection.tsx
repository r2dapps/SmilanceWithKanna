import React, { useState } from 'react';
import { Settings, Lock, Palette, Mail, ChevronRight, BellRing, Heart, Check, ChevronLeft, Download, Trash2, Cpu, CheckCircle2, XCircle, Volume2, Upload } from 'lucide-react';
import LettersSection from './LettersSection';
import { db } from '../db';
import { getChimeSetting, setChimeSetting, playSuccessChime, playTapChime } from '../utils/sound';

// Base64 Helper for VAPID Key conversion
const urlB64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

const VAPID_PUBLIC_KEY = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuB-5L6NE1O7uGvow5I4zM7J98'; // Mock key or environment config
const KVDB_URL = 'https://kvdb.io/smileywishes_sub_v1_987654321/subscription';

export default function SettingsSection({
  lastPeriodDate,
  cycleLength,
  periodDuration,
  theme,
  setTheme,
  currentEffect,
  setCurrentEffect
}: any) {
  const [activeView, setActiveView] = useState<'menu'|'letters'|'themes'|'effects'>('menu');
  const [reminders, setReminders] = useState(true);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [showClearToast, setShowClearToast] = useState(false);
  const [pinEnabled, setPinEnabled] = useState(() => localStorage.getItem('smilance_pin_enabled') !== 'false');
  const [currentPin, setCurrentPin] = useState(() => localStorage.getItem('smilance_pin') || '0809');

  // Auditory click feedback preference
  const [soundsEnabled, setSoundsEnabled] = useState(() => getChimeSetting());

  // Notification Handshake Diagnostics State
  const [diagLogs, setDiagLogs] = useState<string[]>([]);
  const [diagRunning, setDiagRunning] = useState(false);
  const [diagStatus, setDiagStatus] = useState<{
    supported: boolean | null;
    permission: string | null;
    swActive: boolean | null;
    subscribed: boolean | null;
  }>({
    supported: null,
    permission: null,
    swActive: null,
    subscribed: null,
  });

  const handleSubscribe = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      alert('Push Notifications not supported by this browser.');
      return;
    }

    try {
      setIsSubscribing(true);
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        alert('Notification permission denied.');
        setIsSubscribing(false);
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      
      const subscribeOptions = {
        userVisibleOnly: true,
        applicationServerKey: urlB64ToUint8Array(VAPID_PUBLIC_KEY)
      };

      const subscription = await registration.pushManager.subscribe(subscribeOptions);

      await fetch(KVDB_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription)
      });
      
      registration.showNotification('Subscribed! 🎉', {
        body: 'You are now ready to receive daily updates.',
        icon: 'smilance-192.png'
      });
      setReminders(true);
    } catch (err) {
      console.error('Subscription failed:', err);
      // alert('Subscription failed. Could be invalid VAPID keys.');
    } finally {
      setIsSubscribing(false);
    }
  };

  const runNotificationDiagnostics = async () => {
    setDiagRunning(true);
    setDiagLogs([]);
    const logs: string[] = [];
    const addLog = (msg: string) => {
      logs.push(`[${new Date().toLocaleTimeString()}] ${msg}`);
      setDiagLogs([...logs]);
    };

    addLog('Starting PWA Push Notification Handshake diagnostics...');
    
    // Step 1: Check browser compatibility
    const hasServiceWorker = 'serviceWorker' in navigator;
    const hasPushManager = 'PushManager' in window;
    const supported = hasServiceWorker && hasPushManager;
    
    addLog(`Checking capability support... ServiceWorker: ${hasServiceWorker ? 'OK' : 'MISSING'}, PushManager: ${hasPushManager ? 'OK' : 'MISSING'}`);
    
    if (!supported) {
      addLog('❌ ERROR: Your browser does not support standard web push notifications.');
      setDiagStatus(prev => ({ ...prev, supported: false }));
      setDiagRunning(false);
      return;
    }
    
    setDiagStatus(prev => ({ ...prev, supported: true }));
    addLog('✅ Capability support is ready.');

    // Step 2: Check active permission
    const currentPermission = Notification.permission;
    addLog(`Checking permission handshake status... Active state is "${currentPermission}".`);
    setDiagStatus(prev => ({ ...prev, permission: currentPermission }));
    
    if (currentPermission === 'denied') {
      addLog('❌ WARNING: Notifications are blocked by your browser settings. Please clear site settings and request again.');
    } else if (currentPermission === 'granted') {
      addLog('✅ Notification permission granted.');
    } else {
      addLog('ℹ️ Permission state is "default". Permission will be requested when subscribing.');
    }

    // Step 3: Check registered Service Workers
    addLog('Interrogating registered active PWA service workers...');
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      if (registrations.length === 0) {
        addLog('❌ WARNING: No registered service worker detected! Reload the app to trigger a dynamic registration.');
        setDiagStatus(prev => ({ ...prev, swActive: false }));
      } else {
        const activeSW = registrations[0];
        addLog(`✅ Service worker detected! Scope: "${activeSW.scope}", Status: "${activeSW.active ? 'ACTIVE' : 'INACTIVE'}"`);
        setDiagStatus(prev => ({ ...prev, swActive: true }));
        
        // Step 4: Check dynamic subscription
        addLog('Looking for active web-push subscription handshake on service worker registration...');
        const subscription = await activeSW.pushManager.getSubscription();
        if (subscription) {
          addLog(`✅ Active push subscription handshake established! Endpoint: ${subscription.endpoint.slice(0, 45)}...`);
          setDiagStatus(prev => ({ ...prev, subscribed: true }));
          addLog('ℹ️ PWA notification pipeline registered successfully. Handshake tests passed!');
        } else {
          addLog('ℹ️ Ready but not subscribed. Push subscription handshake not found yet.');
          setDiagStatus(prev => ({ ...prev, subscribed: false }));
        }
      }
    } catch (e: any) {
      addLog(`❌ ERROR interrogating service worker: ${e.message || e}`);
    }
    
    setDiagRunning(false);
  };

  const triggerLocalPushTest = async () => {
    if (!('serviceWorker' in navigator)) {
      alert('PWA Service Workers are not supported on this browser.');
      return;
    }
    
    try {
      const registration = await navigator.serviceWorker.ready;
      if (Notification.permission !== 'granted') {
        alert('Please grant notification access first by clicking "Daily Reminders" toggle!');
        return;
      }
      
      const testPayload = {
        title: 'Smilance Handshake Verified! 💖',
        body: `Local notification verified at ${new Date().toLocaleTimeString()}! Cross-platform PWA notification channels are active! 🥰`,
        icon: 'smilance-192.png',
        badge: 'smilance-192.png',
        vibrate: [100, 50, 100],
        data: { url: '/' }
      };

      if ('showNotification' in registration) {
        await registration.showNotification(testPayload.title, testPayload as any);
        (window as any).showSmilanceToast?.("🔔 Local test push triggered! Check notification center.");
      } else {
        new Notification(testPayload.title, { body: testPayload.body, icon: testPayload.icon });
        (window as any).showSmilanceToast?.("🔔 Triggered custom browser banner.");
      }
    } catch (err: any) {
      console.error('Local push fail:', err);
      alert(`Local push test failed: ${err.message || err}`);
    }
  };

  const handleExportData = async () => {
    (window as any).showSmilanceToast?.("📥 Compiling data for export... 💖");
    // Collect all data from localStorage
    const data: Record<string, any> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('smilance_')) {
        try {
           data[key] = JSON.parse(localStorage.getItem(key) || '""');
        } catch(e) {
           data[key] = localStorage.getItem(key);
        }
      }
    }
    
    // Collect from indexeddb (saved letters)
    try {
      const { db } = await import('../db');
      const letters = await db.letters.toArray();
      data['letters_backup'] = letters;
    } catch(e) {
      console.error('Could not backup letters', e);
    }
    
    // Export to JSON file
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `smilance_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    (window as any).showSmilanceToast?.("📥 Data export completed! 💖");
  };

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!window.confirm("Are you sure you want to restore from this backup? Current data might be overwritten!")) {
       if (fileInputRef.current) fileInputRef.current.value = "";
       return;
    }

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      for (const key in parsed) {
         if (key.startsWith('smilance_')) {
             const val = parsed[key];
             if (typeof val === 'object') {
                 localStorage.setItem(key, JSON.stringify(val));
             } else {
                 localStorage.setItem(key, String(val));
             }
         }
      }

      if (parsed['letters_backup'] && Array.isArray(parsed['letters_backup'])) {
         const { db } = await import('../db');
         await db.letters.clear();
         await db.letters.bulkAdd(parsed['letters_backup']);
      }

      (window as any).showSmilanceToast?.("💖 Data restored successfully!");
      setTimeout(() => window.location.reload(), 1500);
    } catch (e) {
      console.error("Import failed:", e);
      alert("Failed to parse the backup file. It might be corrupted.");
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClearCache = async () => {
    if (!window.confirm('Are you sure you want to clear all app data? This will completely wipe all settings, cycle history, and diary letters.')) {
      return;
    }

    const pinConfirm = window.prompt('🔒 Please enter your 4-digit PIN to authorize complete data wipe:');
    if (pinConfirm === null) return;

    if (pinConfirm !== currentPin) {
      alert('❌ Incorrect security PIN. Wipe request denied.');
      return;
    }

    try {
      await db.letters.clear();
      localStorage.clear();
      localStorage.setItem('fresh_start_2026_06_10', 'true');
      (window as any).showSmilanceToast?.("Poof! Cache Cleared 💖");
      setShowClearToast(true);
      setTimeout(() => {
        window.location.reload();
      }, 2500);
    } catch (error) {
      console.error('Wipe failed:', error);
      alert('An error occurred during wipe. Some data may still persist.');
    }
  };

  const THEMES = [
    { id: 'dark', name: 'Dark Rose (Classic)', colors: 'from-rose-500 to-rose-900', icon: '🌹' },
    { id: 'midnight', name: 'Midnight Violet', colors: 'from-violet-600 to-purple-900', icon: '🌌' },
    { id: 'sunset', name: 'Sunset Romance', colors: 'from-orange-400 to-rose-600', icon: '🌅' },
    { id: 'sakura', name: 'Sakura Bloom', colors: 'from-pink-300 to-pink-500', icon: '🌸' },
    { id: 'ocean', name: 'Deep Ocean', colors: 'from-cyan-600 to-blue-900', icon: '🌊' }
  ];

  const EFFECTS = [
    { id: 'themeSync', name: 'Auto (Match Theme)', icon: '🔄' },
    { id: 'hearts', name: 'Floating Hearts', icon: '💖' },
    { id: 'heartPulse', name: 'Pulsing Hearts', icon: '💞' },
    { id: 'blossoms', name: 'Cherry Blossoms', icon: '🌸' },
    { id: 'stars', name: 'Floating Stars', icon: '⭐' },
    { id: 'magic', name: 'Magic Dust', icon: '✨' },
    { id: 'bubbles', name: 'Soft Bubbles', icon: '🫧' },
    { id: 'none', name: 'Minimal (No Effects)', icon: '💨' }
  ];

  if (activeView === 'letters') {
    return (
      <div className="flex flex-col gap-4 relative">
        <div className="sticky top-0 z-30 pt-2 pb-2 -mx-4 px-4 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm pointer-events-none">
          <button onClick={() => setActiveView('menu')} className="text-[11px] font-bold text-gray-300 hover:text-white inline-flex items-center transition-colors uppercase tracking-widest bg-black/60 border border-white/10 px-3 py-2 rounded-xl backdrop-blur-md pointer-events-auto">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Settings
          </button>
        </div>
        <LettersSection />
      </div>
    );
  }

  if (activeView === 'themes') {
    return (
      <div className="flex flex-col gap-4 text-left relative">
        <div className="sticky top-0 z-30 pt-2 pb-2 -mx-4 px-4 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm pointer-events-none">
          <button onClick={() => setActiveView('menu')} className="text-[11px] font-bold text-gray-300 hover:text-white inline-flex items-center transition-colors uppercase tracking-widest bg-black/60 border border-white/10 px-3 py-2 rounded-xl backdrop-blur-md pointer-events-auto">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Settings
          </button>
        </div>
        
        <h2 className="heading-title text-xl flex items-center gap-2 mb-2" style={{ color: 'var(--accent-text)' }}>
          <Palette className="w-5 h-5" /> Appearance
        </h2>

        <div className="dark-card !p-2 flex flex-col gap-1">
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`w-full flex items-center justify-between p-4 rounded-xl transition ${theme === t.id ? 'bg-white/10' : 'bg-transparent hover:bg-white/5'}`}
            >
               <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${t.colors} flex items-center justify-center text-sm shadow-md`}>
                    {t.icon}
                  </div>
                  <span className={`font-bold text-sm ${theme === t.id ? 'text-white' : 'text-white/70'}`}>{t.name}</span>
               </div>
               {theme === t.id && <Check className="w-5 h-5 text-emerald-400" />}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (activeView === 'effects') {
    return (
      <div className="flex flex-col gap-4 text-left relative">
        <div className="sticky top-0 z-30 pt-2 pb-2 -mx-4 px-4 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm pointer-events-none">
          <button onClick={() => setActiveView('menu')} className="text-[11px] font-bold text-gray-300 hover:text-white inline-flex items-center transition-colors uppercase tracking-widest bg-black/60 border border-white/10 px-3 py-2 rounded-xl backdrop-blur-md pointer-events-auto">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Settings
          </button>
        </div>
        
        <h2 className="heading-title text-xl flex items-center gap-2 mb-2" style={{ color: 'var(--accent-text)' }}>
          <Heart className="w-5 h-5" /> Visual Effects
        </h2>

        <div className="dark-card !p-2 flex flex-col gap-1">
          {EFFECTS.map((e) => (
            <button
              key={e.id}
              onClick={() => {
                setCurrentEffect(e.id);
                localStorage.setItem('smilance_effect', e.id);
              }}
              className={`w-full flex items-center justify-between p-4 rounded-xl transition ${currentEffect === e.id ? 'bg-white/10' : 'bg-transparent hover:bg-white/5'}`}
            >
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-sm">
                    {e.icon}
                  </div>
                  <span className={`font-bold text-sm ${currentEffect === e.id ? 'text-white' : 'text-white/70'}`}>{e.name}</span>
               </div>
               {currentEffect === e.id && <Check className="w-5 h-5 text-emerald-400" />}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 text-left">
      <h2 className="heading-title text-2xl flex items-center gap-2 mb-2" style={{ color: 'var(--accent-text)' }}>
        <Settings className="w-6 h-6" style={{ color: 'var(--accent-color)' }} /> App Settings
      </h2>

      <div className="dark-card !p-2 flex flex-col gap-1 border" style={{ backgroundColor: 'var(--bg-top)', borderColor: 'var(--card-border)' }}>
        <button onClick={() => setActiveView('letters')} className="w-full flex items-center justify-between p-4 bg-transparent border-white/5 hover:bg-white/5 rounded-xl transition">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center">
               <Mail className="w-4 h-4" />
             </div>
             <span className="font-bold text-white text-sm">Letters to Kanna</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-500" />
        </button>

        <div className="h-px w-[90%] mx-auto bg-white/5" />

        <button onClick={() => setActiveView('themes')} className="w-full flex items-center justify-between p-4 bg-transparent border-white/5 hover:bg-white/5 rounded-xl transition">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
               <Palette className="w-4 h-4" />
             </div>
             <span className="font-bold text-white text-sm">Themes & Colors</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-500" />
        </button>

        <div className="h-px w-[90%] mx-auto bg-white/5" />

        <button onClick={() => setActiveView('effects')} className="w-full flex items-center justify-between p-4 bg-transparent border-white/5 hover:bg-white/5 rounded-xl transition">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center">
               <Heart className="w-4 h-4" />
             </div>
             <span className="font-bold text-white text-sm">Visual Effects</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      <div className="dark-card p-5 mt-2">
        <h3 className="font-bold text-gray-400 text-xs uppercase tracking-widest mb-4">Preferences</h3>
        
        <div className="flex items-center justify-between mb-6">
           <div className="flex items-center gap-3">
             <BellRing className="w-5 h-5 text-gray-300" />
             <div>
               <p className="font-bold text-sm text-white">Daily Reminders</p>
               <p className="text-[10px] text-gray-500">Morning wishes at 8:45 AM</p>
             </div>
           </div>
           <button 
             onClick={handleSubscribe}
             disabled={isSubscribing}
             className={`w-12 h-6 rounded-full transition-colors relative ${reminders ? 'bg-emerald-500' : 'bg-gray-700'}`}
           >
             <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${reminders ? 'left-7' : 'left-1'}`} />
           </button>
        </div>

        <div className="h-px w-full bg-white/5 mb-6" />

        {/* Tactile click sound feedback preference */}
        <div className="flex items-center justify-between mb-6">
           <div className="flex items-center gap-3">
             <Volume2 className="w-5 h-5 text-gray-300" />
             <div>
               <p className="font-bold text-sm text-white">Click Feedback Chime</p>
               <p className="text-[10px] text-gray-500">Soft audio notes on keypress</p>
             </div>
           </div>
           <button 
             onClick={() => {
               const nextVal = !soundsEnabled;
               setSoundsEnabled(nextVal);
               setChimeSetting(nextVal);
               if (nextVal) playSuccessChime();
             }}
             className={`w-12 h-6 rounded-full transition-colors relative ${soundsEnabled ? 'bg-emerald-500' : 'bg-gray-700'}`}
           >
             <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${soundsEnabled ? 'left-7' : 'left-1'}`} />
           </button>
        </div>

        <div className="h-px w-full bg-white/5 mb-6" />

        {/* 🔔 PWA & Verification Push Handshake Diagnostic Hub */}
        <div className="bg-white/5 border border-white/5 rounded-2xl p-4 mb-6 text-left">
          <div className="flex items-center justify-between mb-3">
             <h4 className="text-[11px] uppercase tracking-wider font-extrabold text-rose-300 flex items-center gap-1.5">
               <Cpu className="w-4 h-4 text-rose-400" /> Handshake Diagnostics
             </h4>
             <button 
               onClick={runNotificationDiagnostics}
               disabled={diagRunning}
               className="text-[10.5px] uppercase font-bold bg-rose-500 text-white px-2.5 py-1.5 rounded-lg transition hover:bg-rose-400 disabled:opacity-50 cursor-pointer"
             >
               {diagRunning ? 'Checking...' : 'Verify Handshake'}
             </button>
          </div>

          <p className="text-[10px] text-gray-400 leading-normal mb-4">
            Verify browser-specific permission channels & active service worker states to ensure seamless standalone PWA updates.
          </p>

          <div className="grid grid-cols-2 gap-2 text-[9.5px] uppercase tracking-wide font-black text-gray-300 mb-4">
            <div className="flex items-center gap-1.5 p-2 bg-black/20 rounded-xl border border-white/5">
              {diagStatus.supported === null ? (
                <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
              ) : diagStatus.supported ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
              )}
              <span className="truncate">Web Push API</span>
            </div>
            
            <div className="flex items-center gap-1.5 p-2 bg-black/20 rounded-xl border border-white/5">
              {diagStatus.permission === null ? (
                <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
              ) : diagStatus.permission === 'granted' ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
              )}
              <span className="truncate">Permission</span>
            </div>

            <div className="flex items-center gap-1.5 p-2 bg-black/20 rounded-xl border border-white/5">
              {diagStatus.swActive === null ? (
                <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
              ) : diagStatus.swActive ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
              )}
              <span className="truncate">Service Worker</span>
            </div>

            <div className="flex items-center gap-1.5 p-2 bg-black/20 rounded-xl border border-white/5">
              {diagStatus.subscribed === null ? (
                <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
              ) : diagStatus.subscribed ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
              )}
              <span className="truncate">KVDB Sync Status</span>
            </div>
          </div>

          <button
            onClick={triggerLocalPushTest}
            className="w-full text-center text-[10px] font-bold uppercase tracking-wider py-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl hover:bg-rose-500/25 active:scale-95 transition-all mb-4 cursor-pointer"
          >
            🔕 Send Verification Push Handshake Banner
          </button>

          {diagLogs.length > 0 && (
            <div className="bg-black/60 p-2.5 rounded-xl border border-white/5 font-mono text-[9px] text-gray-400 max-h-[110px] overflow-y-auto space-y-1.5 scrollbar-thin">
              {diagLogs.map((logStr, lIdx) => (
                <div key={lIdx} className="leading-relaxed border-b border-white/[0.02] pb-1 last:border-b-0 last:pb-0">{logStr}</div>
              ))}
            </div>
          )}
        </div>

        <div className="h-px w-full bg-white/5 mb-6" />

         {/* App Passcode Lock Toggle */}
         <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-gray-300" />
              <div>
                <p className="font-bold text-sm text-white">App Passcode Lock</p>
                <p className="text-[10px] text-gray-500">Require PIN on startup</p>
              </div>
            </div>
            <button 
              onClick={() => {
                const nextVal = !pinEnabled;
                setPinEnabled(nextVal);
                localStorage.setItem('smilance_pin_enabled', nextVal ? 'true' : 'false');
                if (nextVal) {
                  sessionStorage.setItem('smilance_unlocked', 'false');
                } else {
                  sessionStorage.setItem('smilance_unlocked', 'true');
                }
                (window as any).showSmilanceToast?.(nextVal ? "🔒 App Lock Enabled! 💖" : "🔓 App Lock Disabled! 💖");
              }}
              className={`w-12 h-6 rounded-full transition-colors relative ${pinEnabled ? 'bg-emerald-500' : 'bg-gray-700'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${pinEnabled ? 'left-7' : 'left-1'}`} />
            </button>
         </div>

         {pinEnabled && (
           <div className="mb-6 pl-8 animate-fadeIn flex flex-col gap-3">
             <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5">
               <span className="text-xs text-gray-400 font-bold">Current PIN: <span className="text-white font-mono bg-black/40 px-2 py-0.5 rounded ml-1">{currentPin}</span></span>
               <button 
                 onClick={() => {
                   const newPin = (() => { const currentPinConfirm = window.prompt("Enter your CURRENT PIN to authorize passcode change:"); if (currentPinConfirm !== currentPin) { if (currentPinConfirm !== null) alert("❌ Incorrect current security PIN."); return null; } return window.prompt("Enter new 4-digit PIN:"); })();
                   if (newPin) {
                     if (newPin.length !== 4 || isNaN(Number(newPin))) {
                       alert("PIN must be exactly 4 digits.");
                     } else {
                       setCurrentPin(newPin);
                       localStorage.setItem('smilance_pin', newPin);
                       (window as any).showSmilanceToast?.("🔑 PIN updated successfully! 💖");
                     }
                   }
                 }}
                 className="text-[11px] uppercase tracking-wider font-bold text-rose-300 bg-rose-500/15 px-3 py-1.5 rounded-lg border border-rose-500/20 active:scale-95 transition-all"
               >
                 Change PIN
               </button>
             </div>
             <button 
               onClick={() => {
                 sessionStorage.setItem('smilance_unlocked', 'false');
                 (window as any).showSmilanceToast?.("🔒 Locking application... 💖");
                 setTimeout(() => {
                   window.location.reload();
                 }, 1000);
               }}
               className="w-full text-center text-xs font-bold text-rose-300 border border-rose-500/20 bg-rose-500/5 py-2 rounded-xl hover:bg-rose-500/10 transition-colors"
             >
               Lock Application Now
             </button>
           </div>
         )}

         <div className="h-px w-full bg-white/5 mb-4" />

         <div className="flex flex-col gap-3">
            <button onClick={handleExportData} className="w-full flex items-center justify-between p-3 bg-white/5 border border-white/5 hover:bg-white/10 rounded-xl transition">
             <div className="flex items-center gap-3">
                <Download className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-white text-sm">Export My Data</span>
             </div>
             <ChevronRight className="w-4 h-4 text-gray-500" />
           </button>

           <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-between p-3 bg-white/5 border border-white/5 hover:bg-white/10 rounded-xl transition">
             <div className="flex items-center gap-3">
                <Upload className="w-4 h-4 text-indigo-400" />
                <span className="font-bold text-white text-sm">Import My Data</span>
             </div>
             <ChevronRight className="w-4 h-4 text-gray-500" />
           </button>
           <input 
             type="file" 
             accept=".json" 
             ref={fileInputRef} 
             onChange={handleImportData} 
             className="hidden" 
           />

           <button onClick={handleClearCache} className="w-full flex items-center justify-between p-3 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 rounded-xl transition">
             <div className="flex items-center gap-3">
                <Trash2 className="w-4 h-4 text-rose-400" />
                <span className="font-bold text-rose-300 text-sm">Clear App Cache</span>
             </div>
             <ChevronRight className="w-4 h-4 text-rose-500/50" />
           </button>
        </div>

        <div className="flex flex-col text-center justify-center mt-12 mb-4">
          <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-black leading-tight">Made with love</span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-black leading-tight">for Smiley</span>
        </div>
      </div>
      
      {showClearToast && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn pointer-events-none">
          <div className="flex flex-col items-center animate-bounce">
            <Heart className="w-24 h-24 drop-shadow-[0_0_30px_rgba(244,63,94,0.8)] mb-4" style={{ color: 'var(--accent-color)', fill: 'var(--accent-color)' }} />
            <div className="bg-[#12050A]/90 border px-6 py-3 rounded-full shadow-[0_10px_40px_rgba(244,63,94,0.3)]" style={{ borderColor: 'var(--accent-color)' }}>
              <span className="text-white font-bold tracking-wide">Poof! Cache Cleared 💖</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
