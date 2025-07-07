import * as sessionManager from "./auth/SessionManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CustomOperatorSprite extends cc.Component {
    @property(cc.SpriteAtlas)
    atlas: cc.SpriteAtlas = null;

    @property
    spriteName = "";

    onLoad() {
        const operator = sessionManager.getOperator();
        const component = this.node.getComponent(cc.Sprite);
        component.spriteFrame =
            this.atlas.getSpriteFrame(`${this.spriteName}-${operator?.toUpperCase()}`);
    }
}
