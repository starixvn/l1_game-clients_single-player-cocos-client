import GameUtils from "../GameUtils";

const { ccclass, property, menu, executeInEditMode } = cc._decorator;

@ccclass
@executeInEditMode
@menu("i18n/SingleLocalizedSprite")
export default class SingleLocalizedSprite extends cc.Component {
    @property()
    bundleName = "resources";

    @property()
    path = "";

    protected sprite: cc.Sprite;

    onLoad() {
        this.fetchRender();
    }

    public async fetchRender() {
        const sprite = this.getComponent(cc.Sprite);

        if (!sprite) {
            return;
        }
        try {
            const assetPath = `${this.path}/${GameUtils.getCurrentLanguage()}`;
            const spriteFrame =
                this.bundleName === "resources"
                    ? await GameUtils.loadResourceAsset<cc.SpriteFrame>(assetPath, cc.SpriteFrame)
                    : await GameUtils.loadAssetsFromBundle<cc.SpriteFrame>(this.bundleName, assetPath, cc.SpriteFrame, null);
            if (spriteFrame) {
                sprite.spriteFrame = spriteFrame;
            }
        } catch (e) {}
    }
}
