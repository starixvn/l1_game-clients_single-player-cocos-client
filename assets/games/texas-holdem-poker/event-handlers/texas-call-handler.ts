import { OldCardModel } from "../../../common/new-card/view-models/NewCard";
import TexasEventHandler from "./texas-event-handler";

export type TexasHoldemCall = {
    call: {
        choices: Record<string, number>;
        combinationResult: {
            player: {
                id: number;
                combinationCards: OldCardModel[];
                cards: OldCardModel[];
            };
        };
        communityCards: OldCardModel[];
        totalAmount: number;
        roundId?: number;
    };
};

export default class TexasCallHandler extends TexasEventHandler<TexasHoldemCall> {
    protected verifyEvent(event: TexasHoldemCall) {
        return !!event.call;
    }

    protected handle(event: TexasHoldemCall) {
        const { communityCards, combinationResult, totalAmount } = event.call;

        this.gameData.callModel.changeDataAfterCall({ communityCards, combinationResult, totalAmount });
    }
}
