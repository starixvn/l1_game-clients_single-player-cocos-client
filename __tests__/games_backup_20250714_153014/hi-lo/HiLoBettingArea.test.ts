import { numberWithCommas } from "../../../assets/common/helpers/NumberHelper";
import HiLoBettingArea, { BettingAreaEvents } from "../../../assets/games/hi-lo/view-models/HiLoBettingArea";

describe("HiLoBettingArea", () => {
    let node: cc.Node;
    let comp: HiLoBettingArea;
    beforeEach(() => {
        node = new cc.Node();
        comp = node.addComponent(HiLoBettingArea);
        comp.disableLayer = new cc.Node();
        comp.animation = new cc.Animation();
        comp.stakeAmount = new cc.Node().addComponent(cc.Label);
    });

    describe("placingBet", () => {
        it("should emit placing bet event", () => {
            // Arrange
            node.emit = jest.fn();

            // Act
            comp.placingBet();

            // Assert
            expect(node.emit).toBeCalledWith(BettingAreaEvents.PLACING_BET, "");
        });
    });

    describe("enableBetChoice", () => {
        it("should enable Bet choice", () => {
            // Arrange
            const status = true;

            // Act
            comp.enableBetChoice(status);

            // Assert
            expect(comp.disableLayer.active).toEqual(false);
        });
    });

    describe("updateStakeAmount", () => {
        it("should set stake amount not animation", () => {
            // Arrange
            const value = 11;
            const animated = false;

            // Act
            comp.updateStakeAmount(value, animated);

            // Assert
            expect(comp.stakeAmount.string).toMatch(numberWithCommas(value, 2));
        });

        it("should set stake amount with animation", () => {
            // Arrange
            const value = 11;
            const animated = true;
            const temp: any = {};
            cc.tween = () => temp;
            cc.tween().to = (a, b, c?) => temp;
            cc.tween().delay = (a) => temp;
            cc.tween().start = () => temp;

            // Act
            comp.updateStakeAmount(value, animated);

            // Assert
            expect(comp.stakeAmount.string).toMatch(numberWithCommas(value, 2));
        });
    });

    describe("resetStakeAmount", () => {
        it("should set stake amount is null", () => {
            // Arrange

            // Act
            comp.resetStakeAmount();

            // Assert
            expect(comp.stakeAmount.string).toMatch("");
        });
    });
});
