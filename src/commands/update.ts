import { execSync } from 'child_process';
import { getOutdatedPackages } from '../services/packageChecker.js';
import { getPackageChanges } from '../services/changelogService.js';
import { getPackageDiff } from '../services/packageDiffService.js';
import { formatChanges } from '../utils/formatter.js';
import { formatDiff } from '../utils/diffFormatter.js';
import chalk from 'chalk';

export async function updateCommand(packages: string[], showChanges: boolean, showDiff: boolean) {
  console.log(chalk.blue('🔍 Checking for package updates...\n'));

  try {
    // Get outdated packages
    const outdatedPackages = await getOutdatedPackages(packages);

    if (outdatedPackages.length === 0) {
      console.log(chalk.green('✅ All packages are up to date!\n'));
      return;
    }

    console.log(chalk.yellow(`Found ${outdatedPackages.length} package(s) with available updates:\n`));

    // Show diffs for each package (only if specific packages are requested)
    if (showDiff) {
      if (packages.length === 0) {
        console.log(chalk.red('❌ Error: --diff flag requires specifying package name(s)'));
        console.log(chalk.gray('   Usage: xnpm update <package-name> --diff\n'));
        process.exit(1);
      }

      console.log(chalk.blue('📊 Fetching package source code and generating diffs...\n'));
      
      for (const pkg of outdatedPackages) {
        try {
          console.log(chalk.blue(`   Analyzing ${pkg.name}...`));
          const diff = await getPackageDiff(pkg.name, pkg.currentVersion, pkg.latestVersion);
          formatDiff(pkg, diff);
        } catch (error: any) {
          console.log(chalk.red(`❌ Failed to generate diff for ${pkg.name}`));
          console.log(chalk.gray(`   Error: ${error.message}\n`));
        }
      }
    }

    // Show changes for each package
    if (showChanges) {
      console.log(chalk.blue('📋 Fetching changelogs and analyzing security...\n'));
      
      for (const pkg of outdatedPackages) {
        try {
          const changes = await getPackageChanges(pkg.name, pkg.currentVersion, pkg.latestVersion);
          formatChanges(pkg, changes);
        } catch (error) {
          console.log(chalk.red(`❌ Failed to fetch changes for ${pkg.name}`));
          console.log(chalk.gray(`   Current: ${pkg.currentVersion} → Latest: ${pkg.latestVersion}\n`));
        }
      }
    }

    // If neither flag is set, just list the packages
    if (!showChanges && !showDiff) {
      outdatedPackages.forEach(pkg => {
        console.log(chalk.yellow(`  ${pkg.name}: ${pkg.currentVersion} → ${pkg.latestVersion}`));
      });
      console.log();
    }

    // Ask if user wants to proceed with update
    console.log(chalk.blue('🚀 Proceeding with npm update...\n'));
    
    // Build npm update command
    const updateArgs = packages.length > 0 ? packages : [];
    const npmCommand = `npm update ${updateArgs.join(' ')}`;
    
    execSync(npmCommand, { stdio: 'inherit' });

  } catch (error: any) {
    console.error(chalk.red('Error:'), error.message);
    process.exit(1);
  }
}

