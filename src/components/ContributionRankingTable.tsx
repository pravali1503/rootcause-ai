import React, { useState } from 'react';
import {
  Search,
  Table as TableIcon,
  FileSearch,
  Calculator,
  Info,
  HelpCircle,
} from 'lucide-react';
import { DimensionAnalysis, SegmentContribution } from '../types';
import { formatMetricNumber } from '../utils/contributionEngine';
import { useTheme } from '../context/ThemeContext';

interface ContributionRankingTableProps {
  analysis: DimensionAnalysis;
  metricName: string;
  metricUnit: string;
  basePeriodLabel: string;
  compPeriodLabel: string;
  onInspectEvidence: (segmentName: string) => void;
  onAuditSegmentMath: (segment: SegmentContribution) => void;
}

export const ContributionRankingTable: React.FC<ContributionRankingTableProps> = ({
  analysis,
  metricName,
  metricUnit,
  basePeriodLabel,
  compPeriodLabel,
  onInspectEvidence,
  onAuditSegmentMath,
}) => {
  const { isDark } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'absChange' | 'contributionPct' | 'baseValue' | 'compValue' | 'pctChange'>('absChange');
  const [sortAsc, setSortAsc] = useState(false);
  const [showOver100Tooltip, setShowOver100Tooltip] = useState(false);

  if (!analysis || !analysis.segments) return null;

  const filteredSegments = analysis.segments.filter((s) =>
    s.segmentName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedSegments = [...filteredSegments].sort((a, b) => {
    let diff = 0;
    if (sortField === 'absChange') {
      diff = Math.abs(b.absChange) - Math.abs(a.absChange);
    } else if (sortField === 'contributionPct') {
      diff = b.contributionPct - a.contributionPct;
    } else if (sortField === 'baseValue') {
      diff = b.baseValue - a.baseValue;
    } else if (sortField === 'compValue') {
      diff = b.compValue - a.compValue;
    } else if (sortField === 'pctChange') {
      diff = (b.pctChange ?? -9999) - (a.pctChange ?? -9999);
    }
    return sortAsc ? -diff : diff;
  });

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const maxContribution = Math.max(
    ...analysis.segments.map((s) => Math.abs(s.contributionPct)),
    1
  );

  return (
    <div
      className={`rounded-xl overflow-hidden border transition-colors shadow-xs mb-6 ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}
    >
      {/* Header Bar */}
      <div
        className={`p-4 border-b flex flex-wrap items-center justify-between gap-3 ${
          isDark ? 'border-slate-800' : 'border-slate-200'
        }`}
      >
        <div className="flex items-center gap-2">
          <TableIcon className="w-4 h-4 text-indigo-500" />
          <h3
            className={`text-sm font-bold ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            Ranked Breakdown: Who Contributed Most?
          </h3>
          <span className="text-xs text-slate-400">
            ({analysis.segments.length} segments in {analysis.dimension})
          </span>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search segment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`text-xs rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48 border transition ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-white'
                  : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Explainer Banner if any segment is >100% (e.g. 1060%) */}
      {analysis.hasOffsettingSwings && (
        <div
          className={`px-4 py-2.5 text-xs flex items-center justify-between border-b ${
            isDark
              ? 'bg-amber-950/20 border-amber-800/30 text-amber-200'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <span>
              <strong>Why are some percentages over 100% (e.g. 1060%)?</strong> When some segments grow while others shrink, they cancel each other out. A 1060% change means this segment&apos;s drop was 10.6x larger than the final net change, because gains elsewhere softened the blow.
            </span>
          </div>
          <button
            onClick={() => onAuditSegmentMath(analysis.segments[0])}
            className="text-indigo-500 hover:underline font-semibold ml-3 whitespace-nowrap cursor-pointer"
          >
            See Math
          </button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr
              className={`border-b font-semibold text-slate-500 ${
                isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50/80'
              }`}
            >
              <th className="py-3 px-4"># Rank</th>
              <th className="py-3 px-4">Segment</th>
              <th
                onClick={() => handleSort('baseValue')}
                className="py-3 px-4 text-right cursor-pointer hover:text-slate-800 dark:hover:text-slate-200"
              >
                Start ({basePeriodLabel})
              </th>
              <th
                onClick={() => handleSort('compValue')}
                className="py-3 px-4 text-right cursor-pointer hover:text-slate-800 dark:hover:text-slate-200"
              >
                End ({compPeriodLabel})
              </th>
              <th
                onClick={() => handleSort('absChange')}
                className="py-3 px-4 text-right cursor-pointer hover:text-slate-800 dark:hover:text-slate-200"
              >
                Net Change
              </th>
              <th
                onClick={() => handleSort('pctChange')}
                className="py-3 px-4 text-right cursor-pointer hover:text-slate-800 dark:hover:text-slate-200"
              >
                Growth Rate
              </th>
              <th
                onClick={() => handleSort('contributionPct')}
                className="py-3 px-4 text-right cursor-pointer hover:text-slate-800 dark:hover:text-slate-200 min-w-[160px]"
              >
                <div className="inline-flex items-center gap-1 justify-end">
                  <span>Share of Net Change</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowOver100Tooltip(!showOver100Tooltip);
                    }}
                    title="Can exceed 100% when segments move in opposite directions"
                    className="text-slate-400 hover:text-indigo-500"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                  </button>
                </div>
              </th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-center">Inspect Rows</th>
            </tr>
          </thead>
          <tbody
            className={`divide-y font-mono ${
              isDark ? 'divide-slate-800/60' : 'divide-slate-100'
            }`}
          >
            {sortedSegments.map((segment, idx) => {
              const isDetractor =
                analysis.totalChange < 0 ? segment.absChange < 0 : segment.absChange > 0;
              const isMitigating =
                analysis.totalChange < 0 ? segment.absChange > 0 : segment.absChange < 0;

              const isHighRatio = Math.abs(segment.contributionPct) > 100;
              const multiplier = (Math.abs(segment.contributionPct) / 100).toFixed(1);

              const barWidthPct = Math.min(
                100,
                (Math.abs(segment.contributionPct) / maxContribution) * 100
              );

              return (
                <tr
                  key={segment.segmentName}
                  className={`transition ${
                    isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'
                  }`}
                >
                  <td className="py-3 px-4 text-slate-400 font-sans">{idx + 1}</td>
                  <td
                    className={`py-3 px-4 font-sans font-semibold ${
                      isDark ? 'text-slate-100' : 'text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="truncate max-w-[180px]" title={segment.segmentName}>
                        {segment.segmentName}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right text-slate-400">
                    {formatMetricNumber(segment.baseValue, metricUnit, 1)}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-400">
                    {formatMetricNumber(segment.compValue, metricUnit, 1)}
                  </td>
                  <td className="py-3 px-4 text-right font-bold">
                    <span
                      className={
                        segment.absChange < 0
                          ? 'text-rose-500'
                          : segment.absChange > 0
                          ? 'text-emerald-500'
                          : 'text-slate-400'
                      }
                    >
                      {segment.absChange > 0 ? '+' : ''}
                      {formatMetricNumber(segment.absChange, metricUnit, 1)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-sans">
                    {segment.zeroBaseline ? (
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-300 font-medium border border-amber-500/20"
                        title="Started from zero"
                      >
                        New from 0
                      </span>
                    ) : segment.pctChange !== null ? (
                      <span
                        className={`font-semibold ${
                          segment.pctChange < 0
                            ? 'text-rose-500'
                            : segment.pctChange > 0
                            ? 'text-emerald-500'
                            : 'text-slate-400'
                        }`}
                      >
                        {segment.pctChange > 0 ? '+' : ''}
                        {segment.pctChange.toFixed(1)}%
                      </span>
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex flex-col items-end gap-0.5">
                      <div className="flex items-center gap-1 font-bold">
                        <span
                          className={
                            isDetractor
                              ? 'text-rose-500'
                              : isMitigating
                              ? 'text-emerald-500'
                              : 'text-slate-400'
                          }
                        >
                          {segment.contributionPct.toFixed(0)}%
                        </span>
                        {isHighRatio && (
                          <span
                            className="text-[10px] px-1 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 font-sans font-semibold cursor-help"
                            title={`This segment's shift was ${multiplier}x larger than the net total change, because other segments moved in the opposite direction.`}
                          >
                            {multiplier}x
                          </span>
                        )}
                      </div>

                      {/* Gross activity share indicator */}
                      <span className="text-[10px] text-slate-400 font-sans">
                        {segment.grossSharePct.toFixed(0)}% of total movement
                      </span>

                      {/* Visual Bar */}
                      <div
                        className={`w-24 h-1.5 rounded-full overflow-hidden flex mt-0.5 ${
                          isDark ? 'bg-slate-800' : 'bg-slate-200'
                        }`}
                      >
                        <div
                          className={`h-full rounded-full ${
                            isDetractor
                              ? 'bg-rose-500'
                              : isMitigating
                              ? 'bg-emerald-500'
                              : 'bg-slate-400'
                          }`}
                          style={{ width: `${barWidthPct}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-sans">
                    {segment.classification === 'primary_detractor' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20">
                        {analysis.totalChange < 0 ? 'Major Drag' : 'Primary Driver'}
                      </span>
                    ) : segment.classification === 'secondary_detractor' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        Secondary Driver
                      </span>
                    ) : segment.classification === 'mitigating' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        Offsetting Cushion
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400">Minimal shift</span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-sans text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onAuditSegmentMath(segment)}
                        className={`p-1.5 rounded transition ${
                          isDark
                            ? 'hover:bg-slate-800 text-slate-400 hover:text-amber-300'
                            : 'hover:bg-slate-200 text-slate-500 hover:text-amber-600'
                        }`}
                        title="Show step-by-step formula"
                      >
                        <Calculator className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onInspectEvidence(segment.segmentName)}
                        className={`px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1 transition ${
                          isDark
                            ? 'bg-slate-800 hover:bg-slate-700 text-indigo-300'
                            : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700'
                        }`}
                        title="View raw rows behind this number"
                      >
                        <FileSearch className="w-3 h-3" />
                        <span>Rows</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          {/* Balanced Totals Footer */}
          <tfoot>
            <tr
              className={`font-mono font-bold border-t-2 ${
                isDark
                  ? 'bg-slate-950 text-slate-100 border-slate-800'
                  : 'bg-slate-100 text-slate-900 border-slate-300'
              }`}
            >
              <td className="py-3 px-4 font-sans text-slate-400">Total</td>
              <td className="py-3 px-4 font-sans">All Segments</td>
              <td className="py-3 px-4 text-right">
                {formatMetricNumber(analysis.totalBase, metricUnit, 1)}
              </td>
              <td className="py-3 px-4 text-right">
                {formatMetricNumber(analysis.totalComp, metricUnit, 1)}
              </td>
              <td
                className={`py-3 px-4 text-right ${
                  analysis.totalChange < 0
                    ? 'text-rose-500'
                    : analysis.totalChange > 0
                    ? 'text-emerald-500'
                    : ''
                }`}
              >
                {analysis.totalChange > 0 ? '+' : ''}
                {formatMetricNumber(analysis.totalChange, metricUnit, 1)}
              </td>
              <td className="py-3 px-4 text-right font-sans text-slate-400">
                {analysis.totalBase !== 0
                  ? `${((analysis.totalChange / Math.abs(analysis.totalBase)) * 100).toFixed(1)}%`
                  : 'N/A'}
              </td>
              <td className="py-3 px-4 text-right text-indigo-500">
                100.0%
              </td>
              <td className="py-3 px-4 font-sans text-emerald-600 dark:text-emerald-400 text-[11px]">
                ✓ 100% Balanced
              </td>
              <td className="py-3 px-4 text-center font-sans text-[11px] text-slate-400">
                Sum of parts = Total
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
