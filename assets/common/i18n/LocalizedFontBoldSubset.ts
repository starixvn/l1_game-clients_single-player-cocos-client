import LocalizedFont from "./LocalizedFont";

const { ccclass, menu } = cc._decorator;

@ccclass
@menu("i18n/LocalizedFontBoldSubset")
export default class LocalizedFontBoldSubset extends LocalizedFont {
    initData() {
        this.fontBases = {
            vi: "Arial",
            id: "Arial",
            en: "Arial",
            th: "Arial",
            zh_cn: "PingFangTC-Semibold-subset",
            zh_tw: "PingFangTC-Semibold-subset"
        };
    }
}
