import HiLoBetChipItem from "../../../assets/games/hi-lo/view-models/HiLoBetChipItem";

describe("HiLoBetChipItem", () => {
    let node: cc.Node;
    let comp: HiLoBetChipItem;
    beforeEach(() => {
        node = new cc.Node();
        comp = node.addComponent(HiLoBetChipItem);
        comp.number = node.addComponent(cc.Label);
        comp.selectedBg = node.addComponent(cc.Sprite);
    });

    describe("renderBetChipItem", () => {
        it("should render bet chip with correct value ", () => {
            //Arrange
            const number = 50;

            // Act
            comp.renderBetChipItem(number);

            // Assert
            expect(comp.number.string).toMatch(number.toString());
            expect(comp.node.name).toMatch(number.toString());
        });
    });

    describe("setSelectedBg", () => {
        it("should set background for selected chip ", () => {
            //Arrange
            const isSelected = true;

            // Act
            comp.setSelectedBg(isSelected);

            // Assert
            expect(comp.selectedBg.node.active).toEqual(isSelected);
        });
    });
});
