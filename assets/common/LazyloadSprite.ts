import GameUtils from "./GameUtils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LazyloadSprite extends cc.Component {
    @property
    bundleName = "";

    @property
    path = "";

    @property
    suffix = "";

    @property
    autoLoad = false;

    onLoad() {
        if (this.autoLoad) {
            this.loadSprite();
        }
    }

    async loadSprite() {
        const sprite = this.getComponent(cc.Sprite);
        if (!sprite) {
            return;
        }
        try {
            const path = this.suffix === "" ? this.path : `${this.path}${this.suffix}`;
            const spriteFrame = await GameUtils.loadAssetsFromBundle<cc.SpriteFrame>(this.bundleName, path, cc.SpriteFrame, null);
            if (spriteFrame) {
                sprite.spriteFrame = spriteFrame;
            }
        } catch (e) {}
    }
}
