# Release v1.0.5 - npm Path Resolution Fix

## 🐛 Bug Fixes

### npm Path Resolution
- ✅ Fixed `ERR_MODULE_NOT_FOUND` error when npm couldn't be found
- ✅ Improved npm executable path resolution
- ✅ Fixed issue where xnpm couldn't find npm in installed projects
- ✅ Added fallback mechanisms to locate npm executable

## 🔧 Technical Changes

The issue was that when `xnpm` tried to execute `npm` commands, it couldn't reliably find the npm executable. The fix includes:

1. **npm_execpath Support**: Uses `process.env.npm_execpath` if available (when called from npm scripts)
2. **Node Path Resolution**: Finds npm relative to node's executable location
3. **File Existence Check**: Verifies npm exists before using it
4. **Proper Execution**: Uses `execFileSync` for full paths and `execSync` for shell commands
5. **Fallback**: Falls back to 'npm' and lets the shell resolve it

### Files Updated

- `src/utils/proxy.ts` - Improved npm path resolution
- `src/index.ts` - Updated to use proxy command for all npm calls
- `src/commands/update.ts` - Updated to use proxy command instead of direct execSync

## 📦 Installation

```bash
npm install -g github:croy-aderant/xnpm
```

After installation, `xnpm` should now correctly find and execute npm commands.

## 🔍 What Changed from v1.0.4

- Fixed: npm executable not found when running xnpm in projects
- Fixed: `/bin/sh: .../node_modules/.bin/npm: No such file or directory` error
- Improved: npm path resolution with multiple fallback mechanisms
- Improved: Better error handling for npm command execution

## 📚 Full Changelog

See: https://github.com/croy-aderant/xnpm/compare/v1.0.4...v1.0.5

