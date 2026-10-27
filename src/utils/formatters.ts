import { Severity, ScanStatus, PolicyDecision } from '../types/scan';

export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(d);
  } catch {
    return dateString;
  }
}

export function formatRelativeTime(dateString: string): string {
  try {
    const d = new Date(dateString);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diffSec < 60) return `${diffSec}s ago`;
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return `${Math.floor(diffSec / 86400)}d ago`;
  } catch {
    return dateString;
  }
}

export function truncateHash(hash: string, front: number = 6, back: number = 4): string {
  if (!hash) return '';
  if (hash.length <= front + back) return hash;
  return `${hash.slice(0, front)}...${hash.slice(-back)}`;
}

export function getSeverityClasses(severity: Severity): {
  badge: string;
  text: string;
  border: string;
  bg: string;
} {
  switch (severity.toLowerCase()) {
    case 'critical':
      return {
        badge: 'bg-red-500/10 text-red-400 border-red-500/30',
        text: 'text-red-400',
        border: 'border-red-500/30',
        bg: 'bg-red-500/10',
      };
    case 'high':
      return {
        badge: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
        text: 'text-orange-400',
        border: 'border-orange-500/30',
        bg: 'bg-orange-500/10',
      };
    case 'medium':
      return {
        badge: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
        text: 'text-amber-300',
        border: 'border-amber-500/30',
        bg: 'bg-amber-500/10',
      };
    case 'low':
      return {
        badge: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
        text: 'text-cyan-300',
        border: 'border-cyan-500/30',
        bg: 'bg-cyan-500/10',
      };
    default:
      return {
        badge: 'bg-slate-500/10 text-slate-300 border-slate-500/30',
        text: 'text-slate-300',
        border: 'border-slate-500/30',
        bg: 'bg-slate-500/10',
      };
  }
}

export function getScanStatusClasses(status: ScanStatus): {
  badge: string;
  dot: string;
} {
  switch (status) {
    case 'Safe':
      return {
        badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        dot: 'bg-emerald-400',
      };
    case 'Review Required':
      return {
        badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        dot: 'bg-amber-400',
      };
    case 'High Risk':
      return {
        badge: 'bg-red-500/10 text-red-400 border-red-500/30',
        dot: 'bg-red-400',
      };
    case 'Scanning':
      return {
        badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
        dot: 'bg-cyan-400 animate-pulse',
      };
    case 'Scan Failed':
    default:
      return {
        badge: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
        dot: 'bg-slate-400',
      };
  }
}

export function getPolicyDecisionClasses(decision: PolicyDecision): {
  badge: string;
  text: string;
} {
  switch (decision) {
    case 'ALLOW':
      return {
        badge: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
        text: 'text-emerald-400',
      };
    case 'REVIEW':
      return {
        badge: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
        text: 'text-amber-400',
      };
    case 'BLOCK':
      return {
        badge: 'bg-red-500/15 text-red-400 border border-red-500/30',
        text: 'text-red-400',
      };
  }
}

export function getRiskTier(score: number): {
  label: string;
  color: string;
  textColor: string;
  bgTier: string;
} {
  if (score < 25) {
    return {
      label: 'Low Risk',
      color: '#10B981',
      textColor: 'text-emerald-400',
      bgTier: 'bg-emerald-500/10 border-emerald-500/30',
    };
  }
  if (score < 50) {
    return {
      label: 'Moderate Risk',
      color: '#06B6D4',
      textColor: 'text-cyan-400',
      bgTier: 'bg-cyan-500/10 border-cyan-500/30',
    };
  }
  if (score < 75) {
    return {
      label: 'Elevated Risk',
      color: '#F59E0B',
      textColor: 'text-amber-400',
      bgTier: 'bg-amber-500/10 border-amber-500/30',
    };
  }
  return {
    label: 'Critical Risk',
    color: '#EF4444',
    textColor: 'text-red-400',
    bgTier: 'bg-red-500/10 border-red-500/30',
  };
}
