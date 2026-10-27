import React from 'react';
import { ScanStatus } from '../../types/scan';
import { getScanStatusClasses } from '../../utils/formatters';

interface ScanStatusBadgeProps {
  status: ScanStatus;
}

export const ScanStatusBadge: React.FC<ScanStatusBadgeProps> = ({ status }) => {
  const { badge, dot } = getScanStatusClasses(status);

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium border ${badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      <span>{status}</span>
    </span>
  );
};
