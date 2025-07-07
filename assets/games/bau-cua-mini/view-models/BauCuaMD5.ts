import MD5Component, { MD5Type } from "../../_base/view-models/MD5Component";

const { ccclass } = cc._decorator;

@ccclass
export default class BauCuaMD5 extends MD5Component {
    protected lengthOfMd5String = 27;

    generateMD5Result(data: MD5Type) {
        let result = "";
        if (!!data.hashValue) {
            result = data.hashValue.slice(0, this.lengthOfMd5String) + "...";
        }

        if (!!data.rawValue) {
            result = data.rawValue.slice(0, this.lengthOfMd5) + "...";
        }

        this.md5Value.string = `${result}`;
    }

    setDataTip(data: MD5Type) {
        this.tipString = data.hashValue || data.rawValue;
    }
}
