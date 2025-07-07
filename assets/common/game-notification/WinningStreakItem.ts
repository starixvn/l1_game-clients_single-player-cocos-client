import GameUtils from "../GameUtils";
import NotificationItem from "./NotificationItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class WinningStreakItem extends NotificationItem {
    @property(cc.Label)
    gameName: cc.Label = null;

    @property(cc.RichText)
    result: cc.RichText = null;

    setData(data: any) {
        const { choice, count, gameId } = data;
        this.gameName.string = `(${GameUtils.getGameNameString(gameId)})`;
        this.result.string = `<img src="dot_${choice}" width=20 height=20 /> x${count}`;
    }
}
