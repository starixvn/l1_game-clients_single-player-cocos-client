import * as i18n from "i18n/runtime-scripts/LanguageData";

import { getStringHourByTime } from "../../../common/helpers/DateTimeHelper";
import { numberWithCommas } from "../../../common/helpers/NumberHelper";
import { BetLog } from "./HiLoBetData";
import HiLoTicketDetailItem from "./HiLoTicketDetailItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class HiLoTicketDetailBaseItem extends HiLoTicketDetailItem {
    @property(cc.Label)
    round: cc.Label = null;

    setData(data: BetLog, isFirst: boolean, index) {
        if (isFirst) {
            const startRound = "hiLo.startRound";
            this.time.string = getStringHourByTime(data.time);
            this.round.string = `${i18n.t(startRound)}`;
            this.stake.string = numberWithCommas(data.amount, 2);
            this.win.string = "";
            this.stake.node.color = cc.Color.YELLOW;
        } else {
            const endRound = "hiLo.endRound";
            this.time.string = getStringHourByTime(data.endTime);
            this.round.string = `${i18n.t(endRound)}`;
            this.stake.string = "";
            this.win.string = numberWithCommas(data.betwin, 2);
        }
        this.bg.active = index % 2 > 0;
    }
}
