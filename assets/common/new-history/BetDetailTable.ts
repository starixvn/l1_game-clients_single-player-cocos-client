const { ccclass, property } = cc._decorator;

@ccclass
export default class BetDetailTable extends cc.Component {
    updateSize(width: number, height: number) {
        this.node.width = width;
        this.node.height = height;
    }
}
