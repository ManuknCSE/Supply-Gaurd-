import React from 'react';

export const TableLoadingSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="w-full animate-pulse space-y-3">
      <div className="h-9 bg-slate-800/60 rounded-lg w-full" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 bg-slate-800/40 rounded-lg w-full" />
      ))}
    </div>
  );
};

export const CardLoadingSkeleton: React.FC = () => {
  return (
    <div className="bg-[#151F33] border border-slate-800 rounded-xl p-5 animate-pulse space-y-3">
      <div className="flex justify-between items-center">
        <div className="h-3 bg-slate-800 rounded w-24" />
        <div className="w-7 h-7 bg-slate-800 rounded-lg" />
      </div>
      <div className="h-7 bg-slate-800 rounded w-20" />
      <div className="h-3 bg-slate-800 rounded w-36" />
    </div>
  );
};
