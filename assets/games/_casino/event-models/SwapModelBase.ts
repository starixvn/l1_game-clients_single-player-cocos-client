import { OldCardModel } from "../../../common/new-card/view-models/NewCard";
import EventEmitterBase from "../../../common/emitter/EventEmitterBase";

export default class SwapModelBase extends EventEmitterBase {
    static Events = {
        CHANGE: "afterSwap:change"
    };

    playerCards: OldCardModel[];
    combinationResult: any;
    roundId: number;

    changeDataAfterSwap(playerCards: OldCardModel[], combinationResult: any, roundId: number) {
        this.playerCards = playerCards;
        this.roundId = roundId;
        this.combinationResult = combinationResult;
        this.emit(SwapModelBase.Events.CHANGE, this);
    }
}
