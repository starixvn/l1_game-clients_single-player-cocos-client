import NoticeUtil from "../utils/NoticeUtil";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LocalizedMask extends cc.Mask {
    @property(cc.SpriteAtlas)
    atlas: cc.SpriteAtlas = null;

    @property()
    prefix = "";

    onLoad() {
        this.spriteFrame = this.getSpriteFrameByLang(NoticeUtil.getCurrentLanguage());
    }

    getSpriteFrameByLang(lang: string) {
        const suffix = lang !== "vi" ? `_${lang}` : "";
        const spriteName = `${this.prefix}${suffix}`;
        return this.atlas.getSpriteFrame(spriteName);
    }
}
