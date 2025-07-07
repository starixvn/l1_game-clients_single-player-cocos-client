import { BaseEventHandler } from "../../_new/_base/game-data-management/event-handlers/base-handler";
import NewTableGameData from "../models/NewTableGameData";

export type PlayerEventType = {
    player?: any;
    players?: any;
    outgame?: any;
};

export default class PlayerHandler extends BaseEventHandler<PlayerEventType> {
    protected readonly gameData: NewTableGameData;

    protected verifyEvent(event: PlayerEventType) {
        return event.player != null || event.players != null || event.outgame != null;
    }

    protected handle(event: PlayerEventType) {
        if (event.player) {
            this.gameData.playerModel.receivedPlayer(event.player);
        }

        if (event.players) {
            this.gameData.playerModel.receivedPlayers(event.players);
        }

        if (event.outgame) {
            this.gameData.playerModel.receivedRemovedPlayer(event.outgame);
        }
    }
}
