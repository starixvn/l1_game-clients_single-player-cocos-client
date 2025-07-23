import LocalizedFont from "./LocalizedFont";

const { ccclass, menu } = cc._decorator;

@ccclass
@menu("i18n/LocalizedFontBold")
export default class LocalizedFontBold extends LocalizedFont {
    initData() {
        this.fontBases = {
            vi: "PingFangTC-Semibold",
            id: "PingFangTC-Semibold",
            en: "PingFangTC-Semibold",
            th: "PingFangTC-Semibold",
            zh_cn: "PingFangTC-Semibold",
            zh_tw: "PingFangTC-Semibold"
        };
    }
}
