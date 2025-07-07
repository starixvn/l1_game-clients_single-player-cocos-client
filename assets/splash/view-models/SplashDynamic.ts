const { ccclass, property } = cc._decorator;

@ccclass
export default class SplashDynamic extends cc.Component {
    @property(cc.Sprite)
    sprLogo: cc.Sprite = null;

    @property(cc.Sprite)
    sprTagPower: cc.Sprite = null;

    @property(cc.Sprite)
    sprTagline: cc.Sprite = null;

    @property
    operatorName = "";

    @property(cc.Integer)
    versionId = 2;

    private readonly href = `${window.location.origin}/splash-resources`;

    onLoad() {
        if (CC_PREVIEW) {
            return;
        }
        this.loadLogoOperator();
        this.loadTagPower();
        this.loadTagline();
    }

    loadLogoOperator() {
        const imagePath = `${this.href}/logo_${this.operatorName}.webp?v=${this.versionId}`;
        cc.assetManager.loadRemote(imagePath, (err, imageAsset: "webp") => {
            try {
                const spriteFrameTmp = new cc.SpriteFrame(imageAsset);
                this.sprLogo.spriteFrame = spriteFrameTmp;
            } catch (e) {}
        });
    }

    loadTagPower() {
        if (this.sprTagPower) {
            const imagePath = `${this.href}/powered_by_Vgaming_${window.i18n.curLang}.webp?v=${this.versionId}`;
            cc.assetManager.loadRemote(imagePath, (err, imageAsset: "webp") => {
                try {
                    const spriteFrameTmp = new cc.SpriteFrame(imageAsset);
                    this.sprTagPower.spriteFrame = spriteFrameTmp;
                } catch (e) {}
            });
        }
    }

    loadTagline() {
        if (this.sprTagline) {
            const imagePath = `${this.href}/splash_text_${window.i18n.curLang}.webp?v=${this.versionId}`;
            cc.assetManager.loadRemote(imagePath, (err, imageAsset: "webp") => {
                try {
                    const spriteFrameTmp = new cc.SpriteFrame(imageAsset);
                    this.sprTagline.spriteFrame = spriteFrameTmp;
                } catch (e) {}
            });
        }
    }
}
