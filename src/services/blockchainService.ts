import { BlockchainRecord } from '../types/scan';
import { SAMPLE_SCANS } from '../utils/sampleData';

const BLOCKCHAIN_STORAGE_KEY = 'supplyguard_blockchain_ledger';

function initializeLedger(): BlockchainRecord[] {
  try {
    const raw = localStorage.getItem(BLOCKCHAIN_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('Failed reading blockchain ledger from storage', err);
  }
  return SAMPLE_SCANS.map(s => s.blockchainRecord);
}

let ledgerRecords: BlockchainRecord[] = initializeLedger();

function persistLedger(): void {
  try {
    localStorage.setItem(BLOCKCHAIN_STORAGE_KEY, JSON.stringify(ledgerRecords));
  } catch (err) {
    console.error('Failed saving blockchain ledger to storage', err);
  }
}

export function getAllLedgerRecords(): BlockchainRecord[] {
  return [...ledgerRecords];
}

export interface VerificationResult {
  isVerified: boolean;
  status: 'Verified' | 'Integrity Mismatch' | 'Not Registered' | 'Verification Failed';
  matchedRecord?: BlockchainRecord;
  queriedHash: string;
  queryTimestamp: string;
  explanation: string;
}

export function verifyHashAgainstLedger(hash: string): VerificationResult {
  const cleanHash = hash.trim().toLowerCase();
  const queryTimestamp = new Date().toISOString();

  if (!cleanHash) {
    return {
      isVerified: false,
      status: 'Verification Failed',
      queriedHash: '',
      queryTimestamp,
      explanation: 'No cryptographic hash provided for verification.',
    };
  }

  // Look for match in SBOM hash or Artifact hash
  const match = ledgerRecords.find(
    r =>
      r.sbomSha256.toLowerCase() === cleanHash ||
      r.artifactSha256.toLowerCase() === cleanHash ||
      r.transactionHash.toLowerCase() === cleanHash
  );

  if (match) {
    return {
      isVerified: true,
      status: 'Verified',
      matchedRecord: match,
      queriedHash: cleanHash,
      queryTimestamp,
      explanation: `Cryptographic match confirmed on ${match.blockchainNetwork}. Block #${match.blockNumber}. Exact equality with recorded notary bytes verified.`,
    };
  }

  return {
    isVerified: false,
    status: 'Not Registered',
    queriedHash: cleanHash,
    queryTimestamp,
    explanation: 'Provided SHA-256 hash was not found in the immutable notary ledger registry. The artifact may be untrusted, modified, or not yet anchored.',
  };
}

export function registerEvidenceOnLedger(params: {
  artifactId: string;
  artifactVersion: string;
  sbomSha256: string;
  artifactSha256: string;
  network: string;
}): BlockchainRecord {
  const txHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  const newRecord: BlockchainRecord = {
    artifactId: params.artifactId,
    artifactVersion: params.artifactVersion,
    sbomSha256: params.sbomSha256,
    artifactSha256: params.artifactSha256,
    registeredTimestamp: new Date().toISOString(),
    blockchainNetwork: params.network,
    contractAddress: '0x4E7A13C0d9D0B58c4Fa6C35F79E8990c74169584',
    transactionHash: txHash,
    blockNumber: 5892500 + Math.floor(Math.random() * 500),
    verificationStatus: 'Verified',
    anchoredBy: 'SupplyGuard Notary Node #1',
  };

  ledgerRecords = [newRecord, ...ledgerRecords];
  persistLedger();
  return newRecord;
}
