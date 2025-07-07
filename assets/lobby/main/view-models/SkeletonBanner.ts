import { lazyInject } from "../../../Application";
import GameUtils from "../../../common/GameUtils";
import Loading from "../../../common/loading/view-models/Loading";
import LobbyUtils from "../../../common/LobbyUtils";
import RemoteSpine, { Type } from "../../../common/RemoteSpine";
import { GameConfiguration, getGameConfiguration } from "../../../configs/GameConfigurations";
import { SkeletonCache, uiManager } from "../../../managers/GameUIManager";
import SplashConfig from "../../../splash/view-models/SplashConfig";

const { ccclass, property } = cc._decorator;

interface RemoteResourceConfig {
    premultipliedAlpha: boolean;
}

@ccclass
export default class SkeletonBanner extends cc.Component {
    @property(cc.Node)
    gameContent: cc.Node = null;

    @property(cc.Node)
    lightTop: cc.Node = null;

    @property(cc.Node)
    border: cc.Node = null;

    @property(cc.Node)
    skeletonLoading: cc.Node = null;

    @property(Loading)
    gameLoading: Loading = null;

    @lazyInject(SplashConfig)
    protected readonly splashConfig: SplashConfig;

    protected readonly cache: SkeletonCache = uiManager.remoteBannerCache;

    @property
    public spineName = "banner-game";

    @property
    public animationName = "show";

    readonly resourceExts = ["atlas", "json", "png"];

    protected async createRemoteIconNode(id: number) {
        try {
            const node = new cc.Node();
            const configFile = this.cache[id]
                ? this.cache[id].configFile
                : await GameUtils.loadRemoteGameResource<cc.JsonAsset>(id, `banner/${GameUtils.getCurrentLanguage()}/config.json`);

            if (!configFile) {
                return null;
            }

            this.cache[id] = {
                ...this.cache[id],
                configFile: configFile
            };

            const iconConfig: RemoteResourceConfig = configFile?.json;

            node.addComponent(sp.Skeleton);
            const remoteSpine = node.addComponent(RemoteSpine);
            const url = GameUtils.remoteGameResourceUrl(id, `banner/${GameUtils.getCurrentLanguage()}`);
            remoteSpine.id = id;
            remoteSpine.host = url;
            remoteSpine.spineName = this.spineName;
            remoteSpine.premultipliedAlpha = iconConfig ? iconConfig.premultipliedAlpha : false;
            remoteSpine.type = Type.Banner;
            await remoteSpine.init(this.cache);
            node.active = false;
            return node;
        } catch (error) {
            cc.log("No banner for game " + id);
        }
        return null;
    }

    async loadAnimation(id: number) {
        const gameConfig = getGameConfiguration(id);

        const gameNode = gameConfig.isMicrosite ? await this.createRemoteIconNode(id) : await this.createIconNode(gameConfig);
        if (gameNode) {
            this.hideSkeleton();
            this.gameContent?.childrenCount === 0 && (gameNode.active = true);
            this.gameContent?.addChild(gameNode);
            return true;
        }
        return false;
    }

    async createIconNode(config: GameConfiguration) {
        try {
            let prefab: cc.Prefab;

            if (uiManager.prefabCache.lobbyBanners[config.id]) {
                prefab = uiManager.prefabCache.lobbyBanners[config.id];
            } else {
                prefab = await LobbyUtils.getBannerPrefab({
                    id: config.id,
                    remoteBundle: config.remoteBundle,
                    systemPath: ""
                });

                if (!prefab) {
                    prefab = await LobbyUtils.getBannerPrefab({
                        id: config.id,
                        remoteBundle: config.remoteBundle,
                        systemPath: this.splashConfig.customPath
                    });
                }
                uiManager.prefabCache.lobbyBanners[config.id] = prefab;
            }
            return cc.instantiate(prefab);
        } catch (error) {
            cc.log("No banner for game " + config.id);
            return null;
        }
    }

    protected hideSkeleton() {
        this.lightTop && (this.lightTop.active = false);
        this.skeletonLoading && (this.skeletonLoading.active = false);
        this.border && (this.border.active = false);
    }
}
