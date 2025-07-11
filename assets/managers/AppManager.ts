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
        console.log("🔧 [AppManager] Initializing AppManager...");
        this.urlParams = new URLSearchParams(window.location.search);

        // Ensure direct mode is always used by adding ref=d_direct if not present
        if (!this.urlParams.has(UrlInfo.Ref) || !this.checkDirectModeRefData(this.urlParams.get(UrlInfo.Ref))) {
            console.log("🔧 [AppManager] Direct mode ref not found, adding ref=d_direct");
            this.urlParams.set(UrlInfo.Ref, "d_direct");
        }

        this.ssoGameId = +this.urlParams.get("gameId");
        console.log("🔧 [AppManager] SSO Game ID:", this.ssoGameId);
        const urlParamsObj = {};
        this.urlParams.forEach((value, key) => {
            urlParamsObj[key] = value;
        });
        console.log("🔧 [AppManager] URL Params:", urlParamsObj);
        sentryLogger.start();
        this.initLanguage();
        this.storeOperator();
        AudioManager.getInstance().init();
        this.initShowHideAppEvent();
        console.log("🔧 [AppManager] Initialization completed");
    }

    clearSSOGameId() {
        console.log("🔧 [AppManager] Clearing SSO Game ID from:", this.ssoGameId);
        this.ssoGameId = GameId.UNKNOWN;
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
    get isPFF() {
        return this._PFF;
    }

    get directGameId() {
        return +this.urlInfo[UrlInfo.DirectGameId] || 0;
    }

    backToOperatorLobby() {
        const url = appManager.urlInfo[UrlInfo.ReturnUrl];
        if (url) {
            window.location.replace(EncryptUtils.base64Decode(url));
        }
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
        console.log("🔧 [AppManager] Starting SSO and authorization process...");
        this.handleAppMode();
        console.log("🔧 [AppManager] App mode handled - Direct Mode:", this.isDirectMode, "App Mode:", this.isAppMode, "PFF:", this.isPFF);
        await this.handleCurrencyGroup();
        console.log("🔧 [AppManager] Currency group handled");
        await this.requestSSO();
        console.log("🔧 [AppManager] SSO request completed");
        await getLobbyConfigs();
        console.log("🔧 [AppManager] Lobby configs loaded");
        if (window.authData && this.isDirectMode) {
            console.log("🔧 [AppManager] Direct mode detected, removing in-room game ID and saving direct mode info");
            sessionManager.removeInRoomGameId();
            this.saveDirectModeInfo();
        }
        this.loadDirectModeInfo();
        console.log("🔧 [AppManager] Direct mode info loaded");
        this.authorized = await this.authorizeByUserService();
        console.log("🔧 [AppManager] Authorization result:", this.authorized);
        await this.initNotificationService();
        console.log("🔧 [AppManager] SSO and authorization process completed");
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
        console.log("🔧 [AppManager] Handling app mode...");
        const urlParams = this.urlParams;
        if (urlParams.has(UrlInfo.Ref) && urlParams.has("gameId") && urlParams.get("gameId") !== "0") {
            const gameId = urlParams.get("gameId");
            const refData = urlParams.get(UrlInfo.Ref);
            console.log("🔧 [AppManager] Processing ref data:", refData, "for game ID:", gameId);

            if (this.checkDirectModeRefData(refData)) {
                console.log("🔧 [AppManager] Direct mode detected from ref data");
                this.urlInfo[UrlInfo.Ref] = refData;
                this.urlInfo[UrlInfo.DirectGameId] = gameId;
                if (urlParams.has("rurl") && urlParams.get("rurl") !== "") {
                    this.urlInfo[UrlInfo.ReturnUrl] = urlParams.get("rurl");
                    console.log("🔧 [AppManager] Return URL set:", urlParams.get("rurl"));
                }
                this.isDirectMode = true;
            }

            if (this.checkPFFData(refData)) {
                console.log("🔧 [AppManager] PFF mode detected from ref data");
                this._PFF = true;
            }
        }

        if (urlParams.has(UrlInfo.Ref) && this.checkAppModeRefData(urlParams.get(UrlInfo.Ref))) {
            console.log("🔧 [AppManager] App mode detected from ref data");
            this._appMode = true;
        }

        if (!urlParams.has(UrlInfo.params)) {
            console.log("🔧 [AppManager] No params in URL, skipping session params handling");
            return;
        }

        const params = UrlParamsService.getInstance().parseAndCache(UrlInfo.params) as ISessionParams;
        console.log("🔧 [AppManager] Session params parsed:", params);

        if (params?.isUserGesture !== undefined) {
            AudioManager.getInstance().isUserGesture = params.isUserGesture;
            window.isUserGesture = params.isUserGesture;
            console.log("🔧 [AppManager] User gesture set:", params.isUserGesture);
        }

        this.handleForAudioSetting(params);
        console.log("🔧 [AppManager] App mode handling completed");
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
        console.log("🔧 [AppManager] Saving direct mode info...");
        const ss = window.authData.ss;
        const data = {
            ss,
            ref: this.urlInfo[UrlInfo.Ref],
            returnUrl: this.urlInfo[UrlInfo.ReturnUrl],
            directGameId: this.urlInfo[UrlInfo.DirectGameId]
        };
        console.log("🔧 [AppManager] Direct mode data to save:", data);
        sessionManager.storeDirectMode(data);
    }

    private loadDirectModeInfo() {
        console.log("🔧 [AppManager] Loading direct mode info...");
        const data = sessionManager.getDirectMode();
        if (data) {
            console.log("🔧 [AppManager] Found direct mode data:", data);
            if (window.authData.ss === data.ss) {
                console.log("🔧 [AppManager] SS matches, restoring direct mode");
                this.urlInfo[UrlInfo.Ref] = data[UrlInfo.Ref];
                this.urlInfo[UrlInfo.ReturnUrl] = data[UrlInfo.ReturnUrl];
                this.urlInfo[UrlInfo.DirectGameId] = data[UrlInfo.DirectGameId];
                this.isDirectMode = true;
            } else {
                console.log("🔧 [AppManager] SS mismatch, not restoring direct mode");
            }
        } else {
            console.log("🔧 [AppManager] No direct mode data found");
        }
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

    async authorizeByUserService(retryCount = 1) {
        console.log("🔧 [AppManager] Attempting authorization via UserService, retry:", retryCount);
        try {
            const { ss, username } = window.authData;
            console.log("🔧 [AppManager] Auth data - SS:", ss ? "present" : "missing", "Username:", username);
            const response: any = await UserService.getInstance().auth.authorize(ss, username);
            console.log("🔧 [AppManager] Authorization response:", response);

            if (authManager.checkUM(response)) {
                console.log("🔧 [AppManager] UM check failed");
                return false;
            }

            if (response.isSuccessful !== undefined && !response.isSuccessful) {
                console.log("🔧 [AppManager] Authorization unsuccessful, signing out");
                uiManager.emitter.emit(InternalEvents.SIGN_OUT);
                return false;
            }

            const result = await this.handleAuthorizedResponse(response);
            console.log("🔧 [AppManager] Authorization result:", result);
            return result;
        } catch (error) {
            console.error("🔧 [AppManager] Authorization error:", error);
            if (retryCount === 3) {
                console.log("🔧 [AppManager] Max retries reached, emitting SSO error");
                uiManager.emitter.emit(InternalEvents.SSO_ERROR);
                throw new Error("Can not authorize by UserService " + error.message);
            }
            console.log("🔧 [AppManager] Retrying authorization in 3 seconds...");
            await delayTime(3);
            retryCount++;
            return this.authorizeByUserService(retryCount);
        }
    }

    private async requestSSO() {
        console.log("🔧 [AppManager] Requesting SSO...");
        return new Promise<void>((resolve) => {
            if (cc.sys.isBrowser && authManager) {
                console.log("🔧 [AppManager] Browser environment detected, checking SSO");
                authManager.checkSSO(() => {
                    console.log("🔧 [AppManager] SSO check completed");
                    authManager.setRecheckInInterval();
                    resolve();
                });
            } else {
                console.log("🔧 [AppManager] Non-browser environment, skipping SSO check");
                resolve();
            }
        });
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
