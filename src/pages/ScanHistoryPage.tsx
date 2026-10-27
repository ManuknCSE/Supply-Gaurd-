import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAllScans, deleteScanById, resetToDefaultScans } from '../services/scanService';
import { ScanResult, ScanStatus } from '../types/scan';
import { ScanStatusBadge } from '../components/common/ScanStatusBadge';
import { formatDate } from '../utils/formatters';
import { Search, ShieldPlus, Trash2, RotateCcw, Download, ArrowRight } from 'lucide-react';
import { useToast } from '../components/common/NotificationToast';

export const ScanHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [scans, setScans] = useState<ScanResult[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const loadScans = () => {
    fetchAllScans().then(res => setScans(res.scans));
  };

  useEffect(() => {
    loadScans();
  }, []);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteScanById(id);
    loadScans();
    showToast('info', 'Scan Deleted', `Removed scan record ${id}`);
  };

  const handleReset = () => {
    resetToDefaultScans();
    loadScans();
    showToast('success', 'Records Restored', 'Reset scan history to initial demonstration dataset.');
  };

  const filtered = scans.filter(s => {
    const matchesSearch =
      s.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.targetSource.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">
            Software Supply Chain Scan History
          </h1>
          <p className="text-sm text-slate-400">
            Immutable audit trail of previous artifact evaluations and risk attestations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restore Samples</span>
          </button>
          <button
            onClick={() => navigate('/scan/new')}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors shadow-sm"
          >
            <ShieldPlus className="w-4 h-4" />
            <span>New Scan</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#151F33] p-4 rounded-xl border border-slate-800">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by project name, scan ID, or source URL..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-[#0B1020] border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-[#0B1020] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 font-mono"
          >
            <option value="all">All Statuses</option>
            <option value="Safe">Safe</option>
            <option value="Review Required">Review Required</option>
            <option value="High Risk">High Risk</option>
            <option value="Scan Failed">Scan Failed</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#151F33] border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#0B1020] text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Project & Scan ID</th>
                <th className="py-3 px-4">Source & Ecosystem</th>
                <th className="py-3 px-4">Scan Timestamp</th>
                <th className="py-3 px-4">Dependencies</th>
                <th className="py-3 px-4">Vulnerabilities</th>
                <th className="py-3 px-4">SLSA Provenance</th>
                <th className="py-3 px-4">Risk Index</th>
                <th className="py-3 px-4">Gate Decision</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map(scan => (
                <tr
                  key={scan.id}
                  onClick={() => navigate(`/scans/${scan.id}`)}
                  className="hover:bg-slate-800/40 cursor-pointer transition-colors group"
                >
                  <td className="py-3 px-4">
                    <div className="font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {scan.projectName}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">{scan.id}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="capitalize text-slate-300">{scan.sourceType}</span>
                    <div className="text-[10px] text-slate-500 truncate max-w-[160px]">
                      {scan.targetSource}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-400">{formatDate(scan.timestamp)}</td>
                  <td className="py-3 px-4 text-slate-200">
                    {scan.totalDependencies} ({scan.directDependencies} direct)
                  </td>
                  <td className="py-3 px-4">
                    {scan.vulnerabilities.critical > 0 ? (
                      <span className="text-red-400 font-bold">{scan.vulnerabilities.critical} Crit</span>
                    ) : scan.vulnerabilities.high > 0 ? (
                      <span className="text-orange-400 font-bold">{scan.vulnerabilities.high} High</span>
                    ) : (
                      <span className="text-emerald-400">Clean</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-emerald-400">
                    Level {scan.provenance.slsaLevel} Attested
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`font-bold tabular-nums ${
                        scan.riskScore > 60
                          ? 'text-red-400'
                          : scan.riskScore > 30
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {scan.riskScore}
                    </span>
                    <span className="text-slate-500 text-[10px]">/100</span>
                  </td>
                  <td className="py-3 px-4">
                    <ScanStatusBadge status={scan.status} />
                  </td>
                  <td className="py-3 px-4 text-right" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={e => handleDelete(e, scan.id)}
                        className="p-1.5 text-slate-500 hover:text-red-400 rounded hover:bg-slate-800 transition-colors"
                        title="Delete scan record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => navigate(`/scans/${scan.id}`)}
                        className="px-2.5 py-1 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded transition-colors"
                      >
                        Inspect
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400 font-sans">
                    No scan records match the current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
