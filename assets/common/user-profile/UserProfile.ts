const { ccclass, property } = cc._decorator;

@ccclass
export default class UserProfile extends cc.Component {
    @property(cc.Label)
    userName: cc.Label = null;

    @property(cc.Label)
    userBalance: cc.Label = null;

    @property(cc.Sprite)
    userAvatar: cc.Sprite = null;

    setUserName(text: string) {
        this.userName && (this.userName.string = text);
    }

    setUserAvatar(frame: cc.SpriteFrame) {
        this.userAvatar && (this.userAvatar.spriteFrame = frame);
    }

    setUserBalance(text: string) {
        this.userBalance.string = text;
    }

    updateColor(color: string) {
        this.userBalance.node.color = cc.Color.WHITE.fromHEX(color);
    }
}
