import { getStringDateByTime } from "../../../common/helpers/DateTimeHelper";
import { numberWithCommas } from "../../../common/helpers/NumberHelper";
import SocketIOHistoryItemBase from "../../_base/view-models/SocketIOHistoryItemBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MultiplayGameHistoryItem extends SocketIOHistoryItemBase {
    @property(cc.Label)
    gameName: cc.Label = null;

    setData(data: any, index: number) {
        this.time.string = getStringDateByTime(data.time);
        this.gameName && (this.gameName.string = data.gameName);
        this.round.string = data.roundId.toString();
        this.win.string = numberWithCommas(data.betwin, 2);
        this.setBackground(index);
    }
}
