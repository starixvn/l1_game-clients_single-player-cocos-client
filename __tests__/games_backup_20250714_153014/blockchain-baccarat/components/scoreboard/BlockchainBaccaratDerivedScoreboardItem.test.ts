import { DerivedScoreboardPoint } from "sc-scoreboards";

import BlockchainBaccaratDerivedScoreboardItem from "../../../../../assets/games/blockchain-baccarat/components/score-board/view-models/BlockchainBaccaratDerivedScoreboardItem";

describe("BlockchainBaccaratDerivedScoreboardItem", () => {
    let comp: BlockchainBaccaratDerivedScoreboardItem;
    beforeEach(() => {
        comp = new cc.Node().addComponent(BlockchainBaccaratDerivedScoreboardItem);
        for (let i = 0; i < 12; i++) {
            const node = new cc.Node();
            node.children.push(new cc.Node("red"), new cc.Node("blue"), new cc.Node("next"));
            node.children.forEach((child) => {
                child.active = false;
            });
            comp.nodes.push(node);
        }
        comp.onLoad();
    });

    describe("renderNode", () => {
        it("red should be active when status is true", () => {
            // arrange
            const point: DerivedScoreboardPoint = { column: 0, row: 0, status: true };

            // act
            comp.renderNode(point);

            // assert
            expect(comp.nodes[0].getChildByName("red").active).toBe(true);
            expect(comp.nodes[0].getChildByName("blue").active).toBe(false);
            expect(comp.nodes[0].getChildByName("next").active).toBe(false);
        });
        it("blue should be active when status is false", () => {
            // arrange
            const point: DerivedScoreboardPoint = { column: 1, row: 0, status: false };

            // act
            comp.renderNode(point);

            // assert
            expect(comp.nodes[6].getChildByName("red").active).toBe(false);
            expect(comp.nodes[6].getChildByName("blue").active).toBe(true);
            expect(comp.nodes[6].getChildByName("next").active).toBe(false);
        });
    });

    describe("resetNode", () => {
        it("children should be inactive", () => {
            // arrange
            const point: DerivedScoreboardPoint = { column: 1, row: 1, status: false };
            comp.renderNode(point);

            // act
            comp.resetNode(point);

            // assert
            expect(comp.nodes[7].getChildByName("red").active).toBe(false);
            expect(comp.nodes[7].getChildByName("blue").active).toBe(false);
            expect(comp.nodes[7].getChildByName("next").active).toBe(false);
        });
    });

    describe("resetAll", () => {
        it("should run correctly", () => {
            // act
            comp.resetAll();

            // assert
            expect(comp.nodes[0].getChildByName("red").active).toBe(false);
            expect(comp.nodes[0].getChildByName("blue").active).toBe(false);
            expect(comp.nodes[0].getChildByName("next").active).toBe(false);
            expect(comp.nodes[6].getChildByName("red").active).toBe(false);
            expect(comp.nodes[6].getChildByName("blue").active).toBe(false);
            expect(comp.nodes[6].getChildByName("next").active).toBe(false);
        });
    });

    describe("renderNextNode", () => {
        it("should add next item in first col when second col is empty", () => {
            // arrange
            const point: DerivedScoreboardPoint = { column: 0, row: 0, status: true };
            comp.renderNode(point);

            // act
            comp.renderNextNode();

            // assert
            expect(comp.nodes[1].getChildByName("next").active).toBe(true);
        });

        it("should add next item in second col when second col has value", () => {
            // arrange
            const point: DerivedScoreboardPoint = { column: 1, row: 0, status: false };
            comp.renderNode(point);

            // act
            comp.renderNextNode();

            // assert
            expect(comp.nodes[7].getChildByName("next").active).toBe(true);
        });
    });

    describe("removeNextNode", () => {
        it("should remove all next item", () => {
            // act
            comp.removeNextNode();

            // assert
            expect(comp.nodes[1].getChildByName("next").active).toBe(false);
            expect(comp.nodes[7].getChildByName("next").active).toBe(false);
        });
    });

    describe("isFilledColumn", () => {
        it("should return true when second col filled", () => {
            // arrange
            const pointA: DerivedScoreboardPoint = { column: 0, row: 0, status: true };
            const points: DerivedScoreboardPoint[] = [0, 1, 2, 3, 4, 5].map((value) => ({ column: 1, row: value, status: false }));
            comp.renderNode(pointA);
            points.forEach((point) => {
                comp.renderNode(point);
            });

            // act
            const actual = comp.isFilledColumn();

            // assert
            expect(actual).toBe(true);
        });
        it("should return false when second col not filled", () => {
            // arrange
            const pointA: DerivedScoreboardPoint = { column: 0, row: 0, status: true };
            const pointB: DerivedScoreboardPoint = { column: 1, row: 0, status: false };
            comp.resetAll();
            comp.renderNode(pointA);
            comp.renderNode(pointB);

            // act
            const actual = comp.isFilledColumn();

            // assert
            expect(actual).toBe(false);
        });
    });
});
