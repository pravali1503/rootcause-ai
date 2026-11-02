import Papa from 'papaparse';
import { ColumnProfile, ColumnType, DataQualityReport } from '../types';

export interface ParsedCsvData {
  rows: Record<string, any>[];
  headers: string[];
  qualityReport: DataQualityReport;
}

export function parseCsvContent(rawCsv: string): ParsedCsvData {
  const parsed = Papa.parse(rawCsv, {
    header: true,
    dynamicTyping: false,
    skipEmptyLines: 'greedy',
    transformHeader: (h) => h.trim(),
  });

  const rawRows = parsed.data as Record<string, string>[];
  const headers = parsed.meta.fields || (rawRows[0] ? Object.keys(rawRows[0]) : []);

  // Duplicate row detection
  const rowStrings = new Set<string>();
  let duplicateRowCount = 0;
  for (const row of rawRows) {
    const s = JSON.stringify(row);
    if (rowStrings.has(s)) {
      duplicateRowCount++;
    } else {
      rowStrings.add(s);
    }
  }

  // Profile each column
  let totalMissingCells = 0;
  const warnings: string[] = [];
  const columns: ColumnProfile[] = [];

  for (const header of headers) {
    let nullCount = 0;
    let zeroCount = 0;
    let negativeCount = 0;
    const uniqueValues = new Set<string>();
    const numericValues: number[] = [];
    const sampleValues: (string | number)[] = [];

    let numericCandidateCount = 0;
    let dateCandidateCount = 0;

    for (const row of rawRows) {
      const val = row[header];
      if (val === undefined || val === null || String(val).trim() === '') {
        nullCount++;
        totalMissingCells++;
        continue;
      }

      const strVal = String(val).trim();
      uniqueValues.add(strVal);
      if (sampleValues.length < 5) {
        sampleValues.push(strVal);
      }

      // Check numeric
      const cleanNumStr = strVal.replace(/[$,%]/g, '');
      const num = Number(cleanNumStr);
      if (!isNaN(num) && cleanNumStr !== '') {
        numericCandidateCount++;
        numericValues.push(num);
        if (num === 0) zeroCount++;
        if (num < 0) negativeCount++;
      }

      // Check date patterns (e.g. 2024-01-01, 2024-Q1, W42, 2024-03)
      if (
        /^\d{4}[-/]\d{1,2}([-/]\d{1,2})?$/.test(strVal) ||
        /^\d{4}-Q[1-4]$/i.test(strVal) ||
        /^W\d{1,2}$/i.test(strVal) ||
        /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[- ]\d{2,4}$/i.test(strVal) ||
        !isNaN(Date.parse(strVal)) && isNaN(Number(strVal))
      ) {
        dateCandidateCount++;
      }
    }

    const validCount = rawRows.length - nullCount;
    let type: ColumnType = 'category';

    if (validCount > 0 && numericCandidateCount / validCount > 0.85) {
      type = 'number';
    } else if (validCount > 0 && dateCandidateCount / validCount > 0.8) {
      type = 'date';
    } else if (uniqueValues.size <= 2 && Array.from(uniqueValues).every(v => ['true', 'false', '0', '1', 'yes', 'no'].includes(v.toLowerCase()))) {
      type = 'boolean';
    }

    // Numeric metrics
    let min: number | undefined;
    let max: number | undefined;
    let mean: number | undefined;

    if (type === 'number' && numericValues.length > 0) {
      min = Math.min(...numericValues);
      max = Math.max(...numericValues);
      const sum = numericValues.reduce((acc, curr) => acc + curr, 0);
      mean = sum / numericValues.length;
    }

    const nullPct = rawRows.length > 0 ? (nullCount / rawRows.length) * 100 : 0;

    if (nullPct > 15) {
      warnings.push(`Column '${header}' has high missingness (${nullPct.toFixed(1)}% missing).`);
    }

    columns.push({
      name: header,
      type,
      sampleValues,
      nullCount,
      nullPct,
      uniqueCount: uniqueValues.size,
      zeroCount,
      negativeCount,
      min,
      max,
      mean,
    });
  }

  if (duplicateRowCount > 0) {
    warnings.push(`Found ${duplicateRowCount} duplicate row(s) in this dataset.`);
  }

  const totalCells = rawRows.length * headers.length;
  const missingCellsPct = totalCells > 0 ? (totalMissingCells / totalCells) * 100 : 0;

  // Transform rows to clean typed values
  const cleanedRows = rawRows.map(row => {
    const cleanRow: Record<string, any> = {};
    for (const col of columns) {
      const rawVal = row[col.name];
      if (rawVal === undefined || rawVal === null || String(rawVal).trim() === '') {
        cleanRow[col.name] = null;
      } else if (col.type === 'number') {
        const cleanStr = String(rawVal).replace(/[$,%]/g, '').trim();
        const n = Number(cleanStr);
        cleanRow[col.name] = isNaN(n) ? null : n;
      } else {
        cleanRow[col.name] = String(rawVal).trim();
      }
    }
    return cleanRow;
  });

  return {
    rows: cleanedRows,
    headers,
    qualityReport: {
      totalRows: rawRows.length,
      totalColumns: headers.length,
      duplicateRowCount,
      missingCellsCount: totalMissingCells,
      missingCellsPct,
      columns,
      warnings,
    },
  };
}
