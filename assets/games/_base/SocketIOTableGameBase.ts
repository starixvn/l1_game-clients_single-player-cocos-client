import { userManager } from "../../common/user/UserManager";
import WebSocketTableGameBase from "./WebSocketTableGameBase";

const { ccclass } = cc._decorator;

@ccclass
export default class SocketIOTableGameBase extends WebSocketTableGameBase {
    onLoad() {
        super.onLoad();
        this.initForSocket();
    }

    initForSocket() {
        this.socket = this.socketIOController.getSocketGame(this.gameId);
        if (!this.socket) {
            this.closeGame();
        } else {
            this.initGameEvents(this.socket);
        }
    }

    initGameEvents(socket) {
        socket.on(this.gameName, (data) => {
            if (!this.isAlive()) {
                return;
            }
            this.onDataGameRoom(data);
        });
        socket.on("disconnect", (reason: string) => {
            if (!this.isAlive()) {
                return;
            }

            this.closeGame();
        });
        socket.on("message", (data) => {
            if (!this.isAlive()) {
                return;
            }
            this.currentMiniPanel.onGeneralData(data);
        });
    }

    protected override onGameShow() {
        this.startGame();
    }

    public registerViewGame() {
        this.sendSocketData("inGame", null);
    }

    onDestroy() {
        super.onDestroy();
        this.socketIOController.closeSocket(this.gameId);
    }

    onDisconnected() {
        // keep in room game when main socket was disconnected
    }

    onData(data) {
        if (!this.isAlive()) {
            return;
        }
        this.currentMiniPanel.onGeneralData(data);
        this.onDataGameRoomGeneral(data);
    }

    onDataGameRoom(data) {
        if (data.history && this.historyComponent && this.historyComponent.node) {
            this.historyComponent.onData(data.history);
        }
        this.onDataGameRoomGeneral(data);
        super.onDataGameRoom(data);
        !data.notice && this.currentMiniPanel.onGeneralData(data);
    }

    onBetItemClick(event) {
        if (!this.isReadyBet()) {
            return;
        }

        if (this.waitingProcessing) {
            this.showProcessingWarning(true);
        } else {
            this.lockBet();
            const betData = this.createCommonBetData();
            betData["betChoice"] = event.target.name;
            this.sendSocketData("bet", betData);
        }
    }

    createCommonBetData() {
        return {
            amount: this.currentBet,
            username: userManager.userName,
            clientSentTime: new Date()
        };
    }

    sendRetryMessage(): void {
        if (this.socket) {
            this.socket.emit("retry");
        }
    }

    outRoomGame(): Promise<void> {
        this.socketIOController.closeSocket(this.gameId);
        return super.outRoomGame();
    }
}
