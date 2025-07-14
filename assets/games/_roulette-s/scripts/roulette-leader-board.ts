import * as _ from "lodash";
import CommonDialog from "../../../common/_base/view-models/CommonDialog";
import { Socket } from "socket.io-client";
import BaseComponent from "../../../common/BaseComponent";
import RouletteLeaderBoardItem from "./roulette-leader-board-item";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RouletteLeaderBoard extends BaseComponent {
    @property(cc.Node)
    mainFrame: cc.Node = null;

    @property(cc.Prefab)
    leaderBoardItemPrefab: cc.Prefab = null;

    @property(cc.Node)
    bodyContent: cc.Node = null;

    @property(cc.Label)
    lblTime: cc.Label = null;

    protected socket: Socket;
    protected gameName: string;

    onEnable() {
        this.getData();
    }

    getData() {
        this.socket?.connected && this.socket.emit("getLeaderboard");
    }

    init(socket: Socket, gameName: string) {
        this.socket = socket;
        this.gameName = gameName;
    }

    onLoad() {
        const commonDialog = this.mainFrame.getComponent(CommonDialog);
        commonDialog.addOnDidHide(() => {
            this.node.destroy();
        });

        this.socket?.on(this.gameName, (data) => {
            this.onData(data);
        });
    }

    onDestroy() {
        this.socket?.off(this.gameName);
    }

    onData(data) {
        if (data.leaderboard) {
            const { leaderboard, time, currentPlayer } = data.leaderboard;
            this.lblTime.string = new Date(time).toISOString().replace("T", " ").slice(0, 19).replace(/-/g, "/");
            leaderboard.forEach((item) => {
                const isCurrentPlayer = item.rank === currentPlayer.rank;
                this.bindItemRowData(item, isCurrentPlayer);
            });

            if (currentPlayer.rank === -1 || currentPlayer.rank > 30) {
                const newCurrentPlayer = this.getCurrentPlayer(currentPlayer);
                this.bindItemRowData(newCurrentPlayer, true);
            }
        }
    }

    bindItemRowData(leaderboardItem, isCurrentPlayer = false) {
        const leaderboardItemPrefab = cc.instantiate(this.leaderBoardItemPrefab);
        const item = leaderboardItemPrefab.getComponent(RouletteLeaderBoardItem);
        this.bodyContent.addChild(leaderboardItemPrefab);
        item.setData(leaderboardItem, isCurrentPlayer);
    }

    getCurrentPlayer(currentPlayer: any) {
        const newCurrentPlayer = {
            rank: "-",
            nickname: currentPlayer.currentPlayerSettings.nickname,
            totalWin: currentPlayer.totalWin,
            avatarUrl: currentPlayer.currentPlayerSettings.avatarUrl,
        };

        
        return newCurrentPlayer;
    }
}
