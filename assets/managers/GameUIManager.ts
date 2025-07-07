import _ = require("lodash");

import EventEmitterBase from "../common/emitter/EventEmitterBase";
import Loading from "../common/loading/view-models/Loading";

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
        if (!this.instance) {
            this.instance = new GameUIManager();
            this.instance.initEmitter();
        }

        return this.instance;
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
        this.emitter = new EventEmitterBase();
    }

    getLoadingWithGameID(gameId: number): Loading {
        return this.iconGameLoading[gameId];
    }

    cacheIconLoading(gameId: number, loadingComp: Loading) {
        this.iconGameLoading[gameId] = loadingComp;
    }

    unCacheIconLoading(gameId: number) {
        delete this.iconGameLoading[gameId];
    }

    setCurrentGameId(gameId: number) {
        this.currentGameId = gameId;
    }

    getCurrentGameId(): number {
        return this.currentGameId;
    }

    resetCurrentGameId() {
        this.currentGameId = 0;
    }

    emitterListener(eventName: string, callback: (param?) => void, target: any) {
        const storage = {
            eventName,
            callback,
            target
        };
        this.emitter.on(eventName, storage.callback);
        this.emitterStorages.push(storage);

        return storage;
    }

    removeListenersWithTarget(target: any) {
        const filterFunc = (storage) => storage.target === target;
        const storages = _.remove(this.emitterStorages, filterFunc);
        storages.forEach((storage) => {
            const { eventName, callback } = storage;
            this.emitter.removeListener(eventName, callback);
        });
    }

    removeListeners(eventName: string, target: any) {
        const filterFunc = (storage) => storage.eventName === eventName && storage.target === target;
        const callbacks = _.remove(this.emitterStorages, filterFunc).map((storage) => storage.callback);
        callbacks.forEach((callback) => {
            this.emitter.removeListener(eventName, callback);
        });
    }

    removeListenersWithName(eventName: string) {
        const callbacks = _.remove(this.emitterStorages, (storage) => storage.eventName === eventName).map((storage) => storage.callback);
        callbacks.forEach((callback) => {
            this.emitter.removeListener(eventName, callback);
        });
    }
}

export const uiManager = GameUIManager.getInstance();
