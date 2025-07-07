import LocalizedFont from "./LocalizedFont";

const { ccclass, menu } = cc._decorator;

@ccclass
@menu("i18n/LocalizedNotoSansFontBold")
export default class LocalizedNotoSansFontBold extends LocalizedFont {
    initData() {
        this.fontBases = {
            vi: "NotoSans-Bold",
            id: "NotoSans-Bold",
            en: "NotoSans-Bold",
            th: "NotoSerifThai-Bold",
            zh_cn: "NotoSerifZHCN-Bold",
            zh_tw: "NotoSerifZHTW-Bold"
        };
    }
}
