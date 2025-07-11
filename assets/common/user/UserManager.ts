import { appContainer } from "../../Application";
import LobbyMenuConfig from "../../lobby/main/view-models/LobbyMenuConfig";
import { appManager } from "../../managers/AppManager";
import { uiManager } from "../../managers/GameUIManager";
import { InternalEvents } from "../../managers/InternalEvents";
import { IUserStakeLevel, UserData } from "./UserManagerModel";

console.log("[UserManager] Loading UserManager module...");

export default class UserManager {
    private static instance: UserManager;
    private _data: UserData;

    private constructor() {
        console.log("[UserManager] UserManager constructor called");
        this._data = new UserData();
        console.log("[UserManager] User data initialized");
    }

    get user() {
        console.log("[UserManager] Getting user data");
        return this._data;
    }

    get userName() {
        console.log("[UserManager] Getting user name:", this._data.name);
        return this._data.name;
    }

    get balance() {
        console.log("[UserManager] Getting user balance:", this._data.red);
        return this._data.red;
    }

    get rate() {
        console.log("[UserManager] Getting user rate:", this._data.rate);
        return this._data.rate;
    }

    get stakeLevel() {
        console.log("[UserManager] Getting user stake level:", this._data.userStakeLevel);
        return this._data.userStakeLevel;
    }

    get scoins() {
        console.log("[UserManager] Getting user scoins:", this._data.scoins);
        return this._data.scoins;
    }

    get offerGames() {
        console.log("[UserManager] Getting offer games count:", this._data.offerGames?.length || 0);
        return this._data.offerGames;
    }

    get offerGamesIncludeSubGames() {
        console.log("[UserManager] Getting offer games include sub games count:", this._data.offerGamesIncludeSubGames?.length || 0);
        return this._data.offerGamesIncludeSubGames;
    }

    get availSpins() {
        console.log("[UserManager] Getting available spins:", this._data.availSpins);
        return this._data.availSpins;
    }

    get currency() {
        console.log("[UserManager] Getting user currency:", this._data.currency);
        return this._data.currency;
    }

    get UID() {
        console.log("[UserManager] Getting user UID:", this._data.UID);
        return this._data.UID;
    }

    get avatarId() {
        console.log("[UserManager] Getting user avatar ID:", this._data.avatarId);
        return this._data.avatarId;
    }

    get fractionalOddsFormat() {
        console.log("[UserManager] Getting fractional odds format:", this._data.fractionalOddsFormat);
        return this._data.fractionalOddsFormat;
    }

    get isDisplayPlayerCurrency() {
        console.log("[UserManager] Getting is display player currency:", this._data.isDisplayPlayerCurrency);
        return this._data.isDisplayPlayerCurrency;
    }

    get disableJackpotGames() {
        console.log("[UserManager] Getting disable jackpot games:", this._data.disableJackpotGames);
        return this._data.disableJackpotGames;
    }

    get multiplier() {
        console.log("[UserManager] Getting user multiplier:", this._data.multiplier);
        return this._data.multiplier;
    }

    get currencyCode() {
        console.log("[UserManager] Getting currency code:", this._data.currencyCode);
        return this._data.currencyCode;
    }

    get currencyGroup() {
        console.log("[UserManager] Getting currency group:", this._data.currencyGroup);
        return this._data.currencyGroup;
    }

    public static getInstance(): UserManager {
        console.log("[UserManager] Getting UserManager instance...");
        if (!UserManager.instance) {
            console.log("[UserManager] Creating new UserManager instance");
            UserManager.instance = new UserManager();
        } else {
            console.log("[UserManager] Returning existing UserManager instance");
        }

        return UserManager.instance;
    }

    public updateUser(userData: any) {
        console.log("[UserManager] Updating user with data:", userData);
        Object.keys(userData).forEach((name: string) => {
            if (name === "offerGames") {
                console.log("[UserManager] Parsing offer games...");
                this.parseOfferGames(userData);
                return;
            }
            console.log("[UserManager] Setting user property:", name, "value:", userData?.[name]);
            this._data[name] = userData?.[name];
        });

        console.log("[UserManager] Loading user data in current scene...");
        appManager.currentScene?.loadUserData(userData);
        console.log("[UserManager] User update completed");
    }

    private parseOfferGames(data) {
        console.log("[UserManager] Parsing offer games from data:", data);
        const offerGames = data.offerGames.map((game) => game.gameId);
        console.log("[UserManager] Extracted offer game IDs:", offerGames);

        const menuConfig = appContainer.get(LobbyMenuConfig);
        const list = [];
        menuConfig.list.forEach((id) => {
            if (offerGames.includes(id)) {
                list.push(id);
            }
        });
        console.log("[UserManager] Filtered offer games list:", list);

        userManager.updateOfferGamesIncludeSubGames(offerGames);
        userManager.updateOfferGames(list);
        console.log("[UserManager] Offer games parsing completed");
    }

    public setSpecificName(name: keyof UserData | any, data: string | number | any): void {
        console.log("[UserManager] Setting specific name:", name, "value:", data);
        try {
            this._data[name] = data;
            console.log("[UserManager] Specific name set successfully");
        } catch (error) {
            console.error("[UserManager] Error setting specific name:", error);
            console.log(`Not set data name: ${name}`);
        }
    }

    public getSpecificName(name: keyof UserData | any): string {
        console.log("[UserManager] Getting specific name:", name);
        const value = this._data[name] ?? "";
        console.log("[UserManager] Specific name value:", value);
        return value;
    }

    public updateUserBalance(balance: number): void {
        console.log("[UserManager] Updating user balance from:", this._data.red, "to:", balance);
        this._data.red = balance;
        console.log("[UserManager] User balance updated successfully");
    }

    public isLoginUser(name: string): boolean {
        console.log("[UserManager] Checking if user is login user:", name, "current user:", this._data.name);
        const isLogin = name === this._data.name;
        console.log("[UserManager] Is login user result:", isLogin);
        return isLogin;
    }

    public updateUserStakeLevel(data: IUserStakeLevel): boolean {
        console.log("[UserManager] Updating user stake level:", data);
        console.log("[UserManager] Current stake level:", this._data.userStakeLevel);

        if (this._data.userStakeLevel.minBet === data.minBet && this._data.userStakeLevel.maxBet === data.maxBet) {
            console.log("[UserManager] Stake level unchanged, no update needed");
            return false;
        }

        this._data = { ...this._data, userStakeLevel: data };
        console.log("[UserManager] Stake level updated, emitting USER_STAKE_LEVEL_UPDATED event");
        uiManager.emitter.emit(InternalEvents.USER_STAKE_LEVEL_UPDATED);

        console.log("[UserManager] User stake level update completed");
        return true;
    }

    public updateOfferGames(offerGames: number[]) {
        console.log("[UserManager] Updating offer games:", offerGames);
        this._data.offerGames = [...offerGames];
        console.log("[UserManager] Offer games updated successfully");
    }

    public updateOfferGamesIncludeSubGames(offerGames: number[]) {
        console.log("[UserManager] Updating offer games include sub games:", offerGames);
        this._data.offerGamesIncludeSubGames = [...offerGames];
        console.log("[UserManager] Offer games include sub games updated successfully");
    }
}

console.log("[UserManager] Creating UserManager instance...");
export const userManager = UserManager.getInstance();
console.log("[UserManager] UserManager module loaded successfully");
