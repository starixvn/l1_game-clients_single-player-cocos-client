import * as i18n from "i18n/runtime-scripts/LanguageData";

import { getStringHourByTime } from "../../../../common/helpers/DateTimeHelper";
import { numberWithCommas } from "../../../../common/helpers/NumberHelper";
import { userManager } from "../../../../common/user/UserManager";
import SocketIOHistoryItemBase from "../../../_base/view-models/SocketIOHistoryItemBase";

const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu("Games/HolemPoker/HoldemPokerTicketDetailItem")
export default class HoldemPokerTicketDetailItem extends SocketIOHistoryItemBase {
    @property(cc.Label)
    bettingOption: cc.Label = null;

    @property(cc.Label)
    stake: cc.Label = null;

    @property(cc.Label)
    odd: cc.Label = null;

    protected getBettingOptionName(bet: any) {
        return bet.betChoice === "call" ? `holdEmPoker.${bet.betChoice}Choice` : `holdEmPoker.${bet.betChoice}`;
    }

    renderTicketDetailItem(bet: any, index: number, totalRow: number) {
        const bettingOption = this.getBettingOptionName(bet);
        this.bettingOption.string = `${i18n.t(bettingOption).toUpperCase()}`;
        this.stake.string = numberWithCommas(bet.stake);
        this.win.string = numberWithCommas(bet.win);
        this.time.string = getStringHourByTime(bet.time);
        this.odd.string = userManager.fractionalOddsFormat && bet.odds ? numberWithCommas(+bet.odds - 1, 2) : bet.odds || "-";
        this.setBackground(index);
        if (bet.win > 0) {
            this.stake.node.color = cc.Color.YELLOW;
            this.odd.node.color = cc.Color.YELLOW;
            this.bettingOption.node.color = cc.Color.YELLOW;
        }
    }
}
