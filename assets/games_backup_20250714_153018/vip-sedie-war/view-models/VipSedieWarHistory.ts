import SedieHistory from "../../sedie/view-models/SedieHistory";
import VipSedieWarHistoryItem from "./VipSedieWarHistoryItem";

const { ccclass } = cc._decorator;

@ccclass
export default class VipSedieWarHistory extends SedieHistory {
    onData(data: any) {
        const { page, pageSize, total, betLogs } = data;
        this.pagination.onSet(page, pageSize, total);
        this.content.destroyAllChildren();

        if (betLogs && betLogs.length) {
            betLogs.map((betLog, index) => {
                const itemNode = cc.instantiate(this.itemPrefab);
                this.content.addChild(itemNode);

                const item = itemNode.getComponent(VipSedieWarHistoryItem);
                item.getMiniPanel = () => this.node.parent;
                item.setData(betLog, index);
            });
        }
    }
}
