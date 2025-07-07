import GameUtils from "../../common/GameUtils";
import { shortenName } from "../../common/helpers/NicknameHelper";
import { numberWithCommas } from "../../common/helpers/NumberHelper";
import { uiManager } from "../../managers/GameUIManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class JackpotWinner extends cc.Component {
    @property(cc.Label)
    username: cc.Label = null;

    @property(cc.Label)
    amount: cc.Label = null;

    @property(cc.Label)
    gameName: cc.Label = null;

    onLoad() {
        this.resetJackPotWinner();
    }

    resetJackPotWinner() {
        this.username.string = "";
        this.amount.string = "";
        this.gameName.string = "";
    }

    onDestroy() {
        uiManager.removeListenersWithTarget(this);
    }

    setData(data: any) {
        this.username.string = shortenName(data.winnerName);
        this.amount.string = numberWithCommas(GameUtils.getValueByCurrency(data.amount), 2);
        this.gameName.string = GameUtils.getGameNameString(data.gameId);
    }
}
