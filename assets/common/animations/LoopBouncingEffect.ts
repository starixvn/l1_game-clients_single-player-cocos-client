const { ccclass, property } = cc._decorator;

@ccclass
export default class LoopBouncingEffect extends cc.Component {
    @property
    height = 2;

    @property
    duration = 0.3;

    private readonly tag = 100;
    private originalPosition: cc.Vec2;

    onLoad() {
        this.originalPosition = this.node.position;
    }

    onEnable() {
        this.node.position = this.originalPosition;
        const action = cc.repeatForever(
            cc.sequence(
                cc.jumpBy(this.duration, cc.v2(0, this.height), this.height, 1),
                cc.jumpBy(this.duration, cc.v2(0, -this.height), 0, 1)
            )
        );
        action.setTag(this.tag);
        this.node.runAction(action);
    }

    onDisable() {
        this.node.stopActionByTag(this.tag);
    }
}
