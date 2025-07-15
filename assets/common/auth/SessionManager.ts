import * as i18n from "i18n/runtime-scripts/LanguageData";

import { StorageManager } from "../../managers/StorageManager";



declare global {
    export interface Window {
        i18n?: {
            languages?: any;
            curLang?: string;
        };
    }
}
export interface Session {
    username: string;
    language: string;
    ss: string;
    time: Date;
    isAuthenticated: boolean;
    system: number;
}

const sessionIdStorageName = "scss";
const micrositeGameIdKey = "microsite_game_id";
const clearStorageMicroSiteKey = "clear_storage_microsite";
const checkedTournamentPromotionFirstSso = "checked_tournament_promotion_first_sso";
const checkedFreeSpinsPromotionFirstSso = "checked_free_spins_promotion_first_sso";

export function getSessionKey() {

    if (window.location && window.location.hostname) {
        const sessionKey = `${window.location.hostname}.${sessionIdStorageName}`;

        return sessionKey;
    }


    return sessionIdStorageName;
}

export function removeSession() {

    const sessionKey = getSessionKey();
    StorageManager.remove(sessionKey);

}

export function getSession(): Session {

    const session = StorageManager.get(getSessionKey()) ?? {};

    return session;
}

export function storeSessionData(data) {

    updateLanguage(data);
    StorageManager.set(getSessionKey(), data);

}

export function getLanguage(locale) {

    const dict = {
        "vi-VN": "vi",
        "en-US": "en",
        "en-UK": "en",
        "th-TH": "th",
        "id-ID": "id",
        "zh-CN": "zh_cn",
        "zh-TW": "zh_tw"
    };
    const language = dict[locale] || "en";

    return language;
}

export function getLocale() {

    const data = getSession();
    const locale = data.language;

    return locale;
}

export function updateLanguage(data) {

    const locale = data.language;
    const language = getLanguage(locale);
    setLanguage(language);

}

export function setLanguage(language: string) {

    i18n.init(language);
    StorageManager.set(`current_language`, language);

}

export function getCacheLanguage(): string {

    const language = StorageManager.get(`current_language`) ?? "vi";

    return language;
}

function getInRoomGameIdKey() {
    return "current_game_room_id";
}

function getInRoomGameIdStorage() {

    const data = StorageManager.get(getInRoomGameIdKey()) ?? {};

    return data;
}

export function storeInRoomGameId(gameId) {

    cc.log("--------------------- storeInRoomGameId", gameId);
    const session = getSession();
    const ss = session.ss;
    if (ss) {
        const data = { ss, gameId };
        StorageManager.set(getInRoomGameIdKey(), data);

    } else {
        console.warn("[SessionManager] No session SS found, cannot store in-room game ID");
    }
}

const StorageKeyDummyRoom = "dummy-room";

export function storeDummyRoom(gameId) {

    cc.log("---------------------------store dummy room", gameId);
    const session = getSession();
    const ss = session.ss;
    if (ss) {
        const data = { ss, gameId };
        StorageManager.set(StorageKeyDummyRoom, data);

    } else {
        console.warn("[SessionManager] No session SS found, cannot store dummy room");
    }
}

export function getDummyRoomStorage() {

    const session = getSession();
    const ss = session.ss;
    if (ss) {
        const data = StorageManager.get(StorageKeyDummyRoom);
        if (data) {
            if (data.ss === ss) {

                return { gameId: data.gameId };
            }
        }
    }

    return null;
}

export function getInRoomGameId(checkValid = true) {

    const data = getInRoomGameIdStorage();
    if (checkValid) {
        const session = getSession();
        if (data.ss && session.ss && data.ss === session.ss) {

            return data.gameId;
        }

        return 0;
    } else {
        const gameId = data?.gameId || 0;
        return gameId;
    }
}

export function removeInRoomGameId() {

    cc.log("--------------------- removeInRoomGameId");
    StorageManager.remove(getInRoomGameIdKey());

}

export function getDirectMode() {

    const directMode = StorageManager.get("direct_mode");

    return directMode;
}

export function storeDirectMode(data) {

    StorageManager.set("direct_mode", data);

}

export function removeDirectMode() {

    StorageManager.remove("direct_mode");

}

export function getMicrositeGameId() {

    const gameId = StorageManager.get(micrositeGameIdKey) ?? 0;

    return gameId;
}

export function storeMicrositeGameId(gameId) {

    StorageManager.set(micrositeGameIdKey, gameId);

}

export function removeMicrositeGameId() {

    StorageManager.remove(micrositeGameIdKey);

}

export function getClearStorageMicroSite(): boolean {

    const isClear = StorageManager.get(clearStorageMicroSiteKey) ?? false;

    return isClear;
}

export function clearStorageMicroSite(isClear: boolean) {

    StorageManager.set(clearStorageMicroSiteKey, isClear);

}

export function getOperator() {

    const operator = StorageManager.get("current_operator");

    return operator;
}

export function storeOperator(data) {

    StorageManager.set("current_operator", data);

}

export function removeOperator() {

    StorageManager.remove("current_operator");

}

export function setCheckedTournamentPromotionFirstSso(data = true) {

    StorageManager.set(checkedTournamentPromotionFirstSso, data);

}

export function getCheckedTournamentPromotionFirstSso(): boolean {

    const checked = StorageManager.get(checkedTournamentPromotionFirstSso) ?? false;

    return checked;
}

export function setCheckedFreeSpinsPromotionFirstSso(data = true) {

    StorageManager.set(checkedFreeSpinsPromotionFirstSso, data);

}

export function getCheckedFreeSpinsPromotionFirstSso(): boolean {

    const checked = StorageManager.get(checkedFreeSpinsPromotionFirstSso) ?? false;

    return checked;
}

export function removeCheckedTournamentPromotionFirstSso() {

    StorageManager.remove(checkedTournamentPromotionFirstSso);

}

export function removeCheckedFreeSpinsPromotionFirstSso() {

    StorageManager.remove(checkedFreeSpinsPromotionFirstSso);

}

declare global {
    export interface Window {
        authData: Session;
        isSSO: boolean;
    }
}


