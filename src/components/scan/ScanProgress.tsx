import React from 'react';
import { ScanStage } from '../../types/scan';
import { CheckCircle2, Loader2, Circle, Terminal } from 'lucide-react';

interface ScanProgressProps {
  stages: ScanStage[];
  percent: number;
  currentStageName?: string;
}

export const ScanProgress: React.FC<ScanProgressProps> = ({ stages, percent, currentStageName }) => {
  return (
    <div className="bg-[#151F33] border border-slate-800 rounded-xl p-6 space-y-6">
      {/* Header & Overall Bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Autonomous Pipeline Analysis Active
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {currentStageName || 'Processing artifact verification checks...'}
            </p>
          </div>
          <span className="text-xl font-bold font-mono text-cyan-400 tabular-nums">
            {percent}%
          </span>
        </div>

        {/* Progress Track */}
        <div className="w-full bg-[#0B1020] h-2 rounded-full overflow-hidden border border-slate-800">
          <div
            className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Stage Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
        {stages.map((stage) => {
          const isDone = stage.status === 'completed';
          const isInProgress = stage.status === 'in_progress';

          return (
            <div
              key={stage.stageNumber}
              className={`p-3 rounded-lg border text-xs transition-all ${
                isDone
                  ? 'bg-emerald-500/5 border-emerald-500/30 text-emerald-400'
                  : isInProgress
                  ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300 shadow-md shadow-cyan-500/10'
                  : 'bg-[#0B1020] border-slate-800 text-slate-500'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : isInProgress ? (
                  <Loader2 className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
                ) : (
                  <Circle className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                )}
                <span className="font-mono text-[10px] font-bold">
                  0{stage.stageNumber}
                </span>
              </div>
              <div className="font-semibold truncate text-[11px] text-white">
                {stage.name}
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Stage Terminal Logs */}
      <div className="bg-[#0B1020] border border-slate-800/80 rounded-lg p-4 font-mono text-xs">
        <div className="flex items-center gap-2 text-slate-400 pb-2 border-b border-slate-800/60 mb-2">
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[11px] font-semibold text-slate-300">Live Stage Execution Telemetry</span>
        </div>
        <div className="space-y-1 text-slate-300 max-h-36 overflow-y-auto">
          {stages.flatMap(s => s.logLines).map((log, i) => (
            <div key={i} className="flex items-start gap-2 text-[11px]">
              <span className="text-slate-600 select-none">&gt;</span>
              <span
                className={
                  log.includes('[SUCCESS]')
                    ? 'text-emerald-400'
                    : log.includes('[WARN]')
                    ? 'text-amber-400'
                    : log.includes('[ERROR]')
                    ? 'text-red-400'
                    : 'text-slate-300'
                }
              >
                {log}
              </span>
            </div>
          ))}
          {stages.every(s => s.logLines.length === 0) && (
            <div className="text-slate-500">Initializing scanner daemon...</div>
          )}
        </div>
      </div>
    </div>
  );
};
