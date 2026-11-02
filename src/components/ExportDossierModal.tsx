import React, { useRef } from 'react';
import { X, Printer, Download, FileText } from 'lucide-react';
import { DimensionAnalysis, InvestigationSummary } from '../types';
import { formatMetricNumber } from '../utils/contributionEngine';
import { useTheme } from '../context/ThemeContext';

interface ExportDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: InvestigationSummary;
  activeAnalysis: DimensionAnalysis;
  aiReport: string | null;
}

export const ExportDossierModal: React.FC<ExportDossierModalProps> = ({
  isOpen,
  onClose,
  summary,
  activeAnalysis,
  aiReport,
}) => {
  const { isDark } = useTheme();
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJson = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(
        JSON.stringify(
          {
            generatedAt: new Date().toISOString(),
            investigationSummary: summary,
            aiExecutiveReport: aiReport,
          },
          null,
          2
        )
      );
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `investigation_report_${summary.metricName}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div
        className={`rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border ${
          isDark
            ? 'bg-slate-900 border-slate-700 text-slate-100'
            : 'bg-white border-slate-300 text-slate-900'
        }`}
      >
        {/* Controls Header */}
        <div
          className={`px-6 py-4 border-b flex items-center justify-between no-print ${
            isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-500" />
            <h3
              className={`text-base font-bold ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              Executive Investigation Report (Ready to Print)
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white flex items-center gap-1.5 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={handleDownloadJson}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition border ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download JSON</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Area */}
        <div
          ref={printRef}
          className={`flex-1 overflow-auto p-8 font-sans space-y-6 print:bg-white print:text-black print:p-0 ${
            isDark ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900'
          }`}
        >
          {/* Header */}
          <div className="border-b-2 border-slate-300 dark:border-slate-800 pb-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs uppercase tracking-wider font-bold text-indigo-600 dark:text-indigo-400">
                  Business Root-Cause &amp; Contribution Report
                </span>
                <h1 className="text-xl font-bold mt-1">
                  Metric Investigation: {summary.metricName}
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Comparing Starting Period ({summary.basePeriod}) against Ending Period ({summary.compPeriod})
                </p>
              </div>
              <div className="text-right text-xs font-mono text-slate-400">
                <div>Generated: {new Date().toLocaleDateString()}</div>
                <div className="text-emerald-500 font-semibold">Status: Balanced (100%)</div>
              </div>
            </div>
          </div>

          {/* Metric Snapshot */}
          <div className="grid grid-cols-4 gap-3">
            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
              <div className="text-[11px] text-slate-400">Starting ({summary.basePeriod})</div>
              <div className="text-lg font-bold font-mono mt-1">
                {formatMetricNumber(summary.totalBase, summary.metricUnit)}
              </div>
            </div>
            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
              <div className="text-[11px] text-slate-400">Ending ({summary.compPeriod})</div>
              <div className="text-lg font-bold font-mono mt-1">
                {formatMetricNumber(summary.totalComp, summary.metricUnit)}
              </div>
            </div>
            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
              <div className="text-[11px] text-slate-400">Net Change</div>
              <div
                className={`text-lg font-bold font-mono mt-1 ${
                  summary.totalChange < 0 ? 'text-rose-500' : 'text-emerald-500'
                }`}
              >
                {summary.totalChange > 0 ? '+' : ''}
                {formatMetricNumber(summary.totalChange, summary.metricUnit)}
              </div>
            </div>
            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
              <div className="text-[11px] text-slate-400">% Change</div>
              <div className="text-lg font-bold font-mono text-indigo-500 mt-1">
                {summary.totalPctChange !== null
                  ? `${summary.totalPctChange.toFixed(1)}%`
                  : 'N/A (Zero Base)'}
              </div>
            </div>
          </div>

          {/* Top Ranked Contributors */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Top Contributors ({activeAnalysis.dimension})
            </h3>
            <table className="w-full text-left text-xs border border-slate-200 dark:border-slate-800">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-900 text-slate-500">
                  <th className="py-2 px-3">Segment</th>
                  <th className="py-2 px-3 text-right">Start</th>
                  <th className="py-2 px-3 text-right">End</th>
                  <th className="py-2 px-3 text-right">Net Change</th>
                  <th className="py-2 px-3 text-right">Share of Change</th>
                  <th className="py-2 px-3">Classification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono text-[11px]">
                {activeAnalysis.segments.slice(0, 8).map((seg) => (
                  <tr key={seg.segmentName}>
                    <td className="py-2 px-3 font-sans font-bold">
                      {seg.segmentName}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-500">
                      {formatMetricNumber(seg.baseValue, summary.metricUnit)}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-500">
                      {formatMetricNumber(seg.compValue, summary.metricUnit)}
                    </td>
                    <td
                      className={`py-2 px-3 text-right font-bold ${
                        seg.absChange < 0 ? 'text-rose-500' : 'text-emerald-500'
                      }`}
                    >
                      {seg.absChange > 0 ? '+' : ''}
                      {formatMetricNumber(seg.absChange, summary.metricUnit)}
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-indigo-500">
                      {seg.contributionPct.toFixed(0)}%
                    </td>
                    <td className="py-2 px-3 font-sans capitalize text-slate-500">
                      {seg.classification.replace('_', ' ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* AI Executive Report (if present) */}
          {aiReport && (
            <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Executive Synthesis &amp; Next Steps
              </h3>
              <div className="text-xs space-y-3 leading-relaxed whitespace-pre-line font-sans text-slate-700 dark:text-slate-300">
                {aiReport}
              </div>
            </div>
          )}

          {/* Causal Reminder */}
          <div className="p-4 rounded-lg text-xs leading-relaxed border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-500">
            <strong className="text-slate-800 dark:text-slate-200 font-bold block mb-1">
              Important Business Reminder:
            </strong>
            The segment percentages above show where the numbers concentrated in your data. They do not prove why customers changed their behavior. Before making major strategic changes, verify root causes using qualitative customer outreach or A/B tests.
          </div>
        </div>
      </div>
    </div>
  );
};
