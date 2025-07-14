import GameUtils from "../../../common/GameUtils";
import { getStringDateByTime } from "../../../common/helpers/DateTimeHelper";
import SocketIOHistoryItemBase from "../../_base/view-models/SocketIOHistoryItemBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LuckyWheelHistoryItem extends SocketIOHistoryItemBase {
    @property(cc.Label)
    result: cc.Label = null;

    updateData(data: any, index: number) {
        this.round.string = data.id;
        this.time.string = getStringDateByTime(data.time);

        if (data.result === 0) {
            this.result.string = GameUtils.getText(`ui.goodluck`);
        } else {
            this.result.string = `${data.result} Scoin`;
        }
        this.setBackground(index);
    }
}
