import EventEmitterBase from "../../../common/emitter/EventEmitterBase";
import { OldCardModel } from "../../../common/new-card/view-models/NewCard";

export class OwnBetModelBase extends EventEmitterBase {
    static Events = {
        OWN_BETS: "ownBets",
        EMPTY: "empty"
    };

    bets: any;
    roundId: number;
    playerCards: OldCardModel[];
    communityCards: OldCardModel[];
    combinationResult: any;
    totalAmount: number;
    hasSwappedOrHold: boolean;

    changeOwnBets(props: {
        bets: any;
        playerCards: OldCardModel[];
        communityCards: OldCardModel[];
        combinationResult: any;
        roundId: number;
        totalAmount: number;
        hasSwappedOrHold: boolean;
    }) {
        const { bets, playerCards, communityCards, combinationResult, roundId, totalAmount, hasSwappedOrHold } = props;
        this.bets = bets;
        this.playerCards = playerCards;
        this.combinationResult = combinationResult;
        this.communityCards = communityCards;
        this.totalAmount = totalAmount;
        this.roundId = roundId;
        this.hasSwappedOrHold = hasSwappedOrHold;
        this.emit(OwnBetModelBase.Events.OWN_BETS, this);
    }
}
