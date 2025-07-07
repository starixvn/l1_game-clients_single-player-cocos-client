import { userManager } from "../../../common/user/UserManager";
const { ccclass, property } = cc._decorator;

export enum DataType {
    Jackpot = 0,
    Normal
}

@ccclass
export class JackpotPoolVisible extends cc.Component {
    @property({ type: cc.Enum(DataType) })
    statusVisible = DataType.Jackpot;

    onLoad() {
        if (userManager.disableJackpotGames) {
            this.node.active = this.statusVisible === DataType.Normal;
        } else {
            this.node.active = this.statusVisible === DataType.Jackpot;
        }
    }
}