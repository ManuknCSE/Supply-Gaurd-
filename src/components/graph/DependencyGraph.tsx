import React, { useState, useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  MarkerType,
} from '@xyflow/react';
import { DependencyNode } from '../../types/scan';
import {
  Search,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Table as TableIcon,
  Network,
  ShieldCheck,
  AlertTriangle,
  Bug,
  X,
  ExternalLink,
} from 'lucide-react';
import { SeverityBadge } from '../common/SeverityBadge';
import { truncateHash } from '../../utils/formatters';

interface DependencyGraphProps {
  dependencies: DependencyNode[];
  rootName?: string;
  onSelectDependency?: (dep: DependencyNode) => void;
}

export const DependencyGraph: React.FC<DependencyGraphProps> = ({
  dependencies,
  rootName = 'Root Application',
  onSelectDependency,
}) => {
  const [viewMode, setViewMode] = useState<'graph' | 'table'>('graph');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNode, setSelectedNode] = useState<DependencyNode | null>(null);

  // Filter dependencies based on search
  const filteredDeps = useMemo(() => {
    if (!searchTerm) return dependencies;
    return dependencies.filter(d =>
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.version.includes(searchTerm)
    );
  }, [dependencies, searchTerm]);

  // Construct React Flow nodes and edges
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Root Application Node
    nodes.push({
      id: 'root-app',
      position: { x: 400, y: 30 },
      data: { label: rootName, isRoot: true },
      style: {
        background: '#06B6D4',
        color: '#0B1020',
        fontWeight: 'bold',
        borderRadius: '10px',
        padding: '12px 20px',
        border: '2px solid #22D3EE',
        boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)',
        fontSize: '13px',
      },
    });

    const directDeps = dependencies.filter(d => d.isDirect);
    const transitiveDeps = dependencies.filter(d => !d.isDirect);

    // Position direct dependencies in a fan arc
    const directSpacing = 200;
    const directStartX = 400 - ((directDeps.length - 1) * directSpacing) / 2;

    directDeps.forEach((dep, idx) => {
      const x = directStartX + idx * directSpacing;
      const y = 170;

      let bgColor = '#151F33';
      let borderColor = '#334155';
      let textColor = '#F8FAFC';

      const hasCritical = dep.vulnerabilityCount.critical > 0;
      const hasHigh = dep.vulnerabilityCount.high > 0;

      if (hasCritical || hasHigh) {
        borderColor = '#EF4444';
        bgColor = '#2A1520';
      } else if (dep.hasAnomalies) {
        borderColor = '#F59E0B';
        bgColor = '#2A2015';
      } else {
        borderColor = '#10B981';
      }

      const isHighlighted = searchTerm && dep.name.toLowerCase().includes(searchTerm.toLowerCase());

      nodes.push({
        id: dep.id,
        position: { x, y },
        data: { dep, label: `${dep.name}\nv${dep.version}` },
        style: {
          background: bgColor,
          color: textColor,
          border: `2px solid ${isHighlighted ? '#22D3EE' : borderColor}`,
          borderRadius: '8px',
          padding: '10px 14px',
          fontSize: '11px',
          fontFamily: 'monospace',
          boxShadow: isHighlighted ? '0 0 16px rgba(34, 211, 238, 0.6)' : undefined,
          width: 140,
          textAlign: 'center',
          whiteSpace: 'pre-line',
        },
      });

      edges.push({
        id: `e-root-${dep.id}`,
        source: 'root-app',
        target: dep.id,
        type: 'smoothstep',
        animated: dep.hasAnomalies,
        style: { stroke: isHighlighted ? '#22D3EE' : '#475569', strokeWidth: isHighlighted ? 2.5 : 1.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#475569', width: 14, height: 14 },
      });
    });

    // Position transitive dependencies below direct ones
    const transitiveSpacing = 160;
    const transitiveStartX = 400 - ((transitiveDeps.length - 1) * transitiveSpacing) / 2;

    transitiveDeps.forEach((dep, idx) => {
      const x = transitiveStartX + idx * transitiveSpacing;
      const y = 320;

      let borderColor = '#334155';
      let bgColor = '#0F172A';

      if (dep.vulnerabilityCount.critical > 0 || dep.vulnerabilityCount.high > 0) {
        borderColor = '#EF4444';
        bgColor = '#2A1520';
      } else if (dep.hasAnomalies) {
        borderColor = '#F59E0B';
        bgColor = '#2A2015';
      }

      const isHighlighted = searchTerm && dep.name.toLowerCase().includes(searchTerm.toLowerCase());

      nodes.push({
        id: dep.id,
        position: { x, y },
        data: { dep, label: `${dep.name}\nv${dep.version}` },
        style: {
          background: bgColor,
          color: '#CBD5E1',
          border: `1.5px solid ${isHighlighted ? '#22D3EE' : borderColor}`,
          borderRadius: '6px',
          padding: '8px 10px',
          fontSize: '10px',
          fontFamily: 'monospace',
          width: 125,
          textAlign: 'center',
          whiteSpace: 'pre-line',
          boxShadow: isHighlighted ? '0 0 14px rgba(34, 211, 238, 0.6)' : undefined,
        },
      });

      // Connect to parent direct dep or first direct dep
      const parentId = directDeps[idx % Math.max(1, directDeps.length)]?.id || 'root-app';
      edges.push({
        id: `e-${parentId}-${dep.id}`,
        source: parentId,
        target: dep.id,
        type: 'smoothstep',
        style: { stroke: '#334155', strokeWidth: 1.2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#334155', width: 10, height: 10 },
      });
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [dependencies, rootName, searchTerm]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  const handleNodeClick = (_: React.MouseEvent, node: Node) => {
    if (node.data?.dep) {
      setSelectedNode(node.data.dep as DependencyNode);
      if (onSelectDependency) {
        onSelectDependency(node.data.dep as DependencyNode);
      }
    }
  };

  return (
    <div className="bg-[#151F33] border border-slate-800 rounded-xl overflow-hidden flex flex-col h-[650px] relative">
      {/* Top Toolbar */}
      <div className="p-3.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-[#10182B]">
        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-[#0B1020] p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setViewMode('graph')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'graph' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              <span>Interactive Graph</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'table' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Table View</span>
            </button>
          </div>

          {/* Search dependency in graph */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Highlight dependency..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-[#0B1020] border border-slate-800 rounded-lg pl-8 pr-3 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-48 sm:w-60"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-2 text-slate-500 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-400">Verified Safe</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-slate-400">AI Anomaly</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="text-slate-400">Vulnerable</span>
          </div>
        </div>
      </div>

      {/* Main View Body */}
      <div className="flex-1 relative overflow-hidden">
        {viewMode === 'graph' ? (
          <div className="w-full h-full">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={handleNodeClick}
              fitView
              attributionPosition="bottom-left"
            >
              <Background color="#1E293B" gap={16} size={1} />
              <Controls />
            </ReactFlow>
          </div>
        ) : (
          /* Fallback / togglable table view */
          <div className="h-full overflow-y-auto p-4">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#0B1020] text-slate-400 uppercase text-[10px] tracking-wider sticky top-0 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Component</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Ecosystem</th>
                  <th className="py-2.5 px-3">License</th>
                  <th className="py-2.5 px-3">SLSA Attestation</th>
                  <th className="py-2.5 px-3">Integrity</th>
                  <th className="py-2.5 px-3">Findings</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredDeps.map(dep => (
                  <tr key={dep.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-white">{dep.name}</div>
                      <div className="text-[10px] text-slate-400">{dep.version}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={dep.isDirect ? 'text-cyan-400' : 'text-slate-400'}>
                        {dep.isDirect ? 'Direct' : 'Transitive'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 uppercase">{dep.ecosystem}</td>
                    <td className="py-2.5 px-3 text-slate-300">{dep.license}</td>
                    <td className="py-2.5 px-3 text-emerald-400">Level {dep.slsaLevel}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[10px] ${
                          dep.integrityStatus === 'verified'
                            ? 'text-emerald-400 bg-emerald-500/10'
                            : 'text-red-400 bg-red-500/10'
                        }`}
                      >
                        {dep.integrityStatus}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      {dep.vulnerabilityCount.critical > 0 ? (
                        <span className="text-red-400 font-bold">1 Critical CVE</span>
                      ) : dep.hasAnomalies ? (
                        <span className="text-amber-400 font-bold">Anomaly Alert</span>
                      ) : (
                        <span className="text-slate-500">None</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => setSelectedNode(dep)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Selected Node Details Drawer */}
        {selectedNode && (
          <div className="absolute top-0 right-0 bottom-0 w-80 sm:w-96 bg-[#10182B]/95 backdrop-blur-md border-l border-slate-700 shadow-2xl p-5 z-20 overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold">
                  Node Inspector
                </span>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <h4 className="text-base font-bold text-white font-mono">{selectedNode.name}</h4>
                <div className="text-xs text-slate-400 font-mono mt-0.5">Version {selectedNode.version}</div>
              </div>

              <div className="bg-[#151F33] p-3 rounded-lg border border-slate-800 space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Dependency Type:</span>
                  <span className="text-slate-200">{selectedNode.isDirect ? 'Direct' : 'Transitive'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Ecosystem:</span>
                  <span className="text-slate-200 uppercase">{selectedNode.ecosystem}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">License:</span>
                  <span className="text-cyan-400">{selectedNode.license}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">SLSA Provenance:</span>
                  <span className="text-emerald-400">Level {selectedNode.slsaLevel} Attested</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Integrity Digest:</span>
                  <span className="text-slate-300 font-mono text-[10px]" title={selectedNode.sha256Hash}>
                    {truncateHash(selectedNode.sha256Hash, 8, 6)}
                  </span>
                </div>
              </div>

              {/* Anomalies alert if present */}
              {selectedNode.hasAnomalies && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold mb-1">
                    <AlertTriangle className="w-4 h-4" />
                    <span>AI Heuristic Risk Signal</span>
                  </div>
                  <ul className="list-disc list-inside text-amber-200/80 space-y-1 text-[11px]">
                    {selectedNode.anomalyReasons?.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Vulnerabilities */}
              {selectedNode.vulnerabilityCount.critical > 0 || selectedNode.vulnerabilityCount.high > 0 ? (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-xs">
                  <div className="flex items-center gap-1.5 text-red-400 font-bold mb-1">
                    <Bug className="w-4 h-4" />
                    <span>Security Vulnerabilities Detected</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    This component has known CVE advisories. Review remediation instructions in the Vulnerabilities tab.
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs flex items-center gap-2 text-emerald-400">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>No known CVEs reported in national databases.</span>
                </div>
              )}

              <div className="pt-2">
                <a
                  href={`https://www.google.com/search?q=${encodeURIComponent(selectedNode.name + ' ' + selectedNode.ecosystem + ' vulnerability')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-lg transition-colors border border-slate-700"
                >
                  <span>Search Upstream Package</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
