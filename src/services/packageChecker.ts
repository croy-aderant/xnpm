import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { join } from 'path';
import semver from 'semver';

export interface OutdatedPackage {
  name: string;
  currentVersion: string;
  latestVersion: string;
  wantedVersion?: string;
}

export async function getOutdatedPackages(specificPackages: string[] = []): Promise<OutdatedPackage[]> {
  try {
    // Read package.json to get current versions
    const packageJsonPath = join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    
    const dependencies = {
      ...packageJson.dependencies || {},
      ...packageJson.devDependencies || {},
    };

    // If specific packages are requested, filter to those
    const packagesToCheck = specificPackages.length > 0
      ? specificPackages.filter(pkg => dependencies[pkg])
      : Object.keys(dependencies);

    if (packagesToCheck.length === 0) {
      return [];
    }

    const outdated: OutdatedPackage[] = [];

    // Use npm outdated command to get information
    try {
      const output = execSync(
        `npm outdated --json ${packagesToCheck.join(' ')}`,
        { encoding: 'utf-8', stdio: 'pipe', maxBuffer: 10 * 1024 * 1024 }
      );

      const outdatedData = JSON.parse(output);
      
      for (const [name, info] of Object.entries(outdatedData as Record<string, any>)) {
        const current = info.current || dependencies[name];
        const latest = info.latest;
        const wanted = info.wanted;

        // Clean version for comparison (remove ^, ~, etc.)
        const currentClean = semver.valid(semver.coerce(current)) || current;
        const latestClean = semver.valid(latest) || latest;

        if (latestClean && currentClean && semver.gt(latestClean, currentClean)) {
          outdated.push({
            name,
            currentVersion: current,
            latestVersion: latest,
            wantedVersion: wanted,
          });
        }
      }
    } catch (error: any) {
      // npm outdated exits with code 1 when there are outdated packages
      // This is expected, so we parse the output anyway
      const output = error.stdout || error.stderr || '';
      if (output) {
        try {
          const outdatedData = JSON.parse(output);
          for (const [name, info] of Object.entries(outdatedData as Record<string, any>)) {
            const current = info.current || dependencies[name];
            const latest = info.latest;
            const wanted = info.wanted;

            // Clean version for comparison
            const currentClean = semver.valid(semver.coerce(current)) || current;
            const latestClean = semver.valid(latest) || latest;

            if (latestClean && currentClean && semver.gt(latestClean, currentClean)) {
              outdated.push({
                name,
                currentVersion: current,
                latestVersion: latest,
                wantedVersion: wanted,
              });
            }
          }
        } catch {
          // If parsing fails, fall back to manual checking
        }
      }
    }

    // Fallback: manually check each package via registry
    if (outdated.length === 0) {
      for (const pkgName of packagesToCheck) {
        try {
          const currentVersionRaw = dependencies[pkgName];
          const currentVersion = semver.valid(semver.coerce(currentVersionRaw)) || currentVersionRaw.replace(/[\^~]/, '');
          const latestVersion = await getLatestVersion(pkgName);
          
          if (latestVersion && currentVersion && semver.gt(latestVersion, currentVersion)) {
            outdated.push({
              name: pkgName,
              currentVersion: currentVersionRaw,
              latestVersion: latestVersion,
            });
          }
        } catch {
          // Skip packages that can't be checked
        }
      }
    }

    return outdated;
  } catch (error) {
    console.error('Error checking outdated packages:', error);
    return [];
  }
}

async function getLatestVersion(packageName: string): Promise<string | null> {
  try {
    const output = execSync(`npm view ${packageName} version`, { encoding: 'utf-8' });
    return output.trim();
  } catch {
    return null;
  }
}

