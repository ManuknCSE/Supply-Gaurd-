import React, { useState } from 'react';
import {
  Search,
  Bell,
  Menu,
  X,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  ChevronDown,
} from 'lucide-react';
import { RECENT_SECURITY_EVENTS } from '../../utils/sampleData';
import { formatRelativeTime } from '../../utils/formatters';

interface HeaderProps {
  onToggleSidebar: () => void;
  onOpenSearch: () => void;
  activeWorkspace: string;
  onSelectWorkspace: (name: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  onOpenSearch,
  activeWorkspace,
  onSelectWorkspace,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);

  const workspaces = [
    'Acme DevSecOps Core',
    'Cloud Infrastructure Team',
    'AI Research & Weights Pipeline',
    'FinTech Payment Gateway',
  ];

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#0B1020]/95 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle & Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400">
          <span className="text-slate-200 font-medium">SupplyGuard AI</span>
          <span aria-hidden="true">/</span>
          <span className="text-cyan-400">Multi-Layer Security Framework</span>
        </div>
      </div>

      {/* Middle: Global Search Trigger Button */}
      <div className="flex-1 max-w-md mx-2">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-3.5 py-1.5 bg-[#151F33] hover:bg-slate-800/80 border border-slate-800 rounded-lg text-xs text-slate-400 transition-colors group shadow-inner"
        >
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400 group-hover:text-cyan-400" />
            <span className="truncate">Search packages, CVEs, or scans...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono bg-slate-900 border border-slate-700 rounded text-slate-400">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Actions: Workspace Selector, Notifications, Profile */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Workspace Dropdown */}
        <div className="relative hidden md:block">
          <button
            onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#151F33] border border-slate-800 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="truncate max-w-[140px]">{activeWorkspace}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showWorkspaceMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-[#151F33] border border-slate-700 rounded-xl shadow-2xl py-2 z-50">
              <div className="px-3 py-1.5 text-[10px] font-mono uppercase text-slate-500">
                Switch Security Workspace
              </div>
              {workspaces.map(w => (
                <button
                  key={w}
                  onClick={() => {
                    onSelectWorkspace(w);
                    setShowWorkspaceMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs transition-colors flex items-center justify-between ${
                    w === activeWorkspace
                      ? 'bg-cyan-500/10 text-cyan-400 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <span className="truncate">{w}</span>
                  {w === activeWorkspace && <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Button */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors relative"
            aria-label="Security notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#151F33] border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
              <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    Security Alerts
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-red-500/20 text-red-400 border border-red-500/30">
                    {RECENT_SECURITY_EVENTS.length}
                  </span>
                </div>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60">
                {RECENT_SECURITY_EVENTS.map(evt => (
                  <div key={evt.id} className="p-3 hover:bg-slate-800/40 transition-colors">
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-200 leading-snug">{evt.message}</p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-1">
                          <span>{evt.source}</span>
                          <span aria-hidden="true">·</span>
                          <span>{formatRelativeTime(evt.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-2.5 bg-slate-900/60 border-t border-slate-800 text-center">
                <a
                  href="/reports"
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-medium inline-flex items-center gap-1"
                >
                  <span>View All Audit Logs</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white border border-cyan-400/30">
            SG
          </div>
          <div className="hidden xl:block text-left">
            <div className="text-xs font-semibold text-white leading-tight">SecOps Analyst</div>
            <div className="text-[10px] text-slate-400 font-mono">admin@supplyguard.io</div>
          </div>
        </div>
      </div>
    </header>
  );
};
