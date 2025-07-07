import { lodash } from "../ClientModules";
import NotificationService from "../common/auth/NotificationService";
import { userManager } from "../common/user/UserManager";
import { uiManager } from "./GameUIManager";
import { InternalEvents } from "./InternalEvents";
import { JackpotDataKey, JackpotEvents } from "./JackpotEvents";

export enum JackpotPoolType {
    MINOR = 0,
    MAJOR,
    GRAND
}

interface IJackpotPool {
    amount: number;
    gameId: number;
    pool: string;
}

interface IPoolGroupGameId {
    [key: string]: IJackpotPool[];
}

export default class JackpotManager {
    private static instance: JackpotManager;
    public events = {};
    private readonly jackpotDataKey = [
        JackpotDataKey.JACKPOT_POOLS,
        JackpotDataKey.JACKPOT_POOLS_ON_GAME,
        JackpotDataKey.JACKPOT_WINNER,
        JackpotDataKey.JACKPOT_WINNERS
    ];
    private requestedJackpotPoolGames: string[] = [];

    public static getInstance(): JackpotManager {
        if (!this.instance) {
            this.instance = new JackpotManager();
        }

        return this.instance;
    }

    emitEvent(eventName: string, data: any) {
        NotificationService.getInstance().emitEvent(eventName, data);
    }

    initEvents() {
        this.clearObservers();

        this.jackpotDataKey.forEach((key) => {
            this.addDataObserver(key, key);
        });
    }

    clearObservers() {
        this.jackpotDataKey.forEach((key) => {
            this.removeDataObserver(key, key);
        });
    }

    addDataObserver(dataType: string, dataKey: string) {
        let callback;
        switch (dataType) {
            case JackpotDataKey.JACKPOT_POOLS:
                callback = (data) => this.onReceivedJackpotPoolsData(data);
                break;
            case JackpotDataKey.JACKPOT_POOLS_ON_GAME:
                callback = (data) => this.onReceivedJackpotPoolsOnGameData(data);
                break;
            case JackpotDataKey.JACKPOT_WINNER:
                callback = (data) => this.onReceivedJackpotWinnerData(data);
                break;
            case JackpotDataKey.JACKPOT_WINNERS:
                callback = (data) => this.onReceivedJackpotWinnersData(data);
                break;
        }
        NotificationService.getInstance().addDataObserver(dataType, dataKey, callback);
    }

    onReceivedJackpotPoolsData(data: IJackpotPool[]) {
        let pools: IPoolGroupGameId = lodash.groupBy(data, "gameId");
        const jackpotGames = Object.keys(pools);
        this.requestedJackpotPoolGames.forEach((requestedGameId) => {
            if (!jackpotGames.includes(requestedGameId)) {
                uiManager.emitter.emit(InternalEvents.HIDE_JACKPOT_POOLS_ON_GAME, requestedGameId);
                jackpotManager.removeRequestedDataGame(requestedGameId);
            }
        });

        pools = this.filterOfferGames(pools);
        pools = this.sortPoolStakeASC(pools);
        const poolsGroup = this.groupJackpotPoolsWithType(pools);
        uiManager.emitter.emit(InternalEvents.RECEIVED_JACKPOT_POOLS, poolsGroup);
        uiManager.emitter.emit(InternalEvents.RECEIVED_RAW_JACKPOT_POOLS, data);
    }

    filterOfferGames(pools: IPoolGroupGameId): IPoolGroupGameId {
        Object.keys(pools).forEach((gameId) => {
            if (!userManager.offerGames.includes(+gameId)) {
                delete pools[gameId];
            }
        });

        return pools;
    }

    sortPoolStakeASC(pools: IPoolGroupGameId) {
        Object.values(pools).forEach((pool) => {
            pool.sort((a, b) => JackpotPoolType[a.pool.toUpperCase()] - JackpotPoolType[b.pool.toUpperCase()]);
        });

        return pools;
    }

    groupJackpotPoolsWithType(pools: IPoolGroupGameId) {
        const poolsGroup = {
            [JackpotPoolType.MINOR]: [],
            [JackpotPoolType.MAJOR]: [],
            [JackpotPoolType.GRAND]: []
        };

        Object.values(pools).forEach((gamePool: any) => {
            gamePool.forEach((poolItem, index) => {
                poolsGroup[index].push(poolItem);
            });
        });

        Object.values(poolsGroup).forEach((pool) => {
            pool.sort((a, b) => b.amount - a.amount);
        });

        return poolsGroup;
    }

    onReceivedJackpotPoolsOnGameData(data: any) {
        if (!data.length) {
            this.requestAllJackpotPools();
        }

        const sortedPoolStakes = this.sortPoolStakeASC(lodash.groupBy(data, "gameId"));
        const receivedGameId = Object.keys(sortedPoolStakes)[0];
        jackpotManager.addRequestedDataGame(receivedGameId);
        uiManager.emitter.emit(InternalEvents.RECEIVED_JACKPOT_POOLS_ON_GAME, sortedPoolStakes);
    }

    onReceivedJackpotWinnerData(data: any) {
        uiManager.emitter.emit(InternalEvents.RECEIVED_JACKPOT_WINNER, data);
    }

    onReceivedJackpotWinnersData(data: any) {
        const filteredData = data.filter((value) => userManager.offerGames.includes(+value.gameId));
        uiManager.emitter.emit(InternalEvents.RECEIVED_JACKPOT_WINNERS, filteredData);
    }

    removeDataObserver(dataType: string, dataKey: string) {
        NotificationService.getInstance().removeDataObserver(dataType, dataKey);
    }

    addRequestedDataGame(gameId: string) {
        if (this.requestedJackpotPoolGames.includes(gameId)) {
            return;
        }
        this.requestedJackpotPoolGames.push(gameId);
    }

    removeRequestedDataGame(gameId: string) {
        this.requestedJackpotPoolGames = this.requestedJackpotPoolGames.filter((value) => value !== gameId);
    }

    requestAllJackpotPools() {
        cc.log("JackpotManager - requestAllJackpotPools -------------------------");
        jackpotManager.emitEvent(JackpotEvents.GET_POOLS, {});
    }

    requestJackpotOnGame(gameId: number) {
        jackpotManager.emitEvent(JackpotEvents.GET_POOLS, { gameId });
    }
}

export const jackpotManager = JackpotManager.getInstance();
