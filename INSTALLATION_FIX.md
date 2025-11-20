# Installation Fix

## Problem
When installing from GitHub, the `xnpm` executable wasn't being created in `node_modules/.bin` because:
1. The `dist/` folder wasn't included in the repository
2. The build step wasn't running during installation
3. The executable file wasn't marked as executable

## Solution

### Changes Made

1. **Added `postinstall` script** in `package.json`:
   ```json
   "postinstall": "npm run build && chmod +x dist/index.js || true"
   ```
   This ensures the project is built and the executable is made executable after installation.

2. **Included `dist/` folder in git**:
   - Removed `dist/` from `.gitignore`
   - Committed the built files so they're available when installing from GitHub
   - This provides a fallback if the build fails during installation

3. **Made executable file executable**:
   - The `dist/index.js` file now has execute permissions
   - The shebang `#!/usr/bin/env node` is preserved

## How It Works Now

When someone installs from GitHub:

```bash
npm install -g github:croy-aderant/xnpm
```

npm will:
1. Clone the repository
2. Run `npm install` (installs dependencies)
3. Run `postinstall` script which:
   - Builds the TypeScript code (`npm run build`)
   - Makes `dist/index.js` executable (`chmod +x`)
4. Create symlink in `node_modules/.bin/xnpm` pointing to `dist/index.js`

## Verification

After installation, verify it works:

```bash
# Check if executable exists
ls -la $(npm root -g)/xnpm/node_modules/.bin/xnpm

# Or test the command
xnpm --version
```

## Alternative Installation Methods

If the postinstall script fails, users can still install manually:

```bash
git clone https://github.com/croy-aderant/xnpm.git
cd xnpm
npm install
npm run build
chmod +x dist/index.js
npm link
```

