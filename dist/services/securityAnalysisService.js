import axios from 'axios';
import semver from 'semver';
const npmRegistryUrl = 'https://registry.npmjs.org';
const githubApiUrl = 'https://api.github.com';
export async function analyzePackageSecurity(packageName, currentVersion, latestVersion, packageData) {
    const warnings = [];
    try {
        // Get repository information
        const repo = packageData.repository;
        if (!repo || !repo.url) {
            warnings.push({
                level: 'low',
                category: 'Repository',
                message: 'No repository information available',
            });
            return generateAnalysisResult(warnings);
        }
        const githubInfo = extractGitHubInfo(repo.url);
        if (!githubInfo) {
            return generateAnalysisResult(warnings);
        }
        // Run all security checks
        await Promise.all([
            checkSuspiciousCommits(githubInfo, currentVersion, latestVersion, warnings),
            checkMaintainers(githubInfo, warnings),
            checkNpmReleases(githubInfo, packageName, currentVersion, latestVersion, warnings),
            checkPackageJsonChanges(githubInfo, currentVersion, latestVersion, warnings),
            checkSuspiciousFiles(githubInfo, currentVersion, latestVersion, warnings),
            checkGitHubActions(githubInfo, warnings),
            checkRepoActivity(githubInfo, warnings),
        ]);
        return generateAnalysisResult(warnings);
    }
    catch (error) {
        warnings.push({
            level: 'low',
            category: 'Analysis',
            message: 'Security analysis encountered errors',
            details: error instanceof Error ? error.message : 'Unknown error',
        });
        return generateAnalysisResult(warnings);
    }
}
function extractGitHubInfo(repoUrl) {
    const match = repoUrl.match(/github\.com[/:]([^/]+)\/([^/]+?)(?:\.git)?$/);
    if (!match)
        return null;
    return {
        owner: match[1],
        repo: match[2].replace(/\.git$/, ''),
    };
}
async function checkSuspiciousCommits(githubInfo, currentVersion, latestVersion, warnings) {
    try {
        // Get commits between versions
        const currentTag = await getVersionTag(githubInfo, currentVersion);
        const latestTag = await getVersionTag(githubInfo, latestVersion);
        if (!currentTag || !latestTag) {
            return;
        }
        const commits = await fetchCommits(githubInfo, currentTag, latestTag);
        for (const commit of commits) {
            // Check for minified/obfuscated code
            if (isMinifiedCode(commit.message, commit.files)) {
                warnings.push({
                    level: 'high',
                    category: 'Suspicious Commits',
                    message: `Minified or obfuscated code detected in commit ${commit.sha.substring(0, 7)}`,
                    details: `Commit: ${commit.message}`,
                });
            }
            // Check for large diffs with small commit messages
            if (commit.stats.total > 1000 && commit.message.length < 50) {
                warnings.push({
                    level: 'medium',
                    category: 'Suspicious Commits',
                    message: `Large diff (${commit.stats.total} changes) with short commit message`,
                    details: `Commit: ${commit.message}`,
                });
            }
            // Check for suspicious patterns in commit message
            if (containsSuspiciousPatterns(commit.message)) {
                warnings.push({
                    level: 'high',
                    category: 'Suspicious Commits',
                    message: `Suspicious patterns detected in commit message`,
                    details: `Commit: ${commit.message}`,
                });
            }
            // Check commit timing (odd hours)
            const commitDate = new Date(commit.date);
            const hour = commitDate.getHours();
            if (hour >= 2 && hour <= 5) {
                warnings.push({
                    level: 'low',
                    category: 'Suspicious Commits',
                    message: `Commit made at unusual hour (${hour}:00)`,
                    details: `Commit: ${commit.message}`,
                });
            }
        }
    }
    catch (error) {
        // Silently fail - GitHub API might not be accessible
    }
}
async function checkMaintainers(githubInfo, warnings) {
    try {
        const contributors = await fetchContributors(githubInfo);
        // Check for new contributors by looking at their recent commits
        if (contributors.length > 0) {
            // Get recent commits to check for new contributors
            const recentCommits = await fetchRecentCommits(githubInfo, 30);
            const contributorSet = new Set(recentCommits.map((c) => c.author?.login).filter(Boolean));
            if (contributorSet.size > 0 && recentCommits.length > 0) {
                // Check if there are contributors we haven't seen before
                const topContributors = contributors.slice(0, 10).map((c) => c.login);
                const newContributors = Array.from(contributorSet).filter((login) => !topContributors.includes(login));
                if (newContributors.length > 0) {
                    warnings.push({
                        level: 'medium',
                        category: 'Maintainers',
                        message: `New contributor(s) detected in recent commits`,
                        details: `Contributors: ${newContributors.join(', ')}`,
                    });
                }
            }
        }
    }
    catch (error) {
        // Silently fail
    }
}
async function checkNpmReleases(githubInfo, packageName, currentVersion, latestVersion, warnings) {
    try {
        // Get GitHub tags
        const tags = await fetchTags(githubInfo);
        const githubVersions = tags.map(t => t.name.replace(/^v?/, ''));
        // Get npm versions
        const npmResponse = await axios.get(`${npmRegistryUrl}/${packageName}`);
        const npmVersions = Object.keys(npmResponse.data.versions || {});
        // Check if latest version exists in GitHub
        const latestClean = semver.valid(semver.coerce(latestVersion)) || latestVersion;
        const existsInGitHub = githubVersions.some(v => {
            const vClean = semver.valid(semver.coerce(v)) || v;
            return vClean === latestClean;
        });
        if (!existsInGitHub) {
            warnings.push({
                level: 'high',
                category: 'Releases',
                message: `Version ${latestVersion} exists on npm but not in GitHub tags`,
                details: 'This could indicate a compromised package was published',
            });
        }
        // Check for large version jumps
        const currentClean = semver.valid(semver.coerce(currentVersion)) || currentVersion;
        if (currentClean && latestClean) {
            const majorDiff = semver.major(latestClean) - semver.major(currentClean);
            if (majorDiff > 1) {
                warnings.push({
                    level: 'medium',
                    category: 'Releases',
                    message: `Large version jump: ${currentVersion} → ${latestVersion}`,
                    details: 'Major version jump without clear justification',
                });
            }
        }
    }
    catch (error) {
        // Silently fail
    }
}
async function checkPackageJsonChanges(githubInfo, currentVersion, latestVersion, warnings) {
    try {
        const currentPackageJson = await fetchFileContent(githubInfo, currentVersion, 'package.json');
        const latestPackageJson = await fetchFileContent(githubInfo, latestVersion, 'package.json');
        if (!currentPackageJson || !latestPackageJson) {
            return;
        }
        const current = JSON.parse(currentPackageJson);
        const latest = JSON.parse(latestPackageJson);
        // Check for new postinstall/preinstall scripts
        const currentScripts = current.scripts || {};
        const latestScripts = latest.scripts || {};
        for (const scriptName of ['postinstall', 'preinstall', 'install']) {
            if (!currentScripts[scriptName] && latestScripts[scriptName]) {
                warnings.push({
                    level: 'critical',
                    category: 'Package.json',
                    message: `New ${scriptName} script detected`,
                    details: `Script: ${latestScripts[scriptName]}`,
                });
            }
        }
        // Check for suspicious new dependencies
        const currentDeps = { ...current.dependencies, ...current.devDependencies };
        const latestDeps = { ...latest.dependencies, ...latest.devDependencies };
        for (const [depName, depVersion] of Object.entries(latestDeps)) {
            if (!currentDeps[depName]) {
                // Check for typosquatting patterns
                if (isSuspiciousPackageName(depName)) {
                    warnings.push({
                        level: 'high',
                        category: 'Package.json',
                        message: `Suspicious new dependency: ${depName}`,
                        details: 'Package name may be typosquatting',
                    });
                }
                // Check for random-looking package names
                if (isRandomPackageName(depName)) {
                    warnings.push({
                        level: 'medium',
                        category: 'Package.json',
                        message: `New dependency with random-looking name: ${depName}`,
                    });
                }
            }
        }
    }
    catch (error) {
        // Silently fail
    }
}
async function checkSuspiciousFiles(githubInfo, currentVersion, latestVersion, warnings) {
    try {
        const files = await fetchChangedFiles(githubInfo, currentVersion, latestVersion);
        const suspiciousPatterns = [
            /install\.js$/i,
            /postinstall\.js$/i,
            /\.exe$/i,
            /\.dll$/i,
            /\.bin$/i,
            /\.sh$/i,
            /install\.sh$/i,
        ];
        for (const file of files) {
            for (const pattern of suspiciousPatterns) {
                if (pattern.test(file)) {
                    warnings.push({
                        level: 'high',
                        category: 'Suspicious Files',
                        message: `Suspicious file detected: ${file}`,
                        details: 'File matches known attack patterns',
                    });
                    break;
                }
            }
            // Check for large binary files
            if (file.endsWith('.wasm') || file.endsWith('.bin')) {
                warnings.push({
                    level: 'medium',
                    category: 'Suspicious Files',
                    message: `Binary file added: ${file}`,
                });
            }
        }
    }
    catch (error) {
        // Silently fail
    }
}
async function checkGitHubActions(githubInfo, warnings) {
    try {
        const workflows = await fetchWorkflows(githubInfo);
        // Check for new workflows
        if (workflows.length > 0) {
            const recentWorkflows = workflows.filter(w => {
                const daysSince = getDaysSince(w.updated);
                return daysSince < 30;
            });
            if (recentWorkflows.length > 0) {
                warnings.push({
                    level: 'medium',
                    category: 'GitHub Actions',
                    message: `${recentWorkflows.length} new or modified workflow(s) detected`,
                    details: 'Review GitHub Actions for suspicious publish steps',
                });
            }
        }
    }
    catch (error) {
        // Silently fail
    }
}
async function checkRepoActivity(githubInfo, warnings) {
    try {
        const repoInfo = await fetchRepoInfo(githubInfo);
        const recentActivity = await fetchRecentActivity(githubInfo);
        // Check if repo was inactive then suddenly active
        if (repoInfo && recentActivity) {
            const daysSinceLastActivity = getDaysSince(repoInfo.updated);
            const daysSinceCreated = getDaysSince(repoInfo.created);
            // If repo is old but suddenly active
            if (daysSinceCreated > 365 && daysSinceLastActivity < 7) {
                const previousActivity = await fetchActivityBefore(githubInfo, 30);
                if (previousActivity.length === 0) {
                    warnings.push({
                        level: 'high',
                        category: 'Repo Activity',
                        message: 'Repository shows sudden activity after long period of inactivity',
                        details: 'Possible account takeover or compromised maintainer',
                    });
                }
            }
        }
    }
    catch (error) {
        // Silently fail
    }
}
// Helper functions
function isMinifiedCode(message, files) {
    const minifiedPatterns = [
        /minified/i,
        /obfuscated/i,
        /uglify/i,
        /\.min\.js/,
        /bundle\.js/,
    ];
    if (minifiedPatterns.some(p => p.test(message))) {
        return true;
    }
    // Check if files are minified
    if (files) {
        return files.some((f) => f.filename && /\.min\.(js|css)$/.test(f.filename));
    }
    return false;
}
function containsSuspiciousPatterns(message) {
    const patterns = [
        /eval\(/i,
        /base64/i,
        /atob\(/i,
        /btoa\(/i,
        /crypto/i,
        /encrypt/i,
        /decrypt/i,
        /http:\/\//i, // Non-HTTPS URLs
        /\.onion/i, // Tor hidden services
    ];
    return patterns.some(p => p.test(message));
}
function isSuspiciousPackageName(name) {
    // Check for typosquatting patterns
    const commonPackages = ['lodash', 'express', 'react', 'axios', 'moment'];
    const suspiciousPatterns = [
        /^[a-z]{1,3}$/, // Very short names
        /^[0-9]+$/, // Only numbers
        /[0-9]{4,}/, // Long number sequences
    ];
    // Check if it's similar to common packages
    for (const common of commonPackages) {
        if (name.includes(common) && name !== common) {
            return true; // Possible typosquatting
        }
    }
    return suspiciousPatterns.some(p => p.test(name));
}
function isRandomPackageName(name) {
    // Check for random-looking patterns
    const randomPatterns = [
        /^[a-z]+[0-9]+[a-z]+$/, // Mixed alphanumeric
        /^[a-z]{10,}$/, // Very long lowercase
        /^[0-9a-f]{32,}$/, // Looks like a hash
    ];
    return randomPatterns.some(p => p.test(name));
}
function generateAnalysisResult(warnings) {
    const criticalCount = warnings.filter(w => w.level === 'critical').length;
    const highCount = warnings.filter(w => w.level === 'high').length;
    const mediumCount = warnings.filter(w => w.level === 'medium').length;
    const lowCount = warnings.filter(w => w.level === 'low').length;
    // Calculate risk score (0-100)
    let riskScore = 0;
    riskScore += criticalCount * 30;
    riskScore += highCount * 20;
    riskScore += mediumCount * 10;
    riskScore += lowCount * 5;
    riskScore = Math.min(100, riskScore);
    let summary = '';
    if (riskScore === 0) {
        summary = '✅ No security issues detected';
    }
    else if (riskScore < 30) {
        summary = '⚠️ Low risk: Minor security concerns detected';
    }
    else if (riskScore < 60) {
        summary = '🔶 Medium risk: Several security warnings';
    }
    else if (riskScore < 80) {
        summary = '🔴 High risk: Multiple serious security issues';
    }
    else {
        summary = '🚨 Critical risk: Immediate security review required';
    }
    return {
        warnings,
        riskScore,
        summary,
    };
}
// GitHub API helpers (with rate limiting and error handling)
async function fetchCommits(githubInfo, fromTag, toTag) {
    try {
        const response = await axios.get(`${githubApiUrl}/repos/${githubInfo.owner}/${githubInfo.repo}/compare/${fromTag}...${toTag}`, {
            headers: {
                Accept: 'application/vnd.github.v3+json',
            },
            timeout: 10000,
        });
        // Transform commits to include message, sha, date, and stats
        return (response.data.commits || []).map((commit) => ({
            sha: commit.sha,
            message: commit.commit.message,
            date: commit.commit.author.date,
            author: commit.author?.login,
            stats: response.data.files ? {
                total: response.data.files.reduce((sum, f) => sum + (f.additions || 0) + (f.deletions || 0), 0),
            } : { total: 0 },
            files: response.data.files || [],
        }));
    }
    catch {
        return [];
    }
}
async function fetchRecentCommits(githubInfo, days) {
    try {
        const since = new Date();
        since.setDate(since.getDate() - days);
        const response = await axios.get(`${githubApiUrl}/repos/${githubInfo.owner}/${githubInfo.repo}/commits`, {
            headers: {
                Accept: 'application/vnd.github.v3+json',
            },
            params: {
                since: since.toISOString(),
                per_page: 100,
            },
            timeout: 10000,
        });
        return response.data || [];
    }
    catch {
        return [];
    }
}
async function getVersionTag(githubInfo, version) {
    try {
        const tags = await fetchTags(githubInfo);
        const cleanVersion = semver.valid(semver.coerce(version)) || version;
        for (const tag of tags) {
            const tagVersion = semver.valid(semver.coerce(tag.name.replace(/^v?/, ''))) || tag.name.replace(/^v?/, '');
            if (tagVersion === cleanVersion) {
                return tag.name;
            }
        }
        return null;
    }
    catch {
        return null;
    }
}
async function fetchTags(githubInfo) {
    try {
        const response = await axios.get(`${githubApiUrl}/repos/${githubInfo.owner}/${githubInfo.repo}/tags`, {
            headers: {
                Accept: 'application/vnd.github.v3+json',
            },
            timeout: 5000,
        });
        return response.data || [];
    }
    catch {
        return [];
    }
}
async function fetchContributors(githubInfo) {
    try {
        const response = await axios.get(`${githubApiUrl}/repos/${githubInfo.owner}/${githubInfo.repo}/contributors`, {
            headers: {
                Accept: 'application/vnd.github.v3+json',
            },
            timeout: 5000,
        });
        return response.data || [];
    }
    catch {
        return [];
    }
}
async function fetchFileContent(githubInfo, version, filePath) {
    try {
        const tag = await getVersionTag(githubInfo, version);
        if (!tag)
            return null;
        const response = await axios.get(`${githubApiUrl}/repos/${githubInfo.owner}/${githubInfo.repo}/contents/${filePath}?ref=${tag}`, {
            headers: {
                Accept: 'application/vnd.github.v3+json',
            },
            timeout: 5000,
        });
        if (response.data.content) {
            return Buffer.from(response.data.content, 'base64').toString('utf-8');
        }
        return null;
    }
    catch {
        return null;
    }
}
async function fetchChangedFiles(githubInfo, currentVersion, latestVersion) {
    try {
        const currentTag = await getVersionTag(githubInfo, currentVersion);
        const latestTag = await getVersionTag(githubInfo, latestVersion);
        if (!currentTag || !latestTag)
            return [];
        const response = await axios.get(`${githubApiUrl}/repos/${githubInfo.owner}/${githubInfo.repo}/compare/${currentTag}...${latestTag}`, {
            headers: {
                Accept: 'application/vnd.github.v3+json',
            },
            timeout: 5000,
        });
        return (response.data.files || []).map((f) => f.filename);
    }
    catch {
        return [];
    }
}
async function fetchWorkflows(githubInfo) {
    try {
        const response = await axios.get(`${githubApiUrl}/repos/${githubInfo.owner}/${githubInfo.repo}/actions/workflows`, {
            headers: {
                Accept: 'application/vnd.github.v3+json',
            },
            timeout: 5000,
        });
        return response.data.workflows || [];
    }
    catch {
        return [];
    }
}
async function fetchRepoInfo(githubInfo) {
    try {
        const response = await axios.get(`${githubApiUrl}/repos/${githubInfo.owner}/${githubInfo.repo}`, {
            headers: {
                Accept: 'application/vnd.github.v3+json',
            },
            timeout: 5000,
        });
        return response.data;
    }
    catch {
        return null;
    }
}
async function fetchRecentActivity(githubInfo) {
    try {
        const response = await axios.get(`${githubApiUrl}/repos/${githubInfo.owner}/${githubInfo.repo}/commits`, {
            headers: {
                Accept: 'application/vnd.github.v3+json',
            },
            params: {
                per_page: 10,
            },
            timeout: 5000,
        });
        return response.data;
    }
    catch {
        return null;
    }
}
async function fetchActivityBefore(githubInfo, daysAgo) {
    try {
        const since = new Date();
        since.setDate(since.getDate() - daysAgo);
        const response = await axios.get(`${githubApiUrl}/repos/${githubInfo.owner}/${githubInfo.repo}/commits`, {
            headers: {
                Accept: 'application/vnd.github.v3+json',
            },
            params: {
                since: since.toISOString(),
                per_page: 100,
            },
            timeout: 5000,
        });
        return response.data || [];
    }
    catch {
        return [];
    }
}
function getDaysSince(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
//# sourceMappingURL=securityAnalysisService.js.map