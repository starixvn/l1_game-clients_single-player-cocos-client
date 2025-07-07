import AudioManager from "../../../common/audio/AudioManager";
import GameUtils from "../../../common/GameUtils";
import { appManager } from "../../../managers/AppManager";
import { uiManager } from "../../../managers/GameUIManager";

const { ccclass } = cc._decorator;

@ccclass
export default class BannerJackpot extends cc.Component {
    gameId;

    onLoad() {
        this.node.on(cc.Node.EventType.TOUCH_END, this.openGame, this, true);
    }

    openGame(e) {
        AudioManager.getInstance().playClick();
        GameUtils.clearGameSetting(this.gameId);
        GameUtils.unCacheAndHideGameLoading(uiManager.getCurrentGameId());
        uiManager.setCurrentGameId(this.gameId);
        GameUtils.openGame(+this.gameId, appManager.miniPanel);
    }
}
