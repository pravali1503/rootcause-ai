import React from 'react';
import {
  Activity,
  FileSpreadsheet,
  Download,
  Scale,
  Sparkles,
  BookOpen,
  UploadCloud,
  Sun,
  Moon,
  Layers,
  ShieldCheck,
  Printer,
  Calculator,
} from 'lucide-react';
import { SAMPLE_DATASETS } from '../data/sampleDatasets';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  currentDatasetId: string;
  onSelectDataset: (datasetId: string) => void;
  onOpenUploadModal: () => void;
  onOpenMathModal: () => void;
  onOpenExportModal: () => void;
  activeTab: 'investigate' | 'multi-dim' | 'ai-report' | 'causal-lab' | 'data-quality';
  setActiveTab: (tab: 'investigate' | 'multi-dim' | 'ai-report' | 'causal-lab' | 'data-quality') => void;
  onExportCsv: () => void;
  isGeneratingAiReport: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentDatasetId,
  onSelectDataset,
  onOpenUploadModal,
  onOpenMathModal,
  onOpenExportModal,
  activeTab,
  setActiveTab,
  onExportCsv,
  isGeneratingAiReport,
}) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header
      className={`border-b sticky top-0 z-40 transition-colors backdrop-blur ${
        isDark
          ? 'bg-slate-900/90 border-slate-800 text-slate-100'
          : 'bg-white/90 border-slate-200 text-slate-900 shadow-xs'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Identity */}
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-sm">
              <div
                className={`h-full w-full rounded-[10px] flex items-center justify-center ${
                  isDark ? 'bg-slate-950' : 'bg-white'
                }`}
              >
                <Activity className="h-4.5 w-4.5 text-indigo-500" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight">
                  RootCause<span className="text-indigo-500">IQ</span>
                </span>
                <span
                  className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    isDark
                      ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                      : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  }`}
                >
                  Simple &amp; Accurate
                </span>
              </div>
              <p
                className={`text-[11px] hidden sm:block ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                Find what drove the change in your business numbers
              </p>
            </div>
          </div>

          {/* Dataset Switcher & Upload */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={currentDatasetId}
                onChange={(e) => {
                  if (e.target.value === '__upload__') {
                    onOpenUploadModal();
                  } else {
                    onSelectDataset(e.target.value);
                  }
                }}
                className={`text-xs rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer transition font-medium ${
                  isDark
                    ? 'bg-slate-800 border border-slate-700 text-slate-200 hover:border-slate-600'
                    : 'bg-slate-100 border border-slate-300 text-slate-700 hover:border-slate-400'
                }`}
              >
                <optgroup label="Sample Business Scenarios">
                  {SAMPLE_DATASETS.map((ds) => (
                    <option key={ds.id} value={ds.id}>
                      {ds.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Custom Data">
                  <option value="__upload__">+ Upload your own CSV...</option>
                  {currentDatasetId === 'custom' && (
                    <option value="custom">Active Custom Upload</option>
                  )}
                </optgroup>
              </select>
              <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>

            <button
              onClick={onOpenUploadModal}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                isDark
                  ? 'bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'
                  : 'bg-slate-100 border border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-200'
              }`}
              title="Upload your own CSV"
            >
              <UploadCloud className="w-3.5 h-3.5 text-indigo-500" />
              <span className="hidden md:inline">Upload</span>
            </button>
          </div>

          {/* Actions & Theme Toggle */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg text-xs transition border flex items-center gap-1 ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-700'
                  : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
              }`}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Theme"
            >
              {isDark ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="text-[11px] font-medium hidden md:inline">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-slate-600" />
                  <span className="text-[11px] font-medium hidden md:inline">Dark</span>
                </>
              )}
            </button>

            {/* How it's calculated */}
            <button
              onClick={onOpenMathModal}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition flex items-center gap-1.5 ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'
                  : 'bg-slate-100 border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-200'
              }`}
              title="Show exact formulas and calculation steps"
            >
              <Calculator className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden lg:inline">How It&#39;s Calculated</span>
            </button>

            {/* CSV Export */}
            <button
              onClick={onExportCsv}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition flex items-center gap-1.5 ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                  : 'bg-slate-100 border-slate-300 text-slate-700 hover:text-slate-900'
              }`}
              title="Download results as CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">CSV</span>
            </button>

            {/* Print / Report */}
            <button
              onClick={onOpenExportModal}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-xs transition flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Report</span>
            </button>
          </div>
        </div>

        {/* Simplified Navigation Tabs */}
        <div
          className={`flex space-x-1 border-t -mb-px overflow-x-auto py-1 ${
            isDark ? 'border-slate-800' : 'border-slate-200'
          }`}
        >
          <button
            onClick={() => setActiveTab('investigate')}
            className={`px-3.5 py-2 text-xs font-medium rounded-md whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'investigate'
                ? isDark
                  ? 'bg-slate-800 text-indigo-300 border border-slate-700 shadow-xs'
                  : 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs font-semibold'
                : isDark
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            1. Overview &amp; Drivers
          </button>

          <button
            onClick={() => setActiveTab('multi-dim')}
            className={`px-3.5 py-2 text-xs font-medium rounded-md whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'multi-dim'
                ? isDark
                  ? 'bg-slate-800 text-indigo-300 border border-slate-700 shadow-xs'
                  : 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs font-semibold'
                : isDark
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            2. Compare All Dimensions
          </button>

          <button
            onClick={() => setActiveTab('ai-report')}
            className={`px-3.5 py-2 text-xs font-medium rounded-md whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'ai-report'
                ? isDark
                  ? 'bg-slate-800 text-indigo-300 border border-slate-700 shadow-xs'
                  : 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs font-semibold'
                : isDark
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-pink-500" />
            3. AI Summary &amp; Q&amp;A
            {isGeneratingAiReport && (
              <span className="inline-block w-1.5 h-1.5 bg-pink-500 rounded-full animate-ping" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('causal-lab')}
            className={`px-3.5 py-2 text-xs font-medium rounded-md whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'causal-lab'
                ? isDark
                  ? 'bg-slate-800 text-indigo-300 border border-slate-700 shadow-xs'
                  : 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs font-semibold'
                : isDark
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
            4. Why vs. Where (Cause vs. Correlation)
          </button>

          <button
            onClick={() => setActiveTab('data-quality')}
            className={`px-3.5 py-2 text-xs font-medium rounded-md whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'data-quality'
                ? isDark
                  ? 'bg-slate-800 text-indigo-300 border border-slate-700 shadow-xs'
                  : 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs font-semibold'
                : isDark
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-sky-500" />
            Data Health &amp; Upload
          </button>
        </div>
      </div>
    </header>
  );
};
