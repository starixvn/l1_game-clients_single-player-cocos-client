import MD5Tip from "./MD5Tip";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MD5Tooltip extends cc.Component {
    @property(MD5Tip)
    tip: MD5Tip = null;

    public data: string;

    public md5Content: cc.Node;

    public setData(data: string) {
        this.data = data;
    }
}
