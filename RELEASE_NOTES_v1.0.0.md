# Release v1.0.0 - Initial Release

## 🎉 First Release of xnpm

A powerful npm proxy tool with change summaries, code diffs, and security analysis.

## ✨ Features

### Core Functionality
- 🔄 **Full npm proxy** - All npm commands work exactly as they do with regular npm
- 📋 **Change summaries** - Use `xnpm update --changes` to see what changed between versions
- 🔍 **Code diffs** - Use `xnpm update <package> --diff` to see actual code changes
- 🔒 **Security analysis** - Automatic detection of supply chain attack indicators

### Security Analysis Features
- ✅ Suspicious commit detection (minified code, large diffs, odd timing)
- ✅ Maintainer/collaborator analysis
- ✅ npm release vs GitHub tag comparison
- ✅ Package.json security checks (postinstall scripts, suspicious dependencies)
- ✅ Suspicious file detection
- ✅ GitHub Actions monitoring
- ✅ Repository activity analysis
- ✅ Risk scoring and warnings

### Developer Experience
- 🎨 Beautiful formatted output with syntax highlighting
- 🚀 Smart package detection
- 📊 Comprehensive test coverage (28 tests, all passing)
- 📝 Well-documented codebase

## 📦 Installation

```bash
npm install -g github:croy-aderant/xnpm
```

Or clone and build:
```bash
git clone https://github.com/croy-aderant/xnpm.git
cd xnpm
npm install && npm run build && npm link
```

## 🚀 Quick Start

```bash
# Check for updates with change summaries
xnpm update --changes

# View code diffs for a specific package
xnpm update react --diff

# Combine both
xnpm update react --changes --diff
```

## 📋 What's Included

- Full TypeScript implementation
- Comprehensive test suite
- Security analysis engine
- Changelog parser
- Diff generator
- Beautiful CLI output formatting

## 🔒 Security

This package is configured as **GitHub-only** and cannot be published to npm, ensuring you always get the source code directly from GitHub.

## 📚 Documentation

- Full README with examples
- API documentation
- Test coverage reports
- Contributing guidelines

## 🧪 Testing

All 28 tests passing:
- Change summarization tests
- Diff generation tests
- Formatter tests
- Integration tests
- Parser tests

## 🎯 Use Cases

- Review package updates before installing
- Detect potential supply chain attacks
- Understand what changed between versions
- Make informed decisions about updates

---

**Full Changelog**: https://github.com/croy-aderant/xnpm/compare/v1.0.0...main

