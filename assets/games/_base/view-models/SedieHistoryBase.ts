import { getStringDate, getStringDateByTime, getStringHourByTime } from "../../../common/helpers/DateTimeHelper";
import { numberWithCommas } from "../../../common/helpers/NumberHelper";
import SedieHistoryItemBase from "./SedieHistoryItemBase";
import SocketIOGameHistoryBase from "./SocketIOGameHistoryBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SedieHistoryBase extends SocketIOGameHistoryBase {
    @property(cc.SpriteFrame)
    iconRed: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    iconWhite: cc.SpriteFrame = null;

    bindCommonData(betLog, index) {
        const itemNode = cc.instantiate(this.itemPrefab);
        const item = itemNode.getComponent(SedieHistoryItemBase);
        item.node.active = true;
        item.bg.active = index % 2 > 0;

        const { time, phien, result, betwin, win } = betLog;

        if (item.time && item.time.node.children.length === 0) {
            item.time.string = getStringDateByTime(time);
            item.time.node.color = win ? cc.Color.YELLOW : cc.Color.WHITE;
        } else if (item.date && item.hour) {
            item.date.string = getStringDate(time);
            item.hour.string = getStringHourByTime(time);
        }

        item.round.string = phien;

        let number = 0;
        Object.keys(result).forEach((key) => {
            if (result[key]) {
                number++;
            }
        });

        item.kqLabel.string = number.toString();
        if (number % 2) {
            item.kqSprite.spriteFrame = this.iconRed;
            item.kqLabel.node.color = cc.Color.WHITE;
        } else {
            item.kqSprite.spriteFrame = this.iconWhite;
            item.kqLabel.node.color = cc.Color.BLACK;
        }

        item.win.string = numberWithCommas(betwin, 2);
        return itemNode;
    }

    bindItemRowData(betLog, index) {}
}
