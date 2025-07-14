import HoldemPokerTicketHistory from "../../../holdem-poker/view-models/history/HoldemPokerTicketHistory";
import TexasTicketDetail from "./texas-ticket-detail";

const { ccclass } = cc._decorator;

@ccclass
export default class TexasTicketHistory extends HoldemPokerTicketHistory {
    protected ticketDetailComponent: TexasTicketDetail = null;
}
