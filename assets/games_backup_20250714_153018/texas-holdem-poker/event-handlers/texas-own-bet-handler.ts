import { OwnBetDataType } from "../../_casino/event-models/CasinoDataType";
import TexasGameDataModel from "../event-models/texas-game-data-model";
import { cloneDeepChoiceData } from "../texas-helper";
import TexasEventHandler from "./texas-event-handler";

export default class TexasOwnBetHandler extends TexasEventHandler<OwnBetDataType> {
    protected verifyEvent(event: OwnBetDataType) {
        return !!event.ownBets;
    }

    protected handle(event: OwnBetDataType) {
        this.gameData.isProcessingBet = false;
        const { bets, combinationResult, communityCards, roundId, player, totalAmount, hasSwappedOrHold } = event.ownBets;

        if (!bets) {
            this.gameData.ownBets.receiveEmpty();
            return;
        }
        const betsConverted = cloneDeepChoiceData(bets);
        this.gameData.ownBets.updateRoundId(roundId);
        this.gameData.emit(TexasGameDataModel.Events.CHOICES_RESULT, betsConverted);
        this.gameData.stateModel.rejoinTable(communityCards.length, hasSwappedOrHold);
        this.gameData.ownBets.changeOwnBets({
            totalAmount: totalAmount,
            combinationResult: combinationResult,
            communityCards: communityCards,
            bets: betsConverted,
            playerCards: player,
            roundId: roundId,
            hasSwappedOrHold: hasSwappedOrHold
        });
    }
}
