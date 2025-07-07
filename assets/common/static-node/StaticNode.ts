const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu("StaticGroup/StaticNode")
export default class StaticNode extends cc.Component {
    @property
    groupId = 0;

    originalParent: cc.Node;
    originalPosition: cc.Vec3;
    initialized = false;

    init() {
        this.initialized = true;
        this.originalParent = this.node.parent;
        this.originalPosition = this.node.position;
        this.originalParent.on(cc.Node.EventType.POSITION_CHANGED, this.updatePosition, this);
    }

    updatePosition() {
        this.node.position = this.node.parent.convertToNodeSpaceAR(this.originalParent.convertToWorldSpaceAR(this.originalPosition));
    }

    lateUpdate() {
        if (!this.initialized) {
            return;
        }
        this.checkOriginalParentExists();
    }

    checkOriginalParentExists() {
        if (!this.originalParent || !this.originalParent.isValid) {
            this.node.destroy();
        }
    }
}
