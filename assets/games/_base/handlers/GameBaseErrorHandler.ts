import IGameBase from "../IGameBase";
import DataHandler from "./DataHandler";

export default class GameBaseErrorHandler implements DataHandler {
    constructor(protected readonly main: IGameBase) {}

    handle(data: any) {
        if (data.apiError) {
            return;
        }

        if (data.err) {
            this.main.showMiniWarning(data.err);
        }
    }
}
