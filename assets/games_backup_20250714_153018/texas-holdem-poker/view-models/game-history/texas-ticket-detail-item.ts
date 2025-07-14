import HoldemPokerTicketDetailItem from "../../../holdem-poker/view-models/history/HoldemPokerTicketDetailItem";

const { ccclass } = cc._decorator;

@ccclass
export default class TexasTicketDetailItem extends HoldemPokerTicketDetailItem {
    protected getBettingOptionName(bet: any) {
        return `texasPoker.${bet.betChoice}`;
    }
}
