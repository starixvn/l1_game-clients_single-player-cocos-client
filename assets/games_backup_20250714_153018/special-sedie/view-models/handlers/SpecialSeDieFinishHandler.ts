import GameBaseFinishHandler from "../../../_base/handlers/GameBaseFinishHandler";
import SpecialSeDie from "../SpecialSeDie";

export default class SpecialSeDieFinishHandler extends GameBaseFinishHandler {
  constructor(protected readonly main: SpecialSeDie) {
    super(main, 3);
  }

  handleFinishData(dataFinish, onFinishHandlingData: () => void = null) {
    super.handleFinishData(dataFinish, onFinishHandlingData);
    this.main.currentDataLogs.unshift(dataFinish);
    this.main.currentDataLogs.length > 100 && this.main.currentDataLogs.pop();
    this.main.showBalanceBetNotice();
    this.main.setDots(dataFinish.result);
  }
}
