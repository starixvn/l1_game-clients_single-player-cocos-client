#!/usr/bin/env node

/**
 * Font Chunker Utility
 * Splits large font files into smaller chunks for better loading performance
 *
 * Usage:
 * node tools/font-chunker.js --input fonts/PingFang-Bold.ttf --output fonts/chunks --chunk-size 1024
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

class FontChunkerTool {
    constructor() {
        this.DEFAULT_CHUNK_SIZE = 1024 * 1024; // 1MB
        this.CHUNK_PREFIX = "font_chunk_";
        this.METADATA_SUFFIX = "_metadata";
    }

    /**
     * Generate checksum for data validation
     * @param {Buffer} data - Data to generate checksum for
     * @returns {string} Checksum string
     */
    generateChecksum(data) {
        return crypto.createHash("md5").update(data).digest("hex");
    }

    /**
     * Split a font file into chunks
     * @param {string} inputPath - Path to the input font file
     * @param {string} outputDir - Directory to save chunks
     * @param {number} chunkSize - Size of each chunk in bytes
     */
    async splitFontFile(inputPath, outputDir, chunkSize = this.DEFAULT_CHUNK_SIZE) {
        try {
            console.log(`[FontChunker] Reading font file: ${inputPath}`);

            // Read the font file
            const fontData = fs.readFileSync(inputPath);
            const fontName = path.basename(inputPath, path.extname(inputPath));
            const totalSize = fontData.length;
            const totalChunks = Math.ceil(totalSize / chunkSize);

            console.log(`[FontChunker] Font size: ${this.formatBytes(totalSize)}`);
            console.log(`[FontChunker] Chunk size: ${this.formatBytes(chunkSize)}`);
            console.log(`[FontChunker] Total chunks: ${totalChunks}`);

            // Create output directory if it doesn't exist
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
                console.log(`[FontChunker] Created output directory: ${outputDir}`);
            }

            const chunks = [];
            const checksums = [];

            // Split into chunks
            for (let i = 0; i < totalChunks; i++) {
                const start = i * chunkSize;
                const end = Math.min(start + chunkSize, totalSize);
                const chunkData = fontData.slice(start, end);

                // Generate checksum
                const checksum = this.generateChecksum(chunkData);
                checksums.push(checksum);

                // Save chunk file
                const chunkFileName = `${this.CHUNK_PREFIX}${fontName}_${i}`;
                const chunkPath = path.join(outputDir, chunkFileName);
                fs.writeFileSync(chunkPath, chunkData);

                chunks.push({
                    index: i,
                    fileName: chunkFileName,
                    size: chunkData.length,
                    checksum
                });

                console.log(`[FontChunker] Created chunk ${i + 1}/${totalChunks}: ${this.formatBytes(chunkData.length)}`);
            }

            // Create metadata file
            const metadata = {
                fontName,
                totalChunks,
                totalSize,
                chunkSize,
                checksums,
                originalFileName: path.basename(inputPath),
                createdAt: new Date().toISOString(),
                version: "1.0.0"
            };

            const metadataFileName = `${fontName}${this.METADATA_SUFFIX}.json`;
            const metadataPath = path.join(outputDir, metadataFileName);
            fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

            console.log(`[FontChunker] Created metadata file: ${metadataFileName}`);
            console.log(`[FontChunker] Successfully split font into ${totalChunks} chunks`);

            // Print summary
            this.printSummary(fontName, totalSize, totalChunks, chunkSize);
        } catch (error) {
            console.error(`[FontChunker] Error splitting font file:`, error);
            process.exit(1);
        }
    }

    /**
     * Print summary of the chunking operation
     * @param {string} fontName - Name of the font
     * @param {number} totalSize - Total size of the font
     * @param {number} totalChunks - Number of chunks created
     * @param {number} chunkSize - Size of each chunk
     */
    printSummary(fontName, totalSize, totalChunks, chunkSize) {
        console.log("\n" + "=".repeat(50));
        console.log("FONT CHUNKING SUMMARY");
        console.log("=".repeat(50));
        console.log(`Font Name: ${fontName}`);
        console.log(`Original Size: ${this.formatBytes(totalSize)}`);
        console.log(`Chunk Size: ${this.formatBytes(chunkSize)}`);
        console.log(`Total Chunks: ${totalChunks}`);
        console.log(`Average Chunk Size: ${this.formatBytes(Math.ceil(totalSize / totalChunks))}`);
        console.log(`Compression Ratio: ${((totalSize / (totalChunks * chunkSize)) * 100).toFixed(1)}%`);
        console.log("=".repeat(50));
    }

    /**
     * Format bytes to human readable format
     * @param {number} bytes - Number of bytes
     * @returns {string} Formatted string
     */
    formatBytes(bytes) {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    }

    /**
     * Validate chunked font files
     * @param {string} fontName - Name of the font
     * @param {string} chunksDir - Directory containing chunks
     */
    async validateChunkedFont(fontName, chunksDir) {
        try {
            console.log(`[FontChunker] Validating chunked font: ${fontName}`);

            // Load metadata
            const metadataPath = path.join(chunksDir, `${fontName}${this.METADATA_SUFFIX}.json`);
            if (!fs.existsSync(metadataPath)) {
                throw new Error(`Metadata file not found: ${metadataPath}`);
            }

            const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf8"));
            console.log(`[FontChunker] Found metadata for ${metadata.totalChunks} chunks`);

            // Validate each chunk
            let totalValidatedSize = 0;
            for (let i = 0; i < metadata.totalChunks; i++) {
                const chunkPath = path.join(chunksDir, `${this.CHUNK_PREFIX}${fontName}_${i}`);

                if (!fs.existsSync(chunkPath)) {
                    throw new Error(`Chunk file missing: ${chunkPath}`);
                }

                const chunkData = fs.readFileSync(chunkPath);
                const checksum = this.generateChecksum(chunkData);
                const expectedChecksum = metadata.checksums[i];

                if (checksum !== expectedChecksum) {
                    throw new Error(`Checksum mismatch for chunk ${i}: expected ${expectedChecksum}, got ${checksum}`);
                }

                totalValidatedSize += chunkData.length;
                console.log(`[FontChunker] Validated chunk ${i + 1}/${metadata.totalChunks}: ${this.formatBytes(chunkData.length)}`);
            }

            if (totalValidatedSize !== metadata.totalSize) {
                throw new Error(`Size mismatch: expected ${metadata.totalSize}, got ${totalValidatedSize}`);
            }

            console.log(`[FontChunker] All chunks validated successfully!`);
            console.log(`[FontChunker] Total validated size: ${this.formatBytes(totalValidatedSize)}`);
        } catch (error) {
            console.error(`[FontChunker] Validation failed:`, error);
            process.exit(1);
        }
    }

    /**
     * Show help information
     */
    showHelp() {
        console.log(`
Font Chunker Utility - Split large font files into chunks

Usage:
  node tools/font-chunker.js --input <font-file> --output <output-dir> [options]

Options:
  --input, -i        Path to the input font file (required)
  --output, -o       Output directory for chunks (required)
  --chunk-size, -s   Size of each chunk in bytes (default: 1MB)
  --validate, -v     Validate existing chunked font
  --help, -h         Show this help message

Examples:
  # Split PingFang-Bold.ttf into 1MB chunks
  node tools/font-chunker.js --input fonts/PingFang-Bold.ttf --output fonts/chunks

  # Split with custom chunk size (512KB)
  node tools/font-chunker.js --input fonts/PingFang-Bold.ttf --output fonts/chunks --chunk-size 524288

  # Validate existing chunked font
  node tools/font-chunker.js --input fonts/PingFang-Bold.ttf --output fonts/chunks --validate
        `);
    }
}

// Parse command line arguments
function parseArgs() {
    const args = process.argv.slice(2);
    const options = {};

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        const nextArg = args[i + 1];

        switch (arg) {
            case "--input":
            case "-i":
                options.input = nextArg;
                i++;
                break;
            case "--output":
            case "-o":
                options.output = nextArg;
                i++;
                break;
            case "--chunk-size":
            case "-s":
                options.chunkSize = parseInt(nextArg);
                i++;
                break;
            case "--validate":
            case "-v":
                options.validate = true;
                break;
            case "--help":
            case "-h":
                options.help = true;
                break;
        }
    }

    return options;
}

// Main execution
async function main() {
    const options = parseArgs();
    const chunker = new FontChunkerTool();

    if (options.help) {
        chunker.showHelp();
        return;
    }

    if (!options.input || !options.output) {
        console.error("[FontChunker] Error: --input and --output are required");
        chunker.showHelp();
        process.exit(1);
    }

    if (options.validate) {
        const fontName = path.basename(options.input, path.extname(options.input));
        await chunker.validateChunkedFont(fontName, options.output);
    } else {
        await chunker.splitFontFile(options.input, options.output, options.chunkSize);
    }
}

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = FontChunkerTool;
