import { BaseEventHandler } from "../../_new/_base/game-data-management/event-handlers/base-handler";
import NewGameData from "../models/NewGameData";

export type RoundHistoryType = {
    roundHistory: any;
    roundId: number;
};

export class RoundHistoryHandler extends BaseEventHandler<RoundHistoryType> {
    protected readonly gameData: NewGameData;
    protected verifyEvent(event: RoundHistoryType) {
        return event.roundHistory != null;
    }

    protected handle(event: RoundHistoryType) {
        if (event.roundId) {
            this.gameData.roundHistory.enterGameRoundId = event.roundId;
        }

        this.gameData.gotIngameData = true;
        this.gameData.roundHistory.change(event.roundHistory);
    }
}
