import { SystemType } from "../ISystem";
import configs = require("../configs/Configs");

const { ccclass, property } = cc._decorator;

export enum DataType {
    SC1 = 0,
    SC2
}
export const SystemList = [SystemType.SC1, SystemType.SC2];

@ccclass
export default class SystemActiveNode extends cc.Component {
    @property({ type: cc.Enum(DataType) })
    system = DataType.SC1;

    onLoad() {
        this.node.active = configs.systemType === SystemList[this.system];
    }
}
