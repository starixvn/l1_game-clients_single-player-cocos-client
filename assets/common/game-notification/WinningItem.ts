import GameUtils from "../GameUtils";
import { numberWithCommas } from "../helpers/NumberHelper";
import NotificationItem from "./NotificationItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class WinningItem extends NotificationItem {
    @property(cc.Label)
    amount: cc.Label = null;

    @property(cc.Label)
    gameName: cc.Label = null;

    setData(data: { amount: number; gameId: number }) {
        const { amount, gameId } = data;
        this.amount.string = `+${numberWithCommas(amount, 0)}`;
        this.gameName.string = `(${GameUtils.getGameNameString(gameId)})`;
    }
}
