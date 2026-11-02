export type ColumnType = 'date' | 'number' | 'category' | 'boolean' | 'unknown';

export interface ColumnProfile {
  name: string;
  type: ColumnType;
  sampleValues: (string | number)[];
  nullCount: number;
  nullPct: number;
  uniqueCount: number;
  zeroCount: number;
  negativeCount: number;
  min?: number;
  max?: number;
  mean?: number;
}

export interface DataQualityReport {
  totalRows: number;
  totalColumns: number;
  duplicateRowCount: number;
  missingCellsCount: number;
  missingCellsPct: number;
  columns: ColumnProfile[];
  warnings: string[];
}

export interface Dataset {
  id: string;
  name: string;
  description?: string;
  industry: string;
  scenario: string;
  rawCsv: string;
  fileName: string;
}

export type AggregationType = 'sum' | 'avg' | 'count';

export interface InvestigationFilter {
  column: string;
  value: string;
}

export interface InvestigationConfig {
  metricColumn: string;
  metricLabel: string;
  metricUnit: string;
  aggregation: AggregationType;
  periodColumn: string;
  basePeriod: string;
  compPeriod: string;
  selectedDimensions: string[];
  activeDimension: string;
  filters: InvestigationFilter[];
}

export interface SegmentContribution {
  segmentName: string;
  baseValue: number;
  compValue: number;
  absChange: number;
  pctChange: number | null; // null if base is zero
  contributionPct: number; // (delta_i / delta_total) * 100
  grossSharePct: number; // (|delta_i| / sum(|delta|)) * 100 (always 0 to 100%)
  shareOfBase: number; // (base_i / base_total) * 100
  shareOfComp: number; // (comp_i / comp_total) * 100
  classification: 'primary_detractor' | 'secondary_detractor' | 'mitigating' | 'neutral';
  recordCountBase: number;
  recordCountComp: number;
  zeroBaseline: boolean;
}

export interface DimensionAnalysis {
  dimension: string;
  segments: SegmentContribution[];
  totalBase: number;
  totalComp: number;
  totalChange: number;
  reconciliationDiscrepancy: number; // totalChange - sum(segment_delta)
  isReconciled: boolean;
  topDetractor: SegmentContribution | null;
  topMitigator: SegmentContribution | null;
  concentrationScore: number; // Herfindahl index of contributions
  hasOffsettingSwings: boolean; // true if any segment has >100% of net change due to positive/negative cancellations
  maxAbsContributionPct: number;
}

export interface TimeSeriesPoint {
  period: string;
  value: number;
  count: number;
  isAnomaly: boolean;
  zScore: number;
  isBasePeriod: boolean;
  isCompPeriod: boolean;
}

export interface InvestigationSummary {
  metricName: string;
  metricUnit: string;
  basePeriod: string;
  compPeriod: string;
  totalBase: number;
  totalComp: number;
  totalChange: number;
  totalPctChange: number | null;
  zeroBaselineTotal: boolean;
  activeDimension: string;
  dimensionAnalyses: Record<string, DimensionAnalysis>;
  timeSeries: TimeSeriesPoint[];
  allPeriods: string[];
  filtersApplied: InvestigationFilter[];
}
