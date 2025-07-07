import GameUtils from "../../../common/GameUtils";
import { buildShareResource } from "../../../common/helpers/UrlHelper";
import { IGameNamesBreakLine, IGameNamesFontSize, ILabelGameType } from "./theme/GameNameManager";
import { themeResourceLoader } from "./theme/ResourceLoader";
import { THEME_REMOTE_PATH, themeManager } from "./theme/ThemeManager";

export interface IInfoLobbyTheme {
    theme: string;
    currencyGroups?: {
        [currency: string]: {
            theme: string;
        };
    };
}

export interface IInfoShareResource {
    versionBanner: number;
    versionGameIcon: number;
    versionMiniGameIcon: number;
    ignoreCapitalizeGameNames: number[];
    gameNamesBreakLine: IGameNamesBreakLine;
    gameNamesFontSize: IGameNamesFontSize;
    labelGameType: ILabelGameType;
}

export interface IInfoShareResourceBanner {
    premultipliedAlpha: boolean;
    languages: LanguagesConfig;
    version?: number;
}

interface LanguagesConfig {
    en: boolean;
    vi?: boolean;
    th?: boolean;
    id?: boolean;
    zh_cn?: boolean;
    zh_tw?: boolean;
}

export const DEFAULT_THEME_CURRENCY_GROUP = "credit_php";

export default class LobbyResourceManager {
    private static _instance: LobbyResourceManager;

    public currencyGroup = "";
    public infoShareResource: IInfoShareResource = {
        versionBanner: 1,
        versionGameIcon: 1,
        versionMiniGameIcon: 1,
        ignoreCapitalizeGameNames: [],
        gameNamesBreakLine: {},
        gameNamesFontSize: {},
        labelGameType: {}
    };
    public infoLobbyTheme: IInfoLobbyTheme = {
        theme: "default",
        currencyGroups: {
            Credit_PHP: {
                theme: DEFAULT_THEME_CURRENCY_GROUP
            },
            Cash_PHP: {
                theme: DEFAULT_THEME_CURRENCY_GROUP
            }
        }
    };

    public static getInstance(): LobbyResourceManager {
        if (!this._instance) {
            this._instance = new LobbyResourceManager();
        }

        return this._instance;
    }

    public async init(currencyGroup?: string) {
        try {
            await this.getRemoteInfoTheme();

            const finalTheme = currencyGroup
                ? this.infoLobbyTheme?.currencyGroups[currencyGroup]?.theme || this.infoLobbyTheme?.theme
                : this.infoLobbyTheme?.theme;

            await themeManager?.setTheme(finalTheme);
            this.initializeCurrencyGroupTheme(currencyGroup);
        } catch (err) {
            cc.error("Failed to initialize lobby resource manager:", err);
        }
    }

    protected async initializeCurrencyGroupTheme(currencyGroup: string) {
        this.currencyGroup = currencyGroup;
        await this.initializeCurrencyGroup();
    }

    protected async initializeCurrencyGroup(): Promise<void> {
        if (themeManager?.hasCurrencyGroup()) {
            try {
                await this.getRemoteVersion();
            } catch (err) {
                cc.error("Failed to initialize game name manager:", err);
            }
        }
    }

    protected async getRemoteInfoTheme() {
        const url = `${buildShareResource()}/${THEME_REMOTE_PATH}/info.json?v=${Date.now()}`;
        const infoTheme = await GameUtils.loadRemote<cc.JsonAsset>(url);

        infoTheme && (this.infoLobbyTheme = infoTheme.json);
    }

    protected async getRemoteVersion() {
        const versions = await themeResourceLoader?.loadRemoteSharedResource<cc.JsonAsset>(`info.json?v=${Date.now()}`);

        versions && (this.infoShareResource = versions.json);
    }

    public hasCurrencyGroup(): boolean {
        try {
            return (
                !!this?.currencyGroup && !!this?.infoLobbyTheme?.currencyGroups && this.currencyGroup in this.infoLobbyTheme.currencyGroups
            );
        } catch {
            return false;
        }
    }
}

export const lobbyResourceManager = LobbyResourceManager.getInstance();
