import GameUtils from "../../../common/GameUtils";
import { numberWithCommas } from "../../../common/helpers/NumberHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Header extends cc.Component {
    @property(cc.Sprite)
    avatar: cc.Sprite = null;

    @property(cc.Label)
    userName: cc.Label = null;

    @property(cc.Label)
    userRed: cc.Label = null;

    @property(cc.Node)
    scoinsNode: cc.Node = null;

    @property(cc.Label)
    scoinsValue: cc.Label = null;

    private readonly data = { name: "", avatar: null, balance: "" };

    onLoad() {
        this.clearUserInfo();
        this.node.active = false;
    }

    active() {
        this.node.active = true;
    }

    clearUserInfo() {
        this.userName.string = this.userRed.string = "";
        this.avatar.node.active = false;
        this.userRed.node.parent.active = false;
    }

    updateDisplay() {
        const { name, avatar, balance } = this.data;

        this.userName.string = name;

        if (avatar) {
            this.avatar.spriteFrame = avatar;
            this.avatar.node.active = true;
        }

        this.userRed.node.parent.active = true;
        this.userRed.string = balance;
    }

    setUserName(userName: string) {
        this.data.name = userName;
        this.updateDisplay();
    }

    setBalance(balance: string) {
        this.data.balance = balance;
        this.updateDisplay();
    }

    setAvatar(avatarId) {
        GameUtils.getAvatarSprite(avatarId).then((frame) => {
            if (this && this.avatar && frame) {
                this.data.avatar = frame;
                this.updateDisplay();
            }
        });
    }

    showScoins(scoins = 0) {
        this.scoinsNode.active = true;
        this.scoinsValue && (this.scoinsValue.string = numberWithCommas(scoins));
    }
}
