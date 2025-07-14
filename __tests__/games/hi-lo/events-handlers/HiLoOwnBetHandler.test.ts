import { Durations } from "../../../../assets/games/_new/_base/game-data-management/models/durations";
import { HiLoBetType, HiLoOwnBetHandler } from "../../../../assets/games/hi-lo/events-handlers/HiLoOwnBetHandler";
import HiLoGameData from "../../../../assets/games/hi-lo/events-models/HiLoGameData";
import { HiLoOwnBetsModel } from "../../../../assets/games/hi-lo/events-models/HiLoOwnBetsModel";
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

describe("HiLoOwnBetHandler", () => {
    let ownBetHandler: any;
    let gameData: HiLoGameData;
    let mainGame: HiLo;
    let data: HiLoBetType;
    const ownBetsdata = {
        ownBets: {
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
        }
    };

    beforeEach(() => {
        ownBetHandler = new HiLoOwnBetHandler(gameData);
        ownBetHandler.gameData = new HiLoGameData(mainGame);
        ownBetHandler.gameData.ownBetsModel = new HiLoOwnBetsModel();
        ownBetHandler.gameData.stateModel = new HiLoStateModel();
        ownBetHandler.gameData.roundCounter = new HiLoRoundCounter();
        ownBetHandler.gameData.durations = new Durations();
        data = {
            ownBets: null
        };
    });

    describe("verifyEvent", () => {
        it("should return false if data has not gameConfigs", () => {
            // Arrange

            // Act
            ownBetHandler.verifyEvent(data);

            // Assert
            expect(ownBetHandler.verifyEvent(data)).toEqual(false);
        });

        it("should return true if data has ownBets", () => {
            // Arrange
            data.ownBets = ownBetsdata.ownBets;

            // Act
            ownBetHandler.verifyEvent(data);

            // Assert
            expect(ownBetHandler.verifyEvent(data)).toEqual(true);
        });
    });

    describe("handle", () => {
        describe("When ownBets has roundId", () => {
            it("should call configs.change", () => {
                // Arrange
                const changeConfigsSpy = jest.spyOn(ownBetHandler.gameData.ownBetsModel, "change");

                // Act
                ownBetHandler.handle(ownBetsdata);

                // Assert
                expect(changeConfigsSpy).toBeCalledWith(ownBetsdata.ownBets, HiLoOwnBetsModel.Events.CHANGE);
            });

            it("should call stateModel.inTurn", () => {
                // Arrange
                const inTurnStateSpy = jest.spyOn(ownBetHandler.gameData.stateModel, "inTurn");

                // Act
                ownBetHandler.handle(ownBetsdata);

                // Assert
                expect(inTurnStateSpy).toBeCalledTimes(1);
                expect(inTurnStateSpy).toBeCalledWith();
            });

            it("should set remaining time", () => {
                // Act
                ownBetHandler.handle(ownBetsdata);

                // Assert
                expect(ownBetHandler.gameData.durations.remaining).toEqual(ownBetsdata.ownBets.remainingTime);
            });

            it("should call roundCounter.change", () => {
                // Arrange
                const changeRoundCounterSpy = jest.spyOn(ownBetHandler.gameData.roundCounter, "change");

                // Act
                ownBetHandler.handle(ownBetsdata);

                // Assert
                expect(changeRoundCounterSpy).toHaveBeenCalled();
            });
        });

        describe("When ownBets has not roundId", () => {
            it("should call stateModel.prepareNewRound", () => {
                // Arrange
                ownBetsdata.ownBets.roundId = null;
                HiLoStateModel.prototype.prepareNewRound();
                const prepareNewRoundStateSpy = jest.spyOn(ownBetHandler.gameData.stateModel, "prepareNewRound");

                // Act
                ownBetHandler.handle(ownBetsdata);

                // Assert
                expect(prepareNewRoundStateSpy).toBeCalledTimes(1);
            });
        });
    });
});
