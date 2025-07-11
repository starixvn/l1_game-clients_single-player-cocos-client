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
    UNKNOWN = -9999,
    DEFAULT = 134
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
        this.urlParams = new URLSearchParams(window.location.search);

        // Ensure direct mode is always used by adding ref=d_direct if not present
        if (!this.urlParams.has(UrlInfo.Ref) || !this.checkDirectModeRefData(this.urlParams.get(UrlInfo.Ref))) {
            this.urlParams.set(UrlInfo.Ref, "d_direct");
        }

        const gameIdParam = this.urlParams.get("gameId");
        if (gameIdParam && gameIdParam !== "0") {
            this.ssoGameId = +gameIdParam;
        } else {
            this.ssoGameId = GameId.DEFAULT; // Default game ID when gameId is missing or equals 0
        }
        const urlParamsObj = {};
        this.urlParams.forEach((value, key) => {
            urlParamsObj[key] = value;
        });

        sentryLogger.start();

        this.initLanguage();

        this.storeOperator();

        AudioManager.getInstance().init();

        this.initShowHideAppEvent();
    }

    clearSSOGameId() {
        this.ssoGameId = GameId.UNKNOWN;
    }

    async initNotificationService() {
        jackpotManager.initEvents();

        await NotificationService.getInstance().forceConnect();

        appManager.initPromotions();
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
        const isDirectModeInRoom = this.isDirectMode && +roomGameId === appManager.directGameId;
        return isDirectModeInRoom;
    }

    get isAppMode() {
        return this._appMode;
    }

    get isPFF() {
        return this._PFF;
    }

    get directGameId() {
        const directGameId = +this.urlInfo[UrlInfo.DirectGameId] || 0;
        return directGameId;
    }

    backToOperatorLobby() {
        const url = appManager.urlInfo[UrlInfo.ReturnUrl];
        if (url) {
            const decodedUrl = EncryptUtils.base64Decode(url);
            window.location.replace(decodedUrl);
        }
    }

    redirectToLobby() {
        const currentSceneName = cc.director.getScene().name;
        if (currentSceneName !== "Lobby") {
            if (appManager.isDirectMode) {
                appManager.backToOperatorLobby();
            } else {
                cc.director.loadScene("Lobby");
            }
        }
    }

    checkDirectModeRefData(refData: string) {
        const directRef = ["d_direct", "m_direct"];
        const isDirectMode = directRef.some((data) => data === refData);
        return isDirectMode;
    }

    checkAppModeRefData(refData) {
        const appModeRef = ["m_connect"];
        const isAppMode = appModeRef.some((data) => data === refData);
        return isAppMode;
    }

    checkPFFData(refData) {
        const playFFRef = ["d_operator_opendirectly", "m_operator_opendirectly"];
        const isPFF = playFFRef.some((data) => data === refData);
        return isPFF;
    }

    forceKickedOut() {
        NotificationService.getInstance().forceKickedOut();
        authManager.signOut();
    }

    async ssoAndAuthorize() {
        this.handleAppMode();

        await this.handleCurrencyGroup();
        await this.requestSSO();
        await getLobbyConfigs();
        if (window.authData && this.isDirectMode) {
            sessionManager.removeInRoomGameId();
            this.saveDirectModeInfo();
        }
        this.loadDirectModeInfo();
        this.authorized = await this.authorizeByUserService();
        await this.initNotificationService();
    }

    private async handleCurrencyGroup() {
        const urlParams = new URLSearchParams(window.location.search);
        let currencyGroup: string;
        if (urlParams.has("cg")) {
            currencyGroup = urlParams.get("cg");
            StorageManager.set("currency_group", currencyGroup);
        } else {
            currencyGroup = StorageManager.get("currency_group");
        }

        await lobbyResourceManager.init(currencyGroup);
    }

    private handleAppMode() {
        const urlParams = this.urlParams;
        if (urlParams.has(UrlInfo.Ref) && urlParams.has("gameId") && urlParams.get("gameId") !== "0") {
            const gameId = urlParams.get("gameId");
            const refData = urlParams.get(UrlInfo.Ref);

            if (this.checkDirectModeRefData(refData)) {
                this.urlInfo[UrlInfo.Ref] = refData;
                this.urlInfo[UrlInfo.DirectGameId] = gameId;
                if (urlParams.has("rurl") && urlParams.get("rurl") !== "") {
                    this.urlInfo[UrlInfo.ReturnUrl] = urlParams.get("rurl");
                }
                this.isDirectMode = true;
            }

            if (this.checkPFFData(refData)) {
                this._PFF = true;
            }
        }

        if (urlParams.has(UrlInfo.Ref) && this.checkAppModeRefData(urlParams.get(UrlInfo.Ref))) {
            this._appMode = true;
        }

        if (!urlParams.has(UrlInfo.params)) {
            return;
        }

        const params = UrlParamsService.getInstance().parseAndCache(UrlInfo.params) as ISessionParams;

        if (params?.isUserGesture !== undefined) {
            AudioManager.getInstance().isUserGesture = params.isUserGesture;
            window.isUserGesture = params.isUserGesture;
        }

        this.handleForAudioSetting(params);
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
        const ss = window.authData.ss;
        const data = {
            ss,
            ref: this.urlInfo[UrlInfo.Ref],
            returnUrl: this.urlInfo[UrlInfo.ReturnUrl],
            directGameId: this.urlInfo[UrlInfo.DirectGameId]
        };
        sessionManager.storeDirectMode(data);
    }

    private loadDirectModeInfo() {
        const data = sessionManager.getDirectMode();
        if (data) {
            if (window.authData.ss === data.ss) {
                this.urlInfo[UrlInfo.Ref] = data[UrlInfo.Ref];
                this.urlInfo[UrlInfo.ReturnUrl] = data[UrlInfo.ReturnUrl];
                this.urlInfo[UrlInfo.DirectGameId] = data[UrlInfo.DirectGameId];
                this.isDirectMode = true;
            }
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
        try {
            const { ss, username } = window.authData;
            const response: any = await UserService.getInstance().auth.authorize(ss, username);

            if (authManager.checkUM(response)) {
                return false;
            }

            if (response.isSuccessful !== undefined && !response.isSuccessful) {
                uiManager.emitter.emit(InternalEvents.SIGN_OUT);
                return false;
            }

            const result = await this.handleAuthorizedResponse(response);
            return result;
        } catch (error) {
            if (retryCount === 3) {
                uiManager.emitter.emit(InternalEvents.SSO_ERROR);
                throw new Error("Can not authorize by UserService " + error.message);
            }
            await delayTime(3);
            retryCount++;
            return this.authorizeByUserService(retryCount);
        }
    }

    private async requestSSO() {
        return new Promise<void>((resolve) => {
            if (cc.sys.isBrowser && authManager) {
                authManager.checkSSO(() => {
                    authManager.setRecheckInInterval();
                    resolve();
                });
            } else {
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
