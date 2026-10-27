import React from 'react';
import {
  BrainCircuit,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Activity,
  Layers,
  ArrowRight,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import { RiskGauge } from '../components/common/RiskGauge';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { SAMPLE_ANOMALIES, AI_FEATURE_IMPORTANCE } from '../utils/sampleData';

export const AiRiskAnalysisPage: React.FC = () => {
  const radarData = [
    { subject: 'Vulnerability (CVSS/EPSS)', value: 85, fullMark: 100 },
    { subject: 'Behavioral Hooks', value: 78, fullMark: 100 },
    { subject: 'Typosquatting Distance', value: 92, fullMark: 100 },
    { subject: 'Maintainer Churn', value: 45, fullMark: 100 },
    { subject: 'Provenance & Signatures', value: 25, fullMark: 100 },
    { subject: 'Binary Payloads', value: 90, fullMark: 100 },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1 flex items-center gap-2">
            <BrainCircuit className="w-6 h-6 text-cyan-400" />
            <span>AI Supply Chain Risk & Anomaly Assessment</span>
          </h1>
          <p className="text-sm text-slate-400">
            Explainable machine learning framework evaluating behavioral anomalies, lexical typosquatting, and maintainer dynamics.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800 px-3 py-1.5 rounded-lg">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Model: Multi-Layer Classifier v2.4 (Simulated Demo)</span>
        </div>
      </div>

      {/* Top Banner: Composite AI Score & Key Factors */}
      <div className="bg-[#151F33] border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                Risk Classification: High Risk
              </span>
              <span className="text-xs font-mono text-slate-400">Model Confidence: 94.6%</span>
            </div>

            <h2 className="text-xl font-bold text-white">
              Composite Supply Chain Risk Analysis
            </h2>

            <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
              The AI inference pipeline combines lexical distance checks, abstract syntax tree (AST) lifecycle hook analyzers, and SLSA provenance graphs. While cryptographic build integrity is attested, two packages exhibit anomalous runtime behaviors and critical upstream vulnerabilities.
            </p>
          </div>

          <div className="shrink-0 flex items-center justify-center lg:pl-8 lg:border-l border-slate-800">
            <RiskGauge score={74} size="lg" />
          </div>
        </div>

        {/* 5 Layer Factor Decomposition */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-6 mt-6 border-t border-slate-800 font-mono text-xs">
          <div className="bg-[#0B1020] p-3 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase">1. Vulnerability Risk</span>
            <span className="text-base font-bold text-red-400">Critical (85%)</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Exploit maturity / NVD</span>
          </div>

          <div className="bg-[#0B1020] p-3 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase">2. Behavioral Risk</span>
            <span className="text-base font-bold text-amber-400">Elevated (78%)</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">curl in postinstall script</span>
          </div>

          <div className="bg-[#0B1020] p-3 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase">3. Typosquatting Risk</span>
            <span className="text-base font-bold text-amber-400">High (92%)</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">0.94 distance vs "chalk"</span>
          </div>

          <div className="bg-[#0B1020] p-3 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase">4. Maintainer Churn</span>
            <span className="text-base font-bold text-emerald-400">Low (22%)</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Regular release cadence</span>
          </div>

          <div className="bg-[#0B1020] p-3 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase">5. Integrity Risk</span>
            <span className="text-base font-bold text-emerald-400">Minimal (15%)</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Ledger anchored match</span>
          </div>
        </div>
      </div>

      {/* Feature Importance & Radar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feature Importance Bar Chart */}
        <div className="bg-[#151F33] border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Feature Importance Weights
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Relative contribution to overall risk index</p>
            </div>
            <span className="text-xs text-cyan-400 font-mono">Normalized (100%)</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={AI_FEATURE_IMPORTANCE}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <XAxis type="number" stroke="#64748B" fontSize={11} domain={[0, 40]} tickLine={false} />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="#64748B"
                  fontSize={10}
                  width={150}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0B1020',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                  }}
                />
                <Bar dataKey="weight" fill="#06B6D4" radius={[0, 4, 4, 0]}>
                  {AI_FEATURE_IMPORTANCE.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        index === 0
                          ? '#EF4444'
                          : index === 1
                          ? '#F97316'
                          : index === 2
                          ? '#06B6D4'
                          : '#8B5CF6'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Multi-Dimensional Radar Chart */}
        <div className="bg-[#151F33] border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Risk Vector Surface
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Multi-dimensional security anomaly vectors</p>
            </div>
            <span className="text-xs text-amber-400 font-mono">Anomaly Radar</span>
          </div>

          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" stroke="#94A3B8" fontSize={10} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" fontSize={9} />
                <Radar
                  name="Risk Intensity"
                  dataKey="value"
                  stroke="#F59E0B"
                  fill="#F59E0B"
                  fillOpacity={0.35}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0B1020',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detected Anomalies List */}
      <div className="bg-[#151F33] border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Detected Behavioral & Lexical Anomalies
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Explainable machine learning detection findings</p>
          </div>
          <span className="text-xs text-red-400 font-mono">{SAMPLE_ANOMALIES.length} Active Anomalies</span>
        </div>

        <div className="space-y-4">
          {SAMPLE_ANOMALIES.map(anom => (
            <div
              key={anom.id}
              className="bg-[#0B1020] border border-slate-800 rounded-xl p-4 text-xs space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <SeverityBadge severity={anom.severity} />
                  <span className="font-mono font-bold text-white text-sm">{anom.packageName}</span>
                  <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800 px-2 py-0.5 rounded">
                    {anom.category}
                  </span>
                </div>
                <div className="text-xs font-mono text-slate-400">
                  Detection Confidence: <strong className="text-emerald-400">{anom.confidenceScore}%</strong>
                </div>
              </div>

              <p className="text-slate-300 font-sans leading-relaxed">{anom.description}</p>

              <div className="bg-[#151F33] p-3 rounded-lg border border-slate-800 font-mono text-[11px] space-y-1">
                <span className="text-slate-400 block font-bold mb-1">Algorithmic Signals:</span>
                {anom.heuristicIndicators.map((ind, i) => (
                  <div key={i} className="text-slate-300 flex items-center gap-2">
                    <span className="text-cyan-400">&gt;</span>
                    <span>{ind}</span>
                  </div>
                ))}
              </div>

              <div className="pt-1 flex items-center justify-between text-slate-400 font-mono text-[11px]">
                <span>
                  Remediation: <strong className="text-white">{anom.recommendation}</strong>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
