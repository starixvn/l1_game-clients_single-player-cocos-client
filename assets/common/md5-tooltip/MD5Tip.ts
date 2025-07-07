const { property, ccclass } = cc._decorator;

export enum ResultTipType {
    Label = 0,
    RichText
}
@ccclass
export default class MD5Tip extends cc.Component {
    @property(cc.Label)
    roundId: cc.Label = null;

    @property({ type: cc.Enum(ResultTipType) })
    md5type = ResultTipType.Label;

    @property({
        type: cc.Label,
        visible: function () {
            return this.md5type === ResultTipType.Label;
        }
    })
    result: cc.Label = null;

    @property({
        type: cc.RichText,
        visible: function () {
            return this.md5type === ResultTipType.RichText;
        }
    })
    resultRichText: cc.RichText = null;

    public setData(data = "") {
        this.result && (this.result.string = `${data}`);
        this.resultRichText && (this.resultRichText.string = `${data}`);
    }

    public show(show = true) {
        this.node.active = show;
    }
}
