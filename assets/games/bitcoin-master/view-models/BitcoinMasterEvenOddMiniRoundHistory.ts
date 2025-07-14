import MiniRoundHistory from "../../../common/mini-round-history/MiniRoundHistory";
import { BMHeaderMenu } from "./BitcoinMasterCommon";

const { ccclass } = cc._decorator;

@ccclass
export default class BitcoinMasterEvenOddMiniRoundHistory extends MiniRoundHistory {
    public handleBetHistory = (roundId: number, view) => {};

    onLoad() {
        super.onLoad();
        this.items.forEach((item) => {
            item.node.on("click", () => {
                this.openBetHistory(item.data.roundId);
            });
        });
    }

    openBetHistory(roundId: number) {
        this.handleBetHistory(roundId, BMHeaderMenu.EvenOdd);
    }
}
