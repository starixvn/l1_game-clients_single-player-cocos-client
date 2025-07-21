/**
 * FontChunker Tests
 * Comprehensive test suite for the font chunking system
 */

import FontChunker, { FontChunk, FontChunkMetadata } from '../assets/common/utils/FontChunker';

describe('FontChunker', () => {
    // Test data
    const mockFontData = new ArrayBuffer(2048); // 2KB mock font data
    const mockFontName = 'TestFont';
    const mockChunkSize = 512; // 512 bytes per chunk

    beforeEach(() => {
        // Fill mock data with some content
        const view = new Uint8Array(mockFontData);
        for (let i = 0; i < view.length; i++) {
            view[i] = i % 256;
        }
    });

    describe('splitFontIntoChunks', () => {
        it('should split font data into correct number of chunks', () => {
            // Arrange
            const expectedChunks = Math.ceil(mockFontData.byteLength / mockChunkSize);

            // Act
            const result = FontChunker.splitFontIntoChunks(mockFontData, mockFontName, mockChunkSize);

            // Assert
            expect(result.chunks).toHaveLength(expectedChunks);
            expect(result.metadata.totalChunks).toBe(expectedChunks);
            expect(result.metadata.fontName).toBe(mockFontName);
        });

        it('should create chunks with correct sizes', () => {
            // Arrange
            const totalSize = mockFontData.byteLength;
            const expectedChunks = Math.ceil(totalSize / mockChunkSize);

            // Act
            const result = FontChunker.splitFontIntoChunks(mockFontData, mockFontName, mockChunkSize);

            // Assert
            let totalChunkSize = 0;
            result.chunks.forEach((chunk, index) => {
                expect(chunk.index).toBe(index);
                expect(chunk.fontName).toBe(mockFontName);
                expect(chunk.totalChunks).toBe(expectedChunks);
                expect(chunk.data).toBeInstanceOf(ArrayBuffer);
                expect(chunk.size).toBeGreaterThan(0);
                expect(chunk.checksum).toBeDefined();
                totalChunkSize += chunk.size;
            });

            expect(totalChunkSize).toBe(totalSize);
        });

        it('should generate unique checksums for different chunks', () => {
            // Act
            const result = FontChunker.splitFontIntoChunks(mockFontData, mockFontName, mockChunkSize);

            // Assert
            const checksums = result.chunks.map(chunk => chunk.checksum);
            const uniqueChecksums = new Set(checksums);
            expect(uniqueChecksums.size).toBe(checksums.length);
        });

        it('should handle empty font data', () => {
            // Arrange
            const emptyData = new ArrayBuffer(0);

            // Act
            const result = FontChunker.splitFontIntoChunks(emptyData, mockFontName, mockChunkSize);

            // Assert
            expect(result.chunks).toHaveLength(0);
            expect(result.metadata.totalChunks).toBe(0);
            expect(result.metadata.totalSize).toBe(0);
        });

        it('should handle font data smaller than chunk size', () => {
            // Arrange
            const smallData = new ArrayBuffer(100);
            const largeChunkSize = 1024;

            // Act
            const result = FontChunker.splitFontIntoChunks(smallData, mockFontName, largeChunkSize);

            // Assert
            expect(result.chunks).toHaveLength(1);
            expect(result.chunks[0].size).toBe(100);
            expect(result.metadata.totalChunks).toBe(1);
        });
    });

    describe('mergeFontChunks', () => {
        it('should merge chunks back into original data', () => {
            // Arrange
            const originalData = new ArrayBuffer(1024);
            const view = new Uint8Array(originalData);
            for (let i = 0; i < view.length; i++) {
                view[i] = i % 256;
            }

            const splitResult = FontChunker.splitFontIntoChunks(originalData, mockFontName, 256);

            // Act
            const mergedData = FontChunker.mergeFontChunks(splitResult.chunks, splitResult.metadata);

            // Assert
            expect(mergedData.byteLength).toBe(originalData.byteLength);
            expect(new Uint8Array(mergedData)).toEqual(new Uint8Array(originalData));
        });

        it('should throw error when chunk count mismatch', () => {
            // Arrange
            const splitResult = FontChunker.splitFontIntoChunks(mockFontData, mockFontName, mockChunkSize);
            const incompleteChunks = splitResult.chunks.slice(0, -1); // Remove last chunk

            // Act & Assert
            expect(() => {
                FontChunker.mergeFontChunks(incompleteChunks, splitResult.metadata);
            }).toThrow('Expected 4 chunks, but got 3');
        });

        it('should throw error when checksum mismatch', () => {
            // Arrange
            const splitResult = FontChunker.splitFontIntoChunks(mockFontData, mockFontName, mockChunkSize);
            const corruptedChunks = [...splitResult.chunks];
            corruptedChunks[0] = {
                ...corruptedChunks[0],
                checksum: 'invalid_checksum'
            };

            // Act & Assert
            expect(() => {
                FontChunker.mergeFontChunks(corruptedChunks, splitResult.metadata);
            }).toThrow('Checksum mismatch for chunk 0');
        });

        it('should handle single chunk correctly', () => {
            // Arrange
            const singleChunkData = new ArrayBuffer(100);
            const splitResult = FontChunker.splitFontIntoChunks(singleChunkData, mockFontName, 200);

            // Act
            const mergedData = FontChunker.mergeFontChunks(splitResult.chunks, splitResult.metadata);

            // Assert
            expect(mergedData.byteLength).toBe(singleChunkData.byteLength);
            expect(new Uint8Array(mergedData)).toEqual(new Uint8Array(singleChunkData));
        });
    });

    describe('generateChecksum', () => {
        it('should generate consistent checksums for same data', () => {
            // Arrange
            const data1 = new ArrayBuffer(100);
            const data2 = new ArrayBuffer(100);
            const view1 = new Uint8Array(data1);
            const view2 = new Uint8Array(data2);

            for (let i = 0; i < 100; i++) {
                view1[i] = i;
                view2[i] = i;
            }

            // Act
            const checksum1 = (FontChunker as any).generateChecksum(data1);
            const checksum2 = (FontChunker as any).generateChecksum(data2);

            // Assert
            expect(checksum1).toBe(checksum2);
        });

        it('should generate different checksums for different data', () => {
            // Arrange
            const data1 = new ArrayBuffer(100);
            const data2 = new ArrayBuffer(100);
            const view1 = new Uint8Array(data1);
            const view2 = new Uint8Array(data2);

            for (let i = 0; i < 100; i++) {
                view1[i] = i;
                view2[i] = i + 1; // Different data
            }

            // Act
            const checksum1 = (FontChunker as any).generateChecksum(data1);
            const checksum2 = (FontChunker as any).generateChecksum(data2);

            // Assert
            expect(checksum1).not.toBe(checksum2);
        });
    });

    describe('utility methods', () => {
        it('should generate correct chunk paths', () => {
            // Act
            const chunkPath = FontChunker.getChunkPath('TestFont', 0);
            const metadataPath = FontChunker.getMetadataPath('TestFont');

            // Assert
            expect(chunkPath).toBe('fonts/chunks/font_chunk_TestFont_0');
            expect(metadataPath).toBe('fonts/chunks/TestFont_metadata');
        });

        it('should handle edge cases in path generation', () => {
            // Act
            const chunkPath = FontChunker.getChunkPath('', 0);
            const metadataPath = FontChunker.getMetadataPath('');

            // Assert
            expect(chunkPath).toBe('fonts/chunks/font_chunk__0');
            expect(metadataPath).toBe('fonts/chunks/_metadata');
        });
    });

    describe('error handling', () => {
        it('should handle null font data gracefully', () => {
            // Act & Assert
            expect(() => {
                FontChunker.splitFontIntoChunks(null as any, mockFontName, mockChunkSize);
            }).toThrow();
        });

        it('should handle invalid chunk size', () => {
            // Act & Assert
            expect(() => {
                FontChunker.splitFontIntoChunks(mockFontData, mockFontName, -1);
            }).toThrow();
        });

        it('should handle zero chunk size', () => {
            // Act & Assert
            expect(() => {
                FontChunker.splitFontIntoChunks(mockFontData, mockFontName, 0);
            }).toThrow();
        });
    });

    describe('performance tests', () => {
        it('should handle large font data efficiently', () => {
            // Arrange
            const largeFontData = new ArrayBuffer(10 * 1024 * 1024); // 10MB
            const chunkSize = 1024 * 1024; // 1MB chunks

            // Act
            const startTime = performance.now();
            const result = FontChunker.splitFontIntoChunks(largeFontData, 'LargeFont', chunkSize);
            const endTime = performance.now();

            // Assert
            expect(result.chunks).toHaveLength(10);
            expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
        });

        it('should merge large chunks efficiently', () => {
            // Arrange
            const largeFontData = new ArrayBuffer(5 * 1024 * 1024); // 5MB
            const chunkSize = 1024 * 1024; // 1MB chunks
            const splitResult = FontChunker.splitFontIntoChunks(largeFontData, 'LargeFont', chunkSize);

            // Act
            const startTime = performance.now();
            const mergedData = FontChunker.mergeFontChunks(splitResult.chunks, splitResult.metadata);
            const endTime = performance.now();

            // Assert
            expect(mergedData.byteLength).toBe(largeFontData.byteLength);
            expect(endTime - startTime).toBeLessThan(500); // Should complete within 500ms
        });
    });
}); 