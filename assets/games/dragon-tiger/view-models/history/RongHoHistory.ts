import SocketIOGameHistoryBase from "../../../_base/view-models/SocketIOGameHistoryBase";
import RongHoHistoryItem from "./RongHoHistoryItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RongHoHistory extends SocketIOGameHistoryBase {
    bindItemRowData(betLog, index) {
        const historyItemPrefab = cc.instantiate(this.itemPrefab);
        const item = historyItemPrefab.getComponent(RongHoHistoryItem);
        item.setData(betLog, index);
        this.content.addChild(historyItemPrefab);
    }
}
