import AudioManager from "../common/audio/AudioManager";
import * as authManager from "../common/auth/AuthManager";
import NotificationService from "../common/auth/NotificationService";
import * as sessionManager from "../common/auth/SessionManager";
import { getCacheLanguage, getLanguage, setLanguage } from "../common/auth/SessionManager";
import UserService from "../common/auth/UserService";
import logger from "../common/logger";
import NameGenerator from "../common/name-generator/NameGenerator";
import { userManager } from "../common/user/UserManager";
import EncryptUtils from "../common/utils/EncryptUtils";
import UrlParamsService from "../common/utils/UrlParamsService";
import { getLobbyConfigs } from "../lobby/main/view-models/LobbyManager";
import { lobbyResourceManager } from "../lobby/main/view-models/LobbyResourceManager";
import { freeSpinsPromotionHandler } from "../lobby/promotions/FreeSpinsPromotionHandler";
import PromotionNotificationsHandler from "../lobby/promotions/PromotionNotificationsHandler";
import { Promotions } from "../lobby/promotions/Promotions";
import { delayTime } from "../utils";
import { uiManager } from "./GameUIManager";
import { InternalEvents } from "./InternalEvents";
import { jackpotManager } from "./JackpotManager";
import { StorageManager } from "./StorageManager";
import { UrlInfo } from "./UrlInfo";

const sentryLogger = logger();
enum GameId {
    UNKNOWN = -9999
}

export interface ISessionParams {
    ss: string;
    time: number;
    username: string;
    isAuthenticated: boolean;
    memberName: string;
    language: string;
    system: any;
    isUM: boolean;
    umInfo: any;
    musicEnable: boolean;
    sfxEnable: boolean;
    isUserGesture: boolean;
}

class AppManager {
    GAME_IS_SHOWED = true;
    font = {
        increaseMoney: null,
        decreaseMoney: null
    };
    popupMiniGamesLastPosition: cc.Vec3;
    miniPanel: any;
    currentScene: any;
    resultPage: any;

    urlInfo = {};
    authorized = false;

    _isDirectMode = false;
    _appMode = false;
    _PFF = false;

    // Direct mode properties
    directModeRef = "";
    directGameId = 0;

    // App mode properties  
    appModeRef = "";

    // PFF properties
    pffRef = "";

    // Authorization retry properties
    authorizeRetryCount = 0;
    maxAuthorizeRetryCount = 3;
    authorizeRetryDelay = 1000;

    registeredShowHideAppEvent = false;

    urlParams: URLSearchParams;

    ssoGameId = GameId.UNKNOWN;
    hasShowedCenterBanner = false;
    didSsoLobby = false;
    autoOpenLuckyWheel = true;

    get autoGenerateNickname() {
        return true;
    }

    init() {
        console.log("🔧 [AppManager] ===== init started =====");
        const startTime = Date.now();

        console.log("🔧 [AppManager] Initializing AppManager...");
        this.urlParams = new URLSearchParams(window.location.search);
        const gameId = this.urlParams.get("gameId");
        this.ssoGameId = gameId ? +gameId : GameId.UNKNOWN;
        console.log("🔧 [AppManager] SSO Game ID:", this.ssoGameId);

        const urlParamsObj = {};
        this.urlParams.forEach((value, key) => {
            urlParamsObj[key] = value;
        });
        console.log("🔧 [AppManager] URL Params:", urlParamsObj);

        console.log("🔧 [AppManager] Starting Sentry logger...");
        sentryLogger.start();

        console.log("🔧 [AppManager] Initializing language...");
        this.initLanguage();

        console.log("🔧 [AppManager] Storing operator...");
        this.storeOperator();

        console.log("🔧 [AppManager] Initializing audio manager...");
        AudioManager.getInstance().init();

        console.log("🔧 [AppManager] Initializing show/hide app events...");
        this.initShowHideAppEvent();

        const endTime = Date.now();
        console.log("🔧 [AppManager] ===== init completed in", (endTime - startTime), "ms =====");
    }

    clearSSOGameId() {
        console.log("🔧 [AppManager] ===== clearSSOGameId called =====");
        console.log("🔧 [AppManager] Clearing SSO game ID:", this.ssoGameId);
        this.ssoGameId = GameId.UNKNOWN;
        console.log("🔧 [AppManager] SSO game ID cleared");
        console.log("🔧 [AppManager] ===== clearSSOGameId completed =====");
    }

    async initNotificationService() {
        console.log("🔧 [AppManager] Initializing notification service...");
        jackpotManager.initEvents();
        await NotificationService.getInstance().forceConnect();
        appManager.initPromotions();
        console.log("🔧 [AppManager] Notification service initialized");
    }

    clearPromotionObservers() {
        Promotions.getInstance().removeDataObserver();
        PromotionNotificationsHandler.getInstance().removeDataObserver();
    }

    initPromotions() {
        this.clearPromotionObservers();

        Promotions.getInstance().addDataObserver();
        PromotionNotificationsHandler.getInstance().addDataObserver();
        NotificationService.getInstance().emitEvent("promotionNotifications", {});
    }

    get isDirectMode() {
        return this._isDirectMode;
    }

    set isDirectMode(value) {
        this._isDirectMode = value;
    }

    get isDirectModeInRoomGame() {
        const roomGameId = sessionManager.getInRoomGameId(false);
        return this.isDirectMode && +roomGameId === appManager.directGameId;
    }

    get isAppMode() {
        return this._appMode;
    }

    set isAppMode(value) {
        this._appMode = value;
    }

    get isPFF() {
        return this._PFF;
    }

    set isPFF(value) {
        this._PFF = value;
    }

    get directGameIdFromUrl() {
        return +this.urlInfo[UrlInfo.DirectGameId] || 0;
    }

    backToOperatorLobby() {
        console.log("🔧 [AppManager] ===== backToOperatorLobby started =====");

        const directModeInfo = sessionManager.getDirectMode();
        console.log("🔧 [AppManager] Direct mode info for return:", directModeInfo);

        if (directModeInfo && directModeInfo.returnUrl) {
            console.log("🔧 [AppManager] 🔄 Returning to operator lobby:", directModeInfo.returnUrl);
            window.location.href = directModeInfo.returnUrl;
        } else {
            console.log("🔧 [AppManager] ❌ No return URL found, staying in current location");
        }

        console.log("🔧 [AppManager] ===== backToOperatorLobby completed =====");
    }

    redirectToLobby() {
        console.log("🔧 [AppManager] Redirecting to lobby...");
        const currentSceneName = cc.director.getScene().name;
        console.log("🔧 [AppManager] Current scene:", currentSceneName);
        if (currentSceneName !== "Lobby") {
            if (appManager.isDirectMode) {
                console.log("🔧 [AppManager] Direct mode active, returning to operator lobby");
                appManager.backToOperatorLobby();
            } else {
                console.log("🔧 [AppManager] Loading Lobby scene");
                cc.director.loadScene("Lobby");
            }
        } else {
            console.log("🔧 [AppManager] Already in Lobby scene");
        }
    }

    checkDirectModeRefData(refData: string) {
        const directRef = ["d_direct", "m_direct"];
        return directRef.some((data) => data === refData);
    }

    checkAppModeRefData(refData) {
        const appModeRef = ["m_connect"];
        return appModeRef.some((data) => data === refData);
    }

    checkPFFData(refData) {
        const playFFRef = ["d_operator_opendirectly", "m_operator_opendirectly"];
        return playFFRef.some((data) => data === refData);
    }

    forceKickedOut() {
        NotificationService.getInstance().forceKickedOut();
        authManager.signOut();
    }

    async ssoAndAuthorize() {
        console.log("🔧 [AppManager] ===== ssoAndAuthorize started =====");
        const startTime = Date.now();

        console.log("🔧 [AppManager] Starting SSO and authorization process...");

        console.log("🔧 [AppManager] Handling app mode...");
        this.handleAppMode();
        console.log("🔧 [AppManager] App mode handled - Direct Mode:", this.isDirectMode, "App Mode:", this.isAppMode, "PFF:", this.isPFF);

        console.log("🔧 [AppManager] Handling currency group...");
        await this.handleCurrencyGroup();
        console.log("🔧 [AppManager] Currency group handled");

        console.log("🔧 [AppManager] Requesting SSO...");
        await this.requestSSO();
        console.log("🔧 [AppManager] SSO request completed");

        console.log("🔧 [AppManager] Getting lobby configs...");
        await getLobbyConfigs();
        console.log("🔧 [AppManager] Lobby configs loaded");

        if (window.authData && this.isDirectMode) {
            console.log("🔧 [AppManager] Direct mode detected, removing in-room game ID and saving direct mode info");
            sessionManager.removeInRoomGameId();
            this.saveDirectModeInfo();
        }

        console.log("🔧 [AppManager] Loading direct mode info...");
        this.loadDirectModeInfo();
        console.log("🔧 [AppManager] Direct mode info loaded");

        console.log("🔧 [AppManager] Authorizing by user service...");
        this.authorized = await this.authorizeByUserService();
        console.log("🔧 [AppManager] Authorization result:", this.authorized);

        console.log("🔧 [AppManager] Initializing notification service...");
        await this.initNotificationService();

        const endTime = Date.now();
        console.log("🔧 [AppManager] ===== ssoAndAuthorize completed in", (endTime - startTime), "ms =====");
    }

    private async handleCurrencyGroup() {
        console.log("🔧 [AppManager] Handling currency group...");
        const urlParams = new URLSearchParams(window.location.search);
        let currencyGroup: string;
        if (urlParams.has("cg")) {
            currencyGroup = urlParams.get("cg");
            console.log("🔧 [AppManager] Currency group from URL:", currencyGroup);
            StorageManager.set("currency_group", currencyGroup);
        } else {
            currencyGroup = StorageManager.get("currency_group");
            console.log("🔧 [AppManager] Currency group from storage:", currencyGroup);
        }

        await lobbyResourceManager.init(currencyGroup);
        console.log("🔧 [AppManager] Currency group handling completed");
    }

    private handleAppMode() {
        console.log("🔧 [AppManager] ===== handleAppMode started =====");

        const urlParams = this.urlParams;
        const ref = urlParams.get("ref");
        console.log("🔧 [AppManager] App mode check - ref:", ref);

        if (ref) {
            if (this.checkDirectModeRefData(ref)) {
                console.log("🔧 [AppManager] 🔄 Direct mode detected from ref:", ref);
                this.isDirectMode = true;
                this.directModeRef = ref;
            } else if (this.checkAppModeRefData(ref)) {
                console.log("🔧 [AppManager] 📱 App mode detected from ref:", ref);
                this.isAppMode = true;
                this.appModeRef = ref;
            } else if (this.checkPFFData(ref)) {
                console.log("🔧 [AppManager] 🎮 PFF mode detected from ref:", ref);
                this.isPFF = true;
                this.pffRef = ref;
            }
        }

        console.log("🔧 [AppManager] Final app mode state:", {
            isDirectMode: this.isDirectMode,
            isAppMode: this.isAppMode,
            isPFF: this.isPFF,
            directModeRef: this.directModeRef,
            appModeRef: this.appModeRef,
            pffRef: this.pffRef
        });

        console.log("🔧 [AppManager] ===== handleAppMode completed =====");
    }

    private handleForAudioSetting(params: ISessionParams) {
        if (params?.sfxEnable !== undefined) {
            AudioManager.getInstance().sfxEnabled = params?.sfxEnable;
        }

        if (params?.musicEnable !== undefined) {
            AudioManager.getInstance().musicEnabled = params?.musicEnable;
        }
    }

    private saveDirectModeInfo() {
        console.log("🔧 [AppManager] ===== saveDirectModeInfo started =====");

        if (this.isDirectMode && this.directModeRef) {
            console.log("🔧 [AppManager] Saving direct mode info:", {
                ref: this.directModeRef,
                returnUrl: this.getReturnUrl()
            });

            const directModeInfo = {
                ref: this.directModeRef,
                returnUrl: this.getReturnUrl()
            };

            sessionManager.storeDirectMode(directModeInfo);
            console.log("🔧 [AppManager] ✅ Direct mode info saved to session");
        } else {
            console.log("🔧 [AppManager] No direct mode info to save");
        }

        console.log("🔧 [AppManager] ===== saveDirectModeInfo completed =====");
    }

    private loadDirectModeInfo() {
        console.log("🔧 [AppManager] ===== loadDirectModeInfo started =====");

        const directModeInfo = sessionManager.getDirectMode();
        console.log("🔧 [AppManager] Direct mode info from session:", directModeInfo);

        if (directModeInfo) {
            console.log("🔧 [AppManager] Loading direct mode info from session");
            this.isDirectMode = true;
            this.directModeRef = directModeInfo.ref;
            this.directGameId = this.ssoGameId;
            console.log("🔧 [AppManager] Direct mode restored:", {
                isDirectMode: this.isDirectMode,
                directModeRef: this.directModeRef,
                directGameId: this.directGameId
            });
        } else {
            console.log("🔧 [AppManager] No direct mode info found in session");
        }

        console.log("🔧 [AppManager] ===== loadDirectModeInfo completed =====");
    }

    private async autoGenerateName() {
        const name = NameGenerator.generateName();
        const { ss, username } = window.authData;
        const response = await UserService.getInstance().auth.signName(ss, username, name);
        return this.handleAuthorizedResponse(response);
    }

    private async handleAuthorizedResponse(response) {
        if (!response.authorized && (this.autoGenerateNickname || response.autoGenerateNickname)) {
            return this.autoGenerateName();
        }
        response.promotionInfo && freeSpinsPromotionHandler.setPromotionInfoFromSso(response.promotionInfo);
        response.user && userManager.updateUser(response.user);
        return response.authorized;
    }

    private getReturnUrl(): string {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get("returnUrl") || "";
    }

    private async checkSSO() {
        console.log("🔧 [AppManager] ===== checkSSO started =====");
        const startTime = Date.now();

        try {
            console.log("🔧 [AppManager] Checking if user is already authenticated...");

            // Check if we already have valid auth data
            if (window.authData && window.authData.isAuthenticated && window.authData.ss) {
                console.log("🔧 [AppManager] ✅ User already authenticated with valid session");
                const endTime = Date.now();
                console.log("🔧 [AppManager] ===== checkSSO completed (already authenticated) in", endTime - startTime, "ms =====");
                return true;
            }

            console.log("🔧 [AppManager] No valid session found, checking SSO...");
            const result = await authManager.checkSSO(() => {
                console.log("🔧 [AppManager] SSO success callback executed");
            });

            console.log("🔧 [AppManager] SSO check completed, result:", result);

            const endTime = Date.now();
            console.log("🔧 [AppManager] ===== checkSSO completed in", endTime - startTime, "ms =====");
            return result;
        } catch (error) {
            console.error("🔧 [AppManager] ❌ Error in checkSSO:", error);
            const endTime = Date.now();
            console.log("🔧 [AppManager] ===== checkSSO completed (error) in", endTime - startTime, "ms =====");
            throw error;
        }
    }

    async authorizeByUserService() {
        console.log("🔧 [AppManager] ===== authorizeByUserService started =====");
        const startTime = Date.now();

        console.log("🔧 [AppManager] Try authorizeByUserService attempt:", this.authorizeRetryCount);

        try {
            console.log("🔧 [AppManager] Checking SSO...");
            const result = await this.checkSSO();
            console.log("🔧 [AppManager] SSO check result:", result);

            const endTime = Date.now();
            console.log("🔧 [AppManager] ===== authorizeByUserService completed (success) in", (endTime - startTime), "ms =====");
            return result;
        } catch (error) {
            console.error("🔧 [AppManager] ❌ SSO check failed:", error);

            if (this.authorizeRetryCount < this.maxAuthorizeRetryCount) {
                this.authorizeRetryCount++;
                console.log("🔧 [AppManager] 🔄 Retrying authorization, attempt:", this.authorizeRetryCount);

                const retryDelay = this.authorizeRetryDelay * this.authorizeRetryCount;
                console.log("🔧 [AppManager] Waiting", retryDelay, "ms before retry...");

                await new Promise(resolve => setTimeout(resolve, retryDelay));

                const endTime = Date.now();
                console.log("🔧 [AppManager] ===== authorizeByUserService completed (retry) in", (endTime - startTime), "ms =====");
                return this.authorizeByUserService();
            } else {
                console.error("🔧 [AppManager] ❌ Max retry attempts reached, authorization failed");
                const endTime = Date.now();
                console.log("🔧 [AppManager] ===== authorizeByUserService completed (failed) in", (endTime - startTime), "ms =====");
                return false;
            }
        }
    }

    async requestSSO() {
        console.log("🔧 [AppManager] ===== requestSSO started =====");
        const startTime = Date.now();

        console.log("🔧 [AppManager] Requesting SSO authentication...");

        try {
            const result = await authManager.checkSSO();
            console.log("🔧 [AppManager] SSO request result:", result);

            const endTime = Date.now();
            console.log("🔧 [AppManager] ===== requestSSO completed (success) in", (endTime - startTime), "ms =====");
            return result;
        } catch (error) {
            console.error("🔧 [AppManager] ❌ SSO request failed:", error);

            const endTime = Date.now();
            console.log("🔧 [AppManager] ===== requestSSO completed (failed) in", (endTime - startTime), "ms =====");
            throw error;
        }
    }

    initLanguage() {
        let language = getCacheLanguage();
        const urlParams = this.urlParams;
        if (urlParams.has("lang")) {
            language = getLanguage(urlParams.get("lang") ?? "en-US");
        }
        setLanguage(language);
    }

    storeOperator() {
        let operator = sessionManager.getOperator();
        const urlParams = this.urlParams;
        if (urlParams.has("op")) {
            operator = urlParams.get("op");
        }
        sessionManager.storeOperator(operator);
    }

    private initShowHideAppEvent() {
        if (this.registeredShowHideAppEvent) {
            return;
        }
        const hiddenPropName = ["hidden", "mozHidden", "msHidden", "webkitHidden"].find((key) => typeof document[key] !== "undefined");
        this.GAME_IS_SHOWED = !document[hiddenPropName];
        cc.game.on(cc.game.EVENT_HIDE, () => {
            this.GAME_IS_SHOWED = false;
        });

        cc.game.on(cc.game.EVENT_SHOW, () => {
            this.GAME_IS_SHOWED = true;
            UserService.getBalance();
        });
        this.registeredShowHideAppEvent = true;
    }
}
export const appManager = new AppManager();
