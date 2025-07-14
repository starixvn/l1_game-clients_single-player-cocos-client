import MD5Component, { MD5Type } from "../../_base/view-models/MD5Component";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MegaKenoMd5 extends MD5Component {
    start() {
        this.hintCopyNode.position = cc.v3(48, 40, 0);
        this.hintCopyNode.scaleY = -1;
        const content = this.hintCopyNode.getChildByName("content");
        content.scaleY = -1;
        content.y = -5;
    }
    generateMD5Result(data: MD5Type) {
        const value = data?.hashValue || data?.rawValue;
        this.md5Value.string = `${value}`;
    }

    setDataTip(data: MD5Type) {
        this.tipString = "";
    }
}
