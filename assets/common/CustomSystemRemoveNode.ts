import { ComponentSystem, ICashSystem, ICreditSystem } from '../System';

const { ccclass, property } = cc._decorator;

@ccclass
export default class CustomSystemRemoveNode extends ComponentSystem implements ICreditSystem, ICashSystem {
    needRemoveNode: boolean;

    customizeCash(): void {
        this.needRemoveNode = false;
    }
    customizeCredit(): void {
        this.needRemoveNode = true;
    }

    onLoad() {
        if (this.needRemoveNode) {
            this.node.destroy();
        }
    }
}
