const { ccclass, property } = cc._decorator;

@ccclass
export default class BottomControls extends cc.Component {
    // @property(cc.Label)
    // userName: cc.Label = null;

    // @property(cc.Label)
    // userBalance: cc.Label = null;

    // @property(cc.Sprite)
    // userAvatar: cc.Sprite = null;

    @property(cc.Node)
    betChipsContainer: cc.Node = null;

    @property(cc.Button)
    doubleButton: cc.Button = null;

    @property(cc.Button)
    rebetButton: cc.Button = null;

    @property(cc.Button)
    undoButton: cc.Button = null;

    @property(cc.Button)
    clearButton: cc.Button = null;

    @property(cc.Button)
    confirmButton: cc.Button = null;

    @property(cc.Node)
    confirmGlow: cc.Node = null;

    // onLoad() {
    //     this.userAvatar.node.parent.active = false;
    // }
}
