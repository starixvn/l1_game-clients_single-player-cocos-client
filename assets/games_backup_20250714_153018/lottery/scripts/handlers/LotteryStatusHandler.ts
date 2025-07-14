import { GameBaseStatusHandler } from "../../../_base/handlers/GameBaseStatusHandler";
import Lottery from "../Lottery";

export default class LotteryStatusHandler extends GameBaseStatusHandler {
    constructor(protected readonly main: Lottery) {
        super(main);
    }

    status(win: boolean, bet: number): void {
        return;
    }
}
