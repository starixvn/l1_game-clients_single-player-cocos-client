import { Durations } from "../../../../assets/games/_new/_base/game-data-management/models/durations";
import { HiLoResultHandler, HiLoResultType } from "../../../../assets/games/hi-lo/events-handlers/HiLoResultHandler";
import HiLoGameData from "../../../../assets/games/hi-lo/events-models/HiLoGameData";
import { HiLoResultModel } from "../../../../assets/games/hi-lo/events-models/HiLoResultModel";
import { HiLoRoundCounter } from "../../../../assets/games/hi-lo/events-models/HiLoRoundCounter";
import { HiLoStateModel } from "../../../../assets/games/hi-lo/events-models/HiLoStateModel";
import HiLo from "../../../../assets/games/hi-lo/view-models/HiLo";

jest.mock("../../../../assets/games/hi-lo/events-models/HiLoGameData", () => ({
    default: jest.fn().mockImplementation(() => {
        return {
            constructor: jest.fn()
        };
    })
}));

describe("HiLoResultHandler", () => {
    let resultHandler: any;
    let gameData: HiLoGameData;
    let mainGame: HiLo;
    let data: HiLoResultType;
    beforeEach(() => {
        resultHandler = new HiLoResultHandler(gameData);
        resultHandler.gameData = new HiLoGameData(mainGame);
        resultHandler.gameData.resultModel = new HiLoResultModel();
        resultHandler.gameData.stateModel = new HiLoStateModel();
        resultHandler.gameData.roundCounter = new HiLoRoundCounter();
        resultHandler.gameData.durations = new Durations();
        data = {
            result: null
        };
    });

    describe("verifyEvent", () => {
        it("should return false if data has not gameConfigs", () => {
            // Arrange

            // Act
            resultHandler.verifyEvent(data);

            // Assert
            expect(resultHandler.verifyEvent(data)).toEqual(false);
        });

        it("should return true if data has result", () => {
            // Arrange
            data.result = {
                roundId: 39475,
                result: [
                    {
                        rank: 9,
                        suit: 0
                    }
                ],
                amount: 1,
                betwin: 1,
                totalTurns: 0,
                nextAmounts: {
                    h: 5.62,
                    l: 1.16
                },
                remainingTime: 121
            };

            // Act
            resultHandler.verifyEvent(data);

            // Assert
            expect(resultHandler.verifyEvent(data)).toEqual(true);
        });
    });

    describe("handle", () => {
        beforeEach(() => {
            data.result = {
                roundId: 39475,
                result: [
                    {
                        rank: 9,
                        suit: 0
                    }
                ],
                amount: 1,
                betwin: 1,
                totalTurns: 0,
                nextAmounts: {
                    h: 5.62,
                    l: 1.16
                },
                remainingTime: 121
            };
        });
        it("should call configs.change", () => {
            // Arrange
            const changeConfigsSpy = jest.spyOn(resultHandler.gameData.resultModel, "change");

            // Act
            resultHandler.handle(data);

            // Assert
            expect(changeConfigsSpy).toBeCalledTimes(1);
            expect(changeConfigsSpy).toBeCalledWith(data.result, HiLoResultModel.Events.CHANGE);
        });

        it("should call stateModel.inTurn", () => {
            // Arrange
            const inTurnStateSpy = jest.spyOn(resultHandler.gameData.stateModel, "inTurn");

            // Act
            resultHandler.handle(data);

            // Assert
            expect(inTurnStateSpy).toBeCalledTimes(1);
            expect(inTurnStateSpy).toBeCalledWith();
        });

        it("should set remaining time", () => {
            // Act
            resultHandler.handle(data);

            // Assert
            expect(resultHandler.gameData.durations.remaining).toEqual(data.result.remainingTime);
        });

        it("should call roundCounter.change", () => {
            // Arrange
            const changeRoundCounterSpy = jest.spyOn(resultHandler.gameData.roundCounter, "change");

            // Act
            resultHandler.handle(data);

            // Assert
            expect(changeRoundCounterSpy).toBeCalledTimes(1);
            expect(changeRoundCounterSpy).toBeCalledWith(data.result.roundId);
        });
    });
});
