import React, { useState } from 'react';
import {
  ShieldAlert,
  GitBranch,
  Scale,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const CausalMethodologyGuide: React.FC = () => {
  const { isDark } = useTheme();

  // Simpson's Paradox Interactive Sandbox State
  const [mobileTraffic, setMobileTraffic] = useState(8000);
  const [mobileConv, setMobileConv] = useState(2.0); // %
  const [desktopTraffic, setDesktopTraffic] = useState(2000);
  const [desktopConv, setDesktopConv] = useState(8.0); // %

  const [t1MobileTraffic, setT1MobileTraffic] = useState(14000);
  const [t1MobileConv, setT1MobileConv] = useState(2.5); // Mobile conv improved
  const [t1DesktopTraffic, setT1DesktopTraffic] = useState(1000);
  const [t1DesktopConv, setT1DesktopConv] = useState(9.0); // Desktop conv improved

  const t0TotalTraffic = mobileTraffic + desktopTraffic;
  const t0TotalOrders = (mobileTraffic * mobileConv) / 100 + (desktopTraffic * desktopConv) / 100;
  const t0AggregateConv = t0TotalTraffic > 0 ? (t0TotalOrders / t0TotalTraffic) * 100 : 0;

  const t1TotalTraffic = t1MobileTraffic + t1DesktopTraffic;
  const t1TotalOrders = (t1MobileTraffic * t1MobileConv) / 100 + (t1DesktopTraffic * t1DesktopConv) / 100;
  const t1AggregateConv = t1TotalTraffic > 0 ? (t1TotalOrders / t1TotalTraffic) * 100 : 0;

  const aggregateDelta = t1AggregateConv - t0AggregateConv;
  const isSimpsonsParadox =
    t1MobileConv > mobileConv && t1DesktopConv > desktopConv && aggregateDelta < 0;

  return (
    <div className="space-y-6">
      {/* Intro Banner */}
      <div
        className={`rounded-xl p-5 border transition-colors shadow-xs ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0">
            <Scale className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h2
              className={`text-base font-bold ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              Why &quot;Where&quot; is Not the Same as &quot;Why&quot; (Cause vs. Correlation)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-3xl">
              Finding which segment dropped is like finding which room in your house has an open window. It tells you <strong>where</strong> the cold is coming from, but not <strong>why</strong> the window opened. Never confuse mathematical contribution with operational cause!
            </p>
          </div>
        </div>
      </div>

      {/* The 3 Levels */}
      <div
        className={`rounded-xl p-5 border transition-colors shadow-xs space-y-4 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <h3
          className={`text-sm font-bold flex items-center gap-2 ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}
        >
          <GitBranch className="w-4 h-4 text-indigo-500" />
          The 3 Levels of Business Evidence
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Level 1 */}
          <div
            className={`rounded-xl p-4 space-y-2 border ${
              isDark
                ? 'bg-slate-950/80 border-indigo-500/40'
                : 'bg-indigo-50/50 border-indigo-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                Level 1: Observing
              </span>
              <span className="text-[10px] bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded font-semibold">
                What this app does
              </span>
            </div>
            <h4
              className={`text-sm font-bold ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              &quot;What happened?&quot;
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              &quot;Electronics in North America drove 80% of our revenue drop.&quot;
            </p>
            <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800">
              Observation only. No causal proof.
            </div>
          </div>

          {/* Level 2 */}
          <div
            className={`rounded-xl p-4 space-y-2 border ${
              isDark
                ? 'bg-slate-950/80 border-slate-800'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                Level 2: Testing
              </span>
              <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded font-semibold">
                A/B Experiments
              </span>
            </div>
            <h4
              className={`text-sm font-bold ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              &quot;What if we intervene?&quot;
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              &quot;If we restore stock in warehouse X, do sales recover compared to a control group?&quot;
            </p>
            <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800">
              Requires controlled test or rollout.
            </div>
          </div>

          {/* Level 3 */}
          <div
            className={`rounded-xl p-4 space-y-2 border ${
              isDark
                ? 'bg-slate-950/80 border-slate-800'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                Level 3: What-If
              </span>
              <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded font-semibold">
                Causal Models
              </span>
            </div>
            <h4
              className={`text-sm font-bold ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              &quot;What would have happened?&quot;
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              &quot;Would cancellations have stayed low if we hadn&apos;t raised prices by $5?&quot;
            </p>
            <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800">
              Requires counterfactual analysis.
            </div>
          </div>
        </div>
      </div>

      {/* Simpson's Paradox Simulator */}
      <div
        className={`rounded-xl p-5 border transition-colors shadow-xs space-y-4 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3
              className={`text-sm font-bold flex items-center gap-2 ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              <Lightbulb className="w-4 h-4 text-amber-500" />
              Interactive Demo: How Traffic Shifts Can Fool Managers (Simpson&apos;s Paradox)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              See how an overall conversion rate can DROP even when every single segment&apos;s conversion rate IMPROVED.
            </p>
          </div>
          {isSimpsonsParadox && (
            <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-semibold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
              Paradox Active!
            </span>
          )}
        </div>

        {/* Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            className={`rounded-xl p-4 space-y-3 border ${
              isDark
                ? 'bg-slate-950/70 border-slate-800'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="font-bold text-xs text-blue-500 flex items-center justify-between border-b pb-1.5 border-slate-200 dark:border-slate-800">
              <span>Starting Period (T0)</span>
              <span className="font-mono text-sm">
                Overall: {t0AggregateConv.toFixed(2)}%
              </span>
            </div>
            <div className="space-y-2 text-xs">
              <div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400 mb-1">
                  <span>Mobile: {mobileTraffic.toLocaleString()} visits @ {mobileConv}%</span>
                  <span className="font-mono font-semibold">
                    {((mobileTraffic * mobileConv) / 100).toFixed(0)} orders
                  </span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="15000"
                  step="500"
                  value={mobileTraffic}
                  onChange={(e) => setMobileTraffic(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400 mb-1">
                  <span>Desktop: {desktopTraffic.toLocaleString()} visits @ {desktopConv}%</span>
                  <span className="font-mono font-semibold">
                    {((desktopTraffic * desktopConv) / 100).toFixed(0)} orders
                  </span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="15000"
                  step="500"
                  value={desktopTraffic}
                  onChange={(e) => setDesktopTraffic(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>
            </div>
          </div>

          <div
            className={`rounded-xl p-4 space-y-3 border ${
              isDark
                ? 'bg-slate-950/70 border-slate-800'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="font-bold text-xs text-emerald-500 flex items-center justify-between border-b pb-1.5 border-slate-200 dark:border-slate-800">
              <span>Ending Period (T1)</span>
              <span
                className={`font-mono text-sm font-bold ${
                  aggregateDelta < 0 ? 'text-rose-500' : 'text-emerald-500'
                }`}
              >
                Overall: {t1AggregateConv.toFixed(2)}% ({aggregateDelta > 0 ? '+' : ''}
                {aggregateDelta.toFixed(2)}%)
              </span>
            </div>
            <div className="space-y-2 text-xs">
              <div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400 mb-1">
                  <span>
                    Mobile: {t1MobileTraffic.toLocaleString()} visits @{' '}
                    <strong className="text-emerald-500">{t1MobileConv}%</strong> (was {mobileConv}%)
                  </span>
                  <span className="font-mono font-semibold">
                    {((t1MobileTraffic * t1MobileConv) / 100).toFixed(0)} orders
                  </span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="20000"
                  step="500"
                  value={t1MobileTraffic}
                  onChange={(e) => setT1MobileTraffic(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400 mb-1">
                  <span>
                    Desktop: {t1DesktopTraffic.toLocaleString()} visits @{' '}
                    <strong className="text-emerald-500">{t1DesktopConv}%</strong> (was {desktopConv}%)
                  </span>
                  <span className="font-mono font-semibold">
                    {((t1DesktopTraffic * t1DesktopConv) / 100).toFixed(0)} orders
                  </span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="10000"
                  step="500"
                  value={t1DesktopTraffic}
                  onChange={(e) => setT1DesktopConv(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div
          className={`p-3.5 rounded-lg border text-xs leading-relaxed ${
            isDark
              ? 'bg-slate-950 border-slate-800 text-slate-300'
              : 'bg-slate-100 border-slate-200 text-slate-700'
          }`}
        >
          <strong className={isDark ? 'text-white' : 'text-slate-900'}>
            The Lesson for Business Leaders:
          </strong>{' '}
          Both mobile conversion improved (2% &rarr; 2.5%) and desktop conversion improved (8% &rarr; 9%). Yet the total conversion fell! Why? Because traffic shifted toward Mobile. This is a <strong>mix shift</strong>, not a product breakdown.
        </div>
      </div>

      {/* 6 Questions to Ask */}
      <div
        className={`rounded-xl p-5 border transition-colors shadow-xs space-y-4 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <h3
          className={`text-sm font-bold flex items-center gap-2 ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-emerald-500" />
          6 Questions to Ask Before Declaring a &quot;Root Cause&quot;
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {[
            {
              title: '1. Outside Events',
              desc: 'Did a competitor promotion, macro economy, or holiday weekend drive both the traffic drop and segment drop?',
            },
            {
              title: '2. Customer Shift',
              desc: 'Did users stop buying Item A because they bought our new Item B instead (cannibalization)?',
            },
            {
              title: '3. Reverse Order',
              desc: 'Did we cut ad spend because sales dropped, or did sales drop because we cut ad spend?',
            },
            {
              title: '4. Selection Effect',
              desc: 'Are new customers just behaving differently from older, loyal customers?',
            },
            {
              title: '5. Baseline Anomaly',
              desc: 'Was the starting period unusually inflated due to a one-off viral spike?',
            },
            {
              title: '6. Control Group Test',
              desc: 'Can we run a small A/B test or pilot before making expensive organizational changes?',
            },
          ].map((item, idx) => (
            <div
              key={`item-${idx}`}
              className={`p-3.5 rounded-lg border space-y-1 ${
                isDark
                  ? 'bg-slate-950/70 border-slate-800'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="font-bold text-indigo-500">{item.title}</div>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
