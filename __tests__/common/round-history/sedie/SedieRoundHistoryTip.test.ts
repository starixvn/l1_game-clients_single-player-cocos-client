import GameUtils from "../../../../assets/common/GameUtils";
import SedieRoundHistoryTip from "../../../../assets/common/round-history/sedie/SedieRoundHistoryTip";

describe("Test class SedieRoundHistoryTip", () => {
    let node: cc.Node;
    let comp: SedieRoundHistoryTip;
    beforeEach(() => {
        node = new cc.Node();
        comp = node.addComponent(SedieRoundHistoryTip);
        comp.red = new cc.Node().addComponent(cc.Label);
        comp.white = new cc.Node().addComponent(cc.Label);
        comp.roundId = new cc.Node().addComponent(cc.Label);
        comp.result = new cc.Node().addComponent(cc.Label);
    });
    describe("Test method setData", () => {
        it("Case 1: even", () => {
            // Arrange
            const data = {
                roundId: 910861,
                red: 2
            };

            // Act
            comp.setData(data);

            // Assert
            expect(comp.roundId.string).toMatch(`#${data.roundId}`);
            expect(comp.result.string).toMatch(GameUtils.getBetChoiceString("even").toUpperCase());
            expect(comp.red.string).toMatch(data.red.toString());
            expect(comp.white.string).toMatch((4 - data.red).toString());
            expect(comp.node.active).toEqual(true);
        });

        it("Case 2: odd", () => {
            // Arrange
            const data = {
                roundId: 910861,
                red: 3
            };

            // Act
            comp.setData(data);

            // Assert
            expect(comp.roundId.string).toMatch(`#${data.roundId}`);
            expect(comp.result.string).toMatch(GameUtils.getBetChoiceString("odd").toUpperCase());
            expect(comp.red.string).toMatch(data.red.toString());
            expect(comp.white.string).toMatch((4 - data.red).toString());
            expect(comp.node.active).toEqual(true);
        });
    });
});
