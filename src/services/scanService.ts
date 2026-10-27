import { ScanResult, ScanStage } from '../types/scan';
import { SAMPLE_SCANS, SAMPLE_VULNERABILITIES, SAMPLE_DEPENDENCIES, SAMPLE_ANOMALIES } from '../utils/sampleData';
import { apiClient, getApiStatus } from './apiClient';
import { calculateSha256 } from '../utils/hashUtils';

const STORAGE_KEY = 'supplyguard_scans_data';

function initializeStoredScans(): ScanResult[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed reading scans from localStorage', err);
  }
  return [...SAMPLE_SCANS];
}

let memoryScans: ScanResult[] = initializeStoredScans();

function persistScans(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryScans));
  } catch (err) {
    console.error('Failed saving scans to localStorage', err);
  }
}

export async function fetchAllScans(): Promise<{ scans: ScanResult[]; isDemo: boolean }> {
  const status = getApiStatus();
  if (status.isConnected && !status.isDemoMode) {
    try {
      const response = await apiClient.get('/scans');
      return { scans: response.data, isDemo: false };
    } catch (err) {
      console.warn('Live API call failed, reporting error', err);
      throw err;
    }
  }
  return { scans: [...memoryScans], isDemo: true };
}

export async function fetchScanById(scanId: string): Promise<{ scan: ScanResult; isDemo: boolean }> {
  const status = getApiStatus();
  if (status.isConnected && !status.isDemoMode) {
    try {
      const response = await apiClient.get(`/scans/${scanId}`);
      return { scan: response.data, isDemo: false };
    } catch (err) {
      console.warn('Live API fetch scan by ID failed', err);
      throw err;
    }
  }

  const found = memoryScans.find(s => s.id === scanId);
  if (!found) {
    throw new Error(`Scan with ID "${scanId}" was not found.`);
  }
  return { scan: found, isDemo: true };
}

export interface NewScanInput {
  projectName: string;
  targetSource: string;
  sourceType: 'github' | 'npm' | 'pypi' | 'docker' | 'sbom' | 'huggingface';
  scanDepth: 'direct' | 'transitive';
  enableAiAnomalyDetection: boolean;
  enableLicenseAudit: boolean;
  enableBlockchainIntegrity: boolean;
  uploadedSbomJson?: string;
}

export async function executeScanWorkflow(
  input: NewScanInput,
  onStageUpdate: (stages: ScanStage[], overallPercent: number) => void
): Promise<ScanResult> {
  const status = getApiStatus();

  // Define the 7 mandated stages:
  // 1. Input validation
  // 2. SBOM generation
  // 3. Dependency analysis
  // 4. Vulnerability enrichment
  // 5. Provenance and integrity checks
  // 6. AI risk analysis
  // 7. Final report generation
  const stages: ScanStage[] = [
    {
      stageNumber: 1,
      name: 'Input Validation',
      description: 'Validating target repository URL, package manifest structure, and authorization scopes.',
      status: 'pending',
      logLines: [],
    },
    {
      stageNumber: 2,
      name: 'SBOM Generation',
      description: 'Extracting package lockfiles, generating CycloneDX 1.5 specification with cryptographic hashes.',
      status: 'pending',
      logLines: [],
    },
    {
      stageNumber: 3,
      name: 'Dependency Analysis',
      description: 'Resolving dependency tree, isolating direct vs transitive packages and license declarations.',
      status: 'pending',
      logLines: [],
    },
    {
      stageNumber: 4,
      name: 'Vulnerability Enrichment',
      description: 'Querying NVD, OSV, and GitHub Advisory databases for known CVEs and EPSS exploit scores.',
      status: 'pending',
      logLines: [],
    },
    {
      stageNumber: 5,
      name: 'Provenance & Integrity Checks',
      description: 'Evaluating SLSA Level 1-3 attestation, builder identity, and ledger cryptographic hash matches.',
      status: 'pending',
      logLines: [],
    },
    {
      stageNumber: 6,
      name: 'AI Risk Analysis',
      description: 'Multi-layer machine learning risk inference: typosquatting, lifecycle hooks, and maintainer churn.',
      status: 'pending',
      logLines: [],
    },
    {
      stageNumber: 7,
      name: 'Final Report Generation',
      description: 'Aggregating security findings, calculating overall composite risk score, and evaluating CI/CD gate policy.',
      status: 'pending',
      logLines: [],
    },
  ];

  // If live backend is available and not in demo mode, delegate
  if (status.isConnected && !status.isDemoMode) {
    const postRes = await apiClient.post('/scans', input);
    return postRes.data;
  }

  // Realistic progressive execution simulation for demo mode
  const stageDelays = [450, 600, 650, 700, 600, 650, 450];
  const logsPerStage = [
    [
      `[INFO] Target: ${input.targetSource} (${input.sourceType})`,
      `[INFO] Validating manifest syntax and repository reachable...`,
      `[SUCCESS] Manifest structure verified OK.`,
    ],
    [
      `[INFO] Generating CycloneDX v1.5 Software Bill of Materials...`,
      `[INFO] Computing SHA-256 digests across 34 target modules...`,
      `[SUCCESS] Generated valid CycloneDX SBOM with 34 nodes.`,
    ],
    [
      `[INFO] Resolving recursive dependencies (depth: ${input.scanDepth})...`,
      `[INFO] Identified 11 direct dependencies, 23 transitive modules.`,
      `[SUCCESS] Dependency graph generated. 4 unique licenses mapped.`,
    ],
    [
      `[INFO] Querying National Vulnerability Database (NVD) & OSV feeds...`,
      `[WARN] Advisory match: CVE-2023-44487 (HTTP/2 Rapid Reset) in urllib3`,
      `[SUCCESS] Vulnerability enrichment complete: 1 High, 2 Medium findings.`,
    ],
    [
      `[INFO] Inspecting cryptographic build attestation (SLSA Level 2)...`,
      `[INFO] Querying Ethereum Sepolia Notary Registry (Contract 0x4E7A...)...`,
      `[INFO] Verified build signature from GitHub Actions runner.`,
      `[SUCCESS] SLSA Attestation verified. Hash equality confirmed.`,
    ],
    [
      `[INFO] Running Multi-Layer SupplyGuard AI Risk Classifier...`,
      `[INFO] Typosquatting token similarity check: 0 anomalies detected.`,
      `[INFO] Lifecycle scripts audit: Clean (no suspicious curl/eval hooks).`,
      `[SUCCESS] AI Risk Confidence: 94%. Overall risk index evaluated.`,
    ],
    [
      `[INFO] Compiling executive security posture report...`,
      `[INFO] Evaluating CI/CD gate policy against organizational baseline...`,
      `[SUCCESS] Policy Decision: REVIEW. Scan completed successfully.`,
    ],
  ];

  for (let i = 0; i < stages.length; i++) {
    stages[i].status = 'in_progress';
    stages[i].logLines = logsPerStage[i].slice(0, 1);
    onStageUpdate([...stages], Math.round((i / stages.length) * 100));

    await new Promise(r => setTimeout(r, stageDelays[i] / 2));
    stages[i].logLines = logsPerStage[i];
    onStageUpdate([...stages], Math.round(((i + 0.5) / stages.length) * 100));

    await new Promise(r => setTimeout(r, stageDelays[i] / 2));
    stages[i].status = 'completed';
    onStageUpdate([...stages], Math.round(((i + 1) / stages.length) * 100));
  }

  // Create real persistent scan result
  const newScanId = `sg-scan-${Math.floor(1000 + Math.random() * 9000)}`;
  const calculatedHash = await calculateSha256(input.projectName + input.targetSource + Date.now());

  const newScanResult: ScanResult = {
    id: newScanId,
    projectName: input.projectName || 'unnamed-project',
    targetSource: input.targetSource,
    sourceType: input.sourceType,
    timestamp: new Date().toISOString(),
    durationMs: stageDelays.reduce((a, b) => a + b, 0),
    status: 'Review Required',
    riskScore: 36,
    totalDependencies: 34,
    directDependencies: 11,
    transitiveDependencies: 23,
    vulnerabilities: {
      critical: 0,
      high: 1,
      medium: 2,
      low: 1,
      total: 4,
    },
    suspiciousPackagesCount: 0,
    integrityStatus: 'Verified',
    provenance: {
      slsaLevel: 2,
      builderIdentity: 'https://github.com/actions/runner@v2.311.0',
      sourceRepository: input.targetSource,
      sourceCommit: '4f29a1b0c98e7d6f5a4b3c2e1d0f9a8b7c6d5e4f',
      buildInvocationId: `inv-${Math.floor(10000 + Math.random() * 90000)}`,
      cryptographicSignature: 'MEQCIA' + calculatedHash.slice(0, 32) + '...CosignVerified',
      isVerified: true,
      buildEnvironment: 'Automated Container Pipeline',
      issuedAt: new Date().toISOString(),
    },
    blockchainRecord: {
      artifactId: `pkg:${input.sourceType}/${input.projectName}@1.0.0`,
      artifactVersion: '1.0.0',
      sbomSha256: calculatedHash,
      artifactSha256: calculatedHash.split('').reverse().join(''),
      registeredTimestamp: new Date().toISOString(),
      blockchainNetwork: 'Ethereum Sepolia Testnet',
      contractAddress: '0x4E7A13C0d9D0B58c4Fa6C35F79E8990c74169584',
      transactionHash: '0x' + calculatedHash,
      blockNumber: 5892400 + Math.floor(Math.random() * 100),
      verificationStatus: 'Verified',
      anchoredBy: 'SupplyGuard Notary Node #1',
    },
    vulnerabilityList: [
      SAMPLE_VULNERABILITIES[2], // urllib3
      SAMPLE_VULNERABILITIES[5], // certifi
    ],
    dependenciesList: SAMPLE_DEPENDENCIES.filter(d => !d.hasAnomalies),
    anomalies: [],
    executiveSummary: `Scan completed successfully for ${input.projectName}. SLSA Provenance Level 2 verified. 1 high-severity vulnerability (CVE-2023-44487) found in transitive dependencies.`,
    recommendedActions: [
      'Upgrade urllib3 to version >= 1.26.18',
      'Pin dependency checksums in lockfile to maintain immutable build guarantee',
    ],
    sbomFormat: 'CycloneDX-1.5',
    policyDecision: 'REVIEW',
  };

  memoryScans = [newScanResult, ...memoryScans];
  persistScans();

  return newScanResult;
}

export function deleteScanById(scanId: string): void {
  memoryScans = memoryScans.filter(s => s.id !== scanId);
  persistScans();
}

export function resetToDefaultScans(): void {
  memoryScans = [...SAMPLE_SCANS];
  persistScans();
}
