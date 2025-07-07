import { updateGameConfigs } from "../../../../assets/games/hi-lo/actions/HiLoGameConfigsAction";
import HiLoGameConfigs from "../../../../assets/games/hi-lo/events-models/HiLoGameConfigs";
import HiLo from "../../../../assets/games/hi-lo/view-models/HiLo";

jest.mock("../../../../assets/games/hi-lo/view-models/HiLo", () => ({
    default: jest.fn().mockImplementation(() => {
        return {
            betBoardComp: {
                setChipValues: jest.fn()
            }
        };
    })
}));

jest.mock("../../../../assets/games/hi-lo/events-models/HiLoGameConfigs", () => ({
    default: jest.fn().mockImplementation(() => {
        return {
            gameConfigs: {},
            change: jest.fn()
        };
    })
}));

describe("HiLoGameConfigsAction", () => {
    let mainGame: HiLo;
    let gameConfig: HiLoGameConfigs;
    beforeEach(() => {
        mainGame = new HiLo();
        gameConfig = new HiLoGameConfigs();
    });
    describe("updateGameConfigs", () => {
        beforeEach(() => {
            // Act
            updateGameConfigs(mainGame)(gameConfig);
        });

        it("should assign value game config", () => {
            // Assert
            expect(mainGame.betBoardComp.gameConfigs).toEqual(gameConfig.gameConfigs);
        });

        it("should called setChipValues function", () => {
            // Assert
            expect(mainGame.betBoardComp.setChipValues).toBeCalledWith(gameConfig.gameConfigs);
        });
    });
});
