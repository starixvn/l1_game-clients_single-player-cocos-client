import _ = require("lodash");

import { getStringDateByTime } from "../../../common/helpers/DateTimeHelper";
import { numberWithCommas } from "../../../common/helpers/NumberHelper";
import SocketIOHistoryItemBase from "../../_base/view-models/SocketIOHistoryItemBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BaccaratBaseHistoryItem extends SocketIOHistoryItemBase {
    @property(cc.Label)
    player: cc.Label = null;

    @property(cc.Label)
    banker: cc.Label = null;

    @property(cc.Label)
    tie: cc.Label = null;

    @property(cc.Label)
    playerPair: cc.Label = null;

    @property(cc.Label)
    bankerPair: cc.Label = null;

    @property(cc.Label)
    big: cc.Label = null;

    @property(cc.Label)
    small: cc.Label = null;

    setData(betLog: any, index?: number) {
        const { time, phien, settlementResult, betwin } = betLog;

        this.time.string = getStringDateByTime(time);
        this.round.string = phien;
        this.win.string = numberWithCommas(betwin, 2);

        const resultKeys = _.keys(settlementResult);

        _.forEach(resultKeys, (key) => {
            const currentItem = this[key];
            const isWin = settlementResult[key];

            if (currentItem) {
                currentItem.node.color = isWin ? cc.Color.YELLOW : cc.Color.WHITE;
                currentItem.string = numberWithCommas(betLog[key]);
            }
        });
        this.showCards(betLog);
    }

    showCards(betLog: any) {
        // handle
    }
}
