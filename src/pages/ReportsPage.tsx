import React, { useState } from 'react';
import { SAMPLE_SCANS, SAMPLE_VULNERABILITIES } from '../utils/sampleData';
import { ScanResult } from '../types/scan';
import { formatDate, truncateHash } from '../utils/formatters';
import {
  FileText,
  Download,
  Printer,
  ShieldCheck,
  ShieldAlert,
  BrainCircuit,
  Blocks,
  Package,
  Layers,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useToast } from '../components/common/NotificationToast';

export const ReportsPage: React.FC = () => {
  const { showToast } = useToast();
  const [selectedScanId, setSelectedScanId] = useState<string>(SAMPLE_SCANS[0].id);
  const [framework, setFramework] = useState<'NIST' | 'EO14028' | 'SLSA'>('NIST');

  const scan = SAMPLE_SCANS.find(s => s.id === selectedScanId) || SAMPLE_SCANS[0];

  const handleExportJson = () => {
    const reportData = {
      reportType: 'SupplyGuard Executive Security Posture Audit',
      complianceFramework: framework,
      generatedAt: new Date().toISOString(),
      scanMetadata: {
        id: scan.id,
        project: scan.projectName,
        source: scan.targetSource,
        timestamp: scan.timestamp,
        riskScore: scan.riskScore,
      },
      vulnerabilitiesSummary: scan.vulnerabilities,
      provenance: scan.provenance,
      blockchainEvidence: scan.blockchainRecord,
      aiRiskAnalysis: {
        anomalies: scan.anomalies,
        recommendedActions: scan.recommendedActions,
      },
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(reportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${scan.projectName}-executive-security-audit.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('success', 'Report Exported', 'Downloaded Executive JSON Audit Report.');
  };

  const handleDownloadSbom = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(scan, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${scan.projectName}-cyclonedx-sbom.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('success', 'SBOM Downloaded', 'Exported CycloneDX 1.5 specification.');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1 flex items-center gap-2">
            <FileText className="w-6 h-6 text-cyan-400" />
            <span>Executive Supply Chain Security Reports</span>
          </h1>
          <p className="text-sm text-slate-400">
            Generate and export comprehensive compliance audits aligned with NIST SP 800-218 and Executive Order 14028.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Target Scan Picker */}
          <select
            value={selectedScanId}
            onChange={e => setSelectedScanId(e.target.value)}
            className="bg-[#151F33] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
          >
            {SAMPLE_SCANS.map(s => (
              <option key={s.id} value={s.id}>
                {s.projectName} ({s.id})
              </option>
            ))}
          </select>

          {/* Compliance framework switch */}
          <select
            value={framework}
            onChange={e => setFramework(e.target.value as any)}
            className="bg-[#151F33] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-cyan-400 focus:outline-none focus:border-cyan-500 font-mono"
          >
            <option value="NIST">NIST SP 800-218 (SSDF)</option>
            <option value="EO14028">Executive Order 14028</option>
            <option value="SLSA">OpenSSF SLSA Framework</option>
          </select>

          <button
            onClick={handleExportJson}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={handleDownloadSbom}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download SBOM</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Report Canvas Document */}
      <div className="bg-[#151F33] print:bg-white print:text-black border border-slate-800 rounded-2xl p-8 space-y-8 shadow-2xl">
        {/* Document Header */}
        <div className="border-b border-slate-800 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>SupplyGuard AI Assurance Report · {framework} Compliant</span>
            </div>
            <h2 className="text-2xl font-bold text-white print:text-black">
              Software Supply Chain Security & Integrity Audit
            </h2>
            <div className="text-xs text-slate-400 print:text-slate-600 font-mono mt-1">
              Audit Target: <strong className="text-white print:text-black">{scan.projectName}</strong> · Reference: {scan.targetSource}
            </div>
          </div>

          <div className="text-right font-mono text-xs text-slate-400 print:text-slate-600">
            <div>Report ID: {scan.id}-AUDIT</div>
            <div>Generated: {formatDate(new Date().toISOString())}</div>
            <div className="text-cyan-400 print:text-blue-600 font-bold mt-1">
              Verdict: {scan.policyDecision}
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white print:text-black uppercase tracking-wider font-mono">
            1. Executive Security Summary
          </h3>
          <p className="text-sm text-slate-300 print:text-slate-800 leading-relaxed font-sans">
            {scan.executiveSummary} This audit report encapsulates deep software bill of materials (SBOM) composition, cryptographic provenance attestation (SLSA Level {scan.provenance.slsaLevel}), and blockchain notary evidence anchored on {scan.blockchainRecord.blockchainNetwork}.
          </p>
        </div>

        {/* Audit Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
          <div className="bg-[#0B1020] print:bg-slate-100 p-3.5 rounded-lg border border-slate-800">
            <span className="text-slate-400 print:text-slate-600 block text-[10px] uppercase">Composite Risk</span>
            <div className="text-xl font-bold text-white print:text-black mt-1">
              {scan.riskScore}/100
            </div>
            <span className="text-[10px] text-amber-400 font-bold">Action Required</span>
          </div>

          <div className="bg-[#0B1020] print:bg-slate-100 p-3.5 rounded-lg border border-slate-800">
            <span className="text-slate-400 print:text-slate-600 block text-[10px] uppercase">Dependencies</span>
            <div className="text-xl font-bold text-white print:text-black mt-1">
              {scan.totalDependencies}
            </div>
            <span className="text-[10px] text-slate-400">
              {scan.directDependencies} direct · {scan.transitiveDependencies} transitive
            </span>
          </div>

          <div className="bg-[#0B1020] print:bg-slate-100 p-3.5 rounded-lg border border-slate-800">
            <span className="text-slate-400 print:text-slate-600 block text-[10px] uppercase">CVE Vulnerabilities</span>
            <div className="text-xl font-bold text-red-400 mt-1">
              {scan.vulnerabilities.total} Findings
            </div>
            <span className="text-[10px] text-red-400 font-bold">
              {scan.vulnerabilities.critical} Critical · {scan.vulnerabilities.high} High
            </span>
          </div>

          <div className="bg-[#0B1020] print:bg-slate-100 p-3.5 rounded-lg border border-slate-800">
            <span className="text-slate-400 print:text-slate-600 block text-[10px] uppercase">Ledger Proof</span>
            <div className="text-base font-bold text-emerald-400 mt-1">
              {scan.blockchainRecord.verificationStatus}
            </div>
            <span className="text-[10px] text-slate-400">Block #{scan.blockchainRecord.blockNumber}</span>
          </div>
        </div>

        {/* Cryptographic Notary Evidence */}
        <div className="space-y-3 font-mono text-xs">
          <h3 className="text-sm font-bold text-white print:text-black uppercase tracking-wider font-mono flex items-center gap-2">
            <Blocks className="w-4 h-4 text-cyan-400" />
            <span>2. Immutable Cryptographic Proofs</span>
          </h3>

          <div className="bg-[#0B1020] print:bg-slate-100 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex flex-col sm:flex-row justify-between text-slate-300 print:text-slate-800">
              <span className="text-slate-400 print:text-slate-600">SBOM SHA-256 Digest:</span>
              <span className="text-cyan-400 print:text-blue-600 break-all">{scan.blockchainRecord.sbomSha256}</span>
            </div>
            <div className="flex flex-col sm:flex-row justify-between text-slate-300 print:text-slate-800">
              <span className="text-slate-400 print:text-slate-600">Notary Transaction Hash:</span>
              <span className="break-all">{scan.blockchainRecord.transactionHash}</span>
            </div>
            <div className="flex justify-between text-slate-300 print:text-slate-800">
              <span className="text-slate-400 print:text-slate-600">Ledger Contract:</span>
              <span>{scan.blockchainRecord.contractAddress}</span>
            </div>
          </div>
        </div>

        {/* Vulnerability Inventory */}
        <div className="space-y-3 font-mono text-xs">
          <h3 className="text-sm font-bold text-white print:text-black uppercase tracking-wider font-mono flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <span>3. Identified CVE Advisories & Heuristic Signals</span>
          </h3>

          <table className="w-full text-left border-collapse">
            <thead className="bg-[#0B1020] print:bg-slate-200 text-slate-400 print:text-slate-700 text-[10px] uppercase">
              <tr>
                <th className="p-2 border border-slate-800">Advisory ID</th>
                <th className="p-2 border border-slate-800">Package</th>
                <th className="p-2 border border-slate-800">Severity (CVSS)</th>
                <th className="p-2 border border-slate-800">Fixed Version</th>
                <th className="p-2 border border-slate-800">Remediation Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 print:divide-slate-300">
              {scan.vulnerabilityList.map(v => (
                <tr key={v.id} className="text-slate-200 print:text-slate-800">
                  <td className="p-2 border border-slate-800 font-bold">{v.id}</td>
                  <td className="p-2 border border-slate-800">{v.packageName} v{v.currentVersion}</td>
                  <td className="p-2 border border-slate-800 text-red-400 font-bold capitalize">
                    {v.severity} ({v.cvssScore})
                  </td>
                  <td className="p-2 border border-slate-800">{v.fixedVersion || 'N/A'}</td>
                  <td className="p-2 border border-slate-800">{v.remediationStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Remediation Protocol */}
        <div className="space-y-3 font-sans text-xs">
          <h3 className="text-sm font-bold text-white print:text-black uppercase tracking-wider font-mono">
            4. Required Remediation Protocol
          </h3>
          <div className="space-y-2">
            {scan.recommendedActions.map((rec, i) => (
              <div
                key={i}
                className="p-3 bg-[#0B1020] print:bg-slate-100 rounded-lg border border-slate-800 text-slate-300 print:text-slate-800 leading-relaxed font-mono"
              >
                <strong className="text-cyan-400 print:text-blue-600">STEP {i + 1}:</strong> {rec}
              </div>
            ))}
          </div>
        </div>

        {/* Sign-off footer */}
        <div className="pt-6 border-t border-slate-800 print:border-slate-300 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-slate-500">
          <div>Verified by SupplyGuard AI Automated Notary Agent #4</div>
          <div>Cryptographic Attestation ID: {scan.provenance.buildInvocationId}</div>
        </div>
      </div>
    </div>
  );
};
