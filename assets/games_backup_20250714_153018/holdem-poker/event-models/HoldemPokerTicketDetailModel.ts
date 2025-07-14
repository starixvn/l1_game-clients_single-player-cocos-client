import EventEmitterBase from "../../../common/emitter/EventEmitterBase";

export class HoldemPokerTicketDetailModel extends EventEmitterBase {
    static Events = {
        CHANGE: "ticketDetail:change"
    };

    ticketDetail: any;

    changeTicketDetail(ticketDetail: any) {
        this.ticketDetail = ticketDetail;
        this.emit(HoldemPokerTicketDetailModel.Events.CHANGE, this);
    }
}
