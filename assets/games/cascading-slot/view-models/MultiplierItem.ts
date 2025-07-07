import GameUtils from "../../../common/GameUtils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MultiplierItem extends cc.Component {
    @property(cc.Sprite)
    center: cc.Sprite = null;

    @property(cc.Sprite)
    centerGlow: cc.Sprite = null;

    @property(cc.SpriteAtlas)
    atlas: cc.SpriteAtlas = null;

    @property(cc.Label)
    value: cc.Label = null;

    @property(cc.Animation)
    animation: cc.Animation = null;

    private _multiplierValue = 1;

    gameId: number;

    get multiplier() {
        return this._multiplierValue;
    }

    async playAnimationGlow() {
        try {
            this.animation.play();
            const duration = this.animation.defaultClip.duration;
            await GameUtils.delayTime(duration);
            this.hideMultiplier();
        } catch (e) {
            console.warn("Catch error after await method", e.message);
        }
    }

    setValue(value: number) {
        this._multiplierValue = value;
        this.value.string = `x${value}`;
        this.updateColor(value);
    }

    protected hideMultiplier() {
        this.value.node.active = false;
        this.animation.stop();
    }

    protected updateColor(value: number) {
        const color = ["green", "blue", "purple", "yellow"];
        let i = 0;
        const range = [10, 20, 30];
        for (; i < range.length; i++) {
            if (value <= range[i]) {
                break;
            }
        }
        const spriteName = `multiplier-${color[i]}`;
        this.center.spriteFrame = this.atlas.getSpriteFrame(spriteName);
        this.centerGlow.spriteFrame = this.atlas.getSpriteFrame(`${spriteName}-glow`);
    }
}
