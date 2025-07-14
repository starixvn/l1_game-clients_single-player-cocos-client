import { CardModel } from "../../../common/new-card/view-models/NewCard";

export interface TicketHistoryData {
    betLogs: BetLog[];
    page: number;
    pageSize: number;
    total: number;
}

export interface BetLog {
    id: number;
    time: string;
    amount: number;
    betwin: number;
    endTime: string;
    betLogDetails: BetLogDetail[];
}

export interface BetLogDetail {
    time: string;
    order: number;
    choice: string;
    cards: CardModel[];
    amount: number;
    betwin: number;
}
