import { lazyInject } from "../../../Application";
import GameUtils from "../../../common/GameUtils";
import { getGameName } from "../../../configs/GameConfigurations";
import SocketIOController from "../../../SocketIOController";
import SocketIOGameHistoryBase from "../../_base/view-models/SocketIOGameHistoryBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MultiplayGameHistory extends SocketIOGameHistoryBase {
    @lazyInject(SocketIOController)
    protected readonly socketIOController: SocketIOController;

    protected currentGameId: number;

    onDestroy() {
        this.clearSocket(this.currentGameId);
        this.socket = null;
    }

    clearSocket(gameId: number) {
        if (this.socket) {
            const name = getGameName(gameId);
            this.socket.off(name, this.receiveData);
        }
    }

    updateSocketChanged(id) {
        this.socket = this.socketIOController.getSocketGame(id);
        const name = getGameName(id);
        this.socket.on(name, this.receiveData);
    }

    get_data(page = 1) {
        super.get_data(page);
    }

    receiveData = (data) => {
        if (data.history) {
            this.onData(data.history);
        }
    };

    bindItemRowData(betLog, index) {
        betLog["gameName"] = GameUtils.getGameNameString(betLog.gameId ? betLog.gameId : this.currentGameId);
    }

    openTabGame(toggle: cc.Toggle) {
        const gameId = +toggle.node.name;
        this.handleSocketFromGame(gameId);
    }

    initDefaultGame(gameId: number) {
        this.handleSocketFromGame(gameId);
    }

    handleSocketFromGame(gameId: number) {
        this.clearSocket(this.currentGameId);
        this.pagination.resetPageCurrent();

        this.currentGameId = gameId;
        this.updateSocketChanged(gameId);
        this.get_data();
    }
}
