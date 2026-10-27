import React from 'react';
import { getRiskTier } from '../../utils/formatters';

interface RiskGaugeProps {
  score: number; // 0 to 100
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({ score, size = 'md', showLabel = true }) => {
  const normalizedScore = Math.max(0, Math.min(100, score));
  const { label, color, textColor } = getRiskTier(normalizedScore);

  const config = {
    sm: { radius: 28, stroke: 5, width: 70, height: 70, fontSize: 'text-sm' },
    md: { radius: 46, stroke: 7, width: 110, height: 110, fontSize: 'text-2xl' },
    lg: { radius: 64, stroke: 9, width: 150, height: 150, fontSize: 'text-3xl' },
  }[size];

  const circumference = 2 * Math.PI * config.radius;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center" style={{ width: config.width, height: config.height }}>
        <svg className="transform -rotate-90" width={config.width} height={config.height}>
          {/* Background Track */}
          <circle
            cx={config.width / 2}
            cy={config.height / 2}
            r={config.radius}
            stroke="#1E293B"
            strokeWidth={config.stroke}
            fill="transparent"
          />
          {/* Progress Ring */}
          <circle
            cx={config.width / 2}
            cy={config.height / 2}
            r={config.radius}
            stroke={color}
            strokeWidth={config.stroke}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center Score Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className={`font-mono font-bold tabular-nums text-white ${config.fontSize}`}>
            {normalizedScore}
          </span>
          {size !== 'sm' && (
            <span className="text-[10px] text-slate-400 font-mono">/ 100</span>
          )}
        </div>
      </div>

      {showLabel && (
        <div className="mt-2 text-center">
          <span className={`text-xs font-semibold tracking-wide ${textColor}`}>
            {label}
          </span>
        </div>
      )}
    </div>
  );
};
