import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '20mb' }));

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Endpoint: Generate Grounded Root-Cause & Contribution Report
app.post('/api/investigate/report', async (req, res) => {
  try {
    const {
      metricName,
      metricUnit,
      basePeriodLabel,
      compPeriodLabel,
      totalBase,
      totalComp,
      totalChange,
      totalPctChange,
      dimensionAnalyses,
      anomalies,
      filtersApplied,
      reconciliationStatus,
    } = req.body;

    const prompt = `
You are a Principal Business Analytics Director and Causal Methodologist. 
You are writing an Executive Root-Cause & Contribution Investigation Report for leadership.

CRITICAL METHODOLOGICAL MANDATE:
You MUST maintain a strict, unambiguous distinction between MATHEMATICAL CONTRIBUTION (which segments mathematically explain the delta) and CAUSAL ROOT CAUSES (the true real-world driving mechanism). Finding that a segment accounted for 80% of a revenue drop is an empirical observation of concentration, NOT proof of why it occurred.

INVESTIGATION CONTEXT & COMPUTED DATA:
- Metric: ${metricName || 'Primary Metric'} (${metricUnit || 'Value'})
- Baseline Period (T0): ${basePeriodLabel} (Value: ${totalBase})
- Comparison Period (T1): ${compPeriodLabel} (Value: ${totalComp})
- Total Net Change: ${totalChange} (${totalPctChange}%)
- Mathematical Reconciliation Status: ${reconciliationStatus || 'Reconciled'}
- Active Filters: ${JSON.stringify(filtersApplied || [])}
- Time Series Anomalies Flagged: ${JSON.stringify(anomalies || [])}

DIMENSION CONTRIBUTION SUMMARIES:
${JSON.stringify(dimensionAnalyses, null, 2)}

Provide your response in structured Markdown with these exact sections:

### 1. Executive Summary & Mathematical Findings
- Explicitly state the overall delta and % change.
- Detail the top detractor segments (segments pulling the metric down) and top mitigating contributors (segments that cushioned the fall or outperformed).
- Quote the exact computed contribution percentages and dollar/unit values. NEVER invent or hallucinate figures outside the provided data.

### 2. Multi-Dimensional Concentration & Interaction
- Synthesize findings across the analyzed dimensions (e.g. cross-referencing product, customer tier, channel, or region).
- Is the change broad-based or hyper-concentrated in specific sub-pockets?

### 3. Competing Plausible Hypotheses (Non-Causal Observations)
- Formulate 3 to 4 distinct, plausible real-world mechanisms that could explain the observed numbers (e.g., pricing shift, supply shock, seasonal cliff, customer attrition, competitive displacement, UX funnel bug).
- Mark each explicitly as an [UNVERIFIED HYPOTHESIS].
- Highlight potential cannibalization or mix effects if visible.

### 4. The Causal Gap & Missing Variables
- Explain why these numbers alone CANNOT prove causality.
- List specific confounding variables, omitted data, or external factors that are NOT captured in this dataset (e.g. ad spend, competitor promos, macroeconomic shifts, outage incidents).

### 5. Recommended Empirical Verification Roadmap
- Propose 3-4 concrete actions to validate the true root cause before taking irreversible business decisions:
  - e.g., A/B tests or quasi-experiments
  - Qualitative customer outreach / exit surveys on the affected segment
  - Systems log and pricing audit
  - Difference-in-Differences against an unaffected control cohort.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    res.json({ report: response.text });
  } catch (error: any) {
    console.error('Error generating report:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate investigation report',
    });
  }
});

// Endpoint: Natural Language Analytical Assistant & Q&A
app.post('/api/investigate/ask', async (req, res) => {
  try {
    const { question, context } = req.body;

    const prompt = `
You are a Business Intelligence Root Cause Analyst embedded in an analytical workspace.
Answer the user's question accurately using ONLY the provided investigation context.
If the data does not contain enough evidence to answer conclusively, explicitly state what is missing.

INVESTIGATION CONTEXT:
${JSON.stringify(context, null, 2)}

USER QUESTION:
${question}

Instructions:
- Be concise, numerical, and objective.
- Quote exact baseline, comparison, delta, and contribution % values when referring to segments.
- Distinguish observed segment shifts from unverified causal assertions.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    res.json({ answer: response.text });
  } catch (error: any) {
    console.error('Error answering question:', error);
    res.status(500).json({
      error: error.message || 'Failed to analyze query',
    });
  }
});

// Server environment setup
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT} in ${isProd ? 'production' : 'development'} mode`);
  });
}

startServer();
