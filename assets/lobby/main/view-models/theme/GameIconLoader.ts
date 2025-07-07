import { uiManager } from "../../../../managers/GameUIManager";
import { lobbyResourceManager } from "../LobbyResourceManager";
import { themeResourceLoader } from "./ResourceLoader";

export interface IGameIconLoader {
    loadGameIcon(gameId: number): Promise<cc.SpriteFrame>;
    loadMiniGameIcon(gameId: number): Promise<cc.SpriteFrame>;
}

export class ThemeGameIconLoader implements IGameIconLoader {
    private static _instance: ThemeGameIconLoader;

    public static getInstance(): ThemeGameIconLoader {
        if (!this._instance) {
            this._instance = new ThemeGameIconLoader();
        }

        return this._instance;
    }

    public async loadGameIcon(gameId: number): Promise<cc.SpriteFrame> {
        return this.loadIcon(gameId, "game", uiManager.spriteFrameCache.lobbyIcons);
    }

    public async loadMiniGameIcon(gameId: number): Promise<cc.SpriteFrame> {
        return this.loadIcon(gameId, "mini-game", uiManager.spriteFrameCache.miniPanelIcons);
    }

    private async loadIcon(gameId: number, type: "game" | "mini-game", cache: any): Promise<cc.SpriteFrame> {
        const version = lobbyResourceManager.infoShareResource[type === "game" ? "versionGameIcon" : "versionMiniGameIcon"];
        const resourcePath = `${type}-icons/${gameId}/en.webp?v=${version}`;
        const remoteTexture = await themeResourceLoader?.loadRemoteSharedResource<cc.Texture2D>(resourcePath);
        const spriteFrame = new cc.SpriteFrame(remoteTexture);
        cache[gameId] = { spriteFrame };

        if (spriteFrame) {
            return spriteFrame;
        }

        cc.log(`Not get ${type === "game" ? "Game" : "Mini Game"} Icon from shared resource: ${gameId}`);
        return null;
    }
}

export const themeGameIconLoader = ThemeGameIconLoader.getInstance();
