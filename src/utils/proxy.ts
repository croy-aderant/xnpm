import { execSync } from 'child_process';

export function handleProxyCommand(command: string, args: string[], options: Record<string, any>) {
  const npmArgs = [command, ...args];
  
  // Pass through all options
  Object.entries(options).forEach(([key, value]) => {
    if (value === true) {
      npmArgs.push(`--${key}`);
    } else if (value !== false && value !== undefined) {
      npmArgs.push(`--${key}`, String(value));
    }
  });

  try {
    execSync(`npm ${npmArgs.join(' ')}`, { stdio: 'inherit' });
  } catch (error) {
    process.exit(1);
  }
}

