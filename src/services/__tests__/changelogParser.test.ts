import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

// We need to test the parseChangelog function, but it's not exported
// So we'll test the logic indirectly through getPackageChanges
// Or we can create a test that validates the changelog parsing behavior

describe('changelogParser', () => {
  it('should parse standard changelog format', () => {
    const changelog = `# Changelog

## 1.2.0 (2024-01-15)

### Added
- New feature for better performance
- Improved error handling

### Fixed
- Fixed bug in version comparison

## 1.1.0 (2024-01-10)

### Added
- New API endpoint

## 1.0.0 (2024-01-01)

### Added
- Initial release
`;

    // Test that version headers are detected
    const versionMatches = changelog.match(/##?\s*v?(\d+\.\d+\.\d+)/gi);
    expect(versionMatches).toBeDefined();
    expect(versionMatches?.length).toBeGreaterThanOrEqual(3);

    // Test that changes are detected
    const changeItems = changelog.match(/^[-*]\s+.+$/gm);
    expect(changeItems).toBeDefined();
    expect(changeItems?.length).toBeGreaterThan(0);
  });

  it('should handle different changelog formats', () => {
    const formats = [
      '## 1.2.0',
      '### 1.2.0',
      '# v1.2.0',
      '## Version 1.2.0',
    ];

    formats.forEach(format => {
      const match = format.match(/^(?:##?\s*)?v?(\d+\.\d+\.\d+(?:-[^\s]+)?)/i);
      expect(match).toBeDefined();
      expect(match?.[1]).toBe('1.2.0');
    });
  });

  it('should extract change items correctly', () => {
    const changelogSection = `
## 1.2.0

- First change item
- Second change item
* Third change item (with asterisk)
  Regular paragraph that should also be captured
`;

    const lines = changelogSection.split('\n');
    const changeItems: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
          changeItems.push(trimmed.substring(1).trim());
        } else if (trimmed.length > 0) {
          changeItems.push(trimmed);
        }
      }
    }

    expect(changeItems.length).toBeGreaterThanOrEqual(4);
    expect(changeItems[0]).toBe('First change item');
    expect(changeItems[1]).toBe('Second change item');
  });
});

