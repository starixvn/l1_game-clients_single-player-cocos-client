import { OldCardModel } from "../../../common/new-card/view-models/NewCard";

export type OwnBetDataType = {
    ownBets: {
        roundId: number;
        bets: Record<string, number>;
        player: OldCardModel[];
        communityCards: OldCardModel[];
        combinationResult: {
            player: {
                id: number;
                combinationCards: OldCardModel[];
                cards: OldCardModel[];
            };
        };
        totalAmount: number;
        hasSwappedOrHold: boolean;
    };
};

export type CasinoHoldDataType = {
    hold: {
        player: OldCardModel[];
        combinationResult: {
            player: {
                id: number;
                combinationCards: OldCardModel[];
                cards: OldCardModel[];
            };
        };
        roundId: number;
        communityCards?: OldCardModel[];
    };
};

export type CasinoSwapDataType = {
    swap: {
        player: OldCardModel[];
        combinationResult: {
            player: {
                id: number;
                combinationCards: OldCardModel[];
                cards: OldCardModel[];
            };
        };
        roundId: number;
    };
};
