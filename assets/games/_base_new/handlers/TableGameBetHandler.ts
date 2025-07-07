import NewTableGameData from "../models/NewTableGameData";
import { BetEventType, BetHandler } from "./BetHandler";

export class TableGameBetHandler extends BetHandler {
    protected readonly gameData: NewTableGameData;

    protected verifyEvent(event: BetEventType) {
        const successfulVerify = super.verifyEvent(event);
        return successfulVerify || !!event.playerChip || !!event.ownChip || !!event.chips;
    }

    protected handle(event: BetEventType) {
        super.handle(event);
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
