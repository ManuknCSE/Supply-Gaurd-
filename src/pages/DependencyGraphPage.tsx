import React, { useState } from 'react';
import { DependencyGraph } from '../components/graph/DependencyGraph';
import { SAMPLE_DEPENDENCIES } from '../utils/sampleData';
import { DependencyNode } from '../types/scan';
import { GitFork, Layers, Info } from 'lucide-react';

export const DependencyGraphPage: React.FC = () => {
  const [selectedDep, setSelectedDep] = useState<DependencyNode | null>(null);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1 flex items-center gap-2.5">
            <GitFork className="w-6 h-6 text-cyan-400" />
            <span>Interactive Supply Chain Dependency Graph</span>
          </h1>
          <p className="text-sm text-slate-400">
            Explore direct and transitive dependency trees, identify vulnerability propagation paths, and inspect node telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-[#151F33] px-3 py-1.5 rounded-lg border border-slate-800">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>Active Scope: fastapi-auth-microservice</span>
        </div>
      </div>

      {/* Main Graph Component */}
      <DependencyGraph
        dependencies={SAMPLE_DEPENDENCIES}
        rootName="fastapi-auth-microservice (Root)"
        onSelectDependency={setSelectedDep}
      />

      {/* Instructional helper card */}
      <div className="bg-[#151F33] border border-slate-800 rounded-xl p-4 text-xs text-slate-300 flex items-start gap-3 leading-relaxed">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-white">Graph Navigation Tips:</strong> Use mouse scroll or pinch to zoom, click and drag the canvas to pan across large dependency graphs. Clicking any dependency node opens the inspection drawer displaying its PURL, cryptographic SHA-256 digest, known CVEs, and SLSA attestation level.
        </div>
      </div>
    </div>
  );
};
