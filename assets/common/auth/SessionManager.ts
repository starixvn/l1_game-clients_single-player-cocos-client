import * as i18n from "i18n/runtime-scripts/LanguageData";

import { StorageManager } from "../../managers/StorageManager";

console.log("[SessionManager] Loading SessionManager module...");

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
    console.log("[SessionManager] Getting session key...");
    if (window.location && window.location.hostname) {
        const sessionKey = `${window.location.hostname}.${sessionIdStorageName}`;
        console.log("[SessionManager] Session key with hostname:", sessionKey);
        return sessionKey;
    }

    console.log("[SessionManager] Session key without hostname:", sessionIdStorageName);
    return sessionIdStorageName;
}

export function removeSession() {
    console.log("[SessionManager] Removing session...");
    const sessionKey = getSessionKey();
    StorageManager.remove(sessionKey);
    console.log("[SessionManager] Session removed for key:", sessionKey);
}

export function getSession(): Session {
    console.log("[SessionManager] Getting session...");
    const session = StorageManager.get(getSessionKey()) ?? {};
    console.log("[SessionManager] Session retrieved:", !!session.username, "username:", session.username);
    return session;
}

export function storeSessionData(data) {
    console.log("[SessionManager] Storing session data:", data);
    updateLanguage(data);
    StorageManager.set(getSessionKey(), data);
    console.log("[SessionManager] Session data stored successfully");
}

export function getLanguage(locale) {
    console.log("[SessionManager] Getting language for locale:", locale);
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
    console.log("[SessionManager] Language resolved:", language);
    return language;
}

export function getLocale() {
    console.log("[SessionManager] Getting locale...");
    const data = getSession();
    const locale = data.language;
    console.log("[SessionManager] Current locale:", locale);
    return locale;
}

export function updateLanguage(data) {
    console.log("[SessionManager] Updating language with data:", data);
    const locale = data.language;
    const language = getLanguage(locale);
    setLanguage(language);
    console.log("[SessionManager] Language updated to:", language);
}

export function setLanguage(language: string) {
    console.log("[SessionManager] Setting language:", language);
    i18n.init(language);
    StorageManager.set(`current_language`, language);
    console.log("[SessionManager] Language set and stored:", language);
}

export function getCacheLanguage(): string {
    console.log("[SessionManager] Getting cached language...");
    const language = StorageManager.get(`current_language`) ?? "vi";
    console.log("[SessionManager] Cached language:", language);
    return language;
}

function getInRoomGameIdKey() {
    return "current_game_room_id";
}

function getInRoomGameIdStorage() {
    console.log("[SessionManager] Getting in-room game ID storage...");
    const data = StorageManager.get(getInRoomGameIdKey()) ?? {};
    console.log("[SessionManager] In-room game ID storage data:", data);
    return data;
}

export function storeInRoomGameId(gameId) {
    console.log("[SessionManager] Storing in-room game ID:", gameId);
    cc.log("--------------------- storeInRoomGameId", gameId);
    const session = getSession();
    const ss = session.ss;
    if (ss) {
        const data = { ss, gameId };
        StorageManager.set(getInRoomGameIdKey(), data);
        console.log("[SessionManager] In-room game ID stored successfully");
    } else {
        console.warn("[SessionManager] No session SS found, cannot store in-room game ID");
    }
}

const StorageKeyDummyRoom = "dummy-room";

export function storeDummyRoom(gameId) {
    console.log("[SessionManager] Storing dummy room for game ID:", gameId);
    cc.log("---------------------------store dummy room", gameId);
    const session = getSession();
    const ss = session.ss;
    if (ss) {
        const data = { ss, gameId };
        StorageManager.set(StorageKeyDummyRoom, data);
        console.log("[SessionManager] Dummy room stored successfully");
    } else {
        console.warn("[SessionManager] No session SS found, cannot store dummy room");
    }
}

export function getDummyRoomStorage() {
    console.log("[SessionManager] Getting dummy room storage...");
    const session = getSession();
    const ss = session.ss;
    if (ss) {
        const data = StorageManager.get(StorageKeyDummyRoom);
        if (data) {
            if (data.ss === ss) {
                console.log("[SessionManager] Dummy room found:", { gameId: data.gameId });
                return { gameId: data.gameId };
            }
        }
    }
    console.log("[SessionManager] No valid dummy room found");
    return null;
}

export function getInRoomGameId(checkValid = true) {
    console.log("[SessionManager] Getting in-room game ID, checkValid:", checkValid);
    const data = getInRoomGameIdStorage();
    if (checkValid) {
        const session = getSession();
        if (data.ss && session.ss && data.ss === session.ss) {
            console.log("[SessionManager] Valid in-room game ID found:", data.gameId);
            return data.gameId;
        }
        console.log("[SessionManager] Invalid or no in-room game ID, returning 0");
        return 0;
    } else {
        const gameId = data?.gameId || 0;
        console.log("[SessionManager] In-room game ID (no validation):", gameId);
        return gameId;
    }
}

export function removeInRoomGameId() {
    console.log("[SessionManager] Removing in-room game ID...");
    cc.log("--------------------- removeInRoomGameId");
    StorageManager.remove(getInRoomGameIdKey());
    console.log("[SessionManager] In-room game ID removed successfully");
}

export function getDirectMode() {
    console.log("[SessionManager] Getting direct mode...");
    const directMode = StorageManager.get("direct_mode");
    console.log("[SessionManager] Direct mode:", directMode);
    return directMode;
}

export function storeDirectMode(data) {
    console.log("[SessionManager] Storing direct mode:", data);
    StorageManager.set("direct_mode", data);
    console.log("[SessionManager] Direct mode stored successfully");
}

export function removeDirectMode() {
    console.log("[SessionManager] Removing direct mode...");
    StorageManager.remove("direct_mode");
    console.log("[SessionManager] Direct mode removed successfully");
}

export function getMicrositeGameId() {
    console.log("[SessionManager] Getting microsite game ID...");
    const gameId = StorageManager.get(micrositeGameIdKey) ?? 0;
    console.log("[SessionManager] Microsite game ID:", gameId);
    return gameId;
}

export function storeMicrositeGameId(gameId) {
    console.log("[SessionManager] Storing microsite game ID:", gameId);
    StorageManager.set(micrositeGameIdKey, gameId);
    console.log("[SessionManager] Microsite game ID stored successfully");
}

export function removeMicrositeGameId() {
    console.log("[SessionManager] Removing microsite game ID...");
    StorageManager.remove(micrositeGameIdKey);
    console.log("[SessionManager] Microsite game ID removed successfully");
}

export function getClearStorageMicroSite(): boolean {
    console.log("[SessionManager] Getting clear storage microsite flag...");
    const isClear = StorageManager.get(clearStorageMicroSiteKey) ?? false;
    console.log("[SessionManager] Clear storage microsite flag:", isClear);
    return isClear;
}

export function clearStorageMicroSite(isClear: boolean) {
    console.log("[SessionManager] Setting clear storage microsite flag:", isClear);
    StorageManager.set(clearStorageMicroSiteKey, isClear);
    console.log("[SessionManager] Clear storage microsite flag set successfully");
}

export function getOperator() {
    console.log("[SessionManager] Getting operator...");
    const operator = StorageManager.get("current_operator");
    console.log("[SessionManager] Current operator:", operator);
    return operator;
}

export function storeOperator(data) {
    console.log("[SessionManager] Storing operator:", data);
    StorageManager.set("current_operator", data);
    console.log("[SessionManager] Operator stored successfully");
}

export function removeOperator() {
    console.log("[SessionManager] Removing operator...");
    StorageManager.remove("current_operator");
    console.log("[SessionManager] Operator removed successfully");
}

export function setCheckedTournamentPromotionFirstSso(data = true) {
    console.log("[SessionManager] Setting checked tournament promotion first SSO:", data);
    StorageManager.set(checkedTournamentPromotionFirstSso, data);
    console.log("[SessionManager] Tournament promotion first SSO flag set successfully");
}

export function getCheckedTournamentPromotionFirstSso(): boolean {
    console.log("[SessionManager] Getting checked tournament promotion first SSO...");
    const checked = StorageManager.get(checkedTournamentPromotionFirstSso) ?? false;
    console.log("[SessionManager] Tournament promotion first SSO checked:", checked);
    return checked;
}

export function setCheckedFreeSpinsPromotionFirstSso(data = true) {
    console.log("[SessionManager] Setting checked free spins promotion first SSO:", data);
    StorageManager.set(checkedFreeSpinsPromotionFirstSso, data);
    console.log("[SessionManager] Free spins promotion first SSO flag set successfully");
}

export function getCheckedFreeSpinsPromotionFirstSso(): boolean {
    console.log("[SessionManager] Getting checked free spins promotion first SSO...");
    const checked = StorageManager.get(checkedFreeSpinsPromotionFirstSso) ?? false;
    console.log("[SessionManager] Free spins promotion first SSO checked:", checked);
    return checked;
}

export function removeCheckedTournamentPromotionFirstSso() {
    console.log("[SessionManager] Removing checked tournament promotion first SSO...");
    StorageManager.remove(checkedTournamentPromotionFirstSso);
    console.log("[SessionManager] Tournament promotion first SSO flag removed successfully");
}

export function removeCheckedFreeSpinsPromotionFirstSso() {
    console.log("[SessionManager] Removing checked free spins promotion first SSO...");
    StorageManager.remove(checkedFreeSpinsPromotionFirstSso);
    console.log("[SessionManager] Free spins promotion first SSO flag removed successfully");
}

declare global {
    export interface Window {
        authData: Session;
        isSSO: boolean;
    }
}

console.log("[SessionManager] SessionManager module loaded successfully");
