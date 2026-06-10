import React, { useMemo } from 'react';
import { DailyLog } from './CycleSection';
import { Sparkles, Compass, CheckCircle } from 'lucide-react';

interface CycleInsightsViewProps {
  cycleSymptoms: Record<string, DailyLog>;
  getDayPhase: (d: Date) => string | null;
}

export default function CycleInsightsView({ cycleSymptoms, getDayPhase }: CycleInsightsViewProps) {
  const insights = useMemo(() => {
    const rawLogs = Object.entries(cycleSymptoms);
    if (rawLogs.length < 3) return [];

    const phaseLogs: Record<string, DailyLog[]> = {
      menstrual: [],
      follicular: [],
      ovulatory: [],
      luteal: []
    };

    rawLogs.forEach(([dateStr, log]) => {
      const phase = getDayPhase(new Date(dateStr));
      if (phase && phaseLogs[phase] !== undefined) {
        phaseLogs[phase].push(log);
      }
    });

    const list: string[] = [];

    // Rule 1: Fatigue during Luteal Phase
    const lutealTiredCount = phaseLogs.luteal.filter(l => l.s?.includes('Fatigue') || l.m?.includes('tired')).length;
    const lutealTotal = phaseLogs.luteal.length;
    if (lutealTotal >= 2 && (lutealTiredCount / lutealTotal) >= 0.5) {
      list.push("✨ You frequently log Fatigue or feeling Tired during your Luteal phase. Prioritizing rest during this time can help you adjust your energy baseline.");
    }

    // Rule 2: Mood stability or improvement during follicular
    const follicularHappyCount = phaseLogs.follicular.filter(l => l.m?.includes('happy') || l.m?.includes('calm')).length;
    const follicularTotal = phaseLogs.follicular.length;
    if (follicularTotal >= 2 && (follicularHappyCount / follicularTotal) >= 0.6) {
      list.push("✨ Your mood trends highly positive (Happy or Calm) during the Follicular phase. Tap into this high-vibe creative momentum!");
    }

    // Rule 3: Headaches or cramps near menstruation/ovulation
    const menstrualCrampsCount = phaseLogs.menstrual.filter(l => l.s?.includes('Cramps')).length;
    const menstrualTotal = phaseLogs.menstrual.length;
    if (menstrualTotal >= 2 && (menstrualCrampsCount / menstrualTotal) >= 0.6) {
      list.push("✨ Cramps are highly correlated with your Menstrual days. Consider gentle pelvic stretches, heating support, and warm herbal teas.");
    }

    // Rule 4: Water intake trends
    let totalWaterAcross = 0;
    let waterCounts = 0;
    rawLogs.forEach(([_, log]) => {
      if (typeof log.w === 'number' && log.w > 0) {
        totalWaterAcross += log.w;
        waterCounts++;
      }
    });
    const avgWater = waterCounts > 0 ? totalWaterAcross / waterCounts : 0;
    if (avgWater > 0 && avgWater < 4) {
      list.push("✨ Your average daily water intake is under 4 glasses. Increasing hydration, particularly during your Menstrual and Luteal phases, can heavily ease bloating and fatigue.");
    } else if (avgWater >= 6) {
      list.push("✨ Amazing hydration habits! Maintaining 6+ daily glasses of water is significantly buffering symptoms like cramps and headaches.");
    }

    // Rule 5: Sleep hours effect
    const perfectSleepCount = rawLogs.filter(([_, l]) => l.sl === '8h+').length;
    if (perfectSleepCount >= 3) {
      list.push("✨ Regularly getting 8+ hours of sleep has a visible stabilizing effect on your reports of irritability and afternoon energy crashes.");
    }

    // Baseline if rules don't match or the list is too short
    if (list.length < 2) {
      list.push("✨ Your energy levels follow your natural baseline cycle. Try daily symptom tracking to unlock high-accuracy hormonal insights.");
      list.push("✨ Keep cycle baseline configurations accurate for the best predictive self-care advices.");
    }

    return list.slice(0, 3);
  }, [cycleSymptoms, getDayPhase]);

  return (
    <div className="dark-card text-left p-6 relative overflow-hidden border-l-4 border-l-rose-400">
      <div className="absolute -right-8 -top-8 w-24 h-24 bg-pink-500/5 rounded-full blur-xl pointer-events-none"></div>
      
      <h3 className="heading-title text-rose-300 flex items-center gap-2 mb-4 relative z-10">
        <Sparkles className="w-5 h-5 text-rose-400 animate-spin-slow" /> Hormonal & Cycle Insights
      </h3>
      
      <div className="space-y-3.5 relative z-10">
        {insights.map((insight, index) => (
          <div key={index} className="flex gap-2.5 items-start bg-pink-500/[0.02] border border-pink-500/5 p-3.5 rounded-xl">
            <Compass className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <p className="text-xs text-white/90 leading-relaxed font-sans font-medium">
              {insight}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
