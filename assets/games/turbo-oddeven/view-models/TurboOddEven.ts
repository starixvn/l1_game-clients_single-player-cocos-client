import MiniPanel from "../../../mini-games-panel/view-models/MiniPanel";
import BigSmall from "../../bigsmall/view-models/BigSmall";
import TurboBigSmallTimeHandler from "../../turbo-bigsmall/view-models/handlers/TurboBigSmallTimeHandler";
import { TurboBigSmallConfigs } from "../../turbo-bigsmall/view-models/TurboBigSmallConfigs";

const { ccclass } = cc._decorator;

export const TurboOddEvenId = 6;

@ccclass
export default class TurboOddEven extends BigSmall {
    readonly choices = ["odd", "even"];

    initHandlers() {
        super.initHandlers();
        this.timeHandler = new TurboBigSmallTimeHandler(this);
    }

    initMiniPanel(miniPanel: MiniPanel) {
        super.initMiniPanel(miniPanel);
        this.gameId = TurboOddEvenId;
        this.setConfig(new TurboBigSmallConfigs());
    }
}
