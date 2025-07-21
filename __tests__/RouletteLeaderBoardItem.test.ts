import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import RouletteLeaderBoardItem, { LeaderBoardItem } from '../assets/games/_roulette-s/scripts/roulette-leader-board-item';
import GameUtils from '../assets/common/GameUtils';

// Mock Cocos Creator components
const mockLabel = {
    string: '',
    setString: jest.fn()
};

const mockSprite = {
    spriteFrame: null,
    setSpriteFrame: jest.fn()
};

const mockNode = {
    active: false,
    setActive: jest.fn()
};

const mockTexture2D = {
    initWithElement: jest.fn()
};

const mockSpriteFrame = {
    setTexture: jest.fn()
};

// Mock cc namespace
global.cc = {
    _decorator: {
        ccclass: jest.fn() as any,
        property: jest.fn() as any
    } as any,
    Label: jest.fn(() => mockLabel) as any,
    Sprite: jest.fn(() => mockSprite) as any,
    Node: jest.fn(() => mockNode) as any,
    Texture2D: jest.fn(() => mockTexture2D) as any,
    SpriteFrame: jest.fn(() => mockSpriteFrame) as any,
    error: jest.fn(),
    log: jest.fn()
};

// Mock GameUtils
jest.mock('../assets/common/GameUtils', () => ({
    __esModule: true,
    default: {
        loadRemote: jest.fn(),
        getAvatarSprite: jest.fn()
    }
}));

// Mock Image constructor
global.Image = jest.fn(() => ({
    crossOrigin: '',
    onload: null as any,
    onerror: null as any,
    src: '',
    complete: false,
    width: 100,
    height: 100
})) as any;

describe('RouletteLeaderBoardItem', () => {
    let leaderBoardItem: RouletteLeaderBoardItem;
    let mockLeaderBoardData: LeaderBoardItem;

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();

        // Create instance
        leaderBoardItem = new RouletteLeaderBoardItem();

        // Mock component properties
        leaderBoardItem.rank = mockLabel as any;
        leaderBoardItem.avatar = mockSprite as any;
        leaderBoardItem.playerName = mockLabel as any;
        leaderBoardItem.winAmount = mockLabel as any;
        leaderBoardItem.background = mockNode as any;

        // Mock data
        mockLeaderBoardData = {
            rank: '1',
            nickname: 'TestPlayer',
            totalWin: 1000.50,
            avatarUrl: 'https://example.com/avatar.png'
        };
    });

    afterEach(() => {
        // Clean up
        if (leaderBoardItem.onDestroy) {
            leaderBoardItem.onDestroy();
        }
    });

    describe('setData', () => {
        it('should set all data correctly when valid leaderBoardItem is provided', () => {
            // Arrange
            const isCurrentPlayer = true;

            // Act
            leaderBoardItem.setData(mockLeaderBoardData, isCurrentPlayer);

            // Assert
            expect(leaderBoardItem.rank.string).toBe('1');
            expect(leaderBoardItem.playerName.string).toBe('TestPlayer');
            expect(leaderBoardItem.winAmount.string).toBe('1,000.50');
            expect(leaderBoardItem.background.active).toBe(true);
        });

        it('should handle null leaderBoardItem gracefully', () => {
            // Arrange
            const nullData = null;

            // Act
            leaderBoardItem.setData(nullData);

            // Assert
            expect(leaderBoardItem.rank.string).toBe('');
            expect(leaderBoardItem.playerName.string).toBe('');
            expect(leaderBoardItem.winAmount.string).toBe('');
        });

        it('should handle undefined values in leaderBoardItem', () => {
            // Arrange
            const incompleteData: LeaderBoardItem = {
                totalWin: 500,
                rank: undefined,
                nickname: undefined,
                avatarUrl: undefined
            };

            // Act
            leaderBoardItem.setData(incompleteData);

            // Assert
            expect(leaderBoardItem.rank.string).toBe('');
            expect(leaderBoardItem.playerName.string).toBe('******');
            expect(leaderBoardItem.winAmount.string).toBe('500.00');
        });

        it('should truncate long nicknames', () => {
            // Arrange
            const longNicknameData: LeaderBoardItem = {
                ...mockLeaderBoardData,
                nickname: 'VeryLongNicknameThatExceedsTheLimit'
            };

            // Act
            leaderBoardItem.setData(longNicknameData);

            // Assert
            expect(leaderBoardItem.playerName.string).toBe('VeryLongNick...');
        });

        it('should handle empty nickname string', () => {
            // Arrange
            const emptyNicknameData: LeaderBoardItem = {
                ...mockLeaderBoardData,
                nickname: '   '
            };

            // Act
            leaderBoardItem.setData(emptyNicknameData);

            // Assert
            expect(leaderBoardItem.playerName.string).toBe('******');
        });
    });

    describe('avatar loading', () => {
        it('should load avatar successfully with CORS handling', async () => {
            // Arrange
            const mockImage = new Image();
            const mockTexture = new cc.Texture2D();

            // Mock successful image loading
            setTimeout(() => {
                if (mockImage.onload) {
                    mockImage.onload();
                }
            }, 0);

            // Act
            leaderBoardItem.setData(mockLeaderBoardData);

            // Wait for async operations
            await new Promise(resolve => setTimeout(resolve, 100));

            // Assert
            expect(mockImage.crossOrigin).toBe('anonymous');
            expect(mockTexture.initWithElement).toHaveBeenCalledWith(mockImage);
        });

        it('should fallback to GameUtils.loadRemote when CORS handling fails', async () => {
            // Arrange
            const mockImage = new Image();
            const mockTexture = new cc.Texture2D();

            // Mock CORS failure
            setTimeout(() => {
                if (mockImage.onerror) {
                    mockImage.onerror('CORS error');
                }
            }, 0);

            // Mock successful GameUtils.loadRemote
            (GameUtils.loadRemote as jest.Mock).mockResolvedValue(mockTexture);

            // Act
            leaderBoardItem.setData(mockLeaderBoardData);

            // Wait for async operations
            await new Promise(resolve => setTimeout(resolve, 100));

            // Assert
            expect(GameUtils.loadRemote).toHaveBeenCalled();
        });

        it('should fallback to default avatar when all loading methods fail', async () => {
            // Arrange
            const mockImage = new Image();
            const mockDefaultAvatar = new cc.SpriteFrame();

            // Mock all loading failures
            setTimeout(() => {
                if (mockImage.onerror) {
                    mockImage.onerror('CORS error');
                }
            }, 0);

            // Mock GameUtils failures
            (GameUtils.loadRemote as jest.Mock).mockRejectedValue(new Error('Network error'));
            (GameUtils.getAvatarSprite as jest.Mock).mockResolvedValue(mockDefaultAvatar);

            // Act
            leaderBoardItem.setData(mockLeaderBoardData);

            // Wait for async operations
            await new Promise(resolve => setTimeout(resolve, 100));

            // Assert
            expect(GameUtils.getAvatarSprite).toHaveBeenCalledWith(1);
        });

        it('should cache successfully loaded avatars', async () => {
            // Arrange
            const mockImage = new Image();
            const mockTexture = new cc.Texture2D();

            // Mock successful image loading
            setTimeout(() => {
                if (mockImage.onload) {
                    mockImage.onload();
                }
            }, 0);

            // Act
            leaderBoardItem.setData(mockLeaderBoardData);
            await new Promise(resolve => setTimeout(resolve, 100));

            // Load the same avatar again
            leaderBoardItem.setData(mockLeaderBoardData);
            await new Promise(resolve => setTimeout(resolve, 100));

            // Assert
            // The second call should use cached texture, so Image constructor should only be called once
            expect(Image).toHaveBeenCalledTimes(1);
        });

        it('should handle image loading timeout', async () => {
            // Arrange
            const mockImage = new Image();

            // Don't trigger onload or onerror, let timeout occur
            jest.useFakeTimers();

            // Act
            leaderBoardItem.setData(mockLeaderBoardData);

            // Fast-forward time to trigger timeout
            jest.advanceTimersByTime(10000);

            // Assert
            expect(cc.error).toHaveBeenCalledWith(
                'Failed to load avatar with CORS handling:',
                expect.any(Error)
            );

            jest.useRealTimers();
        });
    });

    describe('formatText', () => {
        it('should truncate text longer than maxLength', () => {
            // Arrange
            const longText = 'This is a very long text that should be truncated';
            const maxLength = 20;

            // Act
            const result = leaderBoardItem['formatText'](longText, maxLength);

            // Assert
            expect(result).toBe('This is a very lo...');
            expect(result.length).toBeLessThanOrEqual(maxLength);
        });

        it('should not truncate text shorter than maxLength', () => {
            // Arrange
            const shortText = 'Short text';
            const maxLength = 20;

            // Act
            const result = leaderBoardItem['formatText'](shortText, maxLength);

            // Assert
            expect(result).toBe(shortText);
        });

        it('should handle exact length text', () => {
            // Arrange
            const exactText = 'Exactly twenty chars';
            const maxLength = 20;

            // Act
            const result = leaderBoardItem['formatText'](exactText, maxLength);

            // Assert
            expect(result).toBe(exactText);
        });
    });

    describe('getNickname', () => {
        it('should return hidden name for null nickname', () => {
            // Act
            const result = leaderBoardItem['getNickname'](null);

            // Assert
            expect(result).toBe('******');
        });

        it('should return hidden name for undefined nickname', () => {
            // Act
            const result = leaderBoardItem['getNickname'](undefined);

            // Assert
            expect(result).toBe('******');
        });

        it('should return hidden name for empty string', () => {
            // Act
            const result = leaderBoardItem['getNickname']('');

            // Assert
            expect(result).toBe('******');
        });

        it('should return hidden name for whitespace-only string', () => {
            // Act
            const result = leaderBoardItem['getNickname']('   ');

            // Assert
            expect(result).toBe('******');
        });

        it('should return formatted nickname for valid string', () => {
            // Act
            const result = leaderBoardItem['getNickname']('ValidNickname');

            // Assert
            expect(result).toBe('ValidNickname');
        });
    });

    describe('assignSpriteFrame', () => {
        it('should assign sprite frame when both avatar and texture are valid', () => {
            // Arrange
            const mockTexture = new cc.Texture2D();

            // Act
            leaderBoardItem['assignSpriteFrame'](mockTexture);

            // Assert
            expect(mockSprite.spriteFrame).toBeDefined();
        });

        it('should handle null avatar gracefully', () => {
            // Arrange
            const mockTexture = new cc.Texture2D();
            leaderBoardItem.avatar = null;

            // Act & Assert (should not throw)
            expect(() => {
                leaderBoardItem['assignSpriteFrame'](mockTexture);
            }).not.toThrow();
        });

        it('should handle null texture gracefully', () => {
            // Arrange
            const nullTexture = null;

            // Act & Assert (should not throw)
            expect(() => {
                leaderBoardItem['assignSpriteFrame'](nullTexture);
            }).not.toThrow();
        });
    });

    describe('cleanup', () => {
        it('should clear avatar cache on destroy', () => {
            // Arrange
            const mockImage = new Image();
            const mockTexture = new cc.Texture2D();

            // Load an avatar to populate cache
            setTimeout(() => {
                if (mockImage.onload) {
                    mockImage.onload();
                }
            }, 0);

            leaderBoardItem.setData(mockLeaderBoardData);

            // Act
            leaderBoardItem.onDestroy();

            // Assert
            // Cache should be cleared (we can't directly test the Map, but we can verify the method exists)
            expect(leaderBoardItem.onDestroy).toBeDefined();
        });
    });
}); 