import React, { useState } from 'react';
import { DimensionAnalysis, SegmentContribution } from '../types';
import { formatMetricNumber } from '../utils/contributionEngine';
import { useTheme } from '../context/ThemeContext';

interface WaterfallChartProps {
  analysis: DimensionAnalysis;
  basePeriodLabel: string;
  compPeriodLabel: string;
  metricUnit: string;
  onSelectSegment?: (segmentName: string) => void;
}

interface WaterfallStep {
  name: string;
  start: number;
  delta: number;
  end: number;
  type: 'total' | 'positive' | 'negative';
  contributionPct: number;
  originalSegment?: SegmentContribution;
}

export const WaterfallChart: React.FC<WaterfallChartProps> = ({
  analysis,
  basePeriodLabel,
  compPeriodLabel,
  metricUnit,
  onSelectSegment,
}) => {
  const { isDark } = useTheme();
  const [hoveredStep, setHoveredStep] = useState<WaterfallStep | null>(null);

  if (!analysis || !analysis.segments || analysis.segments.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 text-xs">
        No segment data available for this dimension.
      </div>
    );
  }

  const sortedSegments = [...analysis.segments].sort(
    (a, b) => Math.abs(b.absChange) - Math.abs(a.absChange)
  );

  const MAX_SEGMENTS = 6;
  const topSegments = sortedSegments.slice(0, MAX_SEGMENTS);
  const remainingSegments = sortedSegments.slice(MAX_SEGMENTS);

  const steps: WaterfallStep[] = [];

  // Step 0: Starting Total
  let running = analysis.totalBase;
  steps.push({
    name: `Start: ${basePeriodLabel || 'T0'}`,
    start: 0,
    delta: analysis.totalBase,
    end: analysis.totalBase,
    type: 'total',
    contributionPct: 100,
  });

  // Top segment deltas
  for (const seg of topSegments) {
    const prev = running;
    running += seg.absChange;
    steps.push({
      name: seg.segmentName,
      start: prev,
      delta: seg.absChange,
      end: running,
      type: seg.absChange >= 0 ? 'positive' : 'negative',
      contributionPct: seg.contributionPct,
      originalSegment: seg,
    });
  }

  // Other segments combined
  if (remainingSegments.length > 0) {
    const othersDelta = remainingSegments.reduce((sum, s) => sum + s.absChange, 0);
    const prev = running;
    running += othersDelta;
    let othersContrib = 0;
    if (Math.abs(analysis.totalChange) > 1e-9) {
      othersContrib = (othersDelta / analysis.totalChange) * 100;
    }
    steps.push({
      name: `Other (${remainingSegments.length} items)`,
      start: prev,
      delta: othersDelta,
      end: running,
      type: othersDelta >= 0 ? 'positive' : 'negative',
      contributionPct: othersContrib,
    });
  }

  // Final Step: Ending Total
  steps.push({
    name: `End: ${compPeriodLabel || 'T1'}`,
    start: 0,
    delta: analysis.totalComp,
    end: analysis.totalComp,
    type: 'total',
    contributionPct: 100,
  });

  const allValues = steps.flatMap((s) => [s.start, s.end, 0]);
  const minVal = Math.min(0, ...allValues);
  const maxVal = Math.max(10, ...allValues);
  const range = maxVal - minVal || 1;

  const svgWidth = 840;
  const svgHeight = 250;
  const padTop = 30;
  const padBottom = 55;
  const padLeft = 70;
  const padRight = 30;

  const plotWidth = svgWidth - padLeft - padRight;
  const plotHeight = svgHeight - padTop - padBottom;

  const scaleY = (val: number) => {
    return padTop + plotHeight - ((val - minVal) / range) * plotHeight;
  };

  const colWidth = Math.min(65, plotWidth / steps.length - 12);
  const colGap = (plotWidth - colWidth * steps.length) / (steps.length - 1 || 1);

  return (
    <div
      className={`rounded-xl p-5 border transition-colors shadow-xs relative ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <div>
          <h3
            className={`text-sm font-bold flex items-center gap-2 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            <span>Visual Waterfall: Where Did the Metric Move?</span>
            <span className="text-xs font-normal text-indigo-500">
              ({analysis.dimension})
            </span>
          </h3>
          <p className="text-xs text-slate-400">
            Follow the bars left to right to see how each segment moved the starting total to the ending total.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded bg-blue-500 inline-block"></span> Total
          </span>
          <span className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
            <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block"></span> Grew (+)
          </span>
          <span className="flex items-center gap-1.5 font-medium text-rose-600 dark:text-rose-400">
            <span className="w-2.5 h-2.5 rounded bg-rose-500 inline-block"></span> Fell (-)
          </span>
        </div>
      </div>

      {/* SVG Container */}
      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto min-w-[700px] select-none"
        >
          {/* Zero reference line */}
          <line
            x1={padLeft}
            y1={scaleY(0)}
            x2={svgWidth - padRight}
            y2={scaleY(0)}
            stroke={isDark ? '#334155' : '#cbd5e1'}
            strokeDasharray="4 4"
            strokeWidth="1"
          />

          {/* Grid lines and Y-axis labels */}
          {[0, 0.33, 0.66, 1].map((pct, idx) => {
            const val = minVal + pct * range;
            const y = scaleY(val);
            return (
              <g key={`wf-grid-${idx}`}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={svgWidth - padRight}
                  y2={y}
                  stroke={isDark ? '#1e293b' : '#f1f5f9'}
                  strokeWidth="1"
                />
                <text
                  x={padLeft - 8}
                  y={y + 4}
                  textAnchor="end"
                  fill={isDark ? '#64748b' : '#94a3b8'}
                  fontSize="10"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {formatMetricNumber(val, metricUnit, 0)}
                </text>
              </g>
            );
          })}

          {/* Waterfall Columns */}
          {steps.map((step, idx) => {
            const x = padLeft + idx * (colWidth + colGap);
            const yTop = scaleY(Math.max(step.start, step.end));
            const yBottom = scaleY(Math.min(step.start, step.end));
            const height = Math.max(4, yBottom - yTop);

            const hasNext = idx < steps.length - 1;
            const nextX = padLeft + (idx + 1) * (colWidth + colGap);
            const connectorY = scaleY(step.end);

            let barFill = '#3b82f6';
            if (step.type === 'positive') barFill = '#10b981';
            if (step.type === 'negative') barFill = '#f43f5e';

            const isHovered = hoveredStep?.name === step.name;

            return (
              <g
                key={`step-${idx}`}
                onMouseEnter={() => setHoveredStep(step)}
                onMouseLeave={() => setHoveredStep(null)}
                onClick={() => {
                  if (step.originalSegment && onSelectSegment) {
                    onSelectSegment(step.originalSegment.segmentName);
                  }
                }}
                className="cursor-pointer"
              >
                {/* Connecting line */}
                {hasNext && (
                  <line
                    x1={x + colWidth}
                    y1={connectorY}
                    x2={nextX}
                    y2={connectorY}
                    stroke={isDark ? '#475569' : '#94a3b8'}
                    strokeDasharray="2 2"
                    strokeWidth="1.5"
                  />
                )}

                {/* Main Waterfall Bar */}
                <rect
                  x={x}
                  y={yTop}
                  width={colWidth}
                  height={height}
                  rx="4"
                  fill={barFill}
                  opacity={isHovered ? 1 : 0.9}
                  className="transition-all"
                  stroke={isHovered ? (isDark ? '#ffffff' : '#0f172a') : 'none'}
                  strokeWidth={isHovered ? 2 : 0}
                />

                {/* Top/Delta Label */}
                <text
                  x={x + colWidth / 2}
                  y={yTop - 6}
                  textAnchor="middle"
                  fill={
                    step.type === 'negative'
                      ? '#ef4444'
                      : step.type === 'positive'
                      ? '#10b981'
                      : isDark
                      ? '#93c5fd'
                      : '#2563eb'
                  }
                  fontSize="10"
                  fontWeight="bold"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {step.type === 'total'
                    ? formatMetricNumber(step.end, metricUnit, 0)
                    : `${step.delta > 0 ? '+' : ''}${formatMetricNumber(step.delta, metricUnit, 0)}`}
                </text>

                {/* Bottom X-axis label */}
                <text
                  x={x + colWidth / 2}
                  y={svgHeight - padBottom + 18}
                  textAnchor="middle"
                  fill={isDark ? '#e2e8f0' : '#334155'}
                  fontSize="10"
                  fontWeight="600"
                >
                  {step.name.length > 11 ? `${step.name.slice(0, 9)}…` : step.name}
                </text>

                {/* Contribution % Sub-label */}
                {step.type !== 'total' && (
                  <text
                    x={x + colWidth / 2}
                    y={svgHeight - padBottom + 32}
                    textAnchor="middle"
                    fill={step.delta < 0 ? '#ef4444' : '#10b981'}
                    fontSize="9.5"
                    fontWeight="bold"
                    fontFamily="JetBrains Mono, monospace"
                  >
                    {step.contributionPct.toFixed(0)}%
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Floating Hover Card Detail */}
      {hoveredStep && (
        <div
          className={`absolute top-4 right-4 rounded-lg p-3 text-xs shadow-xl backdrop-blur max-w-xs z-20 border ${
            isDark
              ? 'bg-slate-950/95 border-slate-700 text-slate-100'
              : 'bg-white/95 border-slate-200 text-slate-800'
          }`}
        >
          <div className="font-bold border-b pb-1 mb-2 border-slate-700/50">
            {hoveredStep.name}
          </div>
          <div className="space-y-1 font-mono text-[11px]">
            <div className="flex justify-between text-slate-400">
              <span>Change Amount:</span>
              <span
                className={
                  hoveredStep.delta < 0
                    ? 'text-rose-500 font-bold'
                    : hoveredStep.delta > 0
                    ? 'text-emerald-500 font-bold'
                    : ''
                }
              >
                {hoveredStep.delta > 0 ? '+' : ''}
                {formatMetricNumber(hoveredStep.delta, metricUnit, 1)}
              </span>
            </div>
            {hoveredStep.type !== 'total' && (
              <div className="flex justify-between text-slate-400">
                <span>Share of Total Change:</span>
                <span className="text-indigo-500 font-bold">
                  {hoveredStep.contributionPct.toFixed(1)}%
                </span>
              </div>
            )}
            <div className="flex justify-between text-slate-400">
              <span>Running Total:</span>
              <span className="font-semibold">
                {formatMetricNumber(hoveredStep.end, metricUnit, 1)}
              </span>
            </div>
          </div>
          {hoveredStep.originalSegment && (
            <p className="text-[10px] text-indigo-500 mt-2 font-sans">
              Click bar to view underlying evidence rows
            </p>
          )}
        </div>
      )}
    </div>
  );
};
