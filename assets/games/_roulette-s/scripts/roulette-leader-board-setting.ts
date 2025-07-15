import { Socket } from "socket.io-client";
import BaseComponent from "../../../common/BaseComponent";
import RouletteToggle, { RouletteToggleType } from "./roulette-toggle";

const {ccclass, property} = cc._decorator;

@ccclass
export default class RouletteLeaderBoardSetting extends BaseComponent {
    @property(RouletteToggle)
    nameToggle: RouletteToggle = null;

    @property(RouletteToggle)
    avatarToggle: RouletteToggle = null;

    protected socket: Socket;
    protected gameName: string;
    private socketHandler: (data: any) => void;

    onLoad() {
        if (this.nameToggle) {
            this.nameToggle.setToggleCallback(this.onToggleChanged.bind(this));
        }
        if (this.avatarToggle) {
            this.avatarToggle.setToggleCallback(this.onToggleChanged.bind(this));
        }
    }

    onEnable() {
        this.getLeaderboardSettings();
    }

    onDestroy() {
        if (this.socket && this.socketHandler) {
            this.socket.off(this.gameName, this.socketHandler);
        }
    }

    init(socket: Socket, gameName: string) {
        this.socket = socket;
        this.gameName = gameName;
        
        this.socketHandler = (data) => {
            this.onSocketData(data);
        };
        
        this.socket.on(this.gameName, this.socketHandler);
    }

    getLeaderboardSettings() {
        this.socket?.connected && this.socket.emit("getLeaderboardSettings");
    }

    private onSocketData(data: any) {
        if (data.leaderboardSettings) {
            this.updateTogglesFromSettings(data.leaderboardSettings);
        }
    }

    // { hideAvatar: boolean, hideName: boolean } so toggle ON = !hide
    private updateTogglesFromSettings(settings: any) {
        if (this.nameToggle) {
            this.nameToggle.setEnabled(!settings.hideName);
        }
        
        if (this.avatarToggle) {
            this.avatarToggle.setEnabled(!settings.hideAvatar);
        }
    }

    private onToggleChanged(type: RouletteToggleType, enabled: boolean) {
        const hideValue = !enabled;
        const updateData: any = {};
        
        if (this.nameToggle && this.avatarToggle) {
            updateData.hideName = type === RouletteToggleType.Name ? hideValue : !this.nameToggle.getIsEnabled();
            updateData.hideAvatar = type === RouletteToggleType.Avatar ? hideValue : !this.avatarToggle.getIsEnabled();
        }
        
        this.updateLeaderboardSettings(updateData);
    }

    private updateLeaderboardSettings(settings: any) {
        this.socket?.connected && this.socket.emit("updateLeaderboardSettings", settings);
    }
}
