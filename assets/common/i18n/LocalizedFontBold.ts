import LocalizedFont from "./LocalizedFont";

const { ccclass, menu } = cc._decorator;

@ccclass
@menu("i18n/LocalizedFontBold")
export default class LocalizedFontBold extends LocalizedFont {
    initData() {
        this.fontBases = {
            vi: "NotoSerif-Bold",
            id: "NotoSerif-Bold",
            en: "NotoSerif-Bold",
            th: "NotoSerifThai-Bold",
            zh_cn: "NotoSerifZHCN-Bold",
            zh_tw: "NotoSerifZHTW-Bold"
        };
    }
}
