import MiniRoundHistory from "../MiniRoundHistory";

const { ccclass } = cc._decorator;

@ccclass
export default class SedieMiniRoundHistory extends MiniRoundHistory {
    public handleBetHistory = (roundId: number) => {};

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
