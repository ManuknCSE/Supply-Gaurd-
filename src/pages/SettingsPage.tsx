import React, { useState, useEffect } from 'react';
import {
  Settings,
  Server,
  Shield,
  Blocks,
  Bell,
  Save,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sliders,
  User,
  Layers,
} from 'lucide-react';
import { checkBackendConnection, getApiStatus, setDemoModeOverride, ApiStatus } from '../services/apiClient';
import { useToast } from '../components/common/NotificationToast';

export const SettingsPage: React.FC = () => {
  const { showToast } = useToast();

  const [apiStatus, setApiStatus] = useState<ApiStatus>(getApiStatus());
  const [isCheckingApi, setIsCheckingApi] = useState(false);

  // Form states
  const [workspaceName, setWorkspaceName] = useState('Acme DevSecOps Core');
  const [orgDomain, setOrgDomain] = useState('acme-corp.internal');
  const [selectedNetwork, setSelectedNetwork] = useState('Ethereum Sepolia Testnet');
  const [notaryAddress, setNotaryAddress] = useState('0x4E7A13C0d9D0B58c4Fa6C35F79E8990c74169584');
  const [defaultScanDepth, setDefaultScanDepth] = useState<'transitive' | 'direct'>('transitive');
  const [scanTimeoutSeconds, setScanTimeoutSeconds] = useState(120);

  // Notification toggles
  const [notifySlack, setNotifySlack] = useState(true);
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyCriticalOnly, setNotifyCriticalOnly] = useState(false);

  // Demo mode toggle
  const [demoMode, setDemoMode] = useState(apiStatus.isDemoMode);

  const handleTestApiConnection = async () => {
    setIsCheckingApi(true);
    try {
      const res = await checkBackendConnection();
      setApiStatus(res);
      if (res.isConnected) {
        showToast('success', 'Backend Connected', `FastAPI backend active (${res.latencyMs}ms latency)`);
      } else {
        showToast('info', 'Demo Mode Active', 'No live backend detected on VITE_API_BASE_URL. Using sample dataset.');
      }
    } finally {
      setIsCheckingApi(false);
    }
  };

  const handleToggleDemoMode = (enabled: boolean) => {
    setDemoMode(enabled);
    setDemoModeOverride(enabled);
    showToast('info', 'Operation Mode Changed', enabled ? 'Switched to Demo Simulation Mode' : 'Switched to Live API Mode');
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('success', 'Settings Saved', 'Workspace configuration and security policies updated.');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white mb-1 flex items-center gap-2">
          <Settings className="w-6 h-6 text-cyan-400" />
          <span>Platform Settings & Workspace Configuration</span>
        </h1>
        <p className="text-sm text-slate-400">
          Manage API connectivity, blockchain notary contracts, automated notifications, and scan preferences.
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Backend API Connection Status */}
        <div className="bg-[#151F33] border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Server className="w-4 h-4 text-cyan-400" />
              <span>Backend API Connection Status</span>
            </h3>
            <button
              type="button"
              onClick={handleTestApiConnection}
              disabled={isCheckingApi}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isCheckingApi ? 'animate-spin text-cyan-400' : ''}`} />
              <span>{isCheckingApi ? 'Testing...' : 'Test Connection'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-3 bg-[#0B1020] rounded-lg border border-slate-800 space-y-1.5">
              <div className="text-slate-400">Configured Endpoint (VITE_API_BASE_URL):</div>
              <div className="text-white font-bold">{apiStatus.baseUrl}</div>
              <div className="text-[11px] text-slate-500">
                {apiStatus.isConnected ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Live Backend Online ({apiStatus.latencyMs}ms)
                  </span>
                ) : (
                  <span className="text-cyan-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Standalone Demo Mode Active
                  </span>
                )}
              </div>
            </div>

            <div className="p-3 bg-[#0B1020] rounded-lg border border-slate-800 space-y-1.5">
              <div className="text-slate-400">Simulation / Prototype Mode:</div>
              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={demoMode}
                  onChange={e => handleToggleDemoMode(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-cyan-600 focus:ring-cyan-500"
                />
                <span className="text-slate-200 font-sans">
                  Enforce Simulated Demonstrations (Independent of Backend API)
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Workspace & Team Configuration */}
        <div className="bg-[#151F33] border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Workspace & Identity</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <label className="block text-slate-400 mb-1">Active Security Workspace</label>
              <input
                type="text"
                value={workspaceName}
                onChange={e => setWorkspaceName(e.target.value)}
                className="w-full bg-[#0B1020] border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Organization Domain</label>
              <input
                type="text"
                value={orgDomain}
                onChange={e => setOrgDomain(e.target.value)}
                className="w-full bg-[#0B1020] border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Blockchain Notary Configuration */}
        <div className="bg-[#151F33] border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Blocks className="w-4 h-4 text-cyan-400" />
              <span>Blockchain Notary Ledger Settings</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <label className="block text-slate-400 mb-1">Target Notary Blockchain</label>
              <select
                value={selectedNetwork}
                onChange={e => setSelectedNetwork(e.target.value)}
                className="w-full bg-[#0B1020] border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="Ethereum Sepolia Testnet">Ethereum Sepolia Testnet</option>
                <option value="Polygon Amoy Testnet">Polygon Amoy Testnet</option>
                <option value="Arbitrum Sepolia">Arbitrum Sepolia Testnet</option>
                <option value="Enterprise Private Quorum">Enterprise Private Quorum</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Notary Smart Contract Address</label>
              <input
                type="text"
                value={notaryAddress}
                onChange={e => setNotaryAddress(e.target.value)}
                className="w-full bg-[#0B1020] border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="text-[11px] text-slate-500 font-mono">
            * Security guarantee: Private keys and transaction signing are handled strictly via isolated secure HSM/KMS. No private keys are ever stored or processed in the web client.
          </div>
        </div>

        {/* Notifications & Webhooks */}
        <div className="bg-[#151F33] border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Bell className="w-4 h-4 text-cyan-400" />
              <span>Notification Dispatches & Alert Channels</span>
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notifySlack}
                onChange={e => setNotifySlack(e.target.checked)}
                className="rounded bg-slate-900 border-slate-700 text-cyan-600 focus:ring-cyan-500"
              />
              <span className="text-slate-300">
                Dispatch alerts to <strong className="text-white font-mono">#security-devsecops</strong> Slack channel
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notifyEmail}
                onChange={e => setNotifyEmail(e.target.checked)}
                className="rounded bg-slate-900 border-slate-700 text-cyan-600 focus:ring-cyan-500"
              />
              <span className="text-slate-300">
                Email daily summary digest to <strong className="text-white font-mono">secops-team@acme.internal</strong>
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notifyCriticalOnly}
                onChange={e => setNotifyCriticalOnly(e.target.checked)}
                className="rounded bg-slate-900 border-slate-700 text-cyan-600 focus:ring-cyan-500"
              />
              <span className="text-slate-300">
                Silence informational and medium findings; alert on <strong className="text-red-400 font-mono">Critical CVEs</strong> and <strong className="text-red-400 font-mono">Integrity Mismatches</strong> only
              </span>
            </label>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-cyan-600/20"
          >
            <Save className="w-4 h-4" />
            <span>Save All Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
