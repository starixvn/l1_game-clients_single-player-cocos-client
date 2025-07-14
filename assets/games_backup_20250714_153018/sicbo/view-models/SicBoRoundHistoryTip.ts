import GameUtils from "../../../common/GameUtils";

import MiniRoundHistoryTip from "../../../common/mini-round-history/MiniRoundHistoryTip";
import { SicBoBetType } from "./SicBoCommon";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SicBoRoundHistoryTip extends MiniRoundHistoryTip {
    public setData(data: any) {
        this.roundId.string = `#${data.roundId}`;

        const betChoices = {
            small: "ui.choice_small",
            big: "ui.choice_big",
            anyTriple: "ui.any_triple"
        };
        let key = "";
        if (data.settlementResult[SicBoBetType.anyTriple]) {
            key = betChoices[SicBoBetType.anyTriple];
        } else {
            if (data.settlementResult[SicBoBetType.big]) {
                key = betChoices[SicBoBetType.big];
            } else {
                key = betChoices[SicBoBetType.small];
            }
        }

        const keyText = GameUtils.getText(key).toUpperCase();
        this.result.string = `${keyText} (${data.result.dice1}-${data.result.dice2}-${data.result.dice3})`;
        this.show();
    }
}
