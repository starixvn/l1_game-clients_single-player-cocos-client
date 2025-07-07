import SedieMiniRoundHistoryItem from "../../../../assets/common/mini-round-history/sedie/SedieMiniRoundHistoryItem";

describe("Test class SedieMiniRoundHistoryItem", () => {
    let node: cc.Node;
    let comp: SedieMiniRoundHistoryItem;
    beforeEach(() => {
        node = new cc.Node();
        comp = node.addComponent(SedieMiniRoundHistoryItem);
        comp.icon = new cc.Node().addComponent(cc.Sprite);
        comp.dotRed = new cc.SpriteFrame();
        comp.dotWhite = new cc.SpriteFrame();
    });
    describe("Test method setData", () => {
        it("Case 1: red % 2 !== 0", () => {
            // Arrange
            const data = {
                roundId: 910668,
                red: 3
            };

            // Act
            comp.setData(data);

            // Assert
            expect(comp.data).toEqual(data);
            expect(comp.icon.spriteFrame).toEqual(comp.dotRed);
        });

        it("Case 2: red % 2 === 0", () => {
            // Arrange
            const data = {
                roundId: 910668,
                red: 2
            };

            // Act
            comp.setData(data);

            // Assert
            expect(comp.data).toEqual(data);
            expect(comp.icon.spriteFrame).toEqual(comp.dotWhite);
        });
    });
});
