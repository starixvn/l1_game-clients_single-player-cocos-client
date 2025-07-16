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
        console.log('[SplashDynamic] Component loaded');
        if (CC_PREVIEW) {
            console.log('[SplashDynamic] Skipping dynamic loading in preview mode');
            return;
        }
        console.log(`[SplashDynamic] Loading dynamic assets for operator: ${this.operatorName}, version: ${this.versionId}`);
        this.loadLogoOperator();
        this.loadTagPower();
        this.loadTagline();
    }

    loadLogoOperator() {
        const imagePath = `${this.href}/logo_${this.operatorName}.webp?v=${this.versionId}`;
        console.log(`[SplashDynamic] Loading logo from: ${imagePath}`);
        cc.assetManager.loadRemote(imagePath, (err, imageAsset: "webp") => {
            if (err) {
                console.error(`[SplashDynamic] Failed to load logo: ${err.message}`);
                return;
            }
            try {
                const spriteFrameTmp = new cc.SpriteFrame(imageAsset);
                this.sprLogo.spriteFrame = spriteFrameTmp;
                console.log('[SplashDynamic] Logo loaded successfully');
            } catch (e) {
                console.error('[SplashDynamic] Error creating sprite frame for logo:', e);
            }
        });
    }

    loadTagPower() {
        if (this.sprTagPower) {
            const imagePath = `${this.href}/powered_by_Vgaming_${window.i18n.curLang}.webp?v=${this.versionId}`;
            console.log(`[SplashDynamic] Loading tag power from: ${imagePath}`);
            cc.assetManager.loadRemote(imagePath, (err, imageAsset: "webp") => {
                if (err) {
                    console.error(`[SplashDynamic] Failed to load tag power: ${err.message}`);
                    return;
                }
                try {
                    const spriteFrameTmp = new cc.SpriteFrame(imageAsset);
                    this.sprTagPower.spriteFrame = spriteFrameTmp;
                    console.log('[SplashDynamic] Tag power loaded successfully');
                } catch (e) {
                    console.error('[SplashDynamic] Error creating sprite frame for tag power:', e);
                }
            });
        } else {
            console.log('[SplashDynamic] Tag power sprite not assigned, skipping');
        }
    }

    loadTagline() {
        if (this.sprTagline) {
            const imagePath = `${this.href}/splash_text_${window.i18n.curLang}.webp?v=${this.versionId}`;
            console.log(`[SplashDynamic] Loading tagline from: ${imagePath}`);
            cc.assetManager.loadRemote(imagePath, (err, imageAsset: "webp") => {
                if (err) {
                    console.error(`[SplashDynamic] Failed to load tagline: ${err.message}`);
                    return;
                }
                try {
                    const spriteFrameTmp = new cc.SpriteFrame(imageAsset);
                    this.sprTagline.spriteFrame = spriteFrameTmp;
                    console.log('[SplashDynamic] Tagline loaded successfully');
                } catch (e) {
                    console.error('[SplashDynamic] Error creating sprite frame for tagline:', e);
                }
            });
        } else {
            console.log('[SplashDynamic] Tagline sprite not assigned, skipping');
        }
    }
}
