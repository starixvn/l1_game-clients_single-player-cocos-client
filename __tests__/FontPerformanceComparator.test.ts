/**
 * Font Performance Comparator Tests
 * Tests the performance comparison between single and chunked font loading
 */

import { FontPerformanceComparator, FontComparisonResult } from '../assets/common/utils/FontPerformanceComparator';
import ChunkedFontLoader from '../assets/common/utils/ChunkedFontLoader';

// Mock ChunkedFontLoader
jest.mock('../assets/common/utils/ChunkedFontLoader');
const MockChunkedFontLoader = ChunkedFontLoader as jest.Mocked<typeof ChunkedFontLoader>;

describe('FontPerformanceComparator', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Single Font Loading', () => {
        it('should load single font successfully', async () => {
            // Arrange
            const mockFont = {} as cc.Font;
            MockChunkedFontLoader.loadFont.mockResolvedValueOnce(mockFont);

            // Act
            const result = await FontPerformanceComparator['loadSingleFont']('PingFang-Bold', true);

            // Assert
            expect(result.success).toBe(true);
            expect(result.timing).toBeDefined();
            expect(result.timing!.totalDuration).toBeGreaterThan(0);
        });

        it('should handle single font loading failure', async () => {
            // Arrange
            MockChunkedFontLoader.loadFont.mockRejectedValueOnce(new Error('Font not found'));

            // Act
            const result = await FontPerformanceComparator['loadSingleFont']('InvalidFont', true);

            // Assert
            expect(result.success).toBe(false);
            expect(result.error).toBe('Font not found');
            expect(result.timing).toBeDefined();
        });

        it('should track timing for single font loading', async () => {
            // Arrange
            const mockFont = {} as cc.Font;
            MockChunkedFontLoader.loadFont.mockResolvedValueOnce(mockFont);

            // Act
            const result = await FontPerformanceComparator['loadSingleFont']('PingFang-Bold', true);

            // Assert
            expect(result.timing!.phases.metadata.duration).toBe(0);
            expect(result.timing!.phases.chunks.duration).toBeGreaterThan(0);
            expect(result.timing!.totalDuration).toBeGreaterThan(0);
        });
    });

    describe('Chunked Font Loading', () => {
        it('should load chunked font successfully', async () => {
            // Arrange
            const mockFont = {} as cc.Font;
            MockChunkedFontLoader.loadFont.mockResolvedValueOnce(mockFont);

            // Act
            const result = await FontPerformanceComparator['loadChunkedFont']('PingFang-Bold', true);

            // Assert
            expect(result.success).toBe(true);
            expect(result.timing).toBeDefined();
            expect(MockChunkedFontLoader.loadFont).toHaveBeenCalledWith('PingFang-Bold', {
                useChunkedFont: true,
                fallbackToRegular: false,
                enableTiming: true,
                onProgress: expect.any(Function),
                onTimingComplete: expect.any(Function)
            });
        });

        it('should handle chunked font loading failure', async () => {
            // Arrange
            MockChunkedFontLoader.loadFont.mockRejectedValueOnce(new Error('Chunked font not available'));

            // Act
            const result = await FontPerformanceComparator['loadChunkedFont']('PingFang-Bold', true);

            // Assert
            expect(result.success).toBe(false);
            expect(result.error).toBe('Chunked font not available');
            expect(result.timing).toBeDefined();
        });
    });

    describe('Performance Comparison', () => {
        it('should compare successful single vs chunked loading', async () => {
            // Arrange
            const mockFont = {} as cc.Font;
            MockChunkedFontLoader.loadFont
                .mockResolvedValueOnce(mockFont) // Single font
                .mockResolvedValueOnce(mockFont); // Chunked font

            // Act
            const result = await FontPerformanceComparator.compareFontLoading('PingFang-Bold', {
                enableDetailedLogging: false
            });

            // Assert
            expect(result.singleFont.success).toBe(true);
            expect(result.chunkedFont.success).toBe(true);
            expect(result.comparison.winner).toBeDefined();
            expect(result.comparison.timeImprovement).toBeDefined();
            expect(result.comparison.speedupFactor).toBeDefined();
        });

        it('should handle single font failure', async () => {
            // Arrange
            const mockFont = {} as cc.Font;
            MockChunkedFontLoader.loadFont
                .mockRejectedValueOnce(new Error('Single font failed'))
                .mockResolvedValueOnce(mockFont);

            // Act
            const result = await FontPerformanceComparator.compareFontLoading('PingFang-Bold', {
                enableDetailedLogging: false
            });

            // Assert
            expect(result.singleFont.success).toBe(false);
            expect(result.chunkedFont.success).toBe(true);
            expect(result.comparison.winner).toBe('chunked');
            expect(result.comparison.timeImprovement).toBe(100);
        });

        it('should handle chunked font failure', async () => {
            // Arrange
            const mockFont = {} as cc.Font;
            MockChunkedFontLoader.loadFont
                .mockResolvedValueOnce(mockFont)
                .mockRejectedValueOnce(new Error('Chunked font failed'));

            // Act
            const result = await FontPerformanceComparator.compareFontLoading('PingFang-Bold', {
                enableDetailedLogging: false
            });

            // Assert
            expect(result.singleFont.success).toBe(true);
            expect(result.chunkedFont.success).toBe(false);
            expect(result.comparison.winner).toBe('single');
            expect(result.comparison.timeImprovement).toBe(-100);
        });

        it('should handle both fonts failing', async () => {
            // Arrange
            MockChunkedFontLoader.loadFont
                .mockRejectedValueOnce(new Error('Single font failed'))
                .mockRejectedValueOnce(new Error('Chunked font failed'));

            // Act
            const result = await FontPerformanceComparator.compareFontLoading('PingFang-Bold', {
                enableDetailedLogging: false
            });

            // Assert
            expect(result.singleFont.success).toBe(false);
            expect(result.chunkedFont.success).toBe(false);
            expect(result.comparison.winner).toBe('tie');
            expect(result.comparison.recommendation).toContain('Both loading methods failed');
        });

        it('should respect timeout settings', async () => {
            // Arrange
            MockChunkedFontLoader.loadFont.mockImplementation(() =>
                new Promise((_, reject) => {
                    setTimeout(() => reject(new Error('Timeout')), 100);
                })
            );

            // Act & Assert
            await expect(FontPerformanceComparator.compareFontLoading('PingFang-Bold', {
                timeout: 50,
                enableDetailedLogging: false
            })).rejects.toThrow('Comparison timeout');
        });
    });

    describe('Comparison Analysis', () => {
        it('should identify chunked as winner when significantly faster', () => {
            // Arrange
            const singleResult = {
                success: true,
                timing: { totalDuration: 5000 }
            };
            const chunkedResult = {
                success: true,
                timing: { totalDuration: 2000 }
            };

            // Act
            const comparison = FontPerformanceComparator['analyzeComparison'](singleResult, chunkedResult, 'PingFang-Bold');

            // Assert
            expect(comparison.winner).toBe('chunked');
            expect(comparison.timeImprovement).toBe(60);
            expect(comparison.speedupFactor).toBe(2.5);
            expect(comparison.recommendation).toContain('faster');
        });

        it('should identify single as winner when significantly faster', () => {
            // Arrange
            const singleResult = {
                success: true,
                timing: { totalDuration: 2000 }
            };
            const chunkedResult = {
                success: true,
                timing: { totalDuration: 5000 }
            };

            // Act
            const comparison = FontPerformanceComparator['analyzeComparison'](singleResult, chunkedResult, 'PingFang-Bold');

            // Assert
            expect(comparison.winner).toBe('single');
            expect(comparison.timeImprovement).toBe(-150);
            expect(comparison.speedupFactor).toBe(0.4);
            expect(comparison.recommendation).toContain('faster');
        });

        it('should identify tie when performance is similar', () => {
            // Arrange
            const singleResult = {
                success: true,
                timing: { totalDuration: 3000 }
            };
            const chunkedResult = {
                success: true,
                timing: { totalDuration: 3100 }
            };

            // Act
            const comparison = FontPerformanceComparator['analyzeComparison'](singleResult, chunkedResult, 'PingFang-Bold');

            // Assert
            expect(comparison.winner).toBe('tie');
            expect(Math.abs(comparison.timeImprovement)).toBeLessThan(10);
            expect(comparison.recommendation).toContain('similarly');
        });
    });

    describe('Summary Generation', () => {
        it('should generate correct summary for successful comparison', () => {
            // Arrange
            const singleResult = {
                success: true,
                timing: { totalDuration: 5000 }
            };
            const chunkedResult = {
                success: true,
                timing: { totalDuration: 2000 }
            };
            const totalTestTime = 8000;

            // Act
            const summary = FontPerformanceComparator['generateSummary'](singleResult, chunkedResult, totalTestTime);

            // Assert
            expect(summary.totalTestTime).toBe(8000);
            expect(summary.overallWinner).toBe('chunked');
            expect(summary.networkEfficiency).toBe(40); // 2000/5000 * 100
        });

        it('should handle failed comparisons in summary', () => {
            // Arrange
            const singleResult = {
                success: false,
                timing: { totalDuration: 1000 }
            };
            const chunkedResult = {
                success: true,
                timing: { totalDuration: 2000 }
            };
            const totalTestTime = 3000;

            // Act
            const summary = FontPerformanceComparator['generateSummary'](singleResult, chunkedResult, totalTestTime);

            // Assert
            expect(summary.overallWinner).toBe('chunked');
            expect(summary.networkEfficiency).toBe(100);
        });
    });

    describe('Progress Tracking', () => {
        it('should call progress callback for single font loading', async () => {
            // Arrange
            const mockProgress = jest.fn();
            const mockFont = {} as cc.Font;
            MockChunkedFontLoader.loadFont.mockResolvedValueOnce(mockFont);

            // Act
            await FontPerformanceComparator['loadSingleFont']('PingFang-Bold', true, mockProgress);

            // Assert
            expect(mockProgress).toHaveBeenCalled();
            expect(mockProgress.mock.calls[0][0]).toHaveProperty('type', 'single');
            expect(mockProgress.mock.calls[0][0]).toHaveProperty('percentage');
        });

        it('should call progress callback for chunked font loading', async () => {
            // Arrange
            const mockProgress = jest.fn();
            const mockFont = {} as cc.Font;
            MockChunkedFontLoader.loadFont.mockResolvedValueOnce(mockFont);

            // Act
            await FontPerformanceComparator['loadChunkedFont']('PingFang-Bold', true, mockProgress);

            // Assert
            expect(mockProgress).toHaveBeenCalled();
            expect(mockProgress.mock.calls[0][0]).toHaveProperty('type', 'chunked');
        });
    });

    describe('Report Generation', () => {
        it('should generate comprehensive comparison report', () => {
            // Arrange
            const result: FontComparisonResult = {
                fontName: 'PingFang-Bold',
                singleFont: {
                    success: true,
                    timing: {
                        startTime: 1000,
                        endTime: 6000,
                        totalDuration: 5000,
                        chunkLoadTimes: [],
                        phases: {
                            metadata: { start: 1000, end: 1000, duration: 0 },
                            chunks: { start: 1000, end: 6000, duration: 5000 },
                            merge: { start: 0 },
                            fontCreation: { start: 0 }
                        }
                    }
                },
                chunkedFont: {
                    success: true,
                    timing: {
                        startTime: 1000,
                        endTime: 3000,
                        totalDuration: 2000,
                        metadataLoadTime: 200,
                        chunkLoadTimes: [300, 250, 280],
                        mergeTime: 100,
                        fontCreationTime: 50,
                        phases: {
                            metadata: { start: 1000, end: 1200, duration: 200 },
                            chunks: { start: 1200, end: 2700, duration: 1500 },
                            merge: { start: 2700, end: 2800, duration: 100 },
                            fontCreation: { start: 2800, end: 2850, duration: 50 }
                        }
                    }
                },
                comparison: {
                    timeImprovement: 60,
                    speedupFactor: 2.5,
                    winner: 'chunked',
                    recommendation: 'Use chunked fonts for better performance.',
                    detailedAnalysis: 'Chunked loading is significantly faster.'
                },
                summary: {
                    totalTestTime: 8000,
                    networkEfficiency: 40,
                    memoryEfficiency: 100,
                    overallWinner: 'chunked'
                }
            };

            // Act
            const report = FontPerformanceComparator.generateComparisonReport(result);

            // Assert
            expect(report).toContain('FONT PERFORMANCE COMPARISON REPORT');
            expect(report).toContain('PingFang-Bold');
            expect(report).toContain('Winner: CHUNKED');
            expect(report).toContain('60.0%');
            expect(report).toContain('2.50x');
        });

        it('should generate multi-font summary report', () => {
            // Arrange
            const results: FontComparisonResult[] = [
                {
                    fontName: 'PingFang-Bold',
                    singleFont: { success: true, timing: { totalDuration: 5000 } as any },
                    chunkedFont: { success: true, timing: { totalDuration: 2000 } as any },
                    comparison: { winner: 'chunked', timeImprovement: 60, speedupFactor: 2.5 } as any,
                    summary: { overallWinner: 'chunked' } as any
                },
                {
                    fontName: 'PingFang-Regular',
                    singleFont: { success: true, timing: { totalDuration: 3000 } as any },
                    chunkedFont: { success: true, timing: { totalDuration: 3500 } as any },
                    comparison: { winner: 'single', timeImprovement: -16.7, speedupFactor: 0.86 } as any,
                    summary: { overallWinner: 'single' } as any
                }
            ];

            // Act
            const report = FontPerformanceComparator.generateMultiFontReport(results);

            // Assert
            expect(report).toContain('MULTI-FONT PERFORMANCE COMPARISON SUMMARY');
            expect(report).toContain('Total Fonts Tested: 2');
            expect(report).toContain('Chunked Wins: 1');
            expect(report).toContain('Single Wins: 1');
        });
    });

    describe('Multiple Font Comparison', () => {
        it('should compare multiple fonts successfully', async () => {
            // Arrange
            const mockFont = {} as cc.Font;
            MockChunkedFontLoader.loadFont.mockResolvedValue(mockFont);

            const fontNames = ['PingFang-Bold', 'PingFang-Regular'];

            // Act
            const results = await FontPerformanceComparator.compareMultipleFonts(fontNames, {
                enableDetailedLogging: false
            });

            // Assert
            expect(results).toHaveLength(2);
            expect(results[0].fontName).toBe('PingFang-Bold');
            expect(results[1].fontName).toBe('PingFang-Regular');
            expect(results[0].singleFont.success).toBe(true);
            expect(results[0].chunkedFont.success).toBe(true);
        });

        it('should handle failures in multiple font comparison', async () => {
            // Arrange
            MockChunkedFontLoader.loadFont
                .mockRejectedValueOnce(new Error('Font 1 failed'))
                .mockResolvedValueOnce({} as cc.Font);

            const fontNames = ['InvalidFont1', 'PingFang-Bold'];

            // Act
            const results = await FontPerformanceComparator.compareMultipleFonts(fontNames, {
                enableDetailedLogging: false
            });

            // Assert
            expect(results).toHaveLength(2);
            expect(results[0].singleFont.success).toBe(false);
            expect(results[1].singleFont.success).toBe(true);
        });
    });

    describe('Error Handling', () => {
        it('should handle network errors gracefully', async () => {
            // Arrange
            MockChunkedFontLoader.loadFont.mockRejectedValue(new Error('Network error'));

            // Act & Assert
            await expect(FontPerformanceComparator.compareFontLoading('PingFang-Bold', {
                enableDetailedLogging: false
            })).rejects.toThrow('Network error');
        });

        it('should handle invalid font names', async () => {
            // Arrange
            MockChunkedFontLoader.loadFont.mockRejectedValue(new Error('Font not found'));

            // Act
            const result = await FontPerformanceComparator.compareFontLoading('InvalidFont', {
                enableDetailedLogging: false
            });

            // Assert
            expect(result.singleFont.success).toBe(false);
            expect(result.chunkedFont.success).toBe(false);
        });
    });

    describe('Performance Thresholds', () => {
        it('should correctly identify performance thresholds', () => {
            // Test various performance scenarios
            const testCases = [
                { single: 5000, chunked: 2000, expectedWinner: 'chunked' },
                { single: 2000, chunked: 5000, expectedWinner: 'single' },
                { single: 3000, chunked: 3100, expectedWinner: 'tie' },
                { single: 3000, chunked: 2900, expectedWinner: 'tie' }
            ];

            testCases.forEach(({ single, chunked, expectedWinner }) => {
                const singleResult = { success: true, timing: { totalDuration: single } };
                const chunkedResult = { success: true, timing: { totalDuration: chunked } };

                const comparison = FontPerformanceComparator['analyzeComparison'](
                    singleResult, chunkedResult, 'TestFont'
                );

                expect(comparison.winner).toBe(expectedWinner);
            });
        });
    });
}); 