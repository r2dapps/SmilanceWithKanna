import React, { useState, useEffect, useMemo } from 'react';
import { 
  CalendarHeart, Check, Smile, RefreshCw, Heart, Droplets, 
  ChevronLeft, ChevronRight, Calendar, History, Trash2, 
  AlertCircle, Settings, Sparkles, Download, Upload, Activity, Clock 
} from 'lucide-react';
import CycleAnalytics from './CycleAnalytics';
import CycleInsightsView from './CycleInsightsView';
import LiquidBubbles from './LiquidBubbles';

export interface DailyLog {
  s: string[];  // Symptoms list
  m: string[];  // Moods list
  f: string;    // Flow: 'Light', 'Medium', 'Heavy', 'Spotting', or ''
  e: number;    // Energy level: 0 to 5
  w: number;    // Water intake: 0 to 8 glasses
  sl: string;   // Sleep duration: '4h', '5h', '6h', '7h', '8h+', or ''
}

export interface CycleSectionProps {
  lastPeriodDate: string;
  setLastPeriodDate: (val: string) => void;
  cycleLength: number;
  setCycleLength: (val: number) => void;
  periodDuration: number;
  setPeriodDuration: (val: number) => void;
  cycleSymptoms: Record<string, DailyLog>;
  setCycleSymptoms: React.Dispatch<React.SetStateAction<Record<string, DailyLog>>>;
}

// 1. Timezone-Safe Date Utilities
export const getLocalDateString = (d: Date = new Date()): string => {
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().split('T')[0];
};

// 2. Safe SSR Local Storage Accessors
const isBrowser = typeof window !== 'undefined';

const safeGetItem = (key: string, fbValue: string): string => {
  if (isBrowser) {
    return localStorage.getItem(key) || fbValue;
  }
  return fbValue;
};

const safeSetItem = (key: string, val: string): void => {
  if (isBrowser) {
    try {
      localStorage.setItem(key, val);
    } catch (e) {
      console.warn("Storage write blocked", e);
    }
  }
};

const safeRemoveItem = (key: string): void => {
  if (isBrowser) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn("Storage remove blocked", e);
    }
  }
};

export default function CycleSection({
  lastPeriodDate,
  setLastPeriodDate,
  cycleLength,
  setCycleLength,
  periodDuration,
  setPeriodDuration,
  cycleSymptoms,
  setCycleSymptoms
}: CycleSectionProps) {
  const [logMessage, setLogMessage] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Highlighting active logging date
  const [activeLogDate, setActiveLogDate] = useState(() => getLocalDateString());

  const [pickerMonth, setPickerMonth] = useState(() => {
    return lastPeriodDate ? new Date(lastPeriodDate) : new Date();
  });

  const [periodHistory, setPeriodHistory] = useState<string[]>(() => {
    try {
      return JSON.parse(safeGetItem('smilance_period_history', '[]'));
    } catch {
      return [];
    }
  });

  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  // 3. Automated legacy symptoms data model migrator on mount
  useEffect(() => {
    let modified = false;
    const migrated = { ...cycleSymptoms };
    
    Object.keys(migrated).forEach((key) => {
      const rawVal = migrated[key];
      if (Array.isArray(rawVal)) {
        migrated[key] = {
          s: rawVal,
          m: [],
          f: '',
          e: 0,
          w: 0,
          sl: ''
        };
        modified = true;
      }
    });

    if (modified) {
      setCycleSymptoms(migrated);
      safeSetItem('smilance_cycle_symptoms', JSON.stringify(migrated));
    }
  }, [cycleSymptoms, setCycleSymptoms]);

  // Phase Calculation logic (ovulationDay = cycleLength - 14)
  const getDayPhase = (targetDate: Date): string | null => {
    if (!lastPeriodDate) return null;
    const lastDate = new Date(lastPeriodDate);
    lastDate.setHours(0,0,0,0);
    const date = new Date(targetDate);
    date.setHours(0,0,0,0);

    const diffTime = date.getTime() - lastDate.getTime();
    let diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      diffDays = (diffDays % cycleLength) + cycleLength;
      if (diffDays === cycleLength) diffDays = 0;
    }

    const currentCycleDay = (diffDays % cycleLength) + 1;
    const ovulationDay = cycleLength - 14;

    if (currentCycleDay <= periodDuration) return 'menstrual';
    if (currentCycleDay < ovulationDay - 2) return 'follicular';
    if (currentCycleDay >= ovulationDay - 2 && currentCycleDay <= ovulationDay + 1) return 'ovulatory';
    return 'luteal';
  };

  const nextMonth = () => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1));
  const prevMonth = () => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1));

  const nextPickerMonth = () => setPickerMonth(new Date(pickerMonth.getFullYear(), pickerMonth.getMonth() + 1, 1));
  const prevPickerMonth = () => setPickerMonth(new Date(pickerMonth.getFullYear(), pickerMonth.getMonth() - 1, 1));

  // Date selection from baseline Picker
  const handleDateSelect = (dayNum: number) => {
    const target = new Date(pickerMonth.getFullYear(), pickerMonth.getMonth(), dayNum);
    const isoStrDate = getLocalDateString(target);

    setLastPeriodDate(isoStrDate);
    safeSetItem('smilance_last_period', isoStrDate);

    const fullTimestampStr = new Date(target.setHours(9, 0, 0, 0)).toISOString();
    
    // Clean history from duplicate local matches
    const cleanHistory = periodHistory.filter(h => {
      const hLocal = getLocalDateString(new Date(h));
      return hLocal !== isoStrDate;
    });

    const newHistory = [fullTimestampStr, ...cleanHistory].sort((a,b) => new Date(b).getTime() - new Date(a).getTime());
    setPeriodHistory(newHistory);
    safeSetItem('smilance_period_history', JSON.stringify(newHistory));

    setShowDatePicker(false);
    setLogMessage('✨ Start date updated in cycle history.');
    (window as any).showSmilanceToast?.("📅 Start date updated! 💖");
    setTimeout(() => setLogMessage(''), 4000);
  };

  // Helper selectors
  const getDailyLog = (dateStr: string): DailyLog => {
    const raw = cycleSymptoms[dateStr];
    if (!raw) return { s: [], m: [], f: '', e: 0, w: 0, sl: '' };
    if (Array.isArray(raw)) return { s: raw, m: [], f: '', e: 0, w: 0, sl: '' };
    return raw;
  };

  const updateDailyLog = (dateStr: string, updates: Partial<DailyLog>) => {
    const prev = getDailyLog(dateStr);
    const next = { ...prev, ...updates };
    const finalSymp = { ...cycleSymptoms, [dateStr]: next };
    setCycleSymptoms(finalSymp);
    safeSetItem('smilance_cycle_symptoms', JSON.stringify(finalSymp));
  };

  // 4. Computed stats via useMemo
  const stats = useMemo(() => {
    if (!lastPeriodDate) return null;
    const today = new Date();
    today.setHours(0,0,0,0);
    const lastDate = new Date(lastPeriodDate);
    lastDate.setHours(0,0,0,0);

    const diffTime = today.getTime() - lastDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return null;

    const currentCycleDay = (diffDays % cycleLength) + 1;
    const cyclesCompleted = Math.floor(diffDays / cycleLength);
    const nextPeriodStart = new Date(lastDate);
    nextPeriodStart.setDate(lastDate.getDate() + (cyclesCompleted + 1) * cycleLength);
    
    const daysUntilNextPeriod = Math.floor((nextPeriodStart.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    const ovulationDayVal = cycleLength - 14;
    const ovulationDay = new Date(nextPeriodStart);
    ovulationDay.setDate(nextPeriodStart.getDate() - 14);

    const fertilityWindowStart = new Date(ovulationDay);
    fertilityWindowStart.setDate(ovulationDay.getDate() - 3);
    const fertilityWindowEnd = new Date(ovulationDay);
    fertilityWindowEnd.setDate(ovulationDay.getDate() + 1);

    let phase = "";
    let message = "";
    let colorName = "";
    let iconColor = "";

    if (currentCycleDay <= periodDuration) {
      phase = "Menstrual Phase";
      colorName = "from-rose-600 to-rose-900";
      iconColor = "text-rose-500";
      message = "Rest and recharge. Your energy is lowest, focus on hydration and gentle care.";
    } else if (currentCycleDay < ovulationDayVal - 2) {
      phase = "Follicular Phase";
      colorName = "from-emerald-500 to-emerald-800";
      iconColor = "text-emerald-400";
      message = "Great time for new ideas! Energy is rising, you might feel more upbeat and creative.";
    } else if (currentCycleDay >= ovulationDayVal - 2 && currentCycleDay <= ovulationDayVal + 1) {
      phase = "Ovulatory Phase";
      colorName = "from-pink-500 to-pink-800";
      iconColor = "text-pink-400";
      message = "High energy day! You'll likely feel most confident, expressive, and radiant right now.";
    } else {
      phase = "Luteal Phase";
      colorName = "from-purple-500 to-purple-800";
      iconColor = "text-purple-400";
      message = "Take things a little slower. Be extremely kind to yourself and prioritize self-care.";
    }

    // Missed Period Warning Alert calculation
    const predictedStartValue = new Date(nextPeriodStart);
    const msDelayed = today.getTime() - predictedStartValue.getTime();
    const daysDelayedDifference = Math.floor(msDelayed / (1000 * 60 * 60 * 24));
    const isDelayed = daysDelayedDifference > 7;

    return {
      currentCycleDay,
      nextPeriodStartStr: nextPeriodStart.toLocaleDateString([], { month: 'short', day: 'numeric' }),
      daysUntilNextPeriod,
      fertilityWindowStr: `${fertilityWindowStart.toLocaleDateString([], { month: 'short', day: 'numeric' })} - ${fertilityWindowEnd.toLocaleDateString([], { month: 'short', day: 'numeric' })}`,
      ovulationDayStr: ovulationDay.toLocaleDateString([], { month: 'short', day: 'numeric' }),
      phase, colorName, iconColor, message, isDelayed, daysDelayedDifference
    };
  }, [lastPeriodDate, cycleLength, periodDuration]);

  // Smarter Historical baseline analysis (Average and Variability)
  const smarterMetrics = useMemo(() => {
    if (periodHistory.length < 2) {
      return {
        avgCycleLength: cycleLength,
        variability: 0,
        predictionConfidence: periodHistory.length === 1 ? 'Low' : 'None',
        cyclesTracked: periodHistory.length
      };
    }

    // Parse intervals
    const dates = periodHistory.map(h => new Date(h)).sort((a,b) => a.getTime() - b.getTime());
    const intervals: number[] = [];

    for (let i = 1; i < dates.length; i++) {
      const diffTime = dates[i].getTime() - dates[i-1].getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays >= 15 && diffDays <= 45) {
        intervals.push(diffDays);
      }
    }

    const avgCycleLength = intervals.length > 0 
      ? Math.round(intervals.reduce((a, b) => a + b, 0) / intervals.length)
      : cycleLength;

    let variability = 0;
    if (intervals.length > 1) {
      const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const squaredDiffs = intervals.reduce((acc, current) => acc + Math.pow(current - avg, 2), 0);
      variability = Math.round(Math.sqrt(squaredDiffs / intervals.length));
    }

    let predictionConfidence = 'Low';
    if (intervals.length >= 5) predictionConfidence = 'High';
    else if (intervals.length >= 2) predictionConfidence = 'Medium';

    return {
      avgCycleLength,
      variability,
      predictionConfidence,
      cyclesTracked: periodHistory.length
    };
  }, [periodHistory, cycleLength]);

  const handleSetCycleLength = (val: number) => {
    setCycleLength(val);
    safeSetItem('smilance_cycle_length', val.toString());
    (window as any).showSmilanceToast?.(`Baseline cycle set to ${val} days! 💖`);
  };

  const handleSetPeriodDuration = (val: number) => {
    setPeriodDuration(val);
    safeSetItem('smilance_period_duration', val.toString());
    (window as any).showSmilanceToast?.(`Baseline period set to ${val} days! 💖`);
  };

  // Quick Period Log today str (prevent duplication)
  const handleLogPeriodToday = () => {
    const todayLocal = getLocalDateString();
    setLastPeriodDate(todayLocal);
    safeSetItem('smilance_last_period', todayLocal);

    const fullTimestampStr = new Date().toISOString();
    
    // filter out same dates
    const cleanHistory = periodHistory.filter(h => {
      const hd = getLocalDateString(new Date(h));
      return hd !== todayLocal;
    });

    const newHistory = [fullTimestampStr, ...cleanHistory].sort((a,b) => new Date(b).getTime() - new Date(a).getTime());
    setPeriodHistory(newHistory);
    safeSetItem('smilance_period_history', JSON.stringify(newHistory));

    setLogMessage('🩸 Period logged in system.');
    (window as any).showSmilanceToast?.("🩸 Period logged successfully! 💖");
    setTimeout(() => setLogMessage(''), 4000);
  };

  // Fixed Comparison Delete Logic
  const handleRemoveLog = (dateToRemove: string) => {
    const newHistory = periodHistory.filter(d => d !== dateToRemove);
    setPeriodHistory(newHistory);
    safeSetItem('smilance_period_history', JSON.stringify(newHistory));

    const dayToRemoveString = getLocalDateString(new Date(dateToRemove));
    const currentLastPeriodString = getLocalDateString(new Date(lastPeriodDate));

    if (dayToRemoveString === currentLastPeriodString) {
      const nextMostRecentDate = newHistory[0] ? getLocalDateString(new Date(newHistory[0])) : '';
      setLastPeriodDate(nextMostRecentDate);
      safeSetItem('smilance_last_period', nextMostRecentDate);
    }
    (window as any).showSmilanceToast?.("🗑️ Cycle log deleted! 💖");
  };

  const resetCycleData = () => {
    setLastPeriodDate('');
    safeRemoveItem('smilance_last_period');
    setPeriodHistory([]);
    safeRemoveItem('smilance_period_history');
    setCycleSymptoms({});
    safeRemoveItem('smilance_cycle_symptoms');
    setShowResetConfirm(false);
    setLogMessage('✨ Cycle history fully reset.');
    (window as any).showSmilanceToast?.("✨ Cycle history fully reset! 💖");
    setTimeout(() => setLogMessage(''), 4000);
  };

  const getPhaseStyles = (phase: string | null) => {
    switch (phase) {
      case 'menstrual': return 'bg-rose-500/20 text-rose-400 border-rose-500/40 relative z-10 before:absolute before:inset-1 before:bg-rose-500/30 before:-z-10 before:rounded-full shadow-[0_0_10px_rgba(244,63,94,0.3)] font-bold';
      case 'follicular': return 'bg-transparent text-emerald-400 border-transparent hover:bg-emerald-500/10 font-bold';
      case 'ovulatory': return 'bg-pink-500/10 text-pink-400 border-pink-500/40 shadow-[0_0_10px_rgba(236,72,153,0.3)] font-black uppercase tracking-tighter';
      case 'luteal': return 'bg-transparent text-purple-400 border-transparent hover:bg-purple-500/10';
      default: return 'bg-transparent text-white/50 border-transparent';
    }
  };

  // Calendar rendering (With Tap day capability)
  const renderCalendarDays = () => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    
    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    const today = new Date();
    today.setHours(0,0,0,0);

    for (let i = 0; i < firstDayIndex; i++) {
       days.push(<div key={`empty-${i}`} className="aspect-square" />);
    }

    for (let d = 1; d <= daysInMonth; d++) {
       const date = new Date(year, month, d);
       const phase = getDayPhase(date);
       const styles = getPhaseStyles(phase);
       const isToday = getLocalDateString(date) === getLocalDateString(today);
       
       const localDateStr = getLocalDateString(date);
       const isCurrentActive = activeLogDate === localDateStr;

       // Proper dynamic Symptom check
       const logForDay = cycleSymptoms[localDateStr];
       let hasData = false;
       if (logForDay) {
         if (Array.isArray(logForDay)) {
           hasData = logForDay.length > 0;
         } else {
           hasData = (logForDay.s && logForDay.s.length > 0) || 
                     (logForDay.m && logForDay.m.length > 0) || 
                     !!logForDay.f || 
                     logForDay.e > 0 || 
                     logForDay.w > 0 || 
                     !!logForDay.sl;
         }
       }

       days.push(
         <button 
           key={d} 
           onClick={() => setActiveLogDate(localDateStr)}
           className={`aspect-square flex flex-col items-center justify-center rounded-xl text-sm border transition-all cursor-pointer relative ${styles} 
           ${isToday ? 'ring-2 ring-white ring-offset-2 ring-offset-black' : ''}
           ${isCurrentActive ? 'border-amber-400 bg-amber-400/20 shadow-[0_0_12px_rgba(251,191,36,0.3)]' : ''}`}
         >
            <span className="relative z-10 font-bold">{d}</span>
            {hasData && <div className="absolute bottom-1 w-1.5 h-1.5 bg-amber-400 rounded-full" />}
         </button>
       );
    }
    return days;
  };

  const activeDailyLog = getDailyLog(activeLogDate);

  const toggleArrayItem = (key: 's' | 'm', id: string) => {
    const current = activeDailyLog[key] || [];
    const updated = current.includes(id) ? current.filter((x: string) => x !== id) : [...current, id];
    updateDailyLog(activeLogDate, { [key]: updated });
  };

  const updateLogAttr = (key: 'f' | 'e' | 'w' | 'sl', val: any) => {
    updateDailyLog(activeLogDate, { [key]: activeDailyLog[key] === val ? (typeof val === 'number' ? 0 : '') : val });
  };

  // Backups and Export Operations (JSON and CSV)
  const exportToJSON = () => {
    const backupObj = {
      lastPeriodDate,
      cycleLength,
      periodDuration,
      cycleSymptoms,
      periodHistory
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupObj, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href",     dataStr     );
    dlAnchorElem.setAttribute("download", `smilance_cycle_data_backup_${getLocalDateString()}.json`);
    dlAnchorElem.click();
    (window as any).showSmilanceToast?.("📥 JSON Backup downloaded! 💖");
  };

  const exportToCSV = () => {
    const headers = ["Date", "Flow", "Energy", "Water (Glasses)", "Sleep Duration", "Symptoms", "Moods"];
    const rows = Object.entries(cycleSymptoms).map(([dateStr, log]) => {
      return [
        dateStr,
        log.f || 'None',
        log.e || 0,
        log.w || 0,
        log.sl || 'None',
        `"${(log.s || []).join(', ')}"`,
        `"${(log.m || []).join(', ')}"`
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", encodedUri);
    dlAnchorElem.setAttribute("download", `smilance_symptoms_report_${getLocalDateString()}.csv`);
    dlAnchorElem.click();
    (window as any).showSmilanceToast?.("📊 CSV Symptoms Report downloaded! 💖");
  };

  // Backup Upload Restore Handler
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.lastPeriodDate !== undefined) {
            setLastPeriodDate(parsed.lastPeriodDate);
            safeSetItem('smilance_last_period', parsed.lastPeriodDate);
          }
          if (parsed.cycleLength) {
            setCycleLength(parsed.cycleLength);
            safeSetItem('smilance_cycle_length', parsed.cycleLength.toString());
          }
          if (parsed.periodDuration) {
            setPeriodDuration(parsed.periodDuration);
            safeSetItem('smilance_period_duration', parsed.periodDuration.toString());
          }
          if (parsed.cycleSymptoms) {
            setCycleSymptoms(parsed.cycleSymptoms);
            safeSetItem('smilance_cycle_symptoms', JSON.stringify(parsed.cycleSymptoms));
          }
          if (parsed.periodHistory) {
            setPeriodHistory(parsed.periodHistory);
            safeSetItem('smilance_period_history', JSON.stringify(parsed.periodHistory));
          }
          (window as any).showSmilanceToast?.("✅ Backup restored successfully! 🥰");
        } catch (err) {
          (window as any).showSmilanceToast?.("⚠️ Invalid backup file format!");
        }
      };
    }
  };

  const renderConfigurationCard = (isOnboarding: boolean = false) => (
      <div className={`dark-card text-left pt-6 pb-6 relative overflow-visible ${isOnboarding ? '' : 'ring-1 ring-rose-500/20'}`}>
        <div className="absolute -right-10 -top-10 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl mix-blend-screen pointer-events-none"></div>
        
        <h3 className="heading-title text-rose-300 flex items-center gap-2 mb-2 text-lg relative z-10 font-bold uppercase tracking-wider">
          <Settings className="w-5 h-5 text-rose-400" /> {isOnboarding ? 'Welcome to Cycle Tracker' : 'Tracker Setup'}
        </h3>
        <p className="text-[13px] text-gray-400 mb-6 font-medium relative z-10 leading-relaxed">
          {isOnboarding ? 'Please set up your baseline metrics so we can calculate highly accurate menstrual forecasts.' : 'Personalize baseline calculations to match your natural cycle rhythm.'}
        </p>

        <div className="flex flex-col gap-6 relative z-10">
          {/* Calendar Picker for Last Period start */}
          <div className="bg-white/5 p-4 rounded-2xl border border-white/5 shadow-inner">
            <label className="text-[11px] tracking-widest text-rose-300 uppercase font-black mb-3 block">Latest Period Start Date</label>
            <button 
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="w-full p-3.5 rounded-xl border border-rose-500/20 bg-rose-500/5 text-left flex items-center justify-between hover:bg-rose-500/10 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2 text-white font-bold tracking-brand text-sm">
                <Calendar className="w-4 h-4 text-rose-400" />
                {lastPeriodDate ? new Date(lastPeriodDate).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : 'Select Date'}
              </div>
              <ChevronRight className={`w-5 h-5 text-rose-400 transition-transform duration-300 ${showDatePicker ? 'rotate-90' : ''}`} />
            </button>
            
            {showDatePicker && (
               <div className="mt-3 p-4 bg-[#1a0a10] border border-rose-500/20 rounded-xl shadow-[0_10px_30px_rgba(244,63,94,0.15)] animate-fadeIn">
                 <div className="flex items-center justify-between mb-4">
                    <button onClick={prevPickerMonth} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"><ChevronLeft className="w-4 h-4 text-gray-300" /></button>
                    <span className="font-bold text-sm text-rose-100 uppercase tracking-widest font-mono">
                      {pickerMonth.toLocaleDateString([], { month: 'long', year: 'numeric' })}
                    </span>
                    <button onClick={nextPickerMonth} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"><ChevronRight className="w-4 h-4 text-gray-300" /></button>
                 </div>
                 <div className="grid grid-cols-7 gap-1 mb-2">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                      <div key={i} className="text-center text-[10px] uppercase font-black text-rose-300/50">{day}</div>
                    ))}
                 </div>
                 <div className="grid grid-cols-7 gap-1 animate-fadeIn">
                    {Array.from({ length: new Date(pickerMonth.getFullYear(), pickerMonth.getMonth(), 1).getDay() }).map((_, i) => (
                       <div key={`empty-${i}`} className="aspect-square" />
                    ))}
                    {Array.from({ length: new Date(pickerMonth.getFullYear(), pickerMonth.getMonth() + 1, 0).getDate() }).map((_, i) => {
                       const d = i + 1;
                       const date = new Date(pickerMonth.getFullYear(), pickerMonth.getMonth(), d);
                       const isoStr = getLocalDateString(date);
                       const isSelected = isoStr === lastPeriodDate;
                       const isToday = isoStr === getLocalDateString();
                       
                       return (
                         <button 
                           key={d} 
                           type="button"
                           onClick={() => handleDateSelect(d)}
                           className={`aspect-square flex items-center justify-center rounded-lg text-xs md:text-sm font-semibold transition-all cursor-pointer
                           ${isSelected ? 'bg-rose-500 text-white shadow-[0_0_10px_rgba(244,63,94,0.5)] font-bold scale-[1.15] z-10 relative' : 
                             isToday ? 'bg-white/10 text-white ring-1 ring-white/30' : 'text-gray-300 hover:bg-white/5'}`}
                         >
                            {d}
                         </button>
                       )
                    })}
                 </div>
               </div>
            )}
          </div>

          <div className="flex gap-2">
             <div className="flex-1 bg-white/5 p-3 rounded-2xl border border-white/5 shadow-inner min-w-0">
               <label className="text-[10px] tracking-wider text-emerald-300 uppercase font-black mb-3 block truncate">Cycle Length</label>
               <div className="flex items-center justify-between">
                 <button onClick={() => handleSetCycleLength(Math.max(15, cycleLength - 1))} className="w-7 h-7 shrink-0 rounded-full border border-white/10 bg-black/40 flex items-center justify-center text-white hover:bg-white/10 transition-colors">-</button>
                 <div className="flex-1 text-center">
                   <span className="text-xl font-bold text-white">{cycleLength}</span>
                   <span className="text-[9px] uppercase text-gray-400 ml-1 font-bold">days</span>
                 </div>
                 <button onClick={() => handleSetCycleLength(Math.min(45, cycleLength + 1))} className="w-7 h-7 shrink-0 rounded-full border border-white/10 bg-black/40 flex items-center justify-center text-white hover:bg-white/10 transition-colors">+</button>
               </div>
             </div>
             
             <div className="flex-1 bg-white/5 p-3 rounded-2xl border border-white/5 shadow-inner min-w-0">
               <label className="text-[10px] tracking-wider text-pink-300 uppercase font-black mb-3 block truncate">Period Length</label>
               <div className="flex items-center justify-between">
                 <button onClick={() => handleSetPeriodDuration(Math.max(2, periodDuration - 1))} className="w-7 h-7 shrink-0 rounded-full border border-white/10 bg-black/40 flex items-center justify-center text-white hover:bg-white/10 transition-colors">-</button>
                 <div className="flex-1 text-center">
                   <span className="text-xl font-bold text-white">{periodDuration}</span>
                   <span className="text-[9px] uppercase text-gray-400 ml-1 font-bold">days</span>
                 </div>
                 <button onClick={() => handleSetPeriodDuration(Math.min(10, periodDuration + 1))} className="w-7 h-7 shrink-0 rounded-full border border-white/10 bg-black/40 flex items-center justify-center text-white hover:bg-white/10 transition-colors">+</button>
               </div>
             </div>
          </div>
          
          {logMessage && <div className="text-xs text-center text-rose-300 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20 font-bold uppercase tracking-widest animate-fadeIn">{logMessage}</div>}
          
          <button onClick={handleLogPeriodToday} className="w-full bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white font-black p-3.5 rounded-xl mt-2 flex justify-center items-center gap-2 shadow-[0_4px_20px_rgba(244,63,94,0.4)] transition-all active:scale-95 cursor-pointer uppercase tracking-widest text-[11px]">
            <Droplets className="w-4 h-4 fill-current opacity-80" /> Log Cycle Start
          </button>
        </div>
      </div>
  );

  if (!lastPeriodDate) {
    return (
      <div className="flex flex-col gap-4 max-w-xl mx-auto">
        {renderConfigurationCard(true)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start animate-fadeIn pb-8 max-w-6xl mx-auto text-left">
      {/* Left Column Stack - Stats, Map & Backups */}
      <div className="flex flex-col gap-6">
        
        {/* Tracker Overview & Smart History Metrics */}
        {stats ? (
          <div className="dark-card flex flex-col items-center pt-8 border-t-4 border-t-rose-500 overflow-hidden relative">
            <Droplets className="absolute -top-8 -right-8 w-40 h-40 opacity-[0.03] text-white" />
            
            {/* Missed Period Warnings */}
            {stats.isDelayed && (
              <div className="w-full bg-amber-500/20 border border-amber-500/40 rounded-xl p-3.5 mb-6 text-left flex items-start gap-2.5 animate-pulse">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-300 text-xs uppercase tracking-wider block mb-1">Missed Period Warning</span>
                  <p className="text-xs text-white/90 font-sans">
                    Your period appears delayed by <span className="font-bold text-amber-100">{stats.daysDelayedDifference} days</span> based on previous cycle patterns. Consider logging a period when it begins.
                  </p>
                </div>
              </div>
            )}

            {/* Smart Prediction Accuracies Header */}
            <div className="flex justify-between items-center w-full px-2 mb-3">
              <div className="flex items-center gap-1.5 uppercase font-black text-[9px] tracking-wider text-rose-300">
                <Sparkles className="w-3 h-3 text-rose-400" /> Confidence: <span className="text-white bg-rose-500/20 px-2 py-0.5 rounded ml-1 font-black">{smarterMetrics.predictionConfidence}</span>
              </div>
              <div className="text-[9px] text-gray-400 uppercase font-bold">
                Avg Cycle: <span className="text-white font-black">{smarterMetrics.avgCycleLength}d</span> {smarterMetrics.variability > 0 && <span className="text-gray-500">(±{smarterMetrics.variability}d)</span>}
              </div>
            </div>

            <h3 className="heading-title text-white flex items-center justify-center gap-2 mb-8">
              <span className="text-xl font-bold uppercase tracking-widest text-white/50">Day</span>
              <span className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-400 to-purple-400 font-sans mx-2">
                {stats.currentCycleDay}
              </span>
            </h3>

            <div className="w-full relative mb-10 flex justify-center">
               <div className="w-44 h-44 rounded-full border-2 border-white/10 bg-black/40 flex items-center justify-center relative overflow-hidden shadow-[0_0_35px_rgba(244,63,94,0.30)]">
                 <div 
                    className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t ${stats.colorName} transition-all duration-1000 ease-in-out`}
                    style={{ 
                      height: `${Math.min(92, Math.max(25, ((parseInt(String(stats.currentCycleDay), 10) || 1) / (cycleLength || 28)) * 100))}%` 
                    }}
                 >
                    <div className="absolute left-[-50%] top-[-150px] w-[200%] h-[200px] bg-[#12050A]/20 dark:bg-black/25 rounded-[38%] animate-spin-slow pointer-events-none" />
                    <div className="absolute left-[-45%] top-[-155px] w-[190%] h-[195px] bg-[#12050A]/15 dark:bg-black/20 rounded-[43%] animate-spin-very-slow pointer-events-none" />
                    <LiquidBubbles />
                 </div>
               </div>
               <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xs uppercase tracking-widest font-bold text-white/80 drop-shadow-md">Current Phase</span>
                  <span className="text-lg font-serif font-black text-white px-4 text-center mt-2 drop-shadow-lg">{stats.phase}</span>
               </div>
            </div>

            <div className="w-full text-left mt-2 bg-gradient-to-r from-gray-800/50 to-transparent p-4 rounded-xl border-l-4 border-l-gray-500">
              <h4 className="text-xs text-gray-300 font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                <Heart className="w-4 h-4" /> Phase Insights
              </h4>
              <p className="font-sans text-white/90 text-xs leading-relaxed font-medium">
                "{stats.message}"
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full mt-6 mb-4">
               <div className="bg-black/40 p-4 rounded-2xl border border-white/5 text-center">
                  <span className="text-[10px] uppercase font-black tracking-widest text-rose-400/70 block mb-1">Next Period</span>
                  <span className="text-sm font-bold text-white tracking-widest">{stats.nextPeriodStartStr}</span>
                  <span className="text-[9px] text-gray-400 block mt-1">In {stats.daysUntilNextPeriod} Days</span>
               </div>
               <div className="bg-black/40 p-4 rounded-2xl border border-white/5 text-center">
                  <span className="text-[10px] uppercase font-black tracking-widest text-pink-400/70 block mb-1">Ovulation</span>
                  <span className="text-sm font-bold text-white tracking-widest">{stats.ovulationDayStr}</span>
                  <span className="text-[9px] text-pink-300/80 block mt-1">Fertile: {stats.fertilityWindowStr}</span>
               </div>
            </div>
          </div>
        ) : null}

        {/* Visual Calendar */}
        <div className="dark-card text-left pb-6">
          <div className="flex items-center justify-between mb-4">
             <h3 className="heading-title text-purple-300 flex items-center gap-2">
               <Calendar className="w-5 h-5 text-purple-400" /> Cycle Map
             </h3>
             <div className="flex items-center gap-2">
               <button onClick={prevMonth} className="p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"><ChevronLeft className="w-5 h-5 text-gray-400" /></button>
               <span className="font-bold text-sm w-24 text-center text-white/90 font-mono">
                 {calendarMonth.toLocaleDateString([], { month: 'long', year: 'numeric' })}
               </span>
               <button onClick={nextMonth} className="p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"><ChevronRight className="w-5 h-5 text-gray-400" /></button>
             </div>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
             {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
               <div key={i} className="text-center text-[10px] uppercase font-black text-gray-500">{day}</div>
             ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
             {renderCalendarDays()}
          </div>

          {/* Dynamic selected indicator status bar */}
          <div className="mt-5 p-2 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider font-bold text-purple-300">
              📅 Viewing details for: <span className="text-white text-xs block font-mono mt-0.5">{new Date(activeLogDate).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </span>
            {activeLogDate !== getLocalDateString() && (
              <button 
                onClick={() => setActiveLogDate(getLocalDateString())}
                className="text-[10px] uppercase bg-amber-400 text-black font-black px-2.5 py-1.5 rounded-lg active:scale-95 transition-transform cursor-pointer"
              >
                Today ↺
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-3 mt-4 px-2 justify-center">
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_5px_rgba(244,63,94,0.5)]"></div><span className="text-[10px] text-gray-400 font-bold uppercase">Period</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-400"></div><span className="text-[10px] text-gray-400 font-bold uppercase">Follicular</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-pink-500 shadow-[0_0_5px_rgba(236,72,153,0.5)]"></div><span className="text-[10px] text-gray-400 font-bold uppercase">Ovulation</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-purple-400"></div><span className="text-[10px] text-gray-400 font-bold uppercase">Luteal</span></div>
          </div>
        </div>

        {/* Rule-Based dynamic Hormonal Insights component */}
        <CycleInsightsView cycleSymptoms={cycleSymptoms} getDayPhase={getDayPhase} />

        {/* Period History Log */}
        <div className="dark-card text-left pb-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="heading-title text-emerald-300 flex items-center gap-2">
              <History className="w-5 h-5 text-emerald-400" /> Cycle History
            </h3>
            <button 
              onClick={() => setShowResetConfirm(true)}
              className="text-xs bg-rose-500/10 text-rose-400 font-bold px-3 py-1.5 rounded-lg border border-rose-500/20 hover:bg-rose-500/20 transition-colors cursor-pointer"
            >
              Reset All
            </button>
          </div>
          
          {showResetConfirm && (
            <div className="bg-rose-950/40 border border-rose-500/30 rounded-xl p-4 mb-4">
              <p className="text-white/90 text-sm mb-3 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" /> 
                Are you sure? This will delete all cycle history and logged symptoms forever.
              </p>
              <div className="flex gap-2">
                <button onClick={resetCycleData} className="flex-1 bg-rose-600 text-white font-bold py-2 rounded-lg text-sm cursor-pointer">Yes, Reset</button>
                <button onClick={() => setShowResetConfirm(false)} className="flex-1 bg-white/10 text-white font-bold py-2 rounded-lg text-sm cursor-pointer">Cancel</button>
              </div>
            </div>
          )}

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {periodHistory.length === 0 ? (
              <p className="text-sm text-white/40 italic text-center py-4">No cycle history logged yet.</p>
            ) : (
              periodHistory.map((dateStr, idx) => (
                <div key={`${dateStr}-${idx}`} className="flex items-center justify-between bg-black/20 p-3 rounded-lg border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-rose-500" />
                    <span className="text-xs sm:text-sm font-bold text-white/90 block">
                      {new Date(dateStr).toLocaleDateString([], { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium">
                      {new Date(dateStr).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}
                    </span>
                  </div>
                  <button 
                    onClick={() => handleRemoveLog(dateStr)}
                    className="p-1.5 text-white/30 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Import, Export & Backups Tools Dashboard */}
        <div className="dark-card text-left p-5 border border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent">
          <h4 className="text-xs text-white/60 tracking-wider uppercase font-black mb-3">💾 Backup & Export Tools</h4>
          <div className="grid grid-cols-2 gap-3.5 mb-4">
            <button 
              onClick={exportToJSON}
              className="flex items-center justify-center gap-2 p-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl transition-colors cursor-pointer text-xs font-bold text-rose-300"
            >
              <Download className="w-4 h-4 text-rose-400" /> JSON Backup
            </button>
            <button 
              onClick={exportToCSV}
              className="flex items-center justify-center gap-2 p-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl transition-colors cursor-pointer text-xs font-bold text-cyan-300"
            >
              <Activity className="w-4 h-4 text-cyan-400" /> CSV Report
            </button>
          </div>
          <div className="relative">
            <label className="flex items-center justify-center gap-2 p-3 bg-black/30 border border-white/5 hover:bg-white/5 rounded-xl cursor-pointer transition-colors text-xs font-bold text-gray-400">
              <Upload className="w-4 h-4 text-gray-400" />
              Upload Backup file (.json)
              <input 
                type="file" 
                accept=".json" 
                onChange={handleImportJSON} 
                className="hidden" 
              />
            </label>
          </div>
        </div>

        {/* Configuration Setup form */}
        {renderConfigurationCard(false)}

      </div>

      {/* Right Column Stack - Health Log, Symptoms & Analytics */}
      <div className="flex flex-col gap-6">
        
        {/* Active Log Symptoms Checklist for dynamic activeLogDate */}
        <div className="dark-card text-left pb-6 ring-2 ring-amber-400/20">
          <div className="flex items-center justify-between mb-5 border-b border-white/5 pb-3">
            <div>
              <h3 className="heading-title text-rose-300 flex items-center gap-2">
                <Smile className="w-5 h-5 text-amber-500 animate-bounce" /> Daily Health Check
              </h3>
            </div>
            <span className="text-[11px] font-bold text-amber-300 uppercase tracking-widest font-mono">
              📝 logs for {new Date(activeLogDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
            </span>
          </div>
          
          <div className="mb-6">
            <h4 className="text-xs text-white/50 uppercase tracking-widest font-bold mb-3">🩸 Flow Details</h4>
            <div className="grid grid-cols-4 gap-2">
              {['Light', 'Medium', 'Heavy', 'Spotting'].map(f => (
                 <button 
                   key={f}
                   onClick={() => updateLogAttr('f', f)}
                   className={`py-2 px-1 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${activeDailyLog.f === f ? 'bg-rose-500 text-white border-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.3)]' : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'}`}
                 >
                   {f}
                 </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-xs text-white/50 uppercase tracking-widest font-bold mb-3">😊 Mood</h4>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'happy', icon: '😊', label: 'Happy' },
                { id: 'calm', icon: '😌', label: 'Calm' },
                { id: 'tired', icon: '😴', label: 'Tired' },
                { id: 'emotional', icon: '😭', label: 'Emotional' },
                { id: 'irritated', icon: '😠', label: 'Irritated' },
                { id: 'anxious', icon: '😰', label: 'Anxious' },
                { id: 'romantic', icon: '💕', label: 'Romantic' }
              ].map(m => (
                 <button 
                   key={m.id}
                   onClick={() => toggleArrayItem('m', m.id)}
                   className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer ${activeDailyLog.m?.includes(m.id) ? 'bg-amber-500/20 text-amber-300 border-amber-500/50' : 'bg-white/5 text-white/60 border-transparent hover:bg-white/10'}`}
                 >
                   <span>{m.icon}</span> {m.label}
                 </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-xs text-white/50 uppercase tracking-widest font-bold mb-3">🤕 Symptoms</h4>
            <div className="flex flex-wrap gap-2">
              {[
                'Cramps', 'Back Pain', 'Headache', 'Bloating', 'Acne', 
                'Breast Tenderness', 'Fatigue', 'Food Cravings', 'Nausea', 'Insomnia'
              ].map(s => (
                 <button 
                   key={s}
                   onClick={() => toggleArrayItem('s', s)}
                   className={`px-3 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer ${activeDailyLog.s?.includes(s) ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50' : 'bg-white/5 text-white/60 border-transparent hover:bg-white/10'}`}
                 >
                   {s}
                 </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-xs text-white/50 uppercase tracking-widest font-bold mb-3">⚡ Energy Level</h4>
            <div className="flex justify-between items-center gap-2 bg-white/5 p-3 rounded-2xl border border-white/10">
              {[1, 2, 3, 4, 5].map(e => (
                 <button 
                   key={e}
                   onClick={() => updateLogAttr('e', e)}
                   className={`aspect-square w-10 flex items-center justify-center rounded-xl text-lg font-black transition-all cursor-pointer ${activeDailyLog.e === e ? 'bg-yellow-500 text-white shadow-[0_0_15px_rgba(234,179,8,0.4)] scale-110' : 'bg-black/30 text-white/40 hover:bg-white/10'}`}
                 >
                   {e}
                 </button>
              ))}
            </div>
            <div className="flex justify-between text-[10px] uppercase font-bold text-white/30 px-2 mt-2">
              <span>Exhausted</span>
              <span>Amazing</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs text-white/50 uppercase tracking-widest font-bold mb-3">💧 Water</h4>
              <div className="flex flex-wrap gap-1">
                 {[1,2,3,4,5,6,7,8].map(w => (
                   <button 
                     type="button"
                     key={w}
                     onClick={() => updateLogAttr('w', w)}
                     className={`w-6 h-8 rounded-md transition-all cursor-pointer ${(activeDailyLog.w || 0) >= w ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'bg-white/10'}`}
                   />
                 ))}
              </div>
              <p className="text-[10px] text-blue-300 font-bold mt-2 uppercase font-mono">{activeDailyLog.w || 0} / 8 Glasses</p>
            </div>
            <div>
              <h4 className="text-xs text-white/50 uppercase tracking-widest font-bold mb-3">😴 Sleep</h4>
              <div className="flex flex-wrap gap-1.5">
                 {['4h', '5h', '6h', '7h', '8h+'].map(sl => (
                   <button 
                     key={sl}
                     onClick={() => updateLogAttr('sl', sl)}
                     className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeDailyLog.sl === sl ? 'bg-indigo-500 text-white shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-white/10 text-white/50'}`}
                   >
                     {sl}
                   </button>
                 ))}
              </div>
            </div>
          </div>
        </div>

        {/* Symptom Analytics View sub-component */}
        <CycleAnalytics cycleSymptoms={cycleSymptoms} />

      </div>
    </div>
  );
}
