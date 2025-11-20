# Troubleshooting npm publish

## Common Issues and Solutions

### 1. Package Name Already Taken

**Error:** `npm ERR! 403 You cannot publish over the previously published versions`

**Solution:** The package name `xnpm` is already taken on npm. You need to use a scoped package name.

Update `package.json`:
```json
{
  "name": "@your-username/xnpm"
}
```

Then publish with:
```bash
npm publish --access public
```

### 2. Not Logged In to npm

**Error:** `npm error need auth This command requires you to be logged in`

**Solution:**
```bash
npm login
# Enter your npm username, password, and email
# If you don't have an account, create one at https://www.npmjs.com/signup
```

### 3. Dependencies Not Installed

**Error:** `sh: tsc: command not found`

**Solution:**
```bash
npm install
```

This installs all dependencies including TypeScript.

### 4. Build Directory Missing

**Error:** `No bin file found at dist/index.js`

**Solution:**
```bash
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` directory.

### 5. Complete Publishing Steps

```bash
# 1. Install dependencies
npm install

# 2. Build the project
npm run build

# 3. Login to npm (if not already)
npm login

# 4. Check if package name is available
npm view @your-username/xnpm

# 5. Publish (use --access public for scoped packages)
npm publish --access public
```

### 6. Alternative: Use Different Package Name

If you want to use a non-scoped name, try:
- `xnpm-cli`
- `xnpm-tool`
- `xnpm-proxy`
- `xnpm-update`

Check availability:
```bash
npm view <package-name>
```

If it returns 404, the name is available.

### 7. Verify Before Publishing

Run a dry-run to see what would be published:
```bash
npm publish --dry-run
```

This shows what files would be included without actually publishing.

### 8. Check Package Contents

Make sure these files exist:
- `dist/index.js` (compiled output)
- `README.md`
- `LICENSE`
- `package.json`

### 9. Version Already Published

If you get an error about version already existing:
- Update the version in `package.json` (e.g., `1.0.1`)
- Or use `npm version patch` to bump version automatically

### 10. Two-Factor Authentication

If you have 2FA enabled on npm:
- Use an automation token for CI/CD
- Or use `npm login` with your regular credentials for manual publishing

