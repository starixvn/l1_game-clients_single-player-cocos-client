import GameUtils from "../../common/GameUtils";
import { isValidNode } from "../../common/utils/AnimationUtils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class HtmlSiteSprite extends cc.Component {
    @property
    folder = "splash-resources";

    @property
    key = "game_background";

    @property
    extension = "webp";

    @property
    versionId = 1;

    @property
    localization = false;

    @property
    originalSize = true;

    @property({ type: cc.Sprite.Type })
    type = cc.Sprite.Type.SIMPLE;

    protected sprite: cc.Sprite = null;

    async onLoad() {
        if (CC_PREVIEW) {
            return;
        }
        this.sprite = this.getComponent(cc.Sprite);
        if (!this.sprite) {
            cc.log("HtmlSiteSprite - No Sprite component found!");
            return;
        }

        try {
            const fileName = this.getFileName();
            const url = this.getUrl(fileName, this.versionId);
            const imageAsset = await GameUtils.loadRemote(url);
            if (!isValidNode(this)) {
                return;
            }
            const spriteFrameTmp = new cc.SpriteFrame(imageAsset as cc.Texture2D);
            this.sprite.spriteFrame = spriteFrameTmp;
            if (this.originalSize) {
                this.sprite.sizeMode = cc.Sprite.SizeMode.RAW;
            }
            this.sprite.type = this.type;
        } catch (e) {
            cc.log(`Error loading sprite: ${e}`);
        }
    }

    protected getFileName() {
        const languageId = this.localization ? `_${window.i18n.curLang}` : "";
        return `${this.key}${languageId}`;
    }

    protected getUrl(fileName: string, versionId: number): string {
        const { origin, pathname } = window.location;
        return `${origin}${pathname}${this.folder}/${fileName}.${this.extension}?v=${versionId}`;
    }
}
