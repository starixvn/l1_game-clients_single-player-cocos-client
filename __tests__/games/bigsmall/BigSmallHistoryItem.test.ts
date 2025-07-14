import GameUtils from "../../../assets/common/GameUtils";
import { getStringDateByTime } from "../../../assets/common/helpers/DateTimeHelper";
import { numberWithCommas } from "../../../assets/common/helpers/NumberHelper";
import BigSmallHistoryItem from "../../../assets/games/bigsmall/view-models/BigSmallHistoryItem";

describe("Test class BigSmallHistoryItem", () => {
    let node: cc.Node;
    let comp: BigSmallHistoryItem;
    beforeEach(() => {
        node = new cc.Node();
        comp = node.addComponent(BigSmallHistoryItem);
        comp.bg = new cc.Node();
        comp.time = new cc.Node().addComponent(cc.Label);
        comp.round = new cc.Node().addComponent(cc.Label);
        comp.choice = new cc.Node().addComponent(cc.Label);
        comp.bet = new cc.Node().addComponent(cc.Label);
        comp.refund = new cc.Node().addComponent(cc.Label);
        comp.win = new cc.Node().addComponent(cc.Label);
        comp.roundId = 0;
    });

    describe("Test method setData", () => {
        it("Case 1: betwin = 0", () => {
            // Arrange
            const betLog = {
                phien: 741687,
                amount: 15,
                betwin: 0,
                choice: "small",
                name: "lele6001",
                odds: {
                    big: 1.96,
                    small: 1.96
                },
                refund: 15,
                time: "2021-09-20T08:22:14.036Z",
                totalAmount: 15,
                win: false,
                result: {
                    dice1: 1,
                    dice2: 2,
                    dice3: 4
                },
                settlementResult: {
                    big: false,
                    small: true
                },
                betLogDetails: [
                    {
                        time: "2021-09-20T08:21:54.635Z",
                        choice: "small",
                        amount: 15
                    }
                ]
            };
            const index = 1;

            // Act
            comp.setData(betLog, index);

            // Assert
            expect(comp.time.string).toMatch(getStringDateByTime(betLog.time));
            expect(comp.round.string).toMatch(betLog.phien.toString());
            expect(comp.bet.string).toMatch(numberWithCommas(betLog.amount));
            expect(comp.refund.string).toMatch(numberWithCommas(betLog.refund));
            expect(comp.roundId).toEqual(betLog.phien);
            expect(comp.round.string).toMatch(betLog.phien.toString());
            expect(comp.win.string).toMatch(numberWithCommas(betLog.betwin));
            expect(comp.choice.string).toEqual(`${GameUtils.getBetChoiceString(betLog.choice)}`);

            expect(comp.win.node.color).toEqual(cc.Color.WHITE);
            expect(comp.time.node.color).toEqual(cc.Color.WHITE);
            expect(comp.choice.node.color).toEqual(cc.Color.WHITE);
        });

        it("Case 2: betwin > 0", () => {
            // Arrange
            const betLog = {
                phien: 741718,
                amount: 55,
                betwin: 108.9,
                choice: "small",
                name: "lele6001",
                odds: {
                    big: 1.96,
                    small: 1.96
                },
                refund: 0,
                time: "2021-09-20T08:54:16.015Z",
                totalAmount: 55,
                win: true,
                result: {
                    dice1: 4,
                    dice2: 4,
                    dice3: 1
                },
                settlementResult: {
                    big: false,
                    small: true
                },
                betLogDetails: [
                    {
                        time: "2021-09-20T08:53:34.683Z",
                        choice: "small",
                        amount: 55
                    }
                ]
            };
            const index = 1;

            // Act
            comp.setData(betLog, index);

            // Assert
            expect(comp.time.string).toMatch(getStringDateByTime(betLog.time));
            expect(comp.round.string).toMatch(betLog.phien.toString());
            expect(comp.bet.string).toMatch(numberWithCommas(betLog.amount));
            expect(comp.refund.string).toMatch(numberWithCommas(betLog.refund));
            expect(comp.roundId).toEqual(betLog.phien);
            expect(comp.round.string).toMatch(betLog.phien.toString());
            expect(comp.win.string).toMatch(numberWithCommas(betLog.betwin));
            expect(comp.choice.string).toEqual(`${GameUtils.getBetChoiceString(betLog.choice)}`);

            // expect(comp.win.node.color).toEqual(cc.Color.YELLOW);
            expect(comp.time.node.color).toEqual(cc.Color.YELLOW);
            expect(comp.choice.node.color).toEqual(cc.Color.YELLOW);
        });
    });
});
