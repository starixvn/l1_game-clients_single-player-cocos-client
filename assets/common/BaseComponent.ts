const { ccclass, property } = cc._decorator;

@ccclass
export default class BaseComponent extends cc.Component {
    public isAlive(): boolean {
        return this.node && this.node.isValid;
    }
}
