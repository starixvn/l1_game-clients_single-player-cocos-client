/**
 * Font Timing Analyzer
 * Analyzes font loading performance and provides optimization recommendations
 */

import { FontLoadTiming } from './ChunkedFontLoader';

export interface FontPerformanceMetrics {
    fontName: string;
    totalDuration: number;
    metadataLoadTime: number;
    chunkLoadTime: number;
    mergeTime: number;
    fontCreationTime: number;
    averageChunkTime: number;
    minChunkTime: number;
    maxChunkTime: number;
    chunkCount: number;
    totalSize: number;
    throughput: number; // bytes per second
    efficiency: number; // percentage of time spent on actual loading vs overhead
}

export interface PerformanceAnalysis {
    metrics: FontPerformanceMetrics;
    recommendations: string[];
    bottlenecks: string[];
    optimizationScore: number; // 0-100
}

export class FontTimingAnalyzer {
    private static readonly PERFORMANCE_THRESHOLDS = {
        EXCELLENT: 2000,    // < 2s
        GOOD: 5000,         // < 5s
        ACCEPTABLE: 10000,  // < 10s
        POOR: 15000         // > 15s
    };

    private static readonly BOTTLENECK_THRESHOLDS = {
        METADATA: 1000,     // > 1s for metadata
        CHUNK_AVERAGE: 2000, // > 2s average per chunk
        MERGE: 1000,        // > 1s for merge
        FONT_CREATION: 2000 // > 2s for font creation
    };

    /**
     * Analyze font loading performance
     */
    static analyzePerformance(timing: FontLoadTiming, fontName: string, totalSize?: number): PerformanceAnalysis {
        const metrics = this.calculateMetrics(timing, fontName, totalSize);
        const recommendations = this.generateRecommendations(metrics);
        const bottlenecks = this.identifyBottlenecks(metrics);
        const optimizationScore = this.calculateOptimizationScore(metrics);

        return {
            metrics,
            recommendations,
            bottlenecks,
            optimizationScore
        };
    }

    /**
     * Calculate performance metrics from timing data
     */
    private static calculateMetrics(timing: FontLoadTiming, fontName: string, totalSize?: number): FontPerformanceMetrics {
        const totalDuration = timing.totalDuration!;
        const metadataLoadTime = timing.metadataLoadTime!;
        const chunkLoadTime = timing.phases.chunks.duration!;
        const mergeTime = timing.mergeTime!;
        const fontCreationTime = timing.fontCreationTime!;
        const chunkCount = timing.chunkLoadTimes.length;

        const averageChunkTime = chunkCount > 0 ?
            timing.chunkLoadTimes.reduce((a, b) => a + b, 0) / chunkCount : 0;
        const minChunkTime = chunkCount > 0 ? Math.min(...timing.chunkLoadTimes) : 0;
        const maxChunkTime = chunkCount > 0 ? Math.max(...timing.chunkLoadTimes) : 0;

        const throughput = totalSize && totalDuration > 0 ? (totalSize / totalDuration) * 1000 : 0;
        const loadingTime = metadataLoadTime + chunkLoadTime + mergeTime;
        const efficiency = totalDuration > 0 ? (loadingTime / totalDuration) * 100 : 0;

        return {
            fontName,
            totalDuration,
            metadataLoadTime,
            chunkLoadTime,
            mergeTime,
            fontCreationTime,
            averageChunkTime,
            minChunkTime,
            maxChunkTime,
            chunkCount,
            totalSize: totalSize || 0,
            throughput,
            efficiency
        };
    }

    /**
     * Generate optimization recommendations
     */
    private static generateRecommendations(metrics: FontPerformanceMetrics): string[] {
        const recommendations: string[] = [];

        // Overall performance recommendations
        if (metrics.totalDuration > this.PERFORMANCE_THRESHOLDS.POOR) {
            recommendations.push("Consider reducing font file size or using font subsetting");
            recommendations.push("Implement font preloading during splash screen");
        } else if (metrics.totalDuration > this.PERFORMANCE_THRESHOLDS.ACCEPTABLE) {
            recommendations.push("Consider optimizing chunk size for better parallel loading");
        }

        // Chunk-specific recommendations
        if (metrics.averageChunkTime > this.BOTTLENECK_THRESHOLDS.CHUNK_AVERAGE) {
            recommendations.push("Reduce chunk size to improve parallel loading");
            recommendations.push("Check network conditions and server response times");
        }

        if (metrics.maxChunkTime > metrics.averageChunkTime * 3) {
            recommendations.push("Some chunks are loading much slower - check for network issues");
        }

        // Metadata recommendations
        if (metrics.metadataLoadTime > this.BOTTLENECK_THRESHOLDS.METADATA) {
            recommendations.push("Metadata loading is slow - consider caching metadata");
        }

        // Merge recommendations
        if (metrics.mergeTime > this.BOTTLENECK_THRESHOLDS.MERGE) {
            recommendations.push("Chunk merging is slow - consider optimizing merge algorithm");
        }

        // Font creation recommendations
        if (metrics.fontCreationTime > this.BOTTLENECK_THRESHOLDS.FONT_CREATION) {
            recommendations.push("Font creation is slow - consider pre-compiling fonts");
        }

        // Efficiency recommendations
        if (metrics.efficiency < 80) {
            recommendations.push("High overhead detected - optimize loading pipeline");
        }

        // Throughput recommendations
        if (metrics.throughput < 1000000) { // < 1MB/s
            recommendations.push("Low throughput detected - check network bandwidth");
        }

        return recommendations;
    }

    /**
     * Identify performance bottlenecks
     */
    private static identifyBottlenecks(metrics: FontPerformanceMetrics): string[] {
        const bottlenecks: string[] = [];

        if (metrics.metadataLoadTime > this.BOTTLENECK_THRESHOLDS.METADATA) {
            bottlenecks.push(`Metadata loading (${(metrics.metadataLoadTime / 1000).toFixed(2)}s)`);
        }

        if (metrics.averageChunkTime > this.BOTTLENECK_THRESHOLDS.CHUNK_AVERAGE) {
            bottlenecks.push(`Chunk loading (avg: ${(metrics.averageChunkTime / 1000).toFixed(2)}s)`);
        }

        if (metrics.mergeTime > this.BOTTLENECK_THRESHOLDS.MERGE) {
            bottlenecks.push(`Chunk merging (${(metrics.mergeTime / 1000).toFixed(2)}s)`);
        }

        if (metrics.fontCreationTime > this.BOTTLENECK_THRESHOLDS.FONT_CREATION) {
            bottlenecks.push(`Font creation (${(metrics.fontCreationTime / 1000).toFixed(2)}s)`);
        }

        if (metrics.efficiency < 80) {
            bottlenecks.push(`Low efficiency (${metrics.efficiency.toFixed(1)}%)`);
        }

        return bottlenecks;
    }

    /**
     * Calculate optimization score (0-100)
     */
    private static calculateOptimizationScore(metrics: FontPerformanceMetrics): number {
        let score = 100;

        // Deduct points for slow total duration
        if (metrics.totalDuration > this.PERFORMANCE_THRESHOLDS.POOR) {
            score -= 30;
        } else if (metrics.totalDuration > this.PERFORMANCE_THRESHOLDS.ACCEPTABLE) {
            score -= 15;
        } else if (metrics.totalDuration > this.PERFORMANCE_THRESHOLDS.GOOD) {
            score -= 5;
        }

        // Deduct points for bottlenecks
        if (metrics.metadataLoadTime > this.BOTTLENECK_THRESHOLDS.METADATA) score -= 10;
        if (metrics.averageChunkTime > this.BOTTLENECK_THRESHOLDS.CHUNK_AVERAGE) score -= 15;
        if (metrics.mergeTime > this.BOTTLENECK_THRESHOLDS.MERGE) score -= 10;
        if (metrics.fontCreationTime > this.BOTTLENECK_THRESHOLDS.FONT_CREATION) score -= 10;

        // Deduct points for low efficiency
        if (metrics.efficiency < 80) score -= 10;
        if (metrics.efficiency < 60) score -= 10;

        return Math.max(0, score);
    }

    /**
     * Generate detailed performance report
     */
    static generateReport(timing: FontLoadTiming, fontName: string, totalSize?: number): string {
        const analysis = this.analyzePerformance(timing, fontName, totalSize);
        const { metrics, recommendations, bottlenecks, optimizationScore } = analysis;

        let report = `\n=== FONT PERFORMANCE REPORT: ${fontName} ===\n`;
        report += `Optimization Score: ${optimizationScore}/100\n\n`;

        report += `TIMING BREAKDOWN:\n`;
        report += `  Total Duration: ${(metrics.totalDuration / 1000).toFixed(2)}s\n`;
        report += `  Metadata Load: ${(metrics.metadataLoadTime / 1000).toFixed(2)}s\n`;
        report += `  Chunk Loading: ${(metrics.chunkLoadTime / 1000).toFixed(2)}s\n`;
        report += `  Chunk Merge: ${(metrics.mergeTime / 1000).toFixed(2)}s\n`;
        report += `  Font Creation: ${(metrics.fontCreationTime / 1000).toFixed(2)}s\n\n`;

        report += `CHUNK PERFORMANCE:\n`;
        report += `  Total Chunks: ${metrics.chunkCount}\n`;
        report += `  Average Time: ${(metrics.averageChunkTime / 1000).toFixed(2)}s\n`;
        report += `  Min Time: ${(metrics.minChunkTime / 1000).toFixed(2)}s\n`;
        report += `  Max Time: ${(metrics.maxChunkTime / 1000).toFixed(2)}s\n\n`;

        if (metrics.totalSize > 0) {
            report += `THROUGHPUT:\n`;
            report += `  File Size: ${(metrics.totalSize / 1024 / 1024).toFixed(2)}MB\n`;
            report += `  Throughput: ${(metrics.throughput / 1024 / 1024).toFixed(2)}MB/s\n`;
            report += `  Efficiency: ${metrics.efficiency.toFixed(1)}%\n\n`;
        }

        if (bottlenecks.length > 0) {
            report += `BOTTLENECKS DETECTED:\n`;
            bottlenecks.forEach(bottleneck => {
                report += `  ⚠️  ${bottleneck}\n`;
            });
            report += `\n`;
        }

        if (recommendations.length > 0) {
            report += `OPTIMIZATION RECOMMENDATIONS:\n`;
            recommendations.forEach(rec => {
                report += `  💡 ${rec}\n`;
            });
            report += `\n`;
        }

        report += `=== END REPORT ===\n`;

        return report;
    }

    /**
     * Compare performance between different loading methods
     */
    static comparePerformance(
        chunkedTiming: FontLoadTiming,
        regularTiming: FontLoadTiming,
        fontName: string
    ): string {
        const chunkedAnalysis = this.analyzePerformance(chunkedTiming, fontName);
        const regularAnalysis = this.analyzePerformance(regularTiming, fontName);

        const timeImprovement = ((regularAnalysis.metrics.totalDuration - chunkedAnalysis.metrics.totalDuration) / regularAnalysis.metrics.totalDuration) * 100;

        let report = `\n=== PERFORMANCE COMPARISON: ${fontName} ===\n`;
        report += `Chunked Loading: ${(chunkedAnalysis.metrics.totalDuration / 1000).toFixed(2)}s\n`;
        report += `Regular Loading: ${(regularAnalysis.metrics.totalDuration / 1000).toFixed(2)}s\n`;
        report += `Improvement: ${timeImprovement.toFixed(1)}% faster\n\n`;

        report += `DETAILED COMPARISON:\n`;
        report += `  Metadata: ${(chunkedAnalysis.metrics.metadataLoadTime / 1000).toFixed(2)}s vs ${(regularAnalysis.metrics.metadataLoadTime / 1000).toFixed(2)}s\n`;
        report += `  Loading: ${(chunkedAnalysis.metrics.chunkLoadTime / 1000).toFixed(2)}s vs ${(regularAnalysis.metrics.chunkLoadTime / 1000).toFixed(2)}s\n`;
        report += `  Processing: ${(chunkedAnalysis.metrics.mergeTime / 1000).toFixed(2)}s vs ${(regularAnalysis.metrics.mergeTime / 1000).toFixed(2)}s\n`;
        report += `  Creation: ${(chunkedAnalysis.metrics.fontCreationTime / 1000).toFixed(2)}s vs ${(regularAnalysis.metrics.fontCreationTime / 1000).toFixed(2)}s\n\n`;

        report += `=== END COMPARISON ===\n`;

        return report;
    }
} 