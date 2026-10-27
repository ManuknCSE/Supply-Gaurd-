import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShieldPlus,
  History,
  FileCode2,
  GitFork,
  Bug,
  BrainCircuit,
  Blocks,
  GitBranch,
  FileText,
  Settings,
  Shield,
  ChevronDown,
  Layers,
  CheckCircle2,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  activeWorkspace: string;
  onSelectWorkspace: (name: string) => void;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: boolean;
  count?: number;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  activeWorkspace,
}) => {
  const location = useLocation();

  const navGroups: NavGroup[] = [
    {
      group: 'Core Platform',
      items: [
        { label: 'Overview', path: '/', icon: LayoutDashboard },
        { label: 'New Scan', path: '/scan/new', icon: ShieldPlus, highlight: true },
        { label: 'Scan History', path: '/scans', icon: History },
      ],
    },
    {
      group: 'Artifact Analysis',
      items: [
        { label: 'SBOM Explorer', path: '/sbom', icon: FileCode2 },
        { label: 'Dependency Graph', path: '/graph', icon: GitFork },
        { label: 'Vulnerabilities', path: '/vulnerabilities', icon: Bug, count: 7 },
        { label: 'AI Risk Analysis', path: '/risk-analysis', icon: BrainCircuit },
      ],
    },
    {
      group: 'Integrity & Pipeline',
      items: [
        { label: 'Integrity & Blockchain', path: '/integrity', icon: Blocks },
        { label: 'CI/CD Security', path: '/cicd', icon: GitBranch },
        { label: 'Reports', path: '/reports', icon: FileText },
        { label: 'Settings', path: '/settings', icon: Settings },
      ],
    },
  ];

  return (
    <aside
      className={`fixed lg:static top-0 bottom-0 left-0 z-40 w-64 bg-[#10182B] border-r border-slate-800/80 flex flex-col transition-transform duration-200 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white group-hover:scale-105 transition-transform">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
              <span>SupplyGuard</span>
              <span className="text-xs font-mono font-medium text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-1 rounded">AI</span>
            </div>
            <div className="text-[10px] text-slate-400 font-medium">Supply Chain Integrity</div>
          </div>
        </NavLink>
      </div>

      {/* Workspace Switcher Preview */}
      <div className="px-4 py-3 border-b border-slate-800/60 bg-[#0c1220]">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500">Workspace</span>
          <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
            <CheckCircle2 className="w-2.5 h-2.5" /> DevSecOps Active
          </span>
        </div>
        <div className="flex items-center justify-between p-1.5 bg-[#151F33] border border-slate-800 rounded-lg text-xs font-medium text-slate-200">
          <div className="flex items-center gap-2 truncate">
            <Layers className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="truncate">{activeWorkspace}</span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navGroups.map(group => (
          <div key={group.group}>
            <div className="px-3 mb-2 text-[10px] font-mono uppercase tracking-wider text-slate-500">
              {group.group}
            </div>
            <div className="space-y-1">
              {group.items.map(item => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-cyan-500/15 text-cyan-300 font-semibold border border-cyan-500/30'
                        : item.highlight
                        ? 'text-white hover:bg-slate-800/60 bg-slate-800/30 border border-slate-800'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.count !== undefined && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-red-500/20 text-red-400 border border-red-500/30">
                        {item.count}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer / Status */}
      <div className="p-3.5 border-t border-slate-800/80 bg-[#0d1424] text-[11px] text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono text-slate-300">Engine v2.4 (Sepolia)</span>
        </div>
        <span className="text-[10px] font-mono bg-slate-800 px-1.5 py-0.5 rounded text-cyan-400">
          Demo
        </span>
      </div>
    </aside>
  );
};
