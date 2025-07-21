import { Socket } from "socket.io-client";
import RouletteLeaderBoardSetting from "../../../assets/games/_roulette-s/scripts/roulette-leader-board-setting";
import RouletteToggle, { RouletteToggleType } from "../../../assets/games/_roulette-s/scripts/roulette-toggle";

/*
 * Unit tests for RouletteLeaderBoardSetting class
 */

describe("Test class RouletteLeaderBoardSetting", () => {
    let node: cc.Node;
    let comp: RouletteLeaderBoardSetting;
    let mockSocket: jest.Mocked<Socket>;
    let mockNameToggle: jest.Mocked<RouletteToggle>;
    let mockAvatarToggle: jest.Mocked<RouletteToggle>;

    beforeEach(() => {
        // Create mock socket
        mockSocket = {
            connected: true,
            emit: jest.fn(),
            on: jest.fn(),
            off: jest.fn()
        } as any;

        // Create mock toggles
        mockNameToggle = {
            setToggleCallback: jest.fn(),
            setEnabled: jest.fn(),
            getIsEnabled: jest.fn().mockReturnValue(true)
        } as any;

        mockAvatarToggle = {
            setToggleCallback: jest.fn(),
            setEnabled: jest.fn(),
            getIsEnabled: jest.fn().mockReturnValue(true)
        } as any;

        // Create component
        node = new cc.Node();
        comp = node.addComponent(RouletteLeaderBoardSetting);
        
        // Setup properties
        comp.nameToggle = mockNameToggle;
        comp.avatarToggle = mockAvatarToggle;
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe("Test method onLoad", () => {
        it("should setup toggle callbacks for both toggles", () => {
            // Act
            (comp as any).onLoad();

            // Assert
            expect(mockNameToggle.setToggleCallback).toHaveBeenCalledWith(expect.any(Function));
            expect(mockAvatarToggle.setToggleCallback).toHaveBeenCalledWith(expect.any(Function));
        });

        it("should handle missing name toggle", () => {
            // Arrange
            comp.nameToggle = null;

            // Act & Assert
            expect(() => (comp as any).onLoad()).not.toThrow();
            expect(mockAvatarToggle.setToggleCallback).toHaveBeenCalledWith(expect.any(Function));
        });

        it("should handle missing avatar toggle", () => {
            // Arrange
            comp.avatarToggle = null;

            // Act & Assert
            expect(() => (comp as any).onLoad()).not.toThrow();
            expect(mockNameToggle.setToggleCallback).toHaveBeenCalledWith(expect.any(Function));
        });
    });

    describe("Test method onEnable", () => {
        it("should get leaderboard settings when enabled", () => {
            // Arrange
            const getSettingsSpy = jest.spyOn(comp as any, 'getLeaderboardSettings');

            // Act
            (comp as any).onEnable();

            // Assert
            expect(getSettingsSpy).toHaveBeenCalled();
        });
    });

    describe("Test method onDestroy", () => {
        it("should cleanup socket handler when socket and handler exist", () => {
            // Arrange
            comp.init(mockSocket, "mini-roulette");
            (comp as any).socketHandler = jest.fn();

            // Act
            (comp as any).onDestroy();

            // Assert
            expect(mockSocket.off).toHaveBeenCalledWith("mini-roulette", (comp as any).socketHandler);
        });

        it("should not throw error when socket is null", () => {
            // Arrange
            (comp as any).socket = null;

            // Act & Assert
            expect(() => (comp as any).onDestroy()).not.toThrow();
        });

        it("should not throw error when socket handler is null", () => {
            // Arrange
            comp.init(mockSocket, "mini-roulette");
            (comp as any).socketHandler = null;

            // Act & Assert
            expect(() => (comp as any).onDestroy()).not.toThrow();
        });
    });

    describe("Test method init", () => {
        it("should initialize socket and gameName correctly", () => {
            // Arrange
            const gameName = "mini-roulette";

            // Act
            comp.init(mockSocket, gameName);

            // Assert
            expect((comp as any).socket).toBe(mockSocket);
            expect((comp as any).gameName).toBe(gameName);
        });

        it("should setup socket handler", () => {
            // Arrange
            const gameName = "mini-roulette";

            // Act
            comp.init(mockSocket, gameName);

            // Assert
            expect((comp as any).socketHandler).toBeDefined();
            expect(mockSocket.on).toHaveBeenCalledWith(gameName, (comp as any).socketHandler);
        });
    });

    describe("Test method getLeaderboardSettings", () => {
        it("should emit getLeaderboardSettings when socket is connected", () => {
            // Arrange
            comp.init(mockSocket, "mini-roulette");

            // Act
            comp.getLeaderboardSettings();

            // Assert
            expect(mockSocket.emit).toHaveBeenCalledWith("getLeaderboardSettings");
        });

        it("should not emit when socket is not connected", () => {
            // Arrange
            mockSocket.connected = false;
            comp.init(mockSocket, "mini-roulette");

            // Act
            comp.getLeaderboardSettings();

            // Assert
            expect(mockSocket.emit).not.toHaveBeenCalled();
        });

        it("should not emit when socket is null", () => {
            // Arrange
            (comp as any).socket = null;

            // Act
            comp.getLeaderboardSettings();

            // Assert
            expect(mockSocket.emit).not.toHaveBeenCalled();
        });
    });

    describe("Test method onSocketData", () => {
        it("should update toggles when leaderboardSettings data is received", () => {
            // Arrange
            const settings = { hideName: true, hideAvatar: false };
            const data = { leaderboardSettings: settings };
            const updateSpy = jest.spyOn(comp as any, 'updateTogglesFromSettings');

            // Act
            (comp as any).onSocketData(data);

            // Assert
            expect(updateSpy).toHaveBeenCalledWith(settings);
        });

        it("should not update toggles when no leaderboardSettings data", () => {
            // Arrange
            const data = { otherData: "test" };
            const updateSpy = jest.spyOn(comp as any, 'updateTogglesFromSettings');

            // Act
            (comp as any).onSocketData(data);

            // Assert
            expect(updateSpy).not.toHaveBeenCalled();
        });
    });

    describe("Test method updateTogglesFromSettings", () => {
        it("should update name toggle correctly when hideName is true", () => {
            // Arrange
            const settings = { hideName: true, hideAvatar: false };

            // Act
            (comp as any).updateTogglesFromSettings(settings);

            // Assert
            expect(mockNameToggle.setEnabled).toHaveBeenCalledWith(false);
        });

        it("should update name toggle correctly when hideName is false", () => {
            // Arrange
            const settings = { hideName: false, hideAvatar: false };

            // Act
            (comp as any).updateTogglesFromSettings(settings);

            // Assert
            expect(mockNameToggle.setEnabled).toHaveBeenCalledWith(true);
        });

        it("should update avatar toggle correctly when hideAvatar is true", () => {
            // Arrange
            const settings = { hideName: false, hideAvatar: true };

            // Act
            (comp as any).updateTogglesFromSettings(settings);

            // Assert
            expect(mockAvatarToggle.setEnabled).toHaveBeenCalledWith(false);
        });

        it("should update avatar toggle correctly when hideAvatar is false", () => {
            // Arrange
            const settings = { hideName: false, hideAvatar: false };

            // Act
            (comp as any).updateTogglesFromSettings(settings);

            // Assert
            expect(mockAvatarToggle.setEnabled).toHaveBeenCalledWith(true);
        });

        it("should handle missing name toggle", () => {
            // Arrange
            comp.nameToggle = null;
            const settings = { hideName: true, hideAvatar: false };

            // Act & Assert
            expect(() => (comp as any).updateTogglesFromSettings(settings)).not.toThrow();
            expect(mockAvatarToggle.setEnabled).toHaveBeenCalledWith(true);
        });

        it("should handle missing avatar toggle", () => {
            // Arrange
            comp.avatarToggle = null;
            const settings = { hideName: false, hideAvatar: true };

            // Act & Assert
            expect(() => (comp as any).updateTogglesFromSettings(settings)).not.toThrow();
            expect(mockNameToggle.setEnabled).toHaveBeenCalledWith(true);
        });
    });

    describe("Test method onToggleChanged", () => {
        beforeEach(() => {
            comp.init(mockSocket, "mini-roulette");
        });

        it("should update settings when name toggle is changed to enabled", () => {
            // Arrange
            const updateSpy = jest.spyOn(comp as any, 'updateLeaderboardSettings');

            // Act
            (comp as any).onToggleChanged(RouletteToggleType.Name, true);

            // Assert
            expect(updateSpy).toHaveBeenCalledWith({
                hideName: false,
                hideAvatar: false
            });
        });

        it("should update settings when name toggle is changed to disabled", () => {
            // Arrange
            const updateSpy = jest.spyOn(comp as any, 'updateLeaderboardSettings');

            // Act
            (comp as any).onToggleChanged(RouletteToggleType.Name, false);

            // Assert
            expect(updateSpy).toHaveBeenCalledWith({
                hideName: true,
                hideAvatar: false
            });
        });

        it("should update settings when avatar toggle is changed to enabled", () => {
            // Arrange
            const updateSpy = jest.spyOn(comp as any, 'updateLeaderboardSettings');

            // Act
            (comp as any).onToggleChanged(RouletteToggleType.Avatar, true);

            // Assert
            expect(updateSpy).toHaveBeenCalledWith({
                hideName: false,
                hideAvatar: false
            });
        });

        it("should update settings when avatar toggle is changed to disabled", () => {
            // Arrange
            const updateSpy = jest.spyOn(comp as any, 'updateLeaderboardSettings');

            // Act
            (comp as any).onToggleChanged(RouletteToggleType.Avatar, false);

            // Assert
            expect(updateSpy).toHaveBeenCalledWith({
                hideName: false,
                hideAvatar: true
            });
        });

        it("should send empty object when both toggles are missing", () => {
            // Arrange
            comp.nameToggle = null;
            comp.avatarToggle = null;
            const updateSpy = jest.spyOn(comp as any, 'updateLeaderboardSettings');

            // Act
            (comp as any).onToggleChanged(RouletteToggleType.Name, true);

            // Assert
            expect(updateSpy).toHaveBeenCalledWith({});
        });

        it("should use current toggle states when getting enabled status", () => {
            // Arrange
            mockNameToggle.getIsEnabled = jest.fn().mockReturnValue(false);
            mockAvatarToggle.getIsEnabled = jest.fn().mockReturnValue(true);
            const updateSpy = jest.spyOn(comp as any, 'updateLeaderboardSettings');

            // Act
            (comp as any).onToggleChanged(RouletteToggleType.Name, true);

            // Assert
            expect(updateSpy).toHaveBeenCalledWith({
                hideName: false,
                hideAvatar: false
            });
        });
    });

    describe("Test method updateLeaderboardSettings", () => {
        it("should emit updateLeaderboardSettings when socket is connected", () => {
            // Arrange
            comp.init(mockSocket, "mini-roulette");
            const settings = { hideName: true, hideAvatar: false };

            // Act
            (comp as any).updateLeaderboardSettings(settings);

            // Assert
            expect(mockSocket.emit).toHaveBeenCalledWith("updateLeaderboardSettings", settings);
        });

        it("should not emit when socket is not connected", () => {
            // Arrange
            mockSocket.connected = false;
            comp.init(mockSocket, "mini-roulette");
            const settings = { hideName: true, hideAvatar: false };

            // Act
            (comp as any).updateLeaderboardSettings(settings);

            // Assert
            expect(mockSocket.emit).not.toHaveBeenCalled();
        });

        it("should not emit when socket is null", () => {
            // Arrange
            (comp as any).socket = null;
            const settings = { hideName: true, hideAvatar: false };

            // Act
            (comp as any).updateLeaderboardSettings(settings);

            // Assert
            expect(mockSocket.emit).not.toHaveBeenCalled();
        });
    });
}); 