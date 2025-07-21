/**
 * Font Performance Comparison Example
 * Demonstrates how to compare single vs chunked font loading performance
 */

import { FontPerformanceComparator, FontComparisonResult } from '../assets/common/utils/FontPerformanceComparator';

const { ccclass, property } = cc._decorator;

@ccclass
export default class FontPerformanceComparisonExample extends cc.Component {
    @property(cc.Button)
    compareButton: cc.Button = null;

    @property(cc.Button)
    compareMultipleButton: cc.Button = null;

    @property(cc.ProgressBar)
    progressBar: cc.ProgressBar = null;

    @property(cc.Label)
    statusLabel: cc.Label = null;

    @property(cc.Label)
    resultLabel: cc.Label = null;

    @property(cc.ScrollView)
    logScrollView: cc.ScrollView = null;

    @property(cc.Label)
    logLabel: cc.Label = null;

    private isComparing = false;
    private logMessages: string[] = [];

    onLoad() {
        this.setupUI();
        this.addEventListeners();
    }

    private setupUI() {
        this.updateStatus('Ready to compare font loading performance');
        this.resultLabel.string = '';
        this.progressBar.progress = 0;
        this.logLabel.string = '';
    }

    private addEventListeners() {
        this.compareButton.node.on('click', this.onCompareSingleFont.bind(this));
        this.compareMultipleButton.node.on('click', this.onCompareMultipleFonts.bind(this));
    }

    /**
     * Compare single font performance
     */
    private async onCompareSingleFont() {
        if (this.isComparing) return;

        this.isComparing = true;
        this.compareButton.interactable = false;
        this.compareMultipleButton.interactable = false;

        try {
            this.updateStatus('Comparing PingFang-Bold font loading...');
            this.clearLogs();
            this.addLog('Starting performance comparison for PingFang-Bold');

            const result = await FontPerformanceComparator.compareFontLoading('PingFang-Bold', {
                enableDetailedLogging: true,
                timeout: 30000,
                onProgress: (progress) => {
                    this.updateProgress(progress);
                },
                onComparisonComplete: (result) => {
                    this.displayResults(result);
                }
            });

            this.displayResults(result);
            this.addLog('Comparison completed successfully');

        } catch (error) {
            this.updateStatus(`Comparison failed: ${error.message}`);
            this.addLog(`Error: ${error.message}`);
        } finally {
            this.isComparing = false;
            this.compareButton.interactable = true;
            this.compareMultipleButton.interactable = true;
        }
    }

    /**
     * Compare multiple fonts performance
     */
    private async onCompareMultipleFonts() {
        if (this.isComparing) return;

        this.isComparing = true;
        this.compareButton.interactable = false;
        this.compareMultipleButton.interactable = false;

        try {
            this.updateStatus('Comparing multiple fonts...');
            this.clearLogs();
            this.addLog('Starting multi-font performance comparison');

            const fontNames = ['PingFang-Bold', 'PingFang-Regular', 'NotoSans-Bold'];
            const results = await FontPerformanceComparator.compareMultipleFonts(fontNames, {
                enableDetailedLogging: true,
                timeout: 60000
            });

            this.displayMultiFontResults(results);
            this.addLog('Multi-font comparison completed');

        } catch (error) {
            this.updateStatus(`Multi-font comparison failed: ${error.message}`);
            this.addLog(`Error: ${error.message}`);
        } finally {
            this.isComparing = false;
            this.compareButton.interactable = true;
            this.compareMultipleButton.interactable = true;
        }
    }

    /**
     * Update progress display
     */
    private updateProgress(progress: { type: 'single' | 'chunked'; percentage: number; elapsedTime: number }) {
        const elapsedSeconds = (progress.elapsedTime / 1000).toFixed(1);
        this.updateStatus(`Loading ${progress.type} font: ${progress.percentage.toFixed(1)}% (${elapsedSeconds}s)`);
        this.progressBar.progress = progress.percentage / 100;
    }

    /**
     * Display single font comparison results
     */
    private displayResults(result: FontComparisonResult) {
        const { comparison, singleFont, chunkedFont } = result;

        let resultText = `=== FONT PERFORMANCE COMPARISON ===\n`;
        resultText += `Font: ${result.fontName}\n\n`;

        resultText += `OVERALL RESULT:\n`;
        resultText += `Winner: ${comparison.winner.toUpperCase()}\n`;
        resultText += `Time Improvement: ${comparison.timeImprovement.toFixed(1)}%\n`;
        resultText += `Speedup Factor: ${comparison.speedupFactor.toFixed(2)}x\n\n`;

        resultText += `DETAILED TIMING:\n`;
        if (singleFont.success) {
            resultText += `Single Font: ${(singleFont.timing!.totalDuration / 1000).toFixed(2)}s ✅\n`;
        } else {
            resultText += `Single Font: FAILED ❌\n`;
            resultText += `Error: ${singleFont.error}\n`;
        }

        if (chunkedFont.success) {
            resultText += `Chunked Font: ${(chunkedFont.timing!.totalDuration / 1000).toFixed(2)}s ✅\n`;
            if (chunkedFont.timing!.phases) {
                resultText += `  Metadata: ${(chunkedFont.timing!.metadataLoadTime! / 1000).toFixed(2)}s\n`;
                resultText += `  Chunks: ${(chunkedFont.timing!.phases.chunks.duration! / 1000).toFixed(2)}s\n`;
                resultText += `  Merge: ${(chunkedFont.timing!.mergeTime! / 1000).toFixed(2)}s\n`;
                resultText += `  Creation: ${(chunkedFont.timing!.fontCreationTime! / 1000).toFixed(2)}s\n`;
            }
        } else {
            resultText += `Chunked Font: FAILED ❌\n`;
            resultText += `Error: ${chunkedFont.error}\n`;
        }

        resultText += `\nRECOMMENDATION:\n${comparison.recommendation}\n`;
        resultText += `\nANALYSIS:\n${comparison.detailedAnalysis}`;

        this.resultLabel.string = resultText;
        this.updateStatus(`Comparison complete - ${comparison.winner.toUpperCase()} wins`);

        // Add detailed report to logs
        const detailedReport = FontPerformanceComparator.generateComparisonReport(result);
        this.addLog(detailedReport);
    }

    /**
     * Display multi-font comparison results
     */
    private displayMultiFontResults(results: FontComparisonResult[]) {
        const successfulComparisons = results.filter(r => r.singleFont.success && r.chunkedFont.success);
        const chunkedWins = successfulComparisons.filter(r => r.comparison.winner === 'chunked').length;
        const singleWins = successfulComparisons.filter(r => r.comparison.winner === 'single').length;
        const ties = successfulComparisons.filter(r => r.comparison.winner === 'tie').length;

        let resultText = `=== MULTI-FONT COMPARISON RESULTS ===\n`;
        resultText += `Total Fonts: ${results.length}\n`;
        resultText += `Successful Comparisons: ${successfulComparisons.length}\n\n`;

        resultText += `WINNERS:\n`;
        resultText += `Chunked Wins: ${chunkedWins}\n`;
        resultText += `Single Wins: ${singleWins}\n`;
        resultText += `Ties: ${ties}\n\n`;

        if (successfulComparisons.length > 0) {
            const avgImprovement = successfulComparisons.reduce((sum, r) => sum + r.comparison.timeImprovement, 0) / successfulComparisons.length;
            const avgSpeedup = successfulComparisons.reduce((sum, r) => sum + r.comparison.speedupFactor, 0) / successfulComparisons.length;

            resultText += `AVERAGE PERFORMANCE:\n`;
            resultText += `Time Improvement: ${avgImprovement.toFixed(1)}%\n`;
            resultText += `Speedup Factor: ${avgSpeedup.toFixed(2)}x\n\n`;
        }

        resultText += `INDIVIDUAL RESULTS:\n`;
        results.forEach((result, index) => {
            const status = result.singleFont.success && result.chunkedFont.success ? '✅' : '❌';
            const winner = result.comparison.winner.toUpperCase();
            const improvement = result.singleFont.success && result.chunkedFont.success
                ? `(${result.comparison.timeImprovement.toFixed(1)}%)`
                : '(failed)';

            resultText += `${index + 1}. ${result.fontName}: ${winner} ${improvement} ${status}\n`;
        });

        this.resultLabel.string = resultText;
        this.updateStatus(`Multi-font comparison complete - ${chunkedWins} chunked wins, ${singleWins} single wins`);

        // Add summary report to logs
        const summaryReport = FontPerformanceComparator.generateMultiFontReport(results);
        this.addLog(summaryReport);
    }

    /**
     * Update status display
     */
    private updateStatus(message: string) {
        this.statusLabel.string = message;
        this.addLog(`[STATUS] ${message}`);
    }

    /**
     * Add message to log
     */
    private addLog(message: string) {
        const timestamp = new Date().toLocaleTimeString();
        this.logMessages.push(`[${timestamp}] ${message}`);

        // Keep only last 50 messages
        if (this.logMessages.length > 50) {
            this.logMessages = this.logMessages.slice(-50);
        }

        this.updateLogDisplay();
    }

    /**
     * Clear logs
     */
    private clearLogs() {
        this.logMessages = [];
        this.updateLogDisplay();
    }

    /**
     * Update log display
     */
    private updateLogDisplay() {
        this.logLabel.string = this.logMessages.join('\n');

        // Auto-scroll to bottom
        if (this.logScrollView) {
            this.logScrollView.scrollToBottom(0.1);
        }
    }

    /**
     * Export comparison results
     */
    public exportResults() {
        if (this.logMessages.length === 0) {
            this.addLog('No results to export');
            return;
        }

        const report = this.logMessages.join('\n');
        const blob = new Blob([report], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `font-performance-comparison-${new Date().toISOString().slice(0, 19)}.txt`;
        a.click();

        URL.revokeObjectURL(url);
        this.addLog('Results exported to file');
    }

    /**
     * Clear results
     */
    public clearResults() {
        this.resultLabel.string = '';
        this.clearLogs();
        this.updateStatus('Results cleared');
    }

    /**
     * Run automated performance test
     */
    public async runAutomatedTest() {
        if (this.isComparing) return;

        this.isComparing = true;
        this.updateStatus('Running automated performance test...');
        this.clearLogs();

        try {
            // Test different font sizes and network conditions
            const testFonts = ['PingFang-Bold', 'PingFang-Regular'];
            const results = [];

            for (const fontName of testFonts) {
                this.addLog(`Testing ${fontName}...`);

                const result = await FontPerformanceComparator.compareFontLoading(fontName, {
                    enableDetailedLogging: true,
                    timeout: 30000
                });

                results.push(result);

                // Add delay between tests
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            // Generate comprehensive report
            const summaryReport = FontPerformanceComparator.generateMultiFontReport(results);
            this.addLog(summaryReport);

            this.updateStatus('Automated test completed');
            this.displayMultiFontResults(results);

        } catch (error) {
            this.updateStatus(`Automated test failed: ${error.message}`);
            this.addLog(`Error: ${error.message}`);
        } finally {
            this.isComparing = false;
        }
    }

    /**
     * Performance monitoring
     */
    public startPerformanceMonitoring() {
        this.addLog('Starting performance monitoring...');

        // Monitor font loading performance over time
        const monitorInterval = setInterval(async () => {
            if (this.isComparing) return;

            try {
                const result = await FontPerformanceComparator.compareFontLoading('PingFang-Bold', {
                    enableDetailedLogging: false,
                    timeout: 10000
                });

                const { comparison } = result;
                this.addLog(`Performance check: ${comparison.winner.toUpperCase()} wins (${comparison.timeImprovement.toFixed(1)}% improvement)`);

            } catch (error) {
                this.addLog(`Performance check failed: ${error.message}`);
            }
        }, 30000); // Check every 30 seconds

        // Store interval for cleanup
        this.node['monitorInterval'] = monitorInterval;
    }

    /**
     * Stop performance monitoring
     */
    public stopPerformanceMonitoring() {
        if (this.node['monitorInterval']) {
            clearInterval(this.node['monitorInterval']);
            this.node['monitorInterval'] = null;
            this.addLog('Performance monitoring stopped');
        }
    }

    onDestroy() {
        this.stopPerformanceMonitoring();
    }
} 