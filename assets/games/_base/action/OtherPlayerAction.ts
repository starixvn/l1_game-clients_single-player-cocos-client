import RoomPlayer from "../view-models/RoomPlayer";

export const updateOtherPlayerBalance = (winningPlayers: any, main: any) => {
    if (!winningPlayers) {
        return;
    }
    Object.keys(winningPlayers).forEach((playerId) => {
        const otherPlayerData = main.playerHandler.otherPlayers[playerId];
        if (otherPlayerData) {
            const winningPlayerData = winningPlayers[playerId];
            otherPlayerData.red += winningPlayerData.bet;
            RoomPlayer.storePlayerToCache(otherPlayerData, main.gameName);
        }
    });
};
