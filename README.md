# SupplyGuard AI

**A Multi-Layer AI-Driven Framework for Software Supply Chain Security and Integrity Verification**

SupplyGuard AI is an enterprise-grade cybersecurity web application designed for DevSecOps engineers, security researchers, and software engineering teams. It continuously discovers software vulnerabilities, detects anomalous dependency behavior (such as typosquatting and malicious postinstall lifecycle hooks), certifies SLSA build provenance, and notarizes software bill of materials (SBOM) on immutable blockchain ledgers.

---

## Key Features

1. **Autonomous 7-Stage Pipeline Scanning**
   - Stage 1: Input Validation
   - Stage 2: SBOM Generation (CycloneDX 1.5 & SPDX 2.3)
   - Stage 3: Dependency Resolution (Direct vs. Transitive trees)
   - Stage 4: Vulnerability Enrichment (NVD, OSV, GitHub Advisory databases)
   - Stage 5: Provenance & Integrity Checks (SLSA Level 1–3, builder identity, Cosign/Sigstore attestation)
   - Stage 6: Multi-Layer AI Risk Analysis (heuristic behavioral vectors, maintainer churn)
   - Stage 7: Final Report Generation & CI/CD Gate Evaluation

2. **Interactive Dependency Graph**
   - Built on React Flow with interactive pan, zoom, fit-to-view, and node search
   - Color-coded visual states for Verified Safe, Suspicious AI Anomalies, and Critical/High CVEs
   - Inspect drawer detailing PURL, license, hash, and CVE linkages
   - Accessible fallback table view

3. **Software Bill of Materials (SBOM) Explorer**
   - Full support for CycloneDX 1.4/1.5 and SPDX 2.2/2.3 JSON formats
   - Automated quality analysis flagging missing suppliers, licenses, and SHA-256 checksums
   - Export parsed SBOM reports and download canonical CycloneDX JSON

4. **Multi-Layer AI Risk & Anomaly Assessment**
   - Explainable machine learning feature importance decomposition
   - Radar charts visualizing risk vectors (lexical typosquatting distance, lifecycle script sockets, binary blobs)
   - Model confidence scoring and actionable remediation recommendations

5. **Cryptographic Blockchain Notarization**
   - Web Crypto API for client-side SHA-256 calculation
   - Tamper-evident verification against Ethereum Sepolia & Polygon Amoy notary contracts
   - Register new build receipts and anchor SBOM hashes to the immutable ledger

6. **DevSecOps CI/CD Enforcement Gate**
   - Policy threshold evaluation (`ALLOW`, `REVIEW`, `BLOCK`)
   - Configurable rules (block on Critical CVEs, require SLSA Level 2+, reject unregistered hashes)
   - Simulation tool to test automated pull request and deployment evaluations

7. **Executive Compliance & Reporting**
   - Pre-formatted audit reports aligned with NIST SP 800-218 (SSDF) and Executive Order 14028
   - Exportable JSON audits, CycloneDX downloads, and print-ready PDF styling

---

## Technology Stack

- **Frontend:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS (Dark Navy Cybersecurity SaaS Theme)
- **Routing:** React Router v7 (`react-router-dom`)
- **Visualizations:** Recharts (Area, Bar, Donut, Radar charts)
- **Dependency Graph:** React Flow (`@xyflow/react`)
- **Icons:** Lucide React
- **HTTP Client:** Centralized Axios client (`VITE_API_BASE_URL`)

---

## Setup & Running the Application

### 1. Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### 2. Installation
```bash
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Key configuration parameters:
- `VITE_API_BASE_URL`: Base URL for the optional FastAPI backend (default: `/api`). When disconnected, SupplyGuard AI smoothly operates in high-fidelity simulation mode with labeled demonstration data.

### 4. Running the Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

### 5. Building for Production
```bash
npm run build
```
The compiled, optimized static assets will be located in the `dist/` directory.

---

## Architecture & Directory Structure

```
├── .env.example              # Environment variables template
├── index.html                # Application HTML entry point & SEO meta
├── metadata.json             # AI Studio applet capabilities
├── package.json              # Project dependencies & scripts
├── src/
│   ├── assets/               # Static assets & images
│   ├── components/
│   │   ├── blockchain/       # Integrity card & registration modals
│   │   ├── common/           # StatCard, RiskGauge, Badges, Search modal, Toasts
│   │   ├── graph/            # React Flow interactive dependency graph
│   │   ├── layout/           # Sidebar, Header, AppLayout shell
│   │   ├── scan/             # 7-stage live scanning progress component
│   │   └── vulnerabilities/  # Vulnerability table & remediation drawer
│   ├── pages/                # Overview, Scans, SBOM, Graph, AI, Reports, Settings
│   ├── services/             # API client, scan workflow, SBOM parser, Blockchain
│   ├── types/                # TypeScript data schemas & domain contracts
│   ├── utils/                # SHA-256 hash utils, formatters, sample datasets
│   ├── App.tsx               # Route configurations
│   ├── index.css             # Dark cybersecurity theme & typography
│   └── main.tsx              # React DOM bootstrap
```

---

## License & Security Disclaimer
An immutable hash match proves cryptographic equality with the recorded artifact notarized at build time, guaranteeing tamper-evidence. It does not replace code audits or vulnerability remediation.
