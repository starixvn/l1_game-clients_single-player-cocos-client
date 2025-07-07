const { ccclass, property } = cc._decorator;

@ccclass
export default class LoopScaleEffect extends cc.Component {
    @property
    scale = 2;

    @property
    duration = 0.3;

    onEnable() {
        const action = cc.repeatForever(cc.sequence(cc.scaleTo(this.duration, this.scale), cc.scaleTo(this.duration, 1)));

        this.node.runAction(action);
    }

    onDisable() {
        this.node.stopAllActions();
    }
}
