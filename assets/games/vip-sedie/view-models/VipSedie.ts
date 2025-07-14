import { appManager } from "../../../managers/AppManager";
import Sedie from "../../sedie/view-models/Sedie";
import { SedieConfigs } from "../../sedie/view-models/SedieConfigs";
import VipSedieLogHandler from "./handlers/VipSedieLogHandler";
import VipSedieTimeHandler from "./handlers/VipSedieTimeHandler";

const { ccclass, property } = cc._decorator;

export const VipSedieId = 22;

@ccclass
export default class VipSedie extends Sedie {
    @property(cc.Node)
    randomPosNode: cc.Node = null;

    initHandlers() {
        super.initHandlers();
        this.timeHandler = new VipSedieTimeHandler(this);
        this.logsHandler = new VipSedieLogHandler(this);
    }

    protected internalInit() {
        this.gameId = VipSedieId;
        this.setConfig(new SedieConfigs());
        this.finishShowResult = false;
    }

    setDots(result) {
        const randomOption = this.randomPosNode.children[this.roundId % 5];

        Object.keys(result).forEach((key, index) => {
            this.dots[index].node.position = randomOption.children[index].position;
            this.dots[index].spriteFrame = result[key] ? this.dotRed : this.dotWhite;
        });
    }

    onDestroy() {
        cc.game.off(cc.game.EVENT_HIDE, this.onGameHide, this);
        cc.game.off(cc.game.EVENT_SHOW, this.onGameShow, this);
        appManager.currentScene = null;
        this.socketIOController.closeSocket(this.gameId);
    }
}
