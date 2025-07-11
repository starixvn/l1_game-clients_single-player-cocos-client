import { getLocale, getSession } from "../../../common/auth/SessionManager";
import UserService from "../../../common/auth/UserService";
import { uiManager } from "../../../managers/GameUIManager";
import { InternalEvents } from "../../../managers/InternalEvents";
import { delayTime } from "../../../utils";

console.log("[LobbyManager] Loading LobbyManager module...");

export interface GameSetting {
    gameId: number;
    bigSize: boolean;
    newTag: boolean;
}

export interface GameCategory {
    name: any;
    gameSettings: GameSetting[];
}

export interface CategorySetting {
    name: any;
    index: number;
    gameIds: number[];
}

export interface Banner {
    gameId: number;
    displayTime: number;
}

interface IGame {
    id: number;
    name: string;
}

interface IRoundTimerGame {
    games: IGame[];
    main: number;
}

export interface LobbyConfigs {
    name: string;
    currencyGroupIds: string[];
    miniPanelGameIds: number[];
    categories: GameCategory[];
    banners: Banner[];
    roundTimerGame: IRoundTimerGame;
}

export interface CategoryConfig {
    name: string;
    gameIds: number[];
    index: number;
}

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_SECONDS = 3;

export async function getLobbyConfigs(): Promise<void> {
    console.log("[LobbyManager] Getting lobby configs...");
    const session = getSession();
    console.log("[LobbyManager] Session retrieved:", !!session);

    const lobby = await retryGetLobbyConfigs(session);
    console.log("[LobbyManager] Lobby configs retrieved:", !!lobby);

    if (lobby?.lobbyConfigs) {
        console.log("[LobbyManager] Storing lobby configs...");
        LobbyManager.getInstance().storeLobby(lobby.lobbyConfigs);
        console.log("[LobbyManager] Lobby configs stored successfully");
    } else {
        console.error("[LobbyManager] Failed to get lobby configs, emitting SSO error");
        uiManager.emitter.emit(InternalEvents.SSO_ERROR);
        throw new Error("Can not get lobby configs");
    }
}

async function retryGetLobbyConfigs(session: { ss: string; username: string }) {
    console.log("[LobbyManager] Retrying to get lobby configs...");
    let retryCount = 0;

    while (retryCount < MAX_RETRY_ATTEMPTS) {
        console.log(`[LobbyManager] Try get lobby configs: ${retryCount + 1}`);
        cc.log(`Try get lobby configs: ${retryCount + 1}`);
        if (retryCount > 0) {
            console.log(`[LobbyManager] Waiting ${RETRY_DELAY_SECONDS} seconds before retry...`);
            await delayTime(RETRY_DELAY_SECONDS);
        }

        try {
            console.log("[LobbyManager] Calling UserService to get lobby configs...");
            const lobby = await UserService.getInstance().lobby.getLobbyConfigs(session.ss, session.username);
            if (lobby) {
                console.log("[LobbyManager] Lobby configs retrieved successfully");
                return lobby;
            } else {
                console.warn("[LobbyManager] Lobby configs returned null/undefined");
            }
        } catch (error) {
            console.error(`[LobbyManager] Can not get lobby configs: ${error.message}`);
            cc.warn(`Can not get lobby configs: ${error.message}`);
        }

        retryCount++;
    }

    console.error("[LobbyManager] All retry attempts failed");
    return null;
}

export default class LobbyManager {
    private static instance: LobbyManager;
    private static lobbyConfigs: LobbyConfigs;
    private static categoryList: CategoryConfig[] = [];

    private readonly HOME_ICON_ID = 0;

    constructor() {
        console.log("[LobbyManager] LobbyManager constructor called");
    }

    public static getInstance(): LobbyManager {
        console.log("[LobbyManager] Getting LobbyManager instance");
        if (!this.instance) {
            console.log("[LobbyManager] Creating new LobbyManager instance");
            this.instance = new LobbyManager();
        } else {
            console.log("[LobbyManager] Returning existing LobbyManager instance");
        }

        return this.instance;
    }

    getCategoryList() {
        console.log("[LobbyManager] Getting category list, count:", LobbyManager.categoryList?.length || 0);
        return LobbyManager.categoryList;
    }

    getMiniPanelList() {
        console.log("[LobbyManager] Getting mini panel list...");
        const isHomeIconId = LobbyManager.lobbyConfigs.miniPanelGameIds?.includes(this.HOME_ICON_ID);
        console.log("[LobbyManager] Home icon ID included:", isHomeIconId);

        if (!isHomeIconId) {
            console.log("[LobbyManager] Adding home icon ID to mini panel list");
            LobbyManager.lobbyConfigs.miniPanelGameIds?.unshift(this.HOME_ICON_ID);
        }

        const miniPanelList = LobbyManager.lobbyConfigs.miniPanelGameIds;
        console.log("[LobbyManager] Mini panel list retrieved, count:", miniPanelList?.length || 0);
        return miniPanelList;
    }

    getRoundTimerGame() {
        console.log("[LobbyManager] Getting round timer game");
        const roundTimerGame = LobbyManager.lobbyConfigs.roundTimerGame;
        console.log("[LobbyManager] Round timer game:", roundTimerGame);
        return roundTimerGame;
    }

    getAllCategories() {
        console.log("[LobbyManager] Getting all categories");
        const categories = LobbyManager.lobbyConfigs?.categories;
        console.log("[LobbyManager] Categories count:", categories?.length || 0);
        return categories;
    }

    storeLobby(model: LobbyConfigs) {
        console.log("[LobbyManager] Storing lobby configs...");
        console.log("[LobbyManager] Lobby name:", model.name);
        console.log("[LobbyManager] Categories count:", model.categories?.length || 0);
        console.log("[LobbyManager] Banners count:", model.banners?.length || 0);
        console.log("[LobbyManager] Mini panel game IDs count:", model.miniPanelGameIds?.length || 0);

        LobbyManager.lobbyConfigs = model;
        LobbyManager.categoryList = this.createCategoryList(model);

        console.log("[LobbyManager] Lobby configs stored successfully");
        console.log("[LobbyManager] Category list created, count:", LobbyManager.categoryList?.length || 0);
    }

    getGame(gameId: number, category = 0): GameSetting {
        console.log("[LobbyManager] Getting game for gameId:", gameId, "category:", category);
        const game = LobbyManager.lobbyConfigs?.categories[category]?.gameSettings.find((game) => game.gameId === gameId);
        console.log("[LobbyManager] Game found:", !!game);
        return game;
    }

    getBanners(): Banner[] {
        console.log("[LobbyManager] Getting banners");
        const banners = LobbyManager.lobbyConfigs?.banners;
        console.log("[LobbyManager] Banners count:", banners?.length || 0);
        return banners;
    }

    getBannerByGameId(gameId: number): Banner {
        console.log("[LobbyManager] Getting banner by gameId:", gameId);
        const banner = LobbyManager.lobbyConfigs?.banners?.find((banner) => banner.gameId === gameId);
        console.log("[LobbyManager] Banner found:", !!banner);
        return banner;
    }

    getGameIdsByCategoryIndex(categoryIndex = 0): number[] {
        console.log("[LobbyManager] Getting game IDs by category index:", categoryIndex);
        const category = LobbyManager.categoryList?.find((category) => category.index === categoryIndex);
        const gameIds = category?.gameIds;
        console.log("[LobbyManager] Game IDs found:", gameIds?.length || 0);
        return gameIds;
    }

    getAllGameIds() {
        console.log("[LobbyManager] Getting all game IDs...");
        const gameIds = [];
        LobbyManager.categoryList?.forEach((category) => {
            gameIds.push(...category.gameIds);
        });
        const uniqueGameIds = gameIds.filter(this.onlyUniqueGameId);
        console.log("[LobbyManager] Total game IDs:", gameIds.length, "Unique game IDs:", uniqueGameIds.length);
        return uniqueGameIds;
    }

    onlyUniqueGameId(value, index, self) {
        return self.indexOf(value) === index;
    }

    createCategoryList(lobbyConfigs: LobbyConfigs) {
        console.log("[LobbyManager] Creating category list...");
        const categoryConfigs = [];
        lobbyConfigs?.categories?.forEach((category: { name: string; gameSettings: GameSetting[] }, index: number) => {
            console.log("[LobbyManager] Processing category:", index, "name:", category.name);
            const item: CategoryConfig = { index: 0, name: "", gameIds: [] };
            item.index = index;
            item.name = category.name[getLocale()] ?? category.name["en-US"];
            item.gameIds = category.gameSettings.map((game: any) => game?.gameId);
            categoryConfigs.push(item);
            console.log("[LobbyManager] Category processed - index:", item.index, "name:", item.name, "gameIds count:", item.gameIds.length);
        });

        console.log("[LobbyManager] Category list created, total categories:", categoryConfigs.length);
        return categoryConfigs;
    }

    getCategoryIndexByName(categoryName: string): number {
        console.log("[LobbyManager] Getting category index by name:", categoryName);
        let categoryIndex = 0;
        LobbyManager.lobbyConfigs?.categories.forEach(({ name }, index) => {
            const customName = name["en-US"].replace(/\s/g, "").toLowerCase();
            if (customName === categoryName) {
                categoryIndex = index;
                console.log("[LobbyManager] Category found at index:", index);
            }
        });
        console.log("[LobbyManager] Category index returned:", categoryIndex);
        return categoryIndex;
    }
}

console.log("[LobbyManager] LobbyManager module loaded successfully");
