import React from 'react';
import { X, Calculator, CheckCircle2, BookOpen } from 'lucide-react';
import { SegmentContribution } from '../types';
import { formatMetricNumber } from '../utils/contributionEngine';
import { useTheme } from '../context/ThemeContext';

interface MathFormulaModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSegment?: SegmentContribution | null;
  totalChange: number;
  totalBase: number;
  totalComp: number;
  metricUnit: string;
}

export const MathFormulaModal: React.FC<MathFormulaModalProps> = ({
  isOpen,
  onClose,
  selectedSegment,
  totalChange,
  totalBase,
  totalComp,
  metricUnit,
}) => {
  const { isDark } = useTheme();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div
        className={`rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border ${
          isDark
            ? 'bg-slate-900 border-slate-700 text-slate-200'
            : 'bg-white border-slate-300 text-slate-800'
        }`}
      >
        {/* Header */}
        <div
          className={`px-6 py-4 border-b flex items-center justify-between ${
            isDark ? 'border-slate-800 bg-slate-950/70' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-amber-500" />
            <h3
              className={`text-base font-bold ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              How It&#39;s Calculated (Plain English Math)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 space-y-6 text-xs leading-relaxed">
          {/* Active Segment Calculation Walkthrough */}
          {selectedSegment && (
            <div
              className={`rounded-xl p-4 space-y-3 border ${
                isDark
                  ? 'bg-amber-950/30 border-amber-800/50'
                  : 'bg-amber-50/70 border-amber-200'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-amber-700 dark:text-amber-400 text-sm">
                <CheckCircle2 className="w-4 h-4 text-amber-500" />
                Step-by-step example for: &quot;{selectedSegment.segmentName}&quot;
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-[11px]">
                <div
                  className={`p-2.5 rounded-lg border ${
                    isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-white border-slate-200'
                  }`}
                >
                  <span className="text-slate-400 block mb-0.5 font-sans">
                    1. Segment Starting Value:
                  </span>
                  <span className="font-bold">
                    {formatMetricNumber(selectedSegment.baseValue, metricUnit, 2)}
                  </span>
                </div>
                <div
                  className={`p-2.5 rounded-lg border ${
                    isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-white border-slate-200'
                  }`}
                >
                  <span className="text-slate-400 block mb-0.5 font-sans">
                    2. Segment Ending Value:
                  </span>
                  <span className="font-bold">
                    {formatMetricNumber(selectedSegment.compValue, metricUnit, 2)}
                  </span>
                </div>
                <div
                  className={`p-2.5 rounded-lg border ${
                    isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-white border-slate-200'
                  }`}
                >
                  <span className="text-slate-400 block mb-0.5 font-sans">
                    3. Segment Net Change:
                  </span>
                  <span className="text-amber-600 dark:text-amber-400 font-bold">
                    {selectedSegment.absChange > 0 ? '+' : ''}
                    {formatMetricNumber(selectedSegment.absChange, metricUnit, 2)}
                  </span>
                </div>
                <div
                  className={`p-2.5 rounded-lg border ${
                    isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-white border-slate-200'
                  }`}
                >
                  <span className="text-slate-400 block mb-0.5 font-sans">
                    4. Overall Metric Change:
                  </span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                    {totalChange > 0 ? '+' : ''}
                    {formatMetricNumber(totalChange, metricUnit, 2)}
                  </span>
                </div>
              </div>

              <div
                className={`p-3 rounded-lg border font-mono text-[11px] ${
                  isDark
                    ? 'bg-slate-950 border-slate-800 text-slate-200'
                    : 'bg-white border-slate-200 text-slate-800'
                }`}
              >
                <div className="text-slate-400 font-sans mb-1">Calculation:</div>
                <div>Share of Change = (Segment Change / Total Change) &times; 100%</div>
                <div className="mt-1 text-amber-600 dark:text-amber-400 font-bold">
                  Share = ({selectedSegment.absChange.toFixed(2)} / {totalChange.toFixed(2)}) &times; 100% = {selectedSegment.contributionPct.toFixed(1)}%
                </div>
              </div>
            </div>
          )}

          {/* Simple Explanations */}
          <div className="space-y-4">
            <h4
              className={`text-sm font-bold border-b pb-2 ${
                isDark ? 'text-white border-slate-800' : 'text-slate-900 border-slate-200'
              }`}
            >
              3 Simple Rules That Keep the Numbers Honest
            </h4>

            {/* Rule 1 */}
            <div
              className={`rounded-lg p-3.5 space-y-1 border ${
                isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <strong className="text-indigo-600 dark:text-indigo-400 text-xs block">
                1. The Numbers Always Balance (100% Accounted For)
              </strong>
              <p className="text-slate-500 dark:text-slate-400 text-xs">
                When you sum the changes across all categories (like all regions or all products), they equal the exact total change in your business. No missing money, no rounding tricks.
              </p>
            </div>

            {/* Rule 2 */}
            <div
              className={`rounded-lg p-3.5 space-y-2 border ${
                isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <strong className="text-amber-600 dark:text-amber-400 text-xs block">
                2. What Does 1,060% (or Any Number Over 100%) of Change Mean?
              </strong>
              <p className="text-slate-500 dark:text-slate-400 text-xs">
                A percentage over 100% (such as 1,060%) happens whenever <strong>some segments grow while others fall</strong>, canceling each other out and making the final net change small.
              </p>
              <div
                className={`p-3 rounded-lg border font-mono text-[11px] space-y-1 ${
                  isDark
                    ? 'bg-slate-900 border-slate-800 text-slate-300'
                    : 'bg-white border-slate-200 text-slate-800'
                }`}
              >
                <div><strong>Real Example:</strong></div>
                <div>• Suppose total company revenue drops by only <strong className="text-rose-500">-$10,000</strong> net.</div>
                <div>• But Segment A plunged by <strong className="text-rose-500">-$106,000</strong>.</div>
                <div>• Meanwhile, Segment B grew by <strong className="text-emerald-500">+$96,000</strong>.</div>
                <div className="pt-1 border-t border-slate-700/40 dark:border-slate-800">
                  Segment A&#39;s Share = (-$106,000 / -$10,000) = <strong className="text-amber-500">10.6x = 1,060%</strong>
                </div>
                <div>
                  Segment B&#39;s Offset = (+$96,000 / -$10,000) = <strong className="text-emerald-500">-960%</strong>
                </div>
                <div className="text-indigo-500 font-bold pt-0.5">
                  Sum: 1,060% + (-960%) = 100.0%
                </div>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-xs">
                <strong>Plain English Meaning:</strong> Segment A fell by <strong>10.6 times the size of the final net total</strong>, but the growth in other areas absorbed most of that decline before it hit the bottom line.
              </p>
            </div>

            {/* Rule 3 */}
            <div
              className={`rounded-lg p-3.5 space-y-1 border ${
                isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <strong className="text-emerald-600 dark:text-emerald-400 text-xs block">
                3. What Happens If a Segment Started at 0?
              </strong>
              <p className="text-slate-500 dark:text-slate-400 text-xs">
                When a new product launches, its starting value is $0. You can&apos;t divide by zero to get a growth rate (+&infin;%), so this app tags it as &quot;New from 0&quot; while accurately counting its exact dollar contribution.
              </p>
            </div>

            {/* Key takeaway */}
            <div
              className={`rounded-xl p-4 space-y-2 border ${
                isDark
                  ? 'bg-indigo-950/40 border-indigo-800/40'
                  : 'bg-indigo-50 border-indigo-200'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-indigo-700 dark:text-indigo-300 text-sm">
                <BookOpen className="w-4 h-4 text-indigo-500" />
                The Difference Between &quot;Where&quot; and &quot;Why&quot;
              </div>
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                Finding that North America drove 80% of a drop tells you <strong>where</strong> the drop showed up. But finding out <strong>why</strong> (e.g., website checkout bug? competitor coupon? shipping delay?) requires operational investigation, surveys, or A/B tests.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
