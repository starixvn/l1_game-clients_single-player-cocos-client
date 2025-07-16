import * as _ from "lodash";
import CommonDialog from "../../../common/_base/view-models/CommonDialog";
import { Socket } from "socket.io-client";
import BaseComponent from "../../../common/BaseComponent";
import RouletteLeaderBoardItem, { LeaderBoardItem } from "./roulette-leader-board-item";

const { ccclass, property } = cc._decorator;

interface LeaderboardData {
    leaderboard: LeaderBoardItem[];
    time: string;
    currentPlayer: CurrentPlayer;
}

interface CurrentPlayer {
    rank: string;
    totalWin: number;
    currentPlayerSettings: {
        hideName: boolean;
        hideAvatar: boolean;
        nickname: string;
        avatarUrl: string;
    };
}

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

    private socket: Socket;
    private gameName: string;
    private socketHandler: (data: { leaderboard?: LeaderboardData }) => void;

    protected onEnable(): void {
        this.requestLeaderboardData();
    }

    private requestLeaderboardData(): void {
        if (this.socket?.connected) {
            this.socket.emit("getLeaderboard");
        }
    }

    public init(socket: Socket, gameName: string): void {
        this.socket = socket;
        this.gameName = gameName;
    }

    protected onLoad(): void {
        this.setupDialogHandler();
        this.setupSocketHandler();
    }

    private setupDialogHandler(): void {
        const commonDialog = this.mainFrame.getComponent(CommonDialog);
        commonDialog.addOnDidHide(() => {
            this.node.destroy();
        });
    }

    private setupSocketHandler(): void {
        this.socketHandler = (data: { leaderboard?: LeaderboardData }) => {
            this.handleLeaderboardData(data);
        };
        this.socket?.on(this.gameName, this.socketHandler);
    }

    protected onDestroy(): void {
        if (this.socketHandler) {
            this.socket?.off(this.gameName, this.socketHandler);
            this.socketHandler = null;
        }
    }

    private handleLeaderboardData(data: { leaderboard?: LeaderboardData }): void {
        if (!data.leaderboard) {
            return;
        }

        const { leaderboard, time, currentPlayer } = data.leaderboard;
        this.updateTimeDisplay(time);

        this.scheduleOnce(() => {
            this.displayLeaderboardItems(leaderboard, currentPlayer);
        }, 0.1);
    }

    private updateTimeDisplay(time: string): void {
        this.lblTime.string = this.formatTime(time);
    }

    private formatTime(isoTimeString: string) {
        const date = new Date(isoTimeString);

        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");
        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");
        const seconds = date.getSeconds().toString().padStart(2, "0");

        return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
    }

    private displayLeaderboardItems(leaderboard: LeaderBoardItem[], currentPlayer: CurrentPlayer): void {
        leaderboard.forEach((item) => {
            const isCurrentPlayer = item.rank === currentPlayer.rank;
            this.createLeaderboardItem(item, isCurrentPlayer);
        });

        if (this.shouldDisplayCurrentPlayer(currentPlayer.rank)) {
            const currentPlayerData = this.formatCurrentPlayerData(currentPlayer);
            this.createLeaderboardItem(currentPlayerData, true);
        }
    }

    private shouldDisplayCurrentPlayer(rank: string): boolean {
        return parseInt(rank) === -1 || parseInt(rank) > 30;
    }

    private createLeaderboardItem(leaderboardItem: LeaderBoardItem, isCurrentPlayer = false): void {
        const leaderboardItemNode = cc.instantiate(this.leaderBoardItemPrefab);
        const item = leaderboardItemNode.getComponent(RouletteLeaderBoardItem);
        this.bodyContent.addChild(leaderboardItemNode);
        item.setData(leaderboardItem, isCurrentPlayer);
    }

    private formatCurrentPlayerData(currentPlayer: CurrentPlayer): LeaderBoardItem {
        const { currentPlayerSettings, totalWin } = currentPlayer;
        return {
            rank: "-",
            nickname: currentPlayerSettings.hideName ? "" : currentPlayerSettings.nickname,
            totalWin,
            avatarUrl: currentPlayerSettings.hideAvatar ? "" : currentPlayerSettings.avatarUrl
        };
    }
}
