import { appManager } from "../../../../managers/AppManager";
import GameBaseFinishHandler from "../../../_base/handlers/GameBaseFinishHandler";
import RongHo from "../RongHo";

export default class RHFinishDataHandler extends GameBaseFinishHandler {
    constructor(protected readonly main: RongHo) {
        super(main);
    }

    handleFinishData(dataFinish, onFinishHanlingData: () => void = null) {
        super.handleFinishData(dataFinish, onFinishHanlingData);
        this.main.addRoundHistory(dataFinish);

        const result = dataFinish.result;
        this.main.resultCards = [result.dragon, result.tiger];
        if (appManager.GAME_IS_SHOWED) {
            this.main.playAnimationResult();
        }
    }
}
