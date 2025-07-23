import LocalizedFont from "./LocalizedFont";

const { ccclass, menu } = cc._decorator;

@ccclass
@menu("i18n/LocalizedFontSubset")
export default class LocalizedFontSubset extends LocalizedFont {
    initData() {
        this.fontBases = {
            vi: "Arial",
            id: "Arial",
            en: "Arial",
            th: "Arial",
            zh_cn: "PingFangTC-Regular-subset",
            zh_tw: "PingFangTC-Regular-subset"
        };
    }
}