import { lodash } from "../ClientModules";
import NotificationService from "../common/auth/NotificationService";
import { userManager } from "../common/user/UserManager";
import { uiManager } from "./GameUIManager";
import { InternalEvents } from "./InternalEvents";
import { JackpotDataKey, JackpotEvents } from "./JackpotEvents";

console.log("[JackpotManager] Loading JackpotManager module...");

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

    constructor() {
        console.log("[JackpotManager] JackpotManager constructor called");
        this.initEvents();
        console.log("[JackpotManager] JackpotManager initialized");
    }

    public static getInstance(): JackpotManager {
        console.log("[JackpotManager] Getting JackpotManager instance");
        if (!this.instance) {
            console.log("[JackpotManager] Creating new JackpotManager instance");
            this.instance = new JackpotManager();
        } else {
            console.log("[JackpotManager] Returning existing JackpotManager instance");
        }

        return this.instance;
    }

    emitEvent(eventName: string, data: any) {
        console.log("[JackpotManager] Emitting event:", eventName, "data:", data);
        NotificationService.getInstance().emitEvent(eventName, data);
        console.log("[JackpotManager] Event emitted successfully");
    }

    initEvents() {
        console.log("[JackpotManager] Initializing events...");
        this.clearObservers();

        this.jackpotDataKey.forEach((key) => {
            console.log("[JackpotManager] Adding data observer for key:", key);
            this.addDataObserver(key, key);
        });
        console.log("[JackpotManager] Events initialized successfully");
    }

    clearObservers() {
        console.log("[JackpotManager] Clearing observers...");
        this.jackpotDataKey.forEach((key) => {
            console.log("[JackpotManager] Removing data observer for key:", key);
            this.removeDataObserver(key, key);
        });
        console.log("[JackpotManager] Observers cleared successfully");
    }

    addDataObserver(dataType: string, dataKey: string) {
        console.log("[JackpotManager] Adding data observer for type:", dataType, "key:", dataKey);
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
        console.log("[JackpotManager] Data observer added successfully");
    }

    onReceivedJackpotPoolsData(data: IJackpotPool[]) {
        console.log("[JackpotManager] Received jackpot pools data:", data);
        let pools: IPoolGroupGameId = lodash.groupBy(data, "gameId");
        console.log("[JackpotManager] Grouped pools by gameId:", pools);

        const jackpotGames = Object.keys(pools);
        console.log("[JackpotManager] Jackpot games:", jackpotGames);

        this.requestedJackpotPoolGames.forEach((requestedGameId) => {
            if (!jackpotGames.includes(requestedGameId)) {
                console.log("[JackpotManager] Hiding jackpot pools for game:", requestedGameId);
                uiManager.emitter.emit(InternalEvents.HIDE_JACKPOT_POOLS_ON_GAME, requestedGameId);
                jackpotManager.removeRequestedDataGame(requestedGameId);
            }
        });

        pools = this.filterOfferGames(pools);
        console.log("[JackpotManager] Filtered pools:", pools);

        pools = this.sortPoolStakeASC(pools);
        console.log("[JackpotManager] Sorted pools:", pools);

        const poolsGroup = this.groupJackpotPoolsWithType(pools);
        console.log("[JackpotManager] Grouped pools by type:", poolsGroup);

        uiManager.emitter.emit(InternalEvents.RECEIVED_JACKPOT_POOLS, poolsGroup);
        uiManager.emitter.emit(InternalEvents.RECEIVED_RAW_JACKPOT_POOLS, data);
        console.log("[JackpotManager] Jackpot pools events emitted");
    }

    filterOfferGames(pools: IPoolGroupGameId): IPoolGroupGameId {
        console.log("[JackpotManager] Filtering offer games...");
        const initialCount = Object.keys(pools).length;
        Object.keys(pools).forEach((gameId) => {
            if (!userManager.offerGames.includes(+gameId)) {
                console.log("[JackpotManager] Removing game from pools:", gameId);
                delete pools[gameId];
            }
        });
        const finalCount = Object.keys(pools).length;
        console.log("[JackpotManager] Filtered pools count:", initialCount, "->", finalCount);
        return pools;
    }

    sortPoolStakeASC(pools: IPoolGroupGameId) {
        console.log("[JackpotManager] Sorting pool stakes...");
        Object.values(pools).forEach((pool) => {
            pool.sort((a, b) => JackpotPoolType[a.pool.toUpperCase()] - JackpotPoolType[b.pool.toUpperCase()]);
        });
        console.log("[JackpotManager] Pools sorted successfully");
        return pools;
    }

    groupJackpotPoolsWithType(pools: IPoolGroupGameId) {
        console.log("[JackpotManager] Grouping jackpot pools by type...");
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

        console.log("[JackpotManager] Pools grouped by type successfully");
        return poolsGroup;
    }

    onReceivedJackpotPoolsOnGameData(data: any) {
        console.log("[JackpotManager] Received jackpot pools on game data:", data);
        if (!data.length) {
            console.log("[JackpotManager] No data received, requesting all jackpot pools");
            this.requestAllJackpotPools();
        }

        const sortedPoolStakes = this.sortPoolStakeASC(lodash.groupBy(data, "gameId"));
        const receivedGameId = Object.keys(sortedPoolStakes)[0];
        console.log("[JackpotManager] Received game ID:", receivedGameId);

        jackpotManager.addRequestedDataGame(receivedGameId);
        uiManager.emitter.emit(InternalEvents.RECEIVED_JACKPOT_POOLS_ON_GAME, sortedPoolStakes);
        console.log("[JackpotManager] Jackpot pools on game event emitted");
    }

    onReceivedJackpotWinnerData(data: any) {
        console.log("[JackpotManager] Received jackpot winner data:", data);
        uiManager.emitter.emit(InternalEvents.RECEIVED_JACKPOT_WINNER, data);
        console.log("[JackpotManager] Jackpot winner event emitted");
    }

    onReceivedJackpotWinnersData(data: any) {
        console.log("[JackpotManager] Received jackpot winners data:", data);
        const filteredData = data.filter((value) => userManager.offerGames.includes(+value.gameId));
        console.log("[JackpotManager] Filtered winners data:", filteredData);
        uiManager.emitter.emit(InternalEvents.RECEIVED_JACKPOT_WINNERS, filteredData);
        console.log("[JackpotManager] Jackpot winners event emitted");
    }

    removeDataObserver(dataType: string, dataKey: string) {
        console.log("[JackpotManager] Removing data observer for type:", dataType, "key:", dataKey);
        NotificationService.getInstance().removeDataObserver(dataType, dataKey);
        console.log("[JackpotManager] Data observer removed successfully");
    }

    addRequestedDataGame(gameId: string) {
        console.log("[JackpotManager] Adding requested data game:", gameId);
        if (this.requestedJackpotPoolGames.includes(gameId)) {
            console.log("[JackpotManager] Game already in requested list:", gameId);
            return;
        }
        this.requestedJackpotPoolGames.push(gameId);
        console.log("[JackpotManager] Game added to requested list, total count:", this.requestedJackpotPoolGames.length);
    }

    removeRequestedDataGame(gameId: string) {
        console.log("[JackpotManager] Removing requested data game:", gameId);
        const initialCount = this.requestedJackpotPoolGames.length;
        this.requestedJackpotPoolGames = this.requestedJackpotPoolGames.filter((value) => value !== gameId);
        const finalCount = this.requestedJackpotPoolGames.length;
        console.log("[JackpotManager] Game removed from requested list, count:", initialCount, "->", finalCount);
    }

    requestAllJackpotPools() {
        console.log("[JackpotManager] Requesting all jackpot pools...");
        cc.log("JackpotManager - requestAllJackpotPools -------------------------");
        jackpotManager.emitEvent(JackpotEvents.GET_POOLS, {});
        console.log("[JackpotManager] All jackpot pools request sent");
    }

    requestJackpotOnGame(gameId: number) {
        console.log("[JackpotManager] Requesting jackpot on game:", gameId);
        jackpotManager.emitEvent(JackpotEvents.GET_POOLS, { gameId });
        console.log("[JackpotManager] Jackpot on game request sent");
    }
}

console.log("[JackpotManager] Creating JackpotManager instance...");
export const jackpotManager = JackpotManager.getInstance();
console.log("[JackpotManager] JackpotManager module loaded successfully");
