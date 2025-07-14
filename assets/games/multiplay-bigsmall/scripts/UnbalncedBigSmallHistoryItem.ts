import { i18n } from "../../../ClientModules";
import { numberWithCommas } from "../../../common/helpers/NumberHelper";
import HistoryDicesResult from "../../_base/view-models/HistoryDicesResult";
import MultiplayGameHistoryItem from "../../multiplay/scripts/MultiplayGameHistoryItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UnbalncedBigSmallHistoryItem extends MultiplayGameHistoryItem {
    @property(cc.Label)
    betChoice: cc.Label = null;

    @property(cc.Node)
    result: cc.Node = null;

    @property(cc.Prefab)
    resultPrefab: cc.Prefab = null;

    @property(cc.Label)
    stake: cc.Label = null;

    setData(data: any, index: number) {
        super.setData(data, index);
        this.stake.string = numberWithCommas(data.totalAmount, 2);
        this.setResultData(data);
        const winChoice = +data.big > 0 ? "big" : "small";
        const textWinChoice = i18n.t(`ui.choice_${winChoice}`);
        this.betChoice.string = textWinChoice;
        if (data.betwin > 0) {
            this.stake.node.color = this.betChoice.node.color = cc.Color.YELLOW;
        }
    }

    setResultData(data: any) {
        const { result, settlementResult } = data;
        const resultNode = cc.instantiate(this.resultPrefab);
        const resultControl = resultNode.getComponent(HistoryDicesResult);
        resultControl.setResult(result, settlementResult);
        this.result.addChild(resultNode);
    }
}
