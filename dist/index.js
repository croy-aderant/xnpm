#!/usr/bin/env node
import { updateCommand } from './commands/update.js';
import { handleProxyCommand } from './utils/proxy.js';
const args = process.argv.slice(2);
// Handle update command with --changes or --diff flags
if (args[0] === 'update') {
    const hasChanges = args.includes('--changes');
    const hasDiff = args.includes('--diff');
    if (hasChanges || hasDiff) {
        // Extract packages (everything that's not a flag)
        const packages = args.filter((arg, index) => index > 0 && !arg.startsWith('--'));
        updateCommand(packages, hasChanges, hasDiff).catch((error) => {
            console.error('Error:', error.message);
            process.exit(1);
        });
    }
    else {
        // Regular npm update - proxy it
        const commandArgs = args.slice(1);
        handleProxyCommand('update', commandArgs, {});
    }
}
else {
    // Proxy all other commands to npm
    if (args.length === 0) {
        // No arguments, just run npm
        handleProxyCommand('', [], {});
    }
    else {
        const command = args[0];
        const commandArgs = args.slice(1);
        handleProxyCommand(command, commandArgs, {});
    }
}
//# sourceMappingURL=index.js.map