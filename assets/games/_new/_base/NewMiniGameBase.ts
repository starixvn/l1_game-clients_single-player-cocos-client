import SocketIOMiniGameBase from "../../_base/SocketIOMiniGameBase";
import BetHistory from "../common/BetHistory";
import SocketIOConnection from "../connection/SocketIOConnection";
import { GameData } from "./game-data-management/models/game-data";

const { ccclass, property } = cc._decorator;
@ccclass
export default class NewMiniGameBase extends SocketIOMiniGameBase {
    @property(cc.Prefab)
    historyPrefab: cc.Prefab = null;

    protected connection: SocketIOConnection;
    public gameData: GameData;
    protected newHistoryComp: BetHistory;

    grantSocket() {
        super.grantSocket();
        this.initConnection();
    }

    initConnection() {
        this.connection = new SocketIOConnection();
        this.connection.setSocket(this.socket, this.gameName);
    }

    onData(data: unknown) {
        super.onData(data);

        if (this.gameData) {
            this.gameData.receiveData(data);
        }
    }

    openHistory() {
        this.playClick();

        const dialog = cc.instantiate(this.historyPrefab);
        this.newHistoryComp = dialog.getComponent(BetHistory);
        this.newHistoryComp.setConnection(this.connection, this.gameName);
        this.currentMiniPanel.addDialog(dialog);
        this.newHistoryComp.showDialog();
    }

    isPlacingBet() {
        return this.gameData.durations.isPlacingBet();
    }
}
