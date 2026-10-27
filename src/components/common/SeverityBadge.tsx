import React from 'react';
import { Severity } from '../../types/scan';
import { getSeverityClasses } from '../../utils/formatters';

interface SeverityBadgeProps {
  severity: Severity;
  score?: number;
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity, score }) => {
  const { badge } = getSeverityClasses(severity);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono font-medium border ${badge}`}
    >
      <span className="capitalize">{severity}</span>
      {score !== undefined && (
        <span className="opacity-80 tabular-nums">({score.toFixed(1)})</span>
      )}
    </span>
  );
};
