# Release v1.0.1 - Installation Fix

## 🐛 Bug Fixes

### Installation Issues Fixed
- ✅ Added `postinstall` script to automatically build project after installation
- ✅ Included `dist/` folder in repository for GitHub installations
- ✅ Made executable file executable with proper permissions
- ✅ Fixed issue where `xnpm` command wasn't available after installation

## 🔧 Changes

- Added `postinstall` script in `package.json` that builds the project and sets executable permissions
- Included compiled `dist/` folder in git repository
- Updated `.gitignore` to allow `dist/` folder
- Improved installation documentation

## 📦 Installation

```bash
npm install -g github:croy-aderant/xnpm
```

After installation, `xnpm` should now be available as a command.

## 🔍 What Changed from v1.0.0

- Fixed: Executable not created in `node_modules/.bin` after installation
- Fixed: Build step not running during GitHub installation
- Fixed: Executable file permissions

## 📚 Full Changelog

See: https://github.com/croy-aderant/xnpm/compare/v1.0.0...v1.0.1

