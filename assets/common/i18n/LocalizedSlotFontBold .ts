import LocalizedFont from "./LocalizedFont";

const { ccclass, menu } = cc._decorator;

@ccclass
@menu("i18n/LocalizedSlotFontBold ")
export default class LocalizedSlotFontBold extends LocalizedFont {
    initData() {
        this.fontBases = {
            vi: "Kodchasan-Bold",
            id: "Kodchasan-Bold",
            en: "Kodchasan-Bold",
            th: "NotoSerifThai-Bold",
            zh_cn: "NotoSerifZHCN-Bold",
            zh_tw: "NotoSerifZHTW-Bold"
        };
    }
}
