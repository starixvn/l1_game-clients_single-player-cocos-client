import BaccaratBigRoad from "../../../../../assets/games/_baccarat/view-models/BaccaratBigRoad";
import BlockChainBaccaratBigRoad from "../../../../../assets/games/blockchain-baccarat/components/score-board/view-models/BlockchainBaccaratBigRoad";

describe("BlockChainBaccaratBigRoad", () => {
    let node: cc.Node;
    let comp: BlockChainBaccaratBigRoad;
    beforeEach(() => {
        node = new cc.Node();
        comp = node.addComponent(BlockChainBaccaratBigRoad);
    });

    describe("renderScoreBoardInGame", () => {
        // arrange
        beforeEach(() => {
            BaccaratBigRoad.prototype.renderScoreBoardInGame = jest.fn();
        });

        it("should set firstRender is false", () => {
            // act
            comp.renderScoreBoardInGame([]);

            // assert
            expect(comp.getFirstRender).toBe(false);
        });

        it("should set isRenderedNext is false", () => {
            // act
            comp.renderScoreBoardInGame([]);

            // assert
            expect(comp.getIsRenderedNext).toBe(false);
        });

        it("should call super renderScoreBoardInGame", () => {
            // act
            comp.renderScoreBoardInGame([]);

            // assert
            expect(BaccaratBigRoad.prototype.renderScoreBoardInGame).toHaveBeenCalledWith([]);
        });
    });
});
