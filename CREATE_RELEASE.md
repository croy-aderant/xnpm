# Create GitHub Release

## ✅ What's Done

- ✅ All code committed
- ✅ Tag `v1.0.0` created and pushed to GitHub
- ✅ All commits pushed to `main` branch

## 🚀 Create Release on GitHub

### Option 1: Via GitHub Website (Recommended)

1. Go to: **https://github.com/croy-aderant/xnpm/releases/new**
2. **Choose a tag:** Select `v1.0.0` (or type it)
3. **Release title:** `v1.0.0 - Initial Release`
4. **Description:** Copy from `RELEASE_NOTES_v1.0.0.md` or use:

```markdown
## 🎉 First Release of xnpm

A powerful npm proxy tool with change summaries, code diffs, and security analysis.

### ✨ Features

- 🔄 Full npm proxy
- 📋 Change summaries with `--changes` flag
- 🔍 Code diffs with `--diff` flag
- 🔒 Security analysis for supply chain attacks
- 🎨 Beautiful formatted output

### 📦 Installation

```bash
npm install -g github:croy-aderant/xnpm
```

### 🚀 Quick Start

```bash
xnpm update --changes
xnpm update react --diff
```

**Full Changelog**: https://github.com/croy-aderant/xnpm/commits/v1.0.0
```

5. Click **"Publish release"**

### Option 2: Via GitHub CLI

If you have GitHub CLI installed and authenticated:

```bash
gh release create v1.0.0 \
  --title "v1.0.0 - Initial Release" \
  --notes-file RELEASE_NOTES_v1.0.0.md
```

### Option 3: Via API (requires token)

```bash
# Set your GitHub token
export GITHUB_TOKEN=your_personal_access_token

# Create release
curl -X POST \
  -H "Accept: application/vnd.github.v3+json" \
  -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/croy-aderant/xnpm/releases \
  -d @- << EOF
{
  "tag_name": "v1.0.0",
  "name": "v1.0.0 - Initial Release",
  "body": "$(cat RELEASE_NOTES_v1.0.0.md | sed 's/"/\\"/g' | tr '\n' '\\n')"
}
EOF
```

## 📊 Current Status

- **Repository:** https://github.com/croy-aderant/xnpm
- **Tag:** v1.0.0 (pushed)
- **Branch:** main (up to date)
- **Tests:** 28/28 passing ✅

## 🎯 After Release

Once the release is created, users can:

1. **Install from GitHub:**
   ```bash
   npm install -g github:croy-aderant/xnpm
   ```

2. **View release:**
   https://github.com/croy-aderant/xnpm/releases/tag/v1.0.0

3. **Clone specific version:**
   ```bash
   git clone --branch v1.0.0 https://github.com/croy-aderant/xnpm.git
   ```

