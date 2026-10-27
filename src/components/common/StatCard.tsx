import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  badgeText?: string;
  isDemo?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  change,
  changeType = 'neutral',
  icon: Icon,
  badgeText,
  isDemo,
}) => {
  return (
    <div className="bg-[#151F33] border border-slate-800 rounded-xl p-5 transition-all hover:border-slate-700">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</span>
        <div className="w-8 h-8 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-cyan-400">
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <div className="text-2xl font-bold tracking-tight text-white font-mono tabular-nums">
          {value}
        </div>
        {badgeText && (
          <span className="text-xs text-slate-400 font-mono">
            {badgeText}
          </span>
        )}
      </div>

      <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
        {change && (
          <span
            className={`font-mono font-medium ${
              changeType === 'positive'
                ? 'text-emerald-400'
                : changeType === 'negative'
                ? 'text-red-400'
                : 'text-slate-400'
            }`}
          >
            {change}
          </span>
        )}
        {subtitle && <span>{subtitle}</span>}
        {isDemo && (
          <>
            <span aria-hidden="true">·</span>
            <span className="text-[10px] text-cyan-400/80">Demo</span>
          </>
        )}
      </div>
    </div>
  );
};
