import React, { useMemo, useState } from 'react';
import { DailyLog } from './CycleSection';
import { Activity, Droplets, Smile, Clock, Zap, Sparkles, TrendingUp, Calendar, Info } from 'lucide-react';

interface CycleAnalyticsProps {
  cycleSymptoms: Record<string, DailyLog>;
}

export default function CycleAnalytics({ cycleSymptoms }: CycleAnalyticsProps) {
  const [hoveredDay, setHoveredDay] = useState<{ date: string; details: string } | null>(null);
  const [trendMetric, setTrendMetric] = useState<'symptoms' | 'wellness'>('symptoms');

  // Load baseline statistics dynamically from localStorage
  const baselineStats = useMemo(() => {
    const lastDateStr = localStorage.getItem('smilance_last_period') || '';
    const length = parseInt(localStorage.getItem('smilance_cycle_length') || '28', 10);
    const duration = parseInt(localStorage.getItem('smilance_period_duration') || '5', 10);
    let history: string[] = [];
    try {
      history = JSON.parse(localStorage.getItem('smilance_period_history') || '[]');
    } catch {
      history = [];
    }
    return { lastPeriodDate: lastDateStr, cycleLength: length, periodDuration: duration, periodHistory: history };
  }, [cycleSymptoms]);

  const { lastPeriodDate, cycleLength, periodDuration } = baselineStats;

  // 1. Core aggregates
  const analyticsData = useMemo(() => {
    const rawLogs = Object.values(cycleSymptoms);
    if (rawLogs.length === 0) return null;

    const symptomCounts: Record<string, number> = {};
    const moodCounts: Record<string, number> = {};
    let totalEnergy = 0;
    let energyLoggedCount = 0;
    let totalWater = 0;
    let waterLoggedCount = 0;
    let totalSleep = 0;
    let sleepLoggedCount = 0;

    rawLogs.forEach(log => {
      if (log.s && Array.isArray(log.s)) {
        log.s.forEach(sym => {
          symptomCounts[sym] = (symptomCounts[sym] || 0) + 1;
        });
      }
      if (log.m && Array.isArray(log.m)) {
        log.m.forEach(mood => {
          moodCounts[mood] = (moodCounts[mood] || 0) + 1;
        });
      }
      if (typeof log.e === 'number' && log.e > 0) {
        totalEnergy += log.e;
        energyLoggedCount++;
      }
      if (typeof log.w === 'number' && log.w > 0) {
        totalWater += log.w;
        waterLoggedCount++;
      }
      if (log.sl) {
        const hours = parseInt(log.sl.replace('h', ''), 10);
        if (!isNaN(hours)) {
          totalSleep += hours;
          sleepLoggedCount++;
        }
      }
    });

    const topSymptoms = Object.entries(symptomCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const topMoods = Object.entries(moodCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const avgEnergy = energyLoggedCount > 0 ? (totalEnergy / energyLoggedCount).toFixed(1) : '—';
    const avgWater = waterLoggedCount > 0 ? (totalWater / waterLoggedCount).toFixed(1) : '—';
    const avgSleep = sleepLoggedCount > 0 ? (totalSleep / sleepLoggedCount).toFixed(1) : '—';

    return {
      topSymptoms,
      topMoods,
      avgEnergy,
      avgWater,
      avgSleep,
      totalEntries: rawLogs.length
    };
  }, [cycleSymptoms]);

  // 2. Generate Continuous 4-Month Grid (For Heatmap Layout)
  const heatmapMonths = useMemo(() => {
    const list = [];
    const today = new Date();
    // Generate current month, previous month, and next two months for a rich window
    const baseMonthIndices = [-1, 0, 1, 2];

    for (const offset of baseMonthIndices) {
      const d = new Date(today.getFullYear(), today.getMonth() + offset, 1);
      const year = d.getFullYear();
      const month = d.getMonth();
      const monthName = d.toLocaleDateString([], { month: 'long', year: 'numeric' });
      const daysCount = new Date(year, month + 1, 0).getDate();

      const daysArr = [];
      for (let dayNum = 1; dayNum <= daysCount; dayNum++) {
        const cellDate = new Date(year, month, dayNum);
        cellDate.setHours(0, 0, 0, 0);
        const isoString = cellDate.toISOString().split('T')[0];

        // Fetch logged data
        const log = cycleSymptoms[isoString];
        const isLoggedPeriod = log && (log.f === 'Light' || log.f === 'Medium' || log.f === 'Heavy');
        const hasLogData = log && ((log.s && log.s.length > 0) || (log.m && log.m.length > 0) || log.e > 0 || log.w > 0);

        // Compute cycle predictions (Mathematical model referencing baseline stats)
        let status: 'normal' | 'actual-period' | 'predicted-period' | 'fertile' | 'ovulation' | 'has-log' = 'normal';
        let detailText = `Day ${dayNum}: No logs recorded`;

        if (log) {
          const symptomStr = log.s && log.s.length > 0 ? `Symptoms: ${log.s.join(', ')}` : '';
          const moodStr = log.m && log.m.length > 0 ? `Mood: ${log.m.join(', ')}` : '';
          const sleepStr = log.sl ? `Sleep: ${log.sl}` : '';
          const waterStr = log.w ? `Water: ${log.w} glasses` : '';
          const energyStr = log.e ? `Energy: ${log.e}/5` : '';
          
          const parts = [
            log.f ? `Flow: ${log.f}` : '',
            symptomStr,
            moodStr,
            energyStr,
            waterStr,
            sleepStr
          ].filter(Boolean);

          detailText = `Day ${dayNum}: ${parts.join(' | ')}`;
        }

        if (isLoggedPeriod) {
          status = 'actual-period';
        } else if (lastPeriodDate) {
          const baselineDate = new Date(lastPeriodDate);
          baselineDate.setHours(0, 0, 0, 0);
          const diffTime = cellDate.getTime() - baselineDate.getTime();
          let diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

          // Ensure cycle day is normal range
          let cycleDay = ((diffDays % cycleLength) + cycleLength) % cycleLength + 1;

          if (cycleDay <= periodDuration) {
            status = 'predicted-period';
            if (!log) detailText = `Day ${dayNum}: Projected Period start`;
          } else if (cycleDay === cycleLength - 14) {
            status = 'ovulation';
            if (!log) detailText = `Day ${dayNum}: Peak Ovulation Day`;
          } else if (cycleDay >= cycleLength - 17 && cycleDay <= cycleLength - 13) {
            status = 'fertile';
            if (!log) detailText = `Day ${dayNum}: Highly Fertile Window`;
          } else if (hasLogData) {
            status = 'has-log';
          }
        } else if (hasLogData) {
          status = 'has-log';
        }

        daysArr.push({
          dayNum,
          dateStr: isoString,
          status,
          detailText,
          hasLogData: !!hasLogData
        });
      }

      list.push({
        monthName,
        year,
        month,
        days: daysArr
      });
    }

    return list;
  }, [cycleSymptoms, lastPeriodDate, cycleLength, periodDuration]);

  // 3. Multi-Month comparative metrics (Historical trends of symptoms)
  const monthlyMetrics = useMemo(() => {
    const monthsData: Record<string, { symptoms: Record<string, number>; totalLogs: number; waterSum: number; waterCount: number; sleepSum: number; sleepCount: number }> = {};
    const today = new Date();

    // Map last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const label = d.toLocaleDateString([], { month: 'short' });
      monthsData[label] = { symptoms: {}, totalLogs: 0, waterSum: 0, waterCount: 0, sleepSum: 0, sleepCount: 0 };
    }

    Object.entries(cycleSymptoms).forEach(([dateStr, log]) => {
      const logDate = new Date(dateStr);
      const label = logDate.toLocaleDateString([], { month: 'short' });
      
      if (monthsData[label]) {
        monthsData[label].totalLogs++;
        if (log.s && Array.isArray(log.s)) {
          log.s.forEach(sym => {
            monthsData[label].symptoms[sym] = (monthsData[label].symptoms[sym] || 0) + 1;
          });
        }
        if (typeof log.w === 'number' && log.w > 0) {
          monthsData[label].waterSum += log.w;
          monthsData[label].waterCount++;
        }
        if (log.sl) {
          const hours = parseInt(log.sl.replace('h', ''), 10);
          if (!isNaN(hours)) {
            monthsData[label].sleepSum += hours;
            monthsData[label].sleepCount++;
          }
        }
      }
    });

    return Object.entries(monthsData).map(([month, data]) => {
      const topSym = Object.entries(data.symptoms)
        .sort((a, b) => b[1] - a[1])[0]; // Most common symptom in that month
      
      return {
        month,
        crampsCount: data.symptoms['Cramps'] || 0,
        fatigueCount: data.symptoms['Fatigue'] || 0,
        headacheCount: data.symptoms['Headache'] || 0,
        topSymptomName: topSym ? topSym[0] : 'None',
        topSymptomCount: topSym ? topSym[1] : 0,
        avgWater: data.waterCount > 0 ? (data.waterSum / data.waterCount) : 0,
        avgSleep: data.sleepCount > 0 ? (data.sleepSum / data.sleepCount) : 0
      };
    });
  }, [cycleSymptoms]);

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      
      {/* 📊 Section 1: Period Trend Heatmap Charts */}
      <div className="dark-card text-left p-5 relative overflow-visible border border-rose-500/10">
        <div className="absolute -right-8 -top-8 w-24 h-24 bg-rose-500/5 rounded-full blur-xl pointer-events-none"></div>
        
        <div className="flex items-start justify-between mb-4 border-b border-white/5 pb-3">
          <div>
            <h3 className="heading-title text-rose-300 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-rose-400 animate-pulse" /> Period Trend Heatmap
            </h3>
            <p className="text-[11px] text-gray-400 mt-1">Continuous 4-Month forecast and logged history mapping.</p>
          </div>
          <span className="text-[9px] font-black uppercase text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-rose-400 animate-spin-slow" /> Machine Forecasts
          </span>
        </div>

        {/* Heatmap Legend */}
        <div className="flex flex-wrap gap-x-4 gap-y-2 mb-5 bg-black/30 p-2.5 rounded-xl border border-white/5 justify-start text-[10px] font-bold text-gray-400">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-rose-600 block shadow-[0_0_8px_rgba(225,29,72,0.8)]"></span>
            <span className="uppercase">Actual Period</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-rose-500/30 border border-rose-500/70 border-dashed block"></span>
            <span className="uppercase">Predicted Period</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-pink-500/50 block shadow-[0_0_8px_rgba(244,114,182,0.8)]"></span>
            <span className="uppercase">Fertile Window</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-pink-600/95 block text-center text-[8px] leading-3 text-white font-black shadow-[0_0_8px_rgba(236,72,153,1)]">★</span>
            <span className="uppercase">Ovulation</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-400/20 border border-amber-400/30 block"></span>
            <span className="uppercase">Symptom Logged</span>
          </div>
        </div>

        {/* 4-Month Horizontal Strips */}
        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
          {heatmapMonths.map((m, mIdx) => (
            <div key={mIdx} className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
              <span className="text-xs font-black text-rose-300/80 mb-2.5 block uppercase tracking-wider font-mono">
                {m.monthName}
              </span>

              {/* Grid cell layout of days */}
              <div className="grid grid-cols-7 sm:grid-cols-10 md:grid-cols-16 gap-1.5">
                {m.days.map((d, dIdx) => {
                  let cellClass = "bg-white/5 text-white/50 border-transparent";
                  let cellContent = String(d.dayNum);

                  if (d.status === 'actual-period') {
                    cellClass = "bg-rose-600 text-white font-black shadow-[0_0_10px_rgba(225,29,72,0.6)]";
                  } else if (d.status === 'predicted-period') {
                    cellClass = "bg-rose-500/20 text-rose-300 border-rose-500/50 border-dashed";
                  } else if (d.status === 'fertile') {
                    cellClass = "bg-pink-500/30 text-pink-200 border-pink-500/30 font-bold";
                  } else if (d.status === 'ovulation') {
                    cellClass = "bg-pink-600 text-white font-black shadow-[0_0_10px_rgba(236,72,153,0.8)]";
                    cellContent = "★";
                  } else if (d.status === 'has-log') {
                    cellClass = "bg-amber-400/10 text-amber-300 border-amber-400/30 shadow-[inset_0_0_4px_rgba(251,191,36,0.2)]";
                  }

                  const isHovered = hoveredDay && hoveredDay.date === d.dateStr;

                  return (
                    <button
                      key={dIdx}
                      className={`aspect-square sm:w-8 sm:h-8 flex items-center justify-center rounded-lg text-xs border transition-all cursor-pointer relative select-none hover:scale-110 active:scale-95 ${cellClass} ${isHovered ? 'ring-1 ring-white/50 z-10' : ''}`}
                      onMouseEnter={() => setHoveredDay({ date: d.dateStr, details: d.detailText })}
                      onMouseLeave={() => setHoveredDay(null)}
                      onClick={() => setHoveredDay({ date: d.dateStr, details: d.detailText })}
                    >
                      <span>{cellContent}</span>
                      {d.hasLogData && d.status !== 'actual-period' && d.status !== 'ovulation' && (
                        <span className="absolute bottom-0.5 right-0.5 w-1 h-1 bg-amber-400 rounded-full"></span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Persistent Dynamic Tooltip HUD */}
        <div className="mt-4 p-3 bg-black/40 border border-white/5 rounded-2xl flex items-center gap-2.5">
          <Info className="w-4 h-4 text-rose-400 shrink-0" />
          <div className="text-[11px] leading-tight text-white/80 font-medium">
            {hoveredDay ? (
              <div>
                <span className="font-mono text-rose-300 uppercase block font-black mb-0.5">
                  {new Date(hoveredDay.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <span className="text-gray-300">{hoveredDay.details}</span>
              </div>
            ) : (
              <span className="text-gray-500 italic">Hover/tap a heatmap date cell above to view full logged symptoms & forecast details.</span>
            )}
          </div>
        </div>
      </div>

      {/* 📈 Section 2: Trend Scatter-plots & Historical Trend Graphs */}
      <div className="dark-card text-left p-5 border border-white/5">
        <div className="flex items-center justify-between mb-5 border-b border-white/5 pb-3">
          <div>
            <h3 className="heading-title text-rose-300 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-rose-400" /> Continuous Trends & Graphs
            </h3>
            <p className="text-[10px] text-gray-400 mt-1">Multi-month comparative analytics of logged metrics.</p>
          </div>
          
          <div className="flex bg-black/40 border border-white/10 rounded-xl p-0.5">
            <button
              onClick={() => setTrendMetric('symptoms')}
              className={`px-3 py-1.5 rounded-lg text-[9px] uppercase font-black tracking-widest transition-all ${trendMetric === 'symptoms' ? 'bg-rose-500 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
            >
              Symptoms
            </button>
            <button
              onClick={() => setTrendMetric('wellness')}
              className={`px-3 py-1.5 rounded-lg text-[9px] uppercase font-black tracking-widest transition-all ${trendMetric === 'wellness' ? 'bg-rose-500 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
            >
              Wellness
            </button>
          </div>
        </div>

        {trendMetric === 'symptoms' ? (
          <div>
            <h4 className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-4">
              🎯 Continuous 6-Month Symptom Scatter Intensity
            </h4>

            {/* Simulated Horizontal Scatter-Plot Matrix */}
            <div className="space-y-4 mb-4">
              {['Cramps', 'Fatigue', 'Headache'].map((symptom) => (
                <div key={symptom} className="flex items-center gap-3 bg-black/20 p-3 rounded-xl border border-white/5">
                  <div className="w-18 shrink-0">
                    <span className="text-xs font-bold text-white/90">{symptom}</span>
                  </div>
                  <div className="flex-1 flex justify-between items-center text-center relative px-2 py-1 bg-black/40 rounded-lg">
                    {/* Horizontal grid lines */}
                    <div className="absolute inset-x-0 h-px bg-white/5 top-1/2 -translate-y-1/2"></div>
                    
                    {monthlyMetrics.map((dm, idx) => {
                      const count = symptom === 'Cramps' ? dm.crampsCount : symptom === 'Fatigue' ? dm.fatigueCount : dm.headacheCount;
                      const hasCount = count > 0;
                      
                      // Translate count to dynamic size / color gradient bubble resembling scatter plots
                      let bubbleSize = 'w-1 h-1 bg-white/10';
                      if (count > 0 && count < 2) bubbleSize = 'w-3.5 h-3.5 bg-cyan-500/40 border border-cyan-400/50 shadow-sm';
                      else if (count >= 2 && count < 4) bubbleSize = 'w-5 h-5 bg-cyan-500/75 border border-cyan-400 text-[10px] text-black font-bold';
                      else if (count >= 4) bubbleSize = 'w-7 h-7 bg-rose-500 text-white font-black text-xs shadow-[0_0_10px_rgba(244,63,94,0.5)]';

                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center justify-center h-10 relative z-10 select-none">
                          <div className={`rounded-full flex items-center justify-center transition-all ${bubbleSize}`}>
                            {count > 0 ? count : ''}
                          </div>
                          <span className="text-[8px] font-bold text-gray-500 uppercase mt-1 block">{dm.month}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[9px] text-gray-500 italic mt-2 text-center uppercase tracking-wide">
              * Bubbles represent count of logs per month. Higher size indicate higher density occurrences.
            </p>
          </div>
        ) : (
          <div>
            <h4 className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-4">
              📈 Continuous 6-Month Water & Sleep Averages
            </h4>

            {/* Side-by-side comparison bars */}
            <div className="space-y-4">
              {monthlyMetrics.map((dm, idx) => {
                const sleepPercent = Math.min(100, Math.round((dm.avgSleep / 8) * 100));
                const waterPercent = Math.min(100, Math.round((dm.avgWater / 8) * 100));

                return (
                  <div key={idx} className="bg-black/20 p-3 rounded-xl border border-white/5 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-white/90 uppercase font-mono">{dm.month} Overview</span>
                      <div className="flex gap-3 text-[10px] font-bold">
                        <span className="text-indigo-400">⚡ {dm.avgSleep > 0 ? `${dm.avgSleep.toFixed(1)}h` : '0h'} Sleep</span>
                        <span className="text-blue-400">💧 {dm.avgWater > 0 ? `${dm.avgWater.toFixed(1)}g` : '0g'} Water</span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      {/* Sleep progress bar */}
                      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden flex">
                        <div 
                          className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${sleepPercent || 1}%` }}
                        />
                      </div>
                      {/* Water progress bar */}
                      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden flex">
                        <div 
                          className="bg-blue-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${waterPercent || 1}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 📊 Section 3: Standard counts (Legacy fallback view) */}
      {analyticsData && (
        <div className="dark-card text-left p-5 border border-white/5 flex flex-col gap-5">
          <h4 className="text-[10px] text-gray-500 uppercase font-black tracking-widest border-b border-white/5 pb-2">
            📊 Overall Symptom & Mood Distribution
          </h4>

          {/* Average Averages Row */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-black/40 p-2.5 rounded-xl border border-white/5 text-center">
              <Zap className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
              <span className="text-[9px] text-gray-500 block uppercase font-bold">Energy</span>
              <span className="text-sm font-bold text-white mt-0.5 block">{analyticsData.avgEnergy}/5</span>
            </div>
            <div className="bg-black/40 p-2.5 rounded-xl border border-white/5 text-center">
              <Droplets className="w-4 h-4 text-blue-400 mx-auto mb-1" />
              <span className="text-[9px] text-gray-500 block uppercase font-bold">Water</span>
              <span className="text-sm font-bold text-white mt-0.5 block">{analyticsData.avgWater} gls</span>
            </div>
            <div className="bg-black/40 p-2.5 rounded-xl border border-white/5 text-center">
              <Clock className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
              <span className="text-[9px] text-gray-500 block uppercase font-bold">Sleep</span>
              <span className="text-sm font-bold text-white mt-0.5 block">{analyticsData.avgSleep} hrs</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-1">
            {/* Symptoms */}
            <div>
              <h5 className="text-[10px] text-white/50 uppercase tracking-widest font-black mb-2 flex items-center gap-1">
                🤕 Core Symptoms
              </h5>
              {analyticsData.topSymptoms.length === 0 ? (
                <p className="text-xs text-white/30 italic py-1">No symptoms logged.</p>
              ) : (
                <div className="space-y-2">
                  {analyticsData.topSymptoms.map((sym, idx) => {
                    const percentage = Math.round((sym.count / analyticsData.totalEntries) * 100);
                    return (
                      <div key={idx} className="space-y-0.5">
                        <div className="flex justify-between text-[11px] font-bold text-white/90">
                          <span>{sym.name}</span>
                          <span className="text-cyan-400 font-black">{percentage}% ({sym.count}x)</span>
                        </div>
                        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${percentage}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Moods */}
            <div>
              <h5 className="text-[10px] text-white/50 uppercase tracking-widest font-black mb-2 flex items-center gap-1">
                😊 Logged Moods
              </h5>
              {analyticsData.topMoods.length === 0 ? (
                <p className="text-xs text-white/30 italic py-1">No moods logged.</p>
              ) : (
                <div className="space-y-2">
                  {analyticsData.topMoods.map((mood, idx) => {
                    const percentage = Math.round((mood.count / analyticsData.totalEntries) * 100);
                    return (
                      <div key={idx} className="space-y-0.5">
                        <div className="flex justify-between text-[11px] font-bold text-white/90">
                          <span className="capitalize">{mood.name}</span>
                          <span className="text-amber-400 font-black">{percentage}% ({mood.count}x)</span>
                        </div>
                        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-amber-400 h-full rounded-full" style={{ width: `${percentage}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          
          <p className="text-[9px] text-gray-500 text-center uppercase tracking-widest font-bold">
            Aggregated across {analyticsData.totalEntries} days with logged history
          </p>
        </div>
      )}
    </div>
  );
}
