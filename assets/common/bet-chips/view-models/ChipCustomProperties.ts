const { ccclass, property, executeInEditMode } = cc._decorator;

@ccclass
@executeInEditMode
export default class ChipCustomProperties extends cc.Component {
    @property({ type: cc.Node })
    nodes: cc.Node[] = [];

    @property()
    rotation = 0;

    @property()
    skewX = 0;

    @property()
    skewY = 0;

    @property()
    scaleX = 1;

    @property()
    scaleY = 1;

    protected update(dt: number): void {
        this.nodes.forEach((node) => {
            node.rotation = -this.rotation;
            node.skewX = this.skewX;
            node.skewY = this.skewY;
            node.scaleX = this.scaleX;
            node.scaleY = this.scaleY;
        });
    }
}
