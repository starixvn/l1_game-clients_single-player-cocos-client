import { CardModel } from "../../../assets/common/new-card/view-models/NewCard";
import HiLoCardChoiceView from "../../../assets/games/hi-lo/view-models/HiLoCardChoiceView";

describe("HiLoCardChoiceView", () => {
    let node: cc.Node;
    let comp: HiLoCardChoiceView;
    beforeEach(() => {
        node = new cc.Node();
        comp = node.addComponent(HiLoCardChoiceView);
        comp.rank = node.addComponent(cc.Label);
        comp.suit = node.addComponent(cc.Sprite);
        comp.atlas = new cc.SpriteAtlas();
    });
    describe("setData", () => {
        beforeEach(() => {
            comp.atlas.getSpriteFrame = jest.fn();
        });
        it("should set red color for heart or diamond suit", () => {
            // Arrange
            const card: CardModel = {
                rank: "3",
                suit: 1
            };

            // Act
            comp.setData(card);

            // Assert
            expect(comp.rank.node.color).toEqual(new cc.Color(255, 4, 4));
        });

        it("should set red color for club or spade suit", () => {
            // Arrange
            const card: CardModel = {
                rank: "3",
                suit: 2
            };
            comp.rank.node.color = cc.Color.BLACK;

            // Act
            comp.setData(card);

            // Assert
            expect(comp.rank.node.color).toEqual(cc.Color.BLACK);
        });

        it("should assign rank card for rank node", () => {
            // Arrange
            const card: CardModel = {
                rank: "3",
                suit: 2
            };

            // Act
            comp.setData(card);

            // Assert
            expect(comp.rank.string).toEqual(card.rank);
        });
    });
});
