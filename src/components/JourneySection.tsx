import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Calendar, Heart, ChevronLeft, ChevronRight } from 'lucide-react';

const INITIAL_TIMELINE = [
  {
    id: 'fixed-1',
    date: "APRIL 6, 2025 (SUNDAY)",
    title: "The Day We Met online ✨",
    description: "The beautiful Sunday our paths first crossed digitally. A divine spark that marked the beginning of our Smilance story.",
    isFixed: true
  },
  {
    id: 'fixed-2',
    date: "OUR DAILY ROUTINE",
    title: "Praying Together on Calls 🙏",
    description: "We started connecting in faith, sharing daily prayers on call. Keeping God at the anchor of our hearts and our future.",
    isFixed: true
  },
  {
    id: 'fixed-3',
    date: "JUNE 6, 2026 (SATURDAY)",
    title: "First Met in Real Life 💑",
    description: "An unforgettable Saturday! Seeing each other in person for the first time, turning digital conversations into beautiful reality.",
    isFixed: true
  }
];

export default function JourneySection() {
  const [timeline, setTimeline] = useState(() => {
    try {
      const saved = localStorage.getItem('smilance_journey');
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return INITIAL_TIMELINE;
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dateStr, setDateStr] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerMonth, setPickerMonth] = useState(() => new Date());
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    localStorage.setItem('smilance_journey', JSON.stringify(timeline));
  }, [timeline]);

  const handleSave = () => {
    if (!title.trim() || !description.trim() || !dateStr.trim()) return;

    if (editingId) {
      setTimeline(timeline.map((item: any) => 
        item.id === editingId ? { ...item, date: dateStr.toUpperCase(), title, description } : item
      ));
    } else {
      setTimeline([...timeline, {
        id: `journey-${Date.now()}`,
        date: dateStr.toUpperCase(),
        title,
        description,
        isFixed: false
      }]);
    }
    
    setIsEditing(false);
    setEditingId(null);
    setDateStr('');
    setTitle('');
    setDescription('');
  };

  const parseDateStr = (str: string) => {
    try {
      const parts = str.split('(')[0].trim();
      const d = new Date(parts);
      if (!isNaN(d.getTime())) return d;
    } catch {}
    return new Date();
  };

  const handleEdit = (item: any) => {
    if (item.isFixed) return;
    setDateStr(item.date);
    setTitle(item.title);
    setDescription(item.description);
    setEditingId(item.id);
    setIsEditing(true);
    setPickerMonth(parseDateStr(item.date));
  };

  const nextPickerMonth = () => {
    setPickerMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const prevPickerMonth = () => {
    setPickerMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this memory?")) {
      setTimeline(timeline.filter((item: any) => item.id !== id));
    }
  };

  if (isEditing) {
    return (
      <div className="flex flex-col animate-fadeIn mt-2 text-left">
        <div className="flex items-center justify-between pb-4">
           <button onClick={() => { setIsEditing(false); setEditingId(null); setDateStr(''); setTitle(''); setDescription(''); }} className="text-gray-400 font-bold uppercase tracking-widest text-xs px-2 py-1 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10">← Back</button>
           <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--accent-text)' }}>
             {editingId ? 'Edit Memory' : 'New Memory'}
           </span>
        </div>
        
        <div className="dark-card p-6 border rounded-3xl mt-2 overflow-visible relative" style={{ backgroundColor: 'var(--bg-top)', borderColor: 'var(--card-border)' }}>
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-[10px] font-bold tracking-widest uppercase mb-2 block" style={{ color: 'var(--accent-text)' }}>Date / Occasion</label>
              <div className="relative">
                <button 
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="w-full text-left bg-black/40 border border-white/5 rounded-xl p-3 flex justify-between items-center transition-colors hover:bg-white/5"
                  style={{ color: dateStr ? 'white' : 'gray' }}
                >
                  <span className="text-sm font-mono truncate">{dateStr || 'e.g. JULY 10, 2026 (FRIDAY)'}</span>
                  <Calendar className="w-4 h-4" style={{ color: 'var(--accent-color)' }} />
                </button>
                <input 
                  value={dateStr}
                  onChange={e => setDateStr(e.target.value)}
                  placeholder="Or type directly..."
                  className="w-full bg-transparent border-0 text-sm text-white focus:outline-none focus:ring-0 mt-2 px-3 py-1 font-mono uppercase"
                  style={{ display: showDatePicker ? 'none' : 'block' }}
                />

                {showDatePicker && (
                  <div className="absolute top-full mt-2 w-full p-4 bg-[#11050a] border rounded-xl z-50 shadow-2xl animate-fadeIn" style={{ borderColor: 'var(--accent-color)' }}>
                     <div className="flex items-center justify-between mb-4">
                        <button onClick={prevPickerMonth} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"><ChevronLeft className="w-4 h-4 text-gray-300" /></button>
                        <span className="font-bold text-sm uppercase tracking-widest font-mono" style={{ color: 'var(--accent-text)' }}>
                          {pickerMonth.toLocaleDateString([], { month: 'long', year: 'numeric' })}
                        </span>
                        <button onClick={nextPickerMonth} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"><ChevronRight className="w-4 h-4 text-gray-300" /></button>
                     </div>
                     <div className="grid grid-cols-7 gap-1 mb-2">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                          <div key={i} className="text-center text-[10px] uppercase font-black" style={{ color: 'var(--accent-text)', opacity: 0.5 }}>{day}</div>
                        ))}
                     </div>
                     <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: new Date(pickerMonth.getFullYear(), pickerMonth.getMonth(), 1).getDay() }).map((_, i) => (
                           <div key={`empty-${i}`} className="aspect-square" />
                        ))}
                        {Array.from({ length: new Date(pickerMonth.getFullYear(), pickerMonth.getMonth() + 1, 0).getDate() }).map((_, i) => {
                           const d = i + 1;
                           const dateObj = new Date(pickerMonth.getFullYear(), pickerMonth.getMonth(), d);
                           
                           return (
                             <button
                               key={d}
                               onClick={() => {
                                 setDateStr(`${dateObj.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()} (${dateObj.toLocaleDateString([], { weekday: 'long' }).toUpperCase()})`);
                                 setShowDatePicker(false);
                               }}
                               className="aspect-square flex items-center justify-center text-xs font-bold rounded-lg hover:bg-white/10 text-gray-300 transition-colors"
                             >
                               {d}
                             </button>
                           );
                        })}
                     </div>
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold tracking-widest uppercase mb-2 block" style={{ color: 'var(--accent-text)' }}>Title</label>
              <input 
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="A Special Moment"
                className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-white/20"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold tracking-widest uppercase mb-2 block" style={{ color: 'var(--accent-text)' }}>Description</label>
              <textarea 
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Details about this beautiful memory..."
                className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-sm text-white h-32 resize-none focus:outline-none focus:border-white/20"
              />
            </div>
            
            <button 
              onClick={handleSave}
              disabled={!title.trim() || !description.trim() || !dateStr.trim()}
              className="w-full rounded-xl p-4 font-bold text-sm text-white mt-2 transition-all disabled:opacity-50 active:scale-95"
              style={{ backgroundColor: 'var(--accent-color)' }}
            >
              SAVE MEMORY
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 relative z-10 text-left">
      <div className="dark-card rounded-3xl p-6 mt-2 relative overflow-hidden" style={{ backgroundColor: 'var(--bg-top)', borderColor: 'var(--card-border)' }}>
         <div className="absolute top-0 right-0 w-40 h-40 blur-[50px] -translate-y-1/2 translate-x-1/2 pointer-events-none" style={{ backgroundColor: 'var(--accent-light)' }}></div>
         <Heart className="absolute bottom-10 -left-10 w-32 h-32 -rotate-12 pointer-events-none opacity-50" strokeWidth={1} fill="currentColor" style={{ color: 'var(--accent-light)' }} />
         
         <div className="flex justify-between items-center mb-8 relative z-10">
           <h2 className="heading-title text-[22px] font-bold tracking-wide" style={{ color: 'var(--accent-text)' }}>
             Our Journey
           </h2>
           <button onClick={() => setIsEditing(true)} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors">
              <Plus className="w-4 h-4" style={{ color: 'var(--accent-text)' }} />
           </button>
         </div>

         <div className="relative pl-6 border-l-[1.5px] border-dashed ml-2 pb-2" style={{ borderColor: 'var(--accent-light)' }}>
            {timeline.map((item: any, idx: number) => (
              <div key={item.id || idx} className="relative mb-10 last:mb-0">
                 {/* Dot */}
                 <div className="absolute -left-[31px] top-0 w-3.5 h-3.5 rounded-full ring-4 ring-black/40 shadow-[0_0_10px_rgba(0,0,0,0.5)]" style={{ backgroundColor: 'var(--accent-color)' }}></div>
                 
                 {/* Date */}
                 <div className="text-[10px] font-black uppercase tracking-widest mb-3 mt-[-2px] flex justify-between items-center" style={{ color: 'var(--accent-color)' }}>
                   {item.date}
                   {!item.isFixed && (
                     <div className="flex gap-2 bg-black/40 p-1 px-2 rounded-lg -mt-1 -mr-2 shadow-inner border border-white/5">
                       <button onClick={() => handleEdit(item)} className="opacity-70 hover:opacity-100 transition-opacity">
                         <Edit2 className="w-3 h-3 text-gray-300" />
                       </button>
                       <button onClick={() => handleDelete(item.id)} className="opacity-70 hover:opacity-100 transition-opacity">
                         <Trash2 className="w-3 h-3 text-red-400" />
                       </button>
                     </div>
                   )}
                 </div>
                 
                 {/* Content Card */}
                 <div className="bg-white/5 rounded-2xl p-4 border border-white/10 hover:bg-white/10 transition-colors">
                   <h4 className="font-bold text-white/90 text-[14px] mb-2 font-sans tracking-tight">{item.title}</h4>
                   <p className="text-white/60 text-xs leading-relaxed font-sans">{item.description}</p>
                 </div>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
}
