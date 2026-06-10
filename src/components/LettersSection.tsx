import React, { useState, useRef, useEffect } from 'react';
import { Mail, Send, Book, Plus, ChevronRight, Save, Download, Heart } from 'lucide-react';
import { LETTERS } from '../data';
import { db } from '../db';
import { useLiveQuery } from 'dexie-react-hooks';
import * as htmlToImage from 'html-to-image';

export default function LettersSection() {
  const [selectedLetter, setSelectedLetter] = useState<any>(null);
  const [selectedLocalLetter, setSelectedLocalLetter] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'write' | 'saved' | 'received'>('write');
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());

  const downloadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const savedLetters = useLiveQuery(() => db.letters.orderBy('id').reverse().toArray()) || [];

  const handleSave = async () => {
    if (!content.trim() || !title.trim()) return;
    await db.letters.add({
      title: title.trim(),
      content: content.trim(),
      date: new Date().toISOString(),
      mood: 'love'
    });
    setTitle('');
    setContent('');
    setActiveTab('saved');
    (window as any).showSmilanceToast?.("💖 Letter saved to diary!");
  };

  const handleShare = () => {
    if (!content.trim()) return;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent("💖 DEAREST KANNA 💖\n\n" + content + "\n\n💌 Written on Smilance")}`;
    window.open(url, '_blank');
  };

  const handleDownload = async () => {
    if (!downloadRef.current) return;
    try {
      const dataUrl = await htmlToImage.toPng(downloadRef.current, { 
        backgroundColor: '#12050A',
        pixelRatio: 2
      });
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `Diary_to_Kanna_${new Date().getTime()}.png`;
      link.click();
      (window as any).showSmilanceToast?.("📥 Letter image downloaded! 💖");
    } catch (e) {
      console.error('Download failed:', e);
      (window as any).showSmilanceToast?.("❌ Image generation failed.");
    }
  };

  const dateStr = currentDate.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
  const timeStr = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex flex-col gap-4">
      {/* Local Letter Viewer */}
      {selectedLocalLetter ? (
        <div className="flex flex-col animate-fadeIn">
          <div className="flex items-center justify-between pb-4">
             <button onClick={() => setSelectedLocalLetter(null)} className="text-gray-400 font-bold uppercase tracking-widest text-xs px-3 py-1.5 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10">← Back</button>
             <button onClick={async () => {
               if (window.confirm("Do you want to delete this precious letter forever? 💖")) {
                 await db.letters.delete(selectedLocalLetter.id);
                 (window as any).showSmilanceToast?.("🗑️ Letter deleted successfully!");
                 setSelectedLocalLetter(null);
               }
             }} className="text-rose-400 hover:text-rose-300 font-bold uppercase tracking-widest text-xs px-3 py-1.5 bg-rose-500/10 rounded-lg border border-rose-500/20 hover:bg-rose-500/20">Delete</button>
          </div>
          <div className="flex-1 border rounded-3xl p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden" style={{ backgroundColor: 'var(--bg-top)', borderColor: 'var(--card-border)' }}>
            <Heart className="absolute bottom-10 right-2 w-32 h-32 rotate-12 pointer-events-none" style={{ color: 'var(--accent-light)' }} strokeWidth={1} fill="currentColor" />
            <h3 className="text-3xl font-bold mb-2 relative z-10" style={{ fontFamily: "'Caveat', cursive", color: 'var(--accent-text)' }}>{selectedLocalLetter.title}</h3>
            <p className="font-sans text-[10px] font-bold tracking-widest uppercase mb-8 pb-4 border-b border-white/10 relative z-10" style={{ color: 'var(--accent-color)' }}>
              {new Date(selectedLocalLetter.date).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
            <p className="text-[22px] leading-[1.6] text-white/90 whitespace-pre-wrap relative z-10" style={{ fontFamily: "'Caveat', cursive" }}>
              {selectedLocalLetter.content}
            </p>
          </div>
        </div>
      ) : selectedLetter ? (
        <div className="flex flex-col animate-fadeIn">
          <div className="flex items-center justify-between pb-4">
             <button onClick={() => setSelectedLetter(null)} className="text-gray-400 font-bold uppercase tracking-widest text-xs px-2 py-1 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10">← Back</button>
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
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 p-2 rounded-2xl border backdrop-blur-md sticky top-0 z-20 shadow-md" style={{ backgroundColor: 'var(--bg-top)', borderColor: 'var(--card-border)' }}>
             <button onClick={() => setActiveTab('write')} className="flex-1 text-xs font-bold py-3 rounded-xl transition border" style={activeTab === 'write' ? { backgroundColor: 'var(--accent-light)', color: 'var(--accent-text)', borderColor: 'var(--accent-light)' } : { borderColor: 'transparent', color: '#6b7280' }}>Write</button>
             <button onClick={() => setActiveTab('saved')} className="flex-1 text-xs font-bold py-3 rounded-xl transition border" style={activeTab === 'saved' ? { backgroundColor: 'var(--accent-light)', color: 'var(--accent-text)', borderColor: 'var(--accent-light)' } : { borderColor: 'transparent', color: '#6b7280' }}>My Letters</button>
             <button onClick={() => setActiveTab('received')} className="flex-1 text-xs font-bold py-3 rounded-xl transition border" style={activeTab === 'received' ? { backgroundColor: 'var(--accent-light)', color: 'var(--accent-text)', borderColor: 'var(--accent-light)' } : { borderColor: 'transparent', color: '#6b7280' }}>From Kanna</button>
          </div>

          {/* Hidden container for image export */}
      <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
         <div ref={downloadRef} className="w-[800px] p-20 text-left border-[8px] relative overflow-hidden" style={{ minHeight: '1131px', backgroundColor: 'var(--bg-top)', borderColor: 'var(--card-border)' }}>
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/20 via-black to-black"></div>
            
            {/* Background Hearts */}
            <Heart className="absolute top-10 left-10 w-32 h-32 text-white/5 -rotate-12" strokeWidth={1} fill="currentColor" />
            <Heart className="absolute bottom-20 right-10 w-48 h-48 text-white/5 rotate-12" strokeWidth={1} fill="currentColor" />
            <Heart className="absolute top-1/2 right-1/4 w-24 h-24 text-white/5 rotate-45" strokeWidth={1} fill="currentColor" />
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex justify-between items-end border-b-2 mb-10 pb-6" style={{ borderColor: 'var(--card-border)' }}>
                <div>
                  <h2 className="font-bold text-2xl tracking-widest uppercase font-sans" style={{ color: 'var(--text-primary)' }}>{dateStr}</h2>
                  <p className="font-sans font-bold text-lg tracking-widest mt-2 opacity-80" style={{ color: 'var(--text-primary)' }}>{timeStr}</p>
                </div>
                <h1 className="text-5xl uppercase tracking-[0.3em] font-black pointer-events-none font-sans opacity-20" style={{ color: 'var(--text-primary)' }}>Diary</h1>
              </div>
              
              <h3 className="text-6xl font-bold mb-10 leading-snug" style={{ fontFamily: "'Caveat', cursive", color: 'var(--text-primary)' }}>{title || 'Dear Kanna,'}</h3>
              
              <p className="text-[36px] leading-[1.8] whitespace-pre-wrap break-words flex-1 opacity-90" style={{ fontFamily: "'Caveat', cursive", color: 'var(--text-primary)' }}>
                {content || '...'}
              </p>
              
              <div className="mt-20 pt-10 text-right text-4xl font-bold opacity-90" style={{ fontFamily: "'Caveat', cursive", color: 'var(--text-primary)' }}>
                Always & Forever, <br/>
                <span className="text-5xl mt-4 block" style={{ color: 'var(--text-primary)' }}>~ Smiley</span>
              </div>
            </div>
         </div>
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
             <div className="flex gap-2 w-full">
               <button 
                 onClick={handleDownload}
                 disabled={!content.trim()}
                 className="w-10 h-10 font-bold rounded-full flex items-center justify-center border disabled:opacity-50 active:scale-95 transition-all"
                 style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent-text)', borderColor: 'var(--card-border)' }}
               >
                 <Download className="w-4 h-4" />
               </button>
               <button 
                 onClick={handleSave}
                 disabled={!content.trim() || !title.trim()}
                 className="w-10 h-10 bg-white/5 text-white/50 font-bold rounded-full flex items-center justify-center border border-white/5 disabled:opacity-50 hover:bg-white/10 active:scale-95 transition-all"
               >
                 <Save className="w-4 h-4" />
               </button>
               <button 
                 onClick={handleShare}
                 disabled={!content.trim()}
                 className="w-10 h-10 text-white font-bold rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.5)] disabled:opacity-50 active:scale-95 transition-all"
                 style={{ backgroundColor: 'var(--accent-color)' }}
               >
                 <Send className="w-4 h-4" />
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
              <button key={letter.id} onClick={() => setSelectedLocalLetter(letter)} className="dark-card !p-4 flex items-center justify-between hover:bg-white/5 transition-colors text-left border-l-4" style={{ borderLeftColor: 'var(--accent-color)' }}>
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
        <div className="grid grid-cols-2 gap-3">
          {LETTERS.map(letter => (
            <button
              key={letter.id}
              onClick={() => setSelectedLetter(letter)}
              className="flex flex-col items-center justify-center p-6 rounded-3xl bg-black/40 border border-white/5 transition gap-4 backdrop-blur-md hover:bg-white/5"
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-md border" style={{ backgroundColor: 'var(--accent-light)', borderColor: 'var(--card-border)' }}>
                <Mail className="w-5 h-5" style={{ color: 'var(--accent-text)' }} />
              </div>
              <span className="text-[13px] font-bold text-white/90 tracking-wide">{letter.title}</span>
            </button>
          ))}
        </div>
      )}
      </>
      )}
    </div>
  );
}
