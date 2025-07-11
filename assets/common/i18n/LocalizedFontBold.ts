import LocalizedFont from "./LocalizedFont";

const { ccclass, menu } = cc._decorator;

@ccclass
@menu("i18n/LocalizedFontBold")
export default class LocalizedFontBold extends LocalizedFont {
    initData() {
        this.fontBases = {
            vi: "PingFang-Bold",
            id: "PingFang-Bold",
            en: "PingFang-Bold",
            th: "PingFang-Bold",
            zh_cn: "PingFang-Bold",
            zh_tw: "PingFang-Bold"
        };
    }
}
