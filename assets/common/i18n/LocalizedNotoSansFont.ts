import LocalizedFont from "./LocalizedFont";

const { ccclass, menu } = cc._decorator;

@ccclass
@menu("i18n/LocalizedNotoSansFont")
export default class LocalizedNotoSansFont extends LocalizedFont {
    initData() {
        this.fontBases = {
            vi: "NotoSans-Regular",
            id: "NotoSans-Regular",
            en: "NotoSans-Regular",
            th: "NotoSerifThai-Bold",
            zh_cn: "NotoSerifZHCN-Bold",
            zh_tw: "NotoSerifZHTW-Bold"
        };
    }
}
