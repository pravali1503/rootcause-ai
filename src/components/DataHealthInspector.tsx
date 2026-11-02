import React, { useRef, useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  UploadCloud,
  FileSpreadsheet,
  Table,
  Eye,
} from 'lucide-react';
import { DataQualityReport } from '../types';
import { useTheme } from '../context/ThemeContext';

interface DataHealthInspectorProps {
  qualityReport: DataQualityReport;
  rawData: Record<string, any>[];
  headers: string[];
  datasetName: string;
  onFileUpload: (file: File) => void;
}

export const DataHealthInspector: React.FC<DataHealthInspectorProps> = ({
  qualityReport,
  rawData,
  headers,
  datasetName,
  onFileUpload,
}) => {
  const { isDark } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewLimit, setPreviewLimit] = useState(15);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload & Dropzone Header */}
      <div
        className={`rounded-xl p-5 border transition-colors shadow-xs space-y-4 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2
              className={`text-base font-bold flex items-center gap-2 ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-sky-500" />
              Dataset Quality &amp; Structure
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Active File: <strong className={isDark ? 'text-white' : 'text-slate-800'}>{datasetName}</strong> ({qualityReport.totalRows} rows, {qualityReport.totalColumns} columns)
            </p>
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white flex items-center gap-2 transition"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload New CSV File</span>
          </button>
        </div>

        {/* Drag and drop zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
            isDragging
              ? 'border-indigo-500 bg-indigo-50/10'
              : isDark
              ? 'border-slate-800 hover:border-slate-700 bg-slate-950/50'
              : 'border-slate-300 hover:border-slate-400 bg-slate-50'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv,text/csv"
            className="hidden"
          />
          <FileSpreadsheet className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
          <p
            className={`text-xs font-bold ${
              isDark ? 'text-slate-200' : 'text-slate-800'
            }`}
          >
            Click or drag &amp; drop any CSV file here
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Automatically reads column types, checks for missing data, and prepares it for investigation.
          </p>
        </div>
      </div>

      {/* 4 Health Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          className={`rounded-xl p-4 border transition-colors shadow-xs ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="text-xs text-slate-400">Total Rows</div>
          <div
            className={`text-2xl font-bold font-mono mt-1 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            {qualityReport.totalRows.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Data records</div>
        </div>

        <div
          className={`rounded-xl p-4 border transition-colors shadow-xs ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="text-xs text-slate-400">Duplicate Rows</div>
          <div
            className={`text-2xl font-bold font-mono mt-1 ${
              qualityReport.duplicateRowCount > 0 ? 'text-amber-500' : 'text-emerald-500'
            }`}
          >
            {qualityReport.duplicateRowCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {qualityReport.duplicateRowCount > 0 ? 'Duplicate rows found' : 'No duplicates'}
          </div>
        </div>

        <div
          className={`rounded-xl p-4 border transition-colors shadow-xs ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="text-xs text-slate-400">Missing Values</div>
          <div
            className={`text-2xl font-bold font-mono mt-1 ${
              qualityReport.missingCellsPct > 5 ? 'text-rose-500' : 'text-emerald-500'
            }`}
          >
            {qualityReport.missingCellsPct.toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {qualityReport.missingCellsCount} empty cells
          </div>
        </div>

        <div
          className={`rounded-xl p-4 border transition-colors shadow-xs ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="text-xs text-slate-400">Total Columns</div>
          <div className="text-2xl font-bold font-mono text-indigo-500 mt-1">
            {qualityReport.totalColumns}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {qualityReport.columns.filter((c) => c.type === 'number').length} numeric metrics
          </div>
        </div>
      </div>

      {/* Warnings List */}
      {qualityReport.warnings.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Things to Note About This Data ({qualityReport.warnings.length})
          </div>
          <ul className="list-disc pl-5 text-xs text-amber-700 dark:text-amber-300 space-y-1">
            {qualityReport.warnings.map((w, idx) => (
              <li key={`warn-${idx}`}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Column Schema Table */}
      <div
        className={`rounded-xl overflow-hidden border transition-colors shadow-xs ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div
          className={`px-5 py-3 border-b font-bold text-xs flex items-center justify-between ${
            isDark ? 'border-slate-800 bg-slate-950/60 text-white' : 'border-slate-200 bg-slate-50 text-slate-900'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Table className="w-3.5 h-3.5 text-indigo-500" />
            Columns Detected &amp; Value Summary
          </span>
          <span className="text-slate-400 font-normal">
            {qualityReport.columns.length} columns
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead>
              <tr
                className={`border-b font-sans font-semibold text-slate-500 ${
                  isDark ? 'border-slate-800 bg-slate-950/40' : 'border-slate-200 bg-slate-50/50'
                }`}
              >
                <th className="py-2.5 px-4">Column Name</th>
                <th className="py-2.5 px-4">Type</th>
                <th className="py-2.5 px-4 text-right">Distinct Values</th>
                <th className="py-2.5 px-4 text-right">Empty Cells</th>
                <th className="py-2.5 px-4 text-right">Range / Mean</th>
                <th className="py-2.5 px-4">Sample Values</th>
              </tr>
            </thead>
            <tbody
              className={`divide-y ${
                isDark ? 'divide-slate-800/60' : 'divide-slate-100'
              }`}
            >
              {qualityReport.columns.map((col) => (
                <tr
                  key={col.name}
                  className={`transition ${
                    isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'
                  }`}
                >
                  <td
                    className={`py-2.5 px-4 font-bold font-sans ${
                      isDark ? 'text-slate-200' : 'text-slate-900'
                    }`}
                  >
                    {col.name}
                  </td>
                  <td className="py-2.5 px-4">
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded font-sans font-semibold uppercase ${
                        col.type === 'number'
                          ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                          : col.type === 'date'
                          ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20'
                          : 'bg-slate-500/10 text-slate-500'
                      }`}
                    >
                      {col.type}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-right text-slate-400">
                    {col.uniqueCount}
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    <span
                      className={
                        col.nullCount > 0 ? 'text-amber-500 font-bold' : 'text-slate-400'
                      }
                    >
                      {col.nullCount} ({col.nullPct.toFixed(0)}%)
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-right text-slate-400">
                    {col.type === 'number' && col.min !== undefined && col.max !== undefined ? (
                      <span>
                        [{col.min.toLocaleString()} &hellip; {col.max.toLocaleString()}]
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-slate-400 truncate max-w-xs font-sans text-[11px]">
                    {col.sampleValues.slice(0, 3).join(', ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Raw Data Preview */}
      <div
        className={`rounded-xl overflow-hidden border transition-colors shadow-xs ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div
          className={`px-5 py-3 border-b font-bold text-xs flex items-center justify-between ${
            isDark ? 'border-slate-800 bg-slate-950/60 text-white' : 'border-slate-200 bg-slate-50 text-slate-900'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-indigo-500" />
            Data Preview (First {Math.min(previewLimit, rawData.length)} rows)
          </span>
          <button
            onClick={() => setPreviewLimit((prev) => (prev === 15 ? 50 : 15))}
            className="text-xs text-indigo-500 hover:text-indigo-600 transition"
          >
            {previewLimit === 15 ? 'Show 50 rows' : 'Show 15 rows'}
          </button>
        </div>

        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr
                className={`border-b font-semibold text-slate-400 sticky top-0 ${
                  isDark ? 'border-slate-800 bg-slate-950/90' : 'border-slate-200 bg-slate-100/90'
                }`}
              >
                <th className="py-2 px-3">#</th>
                {headers.map((h) => (
                  <th key={h} className="py-2 px-3 whitespace-nowrap">
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
              {rawData.slice(0, previewLimit).map((row, idx) => (
                <tr
                  key={`raw-${idx}`}
                  className={`transition ${
                    isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'
                  }`}
                >
                  <td className="py-1.5 px-3 text-slate-400 font-sans">{idx + 1}</td>
                  {headers.map((h) => (
                    <td
                      key={h}
                      className={`py-1.5 px-3 whitespace-nowrap ${
                        isDark ? 'text-slate-300' : 'text-slate-700'
                      }`}
                    >
                      {row[h] === null || row[h] === undefined
                        ? 'null'
                        : String(row[h])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
