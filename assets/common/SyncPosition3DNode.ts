const { ccclass, property, executeInEditMode } = cc._decorator;

@ccclass
@executeInEditMode
export default class SyncPosition3DNode extends cc.Component {
  @property(cc.Camera)
  camera3D: cc.Camera = null;

  @property(cc.Camera)
  camera2D: cc.Camera = null;

  @property(cc.Node)
  target: cc.Node = null;

  onLoad() {
    this.syncPosition();
  }

  syncPosition() {
    const outM4 = new cc.Mat4();
    this.target.parent.getWorldMatrix(outM4);

    const wpos = new cc.Vec3();
    this.target.position.transformMat4(outM4, wpos);

    const spos: cc.Vec3 = this.camera3D.getWorldToScreenPoint(wpos);
    const pos2d: cc.Vec3 = this.camera2D.getScreenToWorldPoint(spos);

    this.node.parent.getWorldMatrix(outM4);

    const invertM4 = new cc.Mat4();
    outM4.invert(invertM4);

    pos2d.transformMat4(invertM4, wpos);
    this.node.setPosition(wpos.x, wpos.y);
  }

  update(dt) {
    this.syncPosition();
  }
}
