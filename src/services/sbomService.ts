import { DependencyNode } from '../types/scan';

export interface ParsedSbomReport {
  format: 'CycloneDX' | 'SPDX' | 'Unknown';
  version: string;
  serialNumber?: string;
  targetComponent?: {
    name: string;
    version: string;
    purl?: string;
    description?: string;
  };
  components: DependencyNode[];
  totalComponents: number;
  missingMetadataCount: number;
  ecosystemDistribution: Record<string, number>;
  licenseDistribution: Record<string, number>;
}

export function parseSbomContent(rawJson: string): ParsedSbomReport {
  let parsed: any;
  try {
    parsed = JSON.parse(rawJson);
  } catch (err: any) {
    throw new Error(`Invalid JSON syntax: ${err.message}`);
  }

  // Check if CycloneDX
  if (parsed.bomFormat === 'CycloneDX' || (parsed.components && Array.isArray(parsed.components))) {
    const format = 'CycloneDX';
    const version = parsed.specVersion || '1.5';
    const rawComponents = parsed.components || [];

    const nodes: DependencyNode[] = rawComponents.map((c: any, idx: number) => {
      const missing: string[] = [];
      if (!c.supplier && !c.author) missing.push('Supplier / Author');
      if (!c.licenses || c.licenses.length === 0) missing.push('License Declaration');
      if (!c.hashes || c.hashes.length === 0) missing.push('Cryptographic Checksum');
      if (!c.purl) missing.push('Package URL (PURL)');

      let license = 'Unknown';
      if (c.licenses && c.licenses.length > 0) {
        license = c.licenses[0]?.license?.id || c.licenses[0]?.license?.name || 'Declared';
      }

      let hash = '';
      if (c.hashes && c.hashes.length > 0) {
        hash = c.hashes[0]?.content || '';
      }

      // Infer ecosystem from purl or name
      let ecosystem: any = 'npm';
      if (c.purl) {
        if (c.purl.includes('pkg:pypi')) ecosystem = 'pypi';
        else if (c.purl.includes('pkg:golang') || c.purl.includes('pkg:go')) ecosystem = 'go';
        else if (c.purl.includes('pkg:maven')) ecosystem = 'maven';
        else if (c.purl.includes('pkg:deb') || c.purl.includes('pkg:docker')) ecosystem = 'docker';
      }

      return {
        id: `comp-${idx}-${c.name}`,
        name: c.name || 'unnamed-component',
        version: c.version || '0.0.0',
        ecosystem,
        purl: c.purl || `pkg:${ecosystem}/${c.name}@${c.version}`,
        license,
        isDirect: idx < 8,
        depth: idx < 8 ? 1 : 2,
        vulnerabilityCount: { critical: 0, high: 0, medium: 0, low: 0 },
        hasAnomalies: false,
        integrityStatus: hash ? 'verified' : 'unregistered',
        sha256Hash: hash || '0000000000000000000000000000000000000000000000000000000000000000',
        slsaLevel: 2,
        supplier: c.supplier?.name || c.author || undefined,
        missingMetadata: missing.length > 0 ? missing : undefined,
      };
    });

    const ecoDist: Record<string, number> = {};
    const licDist: Record<string, number> = {};
    let missingCount = 0;

    nodes.forEach(n => {
      ecoDist[n.ecosystem] = (ecoDist[n.ecosystem] || 0) + 1;
      licDist[n.license] = (licDist[n.license] || 0) + 1;
      if (n.missingMetadata && n.missingMetadata.length > 0) missingCount++;
    });

    return {
      format,
      version,
      serialNumber: parsed.serialNumber,
      targetComponent: parsed.metadata?.component ? {
        name: parsed.metadata.component.name,
        version: parsed.metadata.component.version,
        purl: parsed.metadata.component.purl,
        description: parsed.metadata.component.description,
      } : undefined,
      components: nodes,
      totalComponents: nodes.length,
      missingMetadataCount: missingCount,
      ecosystemDistribution: ecoDist,
      licenseDistribution: licDist,
    };
  }

  // Check if SPDX
  if (parsed.spdxVersion || parsed.SPDXID) {
    const format = 'SPDX';
    const version = parsed.spdxVersion || '2.3';
    const packages = parsed.packages || [];

    const nodes: DependencyNode[] = packages.map((p: any, idx: number) => {
      const missing: string[] = [];
      if (!p.originator && !p.supplier) missing.push('Supplier / Originator');
      if (!p.licenseConcluded || p.licenseConcluded === 'NOASSERTION') missing.push('License Concluded');
      if (!p.checksums || p.checksums.length === 0) missing.push('Checksum');

      let hash = '';
      if (p.checksums && p.checksums.length > 0) {
        hash = p.checksums[0]?.checksumValue || '';
      }

      return {
        id: `spdx-pkg-${idx}`,
        name: p.name || 'unnamed-pkg',
        version: p.versionInfo || '0.0.0',
        ecosystem: 'npm',
        purl: p.externalRefs?.[0]?.referenceLocator || `pkg:generic/${p.name}@${p.versionInfo}`,
        license: p.licenseConcluded || 'NOASSERTION',
        isDirect: idx < 6,
        depth: idx < 6 ? 1 : 2,
        vulnerabilityCount: { critical: 0, high: 0, medium: 0, low: 0 },
        hasAnomalies: false,
        integrityStatus: hash ? 'verified' : 'unregistered',
        sha256Hash: hash || '0000000000000000000000000000000000000000000000000000000000000000',
        slsaLevel: 2,
        supplier: p.supplier || p.originator,
        missingMetadata: missing.length > 0 ? missing : undefined,
      };
    });

    return {
      format,
      version,
      components: nodes,
      totalComponents: nodes.length,
      missingMetadataCount: nodes.filter(n => n.missingMetadata).length,
      ecosystemDistribution: { generic: nodes.length },
      licenseDistribution: {},
    };
  }

  throw new Error('Unsupported SBOM format. Expected CycloneDX 1.4/1.5 JSON or SPDX 2.2/2.3 JSON.');
}

export function exportSbomJson(report: ParsedSbomReport): string {
  return JSON.stringify(report, null, 2);
}
