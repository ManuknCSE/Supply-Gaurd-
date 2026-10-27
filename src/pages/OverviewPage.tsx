import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  ShieldCheck,
  FolderGit2,
  Package,
  Layers,
  GitBranch,
  ShieldPlus,
  FileText,
  ArrowRight,
  ExternalLink,
  Download,
  RotateCw,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from 'recharts';
import { StatCard } from '../components/common/StatCard';
import { ScanStatusBadge } from '../components/common/ScanStatusBadge';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { fetchAllScans } from '../services/scanService';
import { ScanResult } from '../types/scan';
import { formatDate, formatRelativeTime } from '../utils/formatters';
import { RECENT_SECURITY_EVENTS } from '../utils/sampleData';
import { useToast } from '../components/common/NotificationToast';

export const OverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [scans, setScans] = useState<ScanResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(true);

  useEffect(() => {
    fetchAllScans()
      .then(res => {
        setScans(res.scans);
        setIsDemo(res.isDemo);
      })
      .catch(err => {
        console.error('Failed fetching scans', err);
      })
      .finally(() => setLoading(false));
  }, []);

  // Summary Metrics
  const totalProjects = scans.length;
  const totalDependencies = scans.reduce((acc, s) => acc + s.totalDependencies, 0);
  const totalVulnerabilities = scans.reduce((acc, s) => acc + s.vulnerabilities.total, 0);
  const criticalVulns = scans.reduce((acc, s) => acc + s.vulnerabilities.critical, 0);
  const highVulns = scans.reduce((acc, s) => acc + s.vulnerabilities.high, 0);
  const suspiciousPackages = scans.reduce((acc, s) => acc + s.suspiciousPackagesCount, 0);

  // Charts Data
  const severityDistribution = [
    { name: 'Critical', value: criticalVulns, color: '#EF4444' },
    { name: 'High', value: highVulns, color: '#F97316' },
    { name: 'Medium', value: 8, color: '#F59E0B' },
    { name: 'Low', value: 4, color: '#06B6D4' },
  ];

  const riskTrendData = [
    { date: 'Oct 20', avgRisk: 24, scans: 2 },
    { date: 'Oct 21', avgRisk: 28, scans: 4 },
    { date: 'Oct 22', avgRisk: 31, scans: 3 },
    { date: 'Oct 23', avgRisk: 22, scans: 6 },
    { date: 'Oct 24', avgRisk: 18, scans: 5 },
    { date: 'Oct 25', avgRisk: 36, scans: 8 },
    { date: 'Oct 26', avgRisk: 44, scans: 9 },
  ];

  const scanActivityData = [
    { day: 'Mon', count: 12, passed: 10, flagged: 2 },
    { day: 'Tue', count: 18, passed: 15, flagged: 3 },
    { day: 'Wed', count: 15, passed: 13, flagged: 2 },
    { day: 'Thu', count: 22, passed: 18, flagged: 4 },
    { day: 'Fri', count: 28, passed: 22, flagged: 6 },
    { day: 'Sat', count: 9, passed: 8, flagged: 1 },
    { day: 'Sun', count: 7, passed: 7, flagged: 0 },
  ];

  // Top Risky Dependencies
  const topRiskyDependencies = [
    { name: 'xz-utils', version: '5.6.0', riskScore: 98, issue: 'Critical Backdoor (CVE-2024-3094)', ecosystem: 'docker' },
    { name: 'color-chalk-fast', version: '1.0.4', riskScore: 89, issue: 'Typosquatting & curl postinstall', ecosystem: 'npm' },
    { name: 'urllib3', version: '1.26.17', riskScore: 75, issue: 'HTTP/2 Rapid Reset (CVE-2023-44487)', ecosystem: 'pypi' },
    { name: 'libwebp', version: '1.3.1', riskScore: 92, issue: 'Heap Buffer Overflow (CVE-2023-4863)', ecosystem: 'docker' },
  ];

  const handleDownloadSbom = (e: React.MouseEvent, scan: ScanResult) => {
    e.stopPropagation();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(scan, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${scan.projectName}-cyclonedx-sbom.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('success', 'SBOM Downloaded', `${scan.projectName} CycloneDX JSON exported.`);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#10182B] via-[#151F33] to-[#10182B] border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-2 text-xs font-mono text-cyan-400">
              <Sparkles className="w-4 h-4" />
              <span>Multi-Layer Supply Chain Assurance</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-400">Continuous Attestation</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-2">
              Software Supply Chain Security
            </h1>
            <p className="text-sm md:text-base text-slate-300 leading-relaxed">
              Discover vulnerabilities, detect suspicious dependencies, and verify software integrity with SLSA provenance and cryptographic notary proofs.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => navigate('/scan/new')}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-xl transition-all shadow-lg shadow-cyan-600/20 group"
            >
              <ShieldPlus className="w-4 h-4 text-white" />
              <span>Start New Scan</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => navigate('/reports')}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-xl transition-colors"
            >
              <FileText className="w-4 h-4 text-slate-400" />
              <span>View Reports</span>
            </button>
          </div>
        </div>

        {/* Subtle decorative glow */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Projects Scanned"
          value={totalProjects}
          subtitle="across 4 ecosystems"
          icon={FolderGit2}
          isDemo={isDemo}
        />
        <StatCard
          title="Dependencies"
          value={totalDependencies}
          subtitle="direct & transitive"
          icon={Package}
          isDemo={isDemo}
        />
        <StatCard
          title="Vulnerabilities"
          value={totalVulnerabilities}
          subtitle={`${criticalVulns} crit · ${highVulns} high`}
          change={`${criticalVulns} Critical`}
          changeType={criticalVulns > 0 ? 'negative' : 'positive'}
          icon={ShieldAlert}
          isDemo={isDemo}
        />
        <StatCard
          title="Suspicious Pkgs"
          value={suspiciousPackages}
          subtitle="AI heuristic alerts"
          change={suspiciousPackages > 0 ? 'Action Req' : 'Clear'}
          changeType={suspiciousPackages > 0 ? 'negative' : 'positive'}
          icon={AlertTriangle}
          isDemo={isDemo}
        />
        <StatCard
          title="Integrity Status"
          value="98.2%"
          subtitle="ledger anchored"
          change="Sepolia Verified"
          changeType="positive"
          icon={ShieldCheck}
          isDemo={isDemo}
        />
        <StatCard
          title="CI/CD Pipelines"
          value="4 Active"
          subtitle="enforcing gate policy"
          icon={GitBranch}
          isDemo={isDemo}
        />
      </div>

      {/* Analytics Section: Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Severity Distribution Donut */}
        <div className="bg-[#151F33] border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Vulnerability Severity
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Known CVEs and advisory alerts</p>
            </div>
            <span className="text-xs text-slate-400 font-mono">Total {totalVulnerabilities}</span>
          </div>

          <div className="h-56 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityDistribution}
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {severityDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#151F33" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0B1020',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold font-mono text-white tabular-nums">
                {totalVulnerabilities}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Findings</span>
            </div>
          </div>

          {/* Clean metadata legend (anti-pill) */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-xs font-mono">
            {severityDistribution.map(item => (
              <div key={item.name} className="flex items-center justify-between text-slate-300">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name}:</span>
                </div>
                <span className="font-bold tabular-nums text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Trend Over Time */}
        <div className="bg-[#151F33] border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Risk Trend Over Time
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Average composite risk index (7 days)</p>
            </div>
            <span className="text-xs text-cyan-400 font-mono">Daily Rollup</span>
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={riskTrendData}>
                <defs>
                  <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} domain={[0, 60]} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0B1020',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="avgRisk"
                  stroke="#06B6D4"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#riskGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Peak Risk: 44/100 (Oct 26)</span>
            <span>Target Threshold: &lt; 25</span>
          </div>
        </div>

        {/* Scan Activity Timeline */}
        <div className="bg-[#151F33] border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Scan Activity Timeline
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Pipeline passes vs. security flags</p>
            </div>
            <span className="text-xs text-emerald-400 font-mono">111 Scans</span>
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scanActivityData}>
                <XAxis dataKey="day" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0B1020',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                  }}
                />
                <Bar dataKey="passed" fill="#10B981" radius={[3, 3, 0, 0]} stackId="a" />
                <Bar dataKey="flagged" fill="#EF4444" radius={[3, 3, 0, 0]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Passed Policy</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              <span>Flagged / Blocked</span>
            </span>
          </div>
        </div>
      </div>

      {/* Top Risky Dependencies & Recent Security Events Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Risky Dependencies */}
        <div className="bg-[#151F33] border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Top Risky Dependencies
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Components requiring immediate remediation</p>
            </div>
            <button
              onClick={() => navigate('/vulnerabilities')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1"
            >
              <span>Inspect All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {topRiskyDependencies.map(dep => (
              <div
                key={dep.name}
                className="p-3 bg-[#0B1020] border border-slate-800 rounded-lg flex items-center justify-between hover:border-slate-700 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-white text-xs">{dep.name}</span>
                    <span className="text-[10px] font-mono text-slate-400">v{dep.version}</span>
                    <span className="text-[10px] font-mono uppercase text-slate-500 bg-slate-800 px-1.5 py-0.2 rounded">
                      {dep.ecosystem}
                    </span>
                  </div>
                  <div className="text-xs text-red-400 font-mono mt-1">{dep.issue}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-red-400 tabular-nums">
                    Score {dep.riskScore}
                  </div>
                  <button
                    onClick={() => navigate('/vulnerabilities')}
                    className="text-[11px] text-cyan-400 hover:underline font-mono mt-0.5 inline-block"
                  >
                    Remediate
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Security Events Stream */}
        <div className="bg-[#151F33] border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Recent Security Events
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Real-time notary attestation and anomaly alerts</p>
            </div>
            <span className="text-xs text-slate-400 font-mono">Live Stream</span>
          </div>

          <div className="space-y-3">
            {RECENT_SECURITY_EVENTS.map(evt => (
              <div
                key={evt.id}
                className="p-3 bg-[#0B1020] border border-slate-800 rounded-lg flex items-start gap-3"
              >
                <div
                  className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                    evt.severity === 'critical'
                      ? 'bg-red-400 animate-pulse'
                      : evt.severity === 'high'
                      ? 'bg-amber-400'
                      : 'bg-emerald-400'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-slate-200 leading-snug">{evt.message}</div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-1">
                    <span className="text-cyan-400">{evt.source}</span>
                    <span aria-hidden="true">·</span>
                    <span>{formatRelativeTime(evt.timestamp)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Scans Table */}
      <div className="bg-[#151F33] border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 bg-[#10182B] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Recent Scans</h3>
            <p className="text-xs text-slate-400 mt-0.5">Detailed software bill of materials and risk evaluations</p>
          </div>
          <button
            onClick={() => navigate('/scans')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1"
          >
            <span>View Full History</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#0B1020] text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Project</th>
                <th className="py-3 px-4">Source</th>
                <th className="py-3 px-4">Scan Date</th>
                <th className="py-3 px-4">Dependencies</th>
                <th className="py-3 px-4">Vulnerabilities</th>
                <th className="py-3 px-4">Risk Score</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {scans.map(scan => (
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
                    <span className="text-slate-400 capitalize">{scan.sourceType}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-400">{formatDate(scan.timestamp)}</td>
                  <td className="py-3 px-4">
                    <span className="text-slate-200 tabular-nums">{scan.totalDependencies}</span>
                    <span className="text-slate-500 ml-1 text-[10px]">({scan.directDependencies} direct)</span>
                  </td>
                  <td className="py-3 px-4">
                    {scan.vulnerabilities.critical > 0 ? (
                      <span className="text-red-400 font-bold">{scan.vulnerabilities.critical} Crit</span>
                    ) : scan.vulnerabilities.high > 0 ? (
                      <span className="text-orange-400 font-bold">{scan.vulnerabilities.high} High</span>
                    ) : (
                      <span className="text-emerald-400">0 High/Crit</span>
                    )}
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
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={e => handleDownloadSbom(e, scan)}
                        className="p-1.5 text-slate-400 hover:text-cyan-400 rounded hover:bg-slate-800 transition-colors"
                        title="Download CycloneDX SBOM"
                      >
                        <Download className="w-3.5 h-3.5" />
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
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
