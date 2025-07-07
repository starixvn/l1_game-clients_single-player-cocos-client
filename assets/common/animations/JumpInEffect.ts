const { ccclass, property } = cc._decorator;

@ccclass
export default class JumpInEffect extends cc.Component {
    onEnable() {
        this.node.scale = 2;
        this.node.runAction(cc.scaleTo(0.3, 1).easing(cc.easeSineOut()));
    }

    onDisable() {
        this.node.stopAllActions();
    }
}
