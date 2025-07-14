import TexasAutoSettleHandler, { TexasHoldemAutoSettle } from "../../../../assets/games/texas-holdem-poker/event-handlers/texas-auto-settle-handler";
import TexasAutoSettleModel from "../../../../assets/games/texas-holdem-poker/event-models/texas-auto-settle-model";
import TexasGameDataModel from "../../../../assets/games/texas-holdem-poker/event-models/texas-game-data-model";
import TexasSettlementModel from "../../../../assets/games/texas-holdem-poker/event-models/texas-settlement-model";
import { autoSettleData } from "./../_base";

jest.mock("../../../../assets/games/texas-holdem-poker/event-models/texas-game-data-model", () => ({
    default: jest.fn().mockImplementation(() => {
        return {
            constructor: jest.fn()
        };
    })
}));

jest.mock("./../../../../assets/games/texas-holdem-poker/event-models/texas-state-model", () => ({
    default: jest.fn().mockImplementation(() => {
        return {
            updateModel: jest.fn()
        };
    })
}));

describe("TexasHoldemAutoSettleEventHandler", () => {
    let autoSettleHandler: any;
    let gameData: TexasGameDataModel;
    let data: TexasHoldemAutoSettle;
    let dataAfterHandle: any;
    beforeEach(() => {
        autoSettleHandler = new TexasAutoSettleHandler(gameData);
        autoSettleHandler.gameData = new TexasGameDataModel();
        autoSettleHandler.gameData.autoSettleModel = new TexasAutoSettleModel();
        autoSettleHandler.gameData.settlement = new TexasSettlementModel();
        data = autoSettleData;
        dataAfterHandle = {
            dealerCards: data.autoSettle.dealer,
            communityCards: data.autoSettle.communityCards,
            combinationResult: data.autoSettle.combinationResult,
            totalAmount: data.autoSettle.totalAmount,
            step: data.autoSettle.step
        };
    });

    describe("verifyEvent", () => {
        it("should return true if data has  autoSettle", () => {
            // Arrange

            // Act
            autoSettleHandler.verifyEvent(data);

            // Assert
            expect(autoSettleHandler.verifyEvent(data)).toEqual(true);
        });

        it("should return false if data has not  autoSettle", () => {
            // Arrange
            const cloneData = { ...data };
            cloneData.autoSettle = null;

            // Act
            autoSettleHandler.verifyEvent(cloneData);

            // Assert
            expect(autoSettleHandler.verifyEvent(cloneData)).toEqual(false);
        });
    });

    describe("handle", () => {
        it("should call autoSettle.updateModel", () => {
            // Arrange
            autoSettleHandler.isProcessingBet = jest.fn();
            const changeAutoSettleSpy = jest.spyOn(autoSettleHandler.gameData.autoSettleModel, "updateModel");

            // Act
            autoSettleHandler.handle(data);

            // Assert
            expect(changeAutoSettleSpy).toBeCalledTimes(1);
            expect(changeAutoSettleSpy).toBeCalledWith(dataAfterHandle);
        });
    });
});
