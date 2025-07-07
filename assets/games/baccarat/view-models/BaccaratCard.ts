const { ccclass, property } = cc._decorator;

@ccclass
export default class BaccaratCard extends cc.Component {
    @property(cc.Node)
    highlight: cc.Node = null;

    @property(cc.Node)
    numberTag: cc.Node = null;

    setHighlight() {
        this.highlight.active = true;
    }

    setNumberTag(data: string) {
        this.numberTag.getComponent(cc.Label).string = data;
    }

    getNumberTag() {
        return this.numberTag.getComponent(cc.Label).string;
    }

    resetHighlight() {
        this.highlight.active = false;
    }
}
