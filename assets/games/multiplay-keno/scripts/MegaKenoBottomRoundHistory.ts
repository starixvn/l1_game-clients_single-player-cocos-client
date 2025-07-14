import MiniRoundHistory from "../../../common/mini-round-history/MiniRoundHistory";
import MiniRoundHistoryTip from "../../../common/mini-round-history/MiniRoundHistoryTip";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MegaKenoBottomRoundHistory extends MiniRoundHistory {
    public handleBetHistory = (roundId: number) => {};
    @property({ visible: false, override: true })
    tip: MiniRoundHistoryTip = null;

    onLoad() {
        super.onLoad();
        this.items.forEach((item) => {
            item.node.on("click", () => {
                this.openBetHistory(item.data.roundId);
            });
        });
    }

    openBetHistory(roundId: number) {
        this.handleBetHistory(roundId);
    }
}
