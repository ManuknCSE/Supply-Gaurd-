import React, { useState } from 'react';
import { parseSbomContent, exportSbomJson, ParsedSbomReport } from '../services/sbomService';
import { SAMPLE_CYCLONEDX_JSON } from '../utils/sampleData';
import {
  FileCode2,
  UploadCloud,
  Search,
  Filter,
  Download,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
  FileCheck,
} from 'lucide-react';
import { truncateHash } from '../utils/formatters';
import { useToast } from '../components/common/NotificationToast';

export const SbomExplorerPage: React.FC = () => {
  const { showToast } = useToast();
  const [rawInput, setRawInput] = useState<string>(JSON.stringify(SAMPLE_CYCLONEDX_JSON, null, 2));
  const [parsedReport, setParsedReport] = useState<ParsedSbomReport>(() =>
    parseSbomContent(JSON.stringify(SAMPLE_CYCLONEDX_JSON))
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [ecosystemFilter, setEcosystemFilter] = useState('all');
  const [missingOnly, setMissingOnly] = useState(false);
  const [selectedComp, setSelectedComp] = useState<any | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      try {
        const parsed = parseSbomContent(content);
        setRawInput(content);
        setParsedReport(parsed);
        showToast('success', 'SBOM Parsed Successfully', `Loaded ${parsed.totalComponents} components (${parsed.format})`);
      } catch (err: any) {
        showToast('error', 'Parse Error', err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleExport = () => {
    const jsonStr = exportSbomJson(parsedReport);
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(jsonStr);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `supplyguard-sbom-parsed.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('success', 'Exported', 'Saved parsed SBOM JSON.');
  };

  const filteredComponents = parsedReport.components.filter(c => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.purl.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.license.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEco = ecosystemFilter === 'all' || c.ecosystem === ecosystemFilter;
    const matchesMissing = !missingOnly || (c.missingMetadata && c.missingMetadata.length > 0);
    return matchesSearch && matchesEco && matchesMissing;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">
            Software Bill of Materials (SBOM) Explorer
          </h1>
          <p className="text-sm text-slate-400">
            Inspect CycloneDX and SPDX specifications, validate metadata completeness, and audit licenses.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg cursor-pointer border border-slate-700 transition-colors">
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Upload SBOM File</span>
            <input type="file" accept=".json,.xml" onChange={handleFileUpload} className="hidden" />
          </label>
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Metadata KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#151F33] p-4 rounded-xl border border-slate-800 font-mono">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Standard & Version</span>
          <div className="text-lg font-bold text-white mt-1">
            {parsedReport.format} <span className="text-cyan-400 text-sm">v{parsedReport.version}</span>
          </div>
        </div>

        <div className="bg-[#151F33] p-4 rounded-xl border border-slate-800 font-mono">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total Components</span>
          <div className="text-lg font-bold text-white mt-1 tabular-nums">
            {parsedReport.totalComponents}
          </div>
        </div>

        <div className="bg-[#151F33] p-4 rounded-xl border border-slate-800 font-mono">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Completeness Issues</span>
          <div className="text-lg font-bold mt-1 tabular-nums text-amber-400">
            {parsedReport.missingMetadataCount}{' '}
            <span className="text-xs font-normal text-slate-400">flagged</span>
          </div>
        </div>

        <div className="bg-[#151F33] p-4 rounded-xl border border-slate-800 font-mono">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Primary Target</span>
          <div className="text-sm font-bold text-slate-200 mt-1 truncate">
            {parsedReport.targetComponent?.name || 'fastapi-auth-microservice'}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-[#151F33] p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search package name, license, or PURL..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-[#0B1020] border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={ecosystemFilter}
            onChange={e => setEcosystemFilter(e.target.value)}
            className="bg-[#0B1020] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 font-mono"
          >
            <option value="all">All Ecosystems</option>
            <option value="pypi">PyPI (Python)</option>
            <option value="npm">npm (JavaScript)</option>
            <option value="docker">Docker Containers</option>
            <option value="go">Golang</option>
          </select>

          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={missingOnly}
              onChange={e => setMissingOnly(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-cyan-600 focus:ring-cyan-500"
            />
            <span>Missing Metadata Only</span>
          </label>
        </div>
      </div>

      {/* Components Table */}
      <div className="bg-[#151F33] border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#0B1020] text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Component Name & PURL</th>
                <th className="py-3 px-4">Version</th>
                <th className="py-3 px-4">Ecosystem</th>
                <th className="py-3 px-4">License</th>
                <th className="py-3 px-4">SHA-256 Digest</th>
                <th className="py-3 px-4">Metadata Quality</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredComponents.map(comp => (
                <tr key={comp.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-white">{comp.name}</div>
                    <div className="text-[10px] text-slate-400 truncate max-w-sm">{comp.purl}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-300 font-bold">{comp.version}</td>
                  <td className="py-3 px-4 uppercase text-slate-400">{comp.ecosystem}</td>
                  <td className="py-3 px-4">
                    <span className="text-cyan-400 font-semibold">{comp.license}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-400 text-[11px]" title={comp.sha256Hash}>
                    {truncateHash(comp.sha256Hash, 8, 6)}
                  </td>
                  <td className="py-3 px-4">
                    {comp.missingMetadata && comp.missingMetadata.length > 0 ? (
                      <span className="text-amber-400 font-semibold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Missing {comp.missingMetadata.join(', ')}</span>
                      </span>
                    ) : (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Complete</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setSelectedComp(comp)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] transition-colors"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Component Details Modal */}
      {selectedComp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#151F33] border border-slate-700 rounded-xl max-w-lg w-full shadow-2xl p-6 font-mono text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-base font-bold text-white">{selectedComp.name}</h4>
              <button onClick={() => setSelectedComp(null)} className="text-slate-400 hover:text-white">
                &times;
              </button>
            </div>

            <div className="space-y-2 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Package URL:</span>
                <span className="text-cyan-300 break-all">{selectedComp.purl}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Version:</span>
                <span>{selectedComp.version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Declared License:</span>
                <span className="text-emerald-400">{selectedComp.license}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Supplier / Origin:</span>
                <span>{selectedComp.supplier || 'Not specified in manifest'}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">SHA-256 Checksum:</span>
                <span className="text-slate-200 select-all break-all">{selectedComp.sha256Hash}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedComp(null)}
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
