import { appContainer } from "../../Application";
// Removed lobby import - creating stub implementation
import { appManager } from "../../managers/AppManager";
import { uiManager } from "../../managers/GameUIManager";
import { InternalEvents } from "../../managers/InternalEvents";
import { IUserStakeLevel, UserData } from "./UserManagerModel";

// Stub implementation for LobbyMenuConfig
class LobbyMenuConfig {
    list: number[] = [];
    // Stub implementation
}



export default class UserManager {
    private static instance: UserManager;
    private _data: UserData;

    private constructor() {
        
        this._data = new UserData();
        
    }

    get user() {
        
        return this._data;
    }

    get userName() {
        
        return this._data.name;
    }

    get balance() {
        
        return this._data.red;
    }

    get rate() {
        
        return this._data.rate;
    }

    get stakeLevel() {
        
        return this._data.userStakeLevel;
    }

    get scoins() {
        
        return this._data.scoins;
    }

    get offerGames() {
        
        return this._data.offerGames;
    }

    get offerGamesIncludeSubGames() {
        
        return this._data.offerGamesIncludeSubGames;
    }

    get availSpins() {
        
        return this._data.availSpins;
    }

    get currency() {
        
        return this._data.currency;
    }

    get UID() {
        
        return this._data.UID;
    }

    get avatarId() {
        
        return this._data.avatarId;
    }

    get fractionalOddsFormat() {
        
        return this._data.fractionalOddsFormat;
    }

    get isDisplayPlayerCurrency() {
        
        return this._data.isDisplayPlayerCurrency;
    }

    get disableJackpotGames() {
        
        return this._data.disableJackpotGames;
    }

    get multiplier() {
        
        return this._data.multiplier;
    }

    get currencyCode() {
        
        return this._data.currencyCode;
    }

    get currencyGroup() {
        
        return this._data.currencyGroup;
    }

    public static getInstance(): UserManager {
        
        if (!UserManager.instance) {
            
            UserManager.instance = new UserManager();
        } else {
            
        }

        return UserManager.instance;
    }

    public updateUser(userData: any) {
        
        Object.keys(userData).forEach((name: string) => {
            if (name === "offerGames") {
                
                this.parseOfferGames(userData);
                return;
            }
            
            this._data[name] = userData?.[name];
        });

        
        appManager.currentScene?.loadUserData(userData);
        
    }

    private parseOfferGames(data) {
        
        const offerGames = data.offerGames.map((game) => game.gameId);
        

        // Since lobby is removed, we'll use all offer games directly
        const list = [...offerGames];
        

        userManager.updateOfferGamesIncludeSubGames(offerGames);
        userManager.updateOfferGames(list);
        
    }

    public setSpecificName(name: keyof UserData | any, data: string | number | any): void {
        
        try {
            this._data[name] = data;
            
        } catch (error) {
            console.error("[UserManager] Error setting specific name:", error);
            
        }
    }

    public getSpecificName(name: keyof UserData | any): string {
        
        const value = this._data[name] ?? "";
        
        return value;
    }

    public updateUserBalance(balance: number): void {
        
        this._data.red = balance;
        
    }

    public isLoginUser(name: string): boolean {
        
        const isLogin = name === this._data.name;
        
        return isLogin;
    }

    public updateUserStakeLevel(data: IUserStakeLevel): boolean {
        
        

        if (this._data.userStakeLevel.minBet === data.minBet && this._data.userStakeLevel.maxBet === data.maxBet) {
            
            return false;
        }

        this._data = { ...this._data, userStakeLevel: data };
        
        uiManager.emitter.emit(InternalEvents.USER_STAKE_LEVEL_UPDATED);

        
        return true;
    }

    public updateOfferGames(offerGames: number[]) {
        
        this._data.offerGames = [...offerGames];
        
    }

    public updateOfferGamesIncludeSubGames(offerGames: number[]) {
        
        this._data.offerGamesIncludeSubGames = [...offerGames];
        
    }
}


export const userManager = UserManager.getInstance();

