import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchScanById } from '../services/scanService';
import { ScanResult, DependencyNode } from '../types/scan';
import { RiskGauge } from '../components/common/RiskGauge';
import { ScanStatusBadge } from '../components/common/ScanStatusBadge';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { VulnerabilityTable } from '../components/vulnerabilities/VulnerabilityTable';
import { DependencyGraph } from '../components/graph/DependencyGraph';
import { ErrorState } from '../components/common/ErrorState';
import { CardLoadingSkeleton } from '../components/common/LoadingSkeleton';
import { formatDate, truncateHash } from '../utils/formatters';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Blocks,
  BrainCircuit,
  FileCode2,
  Download,
  Copy,
  Check,
  ExternalLink,
  Layers,
  Bug,
  Activity,
  ArrowLeft,
  Terminal,
} from 'lucide-react';
import { SAMPLE_CYCLONEDX_JSON } from '../utils/sampleData';
import { useToast } from '../components/common/NotificationToast';

type ActiveTab = 'overview' | 'dependencies' | 'vulnerabilities' | 'provenance' | 'ai' | 'integrity' | 'raw_sbom';

export const ScanDetailsPage: React.FC = () => {
  const { scanId } = useParams<{ scanId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [scan, setScan] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [copiedRaw, setCopiedRaw] = useState(false);
  const [selectedDep, setSelectedDep] = useState<DependencyNode | null>(null);

  useEffect(() => {
    if (!scanId) return;
    setLoading(true);
    fetchScanById(scanId)
      .then(res => {
        setScan(res.scan);
        setError(null);
      })
      .catch(err => {
        setError(err.message || 'Failed loading scan results.');
      })
      .finally(() => setLoading(false));
  }, [scanId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="h-28 bg-[#151F33] rounded-xl animate-pulse" />
        <div className="grid grid-cols-4 gap-4">
          <CardLoadingSkeleton />
          <CardLoadingSkeleton />
          <CardLoadingSkeleton />
          <CardLoadingSkeleton />
        </div>
      </div>
    );
  }

  if (error || !scan) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <ErrorState
          title="Scan Not Found"
          message={error || `Scan with ID "${scanId}" could not be retrieved.`}
          onRetry={() => navigate('/scans')}
        />
      </div>
    );
  }

  const rawSbomString = JSON.stringify(SAMPLE_CYCLONEDX_JSON, null, 2);

  const handleCopyRaw = () => {
    navigator.clipboard.writeText(rawSbomString);
    setCopiedRaw(true);
    showToast('success', 'Copied to Clipboard', 'CycloneDX SBOM JSON copied.');
    setTimeout(() => setCopiedRaw(false), 2000);
  };

  const handleDownloadSbom = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(rawSbomString);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${scan.projectName}-cyclonedx-sbom.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('success', 'SBOM Downloaded', 'Exported CycloneDX 1.5 specification.');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Back Button & Navigation Breadcrumb */}
      <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
        <button
          onClick={() => navigate('/scans')}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#151F33] border border-slate-800 hover:text-white hover:border-slate-700 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Scans</span>
        </button>
        <span aria-hidden="true">/</span>
        <span className="text-white">{scan.projectName}</span>
        <span aria-hidden="true">/</span>
        <span className="text-cyan-400">{scan.id}</span>
      </div>

      {/* Main Scan Banner */}
      <div className="bg-[#151F33] border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left Details */}
          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-white font-mono">
                {scan.projectName}
              </h1>
              <ScanStatusBadge status={scan.status} />
              <span className="text-xs font-mono uppercase bg-slate-800 border border-slate-700 text-slate-300 px-2 py-0.5 rounded">
                {scan.sourceType}
              </span>
              <span className="text-xs font-mono text-slate-400">
                Gate: <strong className="text-white">{scan.policyDecision}</strong>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs font-mono text-slate-400">
              <span>Scan ID: <span className="text-slate-200">{scan.id}</span></span>
              <span aria-hidden="true">·</span>
              <span>Timestamp: <span className="text-slate-200">{formatDate(scan.timestamp)}</span></span>
              <span aria-hidden="true">·</span>
              <span>Duration: <span className="text-cyan-400 tabular-nums">{(scan.durationMs / 1000).toFixed(1)}s</span></span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans max-w-3xl">
              {scan.executiveSummary}
            </p>
          </div>

          {/* Right: Prominent Risk Gauge */}
          <div className="flex items-center gap-6 border-t lg:border-t-0 lg:border-l border-slate-800 pt-4 lg:pt-0 lg:pl-6 shrink-0 justify-around">
            <RiskGauge score={scan.riskScore} size="md" />

            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="text-slate-400">SLSA Level {scan.provenance.slsaLevel}</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    scan.blockchainRecord.verificationStatus === 'Verified' ? 'bg-emerald-400' : 'bg-red-400'
                  }`}
                />
                <span className="text-slate-400">Ledger: {scan.blockchainRecord.verificationStatus}</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    scan.suspiciousPackagesCount > 0 ? 'bg-amber-400' : 'bg-emerald-400'
                  }`}
                />
                <span className="text-slate-400">
                  {scan.suspiciousPackagesCount > 0 ? `${scan.suspiciousPackagesCount} Anomaly Flags` : '0 Anomalies'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 mt-5 border-t border-slate-800/80 text-xs font-mono">
          <div className="bg-[#0B1020] p-3 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase">Total Dependencies</span>
            <span className="text-base font-bold text-white tabular-nums">
              {scan.totalDependencies}
            </span>
            <span className="text-[10px] text-slate-500 ml-1">
              ({scan.directDependencies} direct · {scan.transitiveDependencies} transitive)
            </span>
          </div>

          <div className="bg-[#0B1020] p-3 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase">Vulnerabilities</span>
            <span className="text-base font-bold tabular-nums text-white">
              {scan.vulnerabilities.total}
            </span>
            <span className="text-[10px] text-red-400 ml-1 font-bold">
              ({scan.vulnerabilities.critical} crit · {scan.vulnerabilities.high} high)
            </span>
          </div>

          <div className="bg-[#0B1020] p-3 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase">Integrity Notarization</span>
            <span className="text-xs font-bold text-emerald-400 truncate block mt-1">
              {scan.blockchainRecord.blockchainNetwork}
            </span>
          </div>

          <div className="bg-[#0B1020] p-3 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase">SBOM Specification</span>
            <span className="text-xs font-bold text-cyan-400 truncate block mt-1">
              {scan.sbomFormat}
            </span>
          </div>
        </div>
      </div>

      {/* 7 Interactive Tabs Navigation */}
      <div className="flex items-center gap-1.5 p-1 bg-[#151F33] border border-slate-800 rounded-xl overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview', icon: Activity },
          { id: 'dependencies', label: `Dependencies (${scan.totalDependencies})`, icon: Layers },
          { id: 'vulnerabilities', label: `Vulnerabilities (${scan.vulnerabilities.total})`, icon: Bug },
          { id: 'provenance', label: 'SLSA Provenance', icon: ShieldCheck },
          { id: 'ai', label: 'AI Risk Analysis', icon: BrainCircuit },
          { id: 'integrity', label: 'Blockchain Integrity', icon: Blocks },
          { id: 'raw_sbom', label: 'Raw SBOM', icon: FileCode2 },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ActiveTab)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recommended Remediation Actions */}
            <div className="bg-[#151F33] border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-cyan-400" />
                <span>Recommended Remediation Protocol</span>
              </h3>
              <div className="space-y-2.5">
                {scan.recommendedActions.map((action, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 p-3 rounded-lg bg-[#0B1020] border border-slate-800">
                    <span className="font-mono text-xs font-bold text-cyan-400 shrink-0">0{idx + 1}.</span>
                    <p className="text-xs text-slate-200 leading-relaxed font-sans">{action}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Risk Score Breakdown */}
            <div className="bg-[#151F33] border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-cyan-400" />
                <span>Multi-Layer Risk Composition</span>
              </h3>
              <div className="space-y-3 font-mono text-xs">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-400">Vulnerability Risk (CVE/CVSS):</span>
                    <span className="text-red-400 font-bold">
                      {scan.vulnerabilities.critical > 0 ? 'High' : 'Moderate'}
                    </span>
                  </div>
                  <div className="w-full bg-[#0B1020] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-red-500 h-full rounded-full"
                      style={{ width: `${Math.min(100, scan.vulnerabilities.total * 20)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-400">Behavioral Anomaly Risk:</span>
                    <span className="text-amber-400 font-bold">
                      {scan.suspiciousPackagesCount > 0 ? 'Elevated' : 'Minimal'}
                    </span>
                  </div>
                  <div className="w-full bg-[#0B1020] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full"
                      style={{ width: `${scan.suspiciousPackagesCount * 45}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-400">SLSA Provenance Integrity:</span>
                    <span className="text-emerald-400 font-bold">
                      Level {scan.provenance.slsaLevel} (Attested)
                    </span>
                  </div>
                  <div className="w-full bg-[#0B1020] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: '85%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-400">Blockchain Notary Equality:</span>
                    <span className={scan.blockchainRecord.verificationStatus === 'Verified' ? 'text-emerald-400' : 'text-red-400'}>
                      {scan.blockchainRecord.verificationStatus}
                    </span>
                  </div>
                  <div className="w-full bg-[#0B1020] h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        scan.blockchainRecord.verificationStatus === 'Verified' ? 'bg-emerald-500' : 'bg-red-500'
                      }`}
                      style={{ width: scan.blockchainRecord.verificationStatus === 'Verified' ? '100%' : '20%' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Dependency Graph Preview */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Dependency Topology Graph Preview
              </h3>
              <button
                onClick={() => setActiveTab('dependencies')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-mono"
              >
                Expand Full Interactive Graph &rarr;
              </button>
            </div>
            <DependencyGraph dependencies={scan.dependenciesList} rootName={scan.projectName} />
          </div>
        </div>
      )}

      {/* Tab 2: Dependencies */}
      {activeTab === 'dependencies' && (
        <div className="space-y-4">
          <DependencyGraph
            dependencies={scan.dependenciesList}
            rootName={scan.projectName}
            onSelectDependency={setSelectedDep}
          />
        </div>
      )}

      {/* Tab 3: Vulnerabilities */}
      {activeTab === 'vulnerabilities' && (
        <div className="space-y-4">
          <VulnerabilityTable vulnerabilities={scan.vulnerabilityList} title="Reported Vulnerabilities" isDemo={true} />
        </div>
      )}

      {/* Tab 4: Provenance */}
      {activeTab === 'provenance' && (
        <div className="bg-[#151F33] border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>SLSA Framework Build Provenance (Level {scan.provenance.slsaLevel})</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Cryptographic attestation certifying builder identity, source commit, and non-falsifiable build pipeline.
              </p>
            </div>
            <span className="px-3 py-1 rounded-md text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Cosign Verified
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
            <div className="bg-[#0B1020] p-4 rounded-lg border border-slate-800 space-y-2">
              <span className="text-[10px] uppercase text-slate-500 font-bold">Source Provenance</span>
              <div className="flex justify-between">
                <span className="text-slate-400">Repository:</span>
                <span className="text-slate-200 truncate max-w-xs">{scan.provenance.sourceRepository}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Commit SHA:</span>
                <span className="text-cyan-400 font-bold">{scan.provenance.sourceCommit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Attestation Timestamp:</span>
                <span className="text-slate-300">{formatDate(scan.provenance.issuedAt)}</span>
              </div>
            </div>

            <div className="bg-[#0B1020] p-4 rounded-lg border border-slate-800 space-y-2">
              <span className="text-[10px] uppercase text-slate-500 font-bold">Builder Environment</span>
              <div className="flex justify-between">
                <span className="text-slate-400">Builder Identity:</span>
                <span className="text-slate-200 truncate max-w-xs">{scan.provenance.builderIdentity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Invocation ID:</span>
                <span className="text-slate-300">{scan.provenance.buildInvocationId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">OS Environment:</span>
                <span className="text-slate-300">{scan.provenance.buildEnvironment}</span>
              </div>
            </div>
          </div>

          <div className="bg-[#0B1020] p-4 rounded-lg border border-slate-800 space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span>Cryptographic Attestation Signature (Sigstore / Cosign):</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Keyless In-Toto Attestation
              </span>
            </div>
            <pre className="p-3 bg-black/40 rounded border border-slate-800 text-slate-300 text-[11px] overflow-x-auto whitespace-pre-wrap select-all">
              {scan.provenance.cryptographicSignature}
            </pre>
          </div>
        </div>
      )}

      {/* Tab 5: AI Analysis */}
      {activeTab === 'ai' && (
        <div className="bg-[#151F33] border border-slate-800 rounded-xl p-6 space-y-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-cyan-400" />
              <span>Multi-Layer AI Risk & Anomaly Assessment</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Deep behavioral inspection detecting typosquatting, hidden postinstall sockets, and malicious payloads.
            </p>
          </div>

          {scan.anomalies.length > 0 ? (
            <div className="space-y-4">
              {scan.anomalies.map(anom => (
                <div
                  key={anom.id}
                  className="bg-[#0B1020] border border-amber-500/30 rounded-xl p-4 text-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <SeverityBadge severity={anom.severity} />
                      <span className="font-mono font-bold text-white text-sm">{anom.packageName}</span>
                      <span className="font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                        {anom.category}
                      </span>
                    </div>
                    <span className="font-mono text-slate-400">
                      Model Confidence: <strong className="text-cyan-400">{anom.confidenceScore}%</strong>
                    </span>
                  </div>

                  <p className="text-slate-300 font-sans leading-relaxed">{anom.description}</p>

                  <div className="bg-[#151F33] p-3 rounded-lg border border-slate-800 space-y-1.5 font-mono text-[11px]">
                    <span className="text-slate-400 block font-bold">Heuristic Evaluation Signals:</span>
                    {anom.heuristicIndicators.map((ind, i) => (
                      <div key={i} className="text-slate-300 flex items-center gap-2">
                        <span className="text-cyan-400">&bull;</span>
                        <span>{ind}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-slate-300 pt-1">
                    <span>Recommendation: <strong className="text-white">{anom.recommendation}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-[#0B1020] border border-slate-800 rounded-xl">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
              <h4 className="text-sm font-semibold text-white">No Heuristic Anomalies Detected</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
                Dependency names, lifecycle scripts, and registry telemetry align with verified community baselines.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 6: Integrity */}
      {activeTab === 'integrity' && (
        <div className="bg-[#151F33] border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Blocks className="w-5 h-5 text-cyan-400" />
                <span>Immutable Blockchain Notary Record</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Cryptographic checksums anchored on immutable smart contract ledger for tamper-evident verification.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-800 px-2.5 py-1 rounded">
              {scan.blockchainRecord.blockchainNetwork}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
            <div className="bg-[#0B1020] p-4 rounded-lg border border-slate-800 space-y-2.5">
              <span className="text-[10px] uppercase text-slate-500 font-bold">Cryptographic Digests</span>
              <div>
                <span className="text-slate-400 block text-[11px]">SBOM SHA-256 Digest:</span>
                <span className="text-cyan-300 break-all select-all">{scan.blockchainRecord.sbomSha256}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Artifact SHA-256 Digest:</span>
                <span className="text-slate-300 break-all select-all">{scan.blockchainRecord.artifactSha256}</span>
              </div>
            </div>

            <div className="bg-[#0B1020] p-4 rounded-lg border border-slate-800 space-y-2.5">
              <span className="text-[10px] uppercase text-slate-500 font-bold">Ledger Transaction Proof</span>
              <div className="flex justify-between">
                <span className="text-slate-400">Notary Contract:</span>
                <span className="text-slate-200">{scan.blockchainRecord.contractAddress}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Block Number:</span>
                <span className="text-slate-200">#{scan.blockchainRecord.blockNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Anchored By:</span>
                <span className="text-slate-200">{scan.blockchainRecord.anchoredBy}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Transaction Hash:</span>
                <span className="text-slate-300 break-all select-all">{scan.blockchainRecord.transactionHash}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 7: Raw SBOM */}
      {activeTab === 'raw_sbom' && (
        <div className="bg-[#151F33] border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                CycloneDX 1.5 JSON Manifest
              </h3>
              <p className="text-xs text-slate-400">Machine-readable software bill of materials</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyRaw}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
              >
                {copiedRaw ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedRaw ? 'Copied' : 'Copy JSON'}</span>
              </button>
              <button
                onClick={handleDownloadSbom}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download SBOM</span>
              </button>
            </div>
          </div>

          <pre className="p-4 bg-[#0B1020] border border-slate-800 rounded-xl font-mono text-xs text-slate-300 max-h-[600px] overflow-y-auto overflow-x-auto whitespace-pre leading-relaxed select-all">
            {rawSbomString}
          </pre>
        </div>
      )}
    </div>
  );
};
