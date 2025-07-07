import { SystemType } from "../ISystem";
import { ComponentSystem, ICashSystem, ICreditSystem } from "../System";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CustomSystemSprite extends ComponentSystem implements ICreditSystem, ICashSystem {
    @property(cc.SpriteAtlas)
    atlas: cc.SpriteAtlas = null;

    @property
    spriteName = "";

    env: string;

    customizeCredit(): void {
        this.env = SystemType.SC1;
    }
    customizeCash(): void {
        this.env = SystemType.SC2;
    }

    onLoad() {
        const component = this.node.getComponent(cc.Sprite);
        component.spriteFrame = this.atlas.getSpriteFrame(`${this.spriteName}-${this.env}`);
    }
}
