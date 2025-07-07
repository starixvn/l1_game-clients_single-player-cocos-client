export interface GameRoundTimerData {
    id: number;
    result: any;
    settlementResult: any;
    time: string;
    timeFromStart?: number;
}

export interface RoundTimerData {
    [gameId: number]: GameRoundTimerData;
}
