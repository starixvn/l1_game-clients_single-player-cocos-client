import { updateRoundId } from "../../../../assets/games/hi-lo/actions/HiLoRoundCounterAction";
import { HiLoRoundCounter } from "../../../../assets/games/hi-lo/events-models/HiLoRoundCounter";

jest.mock("../../../../assets/games/hi-lo/events-models/HiLoRoundCounter", () => {
    return {
        HiLoRoundCounter: () => ({
            roundId: 123
        })
    };
});

describe("HiLoRoundCounterAction", () => {
    let node: cc.Node;
    let roundCounter: HiLoRoundCounter;
    beforeEach(() => {
        node = new cc.Node();
        roundCounter = new HiLoRoundCounter();
    });
    describe("updateRoundId", () => {
        it("should have game round", () => {
            // Arrange
            const gameRound = node.addComponent(cc.Label);

            // Act
            updateRoundId(gameRound)(roundCounter);

            // Assert
            expect(gameRound.string).toMatch("123");
        });
    });
});
