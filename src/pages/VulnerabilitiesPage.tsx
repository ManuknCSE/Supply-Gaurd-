import React, { useState } from 'react';
import { SAMPLE_VULNERABILITIES } from '../utils/sampleData';
import { VulnerabilityTable } from '../components/vulnerabilities/VulnerabilityTable';
import { StatCard } from '../components/common/StatCard';
import { Bug, ShieldAlert, AlertTriangle, ShieldCheck, Sparkles } from 'lucide-react';

export const VulnerabilitiesPage: React.FC = () => {
  const vulns = SAMPLE_VULNERABILITIES;

  const criticalCount = vulns.filter(v => v.severity === 'critical').length;
  const highCount = vulns.filter(v => v.severity === 'high').length;
  const mediumCount = vulns.filter(v => v.severity === 'medium').length;
  const lowCount = vulns.filter(v => v.severity === 'low').length;
  const heuristicCount = vulns.filter(v => v.isHeuristicAlert).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white mb-1 flex items-center gap-2">
          <Bug className="w-6 h-6 text-red-400" />
          <span>Vulnerability Management</span>
        </h1>
        <p className="text-sm text-slate-400">
          Continuous threat intelligence enriched from NVD, OSV, GitHub Security Advisories, and SupplyGuard AI heuristics.
        </p>
      </div>

      {/* Severity Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-[#151F33] p-4 rounded-xl border border-red-500/30 font-mono">
          <span className="text-[10px] text-red-400 uppercase tracking-wider block font-bold">
            Critical Severities
          </span>
          <div className="text-2xl font-bold text-red-400 mt-1 tabular-nums">
            {criticalCount}
          </div>
          <span className="text-[10px] text-slate-500">CVSS 9.0 - 10.0</span>
        </div>

        <div className="bg-[#151F33] p-4 rounded-xl border border-orange-500/30 font-mono">
          <span className="text-[10px] text-orange-400 uppercase tracking-wider block font-bold">
            High Severities
          </span>
          <div className="text-2xl font-bold text-orange-400 mt-1 tabular-nums">
            {highCount}
          </div>
          <span className="text-[10px] text-slate-500">CVSS 7.0 - 8.9</span>
        </div>

        <div className="bg-[#151F33] p-4 rounded-xl border border-amber-500/30 font-mono">
          <span className="text-[10px] text-amber-300 uppercase tracking-wider block font-bold">
            Medium Severities
          </span>
          <div className="text-2xl font-bold text-amber-300 mt-1 tabular-nums">
            {mediumCount}
          </div>
          <span className="text-[10px] text-slate-500">CVSS 4.0 - 6.9</span>
        </div>

        <div className="bg-[#151F33] p-4 rounded-xl border border-cyan-500/30 font-mono">
          <span className="text-[10px] text-cyan-300 uppercase tracking-wider block font-bold">
            Low Severities
          </span>
          <div className="text-2xl font-bold text-cyan-300 mt-1 tabular-nums">
            {lowCount}
          </div>
          <span className="text-[10px] text-slate-500">CVSS 0.1 - 3.9</span>
        </div>

        <div className="bg-[#151F33] p-4 rounded-xl border border-indigo-500/30 font-mono">
          <span className="text-[10px] text-cyan-400 uppercase tracking-wider block font-bold flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Heuristic Flags
          </span>
          <div className="text-2xl font-bold text-cyan-400 mt-1 tabular-nums">
            {heuristicCount}
          </div>
          <span className="text-[10px] text-slate-500">AI Behavioral Signals</span>
        </div>
      </div>

      {/* Main Interactive Table */}
      <VulnerabilityTable vulnerabilities={vulns} title="Active Supply Chain Advisories" isDemo={true} />
    </div>
  );
};
