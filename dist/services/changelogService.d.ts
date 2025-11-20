import { SecurityAnalysis } from './securityAnalysisService';
export interface PackageChange {
    version: string;
    date?: string;
    changes: string[];
}
export interface PackageChanges {
    packageName: string;
    currentVersion: string;
    latestVersion: string;
    changes: PackageChange[];
    summary?: string;
    securityAnalysis?: SecurityAnalysis;
}
export declare function getPackageChanges(packageName: string, currentVersion: string, latestVersion: string): Promise<PackageChanges>;
//# sourceMappingURL=changelogService.d.ts.map