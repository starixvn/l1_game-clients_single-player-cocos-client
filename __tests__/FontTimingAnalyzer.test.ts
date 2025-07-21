/**
 * Font Timing Analyzer Tests
 * Tests the performance analysis and optimization recommendations
 */

import { FontTimingAnalyzer } from '../assets/common/utils/FontTimingAnalyzer';
import { FontLoadTiming } from '../assets/common/utils/ChunkedFontLoader';

describe('FontTimingAnalyzer', () => {
    describe('Performance Analysis', () => {
        it('should analyze excellent performance correctly', () => {
            // Arrange
            const timing: FontLoadTiming = {
                startTime: 1000,
                endTime: 2500,
                totalDuration: 1500,
                metadataLoadTime: 200,
                chunkLoadTimes: [100, 120, 110, 130, 140],
                mergeTime: 300,
                fontCreationTime: 400,
                phases: {
                    metadata: { start: 1000, end: 1200, duration: 200 },
                    chunks: { start: 1200, end: 1700, duration: 500 },
                    merge: { start: 1700, end: 2000, duration: 300 },
                    fontCreation: { start: 2000, end: 2400, duration: 400 }
                }
            };

            // Act
            const analysis = FontTimingAnalyzer.analyzePerformance(timing, 'PingFang-Bold', 10 * 1024 * 1024);

            // Assert
            expect(analysis.optimizationScore).toBeGreaterThan(90);
            expect(analysis.bottlenecks).toHaveLength(0);
            expect(analysis.recommendations).toHaveLength(0);
            expect(analysis.metrics.totalDuration).toBe(1500);
            expect(analysis.metrics.averageChunkTime).toBeCloseTo(120, 0);
        });

        it('should identify bottlenecks in slow performance', () => {
            // Arrange
            const timing: FontLoadTiming = {
                startTime: 1000,
                endTime: 20000,
                totalDuration: 19000,
                metadataLoadTime: 2000,
                chunkLoadTimes: [3000, 2800, 3200, 2900, 3100],
                mergeTime: 2000,
                fontCreationTime: 3000,
                phases: {
                    metadata: { start: 1000, end: 3000, duration: 2000 },
                    chunks: { start: 3000, end: 18000, duration: 15000 },
                    merge: { start: 18000, end: 20000, duration: 2000 },
                    fontCreation: { start: 20000, end: 23000, duration: 3000 }
                }
            };

            // Act
            const analysis = FontTimingAnalyzer.analyzePerformance(timing, 'PingFang-Bold');

            // Assert
            expect(analysis.optimizationScore).toBeLessThan(50);
            expect(analysis.bottlenecks.length).toBeGreaterThan(0);
            expect(analysis.recommendations.length).toBeGreaterThan(0);
            expect(analysis.metrics.totalDuration).toBe(19000);
        });

        it('should calculate throughput correctly', () => {
            // Arrange
            const fileSize = 10 * 1024 * 1024; // 10MB
            const timing: FontLoadTiming = {
                startTime: 1000,
                endTime: 3000,
                totalDuration: 2000,
                metadataLoadTime: 200,
                chunkLoadTimes: [100, 120, 110, 130, 140],
                mergeTime: 300,
                fontCreationTime: 400,
                phases: {
                    metadata: { start: 1000, end: 1200, duration: 200 },
                    chunks: { start: 1200, end: 1700, duration: 500 },
                    merge: { start: 1700, end: 2000, duration: 300 },
                    fontCreation: { start: 2000, end: 2400, duration: 400 }
                }
            };

            // Act
            const analysis = FontTimingAnalyzer.analyzePerformance(timing, 'PingFang-Bold', fileSize);

            // Assert
            expect(analysis.metrics.throughput).toBeCloseTo(5 * 1024 * 1024, 0); // 5MB/s
            expect(analysis.metrics.totalSize).toBe(fileSize);
        });

        it('should calculate efficiency correctly', () => {
            // Arrange
            const timing: FontLoadTiming = {
                startTime: 1000,
                endTime: 2000,
                totalDuration: 1000,
                metadataLoadTime: 100,
                chunkLoadTimes: [200, 180, 220],
                mergeTime: 150,
                fontCreationTime: 200,
                phases: {
                    metadata: { start: 1000, end: 1100, duration: 100 },
                    chunks: { start: 1100, end: 1600, duration: 500 },
                    merge: { start: 1600, end: 1750, duration: 150 },
                    fontCreation: { start: 1750, end: 1950, duration: 200 }
                }
            };

            // Act
            const analysis = FontTimingAnalyzer.analyzePerformance(timing, 'PingFang-Bold');

            // Assert
            expect(analysis.metrics.efficiency).toBeCloseTo(95, 0); // 95% efficiency
        });
    });

    describe('Bottleneck Detection', () => {
        it('should detect slow metadata loading', () => {
            // Arrange
            const timing: FontLoadTiming = {
                startTime: 1000,
                endTime: 3000,
                totalDuration: 2000,
                metadataLoadTime: 1500, // > 1000ms threshold
                chunkLoadTimes: [100, 120, 110],
                mergeTime: 200,
                fontCreationTime: 200,
                phases: {
                    metadata: { start: 1000, end: 2500, duration: 1500 },
                    chunks: { start: 2500, end: 2800, duration: 300 },
                    merge: { start: 2800, end: 3000, duration: 200 },
                    fontCreation: { start: 3000, end: 3200, duration: 200 }
                }
            };

            // Act
            const analysis = FontTimingAnalyzer.analyzePerformance(timing, 'PingFang-Bold');

            // Assert
            expect(analysis.bottlenecks).toContain(expect.stringContaining('Metadata loading'));
        });

        it('should detect slow chunk loading', () => {
            // Arrange
            const timing: FontLoadTiming = {
                startTime: 1000,
                endTime: 5000,
                totalDuration: 4000,
                metadataLoadTime: 200,
                chunkLoadTimes: [2500, 2400, 2600], // > 2000ms average
                mergeTime: 300,
                fontCreationTime: 400,
                phases: {
                    metadata: { start: 1000, end: 1200, duration: 200 },
                    chunks: { start: 1200, end: 3700, duration: 2500 },
                    merge: { start: 3700, end: 4000, duration: 300 },
                    fontCreation: { start: 4000, end: 4400, duration: 400 }
                }
            };

            // Act
            const analysis = FontTimingAnalyzer.analyzePerformance(timing, 'PingFang-Bold');

            // Assert
            expect(analysis.bottlenecks).toContain(expect.stringContaining('Chunk loading'));
        });

        it('should detect slow merge operation', () => {
            // Arrange
            const timing: FontLoadTiming = {
                startTime: 1000,
                endTime: 3000,
                totalDuration: 2000,
                metadataLoadTime: 200,
                chunkLoadTimes: [100, 120, 110],
                mergeTime: 1500, // > 1000ms threshold
                fontCreationTime: 200,
                phases: {
                    metadata: { start: 1000, end: 1200, duration: 200 },
                    chunks: { start: 1200, end: 1500, duration: 300 },
                    merge: { start: 1500, end: 3000, duration: 1500 },
                    fontCreation: { start: 3000, end: 3200, duration: 200 }
                }
            };

            // Act
            const analysis = FontTimingAnalyzer.analyzePerformance(timing, 'PingFang-Bold');

            // Assert
            expect(analysis.bottlenecks).toContain(expect.stringContaining('Chunk merging'));
        });

        it('should detect low efficiency', () => {
            // Arrange
            const timing: FontLoadTiming = {
                startTime: 1000,
                endTime: 2000,
                totalDuration: 1000,
                metadataLoadTime: 50,
                chunkLoadTimes: [100, 120, 110],
                mergeTime: 50,
                fontCreationTime: 50,
                phases: {
                    metadata: { start: 1000, end: 1050, duration: 50 },
                    chunks: { start: 1050, end: 1300, duration: 250 },
                    merge: { start: 1300, end: 1350, duration: 50 },
                    fontCreation: { start: 1350, end: 1400, duration: 50 }
                }
            };

            // Act
            const analysis = FontTimingAnalyzer.analyzePerformance(timing, 'PingFang-Bold');

            // Assert
            expect(analysis.metrics.efficiency).toBeLessThan(80);
            expect(analysis.bottlenecks).toContain(expect.stringContaining('Low efficiency'));
        });
    });

    describe('Optimization Score Calculation', () => {
        it('should give high score for excellent performance', () => {
            // Arrange
            const timing: FontLoadTiming = {
                startTime: 1000,
                endTime: 2000,
                totalDuration: 1000, // < 2s
                metadataLoadTime: 100,
                chunkLoadTimes: [50, 60, 70],
                mergeTime: 100,
                fontCreationTime: 100,
                phases: {
                    metadata: { start: 1000, end: 1100, duration: 100 },
                    chunks: { start: 1100, end: 1300, duration: 200 },
                    merge: { start: 1300, end: 1400, duration: 100 },
                    fontCreation: { start: 1400, end: 1500, duration: 100 }
                }
            };

            // Act
            const analysis = FontTimingAnalyzer.analyzePerformance(timing, 'PingFang-Bold');

            // Assert
            expect(analysis.optimizationScore).toBeGreaterThan(90);
        });

        it('should give low score for poor performance', () => {
            // Arrange
            const timing: FontLoadTiming = {
                startTime: 1000,
                endTime: 20000,
                totalDuration: 19000, // > 15s
                metadataLoadTime: 2000,
                chunkLoadTimes: [3000, 2800, 3200],
                mergeTime: 2000,
                fontCreationTime: 3000,
                phases: {
                    metadata: { start: 1000, end: 3000, duration: 2000 },
                    chunks: { start: 3000, end: 12000, duration: 9000 },
                    merge: { start: 12000, end: 14000, duration: 2000 },
                    fontCreation: { start: 14000, end: 17000, duration: 3000 }
                }
            };

            // Act
            const analysis = FontTimingAnalyzer.analyzePerformance(timing, 'PingFang-Bold');

            // Assert
            expect(analysis.optimizationScore).toBeLessThan(50);
        });

        it('should deduct points for multiple bottlenecks', () => {
            // Arrange
            const timing: FontLoadTiming = {
                startTime: 1000,
                endTime: 10000,
                totalDuration: 9000,
                metadataLoadTime: 1500, // > 1000ms
                chunkLoadTimes: [2500, 2400, 2600], // > 2000ms average
                mergeTime: 1500, // > 1000ms
                fontCreationTime: 2500, // > 2000ms
                phases: {
                    metadata: { start: 1000, end: 2500, duration: 1500 },
                    chunks: { start: 2500, end: 7000, duration: 4500 },
                    merge: { start: 7000, end: 8500, duration: 1500 },
                    fontCreation: { start: 8500, end: 11000, duration: 2500 }
                }
            };

            // Act
            const analysis = FontTimingAnalyzer.analyzePerformance(timing, 'PingFang-Bold');

            // Assert
            expect(analysis.optimizationScore).toBeLessThan(40);
            expect(analysis.bottlenecks.length).toBeGreaterThan(3);
        });
    });

    describe('Report Generation', () => {
        it('should generate comprehensive performance report', () => {
            // Arrange
            const timing: FontLoadTiming = {
                startTime: 1000,
                endTime: 5000,
                totalDuration: 4000,
                metadataLoadTime: 500,
                chunkLoadTimes: [800, 900, 700, 850],
                mergeTime: 600,
                fontCreationTime: 550,
                phases: {
                    metadata: { start: 1000, end: 1500, duration: 500 },
                    chunks: { start: 1500, end: 3850, duration: 2350 },
                    merge: { start: 3850, end: 4450, duration: 600 },
                    fontCreation: { start: 4450, end: 5000, duration: 550 }
                }
            };

            // Act
            const report = FontTimingAnalyzer.generateReport(timing, 'PingFang-Bold', 5 * 1024 * 1024);

            // Assert
            expect(report).toContain('FONT PERFORMANCE REPORT: PingFang-Bold');
            expect(report).toContain('TIMING BREAKDOWN');
            expect(report).toContain('CHUNK PERFORMANCE');
            expect(report).toContain('THROUGHPUT');
            expect(report).toContain('4.00s'); // Total duration
            expect(report).toContain('4 chunks'); // Chunk count
        });

        it('should include bottlenecks in report', () => {
            // Arrange
            const timing: FontLoadTiming = {
                startTime: 1000,
                endTime: 8000,
                totalDuration: 7000,
                metadataLoadTime: 1500, // Bottleneck
                chunkLoadTimes: [1200, 1100, 1300],
                mergeTime: 800,
                fontCreationTime: 600,
                phases: {
                    metadata: { start: 1000, end: 2500, duration: 1500 },
                    chunks: { start: 2500, end: 5200, duration: 2700 },
                    merge: { start: 5200, end: 6000, duration: 800 },
                    fontCreation: { start: 6000, end: 6600, duration: 600 }
                }
            };

            // Act
            const report = FontTimingAnalyzer.generateReport(timing, 'PingFang-Bold');

            // Assert
            expect(report).toContain('BOTTLENECKS DETECTED');
            expect(report).toContain('⚠️');
            expect(report).toContain('Metadata loading');
        });

        it('should include recommendations in report', () => {
            // Arrange
            const timing: FontLoadTiming = {
                startTime: 1000,
                endTime: 15000,
                totalDuration: 14000, // Poor performance
                metadataLoadTime: 1000,
                chunkLoadTimes: [2000, 1800, 2200],
                mergeTime: 1000,
                fontCreationTime: 1000,
                phases: {
                    metadata: { start: 1000, end: 2000, duration: 1000 },
                    chunks: { start: 2000, end: 8000, duration: 6000 },
                    merge: { start: 8000, end: 9000, duration: 1000 },
                    fontCreation: { start: 9000, end: 10000, duration: 1000 }
                }
            };

            // Act
            const report = FontTimingAnalyzer.generateReport(timing, 'PingFang-Bold');

            // Assert
            expect(report).toContain('OPTIMIZATION RECOMMENDATIONS');
            expect(report).toContain('💡');
            expect(report).toContain('Consider reducing font file size');
        });
    });

    describe('Performance Comparison', () => {
        it('should compare chunked vs regular loading', () => {
            // Arrange
            const chunkedTiming: FontLoadTiming = {
                startTime: 1000,
                endTime: 3000,
                totalDuration: 2000,
                metadataLoadTime: 200,
                chunkLoadTimes: [300, 280, 320],
                mergeTime: 400,
                fontCreationTime: 300,
                phases: {
                    metadata: { start: 1000, end: 1200, duration: 200 },
                    chunks: { start: 1200, end: 2100, duration: 900 },
                    merge: { start: 2100, end: 2500, duration: 400 },
                    fontCreation: { start: 2500, end: 2800, duration: 300 }
                }
            };

            const regularTiming: FontLoadTiming = {
                startTime: 1000,
                endTime: 5000,
                totalDuration: 4000,
                metadataLoadTime: 0,
                chunkLoadTimes: [4000],
                mergeTime: 0,
                fontCreationTime: 0,
                phases: {
                    metadata: { start: 1000, end: 1000, duration: 0 },
                    chunks: { start: 1000, end: 5000, duration: 4000 },
                    merge: { start: 5000, end: 5000, duration: 0 },
                    fontCreation: { start: 5000, end: 5000, duration: 0 }
                }
            };

            // Act
            const comparison = FontTimingAnalyzer.comparePerformance(chunkedTiming, regularTiming, 'PingFang-Bold');

            // Assert
            expect(comparison).toContain('PERFORMANCE COMPARISON: PingFang-Bold');
            expect(comparison).toContain('2.00s'); // Chunked time
            expect(comparison).toContain('4.00s'); // Regular time
            expect(comparison).toContain('50.0% faster'); // Improvement
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty chunk array', () => {
            // Arrange
            const timing: FontLoadTiming = {
                startTime: 1000,
                endTime: 2000,
                totalDuration: 1000,
                metadataLoadTime: 200,
                chunkLoadTimes: [],
                mergeTime: 300,
                fontCreationTime: 500,
                phases: {
                    metadata: { start: 1000, end: 1200, duration: 200 },
                    chunks: { start: 1200, end: 1200, duration: 0 },
                    merge: { start: 1200, end: 1500, duration: 300 },
                    fontCreation: { start: 1500, end: 2000, duration: 500 }
                }
            };

            // Act
            const analysis = FontTimingAnalyzer.analyzePerformance(timing, 'PingFang-Bold');

            // Assert
            expect(analysis.metrics.averageChunkTime).toBe(0);
            expect(analysis.metrics.minChunkTime).toBe(0);
            expect(analysis.metrics.maxChunkTime).toBe(0);
            expect(analysis.metrics.chunkCount).toBe(0);
        });

        it('should handle zero duration', () => {
            // Arrange
            const timing: FontLoadTiming = {
                startTime: 1000,
                endTime: 1000,
                totalDuration: 0,
                metadataLoadTime: 0,
                chunkLoadTimes: [0, 0, 0],
                mergeTime: 0,
                fontCreationTime: 0,
                phases: {
                    metadata: { start: 1000, end: 1000, duration: 0 },
                    chunks: { start: 1000, end: 1000, duration: 0 },
                    merge: { start: 1000, end: 1000, duration: 0 },
                    fontCreation: { start: 1000, end: 1000, duration: 0 }
                }
            };

            // Act
            const analysis = FontTimingAnalyzer.analyzePerformance(timing, 'PingFang-Bold');

            // Assert
            expect(analysis.metrics.throughput).toBe(0);
            expect(analysis.metrics.efficiency).toBe(0);
        });

        it('should handle missing timing data', () => {
            // Arrange
            const timing: FontLoadTiming = {
                startTime: 1000,
                chunkLoadTimes: [],
                phases: {
                    metadata: { start: 1000 },
                    chunks: { start: 1000 },
                    merge: { start: 1000 },
                    fontCreation: { start: 1000 }
                }
            };

            // Act & Assert
            expect(() => {
                FontTimingAnalyzer.analyzePerformance(timing, 'PingFang-Bold');
            }).toThrow();
        });
    });
}); 