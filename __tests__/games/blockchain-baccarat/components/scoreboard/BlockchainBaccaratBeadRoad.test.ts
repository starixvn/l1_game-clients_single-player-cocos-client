import * as lodash from "lodash";
window.modules = { lodash };
import BlockchainBaccaratBeadRoad from "../../../../../assets/games/blockchain-baccarat/components/score-board/view-models/BlockchainBaccaratBeadRoad";
import { BlockchainBaccaratRoundHistory } from "../../../../../assets/games/blockchain-baccarat/event-models/BlockchainBaccaratModel";

describe("BlockchainBaccaratBeadRoad", () => {
    let comp: BlockchainBaccaratBeadRoad;
    beforeEach(() => {
        comp = new cc.Node().addComponent(BlockchainBaccaratBeadRoad);
    });

    describe("render", () => {
        it("should run expected", () => {
            // arrange
            const roundHistory: BlockchainBaccaratRoundHistory[] = [];
            const round: BlockchainBaccaratRoundHistory = {
                roundId: 0,
                result: {
                    player: { card1: { rank: "1", suit: 1 }, card2: { rank: "1", suit: 1 }, card3: { rank: "1", suit: 1 } },
                    banker: { card1: { rank: "1", suit: 2 }, card2: { rank: "1", suit: 2 }, card3: { rank: "3", suit: 2 } }
                },
                settlementResult: {
                    player: false,
                    banker: true,
                    tie: false,
                    small: false,
                    big: true,
                    playerPair: true,
                    bankerPair: true,
                    natural: false
                }
            };
            for (let i = 0; i < 100; i++) {
                roundHistory.unshift({ ...round, roundId: i + 1 });
            }
            comp.addNewItem = jest.fn();
            // act
            comp.render(roundHistory);

            // assert
            expect(roundHistory.length).toBe(60);
            expect(roundHistory[0].roundId).toBe(41);
            expect(roundHistory[59].roundId).toBe(100);
            expect(comp.addNewItem).toHaveBeenCalledTimes(60);
            expect(comp.addNewItem).toHaveBeenCalledWith(roundHistory[0]);
            expect(comp.addNewItem).toHaveBeenCalledWith(roundHistory[59]);
        });
    });
});
