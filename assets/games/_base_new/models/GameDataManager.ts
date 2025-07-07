import { GameData } from "../../_new/_base/game-data-management/models/game-data";

export default class GameDataManager {
    public static getInstance(): GameDataManager {
        if (!this.instance) {
            this.instance = new GameDataManager();
        }

        return this.instance;
    }

    private static instance: GameDataManager;

    private gameData = {};
    private gameLoop = {};

    getGameData(gameId: number) {
        return this.gameData[gameId];
    }

    setGameData(gameId: number, gameData: GameData) {
        this.gameData[gameId] = gameData;
    }

    clearGameData(gameId: number) {
        delete this.gameData[gameId];
    }

    startGameLoop(gameId: number, action: () => void) {
        this.clearGameLoop(gameId);
        this.gameLoop[gameId] = setInterval(action, 1000);
    }

    clearGameLoop(gameId: number) {
        const gameLoop = this.gameLoop[gameId];
        gameLoop && clearInterval(gameLoop);
    }
}
