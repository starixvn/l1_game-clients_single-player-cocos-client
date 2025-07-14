import MD5Component, { MD5Type } from "../../_base/view-models/MD5Component";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BaccaratMD5 extends MD5Component {
    generateMD5Result(data: MD5Type) {
        let result = "";
        if (!!data.extraInfos) {
            result = data.rawValue;
        }
        if (!!data.hashValue) {
            result = data.hashValue;
        }

        this.md5Value.string = `${result.slice(0, this.lengthOfMd5) + "..."}`;
    }

    setDataTip(data: MD5Type) {
        this.tipString = data.hashValue || data.rawValue;
    }
}
