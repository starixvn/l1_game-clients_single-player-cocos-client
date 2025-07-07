import MD5Component, { MD5Type } from "../../_base/view-models/MD5Component";

const { ccclass } = cc._decorator;

@ccclass
export default class SicBoMD5 extends MD5Component {
    generateMD5Result(data: MD5Type) {
        const value = data.hashValue || data.rawValue;
        this.md5Value.string = `${value}`;
    }

    setDataTip(data: MD5Type) {
        this.tipString = "";
    }
}
