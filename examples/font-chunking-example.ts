/**
 * Font Chunking System - Practical Example
 * Demonstrates how to use the chunked font loading system in a Cocos Creator project
 */

import ChunkedFontLoader, { FontLoadProgress } from '../assets/common/utils/ChunkedFontLoader';

const { ccclass, property } = cc._decorator;

@ccclass
export default class FontChunkingExample extends cc.Component {
    @property(cc.Label)
    statusLabel: cc.Label = null;

    @property(cc.ProgressBar)
    progressBar: cc.ProgressBar = null;

    @property(cc.Button)
    loadButton: cc.Button = null;

    @property(cc.Button)
    preloadButton: cc.Button = null;

    private isLoading = false;

    onLoad() {
        this.setupUI();
        this.checkFontAvailability();
    }

    /**
     * Setup UI components and event listeners
     */
    private setupUI() {
        if (this.loadButton) {
            this.loadButton.node.on('click', this.onLoadFontClicked, this);
        }

        if (this.preloadButton) {
            this.preloadButton.node.on('click', this.onPreloadFontClicked, this);
        }

        this.updateStatus('Ready to load fonts');
    }

    /**
     * Check if chunked fonts are available
     */
    private async checkFontAvailability() {
        try {
            const isChunkedAvailable = await ChunkedFontLoader.isChunkedFontAvailable('PingFang-Bold');
            const stats = await ChunkedFontLoader.getFontLoadingStats('PingFang-Bold');

            if (isChunkedAvailable) {
                this.updateStatus(`Chunked font available: ${stats.totalChunks} chunks, ${this.formatBytes(stats.totalSize)}`);
                console.log('[Example] Font loading stats:', stats);
            } else {
                this.updateStatus('Chunked font not available, will use regular loading');
            }
        } catch (error) {
            console.warn('[Example] Error checking font availability:', error);
            this.updateStatus('Error checking font availability');
        }
    }

    /**
     * Handle load font button click
     */
    private async onLoadFontClicked() {
        if (this.isLoading) {
            return;
        }

        this.isLoading = true;
        this.updateStatus('Loading font...');
        this.setButtonsEnabled(false);

        try {
            const startTime = performance.now();

            const font = await ChunkedFontLoader.loadFont('PingFang-Bold', {
                useChunkedFont: true,
                fallbackToRegular: true,
                timeout: 30000,
                onProgress: this.onFontLoadProgress.bind(this)
            });

            const loadTime = performance.now() - startTime;

            this.updateStatus(`Font loaded successfully in ${loadTime.toFixed(2)}ms`);
            console.log('[Example] Font loaded:', font);

            // Apply the font to a label component
            this.applyFontToLabel(font);

        } catch (error) {
            console.error('[Example] Font loading failed:', error);
            this.updateStatus(`Font loading failed: ${error.message}`);
        } finally {
            this.isLoading = false;
            this.setButtonsEnabled(true);
            this.resetProgress();
        }
    }

    /**
     * Handle preload font button click
     */
    private async onPreloadFontClicked() {
        if (this.isLoading) {
            return;
        }

        this.isLoading = true;
        this.updateStatus('Preloading font...');
        this.setButtonsEnabled(false);

        try {
            await ChunkedFontLoader.preloadFont('PingFang-Bold', {
                useChunkedFont: true,
                onProgress: this.onFontLoadProgress.bind(this)
            });

            this.updateStatus('Font preloaded successfully');
            console.log('[Example] Font preloaded successfully');

        } catch (error) {
            console.warn('[Example] Font preloading failed:', error);
            this.updateStatus('Font preloading failed (non-critical)');
        } finally {
            this.isLoading = false;
            this.setButtonsEnabled(true);
            this.resetProgress();
        }
    }

    /**
     * Handle font loading progress updates
     */
    private onFontLoadProgress(progress: FontLoadProgress) {
        console.log(`[Example] Font loading progress: ${progress.percentage.toFixed(1)}% (${progress.currentChunk}/${progress.totalChunks})`);

        if (this.progressBar) {
            this.progressBar.progress = progress.percentage / 100;
        }

        this.updateStatus(`Loading font: ${progress.percentage.toFixed(1)}% (${progress.currentChunk}/${progress.totalChunks})`);
    }

    /**
     * Apply loaded font to a label component
     */
    private applyFontToLabel(font: cc.Font) {
        if (this.statusLabel) {
            this.statusLabel.font = font;
            this.statusLabel.string = 'Font applied successfully!';
        }
    }

    /**
     * Update status label
     */
    private updateStatus(message: string) {
        if (this.statusLabel) {
            this.statusLabel.string = message;
        }
        console.log('[Example] Status:', message);
    }

    /**
     * Enable/disable buttons
     */
    private setButtonsEnabled(enabled: boolean) {
        if (this.loadButton) {
            this.loadButton.interactable = enabled;
        }
        if (this.preloadButton) {
            this.preloadButton.interactable = enabled;
        }
    }

    /**
     * Reset progress bar
     */
    private resetProgress() {
        if (this.progressBar) {
            this.progressBar.progress = 0;
        }
    }

    /**
     * Format bytes to human readable format
     */
    private formatBytes(bytes: number): string {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Example of loading multiple fonts with different strategies
     */
    async loadMultipleFonts() {
        const fonts = ['PingFang-Bold', 'PingFang-Regular', 'NotoSans-Bold'];
        const results = [];

        for (const fontName of fonts) {
            try {
                console.log(`[Example] Loading font: ${fontName}`);

                const font = await ChunkedFontLoader.loadFont(fontName, {
                    useChunkedFont: true,
                    fallbackToRegular: true,
                    onProgress: (progress) => {
                        console.log(`[Example] ${fontName}: ${progress.percentage.toFixed(1)}%`);
                    }
                });

                results.push({ fontName, success: true, font });
                console.log(`[Example] Successfully loaded: ${fontName}`);

            } catch (error) {
                results.push({ fontName, success: false, error: error.message });
                console.error(`[Example] Failed to load: ${fontName}`, error);
            }
        }

        console.log('[Example] Font loading results:', results);
        return results;
    }

    /**
     * Example of performance comparison between chunked and regular loading
     */
    async compareLoadingPerformance() {
        const fontName = 'PingFang-Bold';
        const iterations = 3;

        console.log('[Example] Starting performance comparison...');

        // Test chunked loading
        let chunkedTotalTime = 0;
        for (let i = 0; i < iterations; i++) {
            const startTime = performance.now();
            try {
                await ChunkedFontLoader.loadFont(fontName, { useChunkedFont: true });
                const loadTime = performance.now() - startTime;
                chunkedTotalTime += loadTime;
                console.log(`[Example] Chunked load ${i + 1}: ${loadTime.toFixed(2)}ms`);
            } catch (error) {
                console.error(`[Example] Chunked load ${i + 1} failed:`, error);
            }
        }

        // Test regular loading
        let regularTotalTime = 0;
        for (let i = 0; i < iterations; i++) {
            const startTime = performance.now();
            try {
                await ChunkedFontLoader.loadFont(fontName, { useChunkedFont: false });
                const loadTime = performance.now() - startTime;
                regularTotalTime += loadTime;
                console.log(`[Example] Regular load ${i + 1}: ${loadTime.toFixed(2)}ms`);
            } catch (error) {
                console.error(`[Example] Regular load ${i + 1} failed:`, error);
            }
        }

        const chunkedAvg = chunkedTotalTime / iterations;
        const regularAvg = regularTotalTime / iterations;
        const improvement = ((regularAvg - chunkedAvg) / regularAvg) * 100;

        console.log('[Example] Performance comparison results:');
        console.log(`[Example] Chunked average: ${chunkedAvg.toFixed(2)}ms`);
        console.log(`[Example] Regular average: ${regularAvg.toFixed(2)}ms`);
        console.log(`[Example] Improvement: ${improvement.toFixed(1)}%`);

        return {
            chunkedAverage: chunkedAvg,
            regularAverage: regularAvg,
            improvement: improvement
        };
    }

    /**
     * Example of error handling and recovery
     */
    async demonstrateErrorHandling() {
        console.log('[Example] Demonstrating error handling...');

        try {
            // Try to load a non-existent font
            await ChunkedFontLoader.loadFont('NonExistentFont', {
                useChunkedFont: true,
                fallbackToRegular: false
            });
        } catch (error) {
            console.log('[Example] Expected error caught:', error.message);

            // Try with fallback enabled
            try {
                await ChunkedFontLoader.loadFont('NonExistentFont', {
                    useChunkedFont: true,
                    fallbackToRegular: true
                });
            } catch (fallbackError) {
                console.log('[Example] Fallback also failed:', fallbackError.message);
            }
        }

        // Test timeout handling
        try {
            await ChunkedFontLoader.loadFont('PingFang-Bold', {
                useChunkedFont: true,
                timeout: 1 // 1ms timeout (will likely fail)
            });
        } catch (timeoutError) {
            console.log('[Example] Timeout error caught:', timeoutError.message);
        }
    }

    onDestroy() {
        // Clean up event listeners
        if (this.loadButton) {
            this.loadButton.node.off('click', this.onLoadFontClicked, this);
        }
        if (this.preloadButton) {
            this.preloadButton.node.off('click', this.onPreloadFontClicked, this);
        }
    }
} 