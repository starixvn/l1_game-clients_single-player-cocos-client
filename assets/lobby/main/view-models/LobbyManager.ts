import { getLocale, getSession } from "../../../common/auth/SessionManager";
import UserService from "../../../common/auth/UserService";
import { uiManager } from "../../../managers/GameUIManager";
import { InternalEvents } from "../../../managers/InternalEvents";
import { delayTime } from "../../../utils";

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
    const session = getSession();
    const lobby = await retryGetLobbyConfigs(session);

    if (lobby?.lobbyConfigs) {
        LobbyManager.getInstance().storeLobby(lobby.lobbyConfigs);
    } else {
        uiManager.emitter.emit(InternalEvents.SSO_ERROR);
        throw new Error("Can not get lobby configs");
    }
}

async function retryGetLobbyConfigs(session: { ss: string; username: string }) {
    let retryCount = 0;

    while (retryCount < MAX_RETRY_ATTEMPTS) {
        cc.log(`Try get lobby configs: ${retryCount + 1}`);
        if (retryCount > 0) {
            await delayTime(RETRY_DELAY_SECONDS);
        }

        try {
            const lobby = await UserService.getInstance().lobby.getLobbyConfigs(session.ss, session.username);
            if (lobby) {
                return lobby;
            }
        } catch (error) {
            cc.warn(`Can not get lobby configs: ${error.message}`);
        }

        retryCount++;
    }

    return null;
}

export default class LobbyManager {
    private static instance: LobbyManager;
    private static lobbyConfigs: LobbyConfigs;
    private static categoryList: CategoryConfig[] = [];

    private readonly HOME_ICON_ID = 0;

    public static getInstance(): LobbyManager {
        if (!this.instance) {
            this.instance = new LobbyManager();
        }

        return this.instance;
    }

    getCategoryList() {
        return LobbyManager.categoryList;
    }

    getMiniPanelList() {
        const isHomeIconId = LobbyManager.lobbyConfigs.miniPanelGameIds?.includes(this.HOME_ICON_ID);
        if (!isHomeIconId) {
            LobbyManager.lobbyConfigs.miniPanelGameIds?.unshift(this.HOME_ICON_ID);
        }
        return LobbyManager.lobbyConfigs.miniPanelGameIds;
    }

    getRoundTimerGame() {
        return LobbyManager.lobbyConfigs.roundTimerGame;
    }

    getAllCategories() {
        return LobbyManager.lobbyConfigs?.categories;
    }

    storeLobby(model: LobbyConfigs) {
        LobbyManager.lobbyConfigs = model;
        LobbyManager.categoryList = this.createCategoryList(model);
    }

    getGame(gameId: number, category = 0): GameSetting {
        return LobbyManager.lobbyConfigs?.categories[category]?.gameSettings.find((game) => game.gameId === gameId);
    }

    getBanners(): Banner[] {
        return LobbyManager.lobbyConfigs?.banners;
    }

    getBannerByGameId(gameId: number): Banner {
        return LobbyManager.lobbyConfigs?.banners?.find((banner) => banner.gameId === gameId);
    }

    getGameIdsByCategoryIndex(categoryIndex = 0): number[] {
        const category = LobbyManager.categoryList?.find((category) => category.index === categoryIndex);
        return category?.gameIds;
    }

    getAllGameIds() {
        const gameIds = [];
        LobbyManager.categoryList?.forEach((category) => {
            gameIds.push(...category.gameIds);
        });
        return gameIds.filter(this.onlyUniqueGameId);
    }

    onlyUniqueGameId(value, index, self) {
        return self.indexOf(value) === index;
    }

    createCategoryList(lobbyConfigs: LobbyConfigs) {
        const categoryConfigs = [];
        lobbyConfigs?.categories?.forEach((category: { name: string; gameSettings: GameSetting[] }, index: number) => {
            const item: CategoryConfig = { index: 0, name: "", gameIds: [] };
            item.index = index;
            item.name = category.name[getLocale()] ?? category.name["en-US"];
            item.gameIds = category.gameSettings.map((game: any) => game?.gameId);
            categoryConfigs.push(item);
        });

        return categoryConfigs;
    }

    getCategoryIndexByName(categoryName: string): number {
        let categoryIndex = 0;
        LobbyManager.lobbyConfigs?.categories.forEach(({ name }, index) => {
            const customName = name["en-US"].replace(/\s/g, "").toLowerCase();
            if (customName === categoryName) {
                categoryIndex = index;
            }
        });
        return categoryIndex;
    }
}
