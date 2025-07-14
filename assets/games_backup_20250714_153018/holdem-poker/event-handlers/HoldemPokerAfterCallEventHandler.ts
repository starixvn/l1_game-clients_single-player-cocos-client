import { OldCardModel } from "../../../common/new-card/view-models/NewCard";
import HoldemPokerEventHandler from "./HoldemPokerEventHandler";

export type HoldemPokerAfterCall = {
    call: {
        choices: Record<string, number>;
        dealer: OldCardModel[];
        communityCards: OldCardModel[];
        combinationResult: {
            player: {
                id: number;
                combinationCards: any;
                cards: OldCardModel[];
            };
            dealer: {
                id: number;
                combinationCards: any;
                cards: OldCardModel[];
            };
            isQualified: boolean;
        };
        totalAmount: number;
    };
};

export default class HoldemPokerAfterCallEventHandler extends HoldemPokerEventHandler<HoldemPokerAfterCall> {
    protected verifyEvent(event: HoldemPokerAfterCall) {
        return !!event.call;
    }

    protected handle(event: HoldemPokerAfterCall) {
        const { dealer, communityCards, combinationResult, totalAmount } = event.call;
        const covertedData = { communityCards, combinationResult, totalAmount, dealerCards: dealer };
        this.gameData.callModel.changeDataAfterCall(covertedData);
    }
}
