import CallModelBase from "../../../../assets/games/_casino/event-models/CallModelBase";
import TexasCallHandler, { TexasHoldemCall } from "../../../../assets/games/texas-holdem-poker/event-handlers/texas-call-handler";
import TexasGameDataModel from "../../../../assets/games/texas-holdem-poker/event-models/texas-game-data-model";
import TexasPlaceBetModel from "../../../../assets/games/texas-holdem-poker/event-models/texas-place-bet-model";
import { callData } from "./../_base";

jest.mock("../../../../assets/games/texas-holdem-poker/event-models/texas-game-data-model", () => ({
    default: jest.fn().mockImplementation(() => {
        return {
            constructor: jest.fn()
        };
    })
}));

jest.mock("../../../../assets/games/texas-holdem-poker/event-models/texas-place-bet-model", () => ({
    default: jest.fn().mockImplementation(() => {
        return {
            updateTotalBet: jest.fn()
        };
    })
}));

describe("TexasHoldemCallEventHandler", () => {
    let callHandlerHandler: any;
    let gameData: TexasGameDataModel;
    let data: TexasHoldemCall;
    beforeEach(() => {
        callHandlerHandler = new TexasCallHandler(gameData);
        callHandlerHandler.gameData = new TexasGameDataModel();
        callHandlerHandler.gameData.placeBetModel = new TexasPlaceBetModel();
        callHandlerHandler.gameData.callModel = new CallModelBase();
        data = callData;
    });

    describe("verifyEvent", () => {
        it("should return true if data has  callHandler", () => {
            // Arrange

            // Act
            callHandlerHandler.verifyEvent(data);

            // Assert
            expect(callHandlerHandler.verifyEvent(data)).toEqual(true);
        });

        it("should return false if data has not  callHandler", () => {
            // Arrange
            const cloneData = { ...data };
            cloneData.call = null;

            // Act
            callHandlerHandler.verifyEvent(cloneData);

            // Assert
            expect(callHandlerHandler.verifyEvent(cloneData)).toEqual(false);
        });
    });

    describe("handle", () => {
        it("should call callHandler.changeDataAfterCall", () => {
            // Arrange
            const changeDataBetSpy = jest.spyOn(callHandlerHandler.gameData.callModel, "changeDataAfterCall");
            const covertData = {
                communityCards: data.call.communityCards,
                combinationResult: data.call.combinationResult,
                totalAmount: data.call.totalAmount
            };

            // Act
            callHandlerHandler.handle(data);

            // Assert
            expect(changeDataBetSpy).toBeCalledTimes(1);
            expect(changeDataBetSpy).toBeCalledWith(covertData);
        });
    });
});
