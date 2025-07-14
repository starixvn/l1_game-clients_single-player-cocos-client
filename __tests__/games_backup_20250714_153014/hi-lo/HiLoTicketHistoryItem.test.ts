import { getStringDateByTime } from "../../../assets/common/helpers/DateTimeHelper";
import { numberWithCommas } from "../../../assets/common/helpers/NumberHelper";
import { BetLog } from "../../../assets/games/hi-lo/view-models/HiLoBetData";
import HiLoTicketHistoryItem from "../../../assets/games/hi-lo/view-models/HiLoTicketHistoryItem";

describe("Test class HiLoTicketHistoryItem", () => {
    let node: cc.Node;
    let comp: HiLoTicketHistoryItem;
    beforeEach(() => {
        node = new cc.Node();
        comp = node.addComponent(HiLoTicketHistoryItem);
        comp.bg = new cc.Node();
        comp.time = node.addComponent(cc.Label);
        comp.round = node.addComponent(cc.Label);
        comp.stake = node.addComponent(cc.Label);
        comp.win = node.addComponent(cc.Label);
    });

    describe("renderTicketItem", () => {
        it("case for betwin larger zero", () => {
            //Arrange
            const betLog: BetLog = {
                time: "2022-02-17T04:28:11.289Z",
                id: 1966,
                amount: 100,
                betwin: 233.44,
                betLogDetails: [],
                endTime: ""
            };

            //Act
            comp.renderTicketItem(betLog, 0);

            //Assert
            expect(comp.time.string).toMatch(getStringDateByTime(betLog.time));
            expect(comp.round.string).toMatch(betLog.id.toString());
            expect(comp.stake.string).toMatch(numberWithCommas(betLog.amount, 2));
            expect(comp.win.string).toMatch(numberWithCommas(betLog.betwin, 2));
            expect(comp.stake.node.color).toEqual(cc.Color.YELLOW);
        });

        it("case for betwin smaller or equal zero", () => {
            const betLog: BetLog = {
                time: "2022-02-17T04:28:11.289Z",
                id: 1966,
                amount: 100,
                betwin: 0,
                betLogDetails: [],
                endTime: ""
            };

            //Act
            comp.renderTicketItem(betLog, 0);

            //Assert
            expect(comp.time.string).toMatch(getStringDateByTime(betLog.time));
            expect(comp.round.string).toMatch(betLog.id.toString());
            expect(comp.stake.string).toMatch(numberWithCommas(betLog.amount, 2));
            expect(comp.win.string).toMatch(numberWithCommas(betLog.betwin, 2));
            expect(comp.stake.node.color).toStrictEqual(new cc.Color(255, 255, 255, 255));
        });
    });
});
