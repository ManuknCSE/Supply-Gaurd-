export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type ScanStatus = 'Safe' | 'Review Required' | 'High Risk' | 'Scan Failed' | 'Scanning';

export type PolicyDecision = 'ALLOW' | 'REVIEW' | 'BLOCK';

export type Ecosystem = 'npm' | 'pypi' | 'go' | 'maven' | 'docker' | 'huggingface';

export interface Vulnerability {
  id: string; // e.g., CVE-2024-3094 or GHSA-xxxx
  cveId?: string;
  packageName: string;
  currentVersion: string;
  affectedVersionRange: string;
  fixedVersion: string | null;
  severity: Severity;
  cvssScore: number;
  source: 'NVD' | 'GitHub Advisory' | 'OSV' | 'Snyk' | 'SupplyGuard Heuristic';
  title: string;
  description: string;
  publishedDate: string;
  remediationStatus: 'Fix Available' | 'No Fix' | 'Workaround' | 'Suppressed';
  remediationGuidance: string;
  isHeuristicAlert?: boolean;
}

export interface DependencyNode {
  id: string;
  name: string;
  version: string;
  ecosystem: Ecosystem;
  purl: string;
  license: string;
  isDirect: boolean;
  depth: number;
  vulnerabilityCount: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  hasAnomalies: boolean;
  anomalyReasons?: string[];
  integrityStatus: 'verified' | 'mismatch' | 'unregistered';
  sha256Hash: string;
  slsaLevel: 0 | 1 | 2 | 3;
  supplier?: string;
  missingMetadata?: string[];
  dependencies?: string[]; // IDs of child dependencies
}

export interface AnomalyFinding {
  id: string;
  packageName: string;
  category: 'Typosquatting' | 'Install Script' | 'Suspicious Network' | 'Code Obfuscation' | 'Maintainer Churn' | 'Unusual Binary';
  severity: Severity;
  description: string;
  confidenceScore: number; // 0-100
  heuristicIndicators: string[];
  recommendation: string;
}

export interface ProvenanceReport {
  slsaLevel: 1 | 2 | 3;
  builderIdentity: string;
  sourceRepository: string;
  sourceCommit: string;
  buildInvocationId: string;
  cryptographicSignature: string;
  transparencyLogUrl?: string;
  isVerified: boolean;
  buildEnvironment: string;
  issuedAt: string;
}

export interface BlockchainRecord {
  artifactId: string;
  artifactVersion: string;
  sbomSha256: string;
  artifactSha256: string;
  registeredTimestamp: string;
  blockchainNetwork: string;
  contractAddress: string;
  transactionHash: string;
  blockNumber: number;
  verificationStatus: 'Verified' | 'Integrity Mismatch' | 'Not Registered' | 'Verification Failed';
  anchoredBy: string;
}

export interface ScanResult {
  id: string;
  projectName: string;
  targetSource: string;
  sourceType: 'github' | 'npm' | 'pypi' | 'docker' | 'sbom' | 'huggingface';
  timestamp: string;
  durationMs: number;
  status: ScanStatus;
  riskScore: number; // 0-100
  totalDependencies: number;
  directDependencies: number;
  transitiveDependencies: number;
  vulnerabilities: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    total: number;
  };
  suspiciousPackagesCount: number;
  integrityStatus: 'Verified' | 'Mismatch' | 'Unverified';
  provenance: ProvenanceReport;
  blockchainRecord: BlockchainRecord;
  vulnerabilityList: Vulnerability[];
  dependenciesList: DependencyNode[];
  anomalies: AnomalyFinding[];
  executiveSummary: string;
  recommendedActions: string[];
  sbomFormat: 'CycloneDX-1.5' | 'SPDX-2.3';
  sbomJson?: string;
  policyDecision: PolicyDecision;
}

export interface ScanStage {
  stageNumber: number;
  name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  logLines: string[];
}

export interface CicdWorkflowRun {
  id: string;
  repository: string;
  branch: string;
  commitSha: string;
  workflowName: string;
  triggeredBy: string;
  timestamp: string;
  durationSeconds: number;
  scanStatus: ScanStatus;
  policyDecision: PolicyDecision;
  policyViolations: string[];
  artifactIntegrity: 'Verified' | 'Failed' | 'Pending';
  scanId: string;
}

export interface SecurityPolicyConfig {
  blockOnCriticalCve: boolean;
  blockOnHighCveThreshold: number; // e.g., 2
  requireSlsaLevel: number; // 1, 2, or 3
  blockOnUnverifiedIntegrity: boolean;
  blockOnAnomalies: boolean;
  blockNewPackagesDaysThreshold: number; // packages younger than X days
  allowList: string[];
}
