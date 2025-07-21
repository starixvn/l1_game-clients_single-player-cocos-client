import * as _ from "lodash";
import CommonDialog from "../../../assets/common/_base/view-models/CommonDialog";
import { Socket } from "socket.io-client";
import RouletteLeaderBoard from "../../../assets/games/_roulette-s/scripts/roulette-leader-board";
import RouletteLeaderBoardItem, { LeaderBoardItem } from "../../../assets/games/_roulette-s/scripts/roulette-leader-board-item";


describe("Test class RouletteLeaderBoard", () => {
    let node: cc.Node;
    let comp: RouletteLeaderBoard;
    let mockSocket: jest.Mocked<Socket>;
    
    const mockLeaderBoardItem: LeaderBoardItem = {
        rank: "1",
        nickname: "Player1",
        totalWin: 1000,
        avatarUrl: "avatar1.jpg"
    };

    const mockCurrentPlayer = {
        rank: "5",
        totalWin: 500,
        currentPlayerSettings: {
            hideName: false,
            hideAvatar: false,
            nickname: "CurrentPlayer",
            avatarUrl: "current-avatar.jpg"
        }
    };

    const mockLeaderboardData = {
        leaderboard: [mockLeaderBoardItem],
        time: "2023-12-20T10:30:00Z",
        currentPlayer: mockCurrentPlayer
    };

    beforeEach(() => {
        // Mock cc.director to avoid scheduler issues
        (cc as any).director = {
            getScheduler: jest.fn().mockReturnValue({
                isTargetPaused: jest.fn().mockReturnValue(false),
                schedule: jest.fn()
            })
        };

        // Mock formatLongDateTime
        jest.spyOn(require('../../../assets/common/helpers/DateTimeHelper'), 'formatLongDateTime')
            .mockReturnValue('Dec 20, 2023 10:30 AM');

        // Create mock socket
        mockSocket = {
            connected: true,
            emit: jest.fn(),
            on: jest.fn(),
            off: jest.fn()
        } as any;

        // Create component
        node = new cc.Node();
        comp = node.addComponent(RouletteLeaderBoard);
        
        // Setup properties
        comp.mainFrame = new cc.Node();
        comp.mainFrame.addComponent(CommonDialog);
        comp.leaderBoardItemPrefab = new cc.Prefab();
        comp.bodyContent = new cc.Node();
        comp.lblTime = new cc.Node().addComponent(cc.Label);

        // Mock cc.instantiate
        const mockLeaderboardItemNode = {
            getComponent: jest.fn().mockReturnValue({
                setData: jest.fn()
            })
        };
        (cc as any).instantiate = jest.fn().mockReturnValue(mockLeaderboardItemNode);

        // Mock addChild
        comp.bodyContent.addChild = jest.fn();

        // Mock scheduleOnce to avoid cc.director issues
        comp.scheduleOnce = jest.fn();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe("Test method init", () => {
        it("should initialize socket and gameName correctly", () => {
            // Arrange
            const gameName = "mini-roulette";

            // Act
            comp.init(mockSocket, gameName);

            // Assert
            expect(comp["socket"]).toBe(mockSocket);
            expect(comp["gameName"]).toBe(gameName);
        });
    });

    describe("Test method onLoad", () => {
        it("should setup dialog handler and socket handler", () => {
            // Arrange
            const mockAddOnDidHide = jest.fn();
            const mockCommonDialog = {
                addOnDidHide: mockAddOnDidHide
            };
            comp.mainFrame.getComponent = jest.fn().mockReturnValue(mockCommonDialog);
            
            // Initialize socket before onLoad
            comp.init(mockSocket, "mini-roulette");

            // Act
            (comp as any).onLoad();

            // Assert
            expect(comp.mainFrame.getComponent).toHaveBeenCalledWith(CommonDialog);
            expect(mockAddOnDidHide).toHaveBeenCalled();
            expect(mockSocket.on).toHaveBeenCalled();
        });
    });

    describe("Test method onEnable", () => {
        it("should request leaderboard data when enabled", () => {
            // Arrange
            comp.init(mockSocket, "mini-roulette");
            const requestSpy = jest.spyOn(comp as any, 'requestLeaderboardData');

            // Act
            (comp as any).onEnable();

            // Assert
            expect(requestSpy).toHaveBeenCalled();
        });
    });

    describe("Test method requestLeaderboardData", () => {
        it("should emit getLeaderboard when socket is connected", () => {
            // Arrange
            comp.init(mockSocket, "mini-roulette");

            // Act
            comp["requestLeaderboardData"]();

            // Assert
            expect(mockSocket.emit).toHaveBeenCalledWith("getLeaderboard");
        });

        it("should not emit when socket is not connected", () => {
            // Arrange
            mockSocket.connected = false;
            comp.init(mockSocket, "mini-roulette");

            // Act
            comp["requestLeaderboardData"]();

            // Assert
            expect(mockSocket.emit).not.toHaveBeenCalled();
        });
    });

    describe("Test method handleLeaderboardData", () => {
        it("should handle valid leaderboard data correctly", () => {
            // Arrange
            comp.init(mockSocket, "mini-roulette");
            const displaySpy = jest.spyOn(comp as any, 'displayLeaderboardItems');

            // Act
            comp["handleLeaderboardData"]({ leaderboard: mockLeaderboardData });

            // Assert
            expect(comp.lblTime.string).toBe('Dec 20, 2023 10:30 AM');
            expect(comp.scheduleOnce).toHaveBeenCalledWith(expect.any(Function), 0.1);
            
            // Test that the scheduled function calls displayLeaderboardItems
            const scheduledCallback = (comp.scheduleOnce as jest.Mock).mock.calls[0][0];
            scheduledCallback();
            expect(displaySpy).toHaveBeenCalledWith(mockLeaderboardData.leaderboard, mockLeaderboardData.currentPlayer);
        });

        it("should return early when no leaderboard data", () => {
            // Arrange
            comp.init(mockSocket, "mini-roulette");
            const displaySpy = jest.spyOn(comp as any, 'displayLeaderboardItems');

            // Act
            comp["handleLeaderboardData"]({});

            // Assert
            expect(displaySpy).not.toHaveBeenCalled();
        });
    });

    describe("Test method displayLeaderboardItems", () => {
        it("should create leaderboard items for all players", () => {
            // Arrange
            const leaderboard = [mockLeaderBoardItem, { ...mockLeaderBoardItem, rank: "2", nickname: "Player2" }];
            const createSpy = jest.spyOn(comp as any, 'createLeaderboardItem');

            // Act
            comp["displayLeaderboardItems"](leaderboard, mockCurrentPlayer);

            // Assert
            expect(createSpy).toHaveBeenCalledTimes(2);
            expect(createSpy).toHaveBeenCalledWith(mockLeaderBoardItem, false);
            expect(createSpy).toHaveBeenCalledWith(leaderboard[1], false);
        });

        it("should display current player when rank is -1", () => {
            // Arrange
            const currentPlayerWithRankMinus1 = { ...mockCurrentPlayer, rank: "-1" };
            const createSpy = jest.spyOn(comp as any, 'createLeaderboardItem');
            const formatSpy = jest.spyOn(comp as any, 'formatCurrentPlayerData');

            // Act
            comp["displayLeaderboardItems"]([mockLeaderBoardItem], currentPlayerWithRankMinus1);

            // Assert
            expect(createSpy).toHaveBeenCalledTimes(2); // 1 leaderboard item + 1 current player
            expect(formatSpy).toHaveBeenCalledWith(currentPlayerWithRankMinus1);
        });

        it("should display current player when rank > 30", () => {
            // Arrange
            const currentPlayerWithHighRank = { ...mockCurrentPlayer, rank: "35" };
            const createSpy = jest.spyOn(comp as any, 'createLeaderboardItem');

            // Act
            comp["displayLeaderboardItems"]([mockLeaderBoardItem], currentPlayerWithHighRank);

            // Assert
            expect(createSpy).toHaveBeenCalledTimes(2); // 1 leaderboard item + 1 current player
        });

        it("should not display current player when rank is within top 30", () => {
            // Arrange
            const currentPlayerInTop30 = { ...mockCurrentPlayer, rank: "15" };
            const createSpy = jest.spyOn(comp as any, 'createLeaderboardItem');

            // Act
            comp["displayLeaderboardItems"]([mockLeaderBoardItem], currentPlayerInTop30);

            // Assert
            expect(createSpy).toHaveBeenCalledTimes(1); // Only 1 leaderboard item
        });
    });

    describe("Test method shouldDisplayCurrentPlayer", () => {
        it("should return true for rank -1", () => {
            // Act & Assert
            expect(comp["shouldDisplayCurrentPlayer"]("-1")).toBe(true);
        });

        it("should return true for rank > 30", () => {
            // Act & Assert
            expect(comp["shouldDisplayCurrentPlayer"]("35")).toBe(true);
        });

        it("should return false for rank within top 30", () => {
            // Act & Assert
            expect(comp["shouldDisplayCurrentPlayer"]("15")).toBe(false);
        });
    });

    describe("Test method createLeaderboardItem", () => {
        it("should create and setup leaderboard item correctly", () => {
            // Arrange
            const mockItemComponent = {
                setData: jest.fn()
            };
            const mockNode = {
                getComponent: jest.fn().mockReturnValue(mockItemComponent)
            };
            (cc as any).instantiate = jest.fn().mockReturnValue(mockNode);

            // Act
            comp["createLeaderboardItem"](mockLeaderBoardItem, true);

            // Assert
            expect((cc as any).instantiate).toHaveBeenCalledWith(comp.leaderBoardItemPrefab);
            expect(mockNode.getComponent).toHaveBeenCalledWith(RouletteLeaderBoardItem);
            expect(comp.bodyContent.addChild).toHaveBeenCalledWith(mockNode);
            expect(mockItemComponent.setData).toHaveBeenCalledWith(mockLeaderBoardItem, true);
        });
    });

    describe("Test method formatCurrentPlayerData", () => {
        it("should format current player data with visible name and avatar", () => {
            // Arrange
            const currentPlayer = {
                rank: "5",
                totalWin: 500,
                currentPlayerSettings: {
                    hideName: false,
                    hideAvatar: false,
                    nickname: "CurrentPlayer",
                    avatarUrl: "current-avatar.jpg"
                }
            };

            // Act
            const result = comp["formatCurrentPlayerData"](currentPlayer);

            // Assert
            expect(result).toEqual({
                rank: "-",
                nickname: "CurrentPlayer",
                totalWin: 500,
                avatarUrl: "current-avatar.jpg"
            });
        });

        it("should format current player data with hidden name", () => {
            // Arrange
            const currentPlayer = {
                rank: "5",
                totalWin: 500,
                currentPlayerSettings: {
                    hideName: true,
                    hideAvatar: false,
                    nickname: "CurrentPlayer",
                    avatarUrl: "current-avatar.jpg"
                }
            };

            // Act
            const result = comp["formatCurrentPlayerData"](currentPlayer);

            // Assert
            expect(result.nickname).toBe("");
        });

        it("should format current player data with hidden avatar", () => {
            // Arrange
            const currentPlayer = {
                rank: "5",
                totalWin: 500,
                currentPlayerSettings: {
                    hideName: false,
                    hideAvatar: true,
                    nickname: "CurrentPlayer",
                    avatarUrl: "current-avatar.jpg"
                }
            };

            // Act
            const result = comp["formatCurrentPlayerData"](currentPlayer);

            // Assert
            expect(result.avatarUrl).toBe("");
        });

        it("should handle current player without settings", () => {
            // Arrange
            const currentPlayer = {
                rank: "5",
                totalWin: 500,
                currentPlayerSettings: null
            };

            // Act
            const result = comp["formatCurrentPlayerData"](currentPlayer);

            // Assert
            expect(result).toEqual({
                rank: "-",
                nickname: "",
                totalWin: 500,
                avatarUrl: ""
            });
        });
    });

    describe("Test method onDestroy", () => {
        it("should cleanup socket handler on destroy", () => {
            // Arrange
            comp.init(mockSocket, "mini-roulette");
            (comp as any).onLoad(); // Setup socket handler

            // Act
            (comp as any).onDestroy();

            // Assert
            expect(mockSocket.off).toHaveBeenCalled();
        });

        it("should not throw error when socket handler is null", () => {
            // Act & Assert
            expect(() => (comp as any).onDestroy()).not.toThrow();
        });
    });
}); 