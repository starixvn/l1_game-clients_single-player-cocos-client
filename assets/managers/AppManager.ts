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

console.log("[AppManager] Loading AppManager module...");

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
        console.log("[AppManager] Getting autoGenerateNickname: true");
        return true;
    }

    init() {
        console.log("[AppManager] 🔧 Initializing AppManager...");
        this.urlParams = new URLSearchParams(window.location.search);
        console.log("[AppManager] URL params initialized");

        // Store current URL as ReturnUrl if no ReturnUrl is present (first entry URL)
        if (!this.urlParams.has("rurl") || this.urlParams.get("rurl") === "") {
            const currentUrl = window.location.href;
            console.log("[AppManager] No ReturnUrl found, storing current URL as first entry URL:", currentUrl);
            this.urlInfo[UrlInfo.ReturnUrl] = EncryptUtils.base64Encode(currentUrl);
        }

        // Ensure direct mode is always used by adding ref=d_direct if not present
        if (!this.urlParams.has(UrlInfo.Ref) || !this.checkDirectModeRefData(this.urlParams.get(UrlInfo.Ref))) {
            console.log("[AppManager] Direct mode ref not found, adding ref=d_direct");
            this.urlParams.set(UrlInfo.Ref, "d_direct");
        }

        // Check if gameId is missing or equals 0, and set it to 134 if needed
        if (!this.urlParams.has("gameId") || this.urlParams.get("gameId") === "0") {
            console.log("[AppManager] GameId missing or equals 0, setting gameId=134");
            this.urlParams.set("gameId", "134");
        }

        this.ssoGameId = +this.urlParams.get("gameId");
        console.log("[AppManager] SSO Game ID:", this.ssoGameId);
        const urlParamsObj = {};
        this.urlParams.forEach((value, key) => {
            urlParamsObj[key] = value;
        });
        console.log("[AppManager] URL Params:", urlParamsObj);

        console.log("[AppManager] Starting sentry logger...");
        sentryLogger.start();

        console.log("[AppManager] Initializing language...");
        this.initLanguage();

        console.log("[AppManager] Storing operator...");
        this.storeOperator();

        console.log("[AppManager] Initializing audio manager...");
        AudioManager.getInstance().init();

        console.log("[AppManager] Initializing show/hide app event...");
        this.initShowHideAppEvent();

        console.log("[AppManager] 🔧 Initialization completed");
    }

    clearSSOGameId() {
        console.log("[AppManager] Clearing SSO Game ID from:", this.ssoGameId);
        this.ssoGameId = GameId.UNKNOWN;
        console.log("[AppManager] SSO Game ID cleared");
    }

    async initNotificationService() {
        console.log("[AppManager] Initializing notification service...");
        console.log("[AppManager] Initializing jackpot manager events...");
        jackpotManager.initEvents();

        console.log("[AppManager] Force connecting notification service...");
        await NotificationService.getInstance().forceConnect();

        console.log("[AppManager] Initializing promotions...");
        appManager.initPromotions();

        console.log("[AppManager] Notification service initialized");
    }

    clearPromotionObservers() {
        console.log("[AppManager] Clearing promotion observers...");
        Promotions.getInstance().removeDataObserver();
        PromotionNotificationsHandler.getInstance().removeDataObserver();
        console.log("[AppManager] Promotion observers cleared");
    }

    initPromotions() {
        console.log("[AppManager] Initializing promotions...");
        this.clearPromotionObservers();

        console.log("[AppManager] Adding promotion data observers...");
        Promotions.getInstance().addDataObserver();
        PromotionNotificationsHandler.getInstance().addDataObserver();

        console.log("[AppManager] Emitting promotion notifications event...");
        NotificationService.getInstance().emitEvent("promotionNotifications", {});

        console.log("[AppManager] Promotions initialized");
    }

    get isDirectMode() {
        console.log("[AppManager] Getting isDirectMode:", this._isDirectMode);
        return this._isDirectMode;
    }

    set isDirectMode(value) {
        console.log("[AppManager] Setting isDirectMode to:", value);
        this._isDirectMode = value;
    }

    get isDirectModeInRoomGame() {
        const roomGameId = sessionManager.getInRoomGameId(false);
        const isDirectModeInRoom = this.isDirectMode && +roomGameId === appManager.directGameId;
        console.log("[AppManager] Getting isDirectModeInRoomGame:", isDirectModeInRoom, "roomGameId:", roomGameId, "directGameId:", appManager.directGameId);
        return isDirectModeInRoom;
    }

    get isAppMode() {
        console.log("[AppManager] Getting isAppMode:", this._appMode);
        return this._appMode;
    }

    get isPFF() {
        console.log("[AppManager] Getting isPFF:", this._PFF);
        return this._PFF;
    }

    get directGameId() {
        const directGameId = +this.urlInfo[UrlInfo.DirectGameId] || 0;
        console.log("[AppManager] Getting directGameId:", directGameId);
        return directGameId;
    }

    backToOperatorLobby() {
        console.log("[AppManager] Back to operator lobby called");
        const url = appManager.urlInfo[UrlInfo.ReturnUrl];
        console.log("[AppManager] Return URL:", url);
        if (url) {
            const decodedUrl = EncryptUtils.base64Decode(url);
            console.log("[AppManager] Decoded return URL:", decodedUrl);
            window.location.replace(decodedUrl);
        } else {
            console.warn("[AppManager] No return URL found");
        }
    }

    redirectToLobby() {
        console.log("[AppManager] Redirecting to lobby...");
        const currentSceneName = cc.director.getScene().name;
        console.log("[AppManager] Current scene:", currentSceneName);
        if (currentSceneName !== "Lobby") {
            if (appManager.isDirectMode) {
                console.log("[AppManager] Direct mode active, returning to operator lobby");
                appManager.backToOperatorLobby();
            } else {
                console.log("[AppManager] Loading Lobby scene");
                cc.director.loadScene("Lobby");
            }
        } else {
            console.log("[AppManager] Already in Lobby scene");
        }
    }

    checkDirectModeRefData(refData: string) {
        console.log("[AppManager] Checking direct mode ref data:", refData);
        const directRef = ["d_direct", "m_direct"];
        const isDirectMode = directRef.some((data) => data === refData);
        console.log("[AppManager] Is direct mode:", isDirectMode);
        return isDirectMode;
    }

    checkAppModeRefData(refData) {
        console.log("[AppManager] Checking app mode ref data:", refData);
        const appModeRef = ["m_connect"];
        const isAppMode = appModeRef.some((data) => data === refData);
        console.log("[AppManager] Is app mode:", isAppMode);
        return isAppMode;
    }

    checkPFFData(refData) {
        console.log("[AppManager] Checking PFF data:", refData);
        const playFFRef = ["d_operator_opendirectly", "m_operator_opendirectly"];
        const isPFF = playFFRef.some((data) => data === refData);
        console.log("[AppManager] Is PFF:", isPFF);
        return isPFF;
    }

    forceKickedOut() {
        console.log("[AppManager] Force kicked out called");
        console.log("[AppManager] Force kicking out notification service...");
        NotificationService.getInstance().forceKickedOut();
        console.log("[AppManager] Signing out...");
        authManager.signOut();
    }

    async ssoAndAuthorize() {
        console.log("[AppManager] Starting SSO and authorization process...");
        console.log("[AppManager] Handling app mode...");
        this.handleAppMode();
        console.log("[AppManager] App mode handled - Direct Mode:", this.isDirectMode, "App Mode:", this.isAppMode, "PFF:", this.isPFF);

        console.log("[AppManager] Handling currency group...");
        await this.handleCurrencyGroup();
        console.log("[AppManager] Currency group handled");
        await this.requestSSO();
        console.log("[AppManager] SSO request completed");
        await getLobbyConfigs();
        console.log("[AppManager] Lobby configs loaded");
        if (window.authData && this.isDirectMode) {
            console.log("[AppManager] Direct mode detected, removing in-room game ID and saving direct mode info");
            sessionManager.removeInRoomGameId();
            this.saveDirectModeInfo();
        }
        this.loadDirectModeInfo();
        console.log("[AppManager] Direct mode info loaded");
        this.authorized = await this.authorizeByUserService();
        console.log("[AppManager] Authorization result:", this.authorized);
        await this.initNotificationService();
        console.log("[AppManager] SSO and authorization process completed");
    }

    private async handleCurrencyGroup() {
        console.log("[AppManager] Handling currency group...");
        const urlParams = new URLSearchParams(window.location.search);
        let currencyGroup: string;
        if (urlParams.has("cg")) {
            currencyGroup = urlParams.get("cg");
            console.log("[AppManager] Currency group from URL:", currencyGroup);
            StorageManager.set("currency_group", currencyGroup);
        } else {
            currencyGroup = StorageManager.get("currency_group");
            console.log("[AppManager] Currency group from storage:", currencyGroup);
        }

        await lobbyResourceManager.init(currencyGroup);
        console.log("[AppManager] Currency group handling completed");
    }

    private handleAppMode() {
        console.log("[AppManager] Handling app mode...");
        const urlParams = this.urlParams;
        if (urlParams.has(UrlInfo.Ref) && urlParams.has("gameId") && urlParams.get("gameId") !== "0") {
            const gameId = urlParams.get("gameId");
            const refData = urlParams.get(UrlInfo.Ref);
            console.log("[AppManager] Processing ref data:", refData, "for game ID:", gameId);

            if (this.checkDirectModeRefData(refData)) {
                console.log("[AppManager] Direct mode detected from ref data");
                this.urlInfo[UrlInfo.Ref] = refData;
                this.urlInfo[UrlInfo.DirectGameId] = gameId;
                if (urlParams.has("rurl") && urlParams.get("rurl") !== "") {
                    this.urlInfo[UrlInfo.ReturnUrl] = urlParams.get("rurl");
                    console.log("[AppManager] Return URL set:", urlParams.get("rurl"));
                }
                this.isDirectMode = true;
            }

            if (this.checkPFFData(refData)) {
                console.log("[AppManager] PFF mode detected from ref data");
                this._PFF = true;
            }
        }

        if (urlParams.has(UrlInfo.Ref) && this.checkAppModeRefData(urlParams.get(UrlInfo.Ref))) {
            console.log("[AppManager] App mode detected from ref data");
            this._appMode = true;
        }

        if (!urlParams.has(UrlInfo.params)) {
            console.log("[AppManager] No params in URL, skipping session params handling");
            return;
        }

        const params = UrlParamsService.getInstance().parseAndCache(UrlInfo.params) as ISessionParams;
        console.log("[AppManager] Session params parsed:", params);

        if (params?.isUserGesture !== undefined) {
            AudioManager.getInstance().isUserGesture = params.isUserGesture;
            window.isUserGesture = params.isUserGesture;
            console.log("[AppManager] User gesture set:", params.isUserGesture);
        }

        this.handleForAudioSetting(params);
        console.log("[AppManager] App mode handling completed");
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
        console.log("[AppManager] Saving direct mode info...");
        const ss = window.authData.ss;
        const data = {
            ss,
            ref: this.urlInfo[UrlInfo.Ref],
            returnUrl: this.urlInfo[UrlInfo.ReturnUrl],
            directGameId: this.urlInfo[UrlInfo.DirectGameId]
        };
        console.log("[AppManager] Direct mode data to save:", data);
        sessionManager.storeDirectMode(data);
    }

    private loadDirectModeInfo() {
        console.log("[AppManager] Loading direct mode info...");
        const data = sessionManager.getDirectMode();
        if (data) {
            console.log("[AppManager] Found direct mode data:", data);
            if (window.authData.ss === data.ss) {
                console.log("[AppManager] SS matches, restoring direct mode");
                this.urlInfo[UrlInfo.Ref] = data[UrlInfo.Ref];
                this.urlInfo[UrlInfo.ReturnUrl] = data[UrlInfo.ReturnUrl];
                this.urlInfo[UrlInfo.DirectGameId] = data[UrlInfo.DirectGameId];
                this.isDirectMode = true;
            } else {
                console.log("[AppManager] SS mismatch, not restoring direct mode");
            }
        } else {
            console.log("[AppManager] No direct mode data found");
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
        console.log("[AppManager] Attempting authorization via UserService, retry:", retryCount);
        try {
            const { ss, username } = window.authData;
            console.log("[AppManager] Auth data - SS:", ss ? "present" : "missing", "Username:", username);
            const response: any = await UserService.getInstance().auth.authorize(ss, username);
            console.log("[AppManager] Authorization response:", response);

            if (authManager.checkUM(response)) {
                console.log("[AppManager] UM check failed");
                return false;
            }

            if (response.isSuccessful !== undefined && !response.isSuccessful) {
                console.log("[AppManager] Authorization unsuccessful, signing out");
                uiManager.emitter.emit(InternalEvents.SIGN_OUT);
                return false;
            }

            const result = await this.handleAuthorizedResponse(response);
            console.log("[AppManager] Authorization result:", result);
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
        console.log("[AppManager] Requesting SSO...");
        return new Promise<void>((resolve) => {
            if (cc.sys.isBrowser && authManager) {
                console.log("[AppManager] Browser environment detected, checking SSO");
                authManager.checkSSO(() => {
                    console.log("[AppManager] SSO check completed");
                    authManager.setRecheckInInterval();
                    resolve();
                });
            } else {
                console.log("[AppManager] Non-browser environment, skipping SSO check");
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
