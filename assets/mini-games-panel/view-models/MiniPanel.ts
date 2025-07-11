import { BundleManager } from "bundle-management";
import * as i18n from "i18n/runtime-scripts/LanguageData";

import { lazyInject } from "../../Application";
import SocketIOController from "../../SocketIOController";
import BaseComponent from "../../common/BaseComponent";
import GameUtils from "../../common/GameUtils";
import LoadWebView from "../../common/LoadWebView";
import AudioManager from "../../common/audio/AudioManager";
import NotificationService from "../../common/auth/NotificationService";
import { removeInRoomGameId } from "../../common/auth/SessionManager";
import UserService from "../../common/auth/UserService";
import { isSessionTimeoutError } from "../../common/helpers/ErrorCodeHelper";
import { numberWithCommas } from "../../common/helpers/NumberHelper";
import Loading from "../../common/loading/view-models/Loading";
import Notice, { NoticeData } from "../../common/notice/view-models/Notice";
import ScaleActiveController from "../../common/scale-active-item/ScaleActiveController";
import NoticeUtil from "../../common/utils/NoticeUtil";
import { getGameId, isMiniGame, isMiniGameByGameId, isUsingRemoteBundle } from "../../configs/GameConfigurations";
// Removed lobby imports - creating stub implementations
import { appManager } from "../../managers/AppManager";
import { uiManager } from "../../managers/GameUIManager";
import { InternalEvents } from "../../managers/InternalEvents";
import { UrlInfo } from "../../managers/UrlInfo";
import * as authManager from "./../../common/auth/AuthManager";
import { showMessageForExpiredToken } from "./../../common/auth/AuthManager";
import MiniPanelDataHandlers from "./MiniPanelDataHandlers";
import MiniPanelInterface from "./MiniPanelInterface";
import MiniPanelMiniGameInitializers from "./MiniPanelMiniGameInitializers";
import MiniPanelSocketIOGameInitializers from "./MiniPanelSocketIOGameInitializers";
import PopupMinigames from "./popup/PopupMinigames";
// Removed lobby promotion imports - creating stub implementations
import LobbyDialogManager from "../../managers/LobbyDialogManager";

// Stub implementations for lobby functionality
class CircleMenu {
    // Stub implementation
}

class LobbyResourceManager {
    static lobbyResourceManager = {
        // Stub implementation
    };
}

class ResourceLoader {
    static themeResourceLoader = {
        // Stub implementation
    };
}

class BoostedOdds {
    // Stub implementation
}

class PromotionAnnouncements {
    // Stub implementation
}

class PromotionNotificationsHandler {
    static PromotionNotificationsEvent = {
        // Stub implementation
    };
}

class PromotionTournamentHandler {
    static PromotionTournamentEvents = {
        // Stub implementation
    };
    static promotionTournamentHandler = {
        // Stub implementation
    };
}

class Promotions {
    static PromotionsEvent = {
        // Stub implementation
    };
}

class FreeSpinsPromotionHandler {
    static FreeSpinsPromotionEvents = {
        // Stub implementation
    };
    static freeSpinsPromotionHandler = {
        // Stub implementation
    };
}

// Export stub implementations
export {
    CircleMenu, LobbyResourceManager, ResourceLoader, BoostedOdds, PromotionAnnouncements,
    PromotionNotificationsHandler, PromotionTournamentHandler, Promotions, FreeSpinsPromotionHandler
};

console.log("[MiniPanel] Loading MiniPanel module...");

type NewLayerCallback = () => void;

const { ccclass, property } = cc._decorator;
@ccclass
export default class MiniPanel extends BaseComponent implements MiniPanelInterface {
    @property(cc.BitmapFont)
    fontCong: cc.BitmapFont = null;

    @property(cc.BitmapFont)
    fontTru: cc.BitmapFont = null;

    @property(cc.Node)
    miniGames: cc.Node = null;

    @property(cc.Node)
    miniMenu: cc.Node = null;

    @property(cc.Node)
    dialog: cc.Node = null;

    @property(cc.Node)
    effectNode: cc.Node = null;

    @property(cc.Prefab)
    loadingPrefab: cc.Prefab = null;

    @property(cc.Node)
    noticeContainer: cc.Node = null;

    @property(cc.Node)
    guideContainer: cc.Node = null;

    @property(ScaleActiveController)
    activeController: ScaleActiveController = null;

    @property(cc.Node)
    promotionContainer: cc.Node = null;

    public popupMiniGame: PopupMinigames;
    public loading: Loading;
    public dataHandlers: MiniPanelDataHandlers;
    public currentGameRoomId: number;
    public skipShowApiErrorGameIds: number[] = [];
    public gameMiniInitializers: MiniPanelMiniGameInitializers;
    public socketIOGameInitializers: MiniPanelSocketIOGameInitializers;
    public noticePrefab: cc.Prefab = null;

    private miniGamesCache = {};
    private newLayerCallbacks = {};
    public chartsWebView = {};
    private readonly kickedOutKey = "kickedOut";
    private readonly reloadKey = "reload";
    private readonly authKey = "auth";
    private promotionAnnouncementPrefab: cc.Prefab;
    private promotionTournamentPrefab: cc.Prefab;
    private freeSpinsPromotionPrefab: cc.Prefab;
    public boostedOdds: BoostedOdds;
    public promotionAnnouncement: PromotionAnnouncements;
    private readonly preloadFolderPercent = 25;
    private readonly preloadOthersPercent = 30;

    @lazyInject(SocketIOController)
    public readonly socketIOController: SocketIOController;

    addNewLayerCallback(key: string, callback: NewLayerCallback) {
        console.log("[MiniPanel] Adding new layer callback for key:", key);
        this.newLayerCallbacks[key] = callback;
    }

    removeNewLayerCallback(key: string) {
        console.log("[MiniPanel] Removing new layer callback for key:", key);
        delete this.newLayerCallbacks[key];
    }

    removeChartsWebView(key: string) {
        console.log("[MiniPanel] Removing charts web view for key:", key);
        delete this.chartsWebView[key];
    }

    onGamesLayerChanged() {
        console.log("[MiniPanel] Games layer changed, executing callbacks");
        Object.values(this.newLayerCallbacks).forEach((callback: NewLayerCallback) => callback());
    }

    onLoad() {
        console.log("[MiniPanel] MiniPanel onLoad started");
        appManager.font.increaseMoney = this.fontCong;
        appManager.font.decreaseMoney = this.fontTru;
        console.log("[MiniPanel] Fonts configured");

        const loadingNode = cc.instantiate(this.loadingPrefab);
        this.loading = loadingNode.getComponent("Loading") as Loading;
        loadingNode.active = false;
        this.node?.addChild(loadingNode);
        console.log("[MiniPanel] Loading component initialized");

        this.dataHandlers = new MiniPanelDataHandlers(this);
        this.gameMiniInitializers = new MiniPanelMiniGameInitializers(this);
        this.socketIOGameInitializers = new MiniPanelSocketIOGameInitializers(this);
        console.log("[MiniPanel] Data handlers and initializers created");

        // this.initPopUpMiniGames();
        this.registerPromotionEvents();
        console.log("[MiniPanel] Promotion events registered");

        // this.miniGames.on(cc.Node.EventType.CHILD_ADDED, this.onGamesLayerChanged.bind(this));
        // this.miniGames.on(cc.Node.EventType.CHILD_REMOVED, this.onGamesLayerChanged.bind(this));
        // this.miniGames.on(cc.Node.EventType.CHILD_REORDER, this.onGamesLayerChanged.bind(this));
        this.noticeContainer.on(cc.Node.EventType.CHILD_ADDED, this.onGamesLayerChanged.bind(this));
        this.noticeContainer.on(cc.Node.EventType.CHILD_REMOVED, this.onGamesLayerChanged.bind(this));
        this.guideContainer.on(cc.Node.EventType.CHILD_ADDED, this.onGamesLayerChanged.bind(this));
        this.guideContainer.on(cc.Node.EventType.CHILD_REMOVED, this.onGamesLayerChanged.bind(this));
        this.dialog.on(cc.Node.EventType.CHILD_ADDED, this.onGamesLayerChanged.bind(this));
        this.dialog.on(cc.Node.EventType.CHILD_REMOVED, this.onGamesLayerChanged.bind(this));
        console.log("[MiniPanel] Event listeners registered");

        NotificationService.getInstance().addDataObserver(this.kickedOutKey, this.kickedOutKey, (data) =>
            this.dataHandlers.handleDataKickedOut(data)
        );
        NotificationService.getInstance().addDataObserver(this.authKey, this.authKey, (data) => this.dataHandlers.handleAuth(data));
        NotificationService.getInstance().addDataObserver(this.reloadKey, this.reloadKey, this.onForceReload.bind(this));
        console.log("[MiniPanel] Notification service observers added");

        uiManager.emitterListener(InternalEvents.MINI_PANEL_GAME_UM, this.handleUmMessage.bind(this), this);
        uiManager.emitterListener(InternalEvents.MINI_PANEL_GAME_CONNECT_FAILED, this.onConnectSocketFailed.bind(this), this);
        uiManager.emitterListener(InternalEvents.MINI_PANEL_OPEN_TABLE_GAME, this.openNewSocketTableGame.bind(this), this);
        uiManager.emitterListener(InternalEvents.MINI_PANEL_OPEN_MINI_GAME, this.openNewSocketMiniGame.bind(this), this);
        uiManager.emitterListener(InternalEvents.LOADING_GAME, this.updateLoadingGameProgress.bind(this), this);
        console.log("[MiniPanel] UI manager event listeners registered");
        console.log("[MiniPanel] MiniPanel onLoad completed");
    }

    updateLoadingGameProgress(data: { gameId; progress; total }) {
        console.log("[MiniPanel] Updating loading game progress:", data);
        const { gameId, progress, total } = data;
        const loading = this.getGameLoadingComp(gameId);
        if (loading) {
            loading.onProgress(progress, total);
            console.log("[MiniPanel] Loading progress updated for game:", gameId, "progress:", progress, "/", total);
        } else {
            console.warn("[MiniPanel] Loading component not found for game:", gameId);
        }
    }

    onDestroy() {
        console.log("[MiniPanel] MiniPanel onDestroy called");
        NotificationService.getInstance().removeDataObserver(this.kickedOutKey, this.kickedOutKey);
        NotificationService.getInstance().removeDataObserver(this.authKey, this.authKey);
        NotificationService.getInstance().removeDataObserver(this.reloadKey, this.reloadKey);
        uiManager.removeListenersWithTarget(this);
        console.log("[MiniPanel] MiniPanel destroyed successfully");
    }

    async initPopUpMiniGames() {
        console.log("[MiniPanel] Initializing popup mini games...");
        if (!this.miniMenu) {
            console.warn("[MiniPanel] Mini menu not available");
            return;
        }

        try {
            const prefab = await GameUtils.loadResource(`minipanel/popup-mini-game/PopUpMiniGame`);
            console.log("[MiniPanel] Popup mini game prefab loaded");
            const popUpMiniGameNode = cc.instantiate(prefab);
            this.popupMiniGame = popUpMiniGameNode.getComponent(PopupMinigames);
            if (this.popupMiniGame) {
                const backgroundPopUpMiniGameNode = this.miniMenu.getChildByName("frame");
                const clickEventHandler = new cc.Component.EventHandler();
                clickEventHandler.target = popUpMiniGameNode;
                clickEventHandler.component = "PopupMinigames";
                clickEventHandler.handler = "toggle";
                backgroundPopUpMiniGameNode.getComponent(cc.Button).clickEvents.push(clickEventHandler);
                this.popupMiniGame.background = backgroundPopUpMiniGameNode;
                this.popupMiniGame.background.opacity = 0;
                console.log("[MiniPanel] Popup mini game component configured");
            }
            const gameMenu = popUpMiniGameNode.getChildByName("list")?.getComponent("CircleMenu");
            if (gameMenu && (gameMenu as any).miniPanel !== undefined) {
                (gameMenu as any).miniPanel = this;
            }
            this.miniMenu?.addChild(popUpMiniGameNode);
        } catch (err) {
            cc.warn("Failed to init mini game icons - " + err);
        }
    }

    registerPromotionEvents() {
        console.log("[MiniPanel] Registering promotion events...");
        // Promotion events removed - no longer needed without lobby
        console.log("[MiniPanel] Promotion events registration skipped");
    }

    async createPromotionTournamentPrefab() {
        const key = "promotionTournament";
        if (!uiManager.prefabCache.miniPanelIcons[key]) {
            this.promotionTournamentPrefab = await GameUtils.asyncExecute<cc.Prefab>(
                this.node,
                GameUtils.loadResource("promotion-tournament/views/PromotionTournamentWebView")
            );
            uiManager.prefabCache.miniPanelIcons[key] = this.promotionTournamentPrefab;
        } else {
            this.promotionTournamentPrefab = uiManager.prefabCache.miniPanelIcons[key];
        }
    }

    async createFreeSpinsPromotionPrefab() {
        const key = "freeSpinsPromotion";
        if (!uiManager.prefabCache.miniPanelIcons[key]) {
            this.freeSpinsPromotionPrefab = await GameUtils.asyncExecute<cc.Prefab>(
                this.node,
                GameUtils.loadResource("free-spins-promotion/views/FreeSpinsPromotionWebView")
            );
            uiManager.prefabCache.miniPanelIcons[key] = this.freeSpinsPromotionPrefab;
        } else {
            this.freeSpinsPromotionPrefab = uiManager.prefabCache.miniPanelIcons[key];
        }
    }
    async showPromotionTournament() {
        try {
            if (!this.promotionTournamentPrefab) {
                await this.createPromotionTournamentPrefab();
            }

            const node = cc.instantiate(this.promotionTournamentPrefab);
            this.addDialog(node);
        } catch (error) {
            cc.log("Failed to show Promotion Tournament dialog:", error);
        }
    }

    async showFreeSpinsPromotion() {
        try {
            if (!this.freeSpinsPromotionPrefab) {
                await this.createFreeSpinsPromotionPrefab();
            }

            const node = cc.instantiate(this.freeSpinsPromotionPrefab);
            this.addDialog(node);
        } catch (error) {
            cc.log("Failed to show Free Spins Promotion dialog:", error);
        }
    }

    async createBoostedOddsNode() {
        const boostedOddsPrefab = await GameUtils.loadResource(`boosted-odds/BoostedOdds`);
        try {
            const boostedOddsNode = cc.instantiate(boostedOddsPrefab);
            this.boostedOdds = boostedOddsNode.getComponent("BoostedOdds") as any;
            this.promotionContainer?.addChild(boostedOddsNode);
            this.updatePositionPromotionNode();
        } catch (error) {
            cc.warn("Failed to init boosted odds - " + error);
        }
    }

    updatePositionPromotionNode() {
        if (!this.popupMiniGame) {
            return;
        }
        const popupMiniGameNode = this.popupMiniGame?.node;
        const boostedOddsNode = (this.boostedOdds as any)?.node;
        const wPosition = popupMiniGameNode.convertToWorldSpaceAR(cc.v2(0, 0));
        const localPosition = boostedOddsNode?.parent?.convertToNodeSpaceAR(wPosition);
        boostedOddsNode.position = cc.v3(localPosition?.x, localPosition?.y);
    }

    async showBoostedOdds() {
        if (!this.boostedOdds) {
            await this.createBoostedOddsNode();
        }
        (this.boostedOdds as any)?.handleBoostedOdds();
    }

    onGeneralData(data: any) {
        if (!this.dataHandlers) {
            this.dataHandlers = new MiniPanelDataHandlers(this);
        }

        this.dataHandlers.handleData(data);
    }

    handleUmMessage(data, gameId) {
        this.setLoadingVisibility(false);
        const text = NoticeUtil.getMessageByLocale(data);
        if (text) {
            const noticeData = {
                text: text,
                isInfo: false
            } as NoticeData;
            this.showNotice(noticeData);
        }

        this.unCacheAndHideGameLoading(this.getGameLoadingComp(gameId), gameId);
        this.handleWhenNotJoinRoomGame(gameId);
    }

    handleWhenNotJoinRoomGame(gameId) {
        uiManager.isPauseLoadingIcons = false;
        uiManager.emitter.emit(InternalEvents.LOAD_OTHER_ICONS_AND_BANNERS);
    }

    redirectToResultPage(redirectUrl) {
        appManager.resultPage = window.open(redirectUrl, "", "width=700,height=500");
        if (appManager.resultPage) {
            appManager.resultPage.focus();
            window.onbeforeunload = function () {
                appManager.resultPage?.close();
            };
        }
    }

    openResultPage(gameId: number = undefined) {
        UserService.getGameResultUrl(gameId).then((url) => {
            this.redirectToResultPage(url);
        });
    }

    addMiniGame(game: any, gameId: number) {
        if (gameId === -1) {
            //lucky wheel, so add to dialogNode
            this.dialog?.removeAllChildren();
            this.addDialog(game.node);
        } else {
            this.miniGames && this.miniGames.addChild(game.node);
            this.miniGamesCache[gameId] = game;

            this.activeController.addItem(game.node);
        }
    }

    getGameMini(gameId): any {
        return this.miniGamesCache[gameId];
    }

    onSignIn() {
        Object.keys(this.miniGamesCache).forEach((key) => {
            const game = this.miniGamesCache[key];
            if (game && game.node && game.node.isValid) {
                game.onSignIn();
            }
        });
    }

    onForceReload(showNotice = true, message = i18n.t("messages.newUpdateAvailable"), gameId = -1) {
        const forceReload = () => {
            if (appManager.isDirectMode && appManager.urlInfo[UrlInfo.ReturnUrl]) {
                appManager.backToOperatorLobby();
            } else {
                if (gameId < 0 || !isMiniGameByGameId(gameId)) {
                    location.reload();
                }
            }
        };

        removeInRoomGameId();
        if (showNotice) {
            const noticeData = {
                text: message,
                isInfo: true
            } as NoticeData;
            this.showNotice(noticeData, forceReload, forceReload);
        } else {
            forceReload();
        }
    }

    forceKickedOut() {
        NotificationService.getInstance().forceKickedOut();
        authManager.signOut();
    }

    playClick() {
        AudioManager.getInstance().playClick();
    }

    openGame(e, id) {
        this.loadGame(id, () => {
            this.gameMiniInitializers?.openGame(id);
        });
    }

    openMiniContainerGame(id) {
        this.loadGame(id, () => {
            this.gameMiniInitializers?.openMiniContainerGame(id);
        });
    }

    openNewSocketMiniGame(e, id) {
        if (!this.node.activeInHierarchy) {
            return;
        }

        this.loadGame(id, () => {
            this.gameMiniInitializers?.openNewSocket(id);
            Object.values(this.chartsWebView).forEach((chartWebView: LoadWebView) => {
                chartWebView?.hideWebView();
            });
            uiManager.isPauseLoadingIcons = false;
        });
    }

    openNewSocketTableGame(event, gameId) {
        if (!this.node.activeInHierarchy) {
            return;
        }

        cc.log("openNewSocketTableGame ", gameId);

        this.loadGame(gameId, () => {
            this.socketIOGameInitializers?.openGame(gameId);
        });
    }

    loadGame(gameId, onComplete: () => void) {
        const loading = this.getGameLoadingComp(gameId);
        const language = window.i18n.curLang;

        if (isUsingRemoteBundle(gameId)) {
            const path = `i18n/images/${language}`;
            const preloadPath = `preload`;
            try {
                BundleManager.getInstance()
                    .loadBundle(`${gameId}`)
                    .then((bundle: cc.AssetManager.Bundle) => {
                        bundle.loadDir(
                            preloadPath,
                            (finish: number, total: number, item) => {
                                loading?.onProgressWithStartPercent(0, this.preloadFolderPercent, finish, total);
                            },
                            () => {
                                bundle.loadDir(
                                    path,
                                    cc.SpriteFrame,
                                    (finish: number, total: number, item) => {
                                        loading?.onProgressWithStartPercent(
                                            this.preloadFolderPercent,
                                            this.preloadOthersPercent,
                                            finish,
                                            total
                                        );
                                    },
                                    onComplete
                                );
                            }
                        );
                    })
                    .catch(onComplete);
            } catch (error) {
                cc.log("An error occurred during loadGame with remote bundle:", error);
            }
        } else {
            try {
                cc.resources.loadDir(
                    `image/${language}/${gameId}`,
                    cc.SpriteFrame,
                    (finish: number, total: number, item) => {
                        loading?.onProgressWithStartPercent(0, this.preloadOthersPercent, finish, total);
                    },
                    onComplete
                );
            } catch (error) {
                cc.log("An error occurred during loadGame:", error);
            }
        }
    }

    openSocketByUrl(gameId, socketUri, onConnectCallback) {
        const socket = this.socketIOController.createSocketByUrl(gameId, socketUri);
        this.socketIOController.initBaseListenersForSocketUrl(socket, gameId, this.onConnectSocketFailed.bind(this), onConnectCallback);
        this.socketIOGameInitializers.handleSocket(socket, gameId);
        return socket;
    }

    openGatewayGame(gameId, onConnectCallback) {
        const socket = this.socketIOController.createGatewayGameSocket(gameId);
        this.socketIOController.initBaseListenersForSocketUrl(socket, gameId, this.onConnectSocketFailed.bind(this), onConnectCallback);
        this.socketIOGameInitializers.handleSocket(socket, gameId);
        return socket;
    }

    loadGameRoom(name) {
        const gameId = getGameId(name);

        if (uiManager.getCurrentGameId() !== +gameId || isMiniGame(name)) {
            return;
        }

        const gameLoading = this.getGameLoadingComp(+gameId);

        cc.director.preloadScene(
            name,
            (completedCount, total, item) => {
                if (uiManager.getCurrentGameId() !== +gameId) {
                    this.unCacheAndHideGameLoading(gameLoading, +gameId);
                    return;
                }
                gameLoading?.onProgressWithStartPercent(this.preloadOthersPercent, 100, completedCount, total);
            },
            (error) => {
                this.unCacheAndHideGameLoading(gameLoading, +gameId);

                if (error) {
                    this.onForceReload();
                } else {
                    uiManager.getCurrentGameId() === +gameId && cc.director.loadScene(name);
                }
            }
        );
    }

    async createPromotionAnnouncementPrefab() {
        if (!uiManager.prefabCache.miniPanelIcons["promotionAnnouncements"]) {
            this.promotionAnnouncementPrefab = await GameUtils.asyncExecute<cc.Prefab>(
                this.node,
                GameUtils.loadResource("boosted-odds/PromotionAnnouncements")
            );
            uiManager.prefabCache.miniPanelIcons["promotionAnnouncements"] = this.promotionAnnouncementPrefab;
        } else {
            this.promotionAnnouncementPrefab = uiManager.prefabCache.miniPanelIcons["promotionAnnouncements"];
        }
    }

    async showPromotionAnnouncements() {
        if (!this.promotionAnnouncementPrefab) {
            await this.createPromotionAnnouncementPrefab();
        }

        const node = cc.instantiate(this.promotionAnnouncementPrefab);
        this.promotionAnnouncement = node.getComponent("PromotionAnnouncements") as any;
        if (this.promotionAnnouncement) {
            (this.promotionAnnouncement as any).miniPanel = this;
        }

        this.addDialog(node);
    }

    handleAPIError(error) {
        const errorCode = error.errorCode.toString();

        if (isSessionTimeoutError(errorCode)) {
            showMessageForExpiredToken(errorCode);
            return;
        }
        this.showErrorNotice(error);
    }

    async showErrorNotice(error): Promise<Notice> {
        let notice: Notice = null;
        if (!this.node.activeInHierarchy) {
            return null;
        }

        await this.initNoticePrefab();
        if (this.noticePrefab) {
            const node = cc.instantiate(this.noticePrefab);
            notice = node.getComponent(Notice);

            const gameName = GameUtils.getGameNameString(error.gameTypeId);
            const { minBet, maxBet, gameRoundId, errorCode } = error;
            const opt = { gameName, gameRoundId, errorCode, minBet: numberWithCommas(minBet), maxBet: numberWithCommas(maxBet) };
            const isPlaceBet = error.isPlaceBetFailed;
            const message = NoticeUtil.getLocalizedErrorMessage(errorCode, opt, isPlaceBet);

            notice.init({ text: message } as NoticeData);
            this.addNotice(node);
        }

        return notice;
    }

    addNotice(node: cc.Node) {
        this.noticeContainer?.addChild(node);
    }

    showGuide(guide: cc.Node) {
        this.guideContainer?.addChild(guide);
    }

    async showNotice(noticeData: NoticeData, handleClickButton: () => void = null, handleClose: () => void = null): Promise<void> {
        if (!this.node.activeInHierarchy) {
            return;
        }

        await this.initNoticePrefab();
        if (this.noticePrefab) {
            const node = cc.instantiate(this.noticePrefab);
            const notice = node.getComponent(Notice);

            noticeData.button = { text: "OK" };
            notice.init(noticeData);

            if (handleClickButton) {
                notice.handleClickButton = handleClickButton;
            }

            if (handleClose) {
                notice.handleClose = handleClose;
            }

            this.addNotice(node);
        }
    }

    onConnectSocketFailed(gameName, gameId, isGameRoom = true) {
        if (!this.isAlive()) {
            return;
        }

        this.showNotice(
            {
                text: i18n.t("messages.lostGameConnection", { gameName: gameName })
            } as NoticeData,
            null, // No lobby redirect on close
            null  // No lobby redirect on close
        );

        this.setLoadingVisibility(false);
        this.unCacheAndHideGameLoading(this.getGameLoadingComp(gameId), gameId);
        this.handleWhenNotJoinRoomGame(gameId);
    }

    addDialog(dialogNode: cc.Node) {
        this.dialog?.addChild(dialogNode);
    }

    setIconOverMiniGame(over: boolean) {
        this.miniMenu.setSiblingIndex(over ? 1 : 0);
        this.miniGames.setSiblingIndex(!over ? 1 : 0);
    }

    setLoadingVisibility(status: boolean) {
        this.loading?.setLoadingVisibility(status);
    }

    unCacheAndHideGameLoading(loadingComp: Loading, gameId: number) {
        loadingComp?.setLoadingVisibility(false);
        uiManager.unCacheIconLoading(gameId);
    }

    getGameLoadingComp(gameId: number): Loading {
        const loadingFromManager = uiManager.getLoadingWithGameID(gameId);
        return loadingFromManager || this.loading;
    }

    async initNoticePrefab() {
        if (!this.noticePrefab) {
            this.noticePrefab = await GameUtils.loadResource("shared/prefabs/Notice");
        }
    }
}
