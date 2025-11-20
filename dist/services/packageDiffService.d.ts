export interface FileDiff {
    file: string;
    additions: number;
    deletions: number;
    diff: string;
}
export interface PackageDiff {
    packageName: string;
    currentVersion: string;
    latestVersion: string;
    files: FileDiff[];
    summary: {
        filesChanged: number;
        filesAdded: number;
        filesRemoved: number;
        totalAdditions: number;
        totalDeletions: number;
    };
}
export declare function getPackageDiff(packageName: string, currentVersion: string, latestVersion: string): Promise<PackageDiff>;
//# sourceMappingURL=packageDiffService.d.ts.map