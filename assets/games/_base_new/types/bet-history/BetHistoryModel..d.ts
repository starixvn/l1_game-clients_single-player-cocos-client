export type DynamicObject<T> = {
    [key: string]: T;
};
export type BetHistoryLog<RType, SType> = {
    time: string;
    roundId: number;
    win: number;
    betwin: number;
    totalAmount: number;
    freeBet: boolean;
    odds?: DynamicObject<number>;
    result: RType;
    settlementResult: SType;
    betLogDetails?: Array<DynamicObject<object>>;
};
export type BetHistoryModel<T> = {
    page: number;
    pageSize: number;
    total: number;
    betLogs: Array<T>;
};
