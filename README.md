# xnpm

A command-line tool that proxies npm commands and provides detailed change summaries when updating packages.

[![CI](https://github.com/croy-aderant/xnpm/workflows/CI/badge.svg)](https://github.com/croy-aderant/xnpm/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)

## Features

- 🔄 **Full npm proxy**: All npm commands work exactly as they do with regular npm
- 📋 **Change summaries**: Use `xnpm update --changes` to see what changed between versions
- 🔍 **Code diffs**: Use `xnpm update <package> --diff` to see actual code changes
- 🔒 **Security analysis**: Automatic detection of supply chain attack indicators when using `--changes`
- 🎨 **Beautiful output**: Neatly formatted changelog summaries and code diffs with syntax highlighting
- 🚀 **Smart detection**: Automatically finds packages that need updates

## Installation

**Note:** This package is only available via GitHub, not on the npm registry.

### Install from GitHub

You can install `xnpm` directly from the GitHub repository:

```bash
# Using npm
npm install -g github:croy-aderant/xnpm

# Or clone and install locally
git clone https://github.com/croy-aderant/xnpm.git
cd xnpm
npm install
npm run build
npm link  # Makes xnpm available globally
```

### Install as a project dependency

Add `xnpm` to your project:

```bash
# From GitHub
npm install --save-dev github:YOUR_USERNAME/xnpm

# Or add to package.json
{
  "devDependencies": {
    "xnpm": "github:croy-aderant/xnpm"
  }
}
```

Then use it with `npx`:

```bash
npx xnpm update --changes
```

### Development Installation

For development or to use the latest version:

```bash
git clone https://github.com/croy-aderant/xnpm.git
cd xnpm
npm install
npm run build
npm link
```

After linking, `xnpm` will be available globally on your system.

### Verify Installation

After installation, verify it works:

```bash
xnpm --version
# or
xnpm update --help
```

## Usage

### Regular npm commands

All npm commands work exactly as before:

```bash
xnpm install
xnpm install react
xnpm run build
xnpm publish
# ... etc
```

### Update with change summaries

To see what changed before updating:

```bash
xnpm update --changes
```

To update specific packages with change summaries:

```bash
xnpm update --changes react react-dom
```

### Update with code diffs

To see the actual code differences between versions (requires package name):

```bash
xnpm update react --diff
```

This will:
1. Download both the current and latest versions of the package
2. Extract and compare the source code
3. Display a formatted diff showing what changed
4. Proceed with the update

You can combine both flags:

```bash
xnpm update react --changes --diff
```

This will:
1. Check which packages have updates available
2. Fetch changelogs from GitHub or npm registry
3. **Perform comprehensive security analysis** to detect potential supply chain attacks
4. Display a formatted summary of changes between your current version and the latest
5. Show security warnings if any issues are detected
6. Proceed with the update

## Example Output

```
🔍 Checking for package updates...

Found 3 package(s) with available updates:

📋 Fetching changelogs...

📦 react
   18.2.0 → 18.3.1

   Update from 18.2.0 to 18.3.1 (2 versions in between)

   Version 18.3.1 (Dec 15, 2024):
     • Fixed issue with concurrent rendering
     • Improved performance for large component trees
     • Updated TypeScript definitions

   Version 18.3.0 (Dec 1, 2024):
     • Added new concurrent features
     • Bug fixes and performance improvements

────────────────────────────────────────────────────────────

📦 axios
   1.6.0 → 1.7.0

   Update from 1.6.0 to 1.7.0 (1 version in between)

   Version 1.7.0 (Nov 20, 2024):
     • Security patch for request handling
     • Improved error messages
     • Updated dependencies

────────────────────────────────────────────────────────────

🚀 Proceeding with npm update...
```

### Example Security Analysis Output

```
📦 suspicious-package
   1.0.0 → 1.1.0

   🔒 Security Analysis:
   🔴 High risk: Multiple serious security issues

   🚨 Critical Issues (1):
      • New postinstall script detected
        scripts: { "postinstall": "node ./install.js" }

   ⚠️  High Priority (2):
      • Version 1.1.0 exists on npm but not in GitHub tags
        This could indicate a compromised package was published
      • Suspicious file detected: install.js
        File matches known attack patterns

   🔶 Medium Priority (1):
      • Large version jump: 1.0.0 → 1.1.0
        Major version jump without clear justification

   Risk Score: 70/100

────────────────────────────────────────────────────────────
```

### Example Diff Output

```
🔍 Checking for package updates...

Found 1 package(s) with available updates:

📊 Fetching package source code and generating diffs...

   Analyzing react...

📦 react
   18.2.0 → 18.3.1

   Summary:
     Files changed: 5
     Files added: 2
     Files removed: 0
     Lines added: +150
     Lines removed: -45

   📄 src/index.js
      +30 -10

      @@ -1,5 +1,6 @@
      -import { createElement } from './createElement';
      +import { createElement } from './createElement';
      +import { useConcurrent } from './concurrent';
        ...
      +export function useConcurrent() {
      +  // New concurrent features
      +}

────────────────────────────────────────────────────────────

🚀 Proceeding with npm update...
```

## How It Works

1. **Package Detection**: Uses `npm outdated` to find packages that need updates
2. **Changelog Fetching** (--changes flag): 
   - Tries to fetch CHANGELOG.md from GitHub repositories
   - Falls back to npm registry metadata
   - Parses version-specific changes
3. **Security Analysis** (--changes flag):
   - Analyzes commits for suspicious patterns (minified code, large diffs, odd timing)
   - Checks for new maintainers/collaborators
   - Compares npm releases with GitHub tags
   - Scans package.json for malicious scripts and suspicious dependencies
   - Detects suspicious files (install.js, .exe, .dll, etc.)
   - Monitors GitHub Actions for suspicious changes
   - Identifies abandoned repos with sudden activity
   - Calculates risk score and displays warnings
4. **Code Diff** (--diff flag):
   - Downloads package tarballs for both current and latest versions
   - Extracts and compares source code files
   - Generates unified diff format showing additions and deletions
   - Skips binary files and node_modules
5. **Formatting**: Displays changes in a clean, readable format with syntax highlighting

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run in development mode
npm run dev update --changes

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Link globally for testing
npm link
```

## Testing

The project includes comprehensive tests for:
- **Change Summarization**: Tests for fetching and parsing changelogs from GitHub and npm registry
- **Diff Generation**: Tests for comparing package versions and generating code diffs
- **Formatting**: Tests for formatting change summaries and diffs
- **Integration**: End-to-end tests for the complete flow

Test files are located in:
- `src/services/__tests__/` - Service layer tests
- `src/utils/__tests__/` - Utility function tests
- `src/__tests__/` - Integration tests

## Requirements

- Node.js 18+
- npm (for proxying commands)
- Internet connection (for fetching changelogs and security analysis)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Publishing to GitHub

To publish this package to GitHub:

1. Create a new repository on GitHub (e.g., `xnpm`)

2. Update the repository URLs in `package.json`:
   ```json
   "repository": {
     "type": "git",
     "url": "https://github.com/croy-aderant/xnpm.git"
   }
   ```

3. Initialize git and push:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/croy-aderant/xnpm.git
   git push -u origin main
   ```

4. Create a GitHub release:
   - Go to your repository on GitHub
   - Click "Releases" → "Create a new release"
   - Tag version (e.g., `v1.0.0`)
   - Add release notes
   - Publish release

5. (Optional) Publish to npm:
   - Create an npm account if you don't have one
   - Run `npm login`
   - Update the package name in `package.json` if needed (check for name availability)
   - Run `npm publish`

## License

MIT License - see [LICENSE](LICENSE) file for details.

