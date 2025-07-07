import LocalizedFont from "./LocalizedFont";

const { ccclass, menu } = cc._decorator;

@ccclass
@menu("i18n/LocalizedSlotFont")
export default class LocalizedSlotFont extends LocalizedFont {
    initData() {
        this.fontBases = {
            vi: "Kodchasan-Regular",
            id: "Kodchasan-Regular",
            en: "Kodchasan-Regular",
            th: "NotoSerifThai-Regular",
            zh_cn: "NotoSerifZHCN-Regular",
            zh_tw: "NotoSerifZHTW-Regular"
        };
    }
}
