import GameUtils from "../../../common/GameUtils";
import { getStringHourByTime } from "../../../common/helpers/DateTimeHelper";
import { numberWithCommas } from "../../../common/helpers/NumberHelper";
import GameTicketDetailItemBase from "../../_base/view-models/GameTicketDetailItemBase";

const { ccclass, property } = cc._decorator;
@ccclass
export default class SicBoTicketDetailItem extends GameTicketDetailItemBase {
    @property(cc.Label)
    time: cc.Label = null;

    @property(cc.Label)
    type: cc.Label = null;

    @property(cc.Label)
    choice: cc.Label = null;

    @property(cc.Label)
    amount: cc.Label = null;

    height: number = null;

    updateContent(log: any, settlementResult: any, index: number) {
        const typeNumberText = GameUtils.getText("ui.type_bet_number");
        const totalScoreText = GameUtils.getText("ui.total_score");
        const betTypes = {
            small: GameUtils.getText("ui.type_big_small"),
            big: GameUtils.getText("ui.type_big_small"),
            anyTriple: GameUtils.getText("ui.any_triple"),
            specific1: typeNumberText,
            specific2: typeNumberText,
            specific3: typeNumberText,
            specific4: typeNumberText,
            specific5: typeNumberText,
            specific6: typeNumberText,
            total4: totalScoreText,
            total5: totalScoreText,
            total6: totalScoreText,
            total7: totalScoreText,
            total8: totalScoreText,
            total9: totalScoreText,
            total10: totalScoreText,
            total11: totalScoreText,
            total12: totalScoreText,
            total13: totalScoreText,
            total14: totalScoreText,
            total15: totalScoreText,
            total16: totalScoreText,
            total17: totalScoreText
        };

        const betChoices = {
            small: GameUtils.getBetChoiceString("small"),
            big: GameUtils.getBetChoiceString("big"),
            anyTriple: GameUtils.getText("ui.any_triple"),
            specific1: "1",
            specific2: "2",
            specific3: "3",
            specific4: "4",
            specific5: "5",
            specific6: "6",
            total4: "4",
            total5: "5",
            total6: "6",
            total7: "7",
            total8: "8",
            total9: "9",
            total10: "10",
            total11: "11",
            total12: "12",
            total13: "13",
            total14: "14",
            total15: "15",
            total16: "16",
            total17: "17"
        };

        this.time.string = getStringHourByTime(log.time);
        this.type.string = betTypes[log.choice];
        this.choice.string = betChoices[log.choice];
        this.amount.string = numberWithCommas(log.amount);

        if (settlementResult[log.choice]) {
            this.choice.node.color = cc.Color.YELLOW;
            this.amount.node.color = cc.Color.YELLOW;
        } else {
            this.choice.node.color = cc.Color.WHITE;
            this.amount.node.color = cc.Color.WHITE;
        }

        this.height = this.node.height;
        this.setBackground(index);
    }
}
