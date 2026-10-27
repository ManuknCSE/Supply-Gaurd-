import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GitBranch,
  Play,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Settings2,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Save,
} from 'lucide-react';
import {
  getAllWorkflowRuns,
  triggerNewWorkflowSimulation,
  getSecurityPolicyConfig,
  saveSecurityPolicyConfig,
} from '../services/cicdService';
import { CicdWorkflowRun, SecurityPolicyConfig, PolicyDecision } from '../types/scan';
import { getPolicyDecisionClasses, formatDate } from '../utils/formatters';
import { ScanStatusBadge } from '../components/common/ScanStatusBadge';
import { useToast } from '../components/common/NotificationToast';

export const CicdSecurityPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [workflows, setWorkflows] = useState<CicdWorkflowRun[]>(getAllWorkflowRuns());
  const [policyConfig, setPolicyConfig] = useState<SecurityPolicyConfig>(getSecurityPolicyConfig());
  const [selectedRun, setSelectedRun] = useState<CicdWorkflowRun | null>(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  const handleTriggerSimulatedRun = () => {
    const newRun = triggerNewWorkflowSimulation('acme-org/fastapi-auth-microservice');
    setWorkflows(getAllWorkflowRuns());
    showToast('success', 'Pipeline Run Triggered', `Evaluated CI/CD security gate: ${newRun.policyDecision}`);
  };

  const handleSavePolicy = (e: React.FormEvent) => {
    e.preventDefault();
    saveSecurityPolicyConfig(policyConfig);
    showToast('success', 'Policy Updated', 'Security gate evaluation thresholds applied.');
    setIsConfigOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1 flex items-center gap-2">
            <GitBranch className="w-6 h-6 text-cyan-400" />
            <span>CI/CD Pipeline Security & Gate Enforcement</span>
          </h1>
          <p className="text-sm text-slate-400">
            Automated DevSecOps gates enforcing SLSA provenance, vulnerability thresholds, and artifact integrity prior to deployment.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsConfigOpen(!isConfigOpen)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>Configure Policy Rules</span>
          </button>
          <button
            onClick={handleTriggerSimulatedRun}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Simulate Pipeline Gate</span>
          </button>
        </div>
      </div>

      {/* Policy Configuration Collapsible Drawer / Card */}
      {isConfigOpen && (
        <form onSubmit={handleSavePolicy} className="bg-[#151F33] border border-cyan-500/30 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-cyan-400" />
              <span>CI/CD Deployment Gate Policy Thresholds</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">Enforced across all repository workflows</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-mono">
            <label className="p-3 bg-[#0B1020] rounded-lg border border-slate-800 flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={policyConfig.blockOnCriticalCve}
                onChange={e => setPolicyConfig({ ...policyConfig, blockOnCriticalCve: e.target.checked })}
                className="mt-1 rounded bg-slate-900 border-slate-700 text-cyan-600"
              />
              <div>
                <span className="text-white font-bold block">Block on ANY Critical CVE</span>
                <span className="text-slate-400 text-[11px]">Automatically fail build if CVSS &gt;= 9.0 found.</span>
              </div>
            </label>

            <label className="p-3 bg-[#0B1020] rounded-lg border border-slate-800 flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={policyConfig.blockOnUnverifiedIntegrity}
                onChange={e => setPolicyConfig({ ...policyConfig, blockOnUnverifiedIntegrity: e.target.checked })}
                className="mt-1 rounded bg-slate-900 border-slate-700 text-cyan-600"
              />
              <div>
                <span className="text-white font-bold block">Enforce Ledger Notarization</span>
                <span className="text-slate-400 text-[11px]">Reject builds with SBOM checksum discrepancies.</span>
              </div>
            </label>

            <label className="p-3 bg-[#0B1020] rounded-lg border border-slate-800 flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={policyConfig.blockOnAnomalies}
                onChange={e => setPolicyConfig({ ...policyConfig, blockOnAnomalies: e.target.checked })}
                className="mt-1 rounded bg-slate-900 border-slate-700 text-cyan-600"
              />
              <div>
                <span className="text-white font-bold block">Block on AI Heuristic Anomaly</span>
                <span className="text-slate-400 text-[11px]">Halt pipeline on typosquatting or curl in scripts.</span>
              </div>
            </label>

            <div className="p-3 bg-[#0B1020] rounded-lg border border-slate-800">
              <label className="text-white font-bold block mb-1">Minimum SLSA Provenance Level</label>
              <select
                value={policyConfig.requireSlsaLevel}
                onChange={e => setPolicyConfig({ ...policyConfig, requireSlsaLevel: Number(e.target.value) })}
                className="w-full bg-[#151F33] border border-slate-700 rounded p-1.5 text-white"
              >
                <option value={1}>SLSA Level 1 (Build Script)</option>
                <option value={2}>SLSA Level 2 (Hosted Builder & Sigstore)</option>
                <option value={3}>SLSA Level 3 (Hermetic Non-Falsifiable)</option>
              </select>
            </div>

            <div className="p-3 bg-[#0B1020] rounded-lg border border-slate-800">
              <label className="text-white font-bold block mb-1">New Package Age Quarantine (Days)</label>
              <input
                type="number"
                value={policyConfig.blockNewPackagesDaysThreshold}
                onChange={e => setPolicyConfig({ ...policyConfig, blockNewPackagesDaysThreshold: Number(e.target.value) })}
                className="w-full bg-[#151F33] border border-slate-700 rounded p-1.5 text-white"
              />
              <span className="text-[10px] text-slate-500">Flag packages registered under X days ago</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsConfigOpen(false)}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Policy Configuration</span>
            </button>
          </div>
        </form>
      )}

      {/* Workflow Execution Table */}
      <div className="bg-[#151F33] border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 bg-[#10182B] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Monitored CI/CD Executions
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Automated pull request and deployment evaluations</p>
          </div>
          <span className="text-xs text-slate-400 font-mono">{workflows.length} Runs Logged</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#0B1020] text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Repository & Branch</th>
                <th className="py-3 px-4">Workflow Name</th>
                <th className="py-3 px-4">Trigger & Commit</th>
                <th className="py-3 px-4">Execution Time</th>
                <th className="py-3 px-4">Artifact Integrity</th>
                <th className="py-3 px-4">Scan Status</th>
                <th className="py-3 px-4">Policy Decision</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {workflows.map(run => {
                const { badge: decisionBadge } = getPolicyDecisionClasses(run.policyDecision);
                return (
                  <tr key={run.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{run.repository}</div>
                      <div className="text-[10px] text-cyan-400">{run.branch}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-200">{run.workflowName}</td>
                    <td className="py-3 px-4">
                      <span className="text-slate-400 capitalize">{run.triggeredBy}</span>
                      <span className="text-slate-500 ml-1.5 font-bold">({run.commitSha})</span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      <div>{formatDate(run.timestamp)}</div>
                      <div className="text-[10px] text-slate-500">{run.durationSeconds}s duration</div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                          run.artifactIntegrity === 'Verified' ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {run.artifactIntegrity === 'Verified' ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5" />
                        )}
                        <span>{run.artifactIntegrity}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <ScanStatusBadge status={run.scanStatus} />
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${decisionBadge}`}>
                        {run.policyDecision}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedRun(run)}
                        className="px-2.5 py-1 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded transition-colors"
                      >
                        Inspect Gate
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Decision Reason Breakdown Modal */}
      {selectedRun && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#151F33] border border-slate-700 rounded-xl max-w-xl w-full shadow-2xl p-6 font-mono text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] text-slate-400 uppercase">Policy Evaluation Breakdown</span>
                <h4 className="text-base font-bold text-white">{selectedRun.workflowName}</h4>
              </div>
              <button onClick={() => setSelectedRun(null)} className="text-slate-400 hover:text-white">
                &times;
              </button>
            </div>

            <div className="p-3 bg-[#0B1020] rounded-lg border border-slate-800 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Policy Verdict:</span>
                <span
                  className={`font-bold ${
                    selectedRun.policyDecision === 'ALLOW'
                      ? 'text-emerald-400'
                      : selectedRun.policyDecision === 'REVIEW'
                      ? 'text-amber-400'
                      : 'text-red-400'
                  }`}
                >
                  {selectedRun.policyDecision}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Target Commit:</span>
                <span className="text-slate-200">{selectedRun.commitSha}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Associated Scan:</span>
                <button
                  onClick={() => {
                    navigate(`/scans/${selectedRun.scanId}`);
                  }}
                  className="text-cyan-400 hover:underline flex items-center gap-1"
                >
                  <span>{selectedRun.scanId}</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>

            {selectedRun.policyViolations.length > 0 ? (
              <div className="space-y-2">
                <span className="text-slate-300 font-bold block">Blocking Violations:</span>
                {selectedRun.policyViolations.map((violation, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 flex items-start gap-2"
                  >
                    <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{violation}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>All security policies and SLSA provenance checks satisfied. Deployment permitted.</span>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setSelectedRun(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
