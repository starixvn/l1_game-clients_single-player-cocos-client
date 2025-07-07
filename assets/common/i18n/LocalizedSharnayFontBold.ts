import LocalizedFont from "./LocalizedFont";

const { ccclass, menu } = cc._decorator;

@ccclass
@menu("i18n/LocalizedSharnayFontBold")
export default class LocalizedSharnayFontBold extends LocalizedFont {
    initData() {
        this.fontBases = {
            vi: "UTM-Sharnay",
            id: "UTM-Sharnay",
            en: "UTM-Sharnay",
            th: "NotoSerifThai-Bold",
            zh_cn: "NotoSerifZHCN-Bold",
            zh_tw: "NotoSerifZHTW-Bold"
        };
    }
}
