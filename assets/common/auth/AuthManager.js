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
    try {
        const urlParams = new URLSearchParams(window.location.search);
        if (checkUMSSO(urlParams) || checkTimeOut(urlParams)) {
            return;
        }

        let session;
        if (urlParams.has("params")) {
            session = sessionManager.getSession() || {};
            const params = UrlParamsService.getInstance().parseAndCache("params");

            if (params) {
                session.ss = params.ss;
                session.isAuthenticated = params.isAuthenticated ?? false;
                session.memberName = params.memberName;
                session.username = params.username;
                session.language = params.language;
                session.system = params.system;
                session.umInfo = params.umInfo;
                session.time = params.time;
                sessionManager.storeSessionData(session);
                clearQueryStringOnUrl();
            }
        } else {
            session = sessionManager.getSession();
        }

        if (checkSignOut(urlParams, session)) {
            signOut();
            return;
        }

        if (urlParams.has("token")) {
            checkHasToken(urlParams, onSuccessFunc);
        } else if (session?.isAuthenticated && session?.ss) {
            setAuthorizeInfo(session);
            sessionManager.updateLanguage(session);
            onSuccessFunc();
        }
    } catch (error) {
        console.error("Error in checkSSO:", error);
    }
}

function checkUMSSO(urlParams) {
    if (urlParams.has("isUM") && urlParams.get("isUM") === "true") {
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
    return isSessionExpired && !urlParams.has("token");
}

function checkHasToken(urlParams, onSuccessFunc) {
    window.isSSO = true;
    window.appType = getAppType(urlParams);
    UserService.getInstance()
        .auth.sso(urlParams.get("token"), getAppType(urlParams))
        .then((response) => {
            if (checkUM(response)) {
                return;
            }

            if (response.isAuthenticated) {
                setAuthorizeInfo(response);
                window.authData.time = new Date();

                sessionManager.storeSessionData(response);
                sessionManager.removeDirectMode();
                sessionManager.removeMicrositeGameId();
                sessionManager.removeCheckedTournamentPromotionFirstSso();
                sessionManager.removeCheckedFreeSpinsPromotionFirstSso();
                clearQueryStringOnUrl();
                onSuccessFunc();
            } else {
                uiManager.emitter.emit(InternalEvents.SSO_FAILED);
            }
        })
        .catch((error) => {
            uiManager.emitter.emit(InternalEvents.SSO_ERROR);
            sentryLogger.logError(error);
        });
}

export function updateSession(session, params) {
    session.time = new Date(+params.time);
    session.ss = params.ss;
    session.memberName = params.memberName;
    session.username = params.username;
    session.isAuthenticated = params.isAuthenticated;
    session.language = params.language;

    sessionManager.storeSessionData(session);

    return session;
}

export function setAuthorizeInfo(session) {
    window.authData = session;
    getChipSetting();
    sentryLogger.setUser(session);
}

export function clearQueryStringOnUrl() {
    try {
        history.pushState(null, "", location.href.split("?")[0]);
    } catch (ex) {
        console.log(ex);
    }
}

export function signOut() {
    redirectToTimeOutPage();
    sessionManager.removeSession();
}

function redirectToTimeOutPage() {
    if (window.authData?.system === AppTypes.SabaApp) {
        SGConnectAPI.redirectToAppTimeoutPage(sessionManager.getLocale());
    } else {
        cc.director.loadScene("sessiontimeout");
    }
}

export function checkUM(response) {
    if (response && response.isUM) {
        window.umInfo = response.umInfo;
        redirectToUMPage(response);
        return true;
    }

    return false;
}

export function redirectToUMPage(response) {
    if (window.authData?.system === AppTypes.SabaApp || response?.system === AppTypes.SabaApp || window.appType === AppTypes.SabaApp) {
        const operatorId = window.umInfo?.operatorId;
        SGConnectAPI.redirectToAppUMPage(operatorId, sessionManager.getLocale());
    } else {
        cc.director.loadScene("um");
    }
}

export function verifySession(session) {
    let isSessionExpired = true;

    try {
        if (session && session.time) {
            const now = new Date();
            const lastRecheckIn = new Date(session.time);
            const differenceInMinutes = Math.abs(now - lastRecheckIn) / (1000 * 60);

            if (differenceInMinutes <= sessionExpiredTimeoutMinutes) {
                isSessionExpired = false;
            }
        }
    } catch (ex) {
        sentryLogger.logError(ex);
    }

    return isSessionExpired;
}

export function setRecheckInInterval() {
    removeRecheckInInterval();
    window.reCheckInId = setInterval(() => {
        reCheckIn();
    }, 60 * 1000);
}

export function removeRecheckInInterval() {
    if (window.reCheckInId) {
        clearInterval(window.reCheckInId);
    }
}

export function reCheckIn() {
    try {
        const session = sessionManager.getSession();
        const isSessionExpired = verifySession(session);

        if (isSessionExpired) {
            signOut();
        } else {
            UserService.getInstance()
                .auth.reCheckIn(session.ss, session.username)
                .then((response) => {
                    if (response.isSuccessful) {
                        handleResponse(session, response);
                    } else {
                        signOut();
                    }
                })
                .catch((error) => sentryLogger.logError(error));
        }
    } catch (ex) {
        console.log(JSON.stringify(ex));
    }
}

function handleResponse(session, response) {
    session.time = new Date();
    sessionManager.storeSessionData(session);

    if (response.apiError) {
        const errorCode = response.apiError.errorCode.toString();
        if (response.isDisableAccount) {
            showMessageForAccountClosed(errorCode);
        } else if (isSessionTimeoutError(errorCode)) {
            showMessageForExpiredToken(errorCode);
        } else {
            const message = NoticeUtil.getLocalizedErrorMessage(errorCode, { errorCode });
            const noticeData = { text: message };
            appManager.currentScene?.showNotice(noticeData);
        }
    } else {
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
