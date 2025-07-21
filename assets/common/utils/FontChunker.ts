/**
 * FontChunker - Utility for splitting large font files into chunks and merging them
 * Inspired by YouTube's video streaming approach for better loading performance
 */
const { ccclass } = cc._decorator;

export interface FontChunk {
    index: number;
    data: ArrayBuffer;
    size: number;
    totalChunks: number;
    fontName: string;
    checksum: string;
}

export interface FontChunkMetadata {
    fontName: string;
    totalChunks: number;
    totalSize: number;
    chunkSize: number;
    checksums: string[];
    originalFileName: string;
}

@ccclass
export default class FontChunker {
    private static readonly DEFAULT_CHUNK_SIZE = 1024 * 1024; // 1MB chunks
    private static readonly CHUNK_PREFIX = "font_chunk_";
    private static readonly METADATA_SUFFIX = "_metadata";

    /**
     * Split a font file into smaller chunks
     * @param fontData - The original font file as ArrayBuffer
     * @param fontName - Name of the font
     * @param chunkSize - Size of each chunk in bytes (default: 1MB)
     * @returns Array of font chunks
     */
    static splitFontIntoChunks(
        fontData: ArrayBuffer,
        fontName: string,
        chunkSize: number = this.DEFAULT_CHUNK_SIZE
    ): { chunks: FontChunk[], metadata: FontChunkMetadata } {
        const totalSize = fontData.byteLength;
        const totalChunks = Math.ceil(totalSize / chunkSize);
        const chunks: FontChunk[] = [];
        const checksums: string[] = [];

        for (let i = 0; i < totalChunks; i++) {
            const start = i * chunkSize;
            const end = Math.min(start + chunkSize, totalSize);
            const chunkData = fontData.slice(start, end);

            // Generate checksum for this chunk
            const checksum = this.generateChecksum(chunkData);
            checksums.push(checksum);

            chunks.push({
                index: i,
                data: chunkData,
                size: chunkData.byteLength,
                totalChunks,
                fontName,
                checksum
            });
        }

        const metadata: FontChunkMetadata = {
            fontName,
            totalChunks,
            totalSize,
            chunkSize,
            checksums,
            originalFileName: `${fontName}.ttf`
        };

        return { chunks, metadata };
    }

    /**
     * Merge font chunks back into the original font file
     * @param chunks - Array of font chunks to merge
     * @param metadata - Font chunk metadata for validation
     * @returns Merged font data as ArrayBuffer
     */
    static mergeFontChunks(chunks: FontChunk[], metadata: FontChunkMetadata): ArrayBuffer {
        // Validate chunks
        if (chunks.length !== metadata.totalChunks) {
            throw new Error(`Expected ${metadata.totalChunks} chunks, but got ${chunks.length}`);
        }

        // Sort chunks by index
        const sortedChunks = chunks.sort((a, b) => a.index - b.index);

        // Validate checksums
        for (let i = 0; i < sortedChunks.length; i++) {
            const chunk = sortedChunks[i];
            const expectedChecksum = metadata.checksums[i];

            if (chunk.checksum !== expectedChecksum) {
                throw new Error(`Checksum mismatch for chunk ${i}`);
            }
        }

        // Merge chunks
        const mergedBuffer = new ArrayBuffer(metadata.totalSize);
        const mergedView = new Uint8Array(mergedBuffer);
        let offset = 0;

        for (const chunk of sortedChunks) {
            const chunkView = new Uint8Array(chunk.data);
            mergedView.set(chunkView, offset);
            offset += chunk.size;
        }

        return mergedBuffer;
    }

    /**
     * Load font chunks from resources and merge them
     * @param fontName - Name of the font to load
     * @returns Promise that resolves to the merged font data
     */
    static async loadChunkedFont(fontName: string): Promise<ArrayBuffer> {
        try {
            // Load metadata first
            const metadata = await this.loadFontMetadata(fontName);

            // Load all chunks
            const chunks: FontChunk[] = [];
            const loadPromises: Promise<FontChunk>[] = [];

            for (let i = 0; i < metadata.totalChunks; i++) {
                const chunkPromise = this.loadFontChunk(fontName, i, metadata);
                loadPromises.push(chunkPromise);
            }

            const loadedChunks = await Promise.all(loadPromises);

            // Merge chunks
            return this.mergeFontChunks(loadedChunks, metadata);
        } catch (error) {
            console.error(`Failed to load chunked font ${fontName}:`, error);
            throw error;
        }
    }

    /**
     * Check if a font is available in chunked format
     * @param fontName - Name of the font to check
     * @returns Promise that resolves to true if chunked font exists
     */
    static async isChunkedFontAvailable(fontName: string): Promise<boolean> {
        try {
            await this.loadFontMetadata(fontName);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Load font metadata from resources
     * @param fontName - Name of the font
     * @returns Promise that resolves to font metadata
     */
    private static async loadFontMetadata(fontName: string): Promise<FontChunkMetadata> {
        return new Promise((resolve, reject) => {
            const metadataPath = `fonts/chunks/${fontName}${this.METADATA_SUFFIX}`;
            cc.resources.load(metadataPath, cc.JsonAsset, (err, jsonAsset: cc.JsonAsset) => {
                if (err) {
                    reject(new Error(`Failed to load metadata for ${fontName}: ${err.message}`));
                    return;
                }
                resolve(jsonAsset.json as FontChunkMetadata);
            });
        });
    }

    /**
     * Load a single font chunk from resources
     * @param fontName - Name of the font
     * @param chunkIndex - Index of the chunk to load
     * @param metadata - Font metadata for validation
     * @returns Promise that resolves to the font chunk
     */
    private static async loadFontChunk(
        fontName: string,
        chunkIndex: number,
        metadata: FontChunkMetadata
    ): Promise<FontChunk> {
        return new Promise((resolve, reject) => {
            const chunkPath = `fonts/chunks/${this.CHUNK_PREFIX}${fontName}_${chunkIndex}`;

            // Use XMLHttpRequest to load binary data directly
            const xhr = new XMLHttpRequest();
            xhr.open('GET', chunkPath, true);
            xhr.responseType = 'arraybuffer';

            xhr.onload = () => {
                if (xhr.status === 200) {
                    const chunkData = xhr.response as ArrayBuffer;
                    const checksum = this.generateChecksum(chunkData);

                    const chunk: FontChunk = {
                        index: chunkIndex,
                        data: chunkData,
                        size: chunkData.byteLength,
                        totalChunks: metadata.totalChunks,
                        fontName,
                        checksum
                    };

                    resolve(chunk);
                } else {
                    reject(new Error(`Failed to load chunk ${chunkIndex} for ${fontName}: HTTP ${xhr.status}`));
                }
            };

            xhr.onerror = () => {
                reject(new Error(`Failed to load chunk ${chunkIndex} for ${fontName}: Network error`));
            };

            xhr.send();
        });
    }

    /**
     * Generate a simple checksum for data validation
     * @param data - Data to generate checksum for
     * @returns Checksum string
     */
    private static generateChecksum(data: ArrayBuffer): string {
        const view = new Uint8Array(data);
        let hash = 0;

        for (let i = 0; i < view.length; i++) {
            const char = view[i];
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }

        return hash.toString(16);
    }

    /**
     * Get the chunk file path for a specific chunk
     * @param fontName - Name of the font
     * @param chunkIndex - Index of the chunk
     * @returns Chunk file path
     */
    static getChunkPath(fontName: string, chunkIndex: number): string {
        return `fonts/chunks/${this.CHUNK_PREFIX}${fontName}_${chunkIndex}`;
    }

    /**
     * Get the metadata file path for a font
     * @param fontName - Name of the font
     * @returns Metadata file path
     */
    static getMetadataPath(fontName: string): string {
        return `fonts/chunks/${fontName}${this.METADATA_SUFFIX}`;
    }
} 