import GameUtils from "./GameUtils";
import * as sessionManager from "./auth/SessionManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class OperatorLogoSprite extends cc.Component {
    @property
    scaleValue = "x1";
    private sprite: cc.Sprite = null;

    onLoad() {
        this.sprite = this.getComponent(cc.Sprite);
        if (this.sprite) {
            this.loadLogo();
        }
    }

    async loadLogo() {
        try {
            const operatorName = sessionManager.getOperator().toLowerCase();
            const fileName = `operator-logo/${this.scaleValue}/${operatorName}.png`;
            const imageAsset = await GameUtils.loadRemoteFromSharedResource<cc.Texture2D>(`${fileName}`);
            if (imageAsset) {
                const spriteFrame = new cc.SpriteFrame();
                spriteFrame.setTexture(imageAsset);

                this.sprite.spriteFrame = spriteFrame;
            }
        } catch (e) {}
    }
}
