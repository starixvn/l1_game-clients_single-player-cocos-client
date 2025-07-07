import IGameBase from "../IGameBase";
import DataHandler from "./DataHandler";

export default class GameBaseVoidTicketHandler implements DataHandler {
    constructor(protected readonly main: IGameBase) {}

    handle(data: any) {
        if (!data.toLobby) {
            return;
        }

        this.main.voidTicket(data.toLobby);
    }
}
