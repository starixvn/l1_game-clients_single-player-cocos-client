const { ccclass, property } = cc._decorator;

@ccclass
export default class SpineAttachmentNode extends cc.Component {
    @property(sp.Skeleton)
    skeleton: sp.Skeleton = null;

    @property
    boneName = "";

    protected bone: sp.spine.Bone;
    protected slot: sp.spine.Slot;

    onLoad() {
        this.updateBoneName(this.boneName);
    }

    updateBoneName(boneName) {
        this.bone = this.skeleton.findBone(boneName);
        this.slot = this.skeleton.findSlot(boneName);
    }

    protected update(dt: number): void {
        this.syncNodeWithBone();
    }

    syncNodeWithBone() {
        if (!this.bone) {
            return;
        }

        const wPos = this.skeleton.node.convertToWorldSpaceAR(cc.v3(this.bone.worldX, this.bone.worldY));
        const localPos = this.node.parent.convertToNodeSpaceAR(wPos);
        this.node.position = localPos;
        this.slot && (this.node.opacity = this.slot.color.a * 255);
        this.node.scaleX = this.bone.scaleX;
        this.node.scaleY = this.bone.scaleY;
    }
}
