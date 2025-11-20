export interface OutdatedPackage {
    name: string;
    currentVersion: string;
    latestVersion: string;
    wantedVersion?: string;
}
export declare function getOutdatedPackages(specificPackages?: string[]): Promise<OutdatedPackage[]>;
//# sourceMappingURL=packageChecker.d.ts.map