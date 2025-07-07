import { changeAvatar, getBalance, getUserInfo } from "../actions/UserActions";
import { User } from "./User";
import { UserBaseHandler } from "./UserBaseHandler";

export const UserEvent = {
    API_ERROR: "API_ERROR",
    GET_BALANCE_ERROR: "GET_BALANCE_ERROR",
    GET_INFO_ERROR: "GET_INFO_ERROR",
    CHANGE_AVATAR_ERROR: "CHANGE_AVATAR_ERROR",
    UPDATE_BALANCE: "UPDATE_BALANCE",
    UPDATE_AVATAR: "UPDATE_AVATAR",
    UPDATE_USER: "UPDATE_USER",
    TOGGLE_MUSIC_SETTING: "TOGGLE_MUSIC_SETTING"
};

export class UserHandler extends UserBaseHandler {
    private static instance: UserHandler;

    private _user: User;

    public static getInstance(): UserHandler {
        if (!this.instance) {
            this.instance = new UserHandler();
        }

        return this.instance;
    }

    constructor() {
        super();

        this.updateUserInfo();
    }

    get user() {
        return this._user;
    }

    async updateBalance(balance?: number) {
        if (balance === undefined) {
            const result = await getBalance(this);
            result && (this._user.balance = result.balance);
        } else {
            this._user.balance = balance;
        }

        this.emit(UserEvent.UPDATE_BALANCE, this._user);
    }

    async updateAvatar(newAvatarId: number) {
        const result = await changeAvatar(this, newAvatarId);
        if (result && this._user) {
            this._user.avatarId = result.avatarId;
            this.emit(UserEvent.UPDATE_AVATAR, this._user.avatarId);
        }
    }

    async updateUserInfo() {
        const userInfo = await getUserInfo(this);
        const balance = await getBalance(this);
        if (userInfo && balance) {
            this._user = new User(userInfo.nickname, userInfo.avatarId, balance.balance, balance.currency, userInfo.isCash);
            this._user && this.emit(UserEvent.UPDATE_USER, this._user);
        }
    }
}
