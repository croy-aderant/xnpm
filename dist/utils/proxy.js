import { execSync, execFileSync } from 'child_process';
import { existsSync } from 'fs';
function getNpmPath() {
    // Try to use npm_execpath if available (when called from npm scripts)
    if (process.env.npm_execpath) {
        return process.env.npm_execpath;
    }
    // Fallback: use node's location to find npm
    // npm is typically in the same directory as node
    const nodePath = process.execPath;
    const npmPath = nodePath.replace(/node$/, 'npm');
    // Check if npm exists at that path
    if (existsSync(npmPath)) {
        return npmPath;
    }
    // Last resort: just use 'npm' and let the shell find it
    return 'npm';
}
export function handleProxyCommand(command, args, options) {
    const npmArgs = [command, ...args];
    // Pass through all options
    Object.entries(options).forEach(([key, value]) => {
        if (value === true) {
            npmArgs.push(`--${key}`);
        }
        else if (value !== false && value !== undefined) {
            npmArgs.push(`--${key}`, String(value));
        }
    });
    const npmPath = getNpmPath();
    try {
        // If we have a full path, use execFileSync, otherwise use execSync with shell
        if (npmPath.includes('/') || npmPath.includes('\\')) {
            // Full path - use execFileSync
            execFileSync(npmPath, npmArgs.filter(arg => arg.length > 0), {
                stdio: 'inherit',
                env: { ...process.env }
            });
        }
        else {
            // Just 'npm' - use execSync with shell
            const commandStr = npmArgs.length > 0
                ? `${npmPath} ${npmArgs.join(' ')}`
                : npmPath;
            execSync(commandStr, {
                stdio: 'inherit',
                env: { ...process.env }
            });
        }
    }
    catch (error) {
        process.exit(1);
    }
}
//# sourceMappingURL=proxy.js.map