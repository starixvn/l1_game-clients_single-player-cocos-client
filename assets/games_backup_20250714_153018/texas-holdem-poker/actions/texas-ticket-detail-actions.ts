import TexasTicketDetailModel from "../event-models/texas-ticket-detail-model";
import BetHistory from "../../_new/common/BetHistory";

export const renderTicketDetail = (ticketHistory: BetHistory) => (data: TexasTicketDetailModel) => {
    ticketHistory.showTicketDetail(data);
};
