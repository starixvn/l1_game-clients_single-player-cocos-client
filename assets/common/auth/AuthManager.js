import axios from "axios";
import i18n from "i18n/runtime-scripts/LanguageData";
import EncryptUtils from "../../common/utils/EncryptUtils";
import configs from "../../configs/Configs";
import { appManager } from "../../managers/AppManager";
import { uiManager } from "../../managers/GameUIManager";
import { InternalEvents } from "../../managers/InternalEvents";
import { AXIOS_FAILED_PREFIX } from "../../utils";
import ChipConfig from "../bet-chips/view-models/ChipConfig";
import { isSessionTimeoutError } from "../helpers/ErrorCodeHelper";
import { buildUrlWithPath } from "../helpers/UrlHelper";
import logger from "../logger";
import { userManager } from "../user/UserManager";
import NoticeUtil from "../utils/NoticeUtil";
import NotificationService from "./NotificationService";
import * as SGConnectAPI from "./SGConnectAPI";
import * as sessionManager from "./SessionManager";
import UserService from "./UserService";
import UrlParamsService from "../utils/UrlParamsService";

const sentryLogger = logger();
const sessionExpiredTimeoutMinutes = 19.8;

export const AppTypes = {
    SabaClub: 1,
    SabaApp: 5
};

export function getChipSetting() {
    const request = {
        session: window.authData.ss,
        username: window.authData.username,
        browserUserAgent: window.navigator.userAgent
    };
    const path = configs.env === "" ? "/user" : `/${configs.env}/user`;
    const userServiceUrl = buildUrlWithPath(path);
    axios
        .post(`${userServiceUrl}/settings`, request)
        .then((response) => {
            if (response.data.chips) {
                ChipConfig.getInstance().setData(response.data.chips);
            }
        })
        .catch((error) => {
            throw new Error(`${AXIOS_FAILED_PREFIX} getChipSetting: ${error.message}`);
        });
}

export function checkSSO(onSuccessFunc) {
    console.log("🔐 [AuthManager] Starting SSO check...");

    return new Promise((resolve, reject) => {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            console.log("🔐 [AuthManager] URL parameters:", Object.fromEntries(urlParams.entries()));

            if (checkUMSSO(urlParams) || checkTimeOut(urlParams)) {
                console.log("🔐 [AuthManager] UM SSO or timeout detected, stopping SSO check");
                resolve(false);
                return;
            }

            let session;
            if (urlParams.has("params")) {
                console.log("🔐 [AuthManager] Params found in URL, processing session data");
                session = sessionManager.getSession() || {};
                const params = UrlParamsService.getInstance().parseAndCache("params");
                console.log("🔐 [AuthManager] Parsed params:", params);

                if (params) {
                    session.ss = params.ss;
                    session.isAuthenticated = params.isAuthenticated ?? false;
                    session.memberName = params.memberName;
                    session.username = params.username;
                    session.language = params.language;
                    session.system = params.system;
                    session.umInfo = params.umInfo;
                    session.time = params.time;
                    console.log("🔐 [AuthManager] Session data updated from params:", session);
                    sessionManager.storeSessionData(session);
                    clearQueryStringOnUrl();
                }
            } else {
                console.log("🔐 [AuthManager] No params in URL, getting session from storage");
                session = sessionManager.getSession();
                console.log("🔐 [AuthManager] Session from storage:", session);
            }

            if (checkSignOut(urlParams, session)) {
                console.log("🔐 [AuthManager] Sign out condition detected");
                signOut();
                resolve(false);
                return;
            }

            if (urlParams.has("token")) {
                console.log("🔐 [AuthManager] Token found in URL, processing SSO token");
                checkHasTokenWithPromise(urlParams, onSuccessFunc, resolve, reject);
            } else if (session?.isAuthenticated && session?.ss) {
                console.log("🔐 [AuthManager] Valid session found, setting authorize info");
                setAuthorizeInfo(session);
                sessionManager.updateLanguage(session);
                if (onSuccessFunc) onSuccessFunc();
                resolve(true);
            } else {
                console.log("🔐 [AuthManager] No valid session or token found");
                resolve(false);
            }
        } catch (error) {
            console.error("🔐 [AuthManager] Error in checkSSO:", error);
            reject(error);
        }
    });
}

function checkUMSSO(urlParams) {
    if (urlParams.has("isUM") && urlParams.get("isUM") === "true") {
        console.log("🔐 [AuthManager] UM SSO detected");
        window.umInfo = {
            isUM: true,
            startTime: new Date(),
            endTime: new Date()
        };
        cc.director.loadScene("um");
        return true;
    }
    return false;
}

function checkTimeOut(urlParams) {
    if (urlParams.has("isTimeout") && urlParams.get("isTimeout") === "true") {
        console.log("🔐 [AuthManager] Timeout detected");
        redirectToTimeOutPage();
        return true;
    }

    return false;
}
function getAppType(urlParams) {
    return parseInt(urlParams.get("appType"));
}

function checkSignOut(urlParams, session) {
    const isSessionExpired = verifySession(session);
    console.log("🔐 [AuthManager] Session expired check:", isSessionExpired, "Has token:", urlParams.has("token"));
    return isSessionExpired && !urlParams.has("token");
}

function checkHasToken(urlParams, onSuccessFunc) {
    console.log("🔐 [AuthManager] Processing token-based SSO");
    window.isSSO = true;
    window.appType = getAppType(urlParams);
    console.log("🔐 [AuthManager] App type:", window.appType);

    UserService.getInstance()
        .auth.sso(urlParams.get("token"), getAppType(urlParams))
        .then((response) => {
            console.log("🔐 [AuthManager] SSO response:", response);

            if (checkUM(response)) {
                console.log("🔐 [AuthManager] UM check failed in token processing");
                return;
            }

            if (response.isAuthenticated) {
                console.log("🔐 [AuthManager] SSO authentication successful");
                setAuthorizeInfo(response);
                window.authData.time = new Date();

                sessionManager.storeSessionData(response);
                sessionManager.removeDirectMode();
                sessionManager.removeMicrositeGameId();
                sessionManager.removeCheckedTournamentPromotionFirstSso();
                sessionManager.removeCheckedFreeSpinsPromotionFirstSso();
                clearQueryStringOnUrl();
                if (onSuccessFunc) onSuccessFunc();
            } else {
                console.log("🔐 [AuthManager] SSO authentication failed");
                uiManager.emitter.emit(InternalEvents.SSO_FAILED);
            }
        })
        .catch((error) => {
            console.error("🔐 [AuthManager] SSO token processing error:", error);
            uiManager.emitter.emit(InternalEvents.SSO_ERROR);
            sentryLogger.logError(error);
        });
}

function checkHasTokenWithPromise(urlParams, onSuccessFunc, resolve, reject) {
    console.log("🔐 [AuthManager] Processing token-based SSO with Promise");
    window.isSSO = true;
    window.appType = getAppType(urlParams);
    console.log("🔐 [AuthManager] App type:", window.appType);

    UserService.getInstance()
        .auth.sso(urlParams.get("token"), getAppType(urlParams))
        .then((response) => {
            console.log("🔐 [AuthManager] SSO response:", response);

            if (checkUM(response)) {
                console.log("🔐 [AuthManager] UM check failed in token processing");
                resolve(false);
                return;
            }

            if (response.isAuthenticated) {
                console.log("🔐 [AuthManager] SSO authentication successful");
                setAuthorizeInfo(response);
                window.authData.time = new Date();

                sessionManager.storeSessionData(response);
                sessionManager.removeDirectMode();
                sessionManager.removeMicrositeGameId();
                sessionManager.removeCheckedTournamentPromotionFirstSso();
                sessionManager.removeCheckedFreeSpinsPromotionFirstSso();
                clearQueryStringOnUrl();
                if (onSuccessFunc) onSuccessFunc();
                resolve(true);
            } else {
                console.log("🔐 [AuthManager] SSO authentication failed");
                uiManager.emitter.emit(InternalEvents.SSO_FAILED);
                resolve(false);
            }
        })
        .catch((error) => {
            console.error("🔐 [AuthManager] SSO token processing error:", error);
            uiManager.emitter.emit(InternalEvents.SSO_ERROR);
            sentryLogger.logError(error);
            reject(error);
        });
}

export function updateSession(session, params) {
    console.log("🔐 [AuthManager] Updating session with params:", params);
    session.time = new Date(+params.time);
    session.ss = params.ss;
    session.memberName = params.memberName;
    session.username = params.username;
    session.isAuthenticated = params.isAuthenticated;
    session.language = params.language;

    sessionManager.storeSessionData(session);
    console.log("🔐 [AuthManager] Session updated and stored");

    return session;
}

export function setAuthorizeInfo(session) {
    console.log("🔐 [AuthManager] Setting authorize info:", session);
    window.authData = session;
    getChipSetting();
    sentryLogger.setUser(session);
}

export function clearQueryStringOnUrl() {
    console.log("🔐 [AuthManager] Clearing query string from URL");
    try {
        history.pushState(null, "", location.href.split("?")[0]);
    } catch (ex) {
        console.log("🔐 [AuthManager] Error clearing query string:", ex);
    }
}

export function signOut() {
    console.log("🔐 [AuthManager] Signing out user");
    redirectToTimeOutPage();
    sessionManager.removeSession();
}

function redirectToTimeOutPage() {
    console.log("🔐 [AuthManager] Redirecting to timeout page");
    if (window.authData?.system === AppTypes.SabaApp) {
        console.log("🔐 [AuthManager] Redirecting to app timeout page");
        SGConnectAPI.redirectToAppTimeoutPage(sessionManager.getLocale());
    } else {
        console.log("🔐 [AuthManager] Loading session timeout scene");
        cc.director.loadScene("sessiontimeout");
    }
}

export function checkUM(response) {
    if (response && response.isUM) {
        console.log("🔐 [AuthManager] UM response detected:", response.umInfo);
        window.umInfo = response.umInfo;
        redirectToUMPage(response);
        return true;
    }

    return false;
}

export function redirectToUMPage(response) {
    console.log("🔐 [AuthManager] Redirecting to UM page");
    if (window.authData?.system === AppTypes.SabaApp || response?.system === AppTypes.SabaApp || window.appType === AppTypes.SabaApp) {
        const operatorId = window.umInfo?.operatorId;
        console.log("🔐 [AuthManager] Redirecting to app UM page for operator:", operatorId);
        SGConnectAPI.redirectToAppUMPage(operatorId, sessionManager.getLocale());
    } else {
        console.log("🔐 [AuthManager] Loading UM scene");
        cc.director.loadScene("um");
    }
}

export function verifySession(session) {
    console.log("🔐 [AuthManager] Verifying session:", session);
    let isSessionExpired = true;

    try {
        if (session && session.time) {
            const now = new Date();
            const lastRecheckIn = new Date(session.time);
            const differenceInMinutes = Math.abs(now - lastRecheckIn) / (1000 * 60);

            console.log("🔐 [AuthManager] Session time difference (minutes):", differenceInMinutes);
            console.log("🔐 [AuthManager] Session timeout threshold (minutes):", sessionExpiredTimeoutMinutes);

            if (differenceInMinutes <= sessionExpiredTimeoutMinutes) {
                isSessionExpired = false;
            }
        }
    } catch (ex) {
        console.error("🔐 [AuthManager] Error verifying session:", ex);
        sentryLogger.logError(ex);
    }

    console.log("🔐 [AuthManager] Session expired:", isSessionExpired);
    return isSessionExpired;
}

export function setRecheckInInterval() {
    console.log("🔐 [AuthManager] Setting recheck-in interval");
    removeRecheckInInterval();
    window.reCheckInId = setInterval(() => {
        console.log("🔐 [AuthManager] Recheck-in interval triggered");
        reCheckIn();
    }, 60 * 1000);
}

export function removeRecheckInInterval() {
    if (window.reCheckInId) {
        console.log("🔐 [AuthManager] Removing recheck-in interval");
        clearInterval(window.reCheckInId);
    }
}

export function reCheckIn() {
    console.log("🔐 [AuthManager] Starting recheck-in process");
    try {
        const session = sessionManager.getSession();
        const isSessionExpired = verifySession(session);

        if (isSessionExpired) {
            console.log("🔐 [AuthManager] Session expired during recheck-in, signing out");
            signOut();
        } else {
            console.log("🔐 [AuthManager] Session valid, performing recheck-in");
            UserService.getInstance()
                .auth.reCheckIn(session.ss, session.username)
                .then((response) => {
                    console.log("🔐 [AuthManager] Recheck-in response:", response);
                    if (response.isSuccessful) {
                        handleResponse(session, response);
                    } else {
                        console.log("🔐 [AuthManager] Recheck-in unsuccessful, signing out");
                        signOut();
                    }
                })
                .catch((error) => {
                    console.error("🔐 [AuthManager] Recheck-in error:", error);
                    sentryLogger.logError(error);
                });
        }
    } catch (ex) {
        console.error("🔐 [AuthManager] Recheck-in exception:", ex);
    }
}

function handleResponse(session, response) {
    console.log("🔐 [AuthManager] Handling recheck-in response");
    session.time = new Date();
    sessionManager.storeSessionData(session);

    if (response.apiError) {
        const errorCode = response.apiError.errorCode.toString();
        console.log("🔐 [AuthManager] API error in response:", errorCode);
        if (response.isDisableAccount) {
            console.log("🔐 [AuthManager] Account disabled, showing message");
            showMessageForAccountClosed(errorCode);
        } else if (isSessionTimeoutError(errorCode)) {
            console.log("🔐 [AuthManager] Session timeout error, showing message");
            showMessageForExpiredToken(errorCode);
        } else {
            console.log("🔐 [AuthManager] Other API error, showing notice");
            const message = NoticeUtil.getLocalizedErrorMessage(errorCode, { errorCode });
            const noticeData = { text: message };
            appManager.currentScene?.showNotice(noticeData);
        }
    } else {
        console.log("🔐 [AuthManager] No API error, updating user balance");
        updateUserBalance(response);
    }
}

function parseBalanceToRed(data) {
    if (data.balance) {
        data.red = data.balance;
    }
    return data;
}

export function updateUserBalance(data) {
    console.log("🔐 [AuthManager] Updating user balance:", data);
    const parsedData = parseBalanceToRed(data);
    userManager.updateUser(parsedData);
}

export function showMessageForAccountClosed(errorCode) {
    const noticeData = {
        text: i18n.t("messages.accountClosed", { errorCode: errorCode })
    };
    showMessageAndAutoSignOut(noticeData);
}

export function showMessageForExpiredToken(errorCode) {
    let text = `${i18n.t("messages.sessionTimeout")} (${errorCode})`;

    if (window.authData?.system === AppTypes.SabaApp) {
        text = `${i18n.t("messages.sessionExpired")} (${errorCode})`;
    }
    const noticeData = {
        text
    };
    showMessageAndAutoSignOut(noticeData);
}

function showMessageAndAutoSignOut(noticeData) {
    setTimeout(signOut, 10000);
    appManager.currentScene?.showNotice(noticeData, signOut, signOut);
    NotificationService.getInstance().forceKickedOut();
}
