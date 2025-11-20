# Publishing Guide

This guide explains how to publish `xnpm` to GitHub and npm.

## Prerequisites

- GitHub account
- npm account (if publishing to npm)
- Git installed locally
- Node.js 18+ installed

## Step 1: Create GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Name it `xnpm` (or your preferred name)
3. Choose public or private
4. **Don't** initialize with README, .gitignore, or license (we already have these)

## Step 2: Update Repository URLs

Edit `package.json` and replace `YOUR_USERNAME` with your GitHub username:

```json
{
  "repository": {
    "type": "git",
    "url": "https://github.com/YOUR_USERNAME/xnpm.git"
  },
  "bugs": {
    "url": "https://github.com/YOUR_USERNAME/xnpm/issues"
  },
  "homepage": "https://github.com/YOUR_USERNAME/xnpm#readme"
}
```

Also update the README.md badge URLs if you added them.

## Step 3: Initialize Git and Push

```bash
# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: xnpm - npm proxy with change summaries and security analysis"

# Rename branch to main (if needed)
git branch -M main

# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/xnpm.git

# Push to GitHub
git push -u origin main
```

## Step 4: Create GitHub Release

1. Go to your repository on GitHub
2. Click "Releases" → "Create a new release"
3. Choose tag: `v1.0.0` (create new tag)
4. Release title: `v1.0.0 - Initial Release`
5. Description:
   ```
   ## Features
   - Full npm command proxy
   - Change summaries with `--changes` flag
   - Code diffs with `--diff` flag
   - Security analysis for supply chain attacks
   - Beautiful formatted output
   ```
6. Click "Publish release"

## Step 5: (Optional) Publish to npm

### Check Package Name Availability

```bash
npm view xnpm
```

If the package name is taken, you'll need to:
1. Choose a different name (e.g., `@your-username/xnpm`)
2. Update `name` in `package.json`

### Publish to npm

```bash
# Login to npm (if not already logged in)
npm login

# Verify you're logged in
npm whoami

# Build the project
npm run build

# Publish (make sure version in package.json is correct)
npm publish

# Or if using scoped package:
npm publish --access public
```

### Automated Publishing with GitHub Actions

The repository includes a GitHub Actions workflow (`.github/workflows/publish.yml`) that automatically publishes to npm when you create a GitHub release.

To set it up:

1. Go to your npm account settings
2. Create an access token with "Automation" type
3. Go to your GitHub repository → Settings → Secrets and variables → Actions
4. Add a new secret named `NPM_TOKEN` with your npm token
5. Create a new release on GitHub - it will automatically publish to npm

## Step 6: Update Installation Instructions

After publishing, update the README.md installation instructions with the actual repository URL and npm package name (if published).

## Versioning

Follow [Semantic Versioning](https://semver.org/):
- **MAJOR** version for incompatible API changes
- **MINOR** version for new functionality in a backward compatible manner
- **PATCH** version for backward compatible bug fixes

Update version in `package.json` before each release.

## Tagging Releases

```bash
# Create and push a tag
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

Or create tags through GitHub's release interface.

