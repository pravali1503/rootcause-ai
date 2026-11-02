import React, { useState } from 'react';
import {
  Filter,
  ArrowRightLeft,
  Calendar,
  Calculator,
  Plus,
  X,
  Sparkles,
} from 'lucide-react';
import { ColumnProfile, InvestigationConfig } from '../types';
import { useTheme } from '../context/ThemeContext';

interface InvestigationConfigBarProps {
  config: InvestigationConfig;
  onChangeConfig: (newConfig: InvestigationConfig) => void;
  numericColumns: ColumnProfile[];
  dimensionColumns: ColumnProfile[];
  periodColumns: ColumnProfile[];
  allPeriods: string[];
  scenarioDescription?: string;
  rawData: Record<string, any>[];
}

export const InvestigationConfigBar: React.FC<InvestigationConfigBarProps> = ({
  config,
  onChangeConfig,
  numericColumns,
  dimensionColumns,
  periodColumns,
  allPeriods,
  scenarioDescription,
  rawData,
}) => {
  const { isDark } = useTheme();
  const [filterCol, setFilterCol] = useState<string>('');
  const [filterVal, setFilterVal] = useState<string>('');

  const handleSwapPeriods = () => {
    onChangeConfig({
      ...config,
      basePeriod: config.compPeriod,
      compPeriod: config.basePeriod,
    });
  };

  const handleAddFilter = () => {
    if (!filterCol || !filterVal) return;
    if (config.filters.some((f) => f.column === filterCol && f.value === filterVal)) {
      return;
    }
    onChangeConfig({
      ...config,
      filters: [...config.filters, { column: filterCol, value: filterVal }],
    });
    setFilterVal('');
  };

  const handleRemoveFilter = (index: number) => {
    const updated = [...config.filters];
    updated.splice(index, 1);
    onChangeConfig({
      ...config,
      filters: updated,
    });
  };

  const availableFilterValues = React.useMemo(() => {
    if (!filterCol) return [];
    const set = new Set<string>();
    for (const r of rawData) {
      if (r[filterCol] !== undefined && r[filterCol] !== null) {
        set.add(String(r[filterCol]));
      }
    }
    return Array.from(set).sort();
  }, [filterCol, rawData]);

  return (
    <div
      className={`rounded-xl p-4.5 border transition-colors shadow-xs mb-6 ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}
    >
      {/* Scenario Overview Description */}
      {scenarioDescription && (
        <div
          className={`mb-4 rounded-lg px-3.5 py-2.5 flex items-start gap-2.5 border text-xs leading-relaxed ${
            isDark
              ? 'bg-indigo-950/40 border-indigo-800/40 text-indigo-200'
              : 'bg-indigo-50/80 border-indigo-100 text-indigo-900'
          }`}
        >
          <Sparkles className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
          <div className="leading-relaxed font-normal">
            {scenarioDescription}
          </div>
        </div>
      )}

      {/* Selectors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric Selector */}
        <div className="space-y-1.5">
          <label
            className={`text-xs font-semibold flex items-center gap-1.5 ${
              isDark ? 'text-slate-300' : 'text-slate-700'
            }`}
          >
            <Calculator className="w-3.5 h-3.5 text-indigo-500" />
            1. Metric to Investigate
          </label>
          <div className="flex gap-2">
            <select
              value={config.metricColumn}
              onChange={(e) =>
                onChangeConfig({
                  ...config,
                  metricColumn: e.target.value,
                  metricLabel: e.target.value,
                })
              }
              className={`w-2/3 text-xs rounded-lg px-2.5 py-2 border focus:ring-2 focus:ring-indigo-500 focus:outline-none transition ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-white'
                  : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            >
              {numericColumns.map((col) => (
                <option key={col.name} value={col.name}>
                  {col.name}
                </option>
              ))}
            </select>
            <select
              value={config.aggregation}
              onChange={(e) =>
                onChangeConfig({
                  ...config,
                  aggregation: e.target.value as any,
                })
              }
              className={`w-1/3 text-xs rounded-lg px-2 py-2 border focus:ring-2 focus:ring-indigo-500 focus:outline-none transition ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-white'
                  : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
              title="Calculation type"
            >
              <option value="sum">Sum (Total)</option>
              <option value="avg">Average</option>
              <option value="count">Count</option>
            </select>
          </div>
        </div>

        {/* Period Column */}
        <div className="space-y-1.5">
          <label
            className={`text-xs font-semibold flex items-center gap-1.5 ${
              isDark ? 'text-slate-300' : 'text-slate-700'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-purple-500" />
            2. Date / Period Column
          </label>
          <select
            value={config.periodColumn}
            onChange={(e) =>
              onChangeConfig({
                ...config,
                periodColumn: e.target.value,
              })
            }
            className={`w-full text-xs rounded-lg px-2.5 py-2 border focus:ring-2 focus:ring-indigo-500 focus:outline-none transition ${
              isDark
                ? 'bg-slate-800 border-slate-700 text-white'
                : 'bg-slate-50 border-slate-300 text-slate-900'
            }`}
          >
            {periodColumns.map((col) => (
              <option key={col.name} value={col.name}>
                {col.name}
              </option>
            ))}
          </select>
        </div>

        {/* Comparison Windows (Starting vs Ending) */}
        <div className="space-y-1.5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <label
              className={`text-xs font-semibold flex items-center gap-1.5 ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}
            >
              3. Compare Two Time Periods
            </label>
            <button
              onClick={handleSwapPeriods}
              className="text-[11px] text-indigo-500 hover:text-indigo-600 flex items-center gap-1 transition font-medium"
              title="Swap periods"
            >
              <ArrowRightLeft className="w-3 h-3" /> Swap Starting &amp; Ending
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] text-blue-500 font-semibold block mb-0.5">
                ● Starting Period:
              </span>
              <select
                value={config.basePeriod}
                onChange={(e) =>
                  onChangeConfig({
                    ...config,
                    basePeriod: e.target.value,
                  })
                }
                className={`w-full text-xs rounded-lg px-2.5 py-1.5 border focus:ring-2 focus:ring-blue-500 focus:outline-none transition font-medium ${
                  isDark
                    ? 'bg-slate-800 border-slate-700 text-blue-300'
                    : 'bg-blue-50/50 border-blue-200 text-blue-900'
                }`}
              >
                <option value="" disabled>
                  Select Starting Period
                </option>
                {allPeriods.map((p) => (
                  <option key={`base-${p}`} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <span className="text-[10px] text-emerald-500 font-semibold block mb-0.5">
                ● Ending Period:
              </span>
              <select
                value={config.compPeriod}
                onChange={(e) =>
                  onChangeConfig({
                    ...config,
                    compPeriod: e.target.value,
                  })
                }
                className={`w-full text-xs rounded-lg px-2.5 py-1.5 border focus:ring-2 focus:ring-emerald-500 focus:outline-none transition font-medium ${
                  isDark
                    ? 'bg-slate-800 border-slate-700 text-emerald-300'
                    : 'bg-emerald-50/50 border-emerald-200 text-emerald-900'
                }`}
              >
                <option value="" disabled>
                  Select Ending Period
                </option>
                {allPeriods.map((p) => (
                  <option key={`comp-${p}`} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Row */}
      <div
        className={`mt-4 pt-3 border-t flex flex-wrap items-center gap-2 ${
          isDark ? 'border-slate-800' : 'border-slate-100'
        }`}
      >
        <span
          className={`text-xs font-medium flex items-center gap-1 mr-1 ${
            isDark ? 'text-slate-400' : 'text-slate-600'
          }`}
        >
          <Filter className="w-3 h-3 text-slate-400" /> Filter Data (optional):
        </span>

        {config.filters.length === 0 && (
          <span className="text-[11px] text-slate-400 italic">
            No filters applied (analyzing full dataset)
          </span>
        )}

        {config.filters.map((f, idx) => (
          <span
            key={`${f.column}-${f.value}-${idx}`}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs border ${
              isDark
                ? 'bg-slate-800 border-slate-700 text-slate-200'
                : 'bg-slate-100 border-slate-300 text-slate-800'
            }`}
          >
            <span className="text-slate-400">{f.column}:</span>
            <strong className="text-indigo-500 font-semibold">{f.value}</strong>
            <button
              onClick={() => handleRemoveFilter(idx)}
              className="text-slate-400 hover:text-rose-500 transition ml-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}

        {/* Add Filter */}
        <div className="flex items-center gap-1.5 ml-auto">
          <select
            value={filterCol}
            onChange={(e) => {
              setFilterCol(e.target.value);
              setFilterVal('');
            }}
            className={`text-xs rounded px-2 py-1 border focus:outline-none ${
              isDark
                ? 'bg-slate-800 border-slate-700 text-slate-300'
                : 'bg-slate-50 border-slate-300 text-slate-700'
            }`}
          >
            <option value="">Filter by column...</option>
            {dimensionColumns.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          {filterCol && (
            <select
              value={filterVal}
              onChange={(e) => setFilterVal(e.target.value)}
              className={`text-xs rounded px-2 py-1 border focus:outline-none max-w-[140px] ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-slate-300'
                  : 'bg-slate-50 border-slate-300 text-slate-700'
              }`}
            >
              <option value="">Pick value...</option>
              {availableFilterValues.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          )}

          {filterCol && filterVal && (
            <button
              onClick={handleAddFilter}
              className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white flex items-center gap-1 transition"
            >
              <Plus className="w-3 h-3" /> Apply
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
