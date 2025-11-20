# GitHub Repository Setup Guide

## Step 1: Create GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the "+" icon in the top right → "New repository"
3. Repository name: `xnpm` (or your preferred name)
4. Description: "npm proxy with change summaries and security analysis"
5. Choose **Public** or **Private**
6. **DO NOT** initialize with README, .gitignore, or license (we already have these)
7. Click "Create repository"

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

## Step 3: Add Remote and Push

After creating the repository on GitHub, run these commands:

```bash
# Add the remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/xnpm.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

## Step 4: Verify

1. Go to your repository on GitHub
2. Verify all files are present
3. Check that README.md displays correctly

## Step 5: Create a Release (Optional)

1. Go to your repository → "Releases" → "Create a new release"
2. Tag version: `v1.0.0` (create new tag)
3. Release title: `v1.0.0 - Initial Release`
4. Description:
   ```
   ## Features
   - Full npm command proxy
   - Change summaries with `--changes` flag
   - Code diffs with `--diff` flag
   - Security analysis for supply chain attacks
   - Beautiful formatted output
   ```
5. Click "Publish release"

## Using SSH Instead of HTTPS

If you prefer SSH:

```bash
git remote add origin git@github.com:YOUR_USERNAME/xnpm.git
git push -u origin main
```

## Troubleshooting

### Authentication Issues

If you get authentication errors:

1. **For HTTPS:** Use a Personal Access Token
   - Go to GitHub Settings → Developer settings → Personal access tokens
   - Generate a token with `repo` permissions
   - Use the token as your password when pushing

2. **For SSH:** Set up SSH keys
   - Follow GitHub's guide: https://docs.github.com/en/authentication/connecting-to-github-with-ssh

### Branch Name Issues

If your default branch is `master` instead of `main`:

```bash
git branch -M main
```

Or use `master` if that's what your GitHub repo uses:

```bash
git push -u origin master
```

