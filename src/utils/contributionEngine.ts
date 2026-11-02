import {
  AggregationType,
  DimensionAnalysis,
  InvestigationConfig,
  InvestigationSummary,
  SegmentContribution,
  TimeSeriesPoint,
} from '../types';

function computeAggregate(values: number[], agg: AggregationType): number {
  if (values.length === 0) return 0;
  if (agg === 'count') return values.length;
  const sum = values.reduce((acc, curr) => acc + curr, 0);
  if (agg === 'avg') return sum / values.length;
  return sum; // default 'sum'
}

export function runContributionInvestigation(
  rows: Record<string, any>[],
  config: InvestigationConfig
): InvestigationSummary {
  const {
    metricColumn,
    metricLabel,
    metricUnit,
    aggregation,
    periodColumn,
    basePeriod,
    compPeriod,
    selectedDimensions,
    activeDimension,
    filters,
  } = config;

  // 1. Filter rows by active filters
  let filteredRows = rows;
  if (filters && filters.length > 0) {
    filteredRows = rows.filter((row) =>
      filters.every((f) => String(row[f.column]) === String(f.value))
    );
  }

  // 2. Discover all distinct periods
  const periodMap = new Map<string, number[]>();
  for (const row of filteredRows) {
    const p = String(row[periodColumn] ?? '');
    if (!p) continue;
    const val = row[metricColumn];
    const num = typeof val === 'number' && !isNaN(val) ? val : 0;
    if (!periodMap.has(p)) {
      periodMap.set(p, []);
    }
    periodMap.get(p)!.push(num);
  }

  const allPeriods = Array.from(periodMap.keys()).sort((a, b) => {
    // Natural or chronological sort
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
  });

  // 3. Compute time series aggregates and detect anomalies
  const periodAggregates: { period: string; value: number; count: number }[] = [];
  for (const period of allPeriods) {
    const vals = periodMap.get(period) || [];
    const aggVal = computeAggregate(vals, aggregation);
    periodAggregates.push({
      period,
      value: aggVal,
      count: vals.length,
    });
  }

  // Anomaly calculation via Z-score
  const valuesArray = periodAggregates.map((p) => p.value);
  const n = valuesArray.length;
  const mean = n > 0 ? valuesArray.reduce((a, b) => a + b, 0) / n : 0;
  const variance =
    n > 1
      ? valuesArray.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / (n - 1)
      : 0;
  const stdDev = Math.sqrt(variance);

  const timeSeries: TimeSeriesPoint[] = periodAggregates.map((p) => {
    const zScore = stdDev > 0 ? (p.value - mean) / stdDev : 0;
    const isAnomaly = Math.abs(zScore) >= 1.75;
    return {
      period: p.period,
      value: p.value,
      count: p.count,
      zScore,
      isAnomaly,
      isBasePeriod: p.period === basePeriod,
      isCompPeriod: p.period === compPeriod,
    };
  });

  // 4. Compute Totals for Base (T0) and Comp (T1)
  const baseRows = filteredRows.filter(
    (r) => String(r[periodColumn]) === basePeriod
  );
  const compRows = filteredRows.filter(
    (r) => String(r[periodColumn]) === compPeriod
  );

  const baseValues = baseRows
    .map((r) => r[metricColumn])
    .filter((v): v is number => typeof v === 'number' && !isNaN(v));
  const compValues = compRows
    .map((r) => r[metricColumn])
    .filter((v): v is number => typeof v === 'number' && !isNaN(v));

  const totalBase = computeAggregate(baseValues, aggregation);
  const totalComp = computeAggregate(compValues, aggregation);
  const totalChange = totalComp - totalBase;

  const zeroBaselineTotal = totalBase === 0;
  let totalPctChange: number | null = null;
  if (!zeroBaselineTotal) {
    totalPctChange = (totalChange / Math.abs(totalBase)) * 100;
  }

  // 5. Decompose by each dimension
  const dimensionAnalyses: Record<string, DimensionAnalysis> = {};

  for (const dim of selectedDimensions) {
    // Collect all distinct segments in base or comp
    const segmentNamesSet = new Set<string>();
    for (const r of baseRows) {
      segmentNamesSet.add(String(r[dim] ?? 'Unknown / Missing'));
    }
    for (const r of compRows) {
      segmentNamesSet.add(String(r[dim] ?? 'Unknown / Missing'));
    }

    const segments: SegmentContribution[] = [];

    for (const segName of segmentNamesSet) {
      const segBaseRows = baseRows.filter(
        (r) => String(r[dim] ?? 'Unknown / Missing') === segName
      );
      const segCompRows = compRows.filter(
        (r) => String(r[dim] ?? 'Unknown / Missing') === segName
      );

      const segBaseVals = segBaseRows
        .map((r) => r[metricColumn])
        .filter((v): v is number => typeof v === 'number' && !isNaN(v));
      const segCompVals = segCompRows
        .map((r) => r[metricColumn])
        .filter((v): v is number => typeof v === 'number' && !isNaN(v));

      const segBase = computeAggregate(segBaseVals, aggregation);
      const segComp = computeAggregate(segCompVals, aggregation);
      const absChange = segComp - segBase;

      const zeroBaseline = segBase === 0;
      let pctChange: number | null = null;
      if (!zeroBaseline) {
        pctChange = (absChange / Math.abs(segBase)) * 100;
      }

      // Contribution to total delta
      // C_i = (delta_i / delta_total) * 100
      let contributionPct = 0;
      if (Math.abs(totalChange) > 1e-9) {
        contributionPct = (absChange / totalChange) * 100;
      }

      const shareOfBase = totalBase !== 0 ? (segBase / totalBase) * 100 : 0;
      const shareOfComp = totalComp !== 0 ? (segComp / totalComp) * 100 : 0;

      // Classification
      let classification: SegmentContribution['classification'] = 'neutral';
      const isNegativeTrend = totalChange < 0;

      if (Math.abs(absChange) < 1e-6) {
        classification = 'neutral';
      } else if (isNegativeTrend) {
        // Drop scenario: negative changes are detractors
        if (absChange < 0) {
          classification =
            Math.abs(contributionPct) >= 20 ? 'primary_detractor' : 'secondary_detractor';
        } else {
          classification = 'mitigating';
        }
      } else {
        // Growth scenario: positive changes are primary drivers
        if (absChange > 0) {
          classification =
            contributionPct >= 20 ? 'primary_detractor' : 'secondary_detractor';
        } else {
          classification = 'mitigating';
        }
      }

      segments.push({
        segmentName: segName,
        baseValue: segBase,
        compValue: segComp,
        absChange,
        pctChange,
        contributionPct,
        grossSharePct: 0, // populated below after totalAbsDelta is computed
        shareOfBase,
        shareOfComp,
        classification,
        recordCountBase: segBaseRows.length,
        recordCountComp: segCompRows.length,
        zeroBaseline,
      });
    }

    // Sort segments by impact magnitude (largest absolute change first)
    segments.sort((a, b) => Math.abs(b.absChange) - Math.abs(a.absChange));

    // Calculate total absolute gross movement
    const totalAbsDelta = segments.reduce((acc, s) => acc + Math.abs(s.absChange), 0);

    // Populate grossSharePct (bounded 0% to 100%)
    for (const seg of segments) {
      seg.grossSharePct = totalAbsDelta > 0 ? (Math.abs(seg.absChange) / totalAbsDelta) * 100 : 0;
    }

    // Reconciliation check
    const sumSegmentDelta = segments.reduce((sum, s) => sum + s.absChange, 0);
    const discrepancy = totalChange - sumSegmentDelta;
    const isReconciled = Math.abs(discrepancy) < 0.01;

    // Identify top detractor & top mitigator
    let topDetractor: SegmentContribution | null = null;
    let topMitigator: SegmentContribution | null = null;

    if (totalChange < 0) {
      const detractors = segments.filter((s) => s.absChange < 0);
      if (detractors.length > 0) topDetractor = detractors[0];
      const mitigators = segments.filter((s) => s.absChange > 0);
      if (mitigators.length > 0) topMitigator = mitigators[0];
    } else {
      const drivers = segments.filter((s) => s.absChange > 0);
      if (drivers.length > 0) topDetractor = drivers[0];
      const drags = segments.filter((s) => s.absChange < 0);
      if (drags.length > 0) topMitigator = drags[0];
    }

    // Concentration Score (HHI of absolute delta weights: sum(w_i^2))
    let concentrationScore = 0;
    if (totalAbsDelta > 0) {
      concentrationScore = segments.reduce((acc, s) => {
        const weight = Math.abs(s.absChange) / totalAbsDelta;
        return acc + weight * weight;
      }, 0);
    }

    const maxAbsContributionPct = Math.max(
      ...segments.map((s) => Math.abs(s.contributionPct)),
      0
    );
    const hasOffsettingSwings =
      maxAbsContributionPct > 100.5 || (Math.abs(totalChange) > 0 && totalAbsDelta > 1.5 * Math.abs(totalChange));

    dimensionAnalyses[dim] = {
      dimension: dim,
      segments,
      totalBase,
      totalComp,
      totalChange,
      reconciliationDiscrepancy: discrepancy,
      isReconciled,
      topDetractor,
      topMitigator,
      concentrationScore,
      hasOffsettingSwings,
      maxAbsContributionPct,
    };
  }

  return {
    metricName: metricLabel || metricColumn,
    metricUnit: metricUnit || '',
    basePeriod,
    compPeriod,
    totalBase,
    totalComp,
    totalChange,
    totalPctChange,
    zeroBaselineTotal,
    activeDimension: activeDimension || selectedDimensions[0] || '',
    dimensionAnalyses,
    timeSeries,
    allPeriods,
    filtersApplied: filters,
  };
}

export function formatMetricNumber(
  num: number,
  unit: string = '',
  decimals: number = 0
): string {
  if (num === null || num === undefined || isNaN(num)) return 'N/A';
  const abs = Math.abs(num);
  let formatted = '';

  if (abs >= 1_000_000) {
    formatted = `${(num / 1_000_000).toFixed(decimals > 0 ? decimals : 2)}M`;
  } else if (abs >= 10_000) {
    formatted = `${(num / 1_000).toFixed(decimals > 0 ? decimals : 1)}k`;
  } else {
    formatted = num.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  if (unit === '$' || unit === 'USD') {
    return num < 0 ? `-$${formatted.replace('-', '')}` : `$${formatted}`;
  }
  return unit ? `${formatted} ${unit}` : formatted;
}
