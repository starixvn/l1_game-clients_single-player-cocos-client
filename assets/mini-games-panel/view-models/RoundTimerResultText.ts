import GameUtils from "../../common/GameUtils";
import { GameRoundTimerData } from "./RoundTimerData";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RoundTimerResultText extends cc.Component {
    @property(cc.Label)
    result: cc.Label = null;

    show(data: GameRoundTimerData, betChoices: string[]) {
        const { settlementResult } = data;
        let choiceName = "";
        Object.keys(settlementResult).forEach((key) => {
            const index = betChoices.findIndex((value) => value === key);
            if (settlementResult[key] && index !== -1) {
                choiceName += GameUtils.getBetChoiceString(betChoices[index]);
            }
        });

        this.result.string = choiceName;
    }
}
