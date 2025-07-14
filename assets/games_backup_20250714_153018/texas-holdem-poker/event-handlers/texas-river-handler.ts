import { OldCardModel } from "../../../common/new-card/view-models/NewCard";
import TexasEventHandler from "./texas-event-handler";

export type TexasHoldemRiver = {
    river: {
        dealer: OldCardModel[];
        communityCards: OldCardModel[];
        combinationResult: {
            player: {
                id: number;
                combinationCards: OldCardModel[];
                cards: OldCardModel[];
            };
            dealer: {
                id: number;
                combinationCards: OldCardModel[];
                cards: OldCardModel[];
            };
        };
        choices: Record<string, number>;
        roundId: number;
        totalAmount: number;
    };
};

export default class TexasRiverHandler extends TexasEventHandler<TexasHoldemRiver> {
    protected verifyEvent(event: TexasHoldemRiver) {
        return !!event.river;
    }

    protected handle(event: TexasHoldemRiver) {
        this.gameData.isProcessingBet = false;
        const { communityCards, combinationResult, totalAmount, dealer } = event.river;

        this.gameData.riverModel.updateModel(dealer, communityCards, combinationResult, totalAmount);
    }
}
