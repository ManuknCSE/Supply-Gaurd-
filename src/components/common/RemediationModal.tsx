import React, { useState } from 'react';
import { Vulnerability } from '../../types/scan';
import { X, Copy, Check, ExternalLink, ShieldCheck, AlertTriangle } from 'lucide-react';
import { SeverityBadge } from './SeverityBadge';
import { useToast } from './NotificationToast';

interface RemediationModalProps {
  vulnerability: Vulnerability | null;
  onClose: () => void;
}

export const RemediationModal: React.FC<RemediationModalProps> = ({ vulnerability, onClose }) => {
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  if (!vulnerability) return null;

  const getRemediationCommand = () => {
    const pkg = vulnerability.packageName;
    const fix = vulnerability.fixedVersion || 'latest';
    if (vulnerability.id.includes('pypi') || vulnerability.title.toLowerCase().includes('python')) {
      return `pip install --upgrade "${pkg}>=${fix}"`;
    }
    return `npm install ${pkg}@${fix} --save-exact`;
  };

  const command = getRemediationCommand();

  const handleCopy = () => {
    navigator.clipboard.writeText(command);
    setCopied(true);
    showToast('success', 'Remediation Command Copied', command);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#151F33] border border-slate-700 rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <SeverityBadge severity={vulnerability.severity} score={vulnerability.cvssScore} />
            <h3 className="text-base font-bold text-white font-mono">{vulnerability.id}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          <div>
            <h4 className="text-lg font-semibold text-white mb-1">{vulnerability.title}</h4>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Package: <strong className="text-slate-200 font-mono">{vulnerability.packageName}</strong></span>
              <span aria-hidden="true">·</span>
              <span>Installed: <span className="font-mono text-slate-300">{vulnerability.currentVersion}</span></span>
              <span aria-hidden="true">·</span>
              <span>Source: <span className="text-cyan-400">{vulnerability.source}</span></span>
            </div>
          </div>

          <div className="bg-[#0B1020] border border-slate-800 rounded-lg p-4 text-xs text-slate-300 leading-relaxed">
            {vulnerability.description}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3">
              <span className="text-xs text-slate-400">Affected Versions</span>
              <div className="text-sm font-mono text-slate-200 mt-0.5">{vulnerability.affectedVersionRange}</div>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3">
              <span className="text-xs text-slate-400">Fixed In Version</span>
              <div className="text-sm font-mono text-emerald-400 mt-0.5">
                {vulnerability.fixedVersion ? `>= ${vulnerability.fixedVersion}` : 'No known fix yet'}
              </div>
            </div>
          </div>

          {/* Remediation guidance */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Recommended Remediation</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              {vulnerability.remediationGuidance}
            </p>

            <div className="flex items-center justify-between bg-[#0B1020] border border-slate-800 rounded-lg p-3 font-mono text-xs">
              <code className="text-cyan-300 select-all">{command}</code>
              <button
                onClick={handleCopy}
                className="ml-3 inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition-colors shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {vulnerability.isHeuristicAlert && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
              <div>
                <strong>Heuristic Signal:</strong> This finding was derived from SupplyGuard AI algorithmic anomaly detection (similarity distance & script telemetry) rather than an official public CVE registry.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 bg-slate-900/60 border-t border-slate-800">
          <a
            href={
              vulnerability.cveId?.startsWith('CVE-')
                ? `https://nvd.nist.gov/vuln/detail/${vulnerability.cveId}`
                : `https://github.com/advisories`
            }
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <span>View Upstream Advisory</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
