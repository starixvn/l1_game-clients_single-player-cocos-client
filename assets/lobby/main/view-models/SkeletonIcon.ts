import { lazyInject } from "../../../Application";
import GameUtils from "../../../common/GameUtils";
import LobbyUtils from "../../../common/LobbyUtils";
import RemoteSpine from "../../../common/RemoteSpine";
import { getLocale } from "../../../common/auth/SessionManager";
import { FormationHandler } from "../../../common/i18n/FormationHandler";
import Loading from "../../../common/loading/view-models/Loading";
import StringUtil from "../../../common/utils/StringUtil";
import { getGameConfiguration } from "../../../configs/GameConfigurations";
import { SkeletonCache, uiManager } from "../../../managers/GameUIManager";
import SplashConfig from "../../../splash/view-models/SplashConfig";
import GameNotification from "./GameNotification";
import LobbyMenuConfig from "./LobbyMenuConfig";

const { ccclass, property } = cc._decorator;

interface GameNotificationConfig {
    type: string;
    x?: number;
    y?: number;
}
export interface RemoteIconConfig {
    gameNotification?: GameNotificationConfig;
    premultipliedAlpha: boolean;
    useWebp: boolean;
    labelGameType?: GameNotificationConfig;
}

@ccclass
export default class SkeletonIcon extends cc.Component {
    @property(cc.Label)
    gameName: cc.Label = null;

    @property(cc.Node)
    gameContent: cc.Node = null;

    @property(cc.Node)
    lightTop: cc.Node = null;

    @property(cc.Node)
    skeletonLoading: cc.Node = null;

    @property(cc.Node)
    newTag: cc.Node = null;

    @property(Loading)
    gameLoading: Loading = null;

    @property(cc.Node)
    lblGameType: cc.Node = null;

    @lazyInject(LobbyMenuConfig)
    private readonly lobbyMenuConfig: LobbyMenuConfig;

    @lazyInject(SplashConfig)
    protected readonly splashConfig: SplashConfig;

    protected onLoad(): void {
        this.gameName.node.active = false;
    }

    protected readonly micrositeIconCache: SkeletonCache = uiManager.remoteIconCache;

    setGameName(text: string, gameId: number, formatGameName: FormationHandler) {
        const transformersGameId = 70;
        const transformersLabelFontSize = 23;
        this.gameName.node.active = true;
        this.gameName.string = StringUtil.formatText(text, formatGameName);
        const language = getLocale();
        if (gameId === transformersGameId) {
            if (language === "en-US" || language === "id-ID") {
                this.gameName.fontSize = transformersLabelFontSize;
            }
        }
    }
    static listGameWithoutHide = [];

    setGameContent(id: number, gameIconIndex: number, categoryIndex: number, addListIconObscure: (icon: SkeletonIcon) => void) {
        const cachedGameIcon = LobbyUtils.cachedGameIcon(id);

        if (!!cachedGameIcon) {
            this.loadAnimation(id, categoryIndex);
        } else {
            addListIconObscure(this);
        }
    }

    protected async createIconNode(id: number) {
        try {
            let prefab: cc.Prefab;
            if (uiManager.prefabCache.lobbyIcons[id]) {
                prefab = uiManager.prefabCache.lobbyIcons[id];
            } else {
                prefab = await LobbyUtils.loadGameIcon(id);
                if (!prefab) {
                    prefab = await LobbyUtils.loadGameIcon(id, this.splashConfig.customPath);
                }
            }
            return cc.instantiate(prefab);
        } catch (error) {
            cc.log(error);
            return null;
        }
    }

    protected async createRemoteIconNode(id: number) {
        const node = new cc.Node();
        try {
            const configFile = this.micrositeIconCache[id]
                ? this.micrositeIconCache[id].configFile
                : await GameUtils.loadRemoteGameResource<cc.JsonAsset>(id, `icon/config.json`);

            this.micrositeIconCache[id] = {
                ...this.micrositeIconCache[id],
                configFile
            };
            const iconConfig: RemoteIconConfig = configFile?.json;

            node.addComponent(sp.Skeleton);
            const remoteSpine = node.addComponent(RemoteSpine);
            const url = GameUtils.remoteGameResourceUrl(id, "icon");
            remoteSpine.id = id;
            remoteSpine.host = url;
            remoteSpine.spineName = "icon-game";
            remoteSpine.premultipliedAlpha = iconConfig?.premultipliedAlpha ?? false;
            remoteSpine.useWebp = iconConfig?.useWebp ?? false;
            await remoteSpine.init(this.micrositeIconCache);
            if (iconConfig?.gameNotification) {
                await this.addGameNotificationComponent(node, id, iconConfig?.gameNotification);
            }
        } catch (error) {
            cc.log(error);
            return null;
        }
        return node;
    }

    protected async setGameTypeLabel(id: number) {
        try {
            const gameConfiguration = getGameConfiguration(id);
            if (!this.lblGameType || !GameUtils.isMicroSite(gameConfiguration)) {
                return;
            }
            const configFile = this.micrositeIconCache[id]
                ? this.micrositeIconCache[id].configFile
                : await GameUtils.loadRemoteGameResource<cc.JsonAsset>(id, `icon/config.json`);

            this.micrositeIconCache[id] = {
                ...this.micrositeIconCache[id],
                configFile
            };
            const iconConfig: RemoteIconConfig = configFile?.json;
            const labelTypeInfo = iconConfig?.labelGameType;
            if (labelTypeInfo) {
                this.lblGameType.active = true;
                const host = GameUtils.remoteGameResourceUrl(id, `icon/${labelTypeInfo.type}`);
                const versions = await GameUtils.getRemoteVersion(id);
                const versionType = versions?.icon;
                const resName = `${window.i18n.curLang}.png?v=${versionType}`;
                const url = `${host}/${resName}`;

                try {
                    const data = await GameUtils.loadRemote(url);
                    if (data && this.lblGameType && this.lblGameType.isValid) {
                        this.assignSpriteFrame(labelTypeInfo, data as cc.Texture2D);
                    } else {
                        cc.warn("[SkeletonIcon] Failed to load sprite frame for cascading label");
                        this.lblGameType.active = false;
                    }
                } catch (error) {
                    cc.log(error);
                    this.lblGameType.active = false;
                }
            }
        } catch (error) {
            cc.log(error);
        }
    }

    assignSpriteFrame(labelGameType: any, texture2D: cc.Texture2D) {
        const sprite = this.lblGameType.getComponent(cc.Sprite);
        if (sprite) {
            const spriteFrame = new cc.SpriteFrame(texture2D);
            sprite.spriteFrame = spriteFrame;
        }
        this.lblGameType.position = cc.v3(labelGameType.x, labelGameType.y);
    }

    protected async addGameNotificationComponent(node: cc.Node, id: number, gameNotification: GameNotificationConfig) {
        const notification = node.addComponent(GameNotification);
        notification.gameId = id;

        const type = gameNotification.type;
        const labelPrefabName = `label-${type}`;
        const prefab = await GameUtils.loadResource(`lobby/games/remote-icon/${labelPrefabName}`);
        const labelNode = cc.instantiate(prefab);
        node?.addChild(labelNode);
        labelNode.position = labelNode.position.add(cc.v3(gameNotification.x, gameNotification.y));
        labelNode.active = false;
        notification.noticeNode = labelNode;
    }

    public async loadAnimation(id: number, categoryIndex = 0) {
        if (this.gameContent.children.length > 0) {
            return;
        }
        const gameConfiguration = getGameConfiguration(id);
        const gameNode = GameUtils.isMicroSite(gameConfiguration) ? await this.createRemoteIconNode(id) : await this.createIconNode(id);
        if (this.gameContent.children.length > 0) {
            cc.log(`game id ${id} ---- load DUPLICATE --------------`);
            return;
        }
        if (gameNode) {
            this.hideSkeleton();
            this.gameContent?.addChild(gameNode);
            this.newTag && (this.newTag.active = this.lobbyMenuConfig.isNewGame(id, categoryIndex));
            this.setGameTypeLabel(id);
        }
    }

    protected updateNewTag(id: number, categoryIndex: number): void {
        if (this.newTag) {
            this.newTag.active = this.lobbyMenuConfig.isNewGame(id, categoryIndex);
        }
    }

    protected hideSkeleton() {
        this.lightTop && (this.lightTop.active = false);
        this.skeletonLoading && (this.skeletonLoading.active = false);
    }
}
