import _ = require("lodash");

import { getLowercaseObjectKeys } from "../../../common/helpers/ObjectHelper";
import { appManager } from "../../../managers/AppManager";
import RoomPlayer, { PlayerData } from "../../_base/view-models/RoomPlayer";
import TableGameBase from "../view-models/TableGameBase";

export const handlePlacingBet = (game: TableGameBase) => () => {
    game.highlightLastResult();
};

export const hanleAddPlayer = (mainGame: TableGameBase) => (player: PlayerData) => {
    mainGame.addPlayer(player);
};

export const handleAddPlayers = (mainGame: TableGameBase) => (playersData) => {
    const players: PlayerData[] = _.values(playersData);
    const realPlayers = _.filter(players, (player) => !player.type);
    const botPlayers = _.filter(players, (player) => player.type);

    _.forEach(realPlayers, (player) => {
        mainGame.addPlayer(player);
    });

    _.forEach(botPlayers, (player) => {
        mainGame.addPlayer(player);
    });
};

export const removePlayer = (mainGame: TableGameBase) => (playerId) => {
    if (playerId) {
        const slot = mainGame.getPlayerSlot(playerId);

        if (slot) {
            slot.setInfo(null);
            const keys = Object.keys(mainGame.otherPlayersCache);

            // Move player from others to slot
            if (keys.length > 0) {
                const newPlayer = mainGame.otherPlayersCache[keys[0]];
                mainGame.addPlayer(newPlayer);
                delete mainGame.otherPlayersCache[newPlayer.id];
            }
        } else {
            delete mainGame.otherPlayersCache[playerId];
        }
    }
};

export const updateTablePlayer = (mainGame: TableGameBase) => () => {
    const otherPlayers: any[] = _.values(mainGame.otherPlayersCache);

    _.forEach(mainGame.players, (player) => {
        if (!player.data) {
            return;
        }

        player.data.idleCount++;
        RoomPlayer.storePlayerToCache(player.data, mainGame.getPlayerStorageKey());

        if (player.isIdle) {
            const oldPlayerData = player.data;

            const newPlayer = _.find(otherPlayers, (player) => player.idleCount <= RoomPlayer.MAX_IDLE_COUNT);

            if (newPlayer) {
                player.setInfo(newPlayer);
                delete mainGame.otherPlayersCache[newPlayer.id];
                mainGame.otherPlayersCache[oldPlayerData.id] = oldPlayerData;
                _.remove(otherPlayers, newPlayer);
            }
        }
    });

    const botsInTable = _.filter(mainGame.players, (player) => player.data && player.data.type);
    const realPlayers: PlayerData[] = _.filter(otherPlayers, (player) => player && !player.type);

    _.forEach(botsInTable, (bot) => {
        const botData = bot.data;
        const realPlayer = _.find(realPlayers, (player) => player.idleCount <= RoomPlayer.MAX_IDLE_COUNT);

        if (realPlayer) {
            mainGame.otherPlayersCache[botData.id] = botData;
            bot.setInfo(realPlayer);
            delete mainGame.otherPlayersCache[realPlayer.id];
            _.remove(realPlayers, realPlayer);
        }
    });
};

export const handlePlaceOwnChip = (mainGame: TableGameBase) => (data) => {
    const { betChoice, amount } = data;
    const betItem = _.find(mainGame.betItems, (item) => item.node.name.toLowerCase() === betChoice.toLowerCase());

    betItem && mainGame.betChips.throwChipToChipBox(amount, betItem.chipNode, null, null);
};

export const handlePlaceOwnChips = (mainGame: TableGameBase) => (dataChips) => {
    if (mainGame.showOtherPlayerChips || !dataChips || mainGame.isShowingResultLastRound()) {
        return;
    }

    const chips = dataChips;
    const betChoices = getLowercaseObjectKeys(chips);

    _.forEach(mainGame.betItems, (item) => {
        const betItemData = chips[betChoices[item.node.name.toLowerCase()]];
        mainGame.betChips.addChips(betItemData, item.chipNode);
    });
};

export const handlePlaceTotalChips = (mainGame: TableGameBase) => (dataChips) => {
    if (!dataChips) {
        return;
    }
    if (mainGame.isShowingResultLastRound()) {
        return;
    }
    Object.keys(dataChips).forEach((rate) => {
        const chips = dataChips[rate];
        const chipsKeys = getLowercaseObjectKeys(chips);

        _.forEach(mainGame.betItems, (item) => {
            const betItemData = chips[chipsKeys[item.node.name.toLowerCase()]];
            mainGame.betChips.addChipsToChipBox(+rate, betItemData, item.chipNode);
        });
    });
};

export const handlePlayerChipAction = (mainGame: TableGameBase) => (playerChip) => {
    mainGame.playerChips.push(playerChip);

    if (!mainGame.node.activeInHierarchy || !appManager.GAME_IS_SHOWED) {
        mainGame.placePlayerChip(playerChip);
    } else {
        let delayTime = 0;

        if (mainGame.currentTimeRemaining >= mainGame.config.stopBetTime + 2) {
            delayTime = mainGame.playerChips.length * 0.07;
        } else {
            delayTime = mainGame.playerChips.length * 0.01;
        }
        mainGame
            .tween(mainGame.node)
            .delay(delayTime > 1 ? delayTime / 2 : delayTime)
            .call(() => mainGame.placePlayerChip(playerChip))
            .start();
    }
};

export const updateOtherPlayersBalance = (mainGame: TableGameBase) => (settlement) => {
    const players = mainGame.gameData?.playerModel?.players;
    if (!players) {
        return;
    }
    const { winningPlayers } = settlement;
    Object.keys(winningPlayers).forEach((playerId) => {
        const otherPlayerData = players[playerId];
        if (otherPlayerData) {
            const winningPlayerData = winningPlayers[playerId];
            otherPlayerData.red += winningPlayerData.bet;
            RoomPlayer.storePlayerToCache(otherPlayerData, mainGame.getPlayerStorageKey());
        }
    });
};
