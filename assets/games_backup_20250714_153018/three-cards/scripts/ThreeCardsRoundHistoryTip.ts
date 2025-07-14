import GameUtils from "../../../common/GameUtils";
import MiniRoundHistoryTip from "../../../common/mini-round-history/MiniRoundHistoryTip";
import ThreeCardsResultItem from "./ThreeCardsResultItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ThreeCardsRoundHistoryTip extends MiniRoundHistoryTip {
    @property(ThreeCardsResultItem)
    resultItem: ThreeCardsResultItem = null;

    public setData(data: any) {
        this.roundId.string = `#${data.roundId}`;

        const result = data.result ? "red" : "black";
        this.result.string = `${GameUtils.getBetChoiceString(result).toUpperCase()}`;
        this.resultItem && this.resultItem.setData(data.detail);
    }
}
