import * as i18n from "i18n/runtime-scripts/LanguageData";

import { getStringHourByTime } from "../../../assets/common/helpers/DateTimeHelper";
import { numberWithCommas } from "../../../assets/common/helpers/NumberHelper";
import { BetLog } from "../../../assets/games/hi-lo/view-models/HiLoBetData";
import HiLoTicketDetailBaseItem from "../../../assets/games/hi-lo/view-models/HiLoTicketDetailBaseItem";

describe("HiLoTicketDetailBaseItem", () => {
    describe("setData", () => {
        let node: cc.Node;
        let comp: HiLoTicketDetailBaseItem;
        beforeEach(() => {
            node = new cc.Node();
            comp = node.addComponent(HiLoTicketDetailBaseItem);
            comp.bg = new cc.Node();
            comp.round = node.addComponent(cc.Label);
            comp.stake = node.addComponent(cc.Label);
            comp.win = node.addComponent(cc.Label);
            comp.time = node.addComponent(cc.Label);
        });
        it("should add data into start round", () => {
            // Arrange
            const data: BetLog = {
                time: "2022-02-17T04:28:11.289Z",
                id: 1966,
                amount: 100,
                betwin: 0,
                betLogDetails: [],
                endTime: ""
            };
            const startRound = "hiLo.startRound";

            //Act
            comp.setData(data, true, 0);

            //Assert
            expect(comp.time.string).toMatch(`${getStringHourByTime(data.time)}`);
            expect(comp.round.string).toMatch(`${i18n.t(startRound)}`);
            expect(comp.stake.string).toMatch(numberWithCommas(data.amount, 2));
            expect(comp.win.string).toMatch("");
            expect(comp.stake.node.color).toEqual(cc.Color.YELLOW);
        });

        it("should add data into end round", () => {
            // Arrange
            const data: BetLog = {
                time: "2022-02-17T04:28:11.289Z",
                id: 1966,
                amount: 100,
                betwin: 0,
                betLogDetails: [],
                endTime: "2022-02-17T04:53:11.289Z"
            };
            const startRound = "hiLo.endRound";

            //Act
            comp.setData(data, false, 0);

            //Assert
            expect(comp.time.string).toMatch(`${getStringHourByTime(data.endTime)}`);
            expect(comp.round.string).toMatch(`${i18n.t(startRound)}`);
            expect(comp.win.string).toMatch(numberWithCommas(data.betwin, 2));
            expect(comp.stake.string).toMatch("");
        });
    });
});
