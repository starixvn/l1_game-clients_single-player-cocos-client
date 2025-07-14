import SplitLabel from "./SplitLabel";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LotteryResultNumber extends cc.Component {
    @property(cc.Label)
    label: cc.Label = null;

    sampleSplitLabel: cc.Node = null;
    sampleHighlight: cc.Node = null;

    private splitLabel: SplitLabel = null;
    private highlight: cc.Node = null;

    onLoad() {
        this.setValue("");
    }

    addSplitLabel() {
        const node = cc.instantiate(this.sampleSplitLabel);
        node.active = true;

        const tempNode = new cc.Node();
        tempNode.scale = 1 / this.label.node.scale;
        tempNode.addChild(node);
        this.label.node.addChild(tempNode);

        const splitLabel = node.getComponent(SplitLabel);
        splitLabel.cloneLabelInfo(this.label);
        this.splitLabel = splitLabel;
    }

    setValue(value: string) {
        this.label.string = value;
    }

    setSplitValues(values: string[], highlightIndices: number[], color: cc.Color, animated: boolean) {
        this.label.string = "";
        if (!this.splitLabel) {
            this.addSplitLabel();
        }

        this.splitLabel.setString(values);
        this.splitLabel.setHighlight(highlightIndices, color, animated);
    }

    setHighlight() {
        if (!this.highlight) {
            const node = cc.instantiate(this.sampleHighlight);
            node.active = true;
            this.node.addChild(node);
            this.highlight = node;
        }
    }
}
