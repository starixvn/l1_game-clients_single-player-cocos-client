import SocketIOGameHistoryBase from "../../_base/view-models/SocketIOGameHistoryBase";
import BaccaratHistoryItem from "../../baccarat/view-models/BaccaratHistoryItem";

const { ccclass, property } = cc._decorator;
@ccclass
export default class VipBaccaratHistory extends SocketIOGameHistoryBase {
    bindItemRowData(betLog: any, index: number) {
        const historyItemPrefab = cc.instantiate(this.itemPrefab);
        const item = historyItemPrefab.getComponent(BaccaratHistoryItem);
        this.node.active = true;
        this.content.addChild(historyItemPrefab);
        item.setData(betLog, index);
    }
}
