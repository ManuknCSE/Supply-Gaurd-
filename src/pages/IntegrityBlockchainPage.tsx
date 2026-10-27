import React, { useState } from 'react';
import { IntegrityVerificationCard } from '../components/blockchain/IntegrityVerificationCard';
import { getAllLedgerRecords } from '../services/blockchainService';
import { BlockchainRecord } from '../types/scan';
import { formatDate, truncateHash } from '../utils/formatters';
import {
  Blocks,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Search,
  Database,
  Info,
} from 'lucide-react';
import { useToast } from '../components/common/NotificationToast';

export const IntegrityBlockchainPage: React.FC = () => {
  const { showToast } = useToast();
  const [records] = useState<BlockchainRecord[]>(getAllLedgerRecords());
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedTx, setCopiedTx] = useState<string | null>(null);

  const handleCopy = (tx: string) => {
    navigator.clipboard.writeText(tx);
    setCopiedTx(tx);
    showToast('success', 'Copied to Clipboard', tx);
    setTimeout(() => setCopiedTx(null), 2000);
  };

  const filteredRecords = records.filter(r =>
    r.artifactId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.transactionHash.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.sbomSha256.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.blockchainNetwork.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white mb-1 flex items-center gap-2">
          <Blocks className="w-6 h-6 text-cyan-400" />
          <span>Immutable Ledger & Blockchain Integrity Verification</span>
        </h1>
        <p className="text-sm text-slate-400">
          Cryptographically anchor and verify software bill of materials (SBOM) and build artifacts on public and consortium blockchains.
        </p>
      </div>

      {/* Interactive Verification Card */}
      <IntegrityVerificationCard />

      {/* Audit Ledger Table */}
      <div className="bg-[#151F33] border border-slate-800 rounded-xl overflow-hidden space-y-3">
        <div className="p-4 border-b border-slate-800 bg-[#10182B] flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Notarized Ledger Records ({records.length})
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Immutable history of anchored build receipts and SBOM digests
            </p>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search artifact, network, tx..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-[#0B1020] border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-52 sm:w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#0B1020] text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Artifact ID & Version</th>
                <th className="py-3 px-4">Network & Contract</th>
                <th className="py-3 px-4">SBOM SHA-256 Digest</th>
                <th className="py-3 px-4">Transaction Hash</th>
                <th className="py-3 px-4">Block #</th>
                <th className="py-3 px-4">Registered Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredRecords.map((rec, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-white">{rec.artifactId}</div>
                    <div className="text-[10px] text-slate-400">v{rec.artifactVersion}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-cyan-400 font-semibold">{rec.blockchainNetwork}</div>
                    <div className="text-[10px] text-slate-500">{truncateHash(rec.contractAddress, 8, 6)}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-300 select-all" title={rec.sbomSha256}>
                    {truncateHash(rec.sbomSha256, 8, 6)}
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <span>{truncateHash(rec.transactionHash, 8, 6)}</span>
                      <button
                        onClick={() => handleCopy(rec.transactionHash)}
                        className="p-1 text-slate-500 hover:text-white"
                        title="Copy Tx Hash"
                      >
                        {copiedTx === rec.transactionHash ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-300 tabular-nums">#{rec.blockNumber}</td>
                  <td className="py-3 px-4 text-slate-400">{formatDate(rec.registeredTimestamp)}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                        rec.verificationStatus === 'Verified'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}
                    >
                      {rec.verificationStatus === 'Verified' ? (
                        <ShieldCheck className="w-3 h-3" />
                      ) : (
                        <ShieldAlert className="w-3 h-3" />
                      )}
                      <span>{rec.verificationStatus}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <a
                      href={`https://sepolia.etherscan.io/tx/${rec.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300"
                    >
                      <span>Explorer</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
