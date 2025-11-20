# Release v1.0.3 - Executable Fix

## 🐛 Bug Fixes

### Executable Creation Fix
- ✅ Fixed bin path configuration (changed from `"dist/index.js"` to `"./dist/index.js"`)
- ✅ Added `prepare` script that runs before npm creates bin symlinks
- ✅ Ensured executable file has proper permissions in git
- ✅ Fixed issue where `xnpm` executable wasn't created in `node_modules/.bin`

## 🔧 Technical Changes

1. **Bin Path**: Changed from `"dist/index.js"` to `"./dist/index.js"` for proper resolution
2. **Prepare Script**: Added `prepare` script that runs before npm creates bin symlinks
   - This ensures the build completes before npm tries to create the executable symlink
3. **File Permissions**: Set executable permissions on `dist/index.js` in git

## 📦 Installation

```bash
npm install -g github:croy-aderant/xnpm
```

After installation, verify the executable exists:

```bash
which xnpm
# or
xnpm --help
```

## 🔍 What Changed from v1.0.2

- Fixed: Bin executable not being created in `node_modules/.bin`
- Fixed: Timing issue where build ran after npm tried to create symlink
- Improved: Added `prepare` script for better installation flow

## 📚 Full Changelog

See: https://github.com/croy-aderant/xnpm/compare/v1.0.2...v1.0.3

