# Release Guide

This guide explains how to release a new version of xnpm.

## Quick Release

Simply run the release script:

```bash
./release.sh
```

The script will:
1. ✅ Check you're on the main branch
2. ✅ Stage and commit changes
3. ✅ Create a git tag with release notes
4. ✅ Push everything to GitHub
5. ✅ Guide you to create the GitHub release

## Manual Release Process

If you prefer to do it manually:

### 1. Update Version

Update the version in `package.json`:

```bash
npm version patch  # for 1.0.0 -> 1.0.1
npm version minor  # for 1.0.0 -> 1.1.0
npm version major  # for 1.0.0 -> 2.0.0
```

Or manually edit `package.json` and set the version.

### 2. Create Release Notes

Create a file `RELEASE_NOTES_v<VERSION>.md` with the release notes.

### 3. Commit Changes

```bash
git add package.json RELEASE_NOTES_v*.md
git commit -m "Release v<VERSION>"
```

### 4. Create Tag

```bash
git tag -a v<VERSION> -m "Release v<VERSION>"
```

Or with release notes:

```bash
git tag -a v<VERSION} -F RELEASE_NOTES_v${VERSION}.md
```

### 5. Push to GitHub

```bash
git push origin main
git push origin v<VERSION>
```

### 6. Create GitHub Release

1. Go to https://github.com/croy-aderant/xnpm/releases/new
2. Select the tag you just pushed
3. Use the title: `v<VERSION> - <Description>`
4. Copy the content from `RELEASE_NOTES_v<VERSION>.md`
5. Click "Publish release"

## Version Numbering

Follow [Semantic Versioning](https://semver.org/):

- **MAJOR** (1.0.0 -> 2.0.0): Breaking changes
- **MINOR** (1.0.0 -> 1.1.0): New features, backwards compatible
- **PATCH** (1.0.0 -> 1.0.1): Bug fixes, backwards compatible

## Release Checklist

Before releasing:

- [ ] All tests pass: `npm test`
- [ ] Code is built: `npm run build`
- [ ] Version updated in `package.json`
- [ ] Release notes created
- [ ] Changes committed
- [ ] Tag created and pushed
- [ ] GitHub release created

## Troubleshooting

### Tag Already Exists

If the tag already exists, the script will ask if you want to delete and recreate it. Or manually:

```bash
git tag -d v<VERSION>
git push origin :refs/tags/v<VERSION>
```

### Push Fails

Make sure you have:
- Git credentials configured
- Push access to the repository
- Internet connection

### Script Permission Denied

Make the script executable:

```bash
chmod +x release.sh
```

