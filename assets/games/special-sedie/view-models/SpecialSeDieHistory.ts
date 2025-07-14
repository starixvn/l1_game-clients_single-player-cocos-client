import SedieHistoryBase from "../../_base/view-models/SedieHistoryBase";
import SpecialSeDieHistoryItem from "./SpecialSeDieHistoryItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SpecialSeDieHistory extends SedieHistoryBase {
    public handleBetHistory = (roundId) => {};

    bindItemRowData(betLog: any, index: number) {
        const itemNode = this.bindCommonData(betLog, index);
        const item = itemNode.getComponent(SpecialSeDieHistoryItem);
        item.setData(betLog);
        item.handleRoundIdClick = (roundId) => {
            this.openBetHistory(roundId);
        };
        this.content.addChild(itemNode);
    }

    openBetHistory(roundId: number) {
        this.handleBetHistory(roundId);
    }
}
