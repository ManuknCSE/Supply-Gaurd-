import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Github,
  Package,
  Layers,
  Container,
  FileCode2,
  Brain,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  UploadCloud,
  CheckCircle2,
} from 'lucide-react';
import { ScanProgress } from '../components/scan/ScanProgress';
import { executeScanWorkflow, NewScanInput } from '../services/scanService';
import { ScanStage } from '../types/scan';
import { useToast } from '../components/common/NotificationToast';

type SourceType = 'github' | 'pypi' | 'npm' | 'docker' | 'sbom' | 'huggingface';

export const NewScanPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [sourceType, setSourceType] = useState<SourceType>('github');
  const [projectName, setProjectName] = useState('fastapi-auth-microservice');
  const [targetSource, setTargetSource] = useState('https://github.com/acme-org/fastapi-auth-microservice');
  const [scanDepth, setScanDepth] = useState<'direct' | 'transitive'>('transitive');
  const [enableAiAnomaly, setEnableAiAnomaly] = useState(true);
  const [enableLicenseAudit, setEnableLicenseAudit] = useState(true);
  const [enableBlockchainIntegrity, setEnableBlockchainIntegrity] = useState(true);

  // Scanning execution state
  const [isScanning, setIsScanning] = useState(false);
  const [stages, setStages] = useState<ScanStage[]>([]);
  const [progressPercent, setProgressPercent] = useState(0);

  const presets = [
    {
      label: 'Python FastAPI Microservice (PyPI)',
      type: 'github' as SourceType,
      name: 'fastapi-auth-microservice',
      url: 'https://github.com/acme-org/fastapi-auth-microservice',
      desc: 'Python 3.12 backend with 34 direct/transitive dependencies',
    },
    {
      label: 'E-Commerce Gateway (npm)',
      type: 'npm' as SourceType,
      name: 'ecommerce-gateway',
      url: 'https://github.com/acme-org/ecommerce-gateway',
      desc: 'Node.js 20 microservice with lockfile and CycloneDX SBOM',
    },
    {
      label: 'ML Whisper Pipeline (Hugging Face)',
      type: 'huggingface' as SourceType,
      name: 'whisper-finetuned-v2',
      url: 'https://huggingface.co/acme-org/whisper-finetuned-v2',
      desc: 'Safetensors audio pipeline with pickle-safe weights verification',
    },
    {
      label: 'Base Alpine Container (Docker)',
      type: 'docker' as SourceType,
      name: 'alpine-base-hardened',
      url: 'docker.io/library/alpine:3.19',
      desc: 'Container image layer scan including libc and runtime utilities',
    },
  ];

  const handleApplyPreset = (preset: typeof presets[0]) => {
    setSourceType(preset.type);
    setProjectName(preset.name);
    setTargetSource(preset.url);
    showToast('info', 'Preset Applied', preset.label);
  };

  const handleStartScan = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!projectName.trim()) {
      showToast('error', 'Validation Failed', 'Project name is required.');
      return;
    }
    if (!targetSource.trim()) {
      showToast('error', 'Validation Failed', 'Target source or repository URL is required.');
      return;
    }

    setIsScanning(true);
    setProgressPercent(0);

    const input: NewScanInput = {
      projectName,
      targetSource,
      sourceType,
      scanDepth,
      enableAiAnomalyDetection: enableAiAnomaly,
      enableLicenseAudit,
      enableBlockchainIntegrity,
    };

    try {
      const result = await executeScanWorkflow(input, (updatedStages, percent) => {
        setStages(updatedStages);
        setProgressPercent(percent);
      });

      showToast('success', 'Scan Completed', `Generated security posture report for ${result.projectName}`);
      setTimeout(() => {
        navigate(`/scans/${result.id}`);
      }, 800);
    } catch (err: any) {
      showToast('error', 'Scan Failed', err.message);
      setIsScanning(false);
    }
  };

  const sourceTypesList = [
    { id: 'github', label: 'GitHub Repository', icon: Github, placeholder: 'https://github.com/org/repo' },
    { id: 'pypi', label: 'Python / requirements.txt', icon: Package, placeholder: 'requirements.txt or PyPI package' },
    { id: 'npm', label: 'npm / package.json', icon: Layers, placeholder: 'package.json or npm package' },
    { id: 'docker', label: 'Docker Image', icon: Container, placeholder: 'docker.io/library/image:tag' },
    { id: 'sbom', label: 'SBOM Upload (CycloneDX/SPDX)', icon: FileCode2, placeholder: 'Paste JSON or upload file' },
    { id: 'huggingface', label: 'Hugging Face Model Repo', icon: Brain, placeholder: 'https://huggingface.co/org/model' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white mb-1">
          Initiate Supply Chain Security Scan
        </h1>
        <p className="text-sm text-slate-400">
          Configure multi-layer verification for dependencies, SLSA provenance, and immutable ledger integrity.
        </p>
      </div>

      {/* Live scanning progress bar if running */}
      {isScanning ? (
        <ScanProgress
          stages={stages}
          percent={progressPercent}
          currentStageName={stages.find(s => s.status === 'in_progress')?.name}
        />
      ) : (
        <form onSubmit={handleStartScan} className="space-y-6">
          {/* Quick Start Presets */}
          <div className="bg-[#151F33] border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2 text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold">
              <Sparkles className="w-4 h-4" />
              <span>Quick Test Demonstrations</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {presets.map(p => (
                <button
                  type="button"
                  key={p.label}
                  onClick={() => handleApplyPreset(p)}
                  className="p-2.5 rounded-lg bg-[#0B1020] hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-left transition-colors group"
                >
                  <div className="text-xs font-semibold text-white group-hover:text-cyan-300 font-mono">
                    {p.label}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 truncate">{p.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Select Source Type */}
          <div className="bg-[#151F33] border border-slate-800 rounded-xl p-5 space-y-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              1. Select Artifact or Repository Source
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {sourceTypesList.map(st => {
                const Icon = st.icon;
                const isSelected = sourceType === st.id;
                return (
                  <button
                    type="button"
                    key={st.id}
                    onClick={() => setSourceType(st.id as SourceType)}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'bg-cyan-500/10 border-cyan-500 text-cyan-300 shadow-lg shadow-cyan-500/10'
                        : 'bg-[#0B1020] border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <Icon className="w-5 h-5 mb-2" />
                    <span className="text-xs font-medium">{st.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Inputs */}
            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Project Name</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={e => setProjectName(e.target.value)}
                  placeholder="e.g. auth-service-core"
                  className="w-full bg-[#0B1020] border border-slate-800 rounded-lg px-3.5 py-2 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">
                  Target URL / Repository Reference
                </label>
                <input
                  type="text"
                  value={targetSource}
                  onChange={e => setTargetSource(e.target.value)}
                  placeholder={sourceTypesList.find(s => s.id === sourceType)?.placeholder}
                  className="w-full bg-[#0B1020] border border-slate-800 rounded-lg px-3.5 py-2 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Configuration Options */}
          <div className="bg-[#151F33] border border-slate-800 rounded-xl p-5 space-y-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              2. Security Analysis Pipeline Options
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Scan Depth */}
              <div className="bg-[#0B1020] p-3.5 rounded-lg border border-slate-800">
                <span className="text-xs font-semibold text-white block mb-1">Dependency Resolution Depth</span>
                <p className="text-[11px] text-slate-400 mb-2">Analyze direct manifest dependencies or recursive tree.</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setScanDepth('transitive')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-md border transition-colors ${
                      scanDepth === 'transitive'
                        ? 'bg-cyan-600 border-cyan-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Recursive (Transitive)
                  </button>
                  <button
                    type="button"
                    onClick={() => setScanDepth('direct')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-md border transition-colors ${
                      scanDepth === 'direct'
                        ? 'bg-cyan-600 border-cyan-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Direct Only
                  </button>
                </div>
              </div>

              {/* AI Anomaly Detection */}
              <label className="bg-[#0B1020] p-3.5 rounded-lg border border-slate-800 flex items-start gap-3 cursor-pointer hover:border-slate-700 transition-colors">
                <input
                  type="checkbox"
                  checked={enableAiAnomaly}
                  onChange={e => setEnableAiAnomaly(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-slate-700 bg-slate-900 text-cyan-600 focus:ring-cyan-500"
                />
                <div>
                  <span className="text-xs font-semibold text-white block">AI Anomaly & Typosquatting Detection</span>
                  <span className="text-[11px] text-slate-400 leading-tight block mt-0.5">
                    Flag lexical distance anomalies, obfuscated postinstall hooks, and maintainer churn.
                  </span>
                </div>
              </label>

              {/* License Audit */}
              <label className="bg-[#0B1020] p-3.5 rounded-lg border border-slate-800 flex items-start gap-3 cursor-pointer hover:border-slate-700 transition-colors">
                <input
                  type="checkbox"
                  checked={enableLicenseAudit}
                  onChange={e => setEnableLicenseAudit(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-slate-700 bg-slate-900 text-cyan-600 focus:ring-cyan-500"
                />
                <div>
                  <span className="text-xs font-semibold text-white block">Open Source License Compliance</span>
                  <span className="text-[11px] text-slate-400 leading-tight block mt-0.5">
                    Audit SPDX/CycloneDX license obligations and flag restrictive copyleft (GPL) licenses.
                  </span>
                </div>
              </label>

              {/* Blockchain Notary */}
              <label className="bg-[#0B1020] p-3.5 rounded-lg border border-slate-800 flex items-start gap-3 cursor-pointer hover:border-slate-700 transition-colors">
                <input
                  type="checkbox"
                  checked={enableBlockchainIntegrity}
                  onChange={e => setEnableBlockchainIntegrity(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-slate-700 bg-slate-900 text-cyan-600 focus:ring-cyan-500"
                />
                <div>
                  <span className="text-xs font-semibold text-white block">Blockchain Integrity Notarization</span>
                  <span className="text-[11px] text-slate-400 leading-tight block mt-0.5">
                    Verify SHA-256 digest against Ethereum Sepolia notary contract and issue tamper-evident proof.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-between p-4 bg-[#151F33] border border-slate-800 rounded-xl">
            <div className="text-xs text-slate-400">
              Operating in <span className="text-cyan-400 font-mono">Autonomous Pipeline Mode</span> (7 verification stages)
            </div>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-cyan-600/20 group"
            >
              <span>Execute Supply Chain Scan</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
