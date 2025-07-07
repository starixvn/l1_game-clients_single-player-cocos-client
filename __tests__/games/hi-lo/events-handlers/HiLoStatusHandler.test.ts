import { HiLoStatusHandler, HiLoStatusType } from "../../../../assets/games/hi-lo/events-handlers/HiLoStatusHandler";
import HiLoGameData from "../../../../assets/games/hi-lo/events-models/HiLoGameData";
import { HiLoStateModel } from "../../../../assets/games/hi-lo/events-models/HiLoStateModel";
import { HiLoStatusModel } from "../../../../assets/games/hi-lo/events-models/HiLoStatusModel";
import HiLo from "../../../../assets/games/hi-lo/view-models/HiLo";

jest.mock("../../../../assets/games/hi-lo/events-models/HiLoGameData", () => ({
    default: jest.fn().mockImplementation(() => {
        return {
            constructor: jest.fn()
        };
    })
}));

describe("Test class HiLoStatusHandler", () => {
    let statusHandler: any;
    let gameData: HiLoGameData;
    let mainGame: HiLo;
    let data: HiLoStatusType;
    beforeEach(() => {
        statusHandler = new HiLoStatusHandler(gameData);
        statusHandler.gameData = new HiLoGameData(mainGame);
        statusHandler.gameData.statusModel = new HiLoStatusModel();
        statusHandler.gameData.stateModel = new HiLoStateModel();
        data = { status: null, isCollect: null };
    });

    describe("verifyEvent", () => {
        it("should return false if data has not status and isCollect", () => {
            // Act
            statusHandler.verifyEvent(data);

            // Assert
            expect(statusHandler.verifyEvent(data)).toEqual(false);
        });

        it("should return true if data has isCollect", () => {
            // Arrange
            data = { status: null, isCollect: -1 };

            // Act
            statusHandler.verifyEvent(data);

            // Assert
            expect(statusHandler.verifyEvent(data)).toEqual(true);
        });

        it("should return true if data has status", () => {
            // Arrange
            data = { status: { bet: 1, win: true }, isCollect: null };

            // Act
            statusHandler.verifyEvent(data);

            // Assert
            expect(statusHandler.verifyEvent(data)).toEqual(true);
        });
    });

    describe("handle", () => {
        let successfulCollectSpy;
        let collectFailedSpy;
        beforeEach(() => {
            successfulCollectSpy = jest.spyOn(statusHandler, "successfulCollect");
            collectFailedSpy = jest.spyOn(statusHandler.gameData.statusModel, "collectFailed");
        });
        describe("when data has status", () => {
            let collectSpy;
            let hasWonSpy;
            let hasLostSpy;
            beforeEach(() => {
                collectSpy = jest.spyOn(statusHandler.gameData.stateModel, "collect");
                hasWonSpy = jest.spyOn(statusHandler.gameData.statusModel, "hasWon");
                hasLostSpy = jest.spyOn(statusHandler.gameData.statusModel, "hasLost");
            });
            it("should call successfulCollect", () => {
                // Arrange
                data = { status: { bet: 1, win: true }, isCollect: null };

                // Act
                statusHandler.handle(data);

                // Assert
                expect(successfulCollectSpy).toBeCalledTimes(1);
                expect(successfulCollectSpy).toBeCalledWith(data.status);
            });

            describe("when win=true", () => {
                beforeEach(() => {
                    // Arrange
                    data = { status: { bet: 1, win: true }, isCollect: null };
                });
                it("should call statusModel.hasWon", () => {
                    // Act
                    statusHandler.handle(data);
                    // Assert
                    expect(hasWonSpy).toBeCalledTimes(1);
                    expect(hasWonSpy).toBeCalledWith(data.status.bet);
                    expect(hasLostSpy).not.toBeCalled();
                });

                it("should call stateModel.collect", () => {
                    // Act
                    statusHandler.handle(data);
                    // Assert
                    expect(hasWonSpy).toBeCalledTimes(1);
                    expect(hasWonSpy).toBeCalledWith(data.status.bet);
                    expect(collectSpy).toBeCalledTimes(1);
                    expect(collectSpy).toBeCalledWith();
                    expect(hasLostSpy).not.toBeCalled();
                });

                it("should not call statusModel.hasLost", () => {
                    // Act
                    statusHandler.handle(data);
                    // Assert
                    expect(hasLostSpy).not.toBeCalled();
                });
            });

            describe("when win=false", () => {
                beforeEach(() => {
                    // Arrange
                    data = { status: { bet: 1, win: false }, isCollect: null };
                });
                it("should not call statusModel.hasLost", () => {
                    // Act
                    statusHandler.handle(data);
                    // Assert
                    expect(hasLostSpy).toBeCalledTimes(1);
                    expect(hasLostSpy).toBeCalledWith();
                });

                it("should call stateModel.collect", () => {
                    // Act
                    statusHandler.handle(data);
                    // Assert
                    expect(collectSpy).toBeCalledTimes(1);
                    expect(collectSpy).toBeCalledWith();
                    expect(hasWonSpy).not.toBeCalled();
                });

                it("should not call statusModel.hasWon", () => {
                    // Act
                    statusHandler.handle(data);
                    // Assert
                    expect(hasWonSpy).not.toBeCalled();
                });
            });
        });

        describe("when data has not status", () => {
            it("should not call successfulCollect", () => {
                // Arrange
                data = { status: null, isCollect: -1 };

                // Act
                statusHandler.handle(data);

                // Assert
                expect(successfulCollectSpy).not.toBeCalled();
            });
        });

        describe("when data has isCollect === -1", () => {
            it("should not call successfulCollect", () => {
                // Arrange
                data = { status: null, isCollect: -1 };

                // Act
                statusHandler.handle(data);

                // Assert
                expect(collectFailedSpy).toBeCalledTimes(1);
                expect(collectFailedSpy).toBeCalledWith();
            });
        });
    });
});
