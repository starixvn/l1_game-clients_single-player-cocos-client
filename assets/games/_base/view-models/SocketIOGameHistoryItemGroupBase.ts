import { Socket } from "socket.io-client";

import BaseComponent from "../../../common/BaseComponent";

const { ccclass, property } = cc._decorator;

@ccclass
export default abstract class SocketIOGameHistoryItemGroupBase extends BaseComponent {
    protected socket: Socket;

    init(socket: Socket) {
        this.socket = socket;
    }

    @property(cc.Node)
    container: cc.Node = null;

    @property(cc.Button)
    verify: cc.Button = null;

    @property(cc.Prefab)
    itemPrefab: cc.Prefab = null;

    @property(cc.Node)
    line: cc.Node = null;

    public roundId = 0;

    abstract addItem(log);

    onClickVerify() {
        this.socket?.connected && this.socket.emit("getProvablyFair", { roundId: this.roundId });
    }

    onData(data: any) {
        if (data.provablyFair) {
            cc.log(data.provablyFair);
        }
    }

    hideLine() {
        this.line.active = false;
    }
}
