const { ccclass, property } = cc._decorator;

const LanguageLabelWidth = cc.Class({
    name: "LanguageLabelWidth",
    properties: {
        language: "",
        size: 0
    }
});

@ccclass
export default class LocalizedLabelWidth extends cc.Component {
    @property({ type: LanguageLabelWidth })
    overrideSizes: LanguageLabelWidth[] = [];

    label: cc.Label = null;
    baseWidth: number;

    onLoad() {
        this.baseWidth = this.node.width;
        this.label = this.node.getComponent(cc.Label);
        this.updateWidth();

    }



    updateWidth() {
        const size = this.getFontSizeByLanguage();
        if (this.label) {
            this.node.width = size;
        }
    }

    getFontSizeByLanguage(): any {
        const lang = window.i18n.curLang;
        const overrideSize = this.overrideSizes.find((data) => data.language === lang);
        return overrideSize?.size || this.baseWidth;
    }
}