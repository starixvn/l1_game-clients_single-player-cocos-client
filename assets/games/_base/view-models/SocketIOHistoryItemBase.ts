import { Socket } from "socket.io-client";
import GameUtils from "../../../common/GameUtils";
import AudioManager from "../../../common/audio/AudioManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SocketIOHistoryItemBase extends cc.Component {
    @property(cc.Label)
    time: cc.Label = null;

    @property(cc.Label)
    round: cc.Label = null;

    @property(cc.Label)
    win: cc.Label = null;

    @property({
        type: cc.Node
    })
    bg: cc.Node = null;

    protected socket: Socket;

    init(socket: Socket) {
        this.socket = socket;
    }

    public roundId = 0;

    start() {
        GameUtils.setFontSizeLabelsInNode(this.node);
    }

    setBackground(index: number) {
        this.bg.active = index % 2 > 0;
    }

    onClickVerify() {
        AudioManager.getInstance().playClick();
        this.socket?.connected && this.socket.emit("getRoundPF", { roundId: this.roundId });
    }
}
