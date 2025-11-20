# Release v1.0.4 - ES Module Import Fix

## 🐛 Bug Fixes

### ES Module Import Fix
- ✅ Fixed `ERR_MODULE_NOT_FOUND` error when installing from GitHub
- ✅ Added `.js` extensions to all relative imports for ES module compatibility
- ✅ Fixed issue where package couldn't be used in other projects

## 🔧 Technical Changes

When using ES modules (`"type": "module"`), Node.js requires explicit file extensions in import statements. All relative imports have been updated to include `.js` extensions:

- `./commands/update` → `./commands/update.js`
- `./utils/proxy` → `./utils/proxy.js`
- `../services/packageChecker` → `../services/packageChecker.js`
- And all other relative imports

## 📦 Installation

```bash
npm install -g github:croy-aderant/xnpm
```

After installation, the package should now work correctly in other projects.

## 🔍 What Changed from v1.0.3

- Fixed: `ERR_MODULE_NOT_FOUND` error when importing the package
- Fixed: ES module compatibility issues
- Improved: All imports now use explicit file extensions

## 📚 Full Changelog

See: https://github.com/croy-aderant/xnpm/compare/v1.0.3...v1.0.4

