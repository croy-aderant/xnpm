import chalk from 'chalk';
import { PackageDiff } from '../services/packageDiffService';

export function formatDiff(pkg: { name: string; currentVersion: string; latestVersion: string }, diff: PackageDiff) {
  console.log(chalk.bold.cyan(`\n📦 ${pkg.name}`));
  console.log(chalk.gray(`   ${pkg.currentVersion} → ${chalk.yellow(pkg.latestVersion)}\n`));

  // Summary
  const { summary } = diff;
  console.log(chalk.blue('   Summary:'));
  console.log(chalk.white(`     Files changed: ${chalk.yellow(summary.filesChanged)}`));
  console.log(chalk.white(`     Files added: ${chalk.green(summary.filesAdded)}`));
  console.log(chalk.white(`     Files removed: ${chalk.red(summary.filesRemoved)}`));
  console.log(chalk.white(`     Lines added: ${chalk.green(`+${summary.totalAdditions}`)}`));
  console.log(chalk.white(`     Lines removed: ${chalk.red(`-${summary.totalDeletions}`)}`));
  console.log();

  if (diff.files.length === 0) {
    console.log(chalk.gray('   No file changes detected\n'));
    console.log(chalk.gray('─'.repeat(60)));
    return;
  }

  // Show file diffs (limit to first 10 files to avoid overwhelming output)
  const filesToShow = diff.files.slice(0, 10);
  const remainingFiles = diff.files.length - filesToShow.length;

  for (const fileDiff of filesToShow) {
    console.log(chalk.bold(`\n   📄 ${fileDiff.file}`));
    console.log(chalk.gray(`      +${fileDiff.additions} -${fileDiff.deletions}\n`));

    // Format and display the diff
    const diffLines = fileDiff.diff.split('\n');
    let inHunk = false;
    let hunkHeader = '';

    for (const line of diffLines) {
      if (line.startsWith('@@')) {
        // Hunk header
        hunkHeader = line;
        inHunk = true;
        console.log(chalk.cyan(`      ${line}`));
      } else if (line.startsWith('---') || line.startsWith('+++')) {
        // File headers - skip or show in gray
        console.log(chalk.gray(`      ${line}`));
      } else if (inHunk) {
        // Diff content
        if (line.startsWith('+') && !line.startsWith('+++')) {
          // Added line
          console.log(chalk.green(`      ${line}`));
        } else if (line.startsWith('-') && !line.startsWith('---')) {
          // Removed line
          console.log(chalk.red(`      ${line}`));
        } else if (line.startsWith(' ')) {
          // Context line
          console.log(chalk.gray(`      ${line}`));
        } else {
          console.log(`      ${line}`);
        }
      }
    }
  }

  if (remainingFiles > 0) {
    console.log(chalk.yellow(`\n   ... and ${remainingFiles} more file(s) with changes`));
  }

  console.log(chalk.gray('\n─'.repeat(60)));
}

