import AnalyticsManager, { TrackingAction, TrackingEvent } from "../../../analytics/AnalyticsManager";
import { lazyInject } from "../../../Application";
import AudioManager from "../../../common/audio/AudioManager";
import GameUtils from "../../../common/GameUtils";
import { userManager } from "../../../common/user/UserManager";
import { appManager } from "../../../managers/AppManager";
import { uiManager } from "../../../managers/GameUIManager";
import { UrlInfo } from "../../../managers/UrlInfo";
import PopupMinigames from "../../../mini-games-panel/view-models/popup/PopupMinigames";
import GameIconMenu from "./GameIconMenu";
import LobbyMenuConfig from "./LobbyMenuConfig";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CircleMenu extends GameIconMenu {
    @property(cc.Node)
    miniMenu: cc.Node = null;

    @property(cc.Prefab)
    skeletonPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    homeIcon: cc.Prefab = null;

    @lazyInject(LobbyMenuConfig)
    private readonly lobbyMenuConfig: LobbyMenuConfig;

    onLoad() {
        super.onLoad();
        AnalyticsManager.Instance.trackEvent(TrackingEvent.Button, {
            location: cc.director.getScene().name,
            action: TrackingAction.Show,
            object_name: "MiniPanel"
        });
    }

    getList() {
        const list = this.lobbyMenuConfig.miniList;
        return list.filter((i) => i === 0 || userManager.offerGames.some((j) => j === i));
    }

    loadPrefab(gameId: number): Promise<cc.Prefab> {
        return Promise.resolve(gameId === 0 ? this.homeIcon : this.skeletonPrefab);
    }

    protected async updateGameName(gameId: number, node: cc.Node) {
        if (gameId === 0) {
            return;
        }
        try {
            const gameNameNode = node.getChildByName("game_name");
            const label = gameNameNode.getComponent(cc.Label);
            const text = await GameUtils.getDisplayGameName(gameId);
            label.string = text.toUpperCase();
        } catch (e) {
            console.warn(e);
        }
    }

    async loadGameIcon(gameId: number, node: cc.Node) {
        if (gameId === 0) {
            return;
        }
        try {
            let prefab: cc.Prefab;
            if (uiManager.prefabCache.miniPanelIcons[gameId]) {
                prefab = uiManager.prefabCache.miniPanelIcons[gameId];
            } else {
                prefab = await GameUtils.asyncExecute(this?.node, GameUtils.loadMiniPanelGameIcon(gameId));
                uiManager.prefabCache.miniPanelIcons[gameId] = prefab;
            }
            node?.addChild(cc.instantiate(prefab));
            node.children[0].active = false;
        } catch (e) {
            console.warn(e);
        }
    }

    addItem(id: number, prefab: cc.Prefab): cc.Node {
        if (!prefab || (id === 0 && appManager.isDirectMode && !appManager.urlInfo[UrlInfo.ReturnUrl])) {
            return null;
        }
        const node = cc.instantiate(prefab);
        node.scale = 0.68;
        this.content?.addChild(node);
        this.updateGameName(id, node);
        this.loadGameIcon(id, node);

        const hoverScale = node.getComponent("hoverScale");
        if (hoverScale) {
            hoverScale.pressedScale = 0.72;
        }
        return node;
    }

    onInitialized() {
        const count = this.content.childrenCount;
        const radius = this.content.width * 0.35;
        const degree = 360 / count;
        this.content.children.forEach((child, index) => {
            const angle = degree * index;
            child.position = cc.v3(radius * Math.sin(cc.misc.degreesToRadians(angle)), radius * Math.cos(cc.misc.degreesToRadians(angle)));
        });
    }

    itemPressed(id: number, node: cc.Node) {
        AudioManager.getInstance().playClick();
        if (id === 0) {
            this.closeGame();
        } else {
            GameUtils.clearGameSetting(id);
            GameUtils.unCacheAndHideGameLoading(uiManager.getCurrentGameId());
            GameUtils.openGame(id, this.miniPanel);
            AnalyticsManager.Instance.trackEvent(TrackingEvent.Button, {
                location: cc.director.getScene().name,
                action: TrackingAction.Click,
                object_name: "MiniPanel",
                game_name: GameUtils.getGameNameString(id)
            });
        }
    }

    closeGame() {
        const lobbySceneName = "Lobby";

        const currentScene = cc.director.getScene().name;
        if (currentScene === lobbySceneName) {
            this.miniMenu.getComponent(PopupMinigames).hideListGame();
        } else if (currentScene === "dummy_room") {
            appManager.currentScene.goToLobbyScene();
        } else {
            appManager.currentScene.onCloseGameClick();
        }
    }
}
