import MiniRoundHistory from "../../../common/mini-round-history/MiniRoundHistory";
import LotteryMiniRoundHistoryItem from "./LotteryMiniRoundHistoryItem";
import LotteryRoundHistoryTip from "./LotteryRoundHistoryTip";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LotteryMiniRoundHistory extends MiniRoundHistory {
    @property()
    type = "BigSmall";

    onLoad() {
        super.onLoad();
        const type = this.type === "BigSmall" ? 0 : 1;
        this.items.forEach((item) => {
            const itemComponent = item.getComponent(LotteryMiniRoundHistoryItem);
            itemComponent.type = type;
        });

        const tip = this.tip.getComponent(LotteryRoundHistoryTip);
        tip.type = type;
    }
}
