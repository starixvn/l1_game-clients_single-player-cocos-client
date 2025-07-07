import { appManager } from "../../../../managers/AppManager";
import GameBaseFinishHandler from "../../../_base/handlers/GameBaseFinishHandler";
import BauCua from "../BauCua";

export default class BauCuaFinishHandler extends GameBaseFinishHandler {
    constructor(protected readonly main: BauCua) {
        super(main, 2.5);
    }

    handleFinishData(dataFinish, onFinishHandlingData: () => void = null) {
        super.handleFinishData(dataFinish, onFinishHandlingData);
        this.main.currentDataLogs.unshift(dataFinish);
        this.main.currentDataLogs.length > 100 && this.main.currentDataLogs.pop();
        cc.tween(this.main.bgOverlay).to(0.3, { opacity: 0 }).start();
        this.main.setDices(dataFinish.result);
        this.main.thePlate.opacity = 0;

        if (appManager.GAME_IS_SHOWED) {
            cc.tween(this.main.node)
                .call(() => this.main.showOpenPlateEffect(true))
                .delay(0.1)
                .call(() => this.main.showDiceResult(true))
                .delay(1)
                .call(() => {
                    onFinishHandlingData();
                    this.main.statusHandler.showStatusIfExist();
                    this.main.highlightWinningBetItems(true);
                    this.main.addLogs();
                })
                .start();
        }
    }
}
