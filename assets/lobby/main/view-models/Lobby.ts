import * as i18n from "i18n/runtime-scripts/LanguageData";

import { appContainer } from "../../../Application";
import SocketIOController from "../../../SocketIOController";
import AnalyticsManager, { TrackingAction, TrackingEvent } from "../../../analytics/AnalyticsManager";
import GameUtils from "../../../common/GameUtils";
import AudioManager from "../../../common/audio/AudioManager";
import MusicPlayer from "../../../common/audio/MusicPlayer";
import { truncateFixedDecimals } from "../../../common/helpers/NumberHelper";
import logger from "../../../common/logger";
import { SettingMenuEvents } from "../../../common/setting-menu/SettingMenu";
import { userManager } from "../../../common/user/UserManager";
import NoticeUtil from "../../../common/utils/NoticeUtil";
import * as Configs from "../../../configs/Configs";
import LuckyWheelIcon from "../../../games/lucky-wheel/view-models/LuckyWheelIcon";
import { appManager } from "../../../managers/AppManager";
import { uiManager } from "../../../managers/GameUIManager";
import { InternalEvents } from "../../../managers/InternalEvents";
import MiniPanel from "../../../mini-games-panel/view-models/MiniPanel";
import CategoryList from "../../category/view-models/CategoryList";
import NewsContent from "../../news/NewsContent";
import PromotionNotificationsHandler from "../../promotions/PromotionNotificationsHandler";
import PromotionTournamentHandler from "../../promotions/PromotionTournamentHandler";
import CommonDialog from "./../../../common/_base/view-models/CommonDialog";
import * as authManager from "./../../../common/auth/AuthManager";
import * as sessionManager from "./../../../common/auth/SessionManager";
import ButtonArrow from "./ButtonArrow";
import ButtonsLobby from "./ButtonsLobby";
import Header from "./Header";
import LobbyCenter from "./LobbyCenter";
import { themeResourceLoader } from "./theme/ResourceLoader";
import LobbyManager from "./LobbyManager";
import FreeSpinsPromotionHandler from "../../promotions/FreeSpinsPromotionHandler";
import LobbyDialogManager from "../../../managers/LobbyDialogManager";

console.log("[Lobby] Loading Lobby module...");

const socketIOController = appContainer.get(SocketIOController);
const sentryLogger = logger();

const { ccclass, property } = cc._decorator;

@ccclass
export default class Lobby extends cc.Component {
    @property(cc.Prefab)
    miniPanelPrefab: cc.Prefab = null;

    @property(cc.Node)
    redhat: cc.Node = null;

    @property(cc.Node)
    loading: cc.Node = null;

    @property(cc.AudioSource)
    audioBG: cc.AudioSource = null;

    @property(cc.Node)
    categoryContainer: cc.Node = null;

    @property(cc.Node)
    lobbyCenterContainer: cc.Node = null;

    @property(cc.Node)
    backgroundUIContainer: cc.Node = null;

    @property(cc.Node)
    headerContainer: cc.Node = null;

    @property(cc.Node)
    marqueeContainer: cc.Node = null;

    @property(cc.Node)
    buttonArrowContainer: cc.Node = null;

    @property(cc.Node)
    buttonsContainer: cc.Node = null;

    private initializedLobby = false;
    private luckyWheelIcon: LuckyWheelIcon;
    private miniPanel: MiniPanel;
    private isSSOToGame = false;
    private marqueePrefab: cc.Prefab = null;
    private headerPrefab: cc.Prefab = null;
    private backgroundUIPrefab: cc.Prefab = null;
    private buttonArrowPrefab: cc.Prefab = null;
    private containerButtonsPrefabs: cc.Prefab = null;
    private categoryContainerPrefab: cc.Prefab = null;
    private lobbyCenterPrefab: cc.Prefab = null;
    private headerComp: Header = null;
    private newsContentsComp: NewsContent = null;
    private buttonArrowComp: ButtonArrow = null;
    private categoryListComp: CategoryList = null;
    private lobbyCenterComp: LobbyCenter = null;

    signName: any;
    logoutPrefab: cc.Prefab = null;
    settingMenuPrefab: cc.Prefab = null;
    signNamePrefab: cc.Prefab = null;

    onDestroy() {
        console.log("[Lobby] Lobby onDestroy called");
        appManager.miniPanel = null;
        appManager.currentScene = null;
        window.isSSO = false;
        PromotionNotificationsHandler.getInstance().setJoinGameId(0);
        this.removeGameUIEvent();
        LobbyDialogManager.getInstance().clearQueue();
        console.log("[Lobby] Lobby destroyed successfully");
    }

    async onLoad() {
        console.log("[Lobby] Lobby onLoad started");
        document.cookie = "redT=1702;path=/";
        console.log("[Lobby] Cookie set: redT=1702");

        this.trackOnLoadEvents();
        console.log("[Lobby] OnLoad events tracked");

        appManager.currentScene = this;
        uiManager.isPauseLoadingIcons = false;
        console.log("[Lobby] App manager and UI manager configured");

        this.initGameUIEvents();
        console.log("[Lobby] Game UI events initialized");

        await this.initUIs();
        console.log("[Lobby] UIs initialized");

        this.checkToShowSignName();
        console.log("[Lobby] Sign name check completed");

        MusicPlayer.getInstance().init();
        console.log("[Lobby] Music player initialized");
        console.log("[Lobby] Lobby onLoad completed");
    }

    showCenterBanner() {
        console.log("[Lobby] Showing center banner");
        cc.log("Lobby show center banner");
        // call in schedule to fix bug, not yet register listener in child's onLoad
        this.scheduleOnce(() => {
            console.log("[Lobby] Emitting CENTER_BANNER_SHOW event");
            uiManager.emitter.emit(InternalEvents.CENTER_BANNER_SHOW);
        }, 0.3);
    }

    async initUIs() {
        console.log("[Lobby] Initializing UIs...");
        this.initMiniPanel();
        console.log("[Lobby] Mini panel initialized");

        await Promise.all([this.loadBackgroundUI(), this.loadPrefabByThemeCategoryContainer(), this.loadLobbyCenterContainer()]);
        console.log("[Lobby] Background UI, category container, and lobby center loaded");

        Promise.all([this.loadHeader(), this.loadButtonArrow(), this.loadButtons(), this.loadMarquee()]);
        console.log("[Lobby] Header, button arrow, buttons, and marquee loading initiated");
    }

    async loadBackgroundUI() {
        console.log("[Lobby] Loading background UI...");
        try {
            if (!this.backgroundUIPrefab) {
                console.log("[Lobby] Loading background UI prefab from theme");
                this.backgroundUIPrefab = await themeResourceLoader?.loadPrefabByTheme("background-ui");
            }

            const backgroundUI = cc.instantiate(this.backgroundUIPrefab);
            backgroundUI && this.backgroundUIContainer?.addChild(backgroundUI);
            console.log("[Lobby] Background UI loaded successfully");
        } catch (err) {
            console.error("[Lobby] Error loading background UI:", err);
        }
    }

    async loadHeader() {
        console.log("[Lobby] Loading header...");
        try {
            if (!this.headerPrefab) {
                console.log("[Lobby] Loading header prefab from theme");
                this.headerPrefab = await themeResourceLoader?.loadPrefabByTheme("header");
            }

            const header = cc.instantiate(this.headerPrefab);
            if (header) {
                this.headerComp = header?.getComponent(Header);
                this.headerContainer?.addChild(header);
                this.onLoadLobby();
                console.log("[Lobby] Header loaded successfully");
            }
        } catch (err) {
            console.error("[Lobby] Error loading header:", err);
        }
    }

    async loadMarquee() {
        console.log("[Lobby] Loading marquee...");
        try {
            if (!this.marqueePrefab) {
                console.log("[Lobby] Loading marquee prefab from theme");
                this.marqueePrefab = await themeResourceLoader?.loadPrefabByTheme("marquee");
            }

            const marquee = cc.instantiate(this.marqueePrefab);
            if (marquee) {
                this.newsContentsComp = marquee?.getComponent(NewsContent);
                this.marqueeContainer?.addChild(marquee);
                console.log("[Lobby] Marquee loaded successfully");
            }
        } catch (err) {
            console.error("[Lobby] Error loading marquee:", err);
        }
    }

    async loadLobbyCenterContainer() {
        console.log("[Lobby] Loading lobby center container...");
        try {
            if (!this.lobbyCenterPrefab) {
                console.log("[Lobby] Loading lobby center prefab from theme");
                this.lobbyCenterPrefab = await themeResourceLoader?.loadPrefabByTheme("lobby-center");
            }

            const lobbyCenter = cc.instantiate(this.lobbyCenterPrefab);
            if (lobbyCenter) {
                this.lobbyCenterComp = lobbyCenter?.getComponent(LobbyCenter);
                this.lobbyCenterComp.setMiniPanel(this.miniPanel);
                this.lobbyCenterComp.initScrollListener();

                this.lobbyCenterContainer?.addChild(lobbyCenter);
                console.log("[Lobby] Lobby center container loaded successfully");
            }
        } catch (err) {
            console.error("[Lobby] Error loading lobby center container:", err);
        }
    }

    async loadButtonArrow() {
        console.log("[Lobby] Loading button arrow...");
        try {
            if (!this.buttonArrowPrefab) {
                console.log("[Lobby] Loading button arrow prefab from theme");
                this.buttonArrowPrefab = await themeResourceLoader?.loadPrefabByTheme("button-arrow");
            }

            const buttonArrow = cc.instantiate(this.buttonArrowPrefab);
            if (buttonArrow) {
                this.buttonArrowComp = buttonArrow?.getComponent(ButtonArrow);
                this.lobbyCenterComp?.setButtonArrowComp(this.buttonArrowComp);
                this.buttonArrowComp?.button?.node?.on("click", () => {
                    this.lobbyCenterComp?.onFastScrollClick();
                });
                this.buttonArrowContainer?.addChild(buttonArrow);
                console.log("[Lobby] Button arrow loaded successfully");
            }
        } catch (err) {
            console.error("[Lobby] Error loading button arrow:", err);
        }
    }

    async loadButtons() {
        console.log("[Lobby] Loading buttons...");
        try {
            if (!this.containerButtonsPrefabs) {
                console.log("[Lobby] Loading buttons prefab from theme");
                this.containerButtonsPrefabs = await themeResourceLoader?.loadPrefabByTheme("buttons");
            }

            const buttons = cc.instantiate(this.containerButtonsPrefabs);
            if (buttons) {
                const compButtonsLobby = buttons?.getComponent(ButtonsLobby);
                compButtonsLobby.initClickEven(compButtonsLobby.downloadApp, this.node, "Lobby", "redirectToDownloadPage");
                compButtonsLobby.initClickEven(compButtonsLobby.settingMenu, this.node, "Lobby", "openSettingMenu");
                this.buttonsContainer.addChild(buttons);
                console.log("[Lobby] Buttons loaded successfully");
            }
        } catch (err) {
            console.error("[Lobby] Error loading buttons:", err);
        }
    }

    async loadPrefabByThemeCategoryContainer() {
        console.log("[Lobby] Loading category container...");
        try {
            if (!this.categoryContainerPrefab) {
                console.log("[Lobby] Loading category container prefab from theme");
                this.categoryContainerPrefab = await themeResourceLoader?.loadPrefabByTheme("category-container");
            }

            const categoryContainer = cc.instantiate(this.categoryContainerPrefab);
            if (categoryContainer) {
                this.categoryListComp = categoryContainer?.getComponent(CategoryList);
                this.categoryListComp.onCategoryChanged = (index: number) => {
                    this.lobbyCenterComp?.onCategoryChanged(index);
                };
                this.categoryContainer.addChild(categoryContainer);
                this.categoryListComp?.loadCategory();
                console.log("[Lobby] Category container loaded successfully");
            }
        } catch (err) {
            console.error("[Lobby] Error loading category container:", err);
        }
    }

    async openSettingMenu() {
        console.log("[Lobby] Opening setting menu...");
        try {
            AudioManager.getInstance().playClick();
            if (!this.settingMenuPrefab) {
                console.log("[Lobby] Loading setting menu prefab from theme");
                this.settingMenuPrefab = await themeResourceLoader?.loadPrefabByTheme("setting-menu");
            }

            const settingMenu = cc.instantiate(this.settingMenuPrefab);
            settingMenu.on(SettingMenuEvents.LOGOUT, async () => {
                try {
                    if (!this.logoutPrefab) {
                        console.log("[Lobby] Loading logout prefab");
                        this.logoutPrefab = await GameUtils.loadResource("prefabs/LogoutPopup");
                    }

                    const dialog = cc.instantiate(this.logoutPrefab);
                    this.miniPanel.addDialog(dialog);
                    console.log("[Lobby] Logout dialog added");
                } catch (err) {
                    console.error("[Lobby] Error adding logout dialog:", err);
                }
            });
            this.miniPanel.addDialog(settingMenu);
            console.log("[Lobby] Setting menu loaded and added");
        } catch (err) {
            console.error("[Lobby] Error opening setting menu:", err);
        }
    }

    private trackOnLoadEvents() {
        const location = cc.director.getScene().name;
        AnalyticsManager.Instance.trackEvent(TrackingEvent.Button, {
            location,
            action: TrackingAction.Show,
            object_name: "Result Page"
        });

        AnalyticsManager.Instance.trackEvent(TrackingEvent.Button, {
            location,
            action: TrackingAction.Show,
            object_name: "Banner"
        });

        this.writePageLoadingTimeLog();
    }

    private writePageLoadingTimeLog() {
        try {
            if (window["dontWritePageLoadingTimeLog"]) {
                return;
            }

            const startLoadPageTime = window["loadingPageStartTime"] ?? new Date();
            const startShowingLobbyTime = Date.now();
            const totalLoadPageTimeInSeconds = (startShowingLobbyTime - startLoadPageTime) / 1000;
            cc.log(
                `Start displaying Lobby at ${new Date(
                    startShowingLobbyTime
                ).toLocaleString()}. Total loading time in splash screen: ${totalLoadPageTimeInSeconds}`
            );
            window["dontWritePageLoadingTimeLog"] = true;
        } catch { }
    }

    initGameUIEvents() {
        uiManager.emitterListener(InternalEvents.LOST_CONNECTION, this.showNotice.bind(this), this);
        uiManager.emitterListener(InternalEvents.HANDLE_ON_SIGN_IN, this.onSignIn.bind(this), this);
        uiManager.emitterListener(InternalEvents.OPEN_GAME, this.openGameFromCenterBanner.bind(this), this);
        uiManager.emitterListener(
            InternalEvents.AFTER_LUCKY_WHEEL,
            () => LobbyDialogManager.getInstance().addDialog(this.showCenterBanner.bind(this), "CenterBanner"),
            this
        );
        uiManager.emitterListener(InternalEvents.NOT_EXIST_MINI_GAMES, this.handleSsoLobby.bind(this), this);
        uiManager.emitterListener(InternalEvents.CLOSE_GAME, this.checkExistGameMini.bind(this), this);
        console.log("[Lobby] Game UI events listeners registered");
    }

    openGameFromCenterBanner(gameId: number) {
        console.log("[Lobby] Opening game from center banner:", gameId);
        AudioManager.getInstance().playClick();
        GameUtils.openGame(gameId, this.miniPanel, null, true);
    }

    removeGameUIEvent() {
        uiManager.removeListenersWithTarget(this);
        console.log("[Lobby] Game UI events listeners removed");
    }

    initMiniPanel() {
        console.log("[Lobby] Initializing mini panel...");
        const miniPanelNode = cc.instantiate(this.miniPanelPrefab);
        this.miniPanel = miniPanelNode.getComponent(MiniPanel);
        appManager.miniPanel = this.miniPanel;
        this.redhat?.insertChild(miniPanelNode, 1);
        console.log("[Lobby] Mini panel initialized successfully");
    }

    checkToShowSignName() {
        console.log("[Lobby] Checking to show sign name...");
        if (!appManager.authorized) {
            this.showSignName();
        } else {
            PromotionTournamentHandler.getInstance().checkTournamentPromotionsBeforeSignIn();
            FreeSpinsPromotionHandler.getInstance().getFreeSpinsPromotionBanner();
        }
    }

    onLoadLobby() {
        console.log("[Lobby] onLoadLobby called");
        if (appManager.authorized) {
            this.headerComp.active();
            this.headerComp.setUserName(userManager.userName);
            this.headerComp.setBalance(this.formatUserCurrency(userManager.balance));
            this.headerComp.setAvatar(userManager.avatarId);
            (userManager.availSpins || userManager.scoins) && this.headerComp.showScoins(userManager.scoins);
        }
    }

    onSignIn() {
        console.log("[Lobby] onSignIn called");
        this.isSSOToGame = appManager.ssoGameId > 0;
        if (this.isSSOToGame) {
            try {
                const offerGames = LobbyManager.getInstance().getAllGameIds();

                if (offerGames.includes(appManager.ssoGameId)) {
                    console.log("[Lobby] onSignIn - isSSOToGame");
                    this.loadLobby(false);
                    this.openGameSSO();
                    return;
                }
            } catch (error) {
                console.log("An error occurred in onSignIn:" + appManager.ssoGameId.toString(), error);
            }
        }

        if (sessionManager.getInRoomGameId()) {
            console.log("[Lobby] onSignIn - reload game room");
            this.loadLobby(false);
            this.reloadCurrentRoomGame();
            return;
        }

        this.renderLuckyWheelIcon();
        this.handleSsoLobby();
        this.loadLobby(true);
    }

    handleSsoLobby() {
        console.log("[Lobby] handleSsoLobby called");
        if (appManager.didSsoLobby) {
            return;
        }
        cc.log("Lobby handleSsoLobby");
        appManager.didSsoLobby = true;
        this.openLuckyWheel();
    }
    checkExistGameMini() {
        console.log("[Lobby] Checking if game mini exists...");
        const activeMiniGame = this.miniPanel?.miniGames?.children.find((child) => child.active);
        if (!activeMiniGame) {
            uiManager.emitter.emit(InternalEvents.NOT_EXIST_MINI_GAMES);
        }
    }

    loadLobby(loadAllBanners: boolean) {
        console.log("[Lobby] Loading lobby...");
        if (!this.initializedLobby) {
            this.initLobbyCategoryBanner(loadAllBanners);
        }
    }

    initLobbyCategoryBanner(loadAllBanners: boolean) {
        console.log("[Lobby] Initializing lobby category banner...");
        if (userManager.offerGames.length === 0) {
            this.showNotice({ text: i18n.t("messages.noGameOffer") });
        }

        cc.log("Start initLobbyCategoryBanner---------");
        this.categoryListComp?.activeBgNewOnCategory();

        this.lobbyCenterComp?.initLobbyMenu();
        const category = !window.isSSO ? this.categoryListComp.activeCategoryFromStorage() : 0;
        this.lobbyCenterComp?.setMenuCategory(category);
        this.lobbyCenterComp?.initBanners(loadAllBanners);

        this.initializedLobby = true;
        console.log("[Lobby] Lobby category banner initialized");
    }

    outRoomGame() {
        //please dont remove this method, it's used in openGameRoom method in MiniPanel.ts file
        return new Promise<void>((resolve) => {
            socketIOController.closeMiniGameSockets();
            resolve();
        });
    }

    serviceAuthorized(Authorized) {
        console.log("[Lobby] Service authorized:", Authorized);
        this.loading.active = false;

        if (!Authorized) {
            this.showSignName();
        } else {
            this.signIn();
        }
    }

    handleUserData(user) {
        console.log("[Lobby] Handling user data:", user);
        userManager.updateUser(user);
        try {
            if (user.name) {
                if (this.loading) {
                    this.loading.active = false;
                }
            }
        } catch (ex) {
            const userAgent = window.navigator ? window.navigator.userAgent : "offline";
            sentryLogger.logError(
                `Logged In User: ${user.name} at ${new Date()}\nInfo:\n${JSON.stringify(user)} \nBrowser:${userAgent}\nError:${ex}`
            );
        }
    }

    formatUserCurrency(red, currency = null, isDisplayPlayerCurrency = false) {
        console.log("[Lobby] Formatting user currency:", red, currency, isDisplayPlayerCurrency);
        const userCurrency = isDisplayPlayerCurrency || userManager.isDisplayPlayerCurrency ? this.getUserCurrency(currency) : "";

        return `${truncateFixedDecimals(red, 2)} ${userCurrency}`;
    }

    getUserCurrency(currency = null) {
        console.log("[Lobby] Getting user currency:", currency);
        if (userManager.currency) {
            return userManager.currency.toUpperCase();
        } else {
            return currency ? currency : "";
        }
    }

    showNotice(noticeData: any, onClickButton: () => void = null, onClose: () => void = null) {
        console.log("[Lobby] Showing notice:", noticeData);
        this.miniPanel.showNotice(noticeData, onClickButton, onClose);
    }

    loadUserData(data: any) {
        console.log("[Lobby] Loading user data:", data);
        if (void 0 !== data.red && this.headerComp && this.headerComp.userRed) {
            this.headerComp.setBalance(this.formatUserCurrency(data.red, data.currency, data.isDisplayPlayerCurrency));
        }

        if (void 0 !== data.avatarId) {
            this.headerComp.setAvatar(data.avatarId);
        }

        if (data.ss) {
            sessionManager.storeSessionData(data.ss);
        }

        if (void 0 !== data.name) {
            this.headerComp.setUserName(data.name);
            sentryLogger.setCharacterName(data.name);
        }

        if (data.availSpins || data.scoins) {
            this.headerComp.showScoins(data.scoins);
        }
    }

    signOut() {
        console.log("[Lobby] Signing out...");
        userManager.updateUser({});
        this.allReset();
        authManager.signOut();
    }

    onDisconnected() {
        console.log("[Lobby] On disconnected called");
        this.allReset();
    }

    signIn() {
        console.log("[Lobby] Signing in...");
        if (this.signName && this.signName.node) {
            const commonDialog = this.signName.dialogNode.getComponent(CommonDialog);
            commonDialog.closeDialog(false);
        }

        this.miniPanel && this.miniPanel.onSignIn();
    }

    openGameSSO(onComplete?: () => void) {
        console.log("[Lobby] Opening SSO game:", appManager.ssoGameId);
        const gameId = appManager.ssoGameId;
        GameUtils.clearGameSetting(gameId);
        GameUtils.openGame(gameId, this.miniPanel, onComplete, true);
        appManager.clearSSOGameId();
        sessionManager.removeInRoomGameId();
    }

    reloadCurrentRoomGame() {
        console.log("[Lobby] Reloading current room game:", sessionManager.getInRoomGameId());
        const inRoomGameId = sessionManager.getInRoomGameId();
        if (inRoomGameId) {
            GameUtils.openGame(+inRoomGameId, this.miniPanel, null, true);
        }
    }

    allReset() {
        console.log("[Lobby] Resetting all...");
        this.loading.active = false;
        this.newsContentsComp.reset();
    }

    playMusic() {
        console.log("[Lobby] Playing music...");
        this.audioBG.play();
    }

    pauseMusic() {
        console.log("[Lobby] Pausing music...");
        this.audioBG.pause();
    }

    audioClick() {
        console.log("[Lobby] Audio click...");
        AudioManager.getInstance().playClick();
    }

    onGameResultClick() {
        console.log("[Lobby] Game result clicked");
        AnalyticsManager.Instance.trackEvent(TrackingEvent.Button, {
            location: cc.director.getScene().name,
            action: TrackingAction.Click,
            object_name: "Result Page"
        });
        this.miniPanel.openResultPage();
    }

    async renderLuckyWheelIcon() {
        console.log("[Lobby] Rendering lucky wheel icon...");
        try {
            if (!this.luckyWheelIcon && userManager.availSpins > 0) {
                console.log("[Lobby] Downloading lucky wheel icon");
                const prefab = await GameUtils.loadResource(`games/lucky-wheel/LuckyWheelIcon`);
                console.log("[Lobby] Downloading lucky wheel icon END");
                if (!this.luckyWheelIcon) {
                    const node = cc.instantiate(prefab);
                    this.redhat?.insertChild(node, 0);
                    this.luckyWheelIcon = node.getComponent(LuckyWheelIcon);
                    this.luckyWheelIcon.init(this.miniPanel);
                }
            }
        } catch (e) {
            console.error("[Lobby] Error rendering lucky wheel icon:", e);
        }
    }

    async openLuckyWheel() {
        console.log("[Lobby] Opening lucky wheel...");
        try {
            if (userManager.userName && userManager.availSpins) {
                console.log("[Lobby] Opening lucky wheel ----------------------------");
                await GameUtils.waitUntil(() => this.luckyWheelIcon, 100, 60000);
                if (this.luckyWheelIcon && appManager.autoOpenLuckyWheel) {
                    this.luckyWheelIcon.openGame();
                    return;
                }
            }
            this.showCenterBanner();
        } catch (e) {
            console.error("[Lobby] Error opening lucky wheel:", e);
        }
    }

    async showSignName() {
        console.log("[Lobby] Showing sign name...");
        if (!this.signName) {
            try {
                if (!this.signNamePrefab) {
                    console.log("[Lobby] Loading sign name prefab");
                    this.signNamePrefab = await GameUtils.loadResource("prefabs/SignName");
                }

                if (this.signNamePrefab) {
                    const node = cc.instantiate(this.signNamePrefab);
                    this.signName = node.getComponent("SignName");
                    this.signName.init(this.handleSignName.bind(this));
                    this.miniPanel.addDialog(node);
                    console.log("[Lobby] Sign name dialog added");
                }
            } catch (err) {
                console.error("[Lobby] Error showing sign name:", err);
            }
        }
    }

    handleSignName(response) {
        console.log("[Lobby] Handling sign name response:", response);
        if (response.authorized) {
            this.headerComp.active();
            appManager.authorized = true;
            this.handleUserData(response.user);
            this.serviceAuthorized(response.authorized);
            PromotionTournamentHandler.getInstance().checkTournamentPromotionsBeforeSignIn();
            FreeSpinsPromotionHandler.getInstance().getFreeSpinsPromotionBanner();
        } else {
            const errorCode = response.errorCode;
            const text = NoticeUtil.getLocalizedErrorMessage(errorCode, { errorCode });
            this.showNotice({ text: text });
        }
    }

    redirectToDownloadPage() {
        console.log("[Lobby] Redirecting to download page...");
        AudioManager.getInstance().playClick();
        window.open(`${Configs.AppDownloadSubDomain}?language=${window.i18n.curLang}`, "_blank");
    }
}
