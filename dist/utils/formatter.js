import chalk from 'chalk';
export function formatChanges(pkg, changes) {
    console.log(chalk.bold.cyan(`\n📦 ${pkg.name}`));
    console.log(chalk.gray(`   ${pkg.currentVersion} → ${chalk.yellow(pkg.latestVersion)}\n`));
    // Display security analysis if available
    if (changes.securityAnalysis) {
        formatSecurityAnalysis(changes.securityAnalysis);
    }
    if (changes.summary) {
        console.log(chalk.blue(`   ${changes.summary}\n`));
    }
    if (changes.changes && changes.changes.length > 0) {
        // Show changes from most recent to oldest
        const sortedChanges = [...changes.changes].reverse();
        for (const change of sortedChanges.slice(0, 5)) { // Show last 5 versions
            console.log(chalk.yellow(`   Version ${change.version}${change.date ? ` (${formatDate(change.date)})` : ''}:`));
            if (change.changes && change.changes.length > 0) {
                for (const item of change.changes.slice(0, 3)) { // Show first 3 changes per version
                    console.log(chalk.white(`     • ${item}`));
                }
                if (change.changes.length > 3) {
                    console.log(chalk.gray(`     ... and ${change.changes.length - 3} more change(s)`));
                }
            }
            console.log();
        }
        if (sortedChanges.length > 5) {
            console.log(chalk.gray(`   ... and ${sortedChanges.length - 5} more version(s)\n`));
        }
    }
    else {
        console.log(chalk.gray('   No detailed changelog available\n'));
    }
    console.log(chalk.gray('─'.repeat(60)));
}
function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }
    catch {
        return dateString;
    }
}
function formatSecurityAnalysis(analysis) {
    console.log(chalk.bold('   🔒 Security Analysis:'));
    console.log(`   ${analysis.summary}\n`);
    if (analysis.warnings.length === 0) {
        return;
    }
    // Group warnings by level
    const critical = analysis.warnings.filter(w => w.level === 'critical');
    const high = analysis.warnings.filter(w => w.level === 'high');
    const medium = analysis.warnings.filter(w => w.level === 'medium');
    const low = analysis.warnings.filter(w => w.level === 'low');
    // Display warnings by severity
    if (critical.length > 0) {
        console.log(chalk.red(`   🚨 Critical Issues (${critical.length}):`));
        critical.forEach(warning => {
            console.log(chalk.red(`      • ${warning.message}`));
            if (warning.details) {
                console.log(chalk.gray(`        ${warning.details}`));
            }
        });
        console.log();
    }
    if (high.length > 0) {
        console.log(chalk.red(`   ⚠️  High Priority (${high.length}):`));
        high.forEach(warning => {
            console.log(chalk.yellow(`      • ${warning.message}`));
            if (warning.details) {
                console.log(chalk.gray(`        ${warning.details}`));
            }
        });
        console.log();
    }
    if (medium.length > 0) {
        console.log(chalk.yellow(`   🔶 Medium Priority (${medium.length}):`));
        medium.slice(0, 5).forEach(warning => {
            console.log(chalk.yellow(`      • ${warning.message}`));
            if (warning.details) {
                console.log(chalk.gray(`        ${warning.details}`));
            }
        });
        if (medium.length > 5) {
            console.log(chalk.gray(`      ... and ${medium.length - 5} more`));
        }
        console.log();
    }
    if (low.length > 0 && low.length <= 3) {
        console.log(chalk.gray(`   ℹ️  Low Priority (${low.length}):`));
        low.forEach(warning => {
            console.log(chalk.gray(`      • ${warning.message}`));
        });
        console.log();
    }
    console.log(chalk.gray(`   Risk Score: ${analysis.riskScore}/100\n`));
}
//# sourceMappingURL=formatter.js.map