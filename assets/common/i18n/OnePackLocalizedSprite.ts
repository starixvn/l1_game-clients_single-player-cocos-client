const SpriteFrameSet = require("SpriteFrameSet");
const LocalizedSprite = require("LocalizedSprite");

const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu("i18n/OnePackLocalizedSprite")
export default class OnePackLocalizedSprite extends LocalizedSprite {
    @property(cc.SpriteAtlas)
    atlas: cc.SpriteAtlas = null;

    @property()
    prefix = "";

    @property()
    defaultLocalized = "";

    @property({ type: SpriteFrameSet, visible: false, override: true })
    spriteFrameSet: SpriteFrameSet[] = [];

    protected sprite: cc.Sprite;

    onLoad() {
        this.fetchRender();
    }

    fetchRender() {
        const sprite = this.getComponent(cc.Sprite);
        if (sprite) {
            this.sprite = sprite;
            this.updateSprite(window.i18n.curLang);
            return;
        }
    }

    getSpriteFrameByLang(lang: string) {
        const spriteName = `${this.prefix}_${lang}`;
        return this.atlas.getSpriteFrame(spriteName);
    }

    getDefaultSprite() {
        const spriteName = this.defaultLocalized ? `${this.prefix}_en` : this.prefix;
        return this.atlas.getSpriteFrame(spriteName);
    }

    updateSprite(language) {
        if (!this.sprite) {
            if (this.node.activeInHierarchy) {
                cc.error("Failed to update localized sprite, sprite component is invalid!");
            }
            return;
        }

        let spriteFrame = this.getSpriteFrameByLang(language);
        if (!spriteFrame) {
            spriteFrame = this.getDefaultSprite();
        }

        this.sprite.spriteFrame = spriteFrame;
    }
}
