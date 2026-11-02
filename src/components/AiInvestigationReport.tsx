import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Loader2,
  FileText,
  AlertTriangle,
  HelpCircle,
  RefreshCw,
  Copy,
  Check,
} from 'lucide-react';
import { InvestigationSummary } from '../types';
import { useTheme } from '../context/ThemeContext';

interface AiInvestigationReportProps {
  summary: InvestigationSummary;
  isGenerating: boolean;
  onGenerateReport: () => void;
  reportContent: string | null;
  reportError: string | null;
}

export const AiInvestigationReport: React.FC<AiInvestigationReportProps> = ({
  summary,
  isGenerating,
  onGenerateReport,
  reportContent,
  reportError,
}) => {
  const { isDark } = useTheme();
  const [question, setQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [qaHistory, setQaHistory] = useState<{ q: string; a: string }[]>([]);
  const [copied, setCopied] = useState(false);

  const handleAskQuestion = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!question.trim() || isAsking) return;

    const userQ = question.trim();
    setQuestion('');
    setIsAsking(true);

    try {
      const response = await fetch('/api/investigate/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userQ,
          context: {
            metric: summary.metricName,
            basePeriod: summary.basePeriod,
            compPeriod: summary.compPeriod,
            totalBase: summary.totalBase,
            totalComp: summary.totalComp,
            totalChange: summary.totalChange,
            totalPctChange: summary.totalPctChange,
            dimensionAnalyses: summary.dimensionAnalyses,
            anomalies: summary.timeSeries.filter((t) => t.isAnomaly),
          },
        }),
      });

      const data = await response.json();
      if (data.answer) {
        setQaHistory((prev) => [...prev, { q: userQ, a: data.answer }]);
      } else {
        setQaHistory((prev) => [
          ...prev,
          { q: userQ, a: 'Unable to process question against current context.' },
        ]);
      }
    } catch (err: any) {
      setQaHistory((prev) => [
        ...prev,
        { q: userQ, a: `Error: ${err.message || 'Network error'}` },
      ]);
    } finally {
      setIsAsking(false);
    }
  };

  const handleCopyReport = () => {
    if (!reportContent) return;
    navigator.clipboard.writeText(reportContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div
        className={`rounded-xl p-5 border transition-colors shadow-xs ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-pink-500" />
              <h2
                className={`text-base font-bold ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                AI Root-Cause Executive Summary
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Synthesizes your computed numbers into clear takeaways. Distinguishes verified facts from unverified business hypotheses.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {reportContent && (
              <button
                onClick={handleCopyReport}
                className={`px-3 py-2 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition ${
                  isDark
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            )}

            <button
              onClick={onGenerateReport}
              disabled={isGenerating}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-90 text-xs font-semibold text-white shadow-xs flex items-center gap-2 transition disabled:opacity-50 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing Data...</span>
                </>
              ) : reportContent ? (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>Regenerate Summary</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate AI Summary</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Error state */}
      {reportError && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 text-xs text-rose-600 dark:text-rose-300 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
          <div>
            <strong className="font-semibold block mb-0.5">Could not generate summary:</strong>
            {reportError}
          </div>
        </div>
      )}

      {/* Report Content Box */}
      {reportContent ? (
        <div
          className={`rounded-xl p-6 border transition-colors shadow-xs space-y-4 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div
            className={`flex items-center justify-between border-b pb-3 ${
              isDark ? 'border-slate-800' : 'border-slate-200'
            }`}
          >
            <span className="text-xs uppercase tracking-wider font-bold text-indigo-500 flex items-center gap-1.5">
              <FileText className="w-4 h-4" /> Executive Investigation Brief
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              Grounded in {summary.metricName} (&Delta; = {summary.totalChange.toLocaleString()})
            </span>
          </div>

          <div
            className={`text-xs leading-relaxed space-y-4 font-sans ${
              isDark ? 'text-slate-200' : 'text-slate-800'
            }`}
          >
            {reportContent.split('\n\n').map((paragraph, idx) => {
              if (paragraph.startsWith('### ')) {
                return (
                  <h3
                    key={`h-${idx}`}
                    className={`text-sm font-bold border-b pt-3 pb-1 flex items-center gap-2 ${
                      isDark
                        ? 'text-indigo-300 border-slate-800'
                        : 'text-indigo-700 border-slate-200'
                    }`}
                  >
                    {paragraph.replace('### ', '')}
                  </h3>
                );
              }
              if (paragraph.startsWith('## ')) {
                return (
                  <h2
                    key={`h-${idx}`}
                    className={`text-base font-bold border-b pt-4 pb-1 ${
                      isDark
                        ? 'text-purple-300 border-slate-800'
                        : 'text-purple-700 border-slate-200'
                    }`}
                  >
                    {paragraph.replace('## ', '')}
                  </h2>
                );
              }

              if (paragraph.startsWith('- ') || paragraph.startsWith('* ')) {
                const items = paragraph.split('\n').filter((l) => l.trim().length > 0);
                return (
                  <ul key={`ul-${idx}`} className="list-disc pl-5 space-y-1.5">
                    {items.map((item, iIdx) => {
                      const cleanItem = item.replace(/^[-*]\s+/, '');
                      const isHypothesis = cleanItem.includes('[UNVERIFIED HYPOTHESIS]');
                      return (
                        <li key={`li-${iIdx}`}>
                          {isHypothesis ? (
                            <span>
                              <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/20 text-[10px] font-mono mr-1.5 font-bold uppercase">
                                Idea to Test
                              </span>
                              {cleanItem.replace('[UNVERIFIED HYPOTHESIS]', '').trim()}
                            </span>
                          ) : (
                            cleanItem
                          )}
                        </li>
                      );
                    })}
                  </ul>
                );
              }

              return <p key={`p-${idx}`}>{paragraph}</p>;
            })}
          </div>
        </div>
      ) : !isGenerating ? (
        <div
          className={`rounded-xl p-12 text-center space-y-3 border border-dashed ${
            isDark
              ? 'bg-slate-900/40 border-slate-800'
              : 'bg-slate-50 border-slate-300'
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-500 mx-auto flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3
            className={`text-sm font-bold ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            No Summary Generated Yet
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Click &quot;Generate AI Summary&quot; above to have the AI write an executive summary distinguishing verified facts from potential business reasons.
          </p>
        </div>
      ) : null}

      {/* Ask the Data Question Box */}
      <div
        className={`rounded-xl p-5 border transition-colors shadow-xs space-y-4 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div>
          <h3
            className={`text-sm font-bold flex items-center gap-2 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-indigo-500" />
            Ask Questions About Your Data
          </h3>
          <p className="text-xs text-slate-400">
            Type any question in plain English. The AI looks directly at the verified numbers.
          </p>
        </div>

        {/* Preset sample questions */}
        <div className="flex flex-wrap gap-1.5">
          <span className="text-[11px] text-slate-400 self-center mr-1">Try asking:</span>
          {[
            'Which segment had the biggest drop?',
            'Did any segment grow while others fell?',
            'Is the drop focused in one area or spread out?',
            'What should we check next to find the real cause?',
          ].map((promptText) => (
            <button
              key={promptText}
              onClick={() => {
                setQuestion(promptText);
              }}
              className={`text-[11px] px-2.5 py-1 rounded-md transition border ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
            >
              {promptText}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleAskQuestion} className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. Which product drove the decline in North America?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={isAsking}
            className={`flex-1 text-xs rounded-lg px-3.5 py-2.5 border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              isDark
                ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
                : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
            }`}
          />
          <button
            type="submit"
            disabled={!question.trim() || isAsking}
            className="px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white flex items-center gap-1.5 transition disabled:opacity-40"
          >
            {isAsking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span>Ask</span>
          </button>
        </form>

        {/* Q&A History */}
        {qaHistory.length > 0 && (
          <div
            className={`space-y-3 pt-3 border-t ${
              isDark ? 'border-slate-800' : 'border-slate-200'
            }`}
          >
            {qaHistory.map((qa, idx) => (
              <div
                key={`qa-${idx}`}
                className={`rounded-lg p-3 text-xs space-y-1.5 border ${
                  isDark
                    ? 'bg-slate-950/70 border-slate-800'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="font-semibold text-indigo-500 flex items-center gap-1.5">
                  <span className="text-slate-400">Q:</span> {qa.q}
                </div>
                <div
                  className={`leading-relaxed pl-3 border-l-2 border-indigo-500/40 font-sans ${
                    isDark ? 'text-slate-200' : 'text-slate-800'
                  }`}
                >
                  {qa.a}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
