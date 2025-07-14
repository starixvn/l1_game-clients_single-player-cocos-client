import MiniRoundHistory from "../../../common/mini-round-history/MiniRoundHistory";
import VipBaccaratMiniRoundHistoryItem from "./VipBaccaratMiniRoundHistoryItem";

const { ccclass } = cc._decorator;
@ccclass
export default class VipBaccaratMiniRoundHistory extends MiniRoundHistory {
    protected onUpdate(node: cc.Node) {
        const data = node.getComponent(VipBaccaratMiniRoundHistoryItem).data;
        this.tip.node.active && this.tip.setData(data);
    }
}
