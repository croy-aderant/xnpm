import { execSync } from 'child_process';
import { readFileSync, mkdtempSync, rmSync, readdirSync, statSync, createWriteStream, renameSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import axios from 'axios';
import { pipeline } from 'stream/promises';
import tar from 'tar';
import { createTwoFilesPatch } from 'diff';
import semver from 'semver';

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

const npmRegistryUrl = 'https://registry.npmjs.org';

export async function getPackageDiff(
  packageName: string,
  currentVersion: string,
  latestVersion: string
): Promise<PackageDiff> {
  // Clean versions
  const currentClean = semver.valid(semver.coerce(currentVersion)) || currentVersion;
  const latestClean = semver.valid(semver.coerce(latestVersion)) || latestVersion;

  if (!currentClean || !latestClean) {
    throw new Error(`Invalid versions: ${currentVersion} or ${latestVersion}`);
  }

  // Create temporary directories
  const tempDir = mkdtempSync(join(tmpdir(), 'xnpm-diff-'));
  const currentDir = join(tempDir, 'current');
  const latestDir = join(tempDir, 'latest');

  try {
    // Fetch and extract both versions
    await fetchAndExtractPackage(packageName, currentClean, currentDir);
    await fetchAndExtractPackage(packageName, latestClean, latestDir);

    // Compare the directories
    const diff = await compareDirectories(currentDir, latestDir, packageName);

    return {
      packageName,
      currentVersion: currentClean,
      latestVersion: latestClean,
      ...diff,
    };
  } finally {
    // Cleanup
    rmSync(tempDir, { recursive: true, force: true });
  }
}

async function fetchAndExtractPackage(
  packageName: string,
  version: string,
  targetDir: string
): Promise<void> {
  try {
    // Try to get tarball URL from npm registry
    const response = await axios.get(`${npmRegistryUrl}/${packageName}/${version}`);
    const tarballUrl = response.data.dist?.tarball;

    if (!tarballUrl) {
      throw new Error(`No tarball URL found for ${packageName}@${version}`);
    }

    // Download tarball
    const tarballResponse = await axios.get(tarballUrl, {
      responseType: 'stream',
    });

    const tarballPath = join(targetDir, 'package.tgz');
    const writeStream = createWriteStream(tarballPath);

    await pipeline(tarballResponse.data, writeStream);

    // Extract tarball
    await tar.extract({
      file: tarballPath,
      cwd: targetDir,
    });

    // Find the package directory (usually package-version)
    const entries = readdirSync(targetDir);
    const packageDir = entries.find((entry: string) => {
      const fullPath = join(targetDir, entry);
      return statSync(fullPath).isDirectory() && entry.startsWith('package');
    });

    if (packageDir) {
      // Move contents up one level
      const packagePath = join(targetDir, packageDir);
      const files = readdirSync(packagePath);
      for (const file of files) {
        const src = join(packagePath, file);
        const dest = join(targetDir, file);
        try {
          renameSync(src, dest);
        } catch {
          // Fallback to exec if rename fails (cross-device issues)
          execSync(`mv "${src}" "${dest}"`, { cwd: targetDir });
        }
      }
      rmSync(packagePath, { recursive: true, force: true });
    }

    // Clean up tarball
    rmSync(tarballPath, { force: true });
  } catch (error) {
    // Fallback: use npm pack
    try {
      const packOutput = execSync(`npm pack ${packageName}@${version}`, {
        encoding: 'utf-8',
        cwd: targetDir,
        stdio: 'pipe',
      }).trim();

      const tarballName = packOutput.split('\n').pop() || `${packageName}-${version}.tgz`;
      const tarballPath = join(process.cwd(), tarballName);

      if (statSync(tarballPath).isFile()) {
        await tar.extract({
          file: tarballPath,
          cwd: targetDir,
        });

        // Find and move package directory
        const entries = readdirSync(targetDir);
        const packageDir = entries.find((entry: string) => {
          const fullPath = join(targetDir, entry);
          return statSync(fullPath).isDirectory() && entry.startsWith('package');
        });

        if (packageDir) {
          const packagePath = join(targetDir, packageDir);
          const files = readdirSync(packagePath);
          for (const file of files) {
            const src = join(packagePath, file);
            const dest = join(targetDir, file);
            try {
              renameSync(src, dest);
            } catch {
              // Fallback to exec if rename fails
              execSync(`mv "${src}" "${dest}"`, { cwd: targetDir });
            }
          }
          rmSync(packagePath, { recursive: true, force: true });
        }

        // Clean up tarball
        rmSync(tarballPath, { force: true });
      }
    } catch (fallbackError) {
      throw new Error(`Failed to fetch package ${packageName}@${version}: ${error}`);
    }
  }
}

async function compareDirectories(
  currentDir: string,
  latestDir: string,
  packageName: string
): Promise<{
  files: FileDiff[];
  summary: {
    filesChanged: number;
    filesAdded: number;
    filesRemoved: number;
    totalAdditions: number;
    totalDeletions: number;
  };
}> {
  const files: FileDiff[] = [];
  const currentFiles = getAllFiles(currentDir, currentDir);
  const latestFiles = getAllFiles(latestDir, latestDir);

  const allFiles = new Set([...currentFiles, ...latestFiles]);

  let filesChanged = 0;
  let filesAdded = 0;
  let filesRemoved = 0;
  let totalAdditions = 0;
  let totalDeletions = 0;

  for (const file of allFiles) {
    const currentPath = join(currentDir, file);
    const latestPath = join(latestDir, file);
    let currentExists = false;
    let latestExists = false;
    try {
      currentExists = statSync(currentPath).isFile();
    } catch {
      currentExists = false;
    }
    try {
      latestExists = statSync(latestPath).isFile();
    } catch {
      latestExists = false;
    }

    // Skip binary files and node_modules
    if (file.includes('node_modules') || isBinaryFile(file)) {
      continue;
    }

    if (!currentExists && latestExists) {
      // File added
      filesAdded++;
      try {
        const content = readFileSync(latestPath, 'utf-8');
        const diff = createTwoFilesPatch('', file, '', content, '', '');
        const stats = countDiffStats(diff);
        files.push({
          file,
          additions: stats.additions,
          deletions: 0,
          diff,
        });
        totalAdditions += stats.additions;
      } catch {
        // Skip files that can't be read as text
      }
    } else if (currentExists && !latestExists) {
      // File removed
      filesRemoved++;
      try {
        const content = readFileSync(currentPath, 'utf-8');
        const diff = createTwoFilesPatch(file, '', content, '', '');
        const stats = countDiffStats(diff);
        files.push({
          file,
          additions: 0,
          deletions: stats.deletions,
          diff,
        });
        totalDeletions += stats.deletions;
      } catch {
        // Skip files that can't be read as text
      }
    } else if (currentExists && latestExists) {
      // File modified
      try {
        const currentContent = readFileSync(currentPath, 'utf-8');
        const latestContent = readFileSync(latestPath, 'utf-8');

        if (currentContent !== latestContent) {
          filesChanged++;
          const diff = createTwoFilesPatch(file, file, currentContent, latestContent, '', '');
          const stats = countDiffStats(diff);
          files.push({
            file,
            additions: stats.additions,
            deletions: stats.deletions,
            diff,
          });
          totalAdditions += stats.additions;
          totalDeletions += stats.deletions;
        }
      } catch {
        // Skip files that can't be read as text
      }
    }
  }

  return {
    files,
    summary: {
      filesChanged,
      filesAdded,
      filesRemoved,
      totalAdditions,
      totalDeletions,
    },
  };
}

function getAllFiles(dir: string, baseDir: string): string[] {
  const files: string[] = [];
  const entries = readdirSync(dir);

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const relativePath = fullPath.replace(baseDir + '/', '');
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      // Skip node_modules and other common directories
      if (entry === 'node_modules' || entry === '.git') {
        continue;
      }
      files.push(...getAllFiles(fullPath, baseDir));
    } else if (stat.isFile()) {
      files.push(relativePath);
    }
  }

  return files;
}

function isBinaryFile(filename: string): boolean {
  const binaryExtensions = [
    '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg',
    '.woff', '.woff2', '.ttf', '.eot',
    '.zip', '.tar', '.gz', '.tgz',
    '.exe', '.dll', '.so', '.dylib',
    '.pdf', '.doc', '.docx',
  ];
  return binaryExtensions.some(ext => filename.toLowerCase().endsWith(ext));
}

function countDiffStats(diff: string): { additions: number; deletions: number } {
  const lines = diff.split('\n');
  let additions = 0;
  let deletions = 0;

  for (const line of lines) {
    if (line.startsWith('+') && !line.startsWith('+++')) {
      additions++;
    } else if (line.startsWith('-') && !line.startsWith('---')) {
      deletions++;
    }
  }

  return { additions, deletions };
}

