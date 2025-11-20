export interface SecurityWarning {
    level: 'low' | 'medium' | 'high' | 'critical';
    category: string;
    message: string;
    details?: string;
}
export interface SecurityAnalysis {
    warnings: SecurityWarning[];
    riskScore: number;
    summary: string;
}
export declare function analyzePackageSecurity(packageName: string, currentVersion: string, latestVersion: string, packageData: any): Promise<SecurityAnalysis>;
//# sourceMappingURL=securityAnalysisService.d.ts.map