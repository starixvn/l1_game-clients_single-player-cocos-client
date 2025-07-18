const fs = require("fs");
const path = require("path");

/**
 * Comprehensive Cocos Creator Meta File Cleanup Script
 * This script helps identify and clean up various types of meta file issues
 */

// Configuration
const PROJECT_ROOT = __dirname;
const ASSETS_DIR = path.join(PROJECT_ROOT, "assets");
const BACKUP_DIR = path.join(PROJECT_ROOT, "meta_backup");
const TEMP_DIRS = [path.join(PROJECT_ROOT, "temp"), path.join(PROJECT_ROOT, "library"), path.join(PROJECT_ROOT, "local")];

// Create backup directory if it doesn't exist
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

/**
 * Recursively find all meta files in a directory
 * @param {string} dir - Directory to search
 * @returns {Array} Array of meta file paths
 */
function findMetaFiles(dir) {
    const metaFiles = [];

    if (!fs.existsSync(dir)) {
        return metaFiles;
    }

    function traverse(currentDir) {
        try {
            const items = fs.readdirSync(currentDir);

            for (const item of items) {
                const fullPath = path.join(currentDir, item);

                try {
                    const stat = fs.statSync(fullPath);

                    if (stat.isDirectory()) {
                        traverse(fullPath);
                    } else if (item.endsWith(".meta")) {
                        metaFiles.push(fullPath);
                    }
                } catch (err) {
                    console.warn(`Warning: Could not access ${fullPath}: ${err.message}`);
                }
            }
        } catch (err) {
            console.warn(`Warning: Could not read directory ${currentDir}: ${err.message}`);
        }
    }

    traverse(dir);
    return metaFiles;
}

/**
 * Check if a meta file has a corresponding asset
 * @param {string} metaPath - Path to the meta file
 * @returns {Object} Object with hasAsset boolean and assetPath string
 */
function checkCorrespondingAsset(metaPath) {
    const assetPath = metaPath.replace(".meta", "");

    // Check if the asset file exists
    if (fs.existsSync(assetPath)) {
        return { hasAsset: true, assetPath, type: "file" };
    }

    // Special case: check if it's a directory meta file
    if (fs.existsSync(assetPath) && fs.statSync(assetPath).isDirectory()) {
        return { hasAsset: true, assetPath, type: "directory" };
    }

    return { hasAsset: false, assetPath, type: "missing" };
}

/**
 * Check if a meta file is in a temporary directory
 * @param {string} metaPath - Path to the meta file
 * @returns {boolean} True if in temp directory
 */
function isInTempDirectory(metaPath) {
    const relativePath = path.relative(PROJECT_ROOT, metaPath);
    return TEMP_DIRS.some((tempDir) => {
        const relativeTempDir = path.relative(PROJECT_ROOT, tempDir);
        return relativePath.startsWith(relativeTempDir);
    });
}

/**
 * Backup a meta file before deletion
 * @param {string} metaPath - Path to the meta file
 */
function backupMetaFile(metaPath) {
    const relativePath = path.relative(PROJECT_ROOT, metaPath);
    const backupPath = path.join(BACKUP_DIR, relativePath);
    const backupDir = path.dirname(backupPath);

    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
    }

    fs.copyFileSync(metaPath, backupPath);
    console.log(`📦 Backed up: ${relativePath}`);
}

/**
 * Analyze meta files and categorize issues
 */
function analyzeMetaFiles() {
    console.log("🔍 Analyzing meta files...\n");

    const allMetaFiles = findMetaFiles(ASSETS_DIR);
    const issues = {
        unused: [],
        tempFiles: [],
        orphaned: [],
        suspicious: []
    };

    console.log(`Found ${allMetaFiles.length} meta files in assets directory\n`);

    for (const metaPath of allMetaFiles) {
        const relativePath = path.relative(PROJECT_ROOT, metaPath);
        const assetCheck = checkCorrespondingAsset(metaPath);

        if (!assetCheck.hasAsset) {
            if (isInTempDirectory(metaPath)) {
                issues.tempFiles.push({ path: metaPath, relative: relativePath, assetPath: assetCheck.assetPath });
            } else {
                issues.unused.push({ path: metaPath, relative: relativePath, assetPath: assetCheck.assetPath });
            }
        }

        // Check for suspicious patterns
        const fileName = path.basename(metaPath, ".meta");
        if (fileName.includes("webview-game") || fileName.includes("auto-bet")) {
            issues.suspicious.push({ path: metaPath, relative: relativePath, assetCheck });
        }
    }

    return issues;
}

/**
 * Display analysis results
 */
function displayResults(issues) {
    console.log("📋 Analysis Results:");
    console.log("===================\n");

    // Unused meta files
    if (issues.unused.length > 0) {
        console.log(`⚠️  Unused Meta Files (${issues.unused.length}):`);
        console.log("These meta files have no corresponding assets:");
        for (const item of issues.unused) {
            console.log(`  - ${item.relative}`);
            console.log(`    Expected asset: ${path.relative(PROJECT_ROOT, item.assetPath)}`);
        }
        console.log("");
    }

    // Temp files
    if (issues.tempFiles.length > 0) {
        console.log(`🗂️  Temporary Meta Files (${issues.tempFiles.length}):`);
        console.log("These meta files are in temporary directories:");
        for (const item of issues.tempFiles) {
            console.log(`  - ${item.relative}`);
        }
        console.log("");
    }

    // Suspicious files
    if (issues.suspicious.length > 0) {
        console.log(`🔍 Suspicious Meta Files (${issues.suspicious.length}):`);
        console.log("These files match patterns from your warnings:");
        for (const item of issues.suspicious) {
            console.log(`  - ${item.relative}`);
            if (item.assetCheck.hasAsset) {
                console.log(`    ✅ Has corresponding asset: ${path.relative(PROJECT_ROOT, item.assetCheck.assetPath)}`);
            } else {
                console.log(`    ❌ Missing asset: ${path.relative(PROJECT_ROOT, item.assetCheck.assetPath)}`);
            }
        }
        console.log("");
    }

    if (issues.unused.length === 0 && issues.tempFiles.length === 0 && issues.suspicious.length === 0) {
        console.log("✅ No issues found! All meta files appear to be properly linked to assets.");
    }

    return issues;
}

/**
 * Perform cleanup
 */
function performCleanup(issues) {
    console.log("🧹 Performing cleanup...\n");

    let totalCleaned = 0;

    // Clean unused files
    if (issues.unused.length > 0) {
        console.log(`🗑️  Cleaning ${issues.unused.length} unused meta files...`);
        for (const item of issues.unused) {
            backupMetaFile(item.path);
            fs.unlinkSync(item.path);
            console.log(`Deleted: ${item.relative}`);
            totalCleaned++;
        }
        console.log("");
    }

    // Clean temp files
    if (issues.tempFiles.length > 0) {
        console.log(`🗑️  Cleaning ${issues.tempFiles.length} temporary meta files...`);
        for (const item of issues.tempFiles) {
            backupMetaFile(item.path);
            fs.unlinkSync(item.path);
            console.log(`Deleted: ${item.relative}`);
            totalCleaned++;
        }
        console.log("");
    }

    console.log(`✅ Cleanup completed! ${totalCleaned} files cleaned.`);
    console.log(`📦 Backup files saved to: ${path.relative(PROJECT_ROOT, BACKUP_DIR)}`);
}

/**
 * Main execution
 */
function main() {
    const isCleanup = process.argv.includes("--cleanup");

    try {
        const issues = analyzeMetaFiles();
        displayResults(issues);

        if (isCleanup) {
            const hasIssues = issues.unused.length > 0 || issues.tempFiles.length > 0;

            if (hasIssues) {
                console.log("\n💡 Recommendations:");
                console.log("1. Review the files above to ensure they are truly unused");
                console.log("2. If you want to proceed with cleanup, run: node cocos_meta_cleanup.js --cleanup");
                console.log("3. If you want to backup and delete automatically, run: node cocos_meta_cleanup.js --cleanup");
            } else {
                console.log("\n🎉 No cleanup needed! Your project appears to be clean.");
            }
        } else {
            const hasIssues = issues.unused.length > 0 || issues.tempFiles.length > 0;

            if (hasIssues) {
                console.log("\n🚀 To perform cleanup, run:");
                console.log("   node cocos_meta_cleanup.js --cleanup");
            }
        }
    } catch (error) {
        console.error("❌ Error during analysis:", error.message);
        process.exit(1);
    }
}

// Run the script
main();
