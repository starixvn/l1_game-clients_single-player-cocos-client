import EventEmitterBase from "../../../common/emitter/EventEmitterBase";
import { OldCardModel } from "../../../common/new-card/view-models/NewCard";

export interface HoldModelType {
    playerCards: OldCardModel[];
    combinationResult: any;
    roundId: number;
}
export default class HoldModelBase extends EventEmitterBase {
    static Events = {
        CHANGE: "afterHold:change"
    };

    playerCards: OldCardModel[];
    combinationResult: any;
    roundId: number;

    changeDataAfterHold(options: HoldModelType) {
        const { playerCards, combinationResult, roundId } = options;
        this.playerCards = playerCards;
        this.roundId = roundId;
        this.combinationResult = combinationResult;
        this.emit(HoldModelBase.Events.CHANGE, this);
    }
}
