import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { getPackageChanges } from '../changelogService';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Mock axios
vi.mock('axios');

describe('changelogService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getPackageChanges', () => {
    it('should fetch and parse changelog from GitHub', async () => {
      const mockPackageData = JSON.parse(
        readFileSync(join(__dirname, '../../__fixtures__/mockPackageData.json'), 'utf-8')
      );
      const mockChangelog = readFileSync(
        join(__dirname, '../../__fixtures__/mockChangelog.md'),
        'utf-8'
      );

      // Mock npm registry response
      (axios.get as any).mockImplementation((url: string) => {
        if (url.includes('registry.npmjs.org/test-package')) {
          return Promise.resolve({ data: mockPackageData });
        }
        if (url.includes('raw.githubusercontent.com')) {
          return Promise.resolve({ data: mockChangelog, status: 200 });
        }
        return Promise.reject(new Error('Unexpected URL'));
      });

      const result = await getPackageChanges('test-package', '1.0.0', '1.2.0');

      expect(result.packageName).toBe('test-package');
      expect(result.currentVersion).toBe('1.0.0');
      expect(result.latestVersion).toBe('1.2.0');
      expect(result.changes.length).toBeGreaterThan(0);
      expect(result.summary).toBeDefined();
      
      // Verify changes are parsed correctly
      const version120 = result.changes.find(c => c.version === '1.2.0');
      expect(version120).toBeDefined();
      expect(version120?.changes.length).toBeGreaterThan(0);
    });

    it('should handle packages without GitHub repository', async () => {
      const mockPackageData = {
        name: 'test-package',
        versions: {
          '1.0.0': {
            name: 'test-package',
            version: '1.0.0',
            description: 'Version 1.0.0',
          },
          '1.1.0': {
            name: 'test-package',
            version: '1.1.0',
            description: 'Version 1.1.0',
          },
        },
        time: {
          '1.0.0': '2024-01-01T00:00:00.000Z',
          '1.1.0': '2024-01-05T00:00:00.000Z',
        },
      };

      (axios.get as any).mockResolvedValue({ data: mockPackageData });

      const result = await getPackageChanges('test-package', '1.0.0', '1.1.0');

      expect(result.packageName).toBe('test-package');
      expect(result.changes.length).toBeGreaterThan(0);
      // Should fall back to package descriptions
      expect(result.changes[0].changes[0]).toContain('Version');
    });

    it('should handle invalid versions gracefully', async () => {
      const mockPackageData = {
        name: 'test-package',
        versions: {},
      };

      (axios.get as any).mockResolvedValue({ data: mockPackageData });

      const result = await getPackageChanges('test-package', 'invalid', 'also-invalid');

      expect(result.packageName).toBe('test-package');
      expect(result.changes.length).toBeGreaterThan(0);
      expect(result.changes[0].changes[0]).toContain('Updated from');
    });

    it('should filter versions correctly using semver', async () => {
      const mockPackageData = {
        name: 'test-package',
        versions: {
          '1.0.0': { version: '1.0.0', description: 'v1.0.0' },
          '1.0.1': { version: '1.0.1', description: 'v1.0.1' },
          '1.1.0': { version: '1.1.0', description: 'v1.1.0' },
          '1.2.0': { version: '1.2.0', description: 'v1.2.0' },
          '2.0.0': { version: '2.0.0', description: 'v2.0.0' },
        },
        time: {
          '1.0.0': '2024-01-01T00:00:00.000Z',
          '1.0.1': '2024-01-02T00:00:00.000Z',
          '1.1.0': '2024-01-03T00:00:00.000Z',
          '1.2.0': '2024-01-04T00:00:00.000Z',
          '2.0.0': '2024-01-05T00:00:00.000Z',
        },
      };

      (axios.get as any).mockResolvedValue({ data: mockPackageData });

      const result = await getPackageChanges('test-package', '1.0.0', '1.2.0');

      // Should include versions between 1.0.0 and 1.2.0 (exclusive of 1.0.0, inclusive of 1.2.0)
      expect(result.summary).toContain('version');
    });

    it('should generate appropriate summary', async () => {
      const mockPackageData = {
        name: 'test-package',
        versions: {
          '1.0.0': { version: '1.0.0' },
          '1.1.0': { version: '1.1.0' },
        },
        time: {},
      };

      (axios.get as any).mockResolvedValue({ data: mockPackageData });

      const result = await getPackageChanges('test-package', '1.0.0', '1.1.0');

      expect(result.summary).toBeDefined();
      expect(result.summary).toContain('1.0.0');
      expect(result.summary).toContain('1.1.0');
    });

    it('should handle network errors gracefully', async () => {
      (axios.get as any).mockRejectedValue(new Error('Network error'));

      const result = await getPackageChanges('test-package', '1.0.0', '1.1.0');

      // Should return fallback data
      expect(result.packageName).toBe('test-package');
      expect(result.changes.length).toBeGreaterThan(0);
      expect(result.changes[0].changes[0]).toContain('Version update');
    });
  });
});

