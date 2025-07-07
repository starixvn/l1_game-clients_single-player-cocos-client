import { getGameConfiguration } from "../configs/GameConfigurations";
import { appManager } from "../managers/AppManager";
import SocketIOController from "../SocketIOController";
import GameUtils from "./GameUtils";
import { getMainMultiplayGame, isMultiplayGame } from "./mutliplay-utils";

export default class JoinGameHelper {
    public async joinGameIsNotMiniGame(gameId: number, socketIOControler: SocketIOController) {
        const gameConfiguration = getGameConfiguration(gameId);
        if (!!gameConfiguration?.isMicrosite) {
            await GameUtils.openGameMicrosite(gameId);
            return;
        }
        await GameUtils.tryOpenGameDirect(gameId, socketIOControler);
        if (appManager.currentScene?.onCloseGame) {
            appManager.currentScene.openOtherScene = true;
            appManager.currentScene.onCloseGame();
        }
        await GameUtils.loadSceneGame(gameId, socketIOControler);
    }

    public getGameId(gameId: number) {
        const isMultiplay = isMultiplayGame(gameId);
        return !isMultiplay ? gameId : getMainMultiplayGame(gameId);
    }
}
