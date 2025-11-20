import { describe, it, expect, vi, beforeEach } from 'vitest';
import { formatChanges } from '../formatter';
import { formatDiff } from '../diffFormatter';
// Mock chalk to avoid color codes in test output
vi.mock('chalk', () => ({
    default: {
        bold: {
            cyan: (str) => str,
        },
        gray: (str) => str,
        yellow: (str) => str,
        white: (str) => str,
        blue: (str) => str,
        green: (str) => str,
        red: (str) => str,
        cyan: (str) => str,
    },
}));
// Mock console.log to capture output
const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => { });
describe('formatter', () => {
    beforeEach(() => {
        consoleLogSpy.mockClear();
    });
    describe('formatChanges', () => {
        it('should format package changes correctly', () => {
            const pkg = {
                name: 'test-package',
                currentVersion: '1.0.0',
                latestVersion: '1.2.0',
            };
            const changes = {
                packageName: 'test-package',
                currentVersion: '1.0.0',
                latestVersion: '1.2.0',
                summary: 'Update from 1.0.0 to 1.2.0 (2 versions in between)',
                changes: [
                    {
                        version: '1.2.0',
                        date: '2024-01-15T00:00:00.000Z',
                        changes: [
                            'Added new feature',
                            'Fixed bug',
                            'Improved performance',
                        ],
                    },
                    {
                        version: '1.1.0',
                        date: '2024-01-10T00:00:00.000Z',
                        changes: [
                            'Security patch',
                            'Minor updates',
                        ],
                    },
                ],
            };
            formatChanges(pkg, changes);
            // Verify output was called
            expect(consoleLogSpy).toHaveBeenCalled();
            // Check that package name appears in output
            const output = consoleLogSpy.mock.calls.map(call => call[0]).join('\n');
            expect(output).toContain('test-package');
            expect(output).toContain('1.0.0');
            expect(output).toContain('1.2.0');
        });
        it('should handle packages without changes', () => {
            const pkg = {
                name: 'test-package',
                currentVersion: '1.0.0',
                latestVersion: '1.0.0',
            };
            const changes = {
                packageName: 'test-package',
                currentVersion: '1.0.0',
                latestVersion: '1.0.0',
                summary: 'No changes',
                changes: [],
            };
            formatChanges(pkg, changes);
            expect(consoleLogSpy).toHaveBeenCalled();
            const output = consoleLogSpy.mock.calls.map(call => call[0]).join('\n');
            expect(output).toContain('No detailed changelog available');
        });
        it('should limit displayed changes to 5 versions', () => {
            const pkg = {
                name: 'test-package',
                currentVersion: '1.0.0',
                latestVersion: '1.6.0',
            };
            const changes = {
                packageName: 'test-package',
                currentVersion: '1.0.0',
                latestVersion: '1.6.0',
                summary: 'Multiple versions',
                changes: Array.from({ length: 10 }, (_, i) => ({
                    version: `1.${i + 1}.0`,
                    changes: [`Change ${i + 1}`],
                })),
            };
            formatChanges(pkg, changes);
            expect(consoleLogSpy).toHaveBeenCalled();
            const output = consoleLogSpy.mock.calls.map(call => call[0]).join('\n');
            expect(output).toContain('more version(s)');
        });
    });
    describe('formatDiff', () => {
        it('should format package diff correctly', () => {
            const pkg = {
                name: 'test-package',
                currentVersion: '1.0.0',
                latestVersion: '1.1.0',
            };
            const diff = {
                packageName: 'test-package',
                currentVersion: '1.0.0',
                latestVersion: '1.1.0',
                summary: {
                    filesChanged: 2,
                    filesAdded: 1,
                    filesRemoved: 0,
                    totalAdditions: 15,
                    totalDeletions: 5,
                },
                files: [
                    {
                        file: 'src/index.js',
                        additions: 10,
                        deletions: 3,
                        diff: '@@ -1,3 +1,10 @@\n+new line\n old line\n-another old line\n+new line 2\n',
                    },
                ],
            };
            formatDiff(pkg, diff);
            expect(consoleLogSpy).toHaveBeenCalled();
            const output = consoleLogSpy.mock.calls.map(call => call[0]).join('\n');
            expect(output).toContain('test-package');
            expect(output).toContain('Files changed: 2');
            expect(output).toContain('Files added: 1');
            expect(output).toContain('Lines added: +15');
            expect(output).toContain('Lines removed: -5');
        });
        it('should handle packages with no file changes', () => {
            const pkg = {
                name: 'test-package',
                currentVersion: '1.0.0',
                latestVersion: '1.0.1',
            };
            const diff = {
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
            expect(consoleLogSpy).toHaveBeenCalled();
            const output = consoleLogSpy.mock.calls.map(call => call[0]).join('\n');
            expect(output).toContain('No file changes detected');
        });
        it('should limit displayed files to 10', () => {
            const pkg = {
                name: 'test-package',
                currentVersion: '1.0.0',
                latestVersion: '1.1.0',
            };
            const diff = {
                packageName: 'test-package',
                currentVersion: '1.0.0',
                latestVersion: '1.1.0',
                summary: {
                    filesChanged: 15,
                    filesAdded: 0,
                    filesRemoved: 0,
                    totalAdditions: 100,
                    totalDeletions: 50,
                },
                files: Array.from({ length: 15 }, (_, i) => ({
                    file: `file${i}.js`,
                    additions: 5,
                    deletions: 2,
                    diff: `@@ -1,2 +1,5 @@\n+line\n`,
                })),
            };
            formatDiff(pkg, diff);
            expect(consoleLogSpy).toHaveBeenCalled();
            const output = consoleLogSpy.mock.calls.map(call => call[0]).join('\n');
            expect(output).toContain('more file(s) with changes');
        });
        it('should format diff lines with proper syntax highlighting indicators', () => {
            const pkg = {
                name: 'test-package',
                currentVersion: '1.0.0',
                latestVersion: '1.1.0',
            };
            const diff = {
                packageName: 'test-package',
                currentVersion: '1.0.0',
                latestVersion: '1.1.0',
                summary: {
                    filesChanged: 1,
                    filesAdded: 0,
                    filesRemoved: 0,
                    totalAdditions: 2,
                    totalDeletions: 1,
                },
                files: [
                    {
                        file: 'test.js',
                        additions: 2,
                        deletions: 1,
                        diff: `--- a/test.js\n+++ b/test.js\n@@ -1,2 +1,3 @@\n old line\n-removed line\n+new line 1\n+new line 2\n`,
                    },
                ],
            };
            formatDiff(pkg, diff);
            expect(consoleLogSpy).toHaveBeenCalled();
            // Verify that diff formatting was attempted
            const calls = consoleLogSpy.mock.calls.length;
            expect(calls).toBeGreaterThan(5); // Should have multiple output calls
        });
    });
});
//# sourceMappingURL=formatter.test.js.map