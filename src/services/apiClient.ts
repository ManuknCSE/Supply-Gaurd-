import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

export interface ApiStatus {
  isConnected: boolean;
  baseUrl: string;
  isDemoMode: boolean;
  latencyMs?: number;
  lastChecked?: string;
  serverVersion?: string;
}

// Global state for live backend vs demonstration mode
let currentApiStatus: ApiStatus = {
  isConnected: false,
  baseUrl: API_BASE_URL,
  isDemoMode: true, // Default to demo mode unless backend responds
  lastChecked: new Date().toISOString(),
};

export async function checkBackendConnection(): Promise<ApiStatus> {
  const startTime = Date.now();
  try {
    const res = await apiClient.get('/health', { timeout: 3000 });
    const latency = Date.now() - startTime;
    currentApiStatus = {
      isConnected: true,
      baseUrl: API_BASE_URL,
      isDemoMode: false,
      latencyMs: latency,
      lastChecked: new Date().toISOString(),
      serverVersion: res.data?.version || 'FastAPI 1.0.0',
    };
    return currentApiStatus;
  } catch {
    // If backend endpoint is unreachable, we operate in explicit demo mode
    currentApiStatus = {
      isConnected: false,
      baseUrl: API_BASE_URL,
      isDemoMode: true,
      latencyMs: undefined,
      lastChecked: new Date().toISOString(),
    };
    return currentApiStatus;
  }
}

export function getApiStatus(): ApiStatus {
  return currentApiStatus;
}

export function setDemoModeOverride(isDemo: boolean): void {
  currentApiStatus.isDemoMode = isDemo;
}
