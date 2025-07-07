import GameUtils from "../../../../common/GameUtils";
import { buildShareResource } from "../../../../common/helpers/UrlHelper";
import { lobbyResourceManager } from "../LobbyResourceManager";
import { THEME_LOCAL_PATH, THEME_REMOTE_PATH, themeManager } from "./ThemeManager";

export class ThemeResourceLoader {
    private static _instance: ThemeResourceLoader;

    public static getInstance(): ThemeResourceLoader {
        if (!this._instance) {
            this._instance = new ThemeResourceLoader();
        }

        return this._instance;
    }
    public loadRemoteSharedResource<T>(pathResource: string, options = { maxRetryCount: 3 }) {
        return GameUtils.loadRemote<T>(this.remoteShareLobbyResourceUrl(pathResource), options);
    }

    protected remoteShareLobbyResourceUrl(pathResource: string) {
        const url = buildShareResource();
        return `${url}/${THEME_REMOTE_PATH}/${themeManager?.getTheme()}/${pathResource}`;
    }

    public loadPrefab(path: string): Promise<cc.Prefab> {
        return new Promise((resolve) => {
            cc.resources.load(`${themeManager?.getPath()}/prefabs/${path}`, (err, prefab: cc.Prefab) => {
                resolve(prefab);
            });
        });
    }

    public loadPrefabByTheme(path: string): Promise<cc.Prefab> {
        if (lobbyResourceManager?.hasCurrencyGroup()) {
            return this.loadPrefab(path);
        }

        return new Promise((resolve) => {
            const themeSettings = themeManager?.getThemeSettings();
            const themeName = themeSettings?.[path]?.isOverride ? lobbyResourceManager?.infoLobbyTheme?.theme : "default";
            const themePath = `${THEME_LOCAL_PATH}/${themeName}/prefabs/${path}`;
            cc.resources.load(themePath, (err, prefab: cc.Prefab) => {
                if (err) {
                    cc.error(`Failed to load prefab at path: ${themePath}`, err);
                }
                resolve(prefab);
            });
        });
    }

    public async loadRemoteInfoBanner(gameId: number) {
        return this.loadRemoteSharedResource<cc.JsonAsset>(`banners/${gameId}/info.json?v=${Date.now()}`, {
            maxRetryCount: 0
        });
    }
}

export const themeResourceLoader = ThemeResourceLoader.getInstance();
