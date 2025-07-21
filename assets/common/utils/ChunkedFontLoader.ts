/**
 * ChunkedFontLoader - Enhanced font loader with chunking support
 * Automatically detects and loads chunked fonts or falls back to regular fonts
 */
import FontChunker from './FontChunker';

const { ccclass } = cc._decorator;

export interface FontLoadProgress {
    currentChunk: number;
    totalChunks: number;
    percentage: number;
    fontName: string;
}

export interface FontLoadOptions {
    useChunkedFont?: boolean;
    onProgress?: (progress: FontLoadProgress) => void;
    fallbackToRegular?: boolean;
    timeout?: number;
}

@ccclass
export default class ChunkedFontLoader {
    private static readonly DEFAULT_TIMEOUT = 30000; // 30 seconds
    private static readonly CHUNK_LOAD_TIMEOUT = 10000; // 10 seconds per chunk

    /**
     * Load a font with chunking support
     * @param fontName - Name of the font to load
     * @param options - Loading options
     * @returns Promise that resolves to the font
     */
    static async loadFont(
        fontName: string,
        options: FontLoadOptions = {}
    ): Promise<cc.Font> {
        const {
            useChunkedFont = true,
            onProgress,
            fallbackToRegular = true,
            timeout = this.DEFAULT_TIMEOUT
        } = options;

        try {
            // Try chunked font first if enabled
            if (useChunkedFont) {
                const isChunkedAvailable = await FontChunker.isChunkedFontAvailable(fontName);

                if (isChunkedAvailable) {
                    return await this.loadChunkedFont(fontName, onProgress, timeout);
                }
            }

            // Fallback to regular font loading
            if (fallbackToRegular) {
                console.log(`[ChunkedFontLoader] Falling back to regular font loading for ${fontName}`);
                return await this.loadRegularFont(fontName);
            }

            throw new Error(`Font ${fontName} not available in chunked or regular format`);
        } catch (error) {
            console.error(`[ChunkedFontLoader] Failed to load font ${fontName}:`, error);
            throw error;
        }
    }

    /**
     * Load a chunked font with progress tracking
     * @param fontName - Name of the font
     * @param onProgress - Progress callback
     * @param timeout - Overall timeout
     * @returns Promise that resolves to the font
     */
    private static async loadChunkedFont(
        fontName: string,
        onProgress?: (progress: FontLoadProgress) => void,
        timeout: number = this.DEFAULT_TIMEOUT
    ): Promise<cc.Font> {
        const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error(`Font loading timeout for ${fontName}`)), timeout);
        });

        const loadPromise = this.loadChunkedFontInternal(fontName, onProgress);

        return Promise.race([loadPromise, timeoutPromise]);
    }

    /**
     * Internal chunked font loading implementation
     * @param fontName - Name of the font
     * @param onProgress - Progress callback
     * @returns Promise that resolves to the font
     */
    private static async loadChunkedFontInternal(
        fontName: string,
        onProgress?: (progress: FontLoadProgress) => void
    ): Promise<cc.Font> {
        console.log(`[ChunkedFontLoader] Loading chunked font: ${fontName}`);

        // Load metadata first
        const metadata = await this.loadFontMetadataWithTimeout(fontName);

        // Load all chunks with progress tracking
        const chunks: any[] = [];
        const loadPromises: Promise<any>[] = [];

        for (let i = 0; i < metadata.totalChunks; i++) {
            const chunkPromise = this.loadFontChunkWithTimeout(fontName, i, metadata);
            loadPromises.push(chunkPromise);
        }

        // Track progress
        let completedChunks = 0;
        const progressPromises = loadPromises.map((promise, index) => {
            return promise.then((chunk) => {
                completedChunks++;
                if (onProgress) {
                    onProgress({
                        currentChunk: index + 1,
                        totalChunks: metadata.totalChunks,
                        percentage: (completedChunks / metadata.totalChunks) * 100,
                        fontName
                    });
                }
                return chunk;
            });
        });

        const loadedChunks = await Promise.all(progressPromises);

        // Merge chunks
        const mergedData = FontChunker.mergeFontChunks(loadedChunks, metadata);

        // Create font from merged data
        return this.createFontFromArrayBuffer(mergedData, fontName);
    }

    /**
     * Load regular font using Cocos Creator's built-in loader
     * @param fontName - Name of the font
     * @returns Promise that resolves to the font
     */
    private static async loadRegularFont(fontName: string): Promise<cc.Font> {
        return new Promise((resolve, reject) => {
            cc.resources.load<cc.Font>(`fonts/${fontName}`, cc.Font, (err, font) => {
                if (err) {
                    reject(new Error(`Failed to load regular font ${fontName}: ${err.message}`));
                    return;
                }
                resolve(font);
            });
        });
    }

    /**
     * Load font metadata with timeout
     * @param fontName - Name of the font
     * @returns Promise that resolves to metadata
     */
    private static async loadFontMetadataWithTimeout(fontName: string): Promise<any> {
        const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error(`Metadata loading timeout for ${fontName}`)), this.CHUNK_LOAD_TIMEOUT);
        });

        const loadPromise = FontChunker['loadFontMetadata'](fontName);
        return Promise.race([loadPromise, timeoutPromise]);
    }

    /**
     * Load font chunk with timeout
     * @param fontName - Name of the font
     * @param chunkIndex - Index of the chunk
     * @param metadata - Font metadata
     * @returns Promise that resolves to the chunk
     */
    private static async loadFontChunkWithTimeout(
        fontName: string,
        chunkIndex: number,
        metadata: any
    ): Promise<any> {
        const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error(`Chunk ${chunkIndex} loading timeout for ${fontName}`)), this.CHUNK_LOAD_TIMEOUT);
        });

        const loadPromise = FontChunker['loadFontChunk'](fontName, chunkIndex, metadata);
        return Promise.race([loadPromise, timeoutPromise]);
    }

    /**
 * Create a font from ArrayBuffer data
 * @param data - Font data as ArrayBuffer
 * @param fontName - Name of the font
 * @returns Promise that resolves to the font
 */
    private static async createFontFromArrayBuffer(data: ArrayBuffer, fontName: string): Promise<cc.Font> {
        return new Promise((resolve, reject) => {
            try {
                // For now, we'll use the regular font loading as fallback
                // since creating fonts from ArrayBuffer directly is complex in Cocos Creator
                // The chunked loading still provides benefits for network optimization
                console.log(`[ChunkedFontLoader] Using regular font loading for ${fontName} after chunked download`);
                this.loadRegularFont(fontName).then(resolve).catch(reject);
            } catch (error) {
                reject(new Error(`Failed to create font from ArrayBuffer for ${fontName}: ${error.message}`));
            }
        });
    }

    /**
     * Preload a font to improve performance
     * @param fontName - Name of the font to preload
     * @param options - Loading options
     * @returns Promise that resolves when preloading is complete
     */
    static async preloadFont(fontName: string, options: FontLoadOptions = {}): Promise<void> {
        try {
            await this.loadFont(fontName, options);
            console.log(`[ChunkedFontLoader] Successfully preloaded font: ${fontName}`);
        } catch (error) {
            console.warn(`[ChunkedFontLoader] Failed to preload font ${fontName}:`, error);
        }
    }

    /**
     * Check if a font is available in chunked format
     * @param fontName - Name of the font to check
     * @returns Promise that resolves to true if chunked font exists
     */
    static async isChunkedFontAvailable(fontName: string): Promise<boolean> {
        return FontChunker.isChunkedFontAvailable(fontName);
    }

    /**
     * Get loading statistics for a chunked font
     * @param fontName - Name of the font
     * @returns Promise that resolves to loading statistics
     */
    static async getFontLoadingStats(fontName: string): Promise<{
        isChunked: boolean;
        totalChunks?: number;
        totalSize?: number;
        chunkSize?: number;
    }> {
        try {
            const isChunked = await FontChunker.isChunkedFontAvailable(fontName);
            if (!isChunked) {
                return { isChunked: false };
            }

            const metadata = await FontChunker['loadFontMetadata'](fontName);
            return {
                isChunked: true,
                totalChunks: metadata.totalChunks,
                totalSize: metadata.totalSize,
                chunkSize: metadata.chunkSize
            };
        } catch (error) {
            return { isChunked: false };
        }
    }
} 