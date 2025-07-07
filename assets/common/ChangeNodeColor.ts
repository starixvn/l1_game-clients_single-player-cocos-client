const { ccclass, property } = cc._decorator;

@ccclass
export default class ChangeNodeColor extends cc.Component {
    @property
    defaultColor = "";

    updateColor(color = this.defaultColor) {
        this.node.color = cc.Color.WHITE.fromHEX(color);
    }
}
