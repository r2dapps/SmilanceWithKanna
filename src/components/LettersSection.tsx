import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, Mail, Send, Book, Plus, ChevronRight, Save, Download, Heart, Share2 } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { LETTERS } from '../data';
import { BIRTHDAY_EVE_LETTER_DATA, BIRTHDAY_MAIN_LETTER_DATA } from '../birthdayData';
import { db } from '../db';
import { useLiveQuery } from 'dexie-react-hooks';
import * as htmlToImage from 'html-to-image';

export default function LettersSection({ theme }: { theme: string }) {
  const [selectedLetter, setSelectedLetter] = useState<any>(null);
  const [selectedSpecialLetter, setSelectedSpecialLetter] = useState<'eve' | 'birthday' | null>(null);
  const [selectedLocalLetter, setSelectedLocalLetter] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'write' | 'saved' | 'received'>('write');
  const [showCinematicLetter, setShowCinematicLetter] = useState(false);
  
  useEffect(() => {
    if (showCinematicLetter) {
      document.body.classList.add('cinematic-letter-open');
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.classList.remove('cinematic-letter-open');
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [showCinematicLetter]);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());

  const downloadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleLetterMessage = (event: MessageEvent) => {
      if (event.data?.type === 'DOWNLOAD_COMPLETE') {
        (window as any).showSmilanceToast?.("📥 Love Letter image downloaded! 💖");
      } else if (event.data?.type === 'DOWNLOAD_FAILED') {
        (window as any).showSmilanceToast?.("❌ Download failed. Please try again.");
      }
    };
    window.addEventListener('message', handleLetterMessage);
    return () => window.removeEventListener('message', handleLetterMessage);
  }, []);

  const handleDownloadCinematicLetter = () => {
    const iframe = document.getElementById('cinematic-letter-iframe') as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      (window as any).showSmilanceToast?.("⏳ Saving high-definition Love Letter image...");
      iframe.contentWindow.postMessage({ type: 'TRIGGER_DOWNLOAD' }, '*');
    } else {
      (window as any).showSmilanceToast?.("❌ Letter viewer not ready.");
    }
  };

  // States for tracking letter edits
  const [editingLetterId, setEditingLetterId] = useState<number | null>(null);

  // States for compiling the export image card dynamically
  const [printTitle, setPrintTitle] = useState('');
  const [printContent, setPrintContent] = useState('');
  const [printAuthor, setPrintAuthor] = useState('Smiley');
  const [printDateStr, setPrintDateStr] = useState('');
  const [printTimeStr, setPrintTimeStr] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const savedLetters = useLiveQuery(() => db.letters.orderBy('id').reverse().toArray()) || [];

  const handleSave = async () => {
    if (!content.trim() || !title.trim()) return;

    if (editingLetterId) {
      await db.letters.update(editingLetterId, {
        title: title.trim(),
        content: content.trim(),
        date: new Date().toISOString()
      });
      setEditingLetterId(null);
      (window as any).showSmilanceToast?.("💖 Letter updated in diary!");
    } else {
      await db.letters.add({
        title: title.trim(),
        content: content.trim(),
        date: new Date().toISOString(),
        mood: 'love'
      });
      (window as any).showSmilanceToast?.("💖 Letter saved to diary!");
    }

    setTitle('');
    setContent('');
    setActiveTab('saved');
  };

  const shareText = (message: string) => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const executeImageAction = async (
    titleVal: string, 
    contentVal: string, 
    authorVal: string, 
    dateVal: string, 
    timeVal: string, 
    action: 'download' | 'share'
  ) => {
    setPrintTitle(titleVal);
    setPrintContent(contentVal);
    setPrintAuthor(authorVal);
    setPrintDateStr(dateVal);
    setPrintTimeStr(timeVal);

    // Give React a small tick to render the print DOM correctly
    await new Promise((resolve) => setTimeout(resolve, 150));

    if (!downloadRef.current) {
      (window as any).showSmilanceToast?.("❌ Image container missing.");
      return;
    }

    try {
      const dataUrl = await htmlToImage.toPng(downloadRef.current, { 
        backgroundColor: '#12050A',
        pixelRatio: 2
      });

      const fileName = `${authorVal.replace(/\s+/g, '_')}_Letter_${Date.now()}.png`;

      if (action === 'download') {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = fileName;
        link.click();
        (window as any).showSmilanceToast?.("📥 Letter image downloaded! 💖");
      } else {
        // Attempt Native Web Share (WhatsApp / other apps)
        const blob = await fetch(dataUrl).then(r => r.blob());
        const file = new File([blob], fileName, { type: 'image/png' });

        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: titleVal || 'Diary Letter',
            text: `Shared from Smilance 💖`
          });
          (window as any).showSmilanceToast?.("💖 Shared successfully!");
        } else {
          // Fallback to standard download if share API not supported
          const link = document.createElement('a');
          link.href = dataUrl;
          link.download = fileName;
          link.click();
          (window as any).showSmilanceToast?.("📥 Downloaded! Web Share not supported on this browser.");
        }
      }
    } catch (e) {
      console.error('Image action failed:', e);
      (window as any).showSmilanceToast?.("❌ Action failed.");
    }
  };

  const dateStr = currentDate.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
  const timeStr = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex flex-col gap-4">
      {/* Hidden container for image export - Always rendered at root to avoid missing reference when switching tabs */}
      <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
         <div ref={downloadRef} className={`theme-${theme} w-[800px] p-20 text-left border-[8px] relative overflow-hidden`} style={{ minHeight: '1131px', background: 'linear-gradient(145deg, var(--bg-top) 0%, var(--bg-bottom) 100%)', borderColor: 'var(--accent-color)' }}>
            
            {/* Background glowing gradients for richer aesthetics */}
            <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ background: 'radial-gradient(circle at 20% 20%, var(--accent-light), transparent 50%), radial-gradient(circle at 80% 85%, var(--accent-light), transparent 50%)' }}></div>
            
            {/* Scattered Background Hearts (Watermarks) */}
            <Heart className="absolute top-10 left-10 w-32 h-32 -rotate-12 pointer-events-none" style={{ color: 'var(--accent-color)', fill: 'var(--accent-light)', opacity: 0.1 }} strokeWidth={1.5} />
            <Heart className="absolute bottom-20 right-10 w-48 h-48 rotate-12 pointer-events-none" style={{ color: 'var(--accent-color)', fill: 'var(--accent-light)', opacity: 0.1 }} strokeWidth={1.5} />
            <Heart className="absolute top-1/3 left-12 w-20 h-20 rotate-45 pointer-events-none" style={{ color: 'var(--accent-color)', fill: 'var(--accent-light)', opacity: 0.08 }} strokeWidth={1.5} />
            <Heart className="absolute top-[55%] right-12 w-28 h-28 -rotate-12 pointer-events-none" style={{ color: 'var(--accent-color)', fill: 'var(--accent-light)', opacity: 0.08 }} strokeWidth={1.5} />
            <Heart className="absolute top-16 right-24 w-16 h-16 rotate-12 pointer-events-none" style={{ color: 'var(--accent-color)', fill: 'var(--accent-light)', opacity: 0.08 }} strokeWidth={1.5} />
            <Heart className="absolute bottom-12 left-16 w-36 h-36 -rotate-45 pointer-events-none" style={{ color: 'var(--accent-color)', fill: 'var(--accent-light)', opacity: 0.1 }} strokeWidth={1.5} />
            
            {/* Clean content structure directly aligned to page border */}
            <div className="relative z-10 flex flex-col h-full justify-between" style={{ minHeight: '971px' }}>
              <div>
                <div className="flex justify-between items-end border-b-2 mb-10 pb-6" style={{ borderColor: 'var(--card-border)' }}>
                  <div>
                    <h2 className="font-bold text-2xl tracking-widest uppercase font-sans" style={{ color: 'var(--text-primary)' }}>{printDateStr}</h2>
                    {printTimeStr && <p className="font-sans font-bold text-lg tracking-widest mt-2 opacity-80" style={{ color: 'var(--text-primary)' }}>{printTimeStr}</p>}
                  </div>
                  
                  {/* "Smilance Diary" in two rows */}
                  <div className="text-right pointer-events-none font-sans opacity-25 flex flex-col items-end leading-none">
                    <span className="text-[28px] uppercase tracking-[0.2em] font-black" style={{ color: 'var(--text-primary)' }}>Smilance</span>
                    <span className="text-[28px] uppercase tracking-[0.3em] font-black mt-1.5" style={{ color: 'var(--text-primary)' }}>Diary</span>
                  </div>
                </div>
                
                <h3 className="text-6xl font-bold mb-10 leading-snug" style={{ fontFamily: "'Caveat', cursive", color: 'var(--text-primary)' }}>{printTitle || 'Dear Kanna,'}</h3>
                
                <p className="text-[36px] leading-[1.8] whitespace-pre-wrap break-words opacity-95" style={{ fontFamily: "'Caveat', cursive", color: 'var(--text-primary)' }}>
                  {printContent || '...'}
                </p>
              </div>
              
              <div className="mt-20 pt-10 text-right text-4xl font-bold opacity-90" style={{ fontFamily: "'Caveat', cursive", color: 'var(--text-primary)' }}>
                Always & Forever, <br/>
                <span className="text-5xl mt-4 block" style={{ color: 'var(--text-primary)' }}>~ {printAuthor}</span>
              </div>
            </div>
         </div>
      </div>

      {/* Local Letter Viewer */}
      {selectedLocalLetter ? (
        <div className="flex flex-col animate-fadeIn">
          <div className="flex items-center justify-between pb-4">
             <button onClick={() => setSelectedLocalLetter(null)} className="text-gray-400 font-bold uppercase tracking-widest text-xs px-3 py-1.5 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 cursor-pointer">← Back</button>
             <div className="flex gap-2">
               {/* Edit Button */}
               <button onClick={() => {
                 setTitle(selectedLocalLetter.title);
                 setContent(selectedLocalLetter.content);
                 setEditingLetterId(selectedLocalLetter.id);
                 setSelectedLocalLetter(null);
                 setActiveTab('write');
               }} className="text-amber-400 hover:text-amber-300 font-bold uppercase tracking-widest text-xs px-3 py-1.5 bg-amber-500/10 rounded-lg border border-amber-500/20 hover:bg-amber-500/20 cursor-pointer">Edit</button>
               
               <button onClick={async () => {
                 if (window.confirm("Do you want to delete this precious letter forever? 💖")) {
                   await db.letters.delete(selectedLocalLetter.id);
                   (window as any).showSmilanceToast?.("🗑️ Letter deleted successfully!");
                   setSelectedLocalLetter(null);
                 }
               }} className="text-rose-400 hover:text-rose-300 font-bold uppercase tracking-widest text-xs px-3 py-1.5 bg-rose-500/10 rounded-lg border border-rose-500/20 hover:bg-rose-500/20 cursor-pointer">Delete</button>
             </div>
          </div>
          <div className="flex-1 border rounded-3xl p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden" style={{ backgroundColor: 'var(--bg-top)', borderColor: 'var(--card-border)' }}>
            <Heart className="absolute bottom-10 right-2 w-32 h-32 rotate-12 pointer-events-none" style={{ color: 'var(--accent-light)' }} strokeWidth={1} fill="currentColor" />
            <h3 className="text-3xl font-bold mb-2 relative z-10" style={{ fontFamily: "'Caveat', cursive", color: 'var(--accent-text)' }}>{selectedLocalLetter.title}</h3>
            <p className="font-sans text-[10px] font-bold tracking-widest uppercase mb-8 pb-4 border-b border-white/10 relative z-10" style={{ color: 'var(--accent-color)' }}>
              {new Date(selectedLocalLetter.date).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
            <p className="text-[22px] leading-[1.6] text-white/90 whitespace-pre-wrap relative z-10 mb-8" style={{ fontFamily: "'Caveat', cursive" }}>
              {selectedLocalLetter.content}
            </p>

            {/* Local Letter Share Actions */}
            <div className="border-t border-white/5 pt-6 flex flex-wrap gap-2.5 relative z-20">
               <button 
                 onClick={() => {
                   const d = new Date(selectedLocalLetter.date);
                   const dStr = d.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
                   const tStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                   executeImageAction(selectedLocalLetter.title, selectedLocalLetter.content, 'Smiley', dStr, tStr, 'download');
                 }}
                 title="Download Image"
                 className="w-10 h-10 font-bold rounded-full flex items-center justify-center border active:scale-95 transition-all cursor-pointer"
                 style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent-text)', borderColor: 'var(--card-border)' }}
               >
                 <Download className="w-4 h-4" />
               </button>
               
               <button 
                 onClick={() => shareText(`💖 DEAREST KANNA 💖\n\n${selectedLocalLetter.content}\n\n💌 Written on Smilance`)}
                 title="Share Text to WhatsApp"
                 className="w-10 h-10 font-bold rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.5)] active:scale-95 transition-all cursor-pointer bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/30"
               >
                 <FaWhatsapp size={18} />
               </button>
               
               <button 
                 onClick={() => {
                   const d = new Date(selectedLocalLetter.date);
                   const dStr = d.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
                   const tStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                   executeImageAction(selectedLocalLetter.title, selectedLocalLetter.content, 'Smiley', dStr, tStr, 'share');
                 }}
                 title="Share Image"
                 className="w-10 h-10 font-bold rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.5)] active:scale-95 transition-all cursor-pointer bg-teal-600/20 text-teal-400 hover:bg-teal-600/30 border border-teal-500/30"
               >
                 <Share2 className="w-4 h-4" />
               </button>
            </div>
          </div>
        </div>
      ) : selectedSpecialLetter ? (
        <div className="flex flex-col animate-fadeIn">
          <div className="flex items-center justify-between pb-4">
             <button onClick={() => setSelectedSpecialLetter(null)} className="text-gray-400 font-bold uppercase tracking-widest text-xs px-2.5 py-1.5 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 cursor-pointer flex items-center gap-1">
               <ArrowLeft className="w-3.5 h-3.5" /> Back
             </button>
             <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--accent-text)' }}>
               {selectedSpecialLetter === 'eve' ? '🌙 Sept 7th Eve Letter' : '🎂 Sept 8th Birthday Letter'}
             </span>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full mx-auto relative overflow-hidden backdrop-blur-3xl bg-black/75 border rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] max-h-[78vh] overflow-y-auto" style={{ borderColor: 'var(--card-border)' }}>
              <div className="absolute top-0 right-0 w-32 h-32 blur-[40px] translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none" style={{ backgroundColor: 'var(--accent-light)' }} />
              <Heart className="absolute bottom-10 -left-10 w-24 h-24 -rotate-12 pointer-events-none" style={{ color: 'var(--accent-light)' }} strokeWidth={1} fill="currentColor" />
              
              <div className="text-center mb-6 relative z-10">
                <span className="text-[11px] font-bold tracking-widest uppercase text-rose-300">
                  {selectedSpecialLetter === 'eve' ? BIRTHDAY_EVE_LETTER_DATA.date : BIRTHDAY_MAIN_LETTER_DATA.date}
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold mt-1 text-white">
                  {selectedSpecialLetter === 'eve' ? BIRTHDAY_EVE_LETTER_DATA.title : BIRTHDAY_MAIN_LETTER_DATA.title}
                </h3>
              </div>

              <div className="font-serif italic text-white/90 leading-relaxed text-sm sm:text-base mb-6 relative z-10 space-y-4 text-left">
                <p className="font-bold text-rose-200 not-italic text-base sm:text-lg">
                  {selectedSpecialLetter === 'eve' ? BIRTHDAY_EVE_LETTER_DATA.salutation : BIRTHDAY_MAIN_LETTER_DATA.salutation}
                </p>
                {(selectedSpecialLetter === 'eve' ? BIRTHDAY_EVE_LETTER_DATA.paragraphs : BIRTHDAY_MAIN_LETTER_DATA.paragraphs).map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}
                <div className="pt-4 border-t border-white/10 not-italic">
                  <p className="text-xs text-rose-300 font-bold">
                    {selectedSpecialLetter === 'eve' ? BIRTHDAY_EVE_LETTER_DATA.closing : BIRTHDAY_MAIN_LETTER_DATA.closing}
                  </p>
                  <p className="text-2xl font-bold text-rose-100 mt-1" style={{ fontFamily: "'Great Vibes', cursive" }}>
                    {selectedSpecialLetter === 'eve' ? BIRTHDAY_EVE_LETTER_DATA.signature : BIRTHDAY_MAIN_LETTER_DATA.signature}
                  </p>
                  <p className="text-xs text-white/60 mt-3 italic">
                    {selectedSpecialLetter === 'eve' ? BIRTHDAY_EVE_LETTER_DATA.postscript : BIRTHDAY_MAIN_LETTER_DATA.postscript}
                  </p>
                </div>
              </div>

              {/* Share & Download Actions */}
              <div className="border-t border-white/5 pt-4 flex justify-center gap-3.5 relative z-20">
                 <button 
                   onClick={() => {
                     const data = selectedSpecialLetter === 'eve' ? BIRTHDAY_EVE_LETTER_DATA : BIRTHDAY_MAIN_LETTER_DATA;
                     executeImageAction(data.title, data.paragraphs.join('\n\n'), 'Kanna', data.date, '', 'download');
                   }}
                   title="Download Image"
                   className="w-10 h-10 font-bold rounded-full flex items-center justify-center border active:scale-95 transition-all cursor-pointer"
                   style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent-text)', borderColor: 'var(--card-border)' }}
                 >
                   <Download className="w-4 h-4" />
                 </button>
                 
                 <button 
                   onClick={() => {
                     const data = selectedSpecialLetter === 'eve' ? BIRTHDAY_EVE_LETTER_DATA : BIRTHDAY_MAIN_LETTER_DATA;
                     shareText(`💖 ${data.title.toUpperCase()} 💖\n\n"${data.paragraphs[0]}"\n\n💌 Shared from Smilance`);
                   }}
                   title="Share Text to WhatsApp"
                   className="w-10 h-10 font-bold rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.5)] active:scale-95 transition-all cursor-pointer bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/30"
                 >
                   <FaWhatsapp size={18} />
                 </button>
                 
                 <button 
                   onClick={() => {
                     const data = selectedSpecialLetter === 'eve' ? BIRTHDAY_EVE_LETTER_DATA : BIRTHDAY_MAIN_LETTER_DATA;
                     executeImageAction(data.title, data.paragraphs.join('\n\n'), 'Kanna', data.date, '', 'share');
                   }}
                   title="Share Image"
                   className="w-10 h-10 font-bold rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.5)] active:scale-95 transition-all cursor-pointer bg-teal-600/20 text-teal-400 hover:bg-teal-600/30 border border-teal-500/30"
                 >
                   <Share2 className="w-4 h-4" />
                 </button>
              </div>
            </div>
          </div>
        </div>
      ) : selectedLetter ? (
        <div className="flex flex-col animate-fadeIn">
          <div className="flex items-center justify-between pb-4">
             <button onClick={() => setSelectedLetter(null)} className="text-gray-400 font-bold uppercase tracking-widest text-xs px-2 py-1 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 cursor-pointer">← Back</button>
             <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--accent-text)' }}>A Note From Him</span>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full mx-auto relative overflow-hidden backdrop-blur-3xl bg-black/60 border rounded-3xl p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)]" style={{ borderColor: 'var(--card-border)' }}>
              <div className="absolute top-0 right-0 w-32 h-32 blur-[40px] translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none" style={{ backgroundColor: 'var(--accent-light)' }} />
              <Heart className="absolute bottom-10 -left-10 w-24 h-24 -rotate-12 pointer-events-none" style={{ color: 'var(--accent-light)' }} strokeWidth={1} fill="currentColor" />
              <h3 className="font-serif text-[26px] font-bold mb-6 text-center z-10 relative" style={{ color: 'var(--accent-text)' }}>{selectedLetter.title}</h3>
              <p className="font-serif italic text-white/90 leading-relaxed text-lg text-center mb-8 relative z-10">
                "{selectedLetter.message}"
              </p>

              {/* Received Letter Share Actions */}
              <div className="border-t border-white/5 pt-6 flex justify-center gap-3.5 relative z-20">
                 <button 
                   onClick={() => {
                     const dStr = new Date().toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
                     executeImageAction(selectedLetter.title, selectedLetter.message, 'Kanna', dStr, '', 'download');
                   }}
                   title="Download Image"
                   className="w-10 h-10 font-bold rounded-full flex items-center justify-center border active:scale-95 transition-all cursor-pointer"
                   style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent-text)', borderColor: 'var(--card-border)' }}
                 >
                   <Download className="w-4 h-4" />
                 </button>
                 
                 <button 
                   onClick={() => shareText(`💖 A NOTE FROM KANNA 💖\n\n"${selectedLetter.message}"\n\n💌 Shared from Smilance`)}
                   title="Share Text to WhatsApp"
                   className="w-10 h-10 font-bold rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.5)] active:scale-95 transition-all cursor-pointer bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/30"
                 >
                   <FaWhatsapp size={18} />
                 </button>
                 
                 <button 
                   onClick={() => {
                     const dStr = new Date().toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
                     executeImageAction(selectedLetter.title, selectedLetter.message, 'Kanna', dStr, '', 'share');
                   }}
                   title="Share Image"
                   className="w-10 h-10 font-bold rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.5)] active:scale-95 transition-all cursor-pointer bg-teal-600/20 text-teal-400 hover:bg-teal-600/30 border border-teal-500/30"
                 >
                   <Share2 className="w-4 h-4" />
                 </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 p-2 rounded-2xl border backdrop-blur-md sticky top-0 z-20 shadow-md" style={{ backgroundColor: 'var(--bg-top)', borderColor: 'var(--card-border)' }}>
             <button onClick={() => setActiveTab('write')} className="flex-1 text-xs font-bold py-3 rounded-xl transition border cursor-pointer" style={activeTab === 'write' ? { backgroundColor: 'var(--accent-light)', color: 'var(--accent-text)', borderColor: 'var(--accent-light)' } : { borderColor: 'transparent', color: '#6b7280' }}>Write</button>
             <button onClick={() => setActiveTab('saved')} className="flex-1 text-xs font-bold py-3 rounded-xl transition border cursor-pointer" style={activeTab === 'saved' ? { backgroundColor: 'var(--accent-light)', color: 'var(--accent-text)', borderColor: 'var(--accent-light)' } : { borderColor: 'transparent', color: '#6b7280' }}>My Letters</button>
             <button onClick={() => setActiveTab('received')} className="flex-1 text-xs font-bold py-3 rounded-xl transition border cursor-pointer" style={activeTab === 'received' ? { backgroundColor: 'var(--accent-light)', color: 'var(--accent-text)', borderColor: 'var(--accent-light)' } : { borderColor: 'transparent', color: '#6b7280' }}>From Kanna</button>
          </div>

          {activeTab === 'write' && (
            <div className="dark-card text-left mt-2 p-6 border relative overflow-hidden" style={{ backgroundColor: 'var(--bg-top)', borderColor: 'var(--card-border)' }}>
              <div className="absolute top-0 right-0 w-40 h-40 blur-[50px] -translate-y-1/2 translate-x-1/2" style={{ backgroundColor: 'var(--accent-light)' }}></div>
              
              <Heart className="absolute bottom-10 right-2 w-32 h-32 rotate-12 pointer-events-none" style={{ color: 'var(--accent-light)' }} strokeWidth={1} fill="currentColor" />
              <Heart className="absolute top-1/3 left-4 w-16 h-16 -rotate-12 pointer-events-none" style={{ color: 'var(--accent-light)' }} strokeWidth={1} fill="currentColor" />
              
              <div className="flex justify-between items-center mb-6 pb-4 border-b" style={{ borderColor: 'var(--card-border)' }}>
                 <div className="flex flex-col gap-1">
                   <span className="font-bold tracking-widest text-[10px] uppercase" style={{ color: 'var(--accent-text)' }}>{dateStr}</span>
                   <span className="font-sans font-bold text-[10px] tracking-widest uppercase opacity-80" style={{ color: 'var(--accent-color)' }}>{timeStr}</span>
                 </div>
                 <h3 className="uppercase text-[12px] tracking-[0.3em] font-black opacity-30" style={{ color: 'var(--accent-color)' }}>Diary</h3>
              </div>
              
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title / Occasion..."
                className="w-full p-0 bg-transparent text-3xl font-bold mb-6 outline-none relative z-10"
                style={{ fontFamily: "'Caveat', cursive", color: 'var(--accent-text)' }}
              />
              
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Dearest Kanna, today I wanted to tell you..."
                className="w-full min-h-[240px] p-0 bg-transparent text-2xl leading-[1.6] mb-6 resize-none outline-none relative z-10 opacity-90"
                style={{ fontFamily: "'Caveat', cursive", color: 'var(--accent-text)' }}
              />
              
              <div className="flex items-end justify-between border-t border-white/5 pt-6 relative z-20">
                 <div className="flex flex-wrap gap-2.5 w-full">
                   {/* Download Image */}
                   <button 
                     onClick={() => executeImageAction(title, content, 'Smiley', dateStr, timeStr, 'download')}
                     disabled={!content.trim()}
                     title="Download Image Card"
                     className="w-10 h-10 font-bold rounded-full flex items-center justify-center border disabled:opacity-50 active:scale-95 transition-all cursor-pointer"
                     style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent-text)', borderColor: 'var(--card-border)' }}
                   >
                     <Download className="w-4 h-4" />
                   </button>
                   
                   {/* Save/Update to Diary */}
                   <button 
                     onClick={handleSave}
                     disabled={!content.trim() || !title.trim()}
                     title={editingLetterId ? "Update Letter" : "Save to Diary"}
                     className={`w-10 h-10 font-bold rounded-full flex items-center justify-center border disabled:opacity-50 active:scale-95 transition-all cursor-pointer ${editingLetterId ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-white/5 text-white/50 border-white/5 hover:bg-white/10'}`}
                   >
                     <Save className="w-4 h-4" />
                   </button>

                   {/* Cancel Edit Button */}
                   {editingLetterId && (
                     <button
                       onClick={() => {
                         setEditingLetterId(null);
                         setTitle('');
                         setContent('');
                       }}
                       title="Cancel Edit"
                       className="px-3.5 h-10 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full font-bold text-[10px] uppercase tracking-wider active:scale-95 cursor-pointer"
                     >
                       Cancel
                     </button>
                   )}

                   {/* Share Text to WhatsApp */}
                   <button 
                     onClick={() => shareText(`💖 DEAREST KANNA 💖\n\n${content}\n\n💌 Written on Smilance`)}
                     disabled={!content.trim()}
                     title="Share Text to WhatsApp"
                     className="w-10 h-10 font-bold rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.5)] disabled:opacity-50 active:scale-95 transition-all cursor-pointer bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/30"
                   >
                     <FaWhatsapp size={18} />
                   </button>
                   
                   {/* Share Image (WhatsApp / System) */}
                   <button 
                     onClick={() => executeImageAction(title, content, 'Smiley', dateStr, timeStr, 'share')}
                     disabled={!content.trim()}
                     title="Share Image"
                     className="w-10 h-10 font-bold rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.5)] disabled:opacity-50 active:scale-95 transition-all cursor-pointer bg-teal-600/20 text-teal-400 hover:bg-teal-600/30 border border-teal-500/30"
                   >
                     <Share2 className="w-4 h-4" />
                   </button>
                   
                   <div className="font-bold text-xl tracking-wide ml-auto self-center" style={{ fontFamily: "'Caveat', cursive", color: 'var(--accent-text)' }}>
                     ~ Smiley
                   </div>
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'saved' && (
            <div className="flex flex-col gap-3">
              {savedLetters.length === 0 ? (
                <div className="dark-card text-center py-10 opacity-70">
                   <Book className="w-10 h-10 text-gray-500 mx-auto mb-3 opacity-50" />
                   <p className="text-sm font-bold text-gray-400">No saved letters yet</p>
                   <p className="text-[11px] text-gray-500 mt-1">Your offline journal to Kanna.</p>
                </div>
              ) : (
                savedLetters.map(letter => (
                  <button key={letter.id} onClick={() => setSelectedLocalLetter(letter)} className="dark-card !p-4 flex items-center justify-between hover:bg-white/5 transition-colors text-left border-l-4 cursor-pointer" style={{ borderLeftColor: 'var(--accent-color)' }}>
                     <div>
                        <h4 className="font-bold text-white text-[15px] mb-1">{letter.title}</h4>
                        <p className="text-[11px] font-bold tracking-wider uppercase" style={{ color: 'var(--accent-text)' }}>
                          {new Date(letter.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                     </div>
                     <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                ))
              )}
            </div>
          )}

          {activeTab === 'received' && (
            <div className="flex flex-col gap-3.5">
              {/* 1. Letter 1: September 7th — 7th Letter (Birthday Eve Letter) */}
              <button
                onClick={() => setSelectedSpecialLetter('eve')}
                className="w-full relative overflow-hidden p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-purple-950/80 via-[#26081c]/70 to-rose-950/80 border border-purple-400/40 shadow-[0_8px_30px_rgba(168,85,247,0.2)] flex items-center justify-between text-left hover:scale-[1.01] active:scale-98 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg border border-purple-200/50 shrink-0">
                    <Heart className="w-6 h-6 text-white fill-white animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-purple-400/20 text-purple-200 border border-purple-400/30">
                        7th Letter • Sept 7 Eve
                      </span>
                      <span className="text-[10px] text-purple-300/80 font-medium">1st Letter</span>
                    </div>
                    <h4 className="font-serif font-bold text-white text-sm sm:text-base group-hover:text-purple-200 transition-colors">
                      A Midnight Eve Whisper 🌙
                    </h4>
                    <p className="text-[11px] text-purple-200/75 italic font-serif">
                      Waiting for your special day • Counting every second for you
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-purple-300/80 group-hover:translate-x-1 transition-transform shrink-0" />
              </button>

              {/* 2. Letter 2: September 8th — 8th Letter (Grand Birthday Sanctuary Letter) */}
              <button
                onClick={() => setSelectedSpecialLetter('birthday')}
                className="w-full relative overflow-hidden p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-rose-950/80 via-[#2a081a]/70 to-amber-950/80 border border-amber-400/40 shadow-[0_8px_30px_rgba(244,63,94,0.25)] flex items-center justify-between text-left hover:scale-[1.01] active:scale-98 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 via-pink-600 to-amber-500 flex items-center justify-center shadow-lg border border-amber-200/50 shrink-0">
                    <Heart className="w-6 h-6 text-white fill-white animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                        8th Letter • Sept 8 Birthday
                      </span>
                      <span className="text-[10px] text-amber-300/80 font-medium">2nd Letter</span>
                    </div>
                    <h4 className="font-serif font-bold text-white text-sm sm:text-base group-hover:text-amber-200 transition-colors">
                      Kanna's Birthday Love Letter 🎂💌
                    </h4>
                    <p className="text-[11px] text-rose-200/70 italic font-serif">
                      From online friends to my future wife • Unbroken vows
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-amber-300/80 group-hover:translate-x-1 transition-transform shrink-0" />
              </button>

              {/* 3. Letter 3: September 12th — Today's 12th Letter (3rd Letter) */}
              <button
                onClick={() => setShowCinematicLetter(true)}
                className="w-full relative overflow-hidden p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-rose-950/85 via-[#380b24]/75 to-rose-950/85 border border-rose-400/40 shadow-[0_8px_30px_rgba(230,57,110,0.25)] flex items-center justify-between text-left hover:scale-[1.01] active:scale-98 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-600 to-amber-400 flex items-center justify-center shadow-lg border border-rose-200/50 shrink-0">
                    <Heart className="w-6 h-6 text-white fill-white animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-rose-400/20 text-rose-200 border border-rose-400/30">
                        12th Letter • Today's Letter
                      </span>
                      <span className="text-[10px] text-rose-300/80 font-medium">3rd Letter</span>
                    </div>
                    <h4 className="font-serif font-bold text-white text-sm sm:text-base group-hover:text-rose-200 transition-colors">
                      To My Forever Smiley — An Endless Dream 🌸
                    </h4>
                    <p className="text-[11px] text-rose-200/75 italic font-serif">
                      Our Journey • June 6 Sanctuary & Sept 8 Birthday Queen
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-rose-300/80 group-hover:translate-x-1 transition-transform shrink-0" />
              </button>

              {/* Daily Love Notes Grid */}
              <div className="pt-2">
                <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2 block text-left">
                  Daily Notes From Him
                </span>
                <div className="grid grid-cols-2 gap-3">
                  {LETTERS.map(letter => (
                    <button
                      key={letter.id}
                      onClick={() => setSelectedLetter(letter)}
                      className="flex flex-col items-center justify-center p-6 rounded-3xl bg-black/40 border border-white/5 transition gap-4 backdrop-blur-md hover:bg-white/5 cursor-pointer"
                    >
                      <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-md border" style={{ backgroundColor: 'var(--accent-light)', borderColor: 'var(--card-border)' }}>
                        <Mail className="w-5 h-5" style={{ color: 'var(--accent-text)' }} />
                      </div>
                      <span className="text-[13px] font-bold text-white/90 tracking-wide">{letter.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
      {/* Full-Screen Cinematic Letter Modal rendered via Portal directly on document.body:
          App Title Header and Footer Card are completely hidden, with only small side arrow for back and download button */}
      {showCinematicLetter && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 w-screen h-screen z-[99999999] bg-[#fff5f8] flex flex-col animate-fadeIn overflow-hidden">
          {/* Top Floating Control Bar: Small side arrow for back + Download button ONLY */}
          <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-[100000000] flex items-center gap-2">
            <button
              onClick={() => setShowCinematicLetter(false)}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/95 backdrop-blur-md border border-rose-300/60 shadow-lg flex items-center justify-center text-rose-800 hover:bg-white hover:scale-105 active:scale-95 transition-all cursor-pointer"
              title="Back to Letters"
            >
              <ArrowLeft className="w-5 h-5 text-rose-700" />
            </button>
            <button
              onClick={handleDownloadCinematicLetter}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/95 backdrop-blur-md border border-rose-300/60 shadow-lg flex items-center justify-center text-rose-800 hover:bg-white hover:scale-105 active:scale-95 transition-all cursor-pointer"
              title="Download Letter as PNG"
            >
              <Download className="w-4 h-4 text-rose-700" />
            </button>
          </div>
          <iframe
            id="cinematic-letter-iframe"
            src="./letterforsmiley.html"
            className="w-full h-full border-none"
            title="To My Forever Smiley — An Endless Dream"
          />
        </div>,
        document.body
      )}
    </div>
  );
}
