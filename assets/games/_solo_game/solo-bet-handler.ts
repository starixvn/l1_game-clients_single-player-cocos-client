import { BetEventType, BetHandler } from "../_base_new/handlers/BetHandler";
import SoloGameData from "./solo-game-data";

export class SoloBetHandler extends BetHandler {
    protected readonly gameData: SoloGameData;

    protected verifyEvent(event: BetEventType) {
        const successfulVerify = super.verifyEvent(event);
        return successfulVerify || !!event.playerChip || !!event.ownChip || !!event.chips;
    }

    protected handle(event: BetEventType) {
        if (event.endBet) {
            if (event.endBet === -1) {
                this.gameData.betModel.placeBetFailed();
            } else {
                this.gameData.betModel.placeBetSuccess(event.endBet);
            }
        }

        if (event.ownBets) {
            this.gameData.betModel.changeOwnBets(event.ownBets);
            const isInGamePackage = event.gameConfigs !== undefined;
            if (isInGamePackage) {
                this.gameData.betModel.changeOwnChipsFake(event.ownBets);
                this.gameData.betModel.initOwnChipsByOwnBets(event.ownBets);
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
