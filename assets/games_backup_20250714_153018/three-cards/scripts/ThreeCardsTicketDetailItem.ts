import GameUtils from "../../../common/GameUtils";
import { numberWithCommas } from "../../../common/helpers/NumberHelper";
import { userManager } from "../../../common/user/UserManager";
import GameTicketDetailItemBase from "../../_base/view-models/GameTicketDetailItemBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ThreeCardsTicketDetailItem extends GameTicketDetailItemBase {
    @property(cc.Label)
    choice: cc.Label = null;

    @property(cc.Label)
    odds: cc.Label = null;

    @property(cc.Label)
    bet: cc.Label = null;

    setData({ choice, odds, bet }) {
        this.choice.string = GameUtils.getBetChoiceString(choice);
        this.odds.string = userManager.fractionalOddsFormat ? numberWithCommas(+odds - 1, 2) : odds;
        this.bet.string = numberWithCommas(bet);
    }

    setHighlight(highlight: boolean) {
        const color = highlight ? cc.Color.YELLOW : cc.Color.WHITE;
        this.choice.node.color = color;
        this.odds.node.color = color;
        this.bet.node.color = color;
    }
}
