import { CicdWorkflowRun, SecurityPolicyConfig, PolicyDecision } from '../types/scan';
import { SAMPLE_WORKFLOWS } from '../utils/sampleData';

const WORKFLOW_STORAGE_KEY = 'supplyguard_cicd_workflows';
const POLICY_STORAGE_KEY = 'supplyguard_security_policy';

export const DEFAULT_POLICY_CONFIG: SecurityPolicyConfig = {
  blockOnCriticalCve: true,
  blockOnHighCveThreshold: 1,
  requireSlsaLevel: 2,
  blockOnUnverifiedIntegrity: true,
  blockOnAnomalies: true,
  blockNewPackagesDaysThreshold: 14,
  allowList: ['fastapi', 'pydantic', 'cryptography', 'uvicorn'],
};

export function getSecurityPolicyConfig(): SecurityPolicyConfig {
  try {
    const raw = localStorage.getItem(POLICY_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('Failed reading policy config', err);
  }
  return DEFAULT_POLICY_CONFIG;
}

export function saveSecurityPolicyConfig(config: SecurityPolicyConfig): void {
  try {
    localStorage.setItem(POLICY_STORAGE_KEY, JSON.stringify(config));
  } catch (err) {
    console.error('Failed saving policy config', err);
  }
}

export function getAllWorkflowRuns(): CicdWorkflowRun[] {
  try {
    const raw = localStorage.getItem(WORKFLOW_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('Failed reading workflows', err);
  }
  return [...SAMPLE_WORKFLOWS];
}

export function triggerNewWorkflowSimulation(repo: string, branch: string = 'main'): CicdWorkflowRun {
  const currentRuns = getAllWorkflowRuns();
  const runId = `run-${Math.floor(9022 + Math.random() * 500)}`;
  const commit = Array.from({ length: 7 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

  const newRun: CicdWorkflowRun = {
    id: runId,
    repository: repo,
    branch,
    commitSha: commit,
    workflowName: 'SupplyGuard DevSecOps Gate',
    triggeredBy: 'workflow_dispatch',
    timestamp: new Date().toISOString(),
    durationSeconds: Math.floor(35 + Math.random() * 45),
    scanStatus: 'Safe',
    policyDecision: 'ALLOW' as PolicyDecision,
    policyViolations: [],
    artifactIntegrity: 'Verified',
    scanId: 'sg-scan-9479',
  };

  const updated = [newRun, ...currentRuns];
  try {
    localStorage.setItem(WORKFLOW_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed storing workflow', err);
  }
  return newRun;
}
