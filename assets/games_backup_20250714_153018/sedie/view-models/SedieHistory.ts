import SedieHistoryBase from "../../_base/view-models/SedieHistoryBase";
import SedieHistoryItem from "./SedieHistoryItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SedieHistory extends SedieHistoryBase {
    bindItemRowData(betLog, index) {
        const itemNode = this.bindCommonData(betLog, index);
        const item = itemNode.getComponent(SedieHistoryItem);
        item.setData(betLog);
        this.content.addChild(itemNode);

        item.betLog = betLog;
    }
}
