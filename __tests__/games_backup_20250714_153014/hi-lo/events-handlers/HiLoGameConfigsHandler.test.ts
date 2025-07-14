import { ConfigsType, HiLoGameConfigsHandler } from "../../../../assets/games/hi-lo/events-handlers/HiLoGameConfigsHandler";
import HiLoGameConfigs from "../../../../assets/games/hi-lo/events-models/HiLoGameConfigs";
import HiLoGameData from "../../../../assets/games/hi-lo/events-models/HiLoGameData";
import HiLo from "../../../../assets/games/hi-lo/view-models/HiLo";

jest.mock("../../../../assets/games/hi-lo/events-models/HiLoGameData", () => ({
    default: jest.fn().mockImplementation(() => {
        return {
            constructor: jest.fn()
        };
    })
}));

describe("HiLoGameConfigsHandler", () => {
    let configsHandler: any;
    let gameData: HiLoGameData;
    let mainGame: HiLo;
    let data: ConfigsType;
    beforeEach(() => {
        configsHandler = new HiLoGameConfigsHandler(gameData);
        configsHandler.gameData = new HiLoGameData(mainGame);
        configsHandler.gameData.configs = new HiLoGameConfigs();
        data = {
            gameConfigs: {
                minBet: 1,
                maxBet: 2000,
                chips: ["1", "5", "10", "50", "100", "200", "500", "1000", "2000"]
            }
        };
    });

    describe("verifyEvent", () => {
        it("should return true if data has gameConfigs", () => {
            // Arrange

            // Act
            configsHandler.verifyEvent(data);

            // Assert
            expect(configsHandler.verifyEvent(data)).toEqual(true);
        });

        it("should return false if data has not gameConfigs", () => {
            // Arrange
            data.gameConfigs = null;

            // Act
            configsHandler.verifyEvent(data);

            // Assert
            expect(configsHandler.verifyEvent(data)).toEqual(false);
        });
    });

    describe("handle", () => {
        it("should call configs.change", () => {
            // Arrange
            const changeConfigsSpy = jest.spyOn(configsHandler.gameData.configs, "change");

            // Act
            configsHandler.handle(data);

            // Assert
            expect(changeConfigsSpy).toBeCalledTimes(1);
            expect(changeConfigsSpy).toBeCalledWith(data.gameConfigs);
        });
    });
});
