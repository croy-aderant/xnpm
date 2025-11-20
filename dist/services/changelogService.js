import axios from 'axios';
import semver from 'semver';
import { analyzePackageSecurity } from './securityAnalysisService';
const npmRegistryUrl = 'https://registry.npmjs.org';
export async function getPackageChanges(packageName, currentVersion, latestVersion) {
    try {
        // Fetch package metadata from npm registry
        const response = await axios.get(`${npmRegistryUrl}/${packageName}`);
        const packageData = response.data;
        // Clean versions for comparison
        const currentClean = semver.valid(semver.coerce(currentVersion)) || currentVersion;
        const latestClean = semver.valid(semver.coerce(latestVersion)) || latestVersion;
        // Get all versions between current and latest
        const versions = Object.keys(packageData.versions || {})
            .filter(version => {
            const versionClean = semver.valid(version);
            if (!versionClean || !currentClean || !latestClean) {
                // Fallback to string comparison if semver fails
                return version > currentVersion && version <= latestVersion;
            }
            return semver.gt(versionClean, currentClean) && semver.lte(versionClean, latestClean);
        })
            .sort((a, b) => {
            const aClean = semver.valid(a);
            const bClean = semver.valid(b);
            if (aClean && bClean) {
                return semver.compare(aClean, bClean);
            }
            // Fallback to string comparison
            return a.localeCompare(b);
        });
        const changes = [];
        // Try to get changelog from CHANGELOG.md or similar files
        let changelogContent = null;
        try {
            // Try to fetch from GitHub if repository info is available
            const repo = packageData.repository;
            if (repo && repo.url) {
                const githubUrl = repo.url.replace(/^git\+/, '').replace(/\.git$/, '');
                changelogContent = await tryFetchChangelogFromGitHub(githubUrl);
            }
        }
        catch {
            // Ignore errors
        }
        // If we have a changelog, parse it
        if (changelogContent) {
            const parsedChanges = parseChangelog(changelogContent, currentVersion, latestVersion);
            changes.push(...parsedChanges);
        }
        // If no changelog found, try to get info from package.json descriptions
        if (changes.length === 0) {
            for (const version of versions.slice(-5)) { // Last 5 versions
                const versionData = packageData.versions[version];
                if (versionData) {
                    changes.push({
                        version,
                        date: versionData.time || packageData.time?.[version],
                        changes: [
                            versionData.description || 'No changelog available',
                        ],
                    });
                }
            }
        }
        // Generate a summary
        const summary = generateSummary(packageName, currentVersion, latestVersion, versions.length);
        // Perform security analysis (async, don't block)
        let securityAnalysis;
        try {
            securityAnalysis = await analyzePackageSecurity(packageName, currentVersion, latestVersion, packageData);
        }
        catch (error) {
            // Silently fail security analysis - don't block changelog display
            // Only log in debug mode
        }
        return {
            packageName,
            currentVersion,
            latestVersion,
            changes: changes.length > 0 ? changes : [{
                    version: latestVersion,
                    changes: [`Updated from ${currentVersion} to ${latestVersion}`],
                }],
            summary,
            securityAnalysis,
        };
    }
    catch (error) {
        // Fallback: return basic info
        return {
            packageName,
            currentVersion,
            latestVersion,
            changes: [{
                    version: latestVersion,
                    changes: [`Version update from ${currentVersion} to ${latestVersion}`],
                }],
            summary: `Updated from ${currentVersion} to ${latestVersion}`,
        };
    }
}
async function tryFetchChangelogFromGitHub(repoUrl) {
    try {
        // Convert GitHub URL to raw content URL
        const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
        if (!match)
            return null;
        const [, owner, repo] = match;
        const possibleFiles = ['CHANGELOG.md', 'CHANGES.md', 'HISTORY.md', 'RELEASES.md'];
        for (const file of possibleFiles) {
            try {
                const url = `https://raw.githubusercontent.com/${owner}/${repo}/main/${file}`;
                const response = await axios.get(url, { timeout: 5000 });
                if (response.status === 200) {
                    return response.data;
                }
            }
            catch {
                // Try next file
                continue;
            }
        }
    }
    catch {
        // Ignore errors
    }
    return null;
}
function parseChangelog(content, fromVersion, toVersion) {
    const changes = [];
    const lines = content.split('\n');
    let currentVersion = null;
    let currentChanges = [];
    let inRelevantSection = false;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        // Look for version headers (v1.2.3, ## 1.2.3, etc.)
        const versionMatch = line.match(/^(?:##?\s*)?v?(\d+\.\d+\.\d+(?:-[^\s]+)?)/i);
        if (versionMatch) {
            const version = versionMatch[1];
            // If we were collecting changes, save them
            if (currentVersion && inRelevantSection) {
                changes.push({
                    version: currentVersion,
                    changes: [...currentChanges],
                });
            }
            // Check if this version is in our range using semver
            const versionClean = semver.valid(version);
            const fromClean = semver.valid(semver.coerce(fromVersion)) || fromVersion;
            const toClean = semver.valid(semver.coerce(toVersion)) || toVersion;
            let inRange = false;
            if (versionClean && fromClean && toClean) {
                inRange = semver.gt(versionClean, fromClean) && semver.lte(versionClean, toClean);
            }
            else {
                // Fallback to string comparison
                inRange = version > fromVersion && version <= toVersion;
            }
            if (inRange) {
                inRelevantSection = true;
                currentVersion = version;
                currentChanges = [];
            }
            else {
                const isBeforeFrom = versionClean && fromClean
                    ? semver.lte(versionClean, fromClean)
                    : version <= fromVersion;
                if (isBeforeFrom) {
                    inRelevantSection = false;
                }
            }
        }
        else if (inRelevantSection && line && !line.startsWith('#')) {
            // Collect change items
            if (line.startsWith('-') || line.startsWith('*')) {
                currentChanges.push(line.substring(1).trim());
            }
            else if (line.length > 0) {
                currentChanges.push(line);
            }
        }
    }
    // Save last version's changes
    if (currentVersion && inRelevantSection && currentChanges.length > 0) {
        changes.push({
            version: currentVersion,
            changes: currentChanges,
        });
    }
    return changes;
}
function generateSummary(packageName, currentVersion, latestVersion, versionCount) {
    if (versionCount === 0) {
        return `No intermediate versions between ${currentVersion} and ${latestVersion}`;
    }
    return `Update from ${currentVersion} to ${latestVersion} (${versionCount} version${versionCount !== 1 ? 's' : ''} in between)`;
}
//# sourceMappingURL=changelogService.js.map