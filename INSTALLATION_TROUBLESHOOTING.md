# Installation Troubleshooting

## Issue: Executable Not Created in `node_modules/.bin`

If `xnpm` is not available after installation, try the following:

### Solution 1: Use `prepare` Script (Current Fix)

The package now uses a `prepare` script that runs before npm creates bin symlinks:

```json
"scripts": {
  "prepare": "npm run build && chmod +x dist/index.js || true"
}
```

This ensures the build completes before npm tries to create the executable symlink.

### Solution 2: Manual Installation

If automatic installation fails, install manually:

```bash
# Clone the repository
git clone https://github.com/croy-aderant/xnpm.git
cd xnpm

# Install dependencies
npm install

# Build the project
npm run build

# Make executable
chmod +x dist/index.js

# Link globally
npm link
```

### Solution 3: Verify Installation

After installation, verify the executable exists:

```bash
# Check if symlink exists
ls -la $(npm root -g)/@croy-aderant/xnpm/node_modules/.bin/xnpm

# Or check global bin
ls -la $(npm config get prefix)/bin/xnpm

# Test the command
xnpm --help
```

### Solution 4: Check npm Configuration

Ensure your npm global bin directory is in PATH:

```bash
# Check npm prefix
npm config get prefix

# Add to PATH (add to ~/.zshrc or ~/.bashrc)
export PATH=$PATH:$(npm config get prefix)/bin
```

### Solution 5: Reinstall

If the executable still doesn't work, try a clean reinstall:

```bash
# Uninstall
npm uninstall -g @croy-aderant/xnpm

# Clear npm cache
npm cache clean --force

# Reinstall
npm install -g github:croy-aderant/xnpm
```

### Common Issues

1. **File doesn't exist**: Ensure `dist/index.js` exists in the repository
2. **Not executable**: The `prepare` script should set executable permissions
3. **Wrong bin path**: The bin field should be `"./dist/index.js"`
4. **npm version**: Ensure you're using npm 7+ for proper GitHub install support

### Debug Steps

1. Check if the file exists:
   ```bash
   ls -la node_modules/@croy-aderant/xnpm/dist/index.js
   ```

2. Check if symlink exists:
   ```bash
   ls -la node_modules/.bin/xnpm
   ```

3. Check file permissions:
   ```bash
   ls -la node_modules/@croy-aderant/xnpm/dist/index.js
   ```

4. Check npm logs:
   ```bash
   npm install -g github:croy-aderant/xnpm --verbose
   ```

