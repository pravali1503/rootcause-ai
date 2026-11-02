import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  HelpCircle,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { DimensionAnalysis, InvestigationSummary } from '../types';
import { formatMetricNumber } from '../utils/contributionEngine';
import { useTheme } from '../context/ThemeContext';

interface SummaryCardsProps {
  summary: InvestigationSummary;
  activeAnalysis: DimensionAnalysis;
  onOpenMathModal: () => void;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  summary,
  activeAnalysis,
  onOpenMathModal,
}) => {
  const { isDark } = useTheme();
  const [showOver100Explainer, setShowOver100Explainer] = useState(false);

  const isDrop = summary.totalChange < 0;
  const isGrowth = summary.totalChange > 0;

  // Generate a clear, plain-English summary sentence
  const plainEnglishStory = React.useMemo(() => {
    const metric = summary.metricName;
    const changeWord = isDrop ? 'fell' : isGrowth ? 'grew' : 'remained flat';
    const amountStr = formatMetricNumber(Math.abs(summary.totalChange), summary.metricUnit);
    const pctStr = summary.totalPctChange !== null ? `${Math.abs(summary.totalPctChange).toFixed(1)}%` : '';

    const topDrag = activeAnalysis?.topDetractor;
    const topHelp = activeAnalysis?.topMitigator;

    let story = `Between ${summary.basePeriod} and ${summary.compPeriod}, total ${metric} ${changeWord} by ${isDrop ? '-' : '+'}${amountStr} (${isDrop ? '-' : '+'}${pctStr}). `;

    if (topDrag) {
      const dragAmount = formatMetricNumber(Math.abs(topDrag.absChange), summary.metricUnit);
      const absContrib = Math.abs(topDrag.contributionPct);
      if (absContrib > 100.5) {
        story += `The largest movement came from "${topDrag.segmentName}", which changed by ${isDrop ? '-' : '+'}${dragAmount} (${(absContrib / 100).toFixed(1)}x of the net change, because other segments moved in the opposite direction). `;
      } else {
        story += `The biggest driver was "${topDrag.segmentName}", which accounted for ${absContrib.toFixed(0)}% of this change (${isDrop ? '-' : '+'}${dragAmount}). `;
      }
    }

    if (topHelp && Math.abs(topHelp.absChange) > 0) {
      const helpAmount = formatMetricNumber(Math.abs(topHelp.absChange), summary.metricUnit);
      if (isDrop) {
        story += `Meanwhile, "${topHelp.segmentName}" grew by +${helpAmount}, helping cushion the decline.`;
      } else {
        story += `Meanwhile, "${topHelp.segmentName}" declined by -${helpAmount}, dragging on overall growth.`;
      }
    }

    return story;
  }, [summary, activeAnalysis, isDrop, isGrowth]);

  const hasHighPercent =
    activeAnalysis?.hasOffsettingSwings ||
    (activeAnalysis?.topDetractor && Math.abs(activeAnalysis.topDetractor.contributionPct) > 100);

  return (
    <div className="space-y-4 mb-6">
      {/* Plain English Story Banner */}
      <div
        className={`p-4.5 rounded-xl border transition-colors flex items-start gap-3 shadow-xs ${
          isDark
            ? 'bg-slate-900/90 border-slate-800'
            : 'bg-white border-slate-200'
        }`}
      >
        <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500 mt-0.5 flex-shrink-0">
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                isDark ? 'text-indigo-400' : 'text-indigo-600'
              }`}
            >
              Plain-English Summary
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              Dimension: {activeAnalysis?.dimension}
            </span>
          </div>
          <p
            className={`text-sm font-medium leading-relaxed ${
              isDark ? 'text-slate-100' : 'text-slate-800'
            }`}
          >
            {plainEnglishStory}
          </p>

          {/* Quick link to explain high percentages if present */}
          {hasHighPercent && (
            <button
              onClick={() => setShowOver100Explainer(!showOver100Explainer)}
              className="inline-flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-semibold hover:underline mt-1 pt-1"
            >
              <Info className="w-3.5 h-3.5" />
              <span>
                Why are some segments showing over 100% (e.g. 1060%)?
              </span>
              {showOver100Explainer ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Explainer Accordion Box for >100% / 1060% */}
      {hasHighPercent && showOver100Explainer && (
        <div
          className={`p-4 rounded-xl border transition-all text-xs leading-relaxed space-y-2.5 ${
            isDark
              ? 'bg-amber-950/20 border-amber-800/40 text-amber-200'
              : 'bg-amber-50/80 border-amber-200 text-amber-900'
          }`}
        >
          <div className="flex items-center gap-2 font-bold text-sm text-amber-700 dark:text-amber-300">
            <Info className="w-4 h-4 text-amber-500" />
            What does 1060% (or any number over 100%) mean?
          </div>
          <p>
            When some parts of your business <strong>grow</strong> while other parts <strong>shrink</strong>, they cancel each other out.
          </p>
          <div
            className={`p-3 rounded-lg border font-mono text-[11px] space-y-1.5 ${
              isDark
                ? 'bg-slate-950/80 border-slate-800 text-slate-200'
                : 'bg-white border-amber-200 text-slate-800'
            }`}
          >
            <div><strong>Example Walkthrough:</strong></div>
            <div>• Suppose your total revenue only dropped by <strong className="text-rose-500">-$10,000</strong> net.</div>
            <div>• But Segment A plummeted by <strong className="text-rose-500">-$106,000</strong>.</div>
            <div>• At the same time, Segment B surged by <strong className="text-emerald-500">+$96,000</strong>.</div>
            <div className="pt-1 border-t border-slate-700/40 dark:border-slate-800">
              Share of net drop = (-$106,000 / -$10,000) = <strong className="text-amber-500">10.6x = 1,060%</strong>.
            </div>
            <div>
              Segment B offset it by (+$96,000 / -$10,000) = <strong className="text-emerald-500">-960%</strong>.
            </div>
            <div className="font-bold text-indigo-500 pt-0.5">
              Net: 1,060% + (-960%) = 100.0% exactly.
            </div>
          </div>
          <p className="text-[11px]">
            In short: A 1,060% change simply means that this segment had a huge swing (10.6 times larger than the final net total), but other areas of your business grew to absorb most of the blow!
          </p>
        </div>
      )}

      {/* 4 Clean Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Starting Total */}
        <div
          className={`rounded-xl p-4 border transition-colors shadow-xs relative overflow-hidden ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500" />
          <div className="flex items-center justify-between text-xs mb-1">
            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
              Starting Total (T0)
            </span>
            <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 font-semibold text-[11px]">
              {summary.basePeriod}
            </span>
          </div>
          <div
            className={`text-2xl font-bold font-mono mt-1 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            {formatMetricNumber(summary.totalBase, summary.metricUnit)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Starting baseline</p>
        </div>

        {/* Card 2: Ending Total */}
        <div
          className={`rounded-xl p-4 border transition-colors shadow-xs relative overflow-hidden ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
          <div className="flex items-center justify-between text-xs mb-1">
            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
              Ending Total (T1)
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-semibold text-[11px]">
              {summary.compPeriod}
            </span>
          </div>
          <div
            className={`text-2xl font-bold font-mono mt-1 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            {formatMetricNumber(summary.totalComp, summary.metricUnit)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">End period total</p>
        </div>

        {/* Card 3: Net Overall Change */}
        <div
          className={`rounded-xl p-4 border transition-colors shadow-xs relative overflow-hidden ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div
            className={`absolute top-0 left-0 w-1.5 h-full ${
              isDrop ? 'bg-rose-500' : isGrowth ? 'bg-emerald-500' : 'bg-slate-400'
            }`}
          />
          <div className="flex items-center justify-between text-xs mb-1">
            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
              Overall Change
            </span>
            <div className="flex items-center gap-1 font-semibold text-xs">
              {isDrop ? (
                <span className="flex items-center text-rose-500">
                  <ArrowDownRight className="w-3.5 h-3.5" />
                  {summary.totalPctChange !== null ? `${summary.totalPctChange.toFixed(1)}%` : ''}
                </span>
              ) : isGrowth ? (
                <span className="flex items-center text-emerald-500">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  +{summary.totalPctChange !== null ? `${summary.totalPctChange.toFixed(1)}%` : ''}
                </span>
              ) : (
                <span className="text-slate-500">0.0%</span>
              )}
            </div>
          </div>
          <div
            className={`text-2xl font-bold font-mono mt-1 ${
              isDrop ? 'text-rose-500' : isGrowth ? 'text-emerald-500' : 'text-slate-500'
            }`}
          >
            {summary.totalChange > 0 ? '+' : ''}
            {formatMetricNumber(summary.totalChange, summary.metricUnit)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Ending minus Starting
          </p>
        </div>

        {/* Card 4: Main Driver */}
        <div
          className={`rounded-xl p-4 border transition-colors shadow-xs relative overflow-hidden ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-500" />
          <div className="flex items-center justify-between text-xs mb-1">
            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
              {isDrop ? 'Biggest Negative Drag' : 'Biggest Positive Driver'}
            </span>
            <button
              onClick={onOpenMathModal}
              className="text-slate-400 hover:text-indigo-500 transition"
              title="Show calculation details"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          </div>
          {activeAnalysis?.topDetractor ? (
            <div className="mt-1">
              <div
                className={`text-sm font-bold truncate max-w-[190px] ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
                title={activeAnalysis.topDetractor.segmentName}
              >
                {activeAnalysis.topDetractor.segmentName}
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-lg font-bold font-mono text-rose-500">
                  {formatMetricNumber(activeAnalysis.topDetractor.absChange, summary.metricUnit)}
                </span>
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded bg-rose-500/10 text-rose-500 border border-rose-500/20"
                  title="Share of the final net change"
                >
                  {Math.abs(activeAnalysis.topDetractor.contributionPct) > 100
                    ? `${(Math.abs(activeAnalysis.topDetractor.contributionPct) / 100).toFixed(1)}x net`
                    : `${Math.abs(activeAnalysis.topDetractor.contributionPct).toFixed(0)}% of net`}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400 mt-2">No single dominant driver</div>
          )}
        </div>
      </div>

      {/* Balanced Math Verification Banner */}
      <div
        className={`rounded-lg px-4 py-2.5 border flex flex-wrap items-center justify-between gap-3 text-xs transition-colors ${
          isDark
            ? 'bg-slate-900/60 border-slate-800 text-slate-400'
            : 'bg-slate-100/70 border-slate-200 text-slate-600'
        }`}
      >
        <div className="flex items-center gap-2">
          {activeAnalysis?.isReconciled ? (
            <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Verified: Segment changes sum up exactly to the total change (100% balanced)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-semibold">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Non-additive aggregation (e.g. average)
            </span>
          )}
          <span className="text-slate-400 hidden sm:inline">•</span>
          <span className="hidden sm:inline">
            Active Cut: <strong className={isDark ? 'text-slate-200' : 'text-slate-800'}>{activeAnalysis?.dimension}</strong> ({activeAnalysis?.segments.length} segments)
          </span>
        </div>

        <button
          onClick={onOpenMathModal}
          className="text-indigo-500 hover:text-indigo-600 underline font-medium cursor-pointer"
        >
          View Formula &amp; Steps
        </button>
      </div>
    </div>
  );
};
