import DataHandler from "./DataHandler";

export interface IGameBaseMd5Handler extends DataHandler {
    resultHash: any;
}

export interface IGameBaseStatusHandler extends DataHandler {
    currentStatusData: any;
    clearStatusData();
}

export interface IGameBaseTimeHandler extends DataHandler {
    playTimeInterval: number;
    playTime(): void;
    stopPlayTime(): void;
    resetTime(): void;
    isInWaitTime: boolean;
    isInLockBetTime: boolean;
    isStartingNewGameRound: boolean;
}

export interface IGameBasePlayerHandler extends DataHandler {
    otherPlayers: any;
    getPlayerSlot(playerId: string): any;
}
