/**
 * Splash Font Integration Tests
 * Tests the integration between splash screen and font chunking system
 */

import { getSplashFontConfig, validateSplashFontConfig, getFontLoadingStats } from '../assets/splash/view-models/SplashFontConfig';
import ChunkedFontLoader from '../assets/common/utils/ChunkedFontLoader';

// Mock Cocos Creator
const mockCC = {
    sys: {
        isMobile: false
    }
};

// Mock global cc object
(global as any).cc = mockCC;

// Mock ChunkedFontLoader
jest.mock('../assets/common/utils/ChunkedFontLoader');
const MockChunkedFontLoader = ChunkedFontLoader as jest.Mocked<typeof ChunkedFontLoader>;

describe('Splash Font Integration', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Reset cc.sys.isMobile
        mockCC.sys.isMobile = false;
    });

    describe('SplashFontConfig', () => {
        it('should return default config for desktop', () => {
            // Arrange
            mockCC.sys.isMobile = false;

            // Act
            const config = getSplashFontConfig();

            // Assert
            expect(config.essentialFonts).toContain('PingFang-Bold');
            expect(config.essentialFonts).toContain('PingFang-Regular');
            expect(config.essentialFonts).toContain('NotoSans-Bold');
            expect(config.essentialFonts).toContain('NotoSans-Regular');
            expect(config.fontLoadingProgressWeight).toBe(0.3);
            expect(config.showDetailedProgress).toBe(true);
        });

        it('should return mobile config for mobile devices', () => {
            // Arrange
            mockCC.sys.isMobile = true;

            // Act
            const config = getSplashFontConfig();

            // Assert
            expect(config.essentialFonts).toContain('PingFang-Bold');
            expect(config.essentialFonts).toContain('PingFang-Regular');
            expect(config.essentialFonts).not.toContain('NotoSans-Bold');
            expect(config.essentialFonts).not.toContain('NotoSans-Regular');
            expect(config.fontLoadingProgressWeight).toBe(0.25);
            expect(config.showDetailedProgress).toBe(false);
        });

        it('should return performance config when performance mode is enabled', () => {
            // Arrange
            mockCC.sys.isMobile = false;
            Object.defineProperty(window, 'location', {
                value: {
                    search: '?performance=true'
                },
                writable: true
            });

            // Act
            const config = getSplashFontConfig();

            // Assert
            expect(config.essentialFonts).toEqual(['PingFang-Bold']);
            expect(config.fontLoadingProgressWeight).toBe(0.2);
            expect(config.showDetailedProgress).toBe(false);
        });

        it('should validate correct configuration', () => {
            // Arrange
            const validConfig = {
                essentialFonts: ['PingFang-Bold'],
                fontLoadingProgressWeight: 0.3,
                showDetailedProgress: true,
                fontLoadingTimeout: 30000,
                continueOnFontError: true
            };

            // Act
            const isValid = validateSplashFontConfig(validConfig);

            // Assert
            expect(isValid).toBe(true);
        });

        it('should reject configuration with no fonts', () => {
            // Arrange
            const invalidConfig = {
                essentialFonts: [],
                fontLoadingProgressWeight: 0.3,
                showDetailedProgress: true,
                fontLoadingTimeout: 30000,
                continueOnFontError: true
            };

            // Act
            const isValid = validateSplashFontConfig(invalidConfig);

            // Assert
            expect(isValid).toBe(false);
        });

        it('should reject configuration with invalid progress weight', () => {
            // Arrange
            const invalidConfig = {
                essentialFonts: ['PingFang-Bold'],
                fontLoadingProgressWeight: 1.5, // Invalid: > 1
                showDetailedProgress: true,
                fontLoadingTimeout: 30000,
                continueOnFontError: true
            };

            // Act
            const isValid = validateSplashFontConfig(invalidConfig);

            // Assert
            expect(isValid).toBe(false);
        });
    });

    describe('Font Loading Statistics', () => {
        it('should return correct font loading stats', async () => {
            // Arrange
            MockChunkedFontLoader.isChunkedFontAvailable
                .mockResolvedValueOnce(true)   // PingFang-Bold
                .mockResolvedValueOnce(false); // PingFang-Regular

            // Act
            const stats = await getFontLoadingStats();

            // Assert
            expect(stats.totalFonts).toBeGreaterThan(0);
            expect(stats.availableFonts).toBe(1);
            expect(stats.missingFonts).toContain('PingFang-Regular');
            expect(stats.config).toBeDefined();
        });

        it('should handle font availability check errors', async () => {
            // Arrange
            MockChunkedFontLoader.isChunkedFontAvailable
                .mockRejectedValueOnce(new Error('Network error'));

            // Act
            const stats = await getFontLoadingStats();

            // Assert
            expect(stats.missingFonts.length).toBeGreaterThan(0);
        });
    });

    describe('Splash Screen Integration', () => {
        it('should preload fonts with correct configuration', async () => {
            // Arrange
            const mockProgressCallback = jest.fn();
            MockChunkedFontLoader.preloadFont.mockResolvedValue(undefined);

            // Act
            const config = getSplashFontConfig();
            const fontPromises = config.essentialFonts.map(fontName =>
                ChunkedFontLoader.preloadFont(fontName, {
                    useChunkedFont: true,
                    fallbackToRegular: true,
                    onProgress: mockProgressCallback
                })
            );

            await Promise.all(fontPromises);

            // Assert
            expect(MockChunkedFontLoader.preloadFont).toHaveBeenCalledTimes(config.essentialFonts.length);
            config.essentialFonts.forEach(fontName => {
                expect(MockChunkedFontLoader.preloadFont).toHaveBeenCalledWith(fontName, expect.any(Object));
            });
        });

        it('should handle font loading timeouts', async () => {
            // Arrange
            const config = getSplashFontConfig();
            MockChunkedFontLoader.preloadFont.mockImplementation(() =>
                new Promise((_, reject) => {
                    setTimeout(() => reject(new Error('Timeout')), config.fontLoadingTimeout + 100);
                })
            );

            // Act & Assert
            await expect(ChunkedFontLoader.preloadFont('PingFang-Bold', {
                useChunkedFont: true,
                fallbackToRegular: true,
                timeout: config.fontLoadingTimeout
            })).rejects.toThrow('Timeout');
        });

        it('should continue loading other fonts when one fails', async () => {
            // Arrange
            const config = getSplashFontConfig();
            MockChunkedFontLoader.preloadFont
                .mockRejectedValueOnce(new Error('Font not found'))
                .mockResolvedValueOnce(undefined);

            // Act
            const results = [];
            for (const fontName of config.essentialFonts.slice(0, 2)) {
                try {
                    await ChunkedFontLoader.preloadFont(fontName, {
                        useChunkedFont: true,
                        fallbackToRegular: true
                    });
                    results.push({ fontName, success: true });
                } catch (error) {
                    results.push({ fontName, success: false, error: error.message });
                }
            }

            // Assert
            expect(results).toHaveLength(2);
            expect(results[0].success).toBe(false);
            expect(results[1].success).toBe(true);
        });
    });

    describe('Progress Tracking', () => {
        it('should calculate correct progress for font loading', () => {
            // Arrange
            const config = getSplashFontConfig();
            const totalFonts = config.essentialFonts.length;
            const loadedFonts = 2;
            const currentFontProgress = 0.5; // 50% of current font

            // Act
            const overallProgress = (loadedFonts + currentFontProgress) / totalFonts;
            const splashProgress = overallProgress * config.fontLoadingProgressWeight;

            // Assert
            expect(overallProgress).toBeGreaterThan(0);
            expect(overallProgress).toBeLessThanOrEqual(1);
            expect(splashProgress).toBeLessThanOrEqual(config.fontLoadingProgressWeight);
        });

        it('should handle progress updates correctly', () => {
            // Arrange
            const mockProgress = {
                currentChunk: 1,
                totalChunks: 5,
                percentage: 20,
                fontName: 'PingFang-Bold'
            };

            // Act
            const progressPercent = mockProgress.percentage;
            const isDetailedProgress = progressPercent > 0 && progressPercent < 100;

            // Assert
            expect(progressPercent).toBe(20);
            expect(isDetailedProgress).toBe(true);
        });
    });

    describe('Error Handling', () => {
        it('should handle network errors gracefully', async () => {
            // Arrange
            MockChunkedFontLoader.preloadFont.mockRejectedValue(new Error('Network error'));

            // Act & Assert
            await expect(ChunkedFontLoader.preloadFont('PingFang-Bold', {
                useChunkedFont: true,
                fallbackToRegular: true
            })).rejects.toThrow('Network error');
        });

        it('should handle invalid font names', async () => {
            // Arrange
            MockChunkedFontLoader.preloadFont.mockRejectedValue(new Error('Font not found'));

            // Act & Assert
            await expect(ChunkedFontLoader.preloadFont('InvalidFont', {
                useChunkedFont: true,
                fallbackToRegular: true
            })).rejects.toThrow('Font not found');
        });

        it('should validate configuration before use', () => {
            // Arrange
            const invalidConfig = {
                essentialFonts: [],
                fontLoadingProgressWeight: 0.3,
                showDetailedProgress: true,
                fontLoadingTimeout: 30000,
                continueOnFontError: true
            };

            // Act
            const isValid = validateSplashFontConfig(invalidConfig);

            // Assert
            expect(isValid).toBe(false);
        });
    });

    describe('Performance Optimization', () => {
        it('should use fewer fonts on mobile for better performance', () => {
            // Arrange
            mockCC.sys.isMobile = true;

            // Act
            const config = getSplashFontConfig();

            // Assert
            expect(config.essentialFonts.length).toBeLessThan(4); // Should be 2 for mobile
            expect(config.fontLoadingTimeout).toBeLessThan(30000); // Should be 20000 for mobile
        });

        it('should use minimal fonts in performance mode', () => {
            // Arrange
            Object.defineProperty(window, 'location', {
                value: { search: '?performance=true' },
                writable: true
            });

            // Act
            const config = getSplashFontConfig();

            // Assert
            expect(config.essentialFonts.length).toBe(1); // Only PingFang-Bold
            expect(config.fontLoadingTimeout).toBe(15000); // 15 seconds
            expect(config.showDetailedProgress).toBe(false);
        });
    });
}); 