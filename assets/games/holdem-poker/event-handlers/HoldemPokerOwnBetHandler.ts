import * as _ from "lodash";

import { OwnBetDataType } from "../../_casino/event-models/CasinoDataType";
import HoldemPokerChoices from "../event-models/HoldemPokerChoices";
import { HoldemPokerGameData } from "../event-models/HoldemPokerGameData";
import HoldemPokerEventHandler from "./HoldemPokerEventHandler";

export default class HoldemPokerOwnBetHandler extends HoldemPokerEventHandler<OwnBetDataType> {
    protected verifyEvent(event: OwnBetDataType) {
        return !!event.ownBets;
    }

    protected handle(event: OwnBetDataType) {
        this.gameData.isProcessingBet = false;

        if (!_.isEmpty(event.ownBets)) {
            const { player, communityCards, combinationResult, roundId, totalAmount, hasSwappedOrHold } = event.ownBets;

            const choices = new HoldemPokerChoices();
            choices.aa = event.ownBets.bets.aa ?? 0;
            choices.ante = event.ownBets.bets.ante;

            this.gameData.emit(HoldemPokerGameData.Events.CHOICES_RESULT, event.ownBets.bets);
            this.gameData.stateModel.rejoinTable(communityCards.length, hasSwappedOrHold);
            this.gameData.roundCounter.change(roundId);
            this.gameData.ownBets.changeOwnBets({
                bets: choices,
                playerCards: player ? player : null,
                communityCards: communityCards,
                combinationResult: combinationResult,
                roundId: roundId,
                totalAmount: totalAmount,
                hasSwappedOrHold: hasSwappedOrHold
            });
        }
    }
}
