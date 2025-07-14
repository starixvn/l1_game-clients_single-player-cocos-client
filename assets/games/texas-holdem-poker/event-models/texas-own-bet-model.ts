import { OldCardModel } from "../../../common/new-card/view-models/NewCard";
import { OwnBetModelBase } from "../../_casino/event-models/OwnBetModelBase";
import { TexasChoicesType } from "../texas-type";

export default class TexasOwnBetModel extends OwnBetModelBase {
    static Events = {
        OWN_BETS: "ownBets",
        ROUNDID_CHANGE: "texasPokerRoundId",
        EMPTY: "empty"
    };

    roundId: number;
    bets: TexasChoicesType;

    updateRoundId(roundId: number) {
        this.roundId = roundId;
        this.emit(TexasOwnBetModel.Events.ROUNDID_CHANGE, roundId);
    }

    changeOwnBets(props: {
        bets: any;
        playerCards: OldCardModel[];
        communityCards: OldCardModel[];
        combinationResult: any;
        roundId: number;
        totalAmount: number;
        hasSwappedOrHold: boolean;
    }) {
        this.roundId = props.roundId;
        super.changeOwnBets(props);
    }

    receiveEmpty() {
        this.emit(TexasOwnBetModel.Events.EMPTY, this);
    }
}
