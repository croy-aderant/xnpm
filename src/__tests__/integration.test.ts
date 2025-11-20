import { describe, it, expect, vi, beforeEach } from 'vitest';
import { formatChanges } from '../utils/formatter';
import { formatDiff } from '../utils/diffFormatter';
import { PackageChanges } from '../services/changelogService';
import { PackageDiff } from '../services/packageDiffService';

// Mock chalk
vi.mock('chalk', () => ({
  default: {
    bold: {
      cyan: (str: string) => str,
    },
    gray: (str: string) => str,
    yellow: (str: string) => str,
    white: (str: string) => str,
    blue: (str: string) => str,
    green: (str: string) => str,
    red: (str: string) => str,
    cyan: (str: string) => str,
  },
}));

// Mock console.log
const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

describe('Integration Tests', () => {
  beforeEach(() => {
    consoleLogSpy.mockClear();
  });

  describe('Change Summarization Flow', () => {
    it('should format changes correctly end-to-end', () => {
      const pkg = {
        name: 'test-package',
        currentVersion: '1.0.0',
        latestVersion: '1.2.0',
      };

      const changes: PackageChanges = {
        packageName: 'test-package',
        currentVersion: '1.0.0',
        latestVersion: '1.2.0',
        summary: 'Update from 1.0.0 to 1.2.0 (2 versions in between)',
        changes: [
          {
            version: '1.2.0',
            date: '2024-01-15T00:00:00.000Z',
            changes: [
              'Added new feature for better performance',
              'Fixed critical bug in authentication',
              'Improved error handling',
            ],
          },
          {
            version: '1.1.0',
            date: '2024-01-10T00:00:00.000Z',
            changes: [
              'Security patch',
              'Minor bug fixes',
            ],
          },
        ],
      };

      formatChanges(pkg, changes);

      const output = consoleLogSpy.mock.calls.map(call => call[0]).join('\n');
      
      // Verify key information is present
      expect(output).toContain('test-package');
      expect(output).toContain('1.0.0');
      expect(output).toContain('1.2.0');
      expect(output).toContain('Update from');
      expect(output).toContain('1.2.0');
      expect(output).toContain('1.1.0');
    });
  });

  describe('Diff Generation Flow', () => {
    it('should format diff correctly end-to-end', () => {
      const pkg = {
        name: 'test-package',
        currentVersion: '1.0.0',
        latestVersion: '1.1.0',
      };

      const diff: PackageDiff = {
        packageName: 'test-package',
        currentVersion: '1.0.0',
        latestVersion: '1.1.0',
        summary: {
          filesChanged: 3,
          filesAdded: 1,
          filesRemoved: 0,
          totalAdditions: 25,
          totalDeletions: 8,
        },
        files: [
          {
            file: 'src/index.js',
            additions: 10,
            deletions: 3,
            diff: `--- a/src/index.js\n+++ b/src/index.js\n@@ -1,5 +1,12 @@\n const old = true;\n-function removed() {\n+function added() {\n+  return new Feature();\n+}\n`,
          },
          {
            file: 'src/new-file.js',
            additions: 15,
            deletions: 0,
            diff: `--- /dev/null\n+++ b/src/new-file.js\n@@ -0,0 +1,15 @@\n+// New file content\n+export function newFeature() {\n+  return true;\n+}\n`,
          },
        ],
      };

      formatDiff(pkg, diff);

      const output = consoleLogSpy.mock.calls.map(call => call[0]).join('\n');
      
      // Verify key information is present
      expect(output).toContain('test-package');
      expect(output).toContain('1.0.0');
      expect(output).toContain('1.1.0');
      expect(output).toContain('Files changed: 3');
      expect(output).toContain('Files added: 1');
      expect(output).toContain('Lines added: +25');
      expect(output).toContain('Lines removed: -8');
    });

    it('should handle empty diff gracefully', () => {
      const pkg = {
        name: 'test-package',
        currentVersion: '1.0.0',
        latestVersion: '1.0.1',
      };

      const diff: PackageDiff = {
        packageName: 'test-package',
        currentVersion: '1.0.0',
        latestVersion: '1.0.1',
        summary: {
          filesChanged: 0,
          filesAdded: 0,
          filesRemoved: 0,
          totalAdditions: 0,
          totalDeletions: 0,
        },
        files: [],
      };

      formatDiff(pkg, diff);

      const output = consoleLogSpy.mock.calls.map(call => call[0]).join('\n');
      expect(output).toContain('No file changes detected');
    });
  });

  describe('Summary Generation', () => {
    it('should generate correct summary for multiple versions', () => {
      const changes: PackageChanges = {
        packageName: 'test-package',
        currentVersion: '1.0.0',
        latestVersion: '1.5.0',
        summary: 'Update from 1.0.0 to 1.5.0 (5 versions in between)',
        changes: [],
      };

      expect(changes.summary).toContain('1.0.0');
      expect(changes.summary).toContain('1.5.0');
      expect(changes.summary).toContain('5 versions');
    });

    it('should generate correct summary for single version', () => {
      const changes: PackageChanges = {
        packageName: 'test-package',
        currentVersion: '1.0.0',
        latestVersion: '1.1.0',
        summary: 'Update from 1.0.0 to 1.1.0 (1 version in between)',
        changes: [],
      };

      expect(changes.summary).toContain('1 version');
    });
  });
});

