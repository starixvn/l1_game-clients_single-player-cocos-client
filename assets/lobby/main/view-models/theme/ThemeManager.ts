import GameUtils from "../../../../common/GameUtils";
import { DEFAULT_THEME_CURRENCY_GROUP, lobbyResourceManager } from "../LobbyResourceManager";

export interface IInfoLobbyTheme {
    theme: string;
    currencyGroups?: {
        [currency: string]: {
            theme: string;
        };
    };
}
export interface IThemeSettings {
    "category-container": {
        isOverride: boolean;
    };
    "background-ui": {
        isOverride: boolean;
    };
    "lobby-center": {
        isOverride: boolean;
    };
    header: {
        isOverride: boolean;
    };
    "button-arrow": {
        isOverride: boolean;
    };
    buttons: {
        isOverride: boolean;
    };
    marquee: {
        isOverride: boolean;
    };
}

export const THEME_LOCAL_PATH = "lobby/themes";
export const DEFAULT_THEME = "default";
export const DEFAULT_THEME_LOCAL_PATH = `${THEME_LOCAL_PATH}/${DEFAULT_THEME}`;
export const THEME_REMOTE_PATH = "lobbies/themes";

export class ThemeManager {
    private static _instance: ThemeManager;
    private _theme = "";
    private _themeSettings: IThemeSettings;

    public static getInstance(): ThemeManager {
        if (!this._instance) {
            this._instance = new ThemeManager();
        }
        return this._instance;
    }

    init(theme: string) {
        this._theme = theme;
    }

    public getThemeSettings() {
        return this._themeSettings;
    }

    public async setTheme(theme: string) {
        try {
            this._theme = theme ?? DEFAULT_THEME_CURRENCY_GROUP;
            await this.loadSettingThemes();
        } catch (err) {
            cc.error("Failed to set theme:", err);
        }
    }

    public getTheme() {
        return this._theme;
    }

    public getPath() {
        return `${THEME_LOCAL_PATH}/${this._theme}`;
    }

    public hasCurrencyGroup() {
        return lobbyResourceManager.currencyGroup in lobbyResourceManager.infoLobbyTheme.currencyGroups;
    }

    public getPathPreloadPrefab(name: string) {
        const path = this._themeSettings?.[name]?.isOverride ? this._theme : DEFAULT_THEME;
        return `${THEME_LOCAL_PATH}/${path}`;
    }

    public async loadSettingThemes() {
        const path = `${THEME_LOCAL_PATH}/${this?._theme}/info`;
        const themeSettings = (await GameUtils.loadResourceAsset<cc.JsonAsset>(path, cc.JsonAsset)) as any;
        themeSettings && (this._themeSettings = themeSettings.json);
    }
}

export const themeManager = ThemeManager.getInstance();
