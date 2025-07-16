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
        console.log('[HtmlSiteSprite] Component loaded');
        if (CC_PREVIEW) {
            console.log('[HtmlSiteSprite] Skipping in preview mode');
            return;
        }
        this.sprite = this.getComponent(cc.Sprite);
        if (!this.sprite) {
            console.error('[HtmlSiteSprite] No Sprite component found!');
            cc.log("HtmlSiteSprite - No Sprite component found!");
            return;
        }

        try {
            const fileName = this.getFileName();
            console.log(`[HtmlSiteSprite] Generated file name: ${fileName}`);
            const url = this.getUrl(fileName, this.versionId);
            console.log(`[HtmlSiteSprite] Loading from URL: ${url}`);
            const imageAsset = await GameUtils.loadRemote(url);
            if (!isValidNode(this)) {
                console.log('[HtmlSiteSprite] Node is no longer valid, aborting');
                return;
            }
            console.log('[HtmlSiteSprite] Image asset loaded successfully');
            const spriteFrameTmp = new cc.SpriteFrame(imageAsset as cc.Texture2D);
            this.sprite.spriteFrame = spriteFrameTmp;
            if (this.originalSize) {
                console.log('[HtmlSiteSprite] Setting size mode to RAW');
                this.sprite.sizeMode = cc.Sprite.SizeMode.RAW;
            }
            this.sprite.type = this.type;
            console.log(`[HtmlSiteSprite] Sprite configured with type: ${this.type}`);
        } catch (e) {
            console.error(`[HtmlSiteSprite] Error loading sprite: ${e}`);
            cc.log(`Error loading sprite: ${e}`);
        }
    }

    protected getFileName() {
        const languageId = this.localization ? `_${window.i18n.curLang}` : "";
        const fileName = `${this.key}${languageId}`;
        console.log(`[HtmlSiteSprite] Generated file name - key: ${this.key}, localization: ${this.localization}, language: ${window.i18n.curLang}, result: ${fileName}`);
        return fileName;
    }

    protected getUrl(fileName: string, versionId: number): string {
        const { origin, pathname } = window.location;
        const url = `${origin}${pathname}${this.folder}/${fileName}.${this.extension}?v=${versionId}`;
        console.log(`[HtmlSiteSprite] Generated URL - origin: ${origin}, pathname: ${pathname}, folder: ${this.folder}, fileName: ${fileName}, extension: ${this.extension}, versionId: ${versionId}`);
        return url;
    }
}
