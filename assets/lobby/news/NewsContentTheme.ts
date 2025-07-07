import _ = require("lodash");

import NewsContent from "./NewsContent";

const { ccclass } = cc._decorator;

@ccclass
export default class NewsContentTheme extends NewsContent {
    protected readonly colors = ["#ffe300", "#fffffff", "#e20000"];

    initData() {
        this.fonts = {
            en: "NotoSans-Regular",
            th: "NotoSerifThai-Regular",
            zh_cn: "NotoSerifZHCN-Regular",
            zh_tw: "NotoSerifZHTW-Regular"
        };
    }
}
