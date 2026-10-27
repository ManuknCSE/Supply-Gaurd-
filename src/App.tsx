import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { ToastProvider } from './components/common/NotificationToast';

import { OverviewPage } from './pages/OverviewPage';
import { NewScanPage } from './pages/NewScanPage';
import { ScanHistoryPage } from './pages/ScanHistoryPage';
import { ScanDetailsPage } from './pages/ScanDetailsPage';
import { SbomExplorerPage } from './pages/SbomExplorerPage';
import { DependencyGraphPage } from './pages/DependencyGraphPage';
import { VulnerabilitiesPage } from './pages/VulnerabilitiesPage';
import { AiRiskAnalysisPage } from './pages/AiRiskAnalysisPage';
import { IntegrityBlockchainPage } from './pages/IntegrityBlockchainPage';
import { CicdSecurityPage } from './pages/CicdSecurityPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<OverviewPage />} />
            <Route path="scan/new" element={<NewScanPage />} />
            <Route path="scans" element={<ScanHistoryPage />} />
            <Route path="scans/:scanId" element={<ScanDetailsPage />} />
            <Route path="sbom" element={<SbomExplorerPage />} />
            <Route path="graph" element={<DependencyGraphPage />} />
            <Route path="vulnerabilities" element={<VulnerabilitiesPage />} />
            <Route path="risk-analysis" element={<AiRiskAnalysisPage />} />
            <Route path="integrity" element={<IntegrityBlockchainPage />} />
            <Route path="cicd" element={<CicdSecurityPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}
