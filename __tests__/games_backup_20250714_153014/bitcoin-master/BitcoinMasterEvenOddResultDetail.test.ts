import GameUtils from "../../../assets/common/GameUtils";
import { BMBetType } from "../../../assets/games/bitcoin-master/view-models/BitcoinMasterCommon";
import BitcoinMasterEvenOddResultDetail from "../../../assets/games/bitcoin-master/view-models/BitcoinMasterEvenOddResultDetail";
import BitcoinMasterUtils from "../../../assets/games/bitcoin-master/view-models/BitcoinMasterUtils";

jest.mock("../../../assets/games/bitcoin-master/view-models/BitcoinMasterUtils", () => ({
    default: class {
        public static getEvenOddResult(value) {
            const result = value.toString().split(".")[0];
            return result.slice(-1);
        }
    }
}));


describe("Test class BitcoinMasterEvenOddResultDetail", () => {
    let node: cc.Node;
    let comp: BitcoinMasterEvenOddResultDetail;
    beforeEach(() => {
        node = new cc.Node();
        comp = node.addComponent(BitcoinMasterEvenOddResultDetail);
        comp.result = new cc.Node().addComponent(cc.Label);
        comp.number = new cc.Node().addComponent(cc.Label);
    });
    describe("Test method setColor", () => {
        it("Case: ", () => {
            // Arrange
            const color = cc.Color.WHITE;
            comp.evenOddValue = 1;

            // Act
            comp.setColor();

            // Assert
            expect(comp.result.node.color).toEqual(color.fromHEX("#F3485F"));
            expect(comp.number.node.color).toEqual(color.fromHEX("#F3485F"));
        });
    });

    describe("Test method setData", () => {
        it("Case: ", () => {
            // Arrange
            const result = 123;
            const evenOddValue = parseInt(BitcoinMasterUtils.getEvenOddResult(result));
            const message = evenOddValue % 2 ? GameUtils.getBetChoiceString(BMBetType.Odd) : GameUtils.getBetChoiceString(BMBetType.Even);

            // Act
            comp.setData(result);

            // Assert
            expect(comp.result.string).toMatch(message);
            expect(comp.number.string).toMatch(` (${evenOddValue})`);
        });
    });
});
