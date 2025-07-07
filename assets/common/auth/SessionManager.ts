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
        return `${window.location.hostname}.${sessionIdStorageName}`;
    }

    return sessionIdStorageName;
}

export function removeSession() {
    StorageManager.remove(getSessionKey());
}

export function getSession(): Session {
    return StorageManager.get(getSessionKey()) ?? {};
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
    return dict[locale] || "en";
}

export function getLocale() {
    const data = getSession();
    return data.language;
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
    return StorageManager.get(`current_language`) ?? "vi";
}

function getInRoomGameIdKey() {
    return "current_game_room_id";
}

function getInRoomGameIdStorage() {
    return StorageManager.get(getInRoomGameIdKey()) ?? {};
}

export function storeInRoomGameId(gameId) {
    cc.log("--------------------- storeInRoomGameId", gameId);
    const session = getSession();
    const ss = session.ss;
    if (ss) {
        const data = { ss, gameId };
        StorageManager.set(getInRoomGameIdKey(), data);
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
        return data?.gameId || 0;
    }
}

export function removeInRoomGameId() {
    cc.log("--------------------- removeInRoomGameId");
    StorageManager.remove(getInRoomGameIdKey());
}

export function getDirectMode() {
    return StorageManager.get("direct_mode");
}

export function storeDirectMode(data) {
    StorageManager.set("direct_mode", data);
}

export function removeDirectMode() {
    StorageManager.remove("direct_mode");
}

export function getMicrositeGameId() {
    return StorageManager.get(micrositeGameIdKey) ?? 0;
}

export function storeMicrositeGameId(gameId) {
    StorageManager.set(micrositeGameIdKey, gameId);
}

export function removeMicrositeGameId() {
    StorageManager.remove(micrositeGameIdKey);
}

export function getClearStorageMicroSite(): boolean {
    return StorageManager.get(clearStorageMicroSiteKey) ?? false;
}

export function clearStorageMicroSite(isClear: boolean) {
    StorageManager.set(clearStorageMicroSiteKey, isClear);
}

export function getOperator() {
    return StorageManager.get("current_operator");
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
    return StorageManager.get(checkedTournamentPromotionFirstSso) ?? false;
}

export function setCheckedFreeSpinsPromotionFirstSso(data = true) {
    StorageManager.set(checkedFreeSpinsPromotionFirstSso, data);
}

export function getCheckedFreeSpinsPromotionFirstSso(): boolean {
    return StorageManager.get(checkedFreeSpinsPromotionFirstSso) ?? false;
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
