import * as _ from "lodash";

import GameTicketDetailBase from "../../_base/view-models/GameTicketDetailBase";
import LotteryResult from "./LotteryResult";
import LotteryTicketDetailItem from "./LotteryTicketDetailItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LotteryTicketDetail extends GameTicketDetailBase {
    @property(LotteryResult)
    result: LotteryResult = null;

    @property(cc.Node)
    itemSample: cc.Node = null;

    @property(cc.Label)
    roundId: cc.Label = null;

    HEIGHT_BET_DETAIL_TABLE = 466;
    WIDTH_BET_DETAIL_TABLE = 860;

    setData(data: any) {
        const { betLogDetails, phien } = data;
        const choices = {};
        betLogDetails.forEach((log) => {
            _.merge(choices, log.choices);
        });

        if (this.result) {
            this.result.setData(data, false, choices);
        }

        this.roundId.string = `#${phien}`;

        betLogDetails.forEach((detail, index) => {
            const node = cc.instantiate(this.itemSample);
            this.content.addChild(node);
            node.active = true;
            const item = node.getComponent(LotteryTicketDetailItem);
            item.setData(detail, index, data);
        });
    }
}
