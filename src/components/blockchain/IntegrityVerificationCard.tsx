import React, { useState } from 'react';
import {
  calculateSha256,
  calculateFileSha256,
} from '../../utils/hashUtils';
import {
  verifyHashAgainstLedger,
  registerEvidenceOnLedger,
  VerificationResult,
} from '../../services/blockchainService';
import {
  CheckCircle2,
  AlertTriangle,
  UploadCloud,
  FileCheck2,
  Copy,
  Check,
  ExternalLink,
  ShieldAlert,
  PlusCircle,
  Database,
} from 'lucide-react';
import { truncateHash, formatDate } from '../../utils/formatters';
import { useToast } from '../common/NotificationToast';

export const IntegrityVerificationCard: React.FC = () => {
  const [hashInput, setHashInput] = useState('');
  const [activeTab, setActiveTab] = useState<'paste' | 'file'>('paste');
  const [isHashing, setIsHashing] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  // Registration modal form state
  const [regArtifactId, setRegArtifactId] = useState('pkg:npm/my-secure-service@1.0.0');
  const [regVersion, setRegVersion] = useState('1.0.0');
  const [regSbomHash, setRegSbomHash] = useState('');
  const [regArtifactHash, setRegArtifactHash] = useState('');
  const [regNetwork, setRegNetwork] = useState('Ethereum Sepolia Testnet');

  const { showToast } = useToast();

  const handleVerify = () => {
    if (!hashInput.trim()) {
      showToast('warning', 'Input Required', 'Please enter a SHA-256 hash or calculate one from a file.');
      return;
    }
    const result = verifyHashAgainstLedger(hashInput);
    setVerificationResult(result);
    if (result.isVerified) {
      showToast('success', 'Artifact Verified', 'Cryptographic equality confirmed against immutable notary ledger.');
    } else {
      showToast('error', 'Verification Failed', result.explanation);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsHashing(true);
    try {
      const computed = await calculateFileSha256(file);
      setHashInput(computed);
      const result = verifyHashAgainstLedger(computed);
      setVerificationResult(result);
      showToast('info', 'Hash Calculated', `Generated SHA-256 for ${file.name}`);
    } catch (err: any) {
      showToast('error', 'Hashing Error', err.message);
    } finally {
      setIsHashing(false);
    }
  };

  const handleRegisterEvidence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regSbomHash || !regArtifactId) {
      showToast('warning', 'Incomplete Form', 'Please fill in artifact identifier and SBOM hash.');
      return;
    }

    const newRecord = registerEvidenceOnLedger({
      artifactId: regArtifactId,
      artifactVersion: regVersion,
      sbomSha256: regSbomHash,
      artifactSha256: regArtifactHash || regSbomHash,
      network: regNetwork,
    });

    showToast('success', 'Evidence Anchored', `Transaction notarized at block #${newRecord.blockNumber}`);
    setShowRegisterModal(false);
    setHashInput(regSbomHash);
    setVerificationResult(verifyHashAgainstLedger(regSbomHash));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(true);
    showToast('success', 'Copied to Clipboard', text);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="bg-[#151F33] border border-slate-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-800 bg-[#10182B] flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-cyan-400" />
            <span>Cryptographic Ledger Verification</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Compare local artifact or SBOM digest against immutable smart contract notary proofs.
          </p>
        </div>

        <button
          onClick={() => {
            setRegSbomHash(hashInput || '8b5f3a093b16954aefb32189cd5f8121609139265f212f4581aa20490b4d4538');
            setShowRegisterModal(true);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Register New Evidence</span>
        </button>
      </div>

      {/* Input area */}
      <div className="p-5 space-y-4">
        {/* Toggle between paste and file */}
        <div className="flex gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('paste')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'paste'
                ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Paste SHA-256 Digest
          </button>
          <button
            onClick={() => setActiveTab('file')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'file'
                ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Calculate from Local File
          </button>
        </div>

        {activeTab === 'paste' ? (
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1.5">
              Artifact or SBOM SHA-256 Checksum (Hexadecimal):
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. 8b5f3a093b16954aefb32189cd5f8121609139265f212f4581aa20490b4d4538"
                value={hashInput}
                onChange={e => setHashInput(e.target.value)}
                className="flex-1 bg-[#0B1020] border border-slate-800 rounded-lg px-3.5 py-2 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={handleVerify}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
              >
                Verify Hash
              </button>
            </div>
            {/* Quick pre-fills */}
            <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-400">
              <span>Test Samples:</span>
              <button
                onClick={() => {
                  setHashInput('8b5f3a093b16954aefb32189cd5f8121609139265f212f4581aa20490b4d4538');
                }}
                className="text-cyan-400 hover:underline font-mono"
              >
                fastapi-auth (Sepolia)
              </button>
              <span aria-hidden="true">·</span>
              <button
                onClick={() => {
                  setHashInput('3e671687395b41f5a30fa58921a69b794a82194bcf9301048bcae98129e01490');
                }}
                className="text-cyan-400 hover:underline font-mono"
              >
                ecommerce-gateway (Amoy)
              </button>
              <span aria-hidden="true">·</span>
              <button
                onClick={() => {
                  setHashInput('0000000000000000000000000000000000000000000000000000000000000000');
                }}
                className="text-amber-400 hover:underline font-mono"
              >
                unregistered mock
              </button>
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-slate-800 hover:border-cyan-500/50 rounded-xl p-6 text-center transition-colors">
            <UploadCloud className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
            <div className="text-xs font-semibold text-white mb-1">
              Select an SBOM JSON, tarball, or binary to hash in-browser
            </div>
            <div className="text-[11px] text-slate-400 mb-3">
              Uses client-side Web Crypto API. File bytes never leave your device.
            </div>
            <label className="inline-block px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 rounded-lg cursor-pointer border border-slate-700 transition-colors">
              {isHashing ? 'Hashing file...' : 'Browse Local File'}
              <input type="file" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        )}

        {/* Verification Result Callout */}
        {verificationResult && (
          <div
            className={`p-4 rounded-xl border text-xs font-mono transition-all ${
              verificationResult.isVerified
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-red-500/10 border-red-500/30 text-red-300'
            }`}
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2 font-bold text-sm">
                {verificationResult.isVerified ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>Cryptographic Notary Evidence Confirmed</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-5 h-5 text-red-400" />
                    <span>Integrity Verification Failed</span>
                  </>
                )}
              </div>
              <span className="text-[10px] opacity-75">
                {formatDate(verificationResult.queryTimestamp)}
              </span>
            </div>

            <p className="font-sans text-xs opacity-90 leading-relaxed mb-3">
              {verificationResult.explanation}
            </p>

            {verificationResult.matchedRecord && (
              <div className="bg-[#0B1020]/80 p-3 rounded-lg border border-slate-800 space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Artifact:</span>
                  <span className="text-white">{verificationResult.matchedRecord.artifactId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Network:</span>
                  <span className="text-cyan-400">{verificationResult.matchedRecord.blockchainNetwork}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Notary Contract:</span>
                  <span className="text-slate-300 font-mono">
                    {verificationResult.matchedRecord.contractAddress}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Transaction:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-300 font-mono">
                      {truncateHash(verificationResult.matchedRecord.transactionHash, 10, 8)}
                    </span>
                    <button
                      onClick={() => copyToClipboard(verificationResult.matchedRecord!.transactionHash)}
                      className="p-1 hover:text-white"
                      title="Copy transaction hash"
                    >
                      {copiedHash ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Ledger Block:</span>
                  <span className="text-slate-300">#{verificationResult.matchedRecord.blockNumber}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Essential disclaimer */}
        <div className="p-3 bg-[#0B1020] rounded-lg border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed flex items-start gap-2">
          <Database className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <strong>Proof of Provenance vs. Safety:</strong> An immutable hash match strictly proves byte-for-byte equality with the recorded artifact built in the CI/CD pipeline. It guarantees tamper-resistance against downstream alteration, but does not inherently guarantee absence of zero-day vulnerabilities in the source code itself.
          </div>
        </div>
      </div>

      {/* Registration Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#151F33] border border-slate-700 rounded-xl max-w-lg w-full shadow-2xl p-6">
            <h4 className="text-base font-bold text-white mb-1">Anchor Security Evidence to Ledger</h4>
            <p className="text-xs text-slate-400 mb-4">
              Commit a cryptographic proof of your build artifact and SBOM to the immutable testnet notary.
            </p>

            <form onSubmit={handleRegisterEvidence} className="space-y-3.5 text-xs font-mono">
              <div>
                <label className="block text-slate-300 mb-1">Artifact Package URL / Identifier</label>
                <input
                  type="text"
                  value={regArtifactId}
                  onChange={e => setRegArtifactId(e.target.value)}
                  className="w-full bg-[#0B1020] border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Version</label>
                <input
                  type="text"
                  value={regVersion}
                  onChange={e => setRegVersion(e.target.value)}
                  className="w-full bg-[#0B1020] border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">SBOM SHA-256 Digest</label>
                <input
                  type="text"
                  value={regSbomHash}
                  onChange={e => setRegSbomHash(e.target.value)}
                  className="w-full bg-[#0B1020] border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Target Blockchain Network</label>
                <select
                  value={regNetwork}
                  onChange={e => setRegNetwork(e.target.value)}
                  className="w-full bg-[#0B1020] border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="Ethereum Sepolia Testnet">Ethereum Sepolia Testnet</option>
                  <option value="Polygon Amoy Testnet">Polygon Amoy Testnet</option>
                  <option value="Enterprise Private Quorum">Enterprise Private Quorum</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg shadow-sm"
                >
                  Anchor Proof to Blockchain
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
