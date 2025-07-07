import { HoldemPokerTicketDetailModel } from "../event-models/HoldemPokerTicketDetailModel";
import BetHistory from "../../_new/common/BetHistory";

export const renderTicketDetail = (ticketHistory: BetHistory) => (data: HoldemPokerTicketDetailModel) => {
    ticketHistory.showTicketDetail(data);
};
