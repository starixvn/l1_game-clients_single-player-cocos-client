import * as sessionManager from "../../common/auth/SessionManager";
import { appManager } from "../../managers/AppManager";
import MiniPanelSocketIOInitializers from "./MiniPanelSocketIOInitializers";

export default class MiniPanelSocketIOGameInitializers extends MiniPanelSocketIOInitializers {
    public async openGame(gameId) {
        try {
            this.main.popupMiniGame?.hideListGame();

            if (this.main.currentGameRoomId === gameId) {
                return;
            }

            await appManager.currentScene.outRoomGame();
            sessionManager.removeInRoomGameId();
            this.openNewSocket(gameId);
        } catch (e) {}
    }

    private openNewSocket(gameId) {
        const socket = this.socketIOController.openNewGameRoomSocket(gameId);
        this.socketIOController.initBaseListenersForSocketUrl(socket, gameId, this.main.onConnectSocketFailed.bind(this.main));
        this.handleSocket(socket, gameId);
    }
}
