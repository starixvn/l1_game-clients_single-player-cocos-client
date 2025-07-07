import EventEmitterBase from "../../../common/emitter/EventEmitterBase";

type UserProfileType = {
    name?: string;
    red?: number;
    avatarId?: number;
};

export class UserProfileModel extends EventEmitterBase {
    static Events = {
        UPDATE_NAME: "UserProfileModel:UPDATE_NAME",
        UPDATE_BALANCE: "UserProfileModel:UPDATE_BALANCE",
        UPDATE_AVATAR: "UserProfileModel:UPDATE_AVATAR"
    };

    protected userProfile: UserProfileType = {};

    receivedUserData(data: UserProfileType) {
        this.userProfile = data;
    }

    updateName() {
        this.userProfile.name && this.emit(UserProfileModel.Events.UPDATE_NAME, this.userProfile.name);
    }

    updateBalance() {
        this.userProfile.red && this.emit(UserProfileModel.Events.UPDATE_BALANCE, this.userProfile.red);
    }

    updateAvatar() {
        this.userProfile.avatarId && this.emit(UserProfileModel.Events.UPDATE_AVATAR, this.userProfile.avatarId);
    }

    updateUI() {
        this.updateName();
        this.updateBalance();
        this.updateAvatar();
    }
}
