import * as lodash from "lodash";
import { DerivedScoreboards } from "sc-scoreboards";

import BlockchainBaccaratBeadRoad from "../../../../../assets/games/blockchain-baccarat/components/score-board/view-models/BlockchainBaccaratBeadRoad";
import BlockChainBaccaratBigRoad from "../../../../../assets/games/blockchain-baccarat/components/score-board/view-models/BlockchainBaccaratBigRoad";
import BlockchainBaccaratDerivedScoreboard from "../../../../../assets/games/blockchain-baccarat/components/score-board/view-models/BlockchainBaccaratDerivedScoreboard";
import { BlockchainBaccaratPrediction } from "../../../../../assets/games/blockchain-baccarat/components/score-board/view-models/BlockchainBaccaratPrediction";
import BlockchainBaccaratScoreboard from "../../../../../assets/games/blockchain-baccarat/components/score-board/view-models/BlockchainBaccaratScoreBoard";
import { BlockchainBaccaratRoundHistory } from "../../../../../assets/games/blockchain-baccarat/event-models/BlockchainBaccaratModel";

window.modules = { lodash };
describe("BlockchainBaccaratScoreboard", () => {
    let comp: BlockchainBaccaratScoreboard;
    let bigRoads: BlockChainBaccaratBigRoad[];
    let derivedScoreboards: BlockchainBaccaratDerivedScoreboard[];
    let beadRoad: BlockchainBaccaratBeadRoad;
    let prediction: BlockchainBaccaratPrediction;
    let statistic: cc.Node;
    let normal: cc.Node;
    let zoomInBigRoad: cc.Node;
    let zoomInDerivedScoreboards: cc.Node;

    const createBigRoad = () => {
        const bigRoad1 = new cc.Node("BigRoad");
        bigRoads[0] = bigRoad1.addComponent(BlockChainBaccaratBigRoad);
        normal.children.push(bigRoad1);
        const bigRoad2 = new cc.Node("BigRoad");
        bigRoads[1] = bigRoad2.addComponent(BlockChainBaccaratBigRoad);
        zoomInBigRoad.children.push(bigRoad2);
    };

    const createDerivedScoreboard = (number) => {
        const derivedScoreboard1 = new cc.Node();
        derivedScoreboards[number] = derivedScoreboard1.addComponent(BlockchainBaccaratDerivedScoreboard);
        normal.children.push(derivedScoreboard1);
        const derivedScoreboard2 = new cc.Node();
        derivedScoreboards[number + 3] = derivedScoreboard2.addComponent(BlockchainBaccaratDerivedScoreboard);
        zoomInDerivedScoreboards.children.push(derivedScoreboard2);
    };

    const createBeadRoad = () => {
        const beadRoadNode = new cc.Node();
        beadRoad = beadRoadNode.addComponent(BlockchainBaccaratBeadRoad);
        normal.children.push(beadRoadNode);
    };

    const createPrediction = () => {
        const predictionNode = new cc.Node();
        prediction = predictionNode.addComponent(BlockchainBaccaratPrediction);
        return predictionNode;
    };

    const createStatistic = () => {
        statistic = new cc.Node();
        statistic.children.push(
            new cc.Node("player"),
            new cc.Node("banker"),
            new cc.Node("tie"),
            new cc.Node("playerPair"),
            new cc.Node("bankerPair"),
            new cc.Node("big"),
            new cc.Node("small")
        );
        statistic.children.forEach((child) => child.addComponent(cc.Label));
    };

    beforeEach(() => {
        const node = new cc.Node();
        comp = node.addComponent(BlockchainBaccaratScoreboard);
        normal = new cc.Node();
        zoomInBigRoad = new cc.Node();
        zoomInDerivedScoreboards = new cc.Node();
        bigRoads = [undefined, undefined];
        derivedScoreboards = [undefined, undefined, undefined, undefined, undefined, undefined];
        createBigRoad();
        createDerivedScoreboard(0);
        createDerivedScoreboard(1);
        createDerivedScoreboard(2);
        createBeadRoad();
        const predictionNode = createPrediction();
        createStatistic();
        node.children.push(normal, zoomInBigRoad, zoomInDerivedScoreboards, predictionNode, statistic);
        comp.bigRoads = bigRoads;
        comp.derivedScoreboards = derivedScoreboards;
        comp.beadRoad = beadRoad;
        comp.prediction = prediction;
        comp.statistic = statistic;
        comp.derivedScoreBoardController = new DerivedScoreboards({ height: 6 });
    });

    describe("renderScoreBoardInGame", () => {
        it("should run correctly", () => {
            // arrange
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
            bigRoads.forEach((bigRoad) => {
                bigRoad.getData = jest.fn().mockReturnValue([{}]);
                bigRoad.renderScoreBoardInGame = jest.fn();
            });
            comp.derivedScoreBoardController.update = jest.fn();
            comp.derivedScoreBoardController.getScoreboardData = jest.fn().mockReturnValue([]);
            comp.derivedScoreBoardController.getPrediction = jest
                .fn()
                .mockReturnValueOnce([true, undefined, undefined])
                .mockReturnValueOnce([false, undefined, undefined]);
            derivedScoreboards.forEach((board) => {
                board.renderScoreBoard = jest.fn();
            });
            beadRoad.render = jest.fn();
            prediction.resetItem = jest.fn();
            prediction.setBanker = jest.fn();
            prediction.setPlayer = jest.fn();

            // act
            comp.renderScoreBoardInGame([round]);

            // assert
            expect(bigRoads[0].renderScoreBoardInGame).toHaveBeenCalledWith([round]);
            expect(bigRoads[1].renderScoreBoardInGame).toHaveBeenCalledWith([round]);
            expect(comp.derivedScoreBoardController.update).toHaveBeenCalledWith([{}]);
            expect(comp.derivedScoreBoardController.getScoreboardData).toHaveBeenCalledTimes(6);
            expect(derivedScoreboards[0].renderScoreBoard).toHaveBeenCalledWith([]);
            expect(derivedScoreboards[1].renderScoreBoard).toHaveBeenCalledWith([]);
            expect(derivedScoreboards[2].renderScoreBoard).toHaveBeenCalledWith([]);
            expect(derivedScoreboards[3].renderScoreBoard).toHaveBeenCalledWith([]);
            expect(derivedScoreboards[4].renderScoreBoard).toHaveBeenCalledWith([]);
            expect(derivedScoreboards[5].renderScoreBoard).toHaveBeenCalledWith([]);
            expect(beadRoad.render).toHaveBeenCalledWith([round]);
            expect(prediction.resetItem).toHaveBeenCalled();
            expect(prediction.setBanker).toHaveBeenCalledWith([true, undefined, undefined]);
            expect(prediction.setPlayer).toHaveBeenCalledWith([false, undefined, undefined]);
            expect(statistic.getChildByName("player").getComponent(cc.Label).string).toBe("0");
            expect(statistic.getChildByName("banker").getComponent(cc.Label).string).toBe("1");
            expect(statistic.getChildByName("tie").getComponent(cc.Label).string).toBe("0");
            expect(statistic.getChildByName("small").getComponent(cc.Label).string).toBe("0");
            expect(statistic.getChildByName("big").getComponent(cc.Label).string).toBe("1");
            expect(statistic.getChildByName("playerPair").getComponent(cc.Label).string).toBe("1");
            expect(statistic.getChildByName("bankerPair").getComponent(cc.Label).string).toBe("1");
        });
    });
});
