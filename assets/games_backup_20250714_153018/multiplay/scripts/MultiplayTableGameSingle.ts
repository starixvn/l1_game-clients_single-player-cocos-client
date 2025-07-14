import TableGameBase from "../../_base_new/view-models/TableGameBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MultiplayTableGameSingle extends TableGameBase {
    onDisconnected() {
        super.onDisconnected();
        this.onDisconnectCallback && this.onDisconnectCallback();
    }
}
