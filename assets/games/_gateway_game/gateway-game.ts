import { Socket } from "socket.io-client";
import { lazyInject } from "../../Application";
import AudioManager from "../../common/audio/AudioManager";
import MusicPlayer from "../../common/audio/MusicPlayer";
import * as sessionManager from "../../common/auth/SessionManager";
import BaseComponent from "../../common/BaseComponent";
import CategoryController from "../../common/category/category-controller";
import { CategoryEvent } from "../../common/category/category-events";
import CategoryItem from "../../common/category/category-item";
import GameUtils from "../../common/GameUtils";
import { buildSharedResourceUrl } from "../../common/helpers/UrlHelper";
import InGameMenu, { InGameMenuEvents } from "../../common/in-game-menu/InGameMenu";
import UserProfile from "../../common/user-profile/UserProfile";
import { userManager } from "../../common/user/UserManager";
import { getGameName, isGatewayGame } from "../../configs/GameConfigurations";
import { appManager } from "../../managers/AppManager";
import { uiManager } from "../../managers/GameUIManager";
import { InternalEvents } from "../../managers/InternalEvents";
import SocketIOController from "../../SocketIOController";
import { loadUserData } from "../_base/action/GameRoomActions";
import GatewayGameItem from "./gateway-game-item";
import { Durations } from "./models/durations-interface";
const { ccclass, property } = cc._decorator;

type CategoryJson = { [key: string]: string[] };
type DurationsJson = { [key: string]: { ids?: number[]; value: Durations } };
type ServiceNameJson = { [key: string]: { ids?: number[]; value: string } };
interface GameConfigJson {
    gameId: number;
    games: CategoryJson;
    receivedEvents: string[];
    serviceName: ServiceNameJson;
    durations: DurationsJson;
}

const DEFAULT_PATH_CONFIG_GATEWAY = "gateway/102/info.json";

@ccclass
export default class GatewayGame extends BaseComponent {
    @property
    protected gameId = 0;

    @property(cc.Prefab)
    protected gamePrefab: cc.Prefab = null;

    @property(cc.Node)
    protected container: cc.Node = null;

    @property(cc.Node)
    loading: cc.Node = null;

    @lazyInject(SocketIOController)
    protected readonly socketIOController: SocketIOController;

    protected configs: GameConfigJson = null;
    protected socket: Socket;
    protected gameIds: number[] = [];
    protected receivedEvents: string[] = [];
    protected categoryJson: CategoryJson;
    protected serviceNameJson: ServiceNameJson;
    protected durationsJson: DurationsJson;
    protected inGameMenu: InGameMenu;
    protected userProfile: UserProfile;

    public get gameName() {
        return getGameName(this.gameId);
    }
    protected readonly CategoryFilter = "category-filter";

    async onLoad() {
        //for room game
        appManager.currentScene = this;
        sessionManager.storeInRoomGameId(this.gameId);

        this.ensureEnableMusicPlayer();
        this.loadUserData();
        try {
            await this.getGatewayConfig();
            this.loadConfigs();

            if (this.checkReloadOpenedGame()) {
                return;
            }

            this.initSocket();
            this.initItems();
            this.initEventForInGameMenu();
            cc.game.on(cc.game.EVENT_HIDE, this.onGameHide, this);
            cc.game.on(cc.game.EVENT_SHOW, this.onGameShow, this);

            uiManager.emitterListener(InternalEvents.GATEWAY_OPEN_GAME, this.handleOpenGame.bind(this), this);
        } catch (e) {}
    }

    async getGatewayConfig() {
        try {
            const configUrl = buildSharedResourceUrl(`${DEFAULT_PATH_CONFIG_GATEWAY}?v=${Date.now()}`);
            const jsonAsset = await GameUtils.loadRemote<cc.JsonAsset>(configUrl);
            this.configs = (jsonAsset?.json as GameConfigJson) ?? null;
        } catch (error) {
            cc.log("Get Gateway config failed!");
        }
    }

    checkReloadOpenedGame() {
        const roomGameId = +sessionManager.getInRoomGameId();
        cc.log("checkReloadOpenedGame id", roomGameId);
        if (this.gameIds.includes(roomGameId)) {
            this.scheduleOnce(() => this.handleOpenGame(roomGameId), 0.1);
            return true;
        }
        return false;
    }

    private ensureEnableMusicPlayer() {
        MusicPlayer.getInstance().init();
    }

    loadUserData() {
        this.userProfile = this.getComponentInChildren(UserProfile);
        if (this.userProfile) {
            loadUserData(this)(userManager.user);
        }
    }

    loadConfigs() {
        const configs = this.configs;
        this.gameIds = Object.keys(configs.games)
            .map((key) => +key)
            .filter((gameId) => userManager.offerGamesIncludeSubGames.includes(gameId) && isGatewayGame(gameId));
        this.receivedEvents = configs.receivedEvents;
        this.categoryJson = configs.games;
        this.serviceNameJson = configs.serviceName;
        this.durationsJson = configs.durations;
    }

    initSocket() {
        this.socket = this.socketIOController.getSocketGame(this.gameId);
        if (this.socket) {
            this.initSocketListeners();
        }
    }
    getServiceName(gameId: number) {
        const type = Object.keys(this.serviceNameJson).find((key) => this.serviceNameJson[key].ids?.includes(gameId)) ?? "default";
        return this.serviceNameJson[type].value;
    }

    getDurations(gameId: number) {
        const type = Object.keys(this.durationsJson).find((key) => this.durationsJson[key].ids?.includes(gameId)) ?? "default";
        return this.durationsJson[type].value;
    }

    forceSignIn() {
        this.container.children.forEach((child) => {
            const item = child.getComponent(GatewayGameItem);
            item.resetGameData();
            item.sendSignIn();
        });
    }

    initItems() {
        let allCatogories = [];
        this.gameIds.forEach((gameId) => {
            const node = cc.instantiate(this.gamePrefab);
            this.container.addChild(node);

            const item = node.getComponent(GatewayGameItem);
            const serviceName = this.getServiceName(gameId);
            const durations = this.getDurations(gameId);
            item.init({ gameId, serviceName, durations, socket: this.socket });
            item.setReceiveEvents(this.receivedEvents);

            const categories = this.getCategory(gameId);
            allCatogories.push(...categories);
            categories.forEach((category) => {
                const comp = item.addComponent(CategoryItem);
                comp.category = category;
            });
        });

        allCatogories = allCatogories.filter(
            (iterator, index, categories) => categories?.findIndex((category) => category === iterator) === index
        );

        const comp = this.getComponentInChildren(CategoryController);
        if (comp) {
            const data = GameUtils.getSpecificGameSetting(this.GatewayGameSetting);
            const savedFilter = data[this.CategoryFilter] ?? [];
            comp.node.on(CategoryEvent.Changed, this.saveCategoryFilter, this);
            comp.initCategories(allCatogories, savedFilter);
        }
    }

    get GatewayGameSetting() {
        return `gateway-${this.gameId}`;
    }

    saveCategoryFilter(categories: string[]) {
        const data = GameUtils.getSpecificGameSetting(this.GatewayGameSetting);
        data[this.CategoryFilter] = categories;
        GameUtils.setSpecificGameSetting(this.GatewayGameSetting, data);
    }

    getCategory(gameId: number) {
        return this.categoryJson[gameId];
    }

    initSocketListeners() {
        this.socket.off("message");
        this.socket.on("disconnect", this.onDisconnected.bind(this));
    }

    onDisconnected() {
        this.goToLobbyScene();
    }

    closeGame() {
        if (!this.isAlive()) {
            return;
        }
        this.removeSocketListeners();
    }

    private goToLobbyScene() {
        this.loading.active = true;
        this.closeGame();
        appManager.redirectToLobby();
    }

    initEventForInGameMenu() {
        const inGameMenu = cc.director.getScene().getComponentInChildren(InGameMenu);
        if (inGameMenu) {
            this.inGameMenu = inGameMenu;
            const node = inGameMenu.node;
            node.on(InGameMenuEvents.OPEN_HISTORY, this.openHistory, this);
            node.on(InGameMenuEvents.OPEN_GUIDE, this.openGuide, this);
            node.on(InGameMenuEvents.GO_TO_LOBBY, this.goToLobbyScene, this);
        }
    }

    openHistory() {
        AudioManager.getInstance().playClick();
    }

    openGuide() {
        AudioManager.getInstance().playClick();
    }

    onDestroy() {
        cc.log("on destroy gateway game ", this.gameId);
        cc.game.off(cc.game.EVENT_HIDE, this.onGameHide, this);
        cc.game.off(cc.game.EVENT_SHOW, this.onGameShow, this);
        appManager.currentScene = null;
        sessionManager.removeInRoomGameId();
        this.removeSocketListeners();
        uiManager.removeListenersWithTarget(this);
    }

    private removeSocketListeners() {
        if (!this.socket) {
            return;
        }

        this.socket.removeAllListeners();
        this.container?.children?.forEach((child) => {
            const item = child.getComponent(GatewayGameItem);
            item.removeSocketListeners();
        });

        this.socketIOController.closeSocket(this.gameId);
        this.socket.disconnect();
        this.socket = null;
    }

    protected onGameHide() {
        //empty
    }

    protected onGameShow() {
        this.forceSignIn();
    }

    outRoomGame() {
        this.closeGame();
    }

    handleOpenGame(gameId) {
        GameUtils.openGame(gameId, null, null, false);
    }
}
