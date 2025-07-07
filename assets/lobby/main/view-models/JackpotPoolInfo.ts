import { userManager } from "../../../common/user/UserManager";
import { uiManager } from "../../../managers/GameUIManager";
import { InternalEvents } from "../../../managers/InternalEvents";
import { jackpotManager } from "../../../managers/JackpotManager";
import JackpotPoolInfoBase from "./JackpotPoolInfoBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class JackpotPoolInfo extends JackpotPoolInfoBase {
    @property
    gameId = 0;

    onLoad() {
        this.hideAllItems();
        if (userManager.disableJackpotGames) {
            this.node.active = false;
        } else {
            this.node.active = true;
            this.initEvents();
            this.requestData();
            this.schedule(this.requestData, 5);
        }
    }

    onDestroy() {
        if (!userManager.disableJackpotGames) {
            uiManager.removeListenersWithTarget(this);
            this.unschedule(this.requestData);
        }
    }

    removeListeners() {
        uiManager.removeListeners(InternalEvents.RECEIVED_JACKPOT_POOLS_ON_GAME, this);
    }

    protected initEvents() {
        uiManager.emitterListener(InternalEvents.RECEIVED_JACKPOT_POOLS_ON_GAME, (data) => this.onData(data), this);
        uiManager.emitterListener(InternalEvents.HIDE_JACKPOT_POOLS_ON_GAME, (gameId) => this.hideJackpotPoolsInfo(gameId), this);
    }

    onData(data) {
        const gamePools = data[this.gameId];
        if (!this.gameId || !gamePools) {
            return;
        }

        this.setVisibility(true);
        this.setData(gamePools, false);
    }

    protected requestData() {
        this.gameId && jackpotManager.requestJackpotOnGame(this.gameId);
    }

    private hideJackpotPoolsInfo(gameId: string) {
        if (gameId !== this.gameId.toString()) {
            return;
        }
        this.setVisibility(false);
    }
}
