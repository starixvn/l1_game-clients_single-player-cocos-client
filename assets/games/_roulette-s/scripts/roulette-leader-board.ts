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
            const { leaderboard, time } = data.leaderboard;
            this.lblTime.string = new Date(time).toISOString().replace("T", " ").slice(0, 19).replace(/-/g, "/");
            leaderboard.forEach((item) => {
                this.bindItemRowData(item);
            });
        }
    }

    bindItemRowData(leaderboardItem) {
        const leaderboardItemPrefab = cc.instantiate(this.leaderBoardItemPrefab);
        const item = leaderboardItemPrefab.getComponent(RouletteLeaderBoardItem);
        this.bodyContent.addChild(leaderboardItemPrefab);
        item.setData(leaderboardItem);
    }
}
