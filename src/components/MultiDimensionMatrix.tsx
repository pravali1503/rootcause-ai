import React, { useState } from 'react';
import {
  Layers,
  ArrowRight,
} from 'lucide-react';
import { DimensionAnalysis, InvestigationSummary } from '../types';
import { formatMetricNumber } from '../utils/contributionEngine';
import { useTheme } from '../context/ThemeContext';

interface MultiDimensionMatrixProps {
  summary: InvestigationSummary;
  selectedDimensions: string[];
  activeDimension: string;
  onSelectDimension: (dim: string) => void;
  onDrilldownSegment: (dim: string, segmentValue: string) => void;
  onOpenMathModal: () => void;
}

export const MultiDimensionMatrix: React.FC<MultiDimensionMatrixProps> = ({
  summary,
  selectedDimensions,
  activeDimension,
  onSelectDimension,
  onDrilldownSegment,
  onOpenMathModal,
}) => {
  const { isDark } = useTheme();
  const analyses = summary.dimensionAnalyses;
  const currentAnalysis = analyses[activeDimension];

  return (
    <div className="space-y-6">
      {/* Dimension Overview Header */}
      <div
        className={`rounded-xl p-5 border transition-colors shadow-xs ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2
              className={`text-base font-bold flex items-center gap-2 ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              <Layers className="w-4 h-4 text-indigo-500" />
              Compare Dimensions (Where did the change happen?)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Net Change of{' '}
              <strong className={isDark ? 'text-white' : 'text-slate-900'}>
                {summary.totalChange > 0 ? '+' : ''}
                {formatMetricNumber(summary.totalChange, summary.metricUnit)}
              </strong>{' '}
              viewed across different business cuts.
            </p>
          </div>

          {/* Dimension Selector Tabs */}
          <div className="flex flex-wrap gap-1.5">
            {selectedDimensions.map((dim) => {
              const dimAnalysis = analyses[dim];
              const isSelected = activeDimension === dim;

              return (
                <button
                  key={dim}
                  onClick={() => onSelectDimension(dim)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-2 ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : isDark
                      ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  <span>{dim}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                      isSelected
                        ? 'bg-indigo-800/80 text-white'
                        : isDark
                        ? 'bg-slate-900 text-slate-400'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {dimAnalysis?.segments.length || 0}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Side-by-side Dimension Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {selectedDimensions.map((dim) => {
            const da = analyses[dim];
            if (!da) return null;
            const topDetr = da.topDetractor;
            const topMitig = da.topMitigator;
            const isConcentrated = da.concentrationScore > 0.25;

            return (
              <div
                key={`card-${dim}`}
                onClick={() => onSelectDimension(dim)}
                className={`p-4 rounded-xl border cursor-pointer transition ${
                  activeDimension === dim
                    ? isDark
                      ? 'bg-slate-800/90 border-indigo-500/80 ring-1 ring-indigo-500/30'
                      : 'bg-indigo-50/50 border-indigo-300 ring-1 ring-indigo-200'
                    : isDark
                    ? 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`font-bold text-sm ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {dim}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      isConcentrated
                        ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                        : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                    }`}
                  >
                    {isConcentrated ? 'Highly Focused' : 'Spread Across Segments'}
                  </span>
                </div>

                {/* Top Driver */}
                {topDetr && (
                  <div className="mt-2 text-xs">
                    <span className="text-[11px] text-slate-400">Biggest Driver:</span>
                    <div className="flex items-center justify-between font-mono mt-0.5">
                      <span
                        className={`truncate max-w-[120px] font-sans font-medium ${
                          isDark ? 'text-slate-200' : 'text-slate-800'
                        }`}
                        title={topDetr.segmentName}
                      >
                        {topDetr.segmentName}
                      </span>
                      <span className="text-rose-500 font-bold">
                        {Math.abs(topDetr.contributionPct).toFixed(0)}% (
                        {formatMetricNumber(topDetr.absChange, summary.metricUnit)})
                      </span>
                    </div>
                  </div>
                )}

                {/* Top Cushion / Mitigator */}
                {topMitig && (
                  <div
                    className={`mt-2 text-xs pt-1.5 border-t ${
                      isDark ? 'border-slate-800' : 'border-slate-200'
                    }`}
                  >
                    <span className="text-[11px] text-slate-400">Positive Offset:</span>
                    <div className="flex items-center justify-between font-mono mt-0.5">
                      <span
                        className={`truncate max-w-[120px] font-sans font-medium ${
                          isDark ? 'text-slate-200' : 'text-slate-800'
                        }`}
                        title={topMitig.segmentName}
                      >
                        {topMitig.segmentName}
                      </span>
                      <span className="text-emerald-500 font-bold">
                        +{formatMetricNumber(topMitig.absChange, summary.metricUnit)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Dimension Detail and Drill Down List */}
      {currentAnalysis && (
        <div
          className={`rounded-xl p-5 border transition-colors shadow-xs space-y-4 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3
                className={`text-sm font-bold ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                Detail for: <span className="text-indigo-500">{currentAnalysis.dimension}</span>
              </h3>
              <p className="text-xs text-slate-400">
                Click &quot;Drill Down&quot; on any item to zoom in and see what drove it.
              </p>
            </div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              ✓ 100% of Delta Accounted For
            </div>
          </div>

          <div className="space-y-3 pt-1">
            {currentAnalysis.segments.map((seg) => {
              const isDetractor =
                summary.totalChange < 0 ? seg.absChange < 0 : seg.absChange > 0;
              const absPct = Math.min(100, Math.abs(seg.contributionPct));

              return (
                <div
                  key={seg.segmentName}
                  className={`rounded-lg p-3.5 border transition ${
                    isDark
                      ? 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold font-sans ${
                          isDark ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        {seg.segmentName}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        (Start: {formatMetricNumber(seg.baseValue, summary.metricUnit)} &rarr; End: {formatMetricNumber(seg.compValue, summary.metricUnit)})
                      </span>
                    </div>
                    <div className="flex items-center gap-3 font-mono text-xs">
                      <span
                        className={`font-bold ${
                          seg.absChange < 0
                            ? 'text-rose-500'
                            : seg.absChange > 0
                            ? 'text-emerald-500'
                            : 'text-slate-400'
                        }`}
                      >
                        Change: {seg.absChange > 0 ? '+' : ''}
                        {formatMetricNumber(seg.absChange, summary.metricUnit, 1)}
                      </span>
                      <span className="font-bold text-indigo-500">
                        {seg.contributionPct.toFixed(0)}% of total
                      </span>
                      <button
                        onClick={() =>
                          onDrilldownSegment(currentAnalysis.dimension, seg.segmentName)
                        }
                        className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-sans font-semibold flex items-center gap-1 transition"
                        title={`Filter entire investigation to ${seg.segmentName}`}
                      >
                        Drill Down <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div
                    className={`w-full rounded-full h-2 overflow-hidden flex ${
                      isDark ? 'bg-slate-900' : 'bg-slate-200'
                    }`}
                  >
                    <div
                      className={`h-full rounded-full ${
                        isDetractor ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${absPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
