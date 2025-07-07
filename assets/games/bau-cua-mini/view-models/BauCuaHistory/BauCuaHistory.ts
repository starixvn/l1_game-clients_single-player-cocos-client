import SocketIOGameHistoryBase from "../../../_base/view-models/SocketIOGameHistoryBase";
import BauCuaHistoryItems from "./BauCuaHistoryItems";

const { ccclass, property } = cc._decorator;
@ccclass
export default class BauCuaHistory extends SocketIOGameHistoryBase {
    HEIGHT_CONTENT = 600;
    bindItemRowData(betLog, index) {
        const itemNode = cc.instantiate(this.itemPrefab);
        const item = itemNode.getComponent(BauCuaHistoryItems);
        item.setData(betLog, index);
        this.content.addChild(itemNode);
    }
}
