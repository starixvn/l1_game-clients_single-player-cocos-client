import IGameBase from "../IGameBase";
import DataHandler from "./DataHandler";

export default class GameBaseOddsHandler implements DataHandler {
    constructor(protected readonly main: IGameBase) {}

    handle(data: any) {
        if (data.odds) {
            this.main.applyPromotion(data.odds?.values);
            this.main.setBoostedChoices(data.odds?.boostedChoices);
        }
    }
}
