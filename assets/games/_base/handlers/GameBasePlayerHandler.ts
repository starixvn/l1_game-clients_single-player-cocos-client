import * as _ from "lodash";

import RoomPlayer, { PlayerData } from "../view-models/RoomPlayer";
import WebSocketTableGameBase from "../WebSocketTableGameBase";
import { IGameBasePlayerHandler } from "./interfaces";

export class GameBasePlayerHandler implements IGameBasePlayerHandler {
    otherPlayers = {};

    constructor(protected readonly main: WebSocketTableGameBase) {}

    handle(data: any) {
        if (data.player) {
            this.addPlayer(data.player);
        }

        if (data.players) {
            this.addPlayers(data.players);
        }

        if (data.outgame) {
            this.removePlayer(data.outgame);
        }
    }

    removePlayer(playerData: any) {
        if (playerData.playerId) {
            const slot = this.getPlayerSlot(playerData.playerId);

            if (slot) {
                slot.setInfo(null);
                const keys = Object.keys(this.otherPlayers);

                // Move player from others to slot
                if (keys.length > 0) {
                    const newPlayer = this.otherPlayers[keys[0]];
                    this.addPlayer(newPlayer);
                    delete this.otherPlayers[newPlayer.id];
                }
            } else {
                delete this.otherPlayers[playerData.playerId];
            }
        }
    }

    addPlayers(playersData) {
        const players: PlayerData[] = _.values(playersData);
        const realPlayers = _.filter(players, (player) => !player.type);
        const botPlayers = _.filter(players, (player) => player.type);

        _.forEach(realPlayers, (player) => {
            this.addPlayer(player);
        });

        _.forEach(botPlayers, (player) => {
            this.addPlayer(player);
        });
    }

    addPlayer(player: PlayerData) {
        const playerSlot = this.getPlayerSlot(player.id);
        const playerFromCache = RoomPlayer.getPlayerFromCache(player.id, this.main.gameName);
        player.idleCount = playerFromCache ? playerFromCache.idleCount : 0;

        if (!playerSlot) {
            const emptySlot = this.getEmptySlot();

            if (emptySlot && player.idleCount <= RoomPlayer.MAX_IDLE_COUNT) {
                emptySlot.setInfo(player);

                return;
            }

            this.otherPlayers[player.id] = player;
        }
    }

    updateTablePlayers() {
        const otherPlayers: any[] = _.values(this.otherPlayers);

        _.forEach(this.main.players, (player) => {
            if (!player.data) {
                return;
            }

            player.data.idleCount++;
            RoomPlayer.storePlayerToCache(player.data, this.main.gameName);

            if (player.isIdle) {
                const oldPlayerData = player.data;

                const newPlayer = _.find(otherPlayers, (player) => player.idleCount <= RoomPlayer.MAX_IDLE_COUNT);

                if (newPlayer) {
                    player.setInfo(newPlayer);
                    delete this.otherPlayers[newPlayer.id];
                    this.otherPlayers[oldPlayerData.id] = oldPlayerData;
                    _.remove(otherPlayers, newPlayer);
                }
            }
        });

        const botsInTable = _.filter(this.main.players, (player) => player.data && player.data.type);
        const realPlayers: PlayerData[] = _.filter(otherPlayers, (player) => player && !player.type);

        _.forEach(botsInTable, (bot) => {
            const botData = bot.data;
            const realPlayer = _.find(realPlayers, (player) => player.idleCount <= RoomPlayer.MAX_IDLE_COUNT);

            if (realPlayer) {
                this.otherPlayers[botData.id] = botData;
                bot.setInfo(realPlayer);
                delete this.otherPlayers[realPlayer.id];
                _.remove(realPlayers, realPlayer);
            }
        });
    }

    getPlayerSlot(playerId: string): RoomPlayer {
        return _.find(this.main.players, (player) => player.data && player.data.id === playerId);
    }

    getEmptySlot(): RoomPlayer {
        return _.find(this.main.players, (player) => !player.data);
    }

    getBotSlot(): RoomPlayer {
        return _.find(this.main.players, (player) => player.data && player.data.type);
    }
}
