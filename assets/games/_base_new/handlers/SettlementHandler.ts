import { BaseEventHandler } from "../../_new/_base/game-data-management/event-handlers/base-handler";
import NewGameData from "../models/NewGameData";

export type SettlementType = {
    finish?: any;
    status?: any;
    winners?: any;
};

export class SettlemenHandler extends BaseEventHandler<SettlementType> {
    protected readonly gameData: NewGameData;
    protected verifyEvent(event: SettlementType) {
        return event.finish != null || event.status != null || event.winners != null;
    }

    protected handle(event: SettlementType) {
        if (event.finish != null) {
            this.gameData.settlement.showResult(event.finish);
        }

        if (event.status != null) {
            this.gameData.settlement.receiveStatus(event.status);
        }

        if (event.winners) {
            this.gameData.settlement.receiveWinners(event.winners.winningPlayers);
        }
    }
}
