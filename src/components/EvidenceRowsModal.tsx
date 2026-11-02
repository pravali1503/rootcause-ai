import React, { useState } from 'react';
import { X, Download, Search, FileText } from 'lucide-react';
import { formatMetricNumber } from '../utils/contributionEngine';
import { useTheme } from '../context/ThemeContext';

interface EvidenceRowsModalProps {
  isOpen: boolean;
  onClose: () => void;
  segmentName: string;
  dimensionName: string;
  metricColumn: string;
  periodColumn: string;
  basePeriod: string;
  compPeriod: string;
  rows: Record<string, any>[];
  headers: string[];
}

export const EvidenceRowsModal: React.FC<EvidenceRowsModalProps> = ({
  isOpen,
  onClose,
  segmentName,
  dimensionName,
  metricColumn,
  periodColumn,
  basePeriod,
  compPeriod,
  rows,
  headers,
}) => {
  const { isDark } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [periodFilter, setPeriodFilter] = useState<'all' | 'base' | 'comp'>('all');

  if (!isOpen) return null;

  const segmentRows = rows.filter((r) => {
    const val = String(r[dimensionName] ?? 'Unknown / Missing');
    return val === segmentName;
  });

  const periodFiltered = segmentRows.filter((r) => {
    const p = String(r[periodColumn] ?? '');
    if (periodFilter === 'base') return p === basePeriod;
    if (periodFilter === 'comp') return p === compPeriod;
    return p === basePeriod || p === compPeriod;
  });

  const searchFiltered = periodFiltered.filter((r) => {
    if (!searchTerm) return true;
    return Object.values(r).some((v) =>
      String(v).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const baseRows = segmentRows.filter((r) => String(r[periodColumn]) === basePeriod);
  const compRows = segmentRows.filter((r) => String(r[periodColumn]) === compPeriod);
  const baseSum = baseRows.reduce((acc, r) => acc + (Number(r[metricColumn]) || 0), 0);
  const compSum = compRows.reduce((acc, r) => acc + (Number(r[metricColumn]) || 0), 0);
  const delta = compSum - baseSum;

  const handleDownloadCsv = () => {
    if (searchFiltered.length === 0) return;
    const csvHeader = headers.join(',');
    const csvLines = searchFiltered.map((row) =>
      headers
        .map((h) => {
          const v = row[h];
          if (v === null || v === undefined) return '';
          const s = String(v).replace(/"/g, '""');
          return `"${s}"`;
        })
        .join(',')
    );
    const content = [csvHeader, ...csvLines].join('\n');
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `evidence_${dimensionName}_${segmentName}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div
        className={`rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border ${
          isDark
            ? 'bg-slate-900 border-slate-700 text-slate-100'
            : 'bg-white border-slate-300 text-slate-900'
        }`}
      >
        {/* Header */}
        <div
          className={`px-6 py-4 border-b flex items-center justify-between ${
            isDark ? 'border-slate-800 bg-slate-950/70' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <div>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-500" />
              <h3
                className={`text-base font-bold ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                Inspect Data Rows: {dimensionName} = &quot;{segmentName}&quot;
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              The exact individual records that make up this segment&apos;s totals.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Verification Bar */}
        <div
          className={`border-b px-6 py-3 flex flex-wrap items-center justify-between gap-4 text-xs ${
            isDark
              ? 'bg-slate-800/40 border-slate-800'
              : 'bg-slate-100/70 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-4 font-mono">
            <div>
              <span className="text-slate-400 font-sans">Start ({basePeriod}): </span>
              <span className="font-bold">{formatMetricNumber(baseSum)}</span>
              <span className="text-slate-400 text-[10px] font-sans"> ({baseRows.length} rows)</span>
            </div>
            <div>
              <span className="text-slate-400 font-sans">End ({compPeriod}): </span>
              <span className="font-bold">{formatMetricNumber(compSum)}</span>
              <span className="text-slate-400 text-[10px] font-sans"> ({compRows.length} rows)</span>
            </div>
            <div>
              <span className="text-slate-400 font-sans">Net Change: </span>
              <span
                className={`font-bold ${
                  delta < 0 ? 'text-rose-500' : delta > 0 ? 'text-emerald-500' : ''
                }`}
              >
                {delta > 0 ? '+' : ''}
                {formatMetricNumber(delta)}
              </span>
            </div>
          </div>

          <button
            onClick={handleDownloadCsv}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-sans text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Rows ({searchFiltered.length})</span>
          </button>
        </div>

        {/* Filters and Search Bar */}
        <div
          className={`p-4 border-b flex flex-wrap items-center justify-between gap-3 ${
            isDark ? 'border-slate-800' : 'border-slate-200'
          }`}
        >
          <div
            className={`flex items-center gap-1 p-1 rounded-lg border text-xs ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}
          >
            <button
              onClick={() => setPeriodFilter('all')}
              className={`px-3 py-1 rounded-md transition font-medium ${
                periodFilter === 'all'
                  ? isDark
                    ? 'bg-slate-800 text-white font-bold'
                    : 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'
              }`}
            >
              All Periods ({segmentRows.length})
            </button>
            <button
              onClick={() => setPeriodFilter('base')}
              className={`px-3 py-1 rounded-md transition font-medium ${
                periodFilter === 'base'
                  ? 'bg-blue-500/20 text-blue-500 font-bold'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'
              }`}
            >
              Start: {basePeriod} ({baseRows.length})
            </button>
            <button
              onClick={() => setPeriodFilter('comp')}
              className={`px-3 py-1 rounded-md transition font-medium ${
                periodFilter === 'comp'
                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'
              }`}
            >
              End: {compPeriod} ({compRows.length})
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search in these rows..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`text-xs rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64 border ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-white'
                  : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>
        </div>

        {/* Rows Table */}
        <div className="flex-1 overflow-auto p-4">
          {searchFiltered.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No matching records found.
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr
                  className={`border-b font-semibold text-slate-400 sticky top-0 ${
                    isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-100'
                  }`}
                >
                  <th className="py-2.5 px-3">#</th>
                  {headers.map((h) => (
                    <th
                      key={h}
                      className={`py-2.5 px-3 whitespace-nowrap ${
                        h === metricColumn ? 'text-indigo-500 font-bold' : ''
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody
                className={`divide-y font-mono ${
                  isDark ? 'divide-slate-800/60' : 'divide-slate-100'
                }`}
              >
                {searchFiltered.map((row, idx) => (
                  <tr
                    key={`row-${idx}`}
                    className={`transition ${
                      isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-2 px-3 text-slate-400 font-sans">{idx + 1}</td>
                    {headers.map((h) => {
                      const val = row[h];
                      const isMetric = h === metricColumn;
                      const isPeriod = h === periodColumn;

                      return (
                        <td
                          key={h}
                          className={`py-2 px-3 whitespace-nowrap ${
                            isMetric
                              ? 'font-bold text-indigo-500'
                              : isPeriod
                              ? 'text-purple-500'
                              : isDark
                              ? 'text-slate-300'
                              : 'text-slate-700'
                          }`}
                        >
                          {val === null || val === undefined ? (
                            <span className="text-slate-400 italic">null</span>
                          ) : typeof val === 'number' ? (
                            val.toLocaleString()
                          ) : (
                            String(val)
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
