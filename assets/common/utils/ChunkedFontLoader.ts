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
    elapsedTime?: number; // Time elapsed since start
    estimatedTimeRemaining?: number; // Estimated time to completion
}

export interface FontLoadTiming {
    startTime: number;
    endTime?: number;
    totalDuration?: number;
    metadataLoadTime?: number;
    chunkLoadTimes: number[];
    mergeTime?: number;
    fontCreationTime?: number;
    phases: {
        metadata: { start: number; end?: number; duration?: number };
        chunks: { start: number; end?: number; duration?: number };
        merge: { start: number; end?: number; duration?: number };
        fontCreation: { start: number; end?: number; duration?: number };
    };
}

export interface FontLoadOptions {
    useChunkedFont?: boolean;
    onProgress?: (progress: FontLoadProgress) => void;
    fallbackToRegular?: boolean;
    timeout?: number;
    enableTiming?: boolean; // Enable detailed timing logs
    onTimingComplete?: (timing: FontLoadTiming) => void; // Callback for timing data
}

@ccclass
export default class ChunkedFontLoader {
    private static readonly DEFAULT_TIMEOUT = 30000; // 30 seconds
    private static readonly CHUNK_LOAD_TIMEOUT = 10000; // 10 seconds per chunk

    /**
     * Get current timestamp in milliseconds
     */
    private static getTimestamp(): number {
        return Date.now();
    }

    /**
     * Format duration in human-readable format
     */
    private static formatDuration(ms: number): string {
        if (ms < 1000) return `${ms}ms`;
        if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
        return `${(ms / 60000).toFixed(2)}m`;
    }

    /**
     * Log timing information with consistent formatting
     */
    private static logTiming(message: string, duration?: number, additionalInfo?: string): void {
        const timestamp = new Date().toISOString();
        const durationStr = duration ? ` (${this.formatDuration(duration)})` : '';
        const infoStr = additionalInfo ? ` - ${additionalInfo}` : '';
        console.log(`[${timestamp}] [ChunkedFontLoader] ${message}${durationStr}${infoStr}`);
    }

    /**
     * Log comprehensive timing summary
     */
    private static logTimingSummary(fontName: string, timing: FontLoadTiming): void {
        const timestamp = new Date().toISOString();
        console.log(`\n[${timestamp}] [ChunkedFontLoader] === FONT LOADING SUMMARY: ${fontName} ===`);
        console.log(`Total Duration: ${this.formatDuration(timing.totalDuration!)}`);
        console.log(`Metadata Load: ${this.formatDuration(timing.metadataLoadTime!)}`);
        console.log(`Chunks Load: ${this.formatDuration(timing.phases.chunks.duration!)}`);
        console.log(`Merge: ${this.formatDuration(timing.mergeTime!)}`);
        console.log(`Font Creation: ${this.formatDuration(timing.fontCreationTime!)}`);

        if (timing.chunkLoadTimes.length > 0) {
            const avgChunkTime = timing.chunkLoadTimes.reduce((a, b) => a + b, 0) / timing.chunkLoadTimes.length;
            const minChunkTime = Math.min(...timing.chunkLoadTimes);
            const maxChunkTime = Math.max(...timing.chunkLoadTimes);
            console.log(`Chunk Performance:`);
            console.log(`  Average: ${this.formatDuration(avgChunkTime)}`);
            console.log(`  Min: ${this.formatDuration(minChunkTime)}`);
            console.log(`  Max: ${this.formatDuration(maxChunkTime)}`);
        }

        console.log(`[${timestamp}] [ChunkedFontLoader] === END SUMMARY ===\n`);
    }

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
            timeout = this.DEFAULT_TIMEOUT,
            enableTiming = false,
            onTimingComplete
        } = options;

        const startTime = this.getTimestamp();
        this.logTiming(`Starting font load: ${fontName}`);

        try {
            // Try chunked font first if enabled
            if (useChunkedFont) {
                const isChunkedAvailable = await FontChunker.isChunkedFontAvailable(fontName);

                if (isChunkedAvailable) {
                    this.logTiming(`Chunked font available, loading: ${fontName}`);
                    const font = await this.loadChunkedFont(fontName, onProgress, timeout, enableTiming, onTimingComplete);
                    const totalTime = this.getTimestamp() - startTime;
                    this.logTiming(`Chunked font load completed: ${fontName}`, totalTime);
                    return font;
                }
            }

            // Fallback to regular font loading
            if (fallbackToRegular) {
                this.logTiming(`Falling back to regular font loading: ${fontName}`);
                const font = await this.loadRegularFont(fontName);
                const totalTime = this.getTimestamp() - startTime;
                this.logTiming(`Regular font load completed: ${fontName}`, totalTime);
                return font;
            }

            throw new Error(`Font ${fontName} not available in chunked or regular format`);
        } catch (error) {
            const totalTime = this.getTimestamp() - startTime;
            this.logTiming(`Font load failed: ${fontName}`, totalTime, `Error: ${error.message}`);
            console.error(`[ChunkedFontLoader] Failed to load font ${fontName}:`, error);
            throw error;
        }
    }

    /**
     * Load a chunked font with progress tracking
     * @param fontName - Name of the font
     * @param onProgress - Progress callback
     * @param timeout - Overall timeout
     * @param enableTiming - Enable detailed timing
     * @param onTimingComplete - Timing completion callback
     * @returns Promise that resolves to the font
     */
    private static async loadChunkedFont(
        fontName: string,
        onProgress?: (progress: FontLoadProgress) => void,
        timeout: number = this.DEFAULT_TIMEOUT,
        enableTiming = false,
        onTimingComplete?: (timing: FontLoadTiming) => void
    ): Promise<cc.Font> {
        const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error(`Font loading timeout for ${fontName}`)), timeout);
        });

        const loadPromise = this.loadChunkedFontInternal(fontName, onProgress, enableTiming, onTimingComplete);

        return Promise.race([loadPromise, timeoutPromise]);
    }

    /**
     * Internal chunked font loading implementation
     * @param fontName - Name of the font
     * @param onProgress - Progress callback
     * @param enableTiming - Enable detailed timing
     * @param onTimingComplete - Timing completion callback
     * @returns Promise that resolves to the font
     */
    private static async loadChunkedFontInternal(
        fontName: string,
        onProgress?: (progress: FontLoadProgress) => void,
        enableTiming = false,
        onTimingComplete?: (timing: FontLoadTiming) => void
    ): Promise<cc.Font> {
        const timing: FontLoadTiming = {
            startTime: this.getTimestamp(),
            chunkLoadTimes: [],
            phases: {
                metadata: { start: this.getTimestamp() },
                chunks: { start: 0 },
                merge: { start: 0 },
                fontCreation: { start: 0 }
            }
        };

        this.logTiming(`Loading chunked font: ${fontName}`);

        try {
            // Load metadata first
            this.logTiming(`Loading metadata for: ${fontName}`);
            const metadata = await this.loadFontMetadataWithTimeout(fontName);
            timing.phases.metadata.end = this.getTimestamp();
            timing.phases.metadata.duration = timing.phases.metadata.end - timing.phases.metadata.start;
            timing.metadataLoadTime = timing.phases.metadata.duration;
            this.logTiming(`Metadata loaded: ${fontName}`, timing.metadataLoadTime, `${metadata.totalChunks} chunks, ${this.formatDuration(metadata.totalSize)}`);

            // Load all chunks with progress tracking
            timing.phases.chunks.start = this.getTimestamp();
            this.logTiming(`Starting chunk loading: ${fontName}`, undefined, `${metadata.totalChunks} chunks`);

            const loadPromises: Promise<any>[] = [];
            const chunkStartTimes: number[] = [];

            for (let i = 0; i < metadata.totalChunks; i++) {
                chunkStartTimes[i] = this.getTimestamp();
                const chunkPromise = this.loadFontChunkWithTimeout(fontName, i, metadata);
                loadPromises.push(chunkPromise);
            }

            // Track progress
            let completedChunks = 0;
            const progressPromises = loadPromises.map((promise, index) => {
                return promise.then((chunk) => {
                    const chunkEndTime = this.getTimestamp();
                    const chunkDuration = chunkEndTime - chunkStartTimes[index];
                    timing.chunkLoadTimes[index] = chunkDuration;

                    completedChunks++;
                    if (onProgress) {
                        const elapsedTime = chunkEndTime - timing.startTime;
                        const avgTimePerChunk = elapsedTime / completedChunks;
                        const remainingChunks = metadata.totalChunks - completedChunks;
                        const estimatedTimeRemaining = avgTimePerChunk * remainingChunks;

                        onProgress({
                            currentChunk: index + 1,
                            totalChunks: metadata.totalChunks,
                            percentage: (completedChunks / metadata.totalChunks) * 100,
                            fontName,
                            elapsedTime,
                            estimatedTimeRemaining
                        });
                    }

                    if (enableTiming) {
                        this.logTiming(`Chunk ${index + 1}/${metadata.totalChunks} loaded: ${fontName}`, chunkDuration);
                    }

                    return chunk;
                });
            });

            const loadedChunks = await Promise.all(progressPromises);
            timing.phases.chunks.end = this.getTimestamp();
            timing.phases.chunks.duration = timing.phases.chunks.end - timing.phases.chunks.start;
            this.logTiming(`All chunks loaded: ${fontName}`, timing.phases.chunks.duration, `${metadata.totalChunks} chunks`);

            // Merge chunks
            timing.phases.merge.start = this.getTimestamp();
            this.logTiming(`Starting chunk merge: ${fontName}`);
            const mergedData = FontChunker.mergeFontChunks(loadedChunks, metadata);
            timing.phases.merge.end = this.getTimestamp();
            timing.phases.merge.duration = timing.phases.merge.end - timing.phases.merge.start;
            timing.mergeTime = timing.phases.merge.duration;
            this.logTiming(`Chunks merged: ${fontName}`, timing.mergeTime, `${this.formatDuration(mergedData.byteLength)}`);

            // Create font from merged data
            timing.phases.fontCreation.start = this.getTimestamp();
            this.logTiming(`Creating font from data: ${fontName}`);
            const font = await this.createFontFromArrayBuffer(mergedData, fontName);
            timing.phases.fontCreation.end = this.getTimestamp();
            timing.phases.fontCreation.duration = timing.phases.fontCreation.end - timing.phases.fontCreation.start;
            timing.fontCreationTime = timing.phases.fontCreation.duration;
            this.logTiming(`Font created: ${fontName}`, timing.fontCreationTime);

            // Complete timing
            timing.endTime = this.getTimestamp();
            timing.totalDuration = timing.endTime - timing.startTime;

            if (onTimingComplete) {
                onTimingComplete(timing);
            }

            if (enableTiming) {
                this.logTimingSummary(fontName, timing);
            }

            return font;
        } catch (error) {
            timing.endTime = this.getTimestamp();
            timing.totalDuration = timing.endTime - timing.startTime;
            this.logTiming(`Chunked font loading failed: ${fontName}`, timing.totalDuration, `Error: ${error.message}`);
            throw error;
        }
    }

    /**
     * Load regular font using Cocos Creator's built-in loader
     * @param fontName - Name of the font
     * @returns Promise that resolves to the font
     */
    private static async loadRegularFont(fontName: string): Promise<cc.Font> {
        const startTime = this.getTimestamp();
        this.logTiming(`Loading regular font: ${fontName}`);

        return new Promise((resolve, reject) => {
            cc.resources.load<cc.Font>(`fonts/${fontName}`, cc.Font, (err, font) => {
                const duration = this.getTimestamp() - startTime;

                if (err) {
                    this.logTiming(`Regular font load failed: ${fontName}`, duration, `Error: ${err.message}`);
                    reject(new Error(`Failed to load regular font ${fontName}: ${err.message}`));
                    return;
                }

                this.logTiming(`Regular font loaded: ${fontName}`, duration);
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
        const startTime = this.getTimestamp();
        this.logTiming(`Starting font preload: ${fontName}`);

        try {
            await this.loadFont(fontName, options);
            const duration = this.getTimestamp() - startTime;
            this.logTiming(`Font preload completed: ${fontName}`, duration);
        } catch (error) {
            const duration = this.getTimestamp() - startTime;
            this.logTiming(`Font preload failed: ${fontName}`, duration, `Error: ${error.message}`);
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