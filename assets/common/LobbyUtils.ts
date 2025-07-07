import { BundleManager } from "bundle-management";
import { getGameConfiguration } from "../configs/GameConfigurations";
import { TotalPreloadGameIcon } from "../constants";
import LobbyManager from "../lobby/main/view-models/LobbyManager";
import { lobbyResourceManager } from "../lobby/main/view-models/LobbyResourceManager";
import { themeGameIconLoader } from "../lobby/main/view-models/theme/GameIconLoader";
import SkeletonBannerTheme from "../lobby/main/view-models/theme/SkeletonBannerTheme";
import { DEFAULT_THEME_LOCAL_PATH, themeManager } from "../lobby/main/view-models/theme/ThemeManager";
import { uiManager } from "../managers/GameUIManager";
import { StorageManager } from "../managers/StorageManager";
import GameUtils from "./GameUtils";
import { userManager } from "./user/UserManager";

export const MICRO_GAMES_NOT_OFFER_BANNER = [9, 48, 49, 50];
export enum BannerType {
    SingleImage = "singleImage",
    Prefab = "prefab"
}

export default class LobbyUtils {
    public static cachedGameIcon(gameId: number) {
        const gameConfiguration = getGameConfiguration(gameId);
        const isMicrosite = GameUtils.isMicroSite(gameConfiguration);
        return !!isMicrosite ? uiManager.remoteIconCache[gameId] : uiManager.prefabCache.lobbyIcons[gameId];
    }

    public static async getBannerPrefab(data: { id: number; remoteBundle; systemPath: string }) {
        const { id, remoteBundle, systemPath } = data;
        let banner: cc.Prefab;

        if (!!remoteBundle && !MICRO_GAMES_NOT_OFFER_BANNER.includes(id)) {
            const path =
                systemPath === ""
                    ? `banners/${GameUtils.getCurrentLanguage()}/banner`
                    : `banners/${systemPath}/${GameUtils.getCurrentLanguage()}/banner`;
            try {
                banner = await BundleManager.getInstance().loadAsset<cc.Prefab>({
                    bundleId: id.toString(),
                    path: path,
                    type: cc.Asset
                });
            } catch (error) {
                cc.log(this.getErrorMessageBanner(id));
            }
        } else {
            cc.log(this.getErrorMessageBanner(id));
        }

        return banner;
    }

    public static async loadGameIcon(gameId: number, systemPath = ""): Promise<cc.Prefab> {
        const category = StorageManager.get("current_game_category") ?? 0;
        const gameConfiguration = getGameConfiguration(gameId);
        const gameSetting = LobbyManager.getInstance().getGame(gameId, category);

        let prefab: cc.Prefab;
        if (!!gameConfiguration?.remoteBundle) {
            const directory = systemPath === "" ? "icons" : `icons/${systemPath}`;
            const path = `${GameUtils.isMicroSite(gameConfiguration) ? gameId + "/" : ""}${directory}/${
                gameSetting?.bigSize ? "Big" : "Small"
            }`;
            prefab = await BundleManager.getInstance().loadAsset<cc.Prefab>({
                bundleId: gameId.toString(),
                path: path,
                type: cc.Prefab
            });
        } else {
            const directory = systemPath === "" ? "lobby/games" : `lobby/games/${systemPath}`;
            const path = `${directory}/${gameId}`;
            prefab = await GameUtils.loadResource(path);
        }

        uiManager.prefabCache.lobbyIcons[gameId] = prefab;
        return prefab;
    }

    public static async getStaticBanner(id: number, systemPath = "") {
        const gameConfiguration = getGameConfiguration(id);
        if (GameUtils.isMicroSite(gameConfiguration)) {
            return this.getRemoteBanner(id);
        }

        return this.getResourceBanner({
            id,
            remoteBundle: gameConfiguration.remoteBundle,
            systemPath
        });
    }

    protected static getErrorMessageBanner(id: number) {
        return `No banner for game ${id}`;
    }

    private static async preloadRemoteIcon(gameId: number) {
        try {
            const versions = await GameUtils.getRemoteVersion(gameId);
            const loadRemoteIconData = async (resource) => {
                const url = `${GameUtils.remoteGameResourceUrl(gameId, "icon")}/${resource}?v=${versions?.icon}`;
                const data: any = await GameUtils.loadRemote(url);
                return data;
            };

            const configFile = await loadRemoteIconData("config.json");
            const useWebp = configFile?.json?.useWebp ?? false;
            const skeletonData = new sp.SkeletonData();
            const atlasExt = useWebp ? "webp" : "png";
            skeletonData.skeletonJson = (await loadRemoteIconData("icon-game.json")).json;
            skeletonData.atlasText = (await loadRemoteIconData(`icon-game.atlas`)).text;
            skeletonData.textures = [await loadRemoteIconData(`icon-game.${atlasExt}`)];
            skeletonData["textureNames"] = [`icon-game.${atlasExt}`];

            uiManager.remoteIconCache[gameId] = { skeletonData: skeletonData, configFile};
        } catch (error) {
            console.log("preloadRemoteIcon error", error.message);
        }
    }

    private static async getSpineRemoteBanner(id: number) {
        const spineAssets = [];

        try {
            uiManager.remoteBannerCache[id]?.configFile ||
                (await GameUtils.loadRemoteGameResource<cc.JsonAsset>(id, `banner/en/config.json`));

            const host = GameUtils.remoteGameResourceUrl(id, `banner/${GameUtils.getCurrentLanguage()}`);
            const spineName = "banner-game";
            const resourceExts = ["atlas", "json", "png"];
            const versions = await GameUtils.getRemoteVersion(id);
            for (const ext of resourceExts) {
                try {
                    const resName = `${spineName}.${ext}?v=${versions?.banner}`;
                    const url = `${host}/${resName}`;
                    const asset = await GameUtils.loadRemote<cc.Asset>(url);
                    spineAssets.push(asset);
                } catch (error) {}
            }
        } catch (error) {
            cc.log(this.getErrorMessageBanner(id));
        }
        return spineAssets;
    }

    private static async getAnimationBanner(id: number, systemPath = "") {
        const gameConfiguration = getGameConfiguration(id);
        if (GameUtils.isMicroSite(gameConfiguration)) {
            return this.getSpineRemoteBanner(id);
        }

        return this.getBannerPrefab({
            id,
            remoteBundle: gameConfiguration.remoteBundle,
            systemPath
        });
    }

    public static getBannerTypeByGameId(id: number | string): string {
        const gameConfiguration = getGameConfiguration(id);
        return gameConfiguration?.bannerType;
    }

    private static createBannerNameOptions(id: number, isMicrosite: boolean): string[] {
        const currentLang = GameUtils.getCurrentLanguage();
        if (isMicrosite) {
            const name1 = `${currentLang}`;
            const defaultName = `en`;

            return [name1, defaultName];
        } else {
            const suffix = currentLang !== "vi" ? `_${currentLang}` : "";
            const name1 = `${id}${suffix}`;
            const name2 = `${id}`;

            return [name1, name2];
        }
    }

    private static async getRemoteBanner(gameId: number) {
        const bannerNames = this.createBannerNameOptions(gameId, true);
        let remoteTexture: cc.Texture2D;
        const versions = await GameUtils.getRemoteVersion(gameId);
        for (const bannerName of bannerNames) {
            try {
                remoteTexture = await GameUtils.loadRemoteGameResource<cc.Texture2D>(
                    gameId,
                    `banner/${bannerName}.png?v=${versions?.banner}`
                );
                if (remoteTexture) {
                    break;
                }
            } catch (error) {}
        }
        if (remoteTexture) {
            return new cc.SpriteFrame(remoteTexture);
        }
        cc.log(this.getErrorMessageBanner(gameId));
        return null;
    }

    private static bannerLoaded = false;

    static preloadedLobby = false;
    public static async gotoLobbyScene(onProgress, lobbyMenuConfig, splashConfig) {
        if (LobbyUtils.preloadedLobby) {
            onProgress(100, 100);
            cc.director.loadScene("Lobby");
            return;
        }

        const progressInfo: { [key: string]: { finish?: number; total: number } } = {
            bgUI: { total: 0 },
            gameIcon: { total: 0 },
            banner: { total: 0 },
            centerUI: { total: 0 },
            skeletonIcon: { total: 0 },
            sceneLobby: { total: 0 },
            categoryUI: { total: 0 }
        };
        const updateProgress = () => {
            const values = Object.values(progressInfo);
            const finish = values.reduce((pre, cur) => pre + (cur?.finish || 0), 0);
            const fakeTotal = 300;
            const total = values.some((cur) => cur.total === 0) ? fakeTotal : values.reduce((pre, cur) => pre + cur.total, 0);
            onProgress(finish, total);
        };

        const updateProgressKey = (key, finish, total) => {
            progressInfo[key] = { finish, total };
            cc.log(`updateProgressKey ${key} ${finish}/`, total);
            updateProgress();
        };

        try {
            const startLoadTime = Date.now();
            console.log(`SplashScreen - Start i&b: ${new Date(startLoadTime).toLocaleString()}`);
            await Promise.all([
                LobbyUtils.preLoadBanner(lobbyMenuConfig, (finish, total) => updateProgressKey("banner", finish, total)),
                LobbyUtils.preLoadGameIcons(lobbyMenuConfig, splashConfig, (finish, total) => updateProgressKey("gameIcon", finish, total)),
                LobbyUtils.preLoadBackgroundUI((finish, total) => updateProgressKey("bgUI", finish, total)),
                LobbyUtils.preLoadCategoryUI((finish, total) => updateProgressKey("categoryUI", finish, total)),
                LobbyUtils.preLoadLobbyCenterUI((finish, total) => updateProgressKey("centerUI", finish, total)),
                LobbyUtils.preloadSkeletonIconDir((finish, total) => updateProgressKey("skeletonIcon", finish, total)),
                LobbyUtils.preloadSceneLobby((finish, total) => updateProgressKey("sceneLobby", finish, total))
            ]);
            const endLoadTime = Date.now();
            console.log(
                `SplashScreen - End i&b: ${new Date(endLoadTime).toLocaleString()}`,
                `Total time: ${(endLoadTime - startLoadTime) / 1000}`
            );
            LobbyUtils.preloadedLobby = true;
            cc.director.loadScene("Lobby");
        } catch (e) {
            console.log(e);
        }
    }

    private static preloadSceneLobby(onProgress: (finish: number, total: number, item: any) => void) {
        return new Promise((resolve) => {
            cc.director.preloadScene("Lobby", onProgress, resolve);
        });
    }

    private static preloadSkeletonIconDir(onProgress: (finish, total) => void) {
        return new Promise((resolve) => {
            const path = lobbyResourceManager?.hasCurrencyGroup() ? themeManager?.getPath() : DEFAULT_THEME_LOCAL_PATH;
            const iconPath = `${path}/prefabs/skeleton-icon`;
            cc.resources.loadDir(iconPath, onProgress, resolve);
        });
    }

    private static preloadResource(path: any, onProgress: (finish, total) => void): Promise<any> {
        return new Promise((resolve) => cc.resources.load(path, onProgress, resolve));
    }

    private static async preLoadGameIcons(lobbyMenuConfig, splashConfig, onProgress: (finish, total) => void) {
        try {
            const offerGames = userManager.offerGames ?? [];
            let firstCategoryGames = lobbyMenuConfig.firstCategoryList;
            let preLoadGameIds = [];

            // Filter offer games
            if (offerGames.length > 0 && firstCategoryGames?.length > 0) {
                firstCategoryGames = firstCategoryGames.filter((gameId) => offerGames.includes(gameId));
            }
            preLoadGameIds =
                firstCategoryGames?.length >= TotalPreloadGameIcon ? firstCategoryGames.slice(0, TotalPreloadGameIcon) : firstCategoryGames;

            if (lobbyResourceManager?.hasCurrencyGroup()) {
                const preloadGameInMain = preLoadGameIds.filter(
                    (gameId) => getGameConfiguration(gameId) || lobbyMenuConfig.customGameIconBySystem.includes(gameId)
                );
                const preLoadGameAwaiters = preloadGameInMain.map((gameId) => themeGameIconLoader?.loadGameIcon(gameId));

                const total = preLoadGameAwaiters.length;
                for (let index = 0; index < total; index++) {
                    const waiter = preLoadGameAwaiters[index];
                    await Promise.all([waiter]);
                    onProgress(index + 1, total);
                }

                console.log(`SplashScreen - Completed load game icons`, [
                    {
                        name: "main",
                        ids: preloadGameInMain.join(",")
                    }
                ]);

                return;
            }

            // Load game icon custom by system

            const preloadGameInMain = preLoadGameIds.filter((gameId) => !GameUtils.isMicroSite(getGameConfiguration(gameId)));
            const preLoadGameAwaiters = preloadGameInMain.map((gameId) => this.loadGameIcon(gameId));

            // Load game icon custom by system
            const preLoadGameBySystemIds = preLoadGameIds.filter((gameId) => lobbyMenuConfig.customGameIconBySystem.includes(gameId));
            const preLoadGameBySystemAwaiters = preLoadGameBySystemIds.map((gameId) => this.loadGameIcon(gameId, splashConfig.customPath));

            // Load game icon through remote site
            const preloadRemoteGameIds = preLoadGameIds.filter((id) => GameUtils.isMicroSite(getGameConfiguration(id)));
            const preloadRemoteGameAwaiters = preloadRemoteGameIds.map((gameId) => this.preloadRemoteIcon(gameId));

            // Wait all

            const preloadWaiters = [...preLoadGameAwaiters, ...preLoadGameBySystemAwaiters, ...preloadRemoteGameAwaiters];
            const total = preloadWaiters.length;
            for (let index = 0; index < total; index++) {
                const waiter = preloadWaiters[index];
                await Promise.all([waiter]);
                onProgress(index + 1, total);
            }

            console.log(`SplashScreen - Completed load game icons`, [
                {
                    name: "main",
                    ids: preloadGameInMain.join(",")
                },
                {
                    name: "custom-by-system",
                    ids: preLoadGameBySystemIds.join(",")
                },
                {
                    name: "remote",
                    ids: preloadRemoteGameIds.join(",")
                }
            ]);
        } catch (ex) {
            console.log(ex);
        }
    }

    private static async preLoadBanner(lobbyMenuConfig, onProgress: (finish, total) => void) {
        try {
            if (this.bannerLoaded) {
                return;
            }

            const offerGames = userManager.offerGames ?? [];
            let bannerGameIds = lobbyMenuConfig.bannerAds ?? [];

            // Filter offer games if applicable
            if (offerGames.length > 0) {
                bannerGameIds = bannerGameIds.filter((gameId) => offerGames.includes(gameId));
            }

            if (bannerGameIds.length === 0) {
                return;
            }

            const bannerId = bannerGameIds[0];

            // Load themed banner if applicable
            if (lobbyResourceManager?.hasCurrencyGroup() && bannerId > 0) {
                await this.loadThemedBanner(bannerId, onProgress);
            } else {
                await this.loadStandardBanner(bannerId, onProgress);
            }

            this.bannerLoaded = true;
        } catch (ex) {
            console.log(ex);
        }
    }

    private static async loadThemedBanner(bannerId: number, onProgress: (finish, total) => void) {
        const node = new cc.Node();
        const bannerComp = node.addComponent(SkeletonBannerTheme);

        await Promise.all([
            bannerComp.createRemoteIconNode(bannerId),
            this.preloadResource(`${themeManager?.getPath()}/prefabs/banner/bannerContainer`, onprogress)
        ]);

        node.destroy();
    }

    private static getBannerSpriteFrame(gameId: number, imageName: string): Promise<cc.SpriteFrame> {
        return new Promise<cc.SpriteFrame>((resolve) => {
            cc.resources.load<cc.SpriteFrame>(`lobby/banner/textures/${gameId}/${imageName}`, cc.SpriteFrame, (err, spriteFrame) => {
                resolve(spriteFrame);
            });
        });
    }

    private static async getResourceBanner(data: { id: number; remoteBundle; systemPath: string }) {
        const { id, remoteBundle, systemPath } = data;
        let frame: cc.SpriteFrame;
        const bannerNames = this.createBannerNameOptions(id, false);
        for (const element of bannerNames) {
            if (!!remoteBundle && !MICRO_GAMES_NOT_OFFER_BANNER.includes(id)) {
                const path = systemPath === "" ? `banners/${element}` : `banners/${systemPath}/${element}}`;
                try {
                    frame = await BundleManager.getInstance().loadAsset<cc.SpriteFrame>({
                        bundleId: id.toString(),
                        path: path,
                        type: cc.SpriteFrame
                    });
                } catch (error) {
                    frame = await this.getBannerSpriteFrame(id, element);
                }
            } else {
                frame = await this.getBannerSpriteFrame(id, element);
            }

            if (frame) {
                break;
            }
        }

        return frame;
    }

    private static async loadStandardBanner(bannerId: number, onProgress: (finish, total) => void) {
        const bannerType = this.getBannerTypeByGameId(bannerId);
        const bannerLoader = bannerType === BannerType.Prefab ? this.getAnimationBanner(bannerId) : this.getStaticBanner(bannerId);

        await Promise.all([bannerLoader, this.preloadResource("lobby/banner/bannerContainer", onProgress)]);
    }

    private static async preLoadLobbyUI(
        uiType: "background-ui" | "category-container" | "lobby-center",
        onProgress: (finish, total) => void
    ) {
        const path = `${themeManager?.getPathPreloadPrefab(uiType)}/prefabs/${uiType}`;
        return this.preloadResource(path, onProgress);
    }

    private static async preLoadBackgroundUI(onProgress: (finish, total) => void) {
        return this.preLoadLobbyUI("background-ui", onProgress);
    }

    private static async preLoadCategoryUI(onProgress: (finish, total) => void) {
        return this.preLoadLobbyUI("category-container", onProgress);
    }

    private static async preLoadLobbyCenterUI(onProgress: (finish, total) => void) {
        return this.preLoadLobbyUI("lobby-center", onProgress);
    }
}
