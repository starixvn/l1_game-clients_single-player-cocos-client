import ColorAssembler2D from "../../../assets/common/ColorAssembler2D";
const { ccclass, property, menu } = cc._decorator;

const LanguageFont = cc.Class({
    name: "LanguageFont",
    properties: {
        language: "",
        name: ""
    }
});

@ccclass
@menu("i18n/LocalizedFont")
export default class LocalizedFont extends cc.Component {
    @property({ type: LanguageFont })
    overrideFonts: LanguageFont[] = [];

    @property
    enableCacheMode = false;

    label: cc.Label = null;
    color2D: ColorAssembler2D = null;
    fontBases = {};

    onLoad() {
        this.initData();
        this.label = this.node.getComponent(cc.Label);
        this.color2D = this.node.getComponent(ColorAssembler2D);
        this.updateFont();
    }

    initData() {
        this.fontBases = {
            vi: "NotoSerif-Regular",
            id: "NotoSerif-Regular",
            en: "NotoSerif-Regular",
            th: "NotoSerifThai-Regular",
            zh_cn: "NotoSerifZHCN-Regular",
            zh_tw: "NotoSerifZHTW-Regular"
        };
    }

    updateFont() {
        const name = this.getFontNameByLanguage();
        if (this.label) {
            this.loadFont(name).then((font) => {
                if (this.label && this.label.isValid) {
                    this.label.font = font;
                    this.enableCacheMode && this.handleCacheMode();
                }

                this.color2D && this.color2D.updateColors();
            });
        }
    }

    handleCacheMode() {
        const lang = window.i18n.curLang;
        switch (lang) {
            case "th":
            case "zh_cn":
            case "zh_tw":
                this.label.cacheMode = cc.Label.CacheMode.BITMAP;
                break;

            default:
                this.label.cacheMode = cc.Label.CacheMode.CHAR;
                break;
        }
    }

    getFontNameByLanguage(): any {
        const lang = window.i18n.curLang;
        const overrideFonts = this.overrideFonts.find((data) => data.language === lang);
        return overrideFonts?.name || this.fontBases[lang] || this.fontBases["en"];
    }

    loadFont(name: string) {
        return new Promise<cc.Font>((resolve, reject) => {
            cc.resources.load<cc.Font>(`fonts/${name}`, cc.Font, (err, font) => {
                resolve(font);
            });
        });
    }
}
