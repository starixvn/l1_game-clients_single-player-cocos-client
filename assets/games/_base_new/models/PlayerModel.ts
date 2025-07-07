import EventEmitterBase from "../../../common/emitter/EventEmitterBase";
import { PlayerData } from "../../_base/view-models/RoomPlayer";

export default class PlayerModel extends EventEmitterBase {
    static Events = {
        ADD_PLAYER: "PlayerModel:HAS_PLAYER",
        ADD_PLAYERS: "PlayerModel:HAS_PLAYERS",
        REMOVE_PLAYER: "PlayerModel:REMOVE_PLAYER"
    };
    player: any;
    players = {};

    receivedPlayer(playerData: PlayerData) {
        this.player = playerData;
        this.players[playerData.id] = playerData;
        this.emit(PlayerModel.Events.ADD_PLAYER, playerData);
    }

    receivedPlayers(playersData) {
        this.players = playersData;
        this.emit(PlayerModel.Events.ADD_PLAYERS, this.players);
    }

    receivedRemovedPlayer(playerData: any) {
        playerData.playerId && this.emit(PlayerModel.Events.REMOVE_PLAYER, playerData.playerId);
        delete this.players[playerData.playerId];
    }

    updateUI() {
        Object.keys(this.players).length > 0 && this.emit(PlayerModel.Events.ADD_PLAYERS, this.players);
    }
}
