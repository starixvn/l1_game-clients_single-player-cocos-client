import InGameMenu, { InGameMenuEvents } from "../../../common/in-game-menu/InGameMenu";
import HandleWinningNotification from "./HandleWinningNotification";

const { ccclass, property } = cc._decorator;
@ccclass
export default class MultiplayTableGameMenu extends InGameMenu {
    @property(HandleWinningNotification)
    winningNotifiationComp: HandleWinningNotification = null;

    onClickWinningNotification() {
        this.node.emit(InGameMenuEvents.CHANGE_WINNING_NOTIFICATION);
    }

    onClickStatistic() {
        this.doCommons();
        this.node.emit(InGameMenuEvents.OPEN_STATISTIC);
    }
}
