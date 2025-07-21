import GameBase from "../../../assets/games/_base/GameBase";
import GameBaseBetHandler from "../../../assets/games/_base/handlers/GameBaseBetHandler";

jest.mock("../../../assets/games/_base/GameBase", () => {
    const mockedModule = jest.requireActual("../../mocks/MockedGameBase");
    return {
        ...mockedModule
    };
});
jest.mock("../../../assets/games/_base/view-models/RoomPlayer", () => {
    return jest.fn().mockImplementation(() => {
        return {
            storePlayerToCache: jest.fn()
        };
    });
});

describe("Test class GameBaseBetHandler", () => {
    let node: cc.Node;
    let main: GameBase;
    let handler: GameBaseBetHandler;
    beforeEach(() => {
        node = new cc.Node();
        main = new GameBase();
        handler = new GameBaseBetHandler(main);
    });

    // it("GameBaseBetHandler.handle()", () => {
    //     // Arrange
    //     // Act
    //     // Assert
    // });

    // beforeEach(() => {
    // });

    describe("Test method handleEndBet", () => {
        it("Case: Data empty", () => {
            // Arrange
            const data = {};

            // Act

            // Assert
            expect(() => handler.handleEndBet(data)).not.toThrow();
        });

        it("Case: Data endBet = 5", () => {
            // Arrange
            const data = { endBet: 5 };

            // Act
            handler.handleEndBet(data);

            // Assert
            expect(main.showAcceptedBet).toBeCalledWith(data.endBet);
            expect(main.showProcessingWarning).toBeCalledWith(false);
        });

        it("Case: Data endBet = -1", () => {
            // Arrange
            const data = { endBet: -1 };

            // Act
            handler.handleEndBet(data);

            // Assert
            expect(main.showAcceptedBet).not.toBeCalled();
            expect(main.showProcessingWarning).toBeCalledWith(false);
        });
    });

    // describe("Test method handleChipInMainRoom", () => {
    //     it("Case: ", () => {
    //         // Arrange

    //         // Act
    //         handler.handleChipInMainRoom();

    //         // Assert
    //     });
    // });

    // describe("Test method handlePlayerChipAction", () => {
    //     it("Case: ", () => {
    //         // Arrange

    //         // Act
    //         handler.handlePlayerChipAction();

    //         // Assert
    //     });
    // });

    // describe("Test method placeOwnChip", () => {
    //     it("Case: ", () => {
    //         // Arrange

    //         // Act
    //         handler.placeOwnChip();

    //         // Assert
    //     });
    // });

    // describe("Test method placePlayerChip", () => {
    //     it("Case: ", () => {
    //         // Arrange

    //         // Act
    //         handler.placePlayerChip();

    //         // Assert
    //     });
    // });

    // describe("Test method updatePlayerSlotDataStorage", () => {
    //     it("Case: ", () => {
    //         // Arrange

    //         // Act
    //         handler.updatePlayerSlotDataStorage();

    //         // Assert
    //     });
    // });

    // describe("Test method updateOtherDataStorage", () => {
    //     it("Case: ", () => {
    //         // Arrange

    //         // Act
    //         handler.updateOtherDataStorage();

    //         // Assert
    //     });
    // });

    // describe("Test method placeTotalChips", () => {
    //     it("Case: ", () => {
    //         // Arrange

    //         // Act
    //         handler.placeTotalChips();

    //         // Assert
    //     });
    // });
});
