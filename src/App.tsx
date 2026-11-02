import React, { useState, useMemo, useEffect } from 'react';
import { SAMPLE_DATASETS } from './data/sampleDatasets';
import { parseCsvContent } from './utils/csvParser';
import { runContributionInvestigation } from './utils/contributionEngine';
import {
  InvestigationConfig,
  SegmentContribution,
} from './types';
import { Header } from './components/Header';
import { InvestigationConfigBar } from './components/InvestigationConfigBar';
import { SummaryCards } from './components/SummaryCards';
import { WaterfallChart } from './components/WaterfallChart';
import { TimeSeriesAnomalyChart } from './components/TimeSeriesAnomalyChart';
import { ContributionRankingTable } from './components/ContributionRankingTable';
import { MultiDimensionMatrix } from './components/MultiDimensionMatrix';
import { AiInvestigationReport } from './components/AiInvestigationReport';
import { CausalMethodologyGuide } from './components/CausalMethodologyGuide';
import { DataHealthInspector } from './components/DataHealthInspector';
import { MathFormulaModal } from './components/MathFormulaModal';
import { EvidenceRowsModal } from './components/EvidenceRowsModal';
import { ExportDossierModal } from './components/ExportDossierModal';
import { ThemeProvider, useTheme } from './context/ThemeContext';

function MainApp() {
  const { isDark } = useTheme();

  // Active dataset state
  const [currentDatasetId, setCurrentDatasetId] = useState<string>('retail-revenue');
  const [customCsv, setCustomCsv] = useState<string | null>(null);
  const [customDatasetName, setCustomDatasetName] = useState<string>('Custom Upload');

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<
    'investigate' | 'multi-dim' | 'ai-report' | 'causal-lab' | 'data-quality'
  >('investigate');

  // Modals state
  const [isMathModalOpen, setIsMathModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [mathModalSegment, setMathModalSegment] = useState<SegmentContribution | null>(null);

  // Evidence Rows drilldown modal state
  const [evidenceSegmentName, setEvidenceSegmentName] = useState<string | null>(null);

  // AI report generation state
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [isGeneratingAiReport, setIsGeneratingAiReport] = useState(false);
  const [aiReportError, setAiReportError] = useState<string | null>(null);

  // Get raw CSV text based on dataset selection
  const rawCsvContent = useMemo(() => {
    if (currentDatasetId === 'custom' && customCsv) {
      return customCsv;
    }
    const found = SAMPLE_DATASETS.find((ds) => ds.id === currentDatasetId);
    return found ? found.rawCsv : SAMPLE_DATASETS[0].rawCsv;
  }, [currentDatasetId, customCsv]);

  // Current dataset metadata
  const currentDatasetMeta = useMemo(() => {
    if (currentDatasetId === 'custom') {
      return {
        id: 'custom',
        name: customDatasetName,
        industry: 'Custom Data',
        scenario: 'User uploaded custom business dataset.',
        fileName: 'custom_upload.csv',
        rawCsv: customCsv || '',
        description: 'Uploaded CSV dataset',
      };
    }
    return (
      SAMPLE_DATASETS.find((ds) => ds.id === currentDatasetId) || SAMPLE_DATASETS[0]
    );
  }, [currentDatasetId, customCsv, customDatasetName]);

  // Parse CSV
  const parsedData = useMemo(() => {
    return parseCsvContent(rawCsvContent);
  }, [rawCsvContent]);

  const { rows, headers, qualityReport } = parsedData;

  // Categorize columns
  const numericColumns = useMemo(
    () => qualityReport.columns.filter((c) => c.type === 'number'),
    [qualityReport]
  );
  const dimensionColumns = useMemo(
    () => qualityReport.columns.filter((c) => c.type === 'category' || c.type === 'boolean'),
    [qualityReport]
  );
  const periodColumns = useMemo(
    () =>
      qualityReport.columns.filter(
        (c) =>
          c.type === 'date' ||
          ['date', 'quarter', 'month', 'week', 'period', 'year'].includes(
            c.name.toLowerCase()
          )
      ),
    [qualityReport]
  );

  const effectivePeriodColumns =
    periodColumns.length > 0
      ? periodColumns
      : dimensionColumns.length > 0
      ? [dimensionColumns[0]]
      : qualityReport.columns;

  const [config, setConfig] = useState<InvestigationConfig>(() => {
    return {
      metricColumn: '',
      metricLabel: '',
      metricUnit: '$',
      aggregation: 'sum',
      periodColumn: '',
      basePeriod: '',
      compPeriod: '',
      selectedDimensions: [],
      activeDimension: '',
      filters: [],
    };
  });

  // Whenever dataset changes, reset investigation config sensibly
  useEffect(() => {
    const numCol = numericColumns[0]?.name || headers[0] || '';
    const perCol = effectivePeriodColumns[0]?.name || headers[0] || '';

    const distinctPeriods = Array.from(
      new Set(rows.map((r) => String(r[perCol] ?? '')).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    let base = distinctPeriods[0] || '';
    let comp = distinctPeriods[1] || distinctPeriods[0] || '';

    if (currentDatasetId === 'retail-revenue') {
      base = '2024-Q2';
      comp = '2024-Q3';
    } else if (currentDatasetId === 'saas-churn') {
      base = '2024-05';
      comp = '2024-06';
    } else if (currentDatasetId === 'logistics-delays') {
      base = 'W42';
      comp = 'W43';
    } else if (currentDatasetId === 'edge-cases-stress') {
      base = 'Period_1';
      comp = 'Period_2';
    } else if (distinctPeriods.length >= 2) {
      base = distinctPeriods[distinctPeriods.length - 2];
      comp = distinctPeriods[distinctPeriods.length - 1];
    }

    const dims = dimensionColumns.map((c) => c.name);
    const activeDim = dims[0] || headers[0] || '';

    let unit = '$';
    if (numCol.toLowerCase().includes('count') || numCol.toLowerCase().includes('orders') || numCol.toLowerCase().includes('units')) {
      unit = 'units';
    } else if (numCol.toLowerCase().includes('rate') || numCol.toLowerCase().includes('%')) {
      unit = '%';
    }

    setConfig({
      metricColumn: numCol,
      metricLabel: numCol,
      metricUnit: unit,
      aggregation: 'sum',
      periodColumn: perCol,
      basePeriod: base,
      compPeriod: comp,
      selectedDimensions: dims,
      activeDimension: activeDim,
      filters: [],
    });

    setAiReport(null);
    setAiReportError(null);
  }, [currentDatasetId, rawCsvContent]);

  const allPeriods = useMemo(() => {
    if (!config.periodColumn) return [];
    return Array.from(
      new Set(rows.map((r) => String(r[config.periodColumn] ?? '')).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [rows, config.periodColumn]);

  const investigationSummary = useMemo(() => {
    if (!config.metricColumn || !config.periodColumn || !config.basePeriod || !config.compPeriod) {
      return null;
    }
    return runContributionInvestigation(rows, config);
  }, [rows, config]);

  const activeAnalysis = useMemo(() => {
    if (!investigationSummary) return null;
    return (
      investigationSummary.dimensionAnalyses[config.activeDimension] ||
      Object.values(investigationSummary.dimensionAnalyses)[0] ||
      null
    );
  }, [investigationSummary, config.activeDimension]);

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        setCustomCsv(text);
        setCustomDatasetName(file.name.replace(/\.[^/.]+$/, ''));
        setCurrentDatasetId('custom');
      }
    };
    reader.readAsText(file);
  };

  const handleGenerateAiReport = async () => {
    if (!investigationSummary || !activeAnalysis) return;
    setIsGeneratingAiReport(true);
    setAiReportError(null);

    try {
      const response = await fetch('/api/investigate/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metricName: investigationSummary.metricName,
          metricUnit: investigationSummary.metricUnit,
          basePeriodLabel: investigationSummary.basePeriod,
          compPeriodLabel: investigationSummary.compPeriod,
          totalBase: investigationSummary.totalBase,
          totalComp: investigationSummary.totalComp,
          totalChange: investigationSummary.totalChange,
          totalPctChange: investigationSummary.totalPctChange,
          reconciliationStatus: activeAnalysis.isReconciled
            ? 'Balanced (100% of delta accounted for)'
            : `Non-additive aggregation discrepancy: ${activeAnalysis.reconciliationDiscrepancy.toFixed(2)}`,
          dimensionAnalyses: investigationSummary.dimensionAnalyses,
          anomalies: investigationSummary.timeSeries.filter((t) => t.isAnomaly),
          filtersApplied: investigationSummary.filtersApplied,
        }),
      });

      const data = await response.json();
      if (data.report) {
        setAiReport(data.report);
      } else {
        throw new Error(data.error || 'Failed to generate report from AI model');
      }
    } catch (err: any) {
      console.error(err);
      setAiReportError(err.message || 'Error communicating with AI service');
    } finally {
      setIsGeneratingAiReport(false);
    }
  };

  const handleExportCsv = () => {
    if (!activeAnalysis) return;
    const headerRow = [
      'Segment',
      `Start_${investigationSummary?.basePeriod}`,
      `End_${investigationSummary?.compPeriod}`,
      'Net_Change',
      'Growth_Pct',
      'Contribution_Pct',
      'Classification',
    ];

    const dataRows = activeAnalysis.segments.map((s) => [
      `"${s.segmentName.replace(/"/g, '""')}"`,
      s.baseValue,
      s.compValue,
      s.absChange,
      s.pctChange !== null ? s.pctChange.toFixed(2) : 'N/A',
      s.contributionPct.toFixed(2),
      s.classification,
    ]);

    const csvContent = [headerRow.join(','), ...dataRows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `contribution_${investigationSummary?.metricName}_${activeAnalysis.dimension}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Top Header */}
      <Header
        currentDatasetId={currentDatasetId}
        onSelectDataset={setCurrentDatasetId}
        onOpenUploadModal={() => setActiveTab('data-quality')}
        onOpenMathModal={() => {
          setMathModalSegment(null);
          setIsMathModalOpen(true);
        }}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onExportCsv={handleExportCsv}
        isGeneratingAiReport={isGeneratingAiReport}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Investigation Configuration Controls (Always visible unless in data quality tab) */}
        {activeTab !== 'data-quality' && (
          <InvestigationConfigBar
            config={config}
            onChangeConfig={setConfig}
            numericColumns={numericColumns}
            dimensionColumns={dimensionColumns}
            periodColumns={effectivePeriodColumns}
            allPeriods={allPeriods}
            scenarioDescription={currentDatasetMeta.scenario}
            rawData={rows}
          />
        )}

        {/* Tab 1: Overview & Drivers */}
        {activeTab === 'investigate' && investigationSummary && activeAnalysis && (
          <div className="space-y-6">
            <SummaryCards
              summary={investigationSummary}
              activeAnalysis={activeAnalysis}
              onOpenMathModal={() => {
                setMathModalSegment(activeAnalysis.topDetractor);
                setIsMathModalOpen(true);
              }}
            />

            <WaterfallChart
              analysis={activeAnalysis}
              basePeriodLabel={investigationSummary.basePeriod}
              compPeriodLabel={investigationSummary.compPeriod}
              metricUnit={investigationSummary.metricUnit}
              onSelectSegment={(seg) => setEvidenceSegmentName(seg)}
            />

            <ContributionRankingTable
              analysis={activeAnalysis}
              metricName={investigationSummary.metricName}
              metricUnit={investigationSummary.metricUnit}
              basePeriodLabel={investigationSummary.basePeriod}
              compPeriodLabel={investigationSummary.compPeriod}
              onInspectEvidence={(seg) => setEvidenceSegmentName(seg)}
              onAuditSegmentMath={(seg) => {
                setMathModalSegment(seg);
                setIsMathModalOpen(true);
              }}
            />

            <TimeSeriesAnomalyChart
              timeSeries={investigationSummary.timeSeries}
              metricName={investigationSummary.metricName}
              metricUnit={investigationSummary.metricUnit}
              onSetBasePeriod={(p) => setConfig({ ...config, basePeriod: p })}
              onSetCompPeriod={(p) => setConfig({ ...config, compPeriod: p })}
            />
          </div>
        )}

        {/* Tab 2: Compare All Dimensions */}
        {activeTab === 'multi-dim' && investigationSummary && (
          <MultiDimensionMatrix
            summary={investigationSummary}
            selectedDimensions={config.selectedDimensions}
            activeDimension={config.activeDimension}
            onSelectDimension={(dim) => setConfig({ ...config, activeDimension: dim })}
            onDrilldownSegment={(dim, val) => {
              const otherDims = config.selectedDimensions.filter((d) => d !== dim);
              setConfig({
                ...config,
                filters: [...config.filters, { column: dim, value: val }],
                activeDimension: otherDims[0] || dim,
              });
              setActiveTab('investigate');
            }}
            onOpenMathModal={() => setIsMathModalOpen(true)}
          />
        )}

        {/* Tab 3: Grounded AI Report & Assistant */}
        {activeTab === 'ai-report' && investigationSummary && (
          <AiInvestigationReport
            summary={investigationSummary}
            isGenerating={isGeneratingAiReport}
            onGenerateReport={handleGenerateAiReport}
            reportContent={aiReport}
            reportError={aiReportError}
          />
        )}

        {/* Tab 4: Causal Safeguards Lab */}
        {activeTab === 'causal-lab' && <CausalMethodologyGuide />}

        {/* Tab 5: Data Quality & Profiler */}
        {activeTab === 'data-quality' && (
          <DataHealthInspector
            qualityReport={qualityReport}
            rawData={rows}
            headers={headers}
            datasetName={currentDatasetMeta.name}
            onFileUpload={handleFileUpload}
          />
        )}
      </main>

      {/* Math Transparency Modal */}
      {investigationSummary && (
        <MathFormulaModal
          isOpen={isMathModalOpen}
          onClose={() => setIsMathModalOpen(false)}
          selectedSegment={mathModalSegment}
          totalChange={investigationSummary.totalChange}
          totalBase={investigationSummary.totalBase}
          totalComp={investigationSummary.totalComp}
          metricUnit={investigationSummary.metricUnit}
        />
      )}

      {/* Evidence Rows Modal */}
      {evidenceSegmentName && activeAnalysis && (
        <EvidenceRowsModal
          isOpen={Boolean(evidenceSegmentName)}
          onClose={() => setEvidenceSegmentName(null)}
          segmentName={evidenceSegmentName}
          dimensionName={activeAnalysis.dimension}
          metricColumn={config.metricColumn}
          periodColumn={config.periodColumn}
          basePeriod={config.basePeriod}
          compPeriod={config.compPeriod}
          rows={rows}
          headers={headers}
        />
      )}

      {/* Export Dossier Modal */}
      {investigationSummary && activeAnalysis && (
        <ExportDossierModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          summary={investigationSummary}
          activeAnalysis={activeAnalysis}
          aiReport={aiReport}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <MainApp />
    </ThemeProvider>
  );
}
