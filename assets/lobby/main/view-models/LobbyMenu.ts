import { lazyInject } from "../../../Application";
import AudioManager from "../../../common/audio/AudioManager";
import * as SessionManager from "../../../common/auth/SessionManager";
import GameUtils from "../../../common/GameUtils";
import { FormationHandler } from "../../../common/i18n/FormationHandler";
import { userManager } from "../../../common/user/UserManager";
import { appManager } from "../../../managers/AppManager";
import { uiManager } from "../../../managers/GameUIManager";
import { StorageManager } from "../../../managers/StorageManager";
import GameIconMenu from "./GameIconMenu";
import LobbyManager from "./LobbyManager";
import LobbyMenuConfig from "./LobbyMenuConfig";
import { lobbyResourceManager } from "./LobbyResourceManager";
import SkeletonIcon from "./SkeletonIcon";
import { themeResourceLoader } from "./theme/ResourceLoader";
import { DEFAULT_THEME_LOCAL_PATH } from "./theme/ThemeManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LobbyMenu extends GameIconMenu {
    @property
    spacing = 24;

    currentColumn: cc.Node = null;
    currentRow: cc.Node = null;
    rowChildrenCount = 0;
    currentCategory = -1;
    public skipLoadHiddenIcons = false;
    formatGameName = FormationHandler.UPPER;

    @lazyInject(LobbyMenuConfig)
    private readonly lobbyMenuConfig: LobbyMenuConfig;

    private loadingTimePoint = 0;

    onLoad() {
        //override super
    }

    updateSpacing(spacing: number) {
        this.spacing = spacing;
    }

    loadHiddenIcons() {
        this.handleLoadHiddenIcons();
    }

    private splitWhenever<T>(filter: (element: T) => boolean, list: T[]) {
        const result = [];
        let current = [];

        for (let i = 0; i < list.length; i = i + 1) {
            if (!filter(list[i])) {
                current.push(list[i]);
            } else {
                result.push([list[i]]);
            }

            if (((i < list.length - 1 && filter(list[i + 1])) || i === list.length - 1) && current.length > 0) {
                result.push(current);
                current = [];
            }
        }

        return result;
    }

    private getNextArea(index: number, list: number[][], needNext: (games: number[]) => boolean) {
        if (list.length - 1 <= index) {
            return [];
        } else if (needNext(list[index + 1])) {
            return this.getNextArea(index + 1, list, needNext);
        } else {
            return list[index + 1];
        }
    }

    private arrangeGames(games: number[][]) {
        const hasBigSize = (list: number[]) => list && list.length === 1 && this.isBigSize(list[0]);
        const result = [];

        for (let index = 0; index < games.length; index++) {
            const gameIds = games[index];
            const passed = hasBigSize(gameIds) || gameIds.length % 2 === 0 || index === games.length - 1;

            if (!passed) {
                const nextGames = this.getNextArea(index, games, hasBigSize);

                if (nextGames.length !== 0) {
                    const ids = nextGames.splice(0, 1);

                    gameIds.push(...ids);
                } else {
                    const ids = gameIds.splice(gameIds.length - 1, 1);

                    games[games.length - 1].push(...ids);
                }
            }

            result.push(...gameIds);
        }

        return result;
    }

    private isBigSize(id: number) {
        return this.lobbyMenuConfig.isBigSize(id, this.currentCategory);
    }

    getList() {
        const games = this.getListGamesFromCurrentCategory();
        const splittedGames = this.splitWhenever(this.isBigSize.bind(this), games);

        return this.arrangeGames(splittedGames);
    }

    getListGamesFromCurrentCategory() {
        const list = LobbyManager.getInstance().getGameIdsByCategoryIndex(this.currentCategory);
        return list?.filter((i) => userManager.offerGames.some((j) => j === i)) ?? [];
    }

    onItemsChanged() {
        cc.log("LobbyMenu onItemsChanged");
        this.loadHiddenIcons();
    }

    onInitialized() {
        const layout = this.content.getComponent(cc.Layout);
        layout.updateLayout();
        if (!this.skipLoadHiddenIcons) {
            this.loadHiddenIcons();
        }
    }

    addItem(id: number, prefab: cc.Prefab): cc.Node {
        const iconNode = this.createIconNode(id, prefab);
        const isBigSize = this.isBigSize(id);

        if (!this.isAlive()) {
            return null;
        }

        if (!this.currentColumn || isBigSize) {
            this.createNewColumn();
        }

        this.handleNewRow(iconNode);

        if ((this.currentColumn.childrenCount === 2 && !this.currentRow) || isBigSize) {
            this.currentColumn = null;
            this.clearRow();
        }
        iconNode.name = `${id}`;
        return iconNode;
    }

    loadPrefab(gameId: number): Promise<cc.Prefab> {
        let skeletonIconPath = "";
        const isBigSize = this.lobbyMenuConfig.isBigSize(gameId, this.currentCategory);
        if (lobbyResourceManager?.hasCurrencyGroup()) {
            skeletonIconPath = isBigSize ? `skeleton-icon/icon-big` : `skeleton-icon/icon-small`;

            return themeResourceLoader?.loadPrefab(skeletonIconPath);
        }

        const folder = `${DEFAULT_THEME_LOCAL_PATH}/prefabs/skeleton-icon`;
        skeletonIconPath = isBigSize ? `${folder}/icon-big` : `${folder}/icon-small`;

        return GameUtils.loadResource(skeletonIconPath);
    }

    private createIconNode(gameId: number, prefab: cc.Prefab) {
        const gameIconIndex = this.getList().findIndex((id) => id === gameId);

        const iconNode = cc.instantiate(prefab);
        const skeletonIconComponent = iconNode.getComponent(SkeletonIcon);

        this.lateUpdateGameName(skeletonIconComponent, gameId);
        const addListIconObscure = (icon: SkeletonIcon) => {
            this.listIconObscure.push(icon);
        };

        skeletonIconComponent.setGameContent(gameId, gameIconIndex, this.currentCategory, addListIconObscure);

        return iconNode;
    }

    async handleLoadHiddenIcons() {
        const currentTimePoint = Date.now();
        this.loadingTimePoint = currentTimePoint;
        cc.log("---------handleLoadHiddenIcons---------- ", currentTimePoint);

        for (const icon of this.listIconObscure) {
            if (uiManager.isPauseLoadingIcons || this.loadingTimePoint !== currentTimePoint) {
                cc.log("Stop loading icons --------- ", currentTimePoint);
                break;
            }

            try {
                const idGame = +icon.node.name;

                await icon.loadAnimation(idGame);
                cc.log(`Loaded game icon: ${idGame} - ${currentTimePoint}`);
            } catch (e) {
                cc.log(`Cannot load game icon game`, e);
            }
        }
    }

    async lateUpdateGameName(icon: SkeletonIcon, gameId: number) {
        const gameName = await GameUtils.getDisplayGameName(gameId, true);
        try {
            icon.setGameName(gameName, gameId, this.formatGameName);
        } catch (e) {
            cc.warn("Catch error after await method", e.message);
        }
    }

    clearRow() {
        this.rowChildrenCount = 0;
        this.currentRow = null;
    }

    createNewColumn() {
        const node = new cc.Node();
        node.anchorY = 1;
        node.name = "col";
        const layout = node.addComponent(cc.Layout);
        layout.type = cc.Layout.Type.VERTICAL;
        layout.resizeMode = cc.Layout.ResizeMode.CONTAINER;
        layout.spacingY = this.spacing;

        this.content.addChild(node);
        this.currentColumn = node;
        node.on(cc.Node.EventType.CHILD_ADDED, () => (node.width = node.children[0].width));
    }

    createNewRow() {
        const node = new cc.Node();
        node.name = "row";
        const layout = node.addComponent(cc.Layout);
        layout.type = cc.Layout.Type.HORIZONTAL;
        layout.resizeMode = cc.Layout.ResizeMode.CONTAINER;
        layout.spacingX = this.spacing;

        node.on(cc.Node.EventType.CHILD_ADDED, () => (node.height = node.children[0].height));

        this.currentColumn.addChild(node);
        this.currentRow = node;
    }

    handleNewRow(iconNode: cc.Node) {
        if (this.rowChildrenCount > 0) {
            if (!this.currentRow) {
                this.createNewRow();
            }
            this.currentRow.addChild(iconNode);

            if (this.currentRow.childrenCount === this.rowChildrenCount) {
                this.clearRow();
            }
        } else {
            this.currentColumn.addChild(iconNode);
        }
    }

    saveCategory() {
        StorageManager.set("current_game_category", this.currentCategory);
    }

    loadCategory() {
        const category = StorageManager.get("current_game_category");
        if (category) {
            this.currentCategory = parseInt(category) || 0;
        }
    }

    setCategory(category: number, isUpdateIcons = true) {
        if (this.currentCategory === category) {
            return;
        }
        this.currentCategory = category;
        this.saveCategory();
        !!isUpdateIcons && this.updateIcons();
    }

    updateIcons() {
        this.content.destroyAllChildren();
        this.currentColumn = null;
        this.initItems();
    }

    itemPressed(id: number, node: cc.Node) {
        AudioManager.getInstance().playClick();
        appManager.isDirectMode = false;
        GameUtils.clearGameSetting(id);
        GameUtils.unCacheAndHideGameLoading(uiManager.getCurrentGameId());
        uiManager.setCurrentGameId(id);
        SessionManager.clearStorageMicroSite(true);
        const skeletonComp = node.getComponent(SkeletonIcon);
        uiManager.cacheIconLoading(id, skeletonComp.gameLoading);
        GameUtils.openGame(id, this.miniPanel, null, true);
    }
}
