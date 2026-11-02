import React from 'react';
import { AlertCircle, Calendar } from 'lucide-react';
import { TimeSeriesPoint } from '../types';
import { formatMetricNumber } from '../utils/contributionEngine';
import { useTheme } from '../context/ThemeContext';

interface TimeSeriesAnomalyChartProps {
  timeSeries: TimeSeriesPoint[];
  metricName: string;
  metricUnit: string;
  onSetBasePeriod: (period: string) => void;
  onSetCompPeriod: (period: string) => void;
}

export const TimeSeriesAnomalyChart: React.FC<TimeSeriesAnomalyChartProps> = ({
  timeSeries,
  metricName,
  metricUnit,
  onSetBasePeriod,
  onSetCompPeriod,
}) => {
  const { isDark } = useTheme();
  if (!timeSeries || timeSeries.length === 0) return null;

  const values = timeSeries.map((t) => t.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 1;

  const svgWidth = 840;
  const svgHeight = 165;
  const padTop = 25;
  const padBottom = 35;
  const padLeft = 65;
  const padRight = 35;

  const plotWidth = svgWidth - padLeft - padRight;
  const plotHeight = svgHeight - padTop - padBottom;

  const scaleY = (val: number) => {
    return padTop + plotHeight - ((val - minVal) / range) * plotHeight;
  };

  const scaleX = (idx: number) => {
    return padLeft + (idx / (timeSeries.length - 1 || 1)) * plotWidth;
  };

  const linePoints = timeSeries.map((t, idx) => `${scaleX(idx)},${scaleY(t.value)}`);
  const pathD = `M ${linePoints.join(' L ')}`;
  const areaD = `M ${scaleX(0)},${padTop + plotHeight} L ${linePoints.join(' L ')} L ${scaleX(timeSeries.length - 1)},${padTop + plotHeight} Z`;

  const anomalyCount = timeSeries.filter((t) => t.isAnomaly).length;

  return (
    <div
      className={`rounded-xl p-4 border transition-colors shadow-xs mb-6 ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-purple-500" />
          <h3
            className={`text-sm font-bold ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            Historical Trend &amp; Unusual Shifts
          </h3>
          {anomalyCount > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20">
              <AlertCircle className="w-3 h-3" />
              {anomalyCount} unusual shift{anomalyCount > 1 ? 's' : ''} detected
            </span>
          )}
        </div>
        <p className="text-[11px] text-slate-400">
          Click any button below to quickly set as Starting (T0) or Ending (T1)
        </p>
      </div>

      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto min-w-[650px] select-none"
        >
          <defs>
            <linearGradient id="areaGradientLight" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Area fill */}
          <path d={areaD} fill="url(#areaGradientLight)" />

          {/* Grid lines */}
          {[0, 0.5, 1].map((pct, idx) => {
            const val = minVal + pct * range;
            const y = scaleY(val);
            return (
              <g key={`ts-grid-${idx}`}>
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
                  fontSize="9"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {formatMetricNumber(val, metricUnit, 0)}
                </text>
              </g>
            );
          })}

          {/* Trend line */}
          <path d={pathD} fill="none" stroke="#6366f1" strokeWidth="2.5" />

          {/* Nodes */}
          {timeSeries.map((t, idx) => {
            const cx = scaleX(idx);
            const cy = scaleY(t.value);

            let nodeColor = '#6366f1';
            let radius = 4.5;

            if (t.isBasePeriod) {
              nodeColor = '#3b82f6';
              radius = 6.5;
            } else if (t.isCompPeriod) {
              nodeColor = '#10b981';
              radius = 6.5;
            } else if (t.isAnomaly) {
              nodeColor = '#ef4444';
              radius = 6;
            }

            return (
              <g key={`pt-${idx}`} className="group cursor-pointer">
                {t.isAnomaly && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={radius + 5}
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="1.5"
                    opacity="0.6"
                    className="animate-ping"
                  />
                )}

                <circle
                  cx={cx}
                  cy={cy}
                  r={radius}
                  fill={nodeColor}
                  stroke={isDark ? '#0f172a' : '#ffffff'}
                  strokeWidth="2"
                />

                <text
                  x={cx}
                  y={svgHeight - padBottom + 16}
                  textAnchor="middle"
                  fill={
                    t.isBasePeriod
                      ? '#2563eb'
                      : t.isCompPeriod
                      ? '#059669'
                      : isDark
                      ? '#94a3b8'
                      : '#64748b'
                  }
                  fontSize="10"
                  fontWeight={t.isBasePeriod || t.isCompPeriod ? 'bold' : 'normal'}
                  fontFamily="JetBrains Mono, monospace"
                >
                  {t.period}
                </text>

                {(t.isBasePeriod || t.isCompPeriod || t.isAnomaly) && (
                  <text
                    x={cx}
                    y={cy - 10}
                    textAnchor="middle"
                    fill={
                      t.isBasePeriod
                        ? '#2563eb'
                        : t.isCompPeriod
                        ? '#059669'
                        : '#ef4444'
                    }
                    fontSize="9.5"
                    fontWeight="bold"
                    fontFamily="JetBrains Mono, monospace"
                  >
                    {t.isBasePeriod ? 'Start: ' : t.isCompPeriod ? 'End: ' : '⚠️ '}
                    {formatMetricNumber(t.value, metricUnit, 0)}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Quick period assign bar */}
      <div
        className={`flex flex-wrap items-center gap-1.5 mt-2 pt-2 border-t text-xs ${
          isDark ? 'border-slate-800' : 'border-slate-100'
        }`}
      >
        <span className="text-slate-400 mr-1 text-[11px] font-medium">Quick Select:</span>
        {timeSeries.map((t) => (
          <div key={`btn-period-${t.period}`} className="flex items-center gap-1">
            <button
              onClick={() => onSetBasePeriod(t.period)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono border transition ${
                t.isBasePeriod
                  ? 'bg-blue-500/20 text-blue-500 border-blue-400 font-bold'
                  : isDark
                  ? 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:text-slate-900'
              }`}
              title={`Set ${t.period} as Starting Period (T0)`}
            >
              Start: {t.period}
            </button>
            <button
              onClick={() => onSetCompPeriod(t.period)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono border transition ${
                t.isCompPeriod
                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-400 font-bold'
                  : isDark
                  ? 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:text-slate-900'
              }`}
              title={`Set ${t.period} as Ending Period (T1)`}
            >
              End: {t.period}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
