import { OldCardModel } from "../../../common/new-card/view-models/NewCard";
import TexasEventHandler from "./texas-event-handler";

export type TexasHoldemAutoSettle = {
    autoSettle: {
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
        totalAmount: number;
        step: string;
    };
};

export default class TexasAutoSettleHandler extends TexasEventHandler<TexasHoldemAutoSettle> {
    protected verifyEvent(event: TexasHoldemAutoSettle) {
        return !!event.autoSettle;
    }

    protected handle(event: TexasHoldemAutoSettle) {
        this.gameData.isProcessingBet = false;
        const { communityCards, combinationResult, totalAmount, dealer, step } = event.autoSettle;

        this.gameData.autoSettleModel.updateModel({
            combinationResult: combinationResult,
            totalAmount: totalAmount,
            step: step,
            dealerCards: dealer,
            communityCards: communityCards
        });
        this.gameData.settlement.waiting = this.gameData.settlement.autoSettle = true;
    }
}
