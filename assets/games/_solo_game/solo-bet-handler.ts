import { BetEventType, BetHandler } from "../_base_new/handlers/BetHandler";
import SoloGameData from "./solo-game-data";
import { SoloBetState } from "./solo-bet-model";

export class SoloBetHandler extends BetHandler {
    protected readonly gameData: SoloGameData;

    protected verifyEvent(event: BetEventType) {
        const successfulVerify = super.verifyEvent(event);
        return successfulVerify || !!event.playerChip || !!event.ownChip || !!event.chips;
    }

    protected handle(event: BetEventType) {
        if (event.endBet) {
            this.gameData.betModel.changeState(SoloBetState.RECEIVE_END_BET);

            if (event.endBet === -1) {
                this.gameData.betModel.placeBetFailed();
            } else {
                this.gameData.betModel.placeBetSuccess(event.endBet);
                this.gameData.betModel.changeState(SoloBetState.PLACE_BET_SUCCESS);
            }
            if (event.roundId) {
                this.gameData.changeRoundId(event.roundId);
            }
        }

        if (event.betPercentage || event.userBetPercentage) {
            this.gameData.betModel.changeBetPercentage(event.betPercentage || event.userBetPercentage);
        }

        if (event.rebet) {
            this.gameData.betModel.handleRebet(event.rebet);
        }

        if (event.ownChip) {
            this.gameData.betModel.changeOwnChip(event.ownChip);
        }

        if (event.playerChip && this.gameData.gotIngameData) {
            this.gameData.betModel.changePlayerChip(event);
        }

        if (event.chips) {
            this.gameData.betModel.changeTotalChips(event.chips);
        }
    }
}
