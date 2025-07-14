import SocketIOGameHistoryBase from "../../../_base/view-models/SocketIOGameHistoryBase";
import KenoRoundResult from "./KenoRoundResult";
import KenoUserHistoryItem from "./KenoUserHistoryItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class KenoUserHistory extends SocketIOGameHistoryBase {
    @property(cc.Prefab)
    prefabRoundResult: cc.Prefab = null;
    private roundResult: KenoRoundResult = null;

    bindItemRowData(betLog, index) {
        const historyItemPrefab = cc.instantiate(this.itemPrefab);
        const item = historyItemPrefab.getComponent(KenoUserHistoryItem);
        item.initMain(this);
        item.setData(betLog, index);
        this.content.addChild(historyItemPrefab);
    }

    public showRoundResult(round, total: number, result: number[], settlementResult: any) {
        const dialog = cc.instantiate(this.prefabRoundResult);
        this.roundResult = dialog.getComponent("KenoRoundResult");
        this.roundResult.round.string = round;
        this.node.addChild(dialog);
        this.roundResult.setData(result, settlementResult);
        this.roundResult.showResult();
    }

    public hideRoundResult() {
        this.roundResult = null;
    }
}
