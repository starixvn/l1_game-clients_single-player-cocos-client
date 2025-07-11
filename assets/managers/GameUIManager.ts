import _ = require("lodash");

import EventEmitterBase from "../common/emitter/EventEmitterBase";
import Loading from "../common/loading/view-models/Loading";

console.log("[GameUIManager] Loading GameUIManager module...");

export interface EmitterStorageType {
    eventName: string;
    callback: (param?) => void;
    target: any;
}

export interface SkeletonCache {
    [key: number]: {
        skeletonData: sp.SkeletonData;
        configFile?: cc.JsonAsset;
    };
}

export interface SpriteFrameCache {
    [key: number]: {
        spriteFrame: cc.SpriteFrame;
    };
}

export default class GameUIManager {
    private static instance: GameUIManager;
    private iconGameLoading = {};
    private currentGameId;
    public emitterStorages: EmitterStorageType[] = [];
    public emitter: EventEmitterBase;
    public isPauseLoadingIcons = false;

    public static getInstance(): GameUIManager {
        console.log("[GameUIManager] Getting GameUIManager instance");
        if (!this.instance) {
            console.log("[GameUIManager] Creating new GameUIManager instance");
            this.instance = new GameUIManager();
            this.instance.initEmitter();
        } else {
            console.log("[GameUIManager] Returning existing GameUIManager instance");
        }

        return this.instance;
    }

    constructor() {
        console.log("[GameUIManager] GameUIManager constructor called");
    }

    public prefabCache = {
        lobbyIcons: {},
        lobbyBanners: {},
        miniPanelIcons: {},
        slotSymbols: {},
        slotWinningAnimation: {},
        gameAtlas: {},
        multiplierPrefab: {}
    };

    public spriteFrameCache = {
        lobbyIcons: {},
        lobbyBanners: {},
        miniPanelIcons: {}
    };

    public remoteIconCache: SkeletonCache = {};

    public remoteBannerCache: SkeletonCache = {};

    initEmitter() {
        console.log("[GameUIManager] Initializing event emitter...");
        this.emitter = new EventEmitterBase();
        console.log("[GameUIManager] Event emitter initialized");
    }

    getLoadingWithGameID(gameId: number): Loading {
        console.log("[GameUIManager] Getting loading for gameId:", gameId);
        const loading = this.iconGameLoading[gameId];
        console.log("[GameUIManager] Loading found:", !!loading);
        return loading;
    }

    cacheIconLoading(gameId: number, loadingComp: Loading) {
        console.log("[GameUIManager] Caching icon loading for gameId:", gameId);
        this.iconGameLoading[gameId] = loadingComp;
        console.log("[GameUIManager] Icon loading cached successfully");
    }

    unCacheIconLoading(gameId: number) {
        console.log("[GameUIManager] Uncaching icon loading for gameId:", gameId);
        delete this.iconGameLoading[gameId];
        console.log("[GameUIManager] Icon loading uncached successfully");
    }

    setCurrentGameId(gameId: number) {
        console.log("[GameUIManager] Setting current game ID from:", this.currentGameId, "to:", gameId);
        this.currentGameId = gameId;
    }

    getCurrentGameId(): number {
        console.log("[GameUIManager] Getting current game ID:", this.currentGameId);
        return this.currentGameId;
    }

    resetCurrentGameId() {
        console.log("[GameUIManager] Resetting current game ID from:", this.currentGameId, "to 0");
        this.currentGameId = 0;
    }

    emitterListener(eventName: string, callback: (param?) => void, target: any) {
        console.log("[GameUIManager] Adding emitter listener for event:", eventName, "target:", target);
        const storage = {
            eventName,
            callback,
            target
        };
        this.emitter.on(eventName, storage.callback);
        this.emitterStorages.push(storage);
        console.log("[GameUIManager] Emitter listener added successfully");

        return storage;
    }

    removeListenersWithTarget(target: any) {
        console.log("[GameUIManager] Removing listeners with target:", target);
        const filterFunc = (storage) => storage.target === target;
        const storages = _.remove(this.emitterStorages, filterFunc);
        console.log("[GameUIManager] Found", storages.length, "listeners to remove");

        storages.forEach((storage) => {
            const { eventName, callback } = storage;
            console.log("[GameUIManager] Removing listener for event:", eventName);
            this.emitter.removeListener(eventName, callback);
        });
        console.log("[GameUIManager] Listeners removed successfully");
    }

    removeListeners(eventName: string, target: any) {
        console.log("[GameUIManager] Removing listeners for event:", eventName, "target:", target);
        const filterFunc = (storage) => storage.eventName === eventName && storage.target === target;
        const callbacks = _.remove(this.emitterStorages, filterFunc).map((storage) => storage.callback);
        console.log("[GameUIManager] Found", callbacks.length, "callbacks to remove");

        callbacks.forEach((callback) => {
            console.log("[GameUIManager] Removing callback for event:", eventName);
            this.emitter.removeListener(eventName, callback);
        });
        console.log("[GameUIManager] Listeners removed successfully");
    }

    removeListenersWithName(eventName: string) {
        console.log("[GameUIManager] Removing all listeners for event:", eventName);
        const callbacks = _.remove(this.emitterStorages, (storage) => storage.eventName === eventName).map((storage) => storage.callback);
        console.log("[GameUIManager] Found", callbacks.length, "callbacks to remove");

        callbacks.forEach((callback) => {
            console.log("[GameUIManager] Removing callback for event:", eventName);
            this.emitter.removeListener(eventName, callback);
        });
        console.log("[GameUIManager] All listeners for event removed successfully");
    }
}

console.log("[GameUIManager] Creating uiManager instance...");
export const uiManager = GameUIManager.getInstance();
console.log("[GameUIManager] GameUIManager module loaded successfully");
