import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Shield, Package, Bug, ArrowRight } from 'lucide-react';
import { SAMPLE_SCANS, SAMPLE_VULNERABILITIES } from '../../utils/sampleData';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Trigger open if caller supports it
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const matchingScans = SAMPLE_SCANS.filter(
    s => s.projectName.toLowerCase().includes(q) || s.id.toLowerCase().includes(q)
  );

  const matchingVulns = SAMPLE_VULNERABILITIES.filter(
    v => v.id.toLowerCase().includes(q) || v.packageName.toLowerCase().includes(q) || v.title.toLowerCase().includes(q)
  );

  const navItems = [
    { label: 'Overview Dashboard', path: '/' },
    { label: 'New Supply Chain Scan', path: '/scan/new' },
    { label: 'SBOM Explorer', path: '/sbom' },
    { label: 'Interactive Dependency Graph', path: '/graph' },
    { label: 'Vulnerability Management', path: '/vulnerabilities' },
    { label: 'AI Risk Analysis & Anomalies', path: '/risk-analysis' },
    { label: 'Blockchain Integrity Ledger', path: '/integrity' },
    { label: 'CI/CD Security Gate', path: '/cicd' },
    { label: 'Executive Reports', path: '/reports' },
    { label: 'Platform Settings', path: '/settings' },
  ].filter(n => n.label.toLowerCase().includes(q));

  const handleSelect = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#151F33] border border-slate-700 rounded-xl max-w-xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center px-4 py-3 border-b border-slate-800">
          <Search className="w-5 h-5 text-slate-400 mr-3" />
          <input
            type="text"
            placeholder="Search projects, packages, CVEs, or routes (e.g. xz-utils, fastapi)..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none"
          />
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 max-h-96 overflow-y-auto space-y-3">
          {/* Projects */}
          {matchingScans.length > 0 && (
            <div>
              <div className="text-[10px] font-mono uppercase text-slate-500 px-2 mb-1">Projects & Scans</div>
              {matchingScans.slice(0, 3).map(scan => (
                <button
                  key={scan.id}
                  onClick={() => handleSelect(`/scans/${scan.id}`)}
                  className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/70 text-left transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <Shield className="w-4 h-4 text-cyan-400" />
                    <div>
                      <div className="text-sm font-medium text-white group-hover:text-cyan-300">
                        {scan.projectName}
                      </div>
                      <div className="text-xs text-slate-400 font-mono">ID: {scan.id}</div>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">Risk {scan.riskScore}/100</span>
                </button>
              ))}
            </div>
          )}

          {/* Vulnerabilities */}
          {matchingVulns.length > 0 && (
            <div>
              <div className="text-[10px] font-mono uppercase text-slate-500 px-2 mb-1">Vulnerabilities & Advisories</div>
              {matchingVulns.slice(0, 3).map(vuln => (
                <button
                  key={vuln.id}
                  onClick={() => handleSelect('/vulnerabilities')}
                  className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/70 text-left transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <Bug className="w-4 h-4 text-red-400" />
                    <div>
                      <div className="text-sm font-medium text-white group-hover:text-red-300 font-mono">
                        {vuln.id} <span className="text-xs font-sans text-slate-400 font-normal">in {vuln.packageName}</span>
                      </div>
                      <div className="text-xs text-slate-400 truncate max-w-sm">{vuln.title}</div>
                    </div>
                  </div>
                  <span className="text-xs text-red-400 font-mono">{vuln.severity}</span>
                </button>
              ))}
            </div>
          )}

          {/* Navigation */}
          {navItems.length > 0 && (
            <div>
              <div className="text-[10px] font-mono uppercase text-slate-500 px-2 mb-1">Platform Navigation</div>
              {navItems.slice(0, 5).map(item => (
                <button
                  key={item.path}
                  onClick={() => handleSelect(item.path)}
                  className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/70 text-left transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <Package className="w-4 h-4 text-slate-400 group-hover:text-cyan-400" />
                    <span className="text-sm text-slate-200 group-hover:text-white">{item.label}</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400" />
                </button>
              ))}
            </div>
          )}

          {matchingScans.length === 0 && matchingVulns.length === 0 && navItems.length === 0 && (
            <div className="p-6 text-center text-xs text-slate-400 font-mono">
              No matching records found for "{query}"
            </div>
          )}
        </div>

        <div className="p-2.5 bg-slate-900/60 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono px-4">
          <span>Navigate with arrows / click</span>
          <span>ESC to close</span>
        </div>
      </div>
    </div>
  );
};
