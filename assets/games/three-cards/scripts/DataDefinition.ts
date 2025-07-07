import { CardModel } from "../../../common/new-card/view-models/NewCard";

export type ThreeCardsResultData = string[];

export type ThreeCardsGameResultData = CardModel[];

export interface ThreeCardsSettlementResultData {
    red: boolean;
    black: boolean;
    diamonds: boolean;
    hearts: boolean;
    clubs: boolean;
    spades: boolean;
}

export interface ThreeCardsOdds {
    red: number;
    black: number;
    diamonds: number;
    hearts: number;
    clubs: number;
    spades: number;
}

export interface ThreeCardsBetData {
    red: number;
    black: number;
    diamonds: number;
    hearts: number;
    clubs: number;
    spades: number;

    time: string;
    phien: string;
    betwin: number;
    result: ThreeCardsGameResultData;
    settlementResult: ThreeCardsSettlementResultData;
    odds: ThreeCardsOdds;
}

export interface ThreeCardsRoundData {
    result: ThreeCardsGameResultData;
    settlementResult: ThreeCardsSettlementResultData;
    roundId: number;
}
