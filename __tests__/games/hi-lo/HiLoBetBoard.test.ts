import HiLoBetBoard from "../../../assets/games/hi-lo/view-models/HiLoBetBoard";
import HiLoBetChipItem from "../../../assets/games/hi-lo/view-models/HiLoBetChipItem";
import { mockFuntions } from "../../mocks/TestUtils";

jest.mock("../../../assets/common/GameUtils", () => ({
    default: class {
        public static createNodeFromPrefab() {
            return mockFuntions.createNodeFromPrefab();
        }
    }
}));

function createChipList() {
    const chips = new cc.Node();
    const chip = new cc.Node();
    chip.name = "1";
    chip.addComponent(HiLoBetChipItem);
    chips.addChild(chip);
    return chips;
}
describe("HiLoBetBoard", () => {
    let node: cc.Node;
    let comp: HiLoBetBoard;
    let prefabNode: cc.Node;
    beforeEach(() => {
        node = new cc.Node();
        comp = node.addComponent(HiLoBetBoard);
        comp.disableLayer = new cc.Node();
        comp.leftButton = new cc.Node();
        comp.rightButton = new cc.Node();
        mockFuntions.createNodeFromPrefab = () => {
            prefabNode = new cc.Node();
            //HiLoBetChipItem.prototype.setSelectedBg = jest.fn();
            prefabNode.addComponent(HiLoBetChipItem);
            return prefabNode;
        };
        comp.chips = createChipList();
    });
    describe("disableBetBoard", () => {
        it("should active bet board", () => {
            //Arrange
            const status = false;
            comp.selectedIndex = 1;

            //Act
            comp.disableBetBoard(status);

            //Assert
            expect(comp.disableLayer.active).toEqual(status);
            expect(comp.leftButton.active).toEqual(true);
            expect(comp.rightButton.active).toEqual(true);
        });

        it("should disable bet board", () => {
            //Arrange
            const status = true;
            comp.selectedIndex = 0;

            //Act
            comp.disableBetBoard(status);

            //Assert
            expect(comp.disableLayer.active).toEqual(status);
            expect(comp.leftButton.active).toEqual(false);
            expect(comp.rightButton.active).toEqual(!status);
        });
    });

    describe("updateSelectedBet", () => {
        it("should called setSelectedBg function", () => {
            // Arrange
            const fnBetChip = jest.fn();
            HiLoBetChipItem.prototype.setSelectedBg = fnBetChip;
            const targetName = "1";

            // Act
            comp.updateSelectedBet(targetName);

            // Assert
            expect(HiLoBetChipItem.prototype.setSelectedBg).toBeCalledWith(true);
        });
    });

    describe("createChipNode", () => {
        it("should called renderBetChipItem function", () => {
            // Arrange
            const fnBetChip = jest.fn();
            HiLoBetChipItem.prototype.renderBetChipItem = fnBetChip;
            const value = 1;

            // Act
            const actualValue = comp.createChipNode(value);

            //Assert
            expect(actualValue).toStrictEqual(prefabNode);
        });
    });

    describe("highlightChip", () => {
        it("should set background for selected chip", () => {
            // Arrange
            const chip: cc.Node = new cc.Node();
            chip.addComponent(HiLoBetChipItem);
            const fnBetChip = jest.fn();
            HiLoBetChipItem.prototype.setSelectedBg = fnBetChip;

            // Act
            comp.highlightChip(chip, true);

            //Assert
            expect(fnBetChip).toBeCalledWith(true);
        });
    });
});
