import { BlockchainBaccaratPrediction } from "../../../../../assets/games/blockchain-baccarat/components/score-board/view-models/BlockchainBaccaratPrediction";

describe("BlockchainBaccaratPrediction", () => {
    let comp: BlockchainBaccaratPrediction;
    let bankerNode: cc.Node;
    let playerNode: cc.Node;
    const createNodeChildren = (node: cc.Node) => {
        const bigEyeBoyItem = new cc.Node("bigEyeBoyItem");
        const smallRoadItem = new cc.Node("smallRoadItem");
        const cockroachPigItem = new cc.Node("cockroachPigItem");
        bigEyeBoyItem.children.push(new cc.Node("red"), new cc.Node("blue"));
        smallRoadItem.children.push(new cc.Node("red"), new cc.Node("blue"));
        cockroachPigItem.children.push(new cc.Node("red"), new cc.Node("blue"));
        node.children.push(bigEyeBoyItem, smallRoadItem, cockroachPigItem);
    };

    beforeEach(() => {
        const node = new cc.Node();
        comp = node.addComponent(BlockchainBaccaratPrediction);
        bankerNode = new cc.Node();
        playerNode = new cc.Node();
        createNodeChildren(bankerNode);
        createNodeChildren(playerNode);
        node.children.push(bankerNode, playerNode);
        comp.banker = bankerNode;
        comp.player = playerNode;
    });

    describe("setBanker", () => {
        it("should run correctly when data include undefined", () => {
            // arrange
            const data = [true, undefined, undefined];

            // act
            comp.setBanker(data);

            // assert
            expect(bankerNode.children[0].getChildByName("red").active).toBe(true);
            expect(bankerNode.children[0].getChildByName("blue").active).toBe(false);
            expect(bankerNode.children[1].getChildByName("red").active).toBe(false);
            expect(bankerNode.children[1].getChildByName("blue").active).toBe(false);
            expect(bankerNode.children[2].getChildByName("red").active).toBe(false);
            expect(bankerNode.children[2].getChildByName("blue").active).toBe(false);
        });

        it("should run correctly when data not include undefined", () => {
            // arrange
            const data = [true, false, false];

            // act
            comp.setBanker(data);

            // assert
            expect(bankerNode.children[0].getChildByName("red").active).toBe(true);
            expect(bankerNode.children[0].getChildByName("blue").active).toBe(false);
            expect(bankerNode.children[1].getChildByName("red").active).toBe(false);
            expect(bankerNode.children[1].getChildByName("blue").active).toBe(true);
            expect(bankerNode.children[2].getChildByName("red").active).toBe(false);
            expect(bankerNode.children[2].getChildByName("blue").active).toBe(true);
        });
    });

    describe("setPlayer", () => {
        it("should run correctly when data include undefined", () => {
            // arrange
            const data = [true, undefined, undefined];

            // act
            comp.setPlayer(data);

            // assert
            expect(playerNode.children[0].getChildByName("red").active).toBe(true);
            expect(playerNode.children[0].getChildByName("blue").active).toBe(false);
            expect(playerNode.children[1].getChildByName("red").active).toBe(false);
            expect(playerNode.children[1].getChildByName("blue").active).toBe(false);
            expect(playerNode.children[2].getChildByName("red").active).toBe(false);
            expect(playerNode.children[2].getChildByName("blue").active).toBe(false);
        });

        it("should run correctly when data not include undefined", () => {
            // arrange
            const data = [true, false, false];

            // act
            comp.setPlayer(data);

            // assert
            expect(playerNode.children[0].getChildByName("red").active).toBe(true);
            expect(playerNode.children[0].getChildByName("blue").active).toBe(false);
            expect(playerNode.children[1].getChildByName("red").active).toBe(false);
            expect(playerNode.children[1].getChildByName("blue").active).toBe(true);
            expect(playerNode.children[2].getChildByName("red").active).toBe(false);
            expect(playerNode.children[2].getChildByName("blue").active).toBe(true);
        });
    });

    describe("resetItem", () => {
        it("all children should be inactive", () => {
            // act
            comp.resetItem();

            // assert
            expect(bankerNode.children[0].getChildByName("red").active).toBe(false);
            expect(bankerNode.children[0].getChildByName("blue").active).toBe(false);
            expect(bankerNode.children[1].getChildByName("red").active).toBe(false);
            expect(bankerNode.children[1].getChildByName("blue").active).toBe(false);
            expect(bankerNode.children[2].getChildByName("red").active).toBe(false);
            expect(bankerNode.children[2].getChildByName("blue").active).toBe(false);
            expect(playerNode.children[0].getChildByName("red").active).toBe(false);
            expect(playerNode.children[0].getChildByName("blue").active).toBe(false);
            expect(playerNode.children[1].getChildByName("red").active).toBe(false);
            expect(playerNode.children[1].getChildByName("blue").active).toBe(false);
            expect(playerNode.children[2].getChildByName("red").active).toBe(false);
            expect(playerNode.children[2].getChildByName("blue").active).toBe(false);
        });
    });
});
