/**
 * ChunkedFontLoader Tests
 * Comprehensive test suite for the chunked font loader
 */

import ChunkedFontLoader, { FontLoadProgress, FontLoadOptions } from '../assets/common/utils/ChunkedFontLoader';
import FontChunker from '../assets/common/utils/FontChunker';

// Mock FontChunker
jest.mock('../assets/common/utils/FontChunker');
const MockFontChunker = FontChunker as jest.Mocked<typeof FontChunker>;

// Mock Cocos Creator
const mockFont = {
    name: 'TestFont',
    isValid: true
};

const mockCC = {
    resources: {
        load: jest.fn()
    },
    Font: jest.fn(() => mockFont)
};

// Mock global cc object
(global as any).cc = mockCC;

describe('ChunkedFontLoader', () => {
    const mockFontName = 'TestFont';
    const mockProgressCallback = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        mockProgressCallback.mockClear();
    });

    describe('loadFont', () => {
        it('should load chunked font when available', async () => {
            // Arrange
            MockFontChunker.isChunkedFontAvailable.mockResolvedValue(true);
            MockFontChunker.loadChunkedFont.mockResolvedValue(new ArrayBuffer(100));
            mockCC.resources.load.mockImplementation((path, type, callback) => {
                callback(null, mockFont);
            });

            // Act
            const result = await ChunkedFontLoader.loadFont(mockFontName, {
                useChunkedFont: true,
                onProgress: mockProgressCallback
            });

            // Assert
            expect(MockFontChunker.isChunkedFontAvailable).toHaveBeenCalledWith(mockFontName);
            expect(MockFontChunker.loadChunkedFont).toHaveBeenCalledWith(mockFontName);
            expect(result).toBe(mockFont);
        });

        it('should fallback to regular font when chunked font not available', async () => {
            // Arrange
            MockFontChunker.isChunkedFontAvailable.mockResolvedValue(false);
            mockCC.resources.load.mockImplementation((path, type, callback) => {
                callback(null, mockFont);
            });

            // Act
            const result = await ChunkedFontLoader.loadFont(mockFontName, {
                useChunkedFont: true,
                fallbackToRegular: true
            });

            // Assert
            expect(MockFontChunker.isChunkedFontAvailable).toHaveBeenCalledWith(mockFontName);
            expect(mockCC.resources.load).toHaveBeenCalledWith(`fonts/${mockFontName}`, mockCC.Font, expect.any(Function));
            expect(result).toBe(mockFont);
        });

        it('should throw error when neither chunked nor regular font available', async () => {
            // Arrange
            MockFontChunker.isChunkedFontAvailable.mockResolvedValue(false);
            mockCC.resources.load.mockImplementation((path, type, callback) => {
                callback(new Error('Font not found'), null);
            });

            // Act & Assert
            await expect(ChunkedFontLoader.loadFont(mockFontName, {
                useChunkedFont: true,
                fallbackToRegular: false
            })).rejects.toThrow('Font TestFont not available in chunked or regular format');
        });

        it('should handle chunked font loading errors gracefully', async () => {
            // Arrange
            MockFontChunker.isChunkedFontAvailable.mockResolvedValue(true);
            MockFontChunker.loadChunkedFont.mockRejectedValue(new Error('Chunked loading failed'));
            mockCC.resources.load.mockImplementation((path, type, callback) => {
                callback(null, mockFont);
            });

            // Act
            const result = await ChunkedFontLoader.loadFont(mockFontName, {
                useChunkedFont: true,
                fallbackToRegular: true
            });

            // Assert
            expect(MockFontChunker.loadChunkedFont).toHaveBeenCalledWith(mockFontName);
            expect(mockCC.resources.load).toHaveBeenCalledWith(`fonts/${mockFontName}`, mockCC.Font, expect.any(Function));
            expect(result).toBe(mockFont);
        });

        it('should respect useChunkedFont option', async () => {
            // Arrange
            mockCC.resources.load.mockImplementation((path, type, callback) => {
                callback(null, mockFont);
            });

            // Act
            const result = await ChunkedFontLoader.loadFont(mockFontName, {
                useChunkedFont: false,
                fallbackToRegular: true
            });

            // Assert
            expect(MockFontChunker.isChunkedFontAvailable).not.toHaveBeenCalled();
            expect(mockCC.resources.load).toHaveBeenCalledWith(`fonts/${mockFontName}`, mockCC.Font, expect.any(Function));
            expect(result).toBe(mockFont);
        });
    });

    describe('preloadFont', () => {
        it('should successfully preload font', async () => {
            // Arrange
            MockFontChunker.isChunkedFontAvailable.mockResolvedValue(true);
            MockFontChunker.loadChunkedFont.mockResolvedValue(new ArrayBuffer(100));
            mockCC.resources.load.mockImplementation((path, type, callback) => {
                callback(null, mockFont);
            });

            // Act
            await ChunkedFontLoader.preloadFont(mockFontName, {
                useChunkedFont: true,
                onProgress: mockProgressCallback
            });

            // Assert
            expect(MockFontChunker.isChunkedFontAvailable).toHaveBeenCalledWith(mockFontName);
            expect(MockFontChunker.loadChunkedFont).toHaveBeenCalledWith(mockFontName);
        });

        it('should handle preload errors gracefully', async () => {
            // Arrange
            MockFontChunker.isChunkedFontAvailable.mockResolvedValue(false);
            mockCC.resources.load.mockImplementation((path, type, callback) => {
                callback(new Error('Font not found'), null);
            });

            // Act & Assert
            await expect(ChunkedFontLoader.preloadFont(mockFontName)).resolves.toBeUndefined();
        });
    });

    describe('isChunkedFontAvailable', () => {
        it('should return true when chunked font is available', async () => {
            // Arrange
            MockFontChunker.isChunkedFontAvailable.mockResolvedValue(true);

            // Act
            const result = await ChunkedFontLoader.isChunkedFontAvailable(mockFontName);

            // Assert
            expect(MockFontChunker.isChunkedFontAvailable).toHaveBeenCalledWith(mockFontName);
            expect(result).toBe(true);
        });

        it('should return false when chunked font is not available', async () => {
            // Arrange
            MockFontChunker.isChunkedFontAvailable.mockResolvedValue(false);

            // Act
            const result = await ChunkedFontLoader.isChunkedFontAvailable(mockFontName);

            // Assert
            expect(MockFontChunker.isChunkedFontAvailable).toHaveBeenCalledWith(mockFontName);
            expect(result).toBe(false);
        });
    });

    describe('getFontLoadingStats', () => {
        it('should return stats for chunked font', async () => {
            // Arrange
            const mockMetadata = {
                totalChunks: 5,
                totalSize: 1024 * 1024,
                chunkSize: 256 * 1024
            };
            MockFontChunker.isChunkedFontAvailable.mockResolvedValue(true);
            (MockFontChunker as any).loadFontMetadata = jest.fn().mockResolvedValue(mockMetadata);

            // Act
            const result = await ChunkedFontLoader.getFontLoadingStats(mockFontName);

            // Assert
            expect(result).toEqual({
                isChunked: true,
                totalChunks: 5,
                totalSize: 1024 * 1024,
                chunkSize: 256 * 1024
            });
        });

        it('should return stats for non-chunked font', async () => {
            // Arrange
            MockFontChunker.isChunkedFontAvailable.mockResolvedValue(false);

            // Act
            const result = await ChunkedFontLoader.getFontLoadingStats(mockFontName);

            // Assert
            expect(result).toEqual({
                isChunked: false
            });
        });

        it('should handle metadata loading errors', async () => {
            // Arrange
            MockFontChunker.isChunkedFontAvailable.mockResolvedValue(true);
            (MockFontChunker as any).loadFontMetadata = jest.fn().mockRejectedValue(new Error('Metadata error'));

            // Act
            const result = await ChunkedFontLoader.getFontLoadingStats(mockFontName);

            // Assert
            expect(result).toEqual({
                isChunked: false
            });
        });
    });

    describe('error handling', () => {
        it('should handle timeout errors', async () => {
            // Arrange
            MockFontChunker.isChunkedFontAvailable.mockResolvedValue(true);
            MockFontChunker.loadChunkedFont.mockImplementation(() => {
                return new Promise((_, reject) => {
                    setTimeout(() => reject(new Error('Timeout')), 100);
                });
            });
            mockCC.resources.load.mockImplementation((path, type, callback) => {
                callback(null, mockFont);
            });

            // Act
            const result = await ChunkedFontLoader.loadFont(mockFontName, {
                useChunkedFont: true,
                fallbackToRegular: true,
                timeout: 50
            });

            // Assert
            expect(result).toBe(mockFont);
        });

        it('should handle network errors gracefully', async () => {
            // Arrange
            MockFontChunker.isChunkedFontAvailable.mockResolvedValue(true);
            MockFontChunker.loadChunkedFont.mockRejectedValue(new Error('Network error'));
            mockCC.resources.load.mockImplementation((path, type, callback) => {
                callback(null, mockFont);
            });

            // Act
            const result = await ChunkedFontLoader.loadFont(mockFontName, {
                useChunkedFont: true,
                fallbackToRegular: true
            });

            // Assert
            expect(result).toBe(mockFont);
        });
    });

    describe('progress tracking', () => {
        it('should call progress callback during chunked loading', async () => {
            // Arrange
            MockFontChunker.isChunkedFontAvailable.mockResolvedValue(true);
            MockFontChunker.loadChunkedFont.mockResolvedValue(new ArrayBuffer(100));
            mockCC.resources.load.mockImplementation((path, type, callback) => {
                callback(null, mockFont);
            });

            // Act
            await ChunkedFontLoader.loadFont(mockFontName, {
                useChunkedFont: true,
                onProgress: mockProgressCallback
            });

            // Assert
            expect(mockProgressCallback).toHaveBeenCalled();
        });

        it('should not call progress callback for regular font loading', async () => {
            // Arrange
            MockFontChunker.isChunkedFontAvailable.mockResolvedValue(false);
            mockCC.resources.load.mockImplementation((path, type, callback) => {
                callback(null, mockFont);
            });

            // Act
            await ChunkedFontLoader.loadFont(mockFontName, {
                useChunkedFont: true,
                fallbackToRegular: true,
                onProgress: mockProgressCallback
            });

            // Assert
            expect(mockProgressCallback).not.toHaveBeenCalled();
        });
    });

    describe('edge cases', () => {
        it('should handle empty font name', async () => {
            // Arrange
            MockFontChunker.isChunkedFontAvailable.mockResolvedValue(false);
            mockCC.resources.load.mockImplementation((path, type, callback) => {
                callback(null, mockFont);
            });

            // Act
            const result = await ChunkedFontLoader.loadFont('', {
                useChunkedFont: true,
                fallbackToRegular: true
            });

            // Assert
            expect(result).toBe(mockFont);
        });

        it('should handle null options', async () => {
            // Arrange
            MockFontChunker.isChunkedFontAvailable.mockResolvedValue(false);
            mockCC.resources.load.mockImplementation((path, type, callback) => {
                callback(null, mockFont);
            });

            // Act
            const result = await ChunkedFontLoader.loadFont(mockFontName, null as any);

            // Assert
            expect(result).toBe(mockFont);
        });

        it('should handle undefined options', async () => {
            // Arrange
            MockFontChunker.isChunkedFontAvailable.mockResolvedValue(false);
            mockCC.resources.load.mockImplementation((path, type, callback) => {
                callback(null, mockFont);
            });

            // Act
            const result = await ChunkedFontLoader.loadFont(mockFontName, undefined as any);

            // Assert
            expect(result).toBe(mockFont);
        });
    });
}); 