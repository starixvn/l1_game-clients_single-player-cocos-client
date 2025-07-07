import HiLoCard from "../../../../../assets/games/hi-lo/components/view-models/HiLoCard";

describe("HiLoCard", () => {
    let node: cc.Node;
    let comp: HiLoCard;
    beforeEach(() => {
        node = new cc.Node();
        comp = node.addComponent(HiLoCard);
        comp.largeSuite = node.addComponent(cc.Sprite);
        comp.atlas = new cc.SpriteAtlas();
        comp.card = {
            rank: "A",
            suit: 3
        };
    });
    describe("setLargeSuiteImage", () => {
        describe("should set rank card is A", () => {
            beforeEach(() => {
                // Arrange
                const lowerCaseRank = "3";
                comp.atlas.getSpriteFrame = jest.fn();

                // Act
                comp.setLargeSuiteImage(lowerCaseRank);
            });
            it("should assign width is 64", () => {
                // Assert
                expect(comp.largeSuite.node.width).toEqual(64);
            });

            it("should assign height is 70", () => {
                // Assert
                expect(comp.largeSuite.node.height).toEqual(70);
            });
        });

        describe("should not set rank card is A", () => {
            beforeEach(() => {
                // Arrange
                const lowerCaseRank = "3";
                comp.atlas.getSpriteFrame = jest.fn();
                comp.card = {
                    rank: "k",
                    suit: 1
                };

                // Act
                comp.setLargeSuiteImage(lowerCaseRank);
            });
            it("should assign width is 90", () => {
                // Assert
                expect(comp.largeSuite.node.width).toEqual(90);
            });

            it("should assign height is 135", () => {
                // Assert
                expect(comp.largeSuite.node.height).toEqual(135);
            });
        });
    });
});
