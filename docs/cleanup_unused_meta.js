const fs = require("fs");
const path = require("path");

/**
 * Cleanup script for unused meta files in Cocos Creator project
 * This script identifies meta files that don't have corresponding assets
 */

// Configuration
const PROJECT_ROOT = __dirname;
const ASSETS_DIR = path.join(PROJECT_ROOT, "assets");
const BACKUP_DIR = path.join(PROJECT_ROOT, "meta_backup");

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

    function traverse(currentDir) {
        const items = fs.readdirSync(currentDir);

        for (const item of items) {
            const fullPath = path.join(currentDir, item);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                traverse(fullPath);
            } else if (item.endsWith(".meta")) {
                metaFiles.push(fullPath);
            }
        }
    }

    traverse(dir);
    return metaFiles;
}

/**
 * Check if a meta file has a corresponding asset
 * @param {string} metaPath - Path to the meta file
 * @returns {boolean} True if corresponding asset exists
 */
function hasCorrespondingAsset(metaPath) {
    const assetPath = metaPath.replace(".meta", "");

    // Check if the asset file exists
    if (fs.existsSync(assetPath)) {
        return true;
    }

    // Special case: check if it's a directory meta file
    const dirPath = metaPath.replace(".meta", "");
    if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
        return true;
    }

    return false;
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
    console.log(`Backed up: ${relativePath}`);
}

/**
 * Main cleanup function
 */
function cleanupUnusedMetaFiles() {
    console.log("🔍 Scanning for unused meta files...\n");

    const allMetaFiles = findMetaFiles(ASSETS_DIR);
    const unusedMetaFiles = [];

    for (const metaPath of allMetaFiles) {
        if (!hasCorrespondingAsset(metaPath)) {
            unusedMetaFiles.push(metaPath);
        }
    }

    if (unusedMetaFiles.length === 0) {
        console.log("✅ No unused meta files found!");
        return;
    }

    console.log(`⚠️  Found ${unusedMetaFiles.length} unused meta files:\n`);

    for (const metaPath of unusedMetaFiles) {
        const relativePath = path.relative(PROJECT_ROOT, metaPath);
        console.log(`  - ${relativePath}`);
    }

    console.log("\n📋 Summary of unused meta files:");
    console.log("=====================================");

    // Group by directory
    const groupedFiles = {};
    for (const metaPath of unusedMetaFiles) {
        const relativePath = path.relative(PROJECT_ROOT, metaPath);
        const dir = path.dirname(relativePath);

        if (!groupedFiles[dir]) {
            groupedFiles[dir] = [];
        }
        groupedFiles[dir].push(path.basename(relativePath));
    }

    for (const [dir, files] of Object.entries(groupedFiles)) {
        console.log(`\n📁 ${dir}/`);
        for (const file of files) {
            console.log(`   ${file}`);
        }
    }

    console.log("\n💡 Recommendations:");
    console.log("1. Review these files to ensure they are truly unused");
    console.log("2. If they are unused, you can safely delete them");
    console.log("3. If they correspond to assets that were moved, update the paths");
    console.log("4. Run this script again after cleanup to verify");

    // Option to automatically backup and delete
    console.log("\n🚀 To automatically backup and delete these files, run:");
    console.log("   node cleanup_unused_meta.js --cleanup");
}

/**
 * Automatic cleanup with backup
 */
function performCleanup() {
    console.log("🧹 Performing automatic cleanup...\n");

    const allMetaFiles = findMetaFiles(ASSETS_DIR);
    const unusedMetaFiles = [];

    for (const metaPath of allMetaFiles) {
        if (!hasCorrespondingAsset(metaPath)) {
            unusedMetaFiles.push(metaPath);
        }
    }

    if (unusedMetaFiles.length === 0) {
        console.log("✅ No unused meta files found!");
        return;
    }

    console.log(`📦 Backing up ${unusedMetaFiles.length} unused meta files...`);

    for (const metaPath of unusedMetaFiles) {
        backupMetaFile(metaPath);
    }

    console.log("\n🗑️  Deleting unused meta files...");

    for (const metaPath of unusedMetaFiles) {
        const relativePath = path.relative(PROJECT_ROOT, metaPath);
        fs.unlinkSync(metaPath);
        console.log(`Deleted: ${relativePath}`);
    }

    console.log("\n✅ Cleanup completed!");
    console.log(`📦 Backup files saved to: ${path.relative(PROJECT_ROOT, BACKUP_DIR)}`);
    console.log("💡 You can restore files from backup if needed");
}

// Main execution
if (process.argv.includes("--cleanup")) {
    performCleanup();
} else {
    cleanupUnusedMetaFiles();
}
