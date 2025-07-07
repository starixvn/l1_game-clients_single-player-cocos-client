import GameRoomBaseBetHandler from "../../../_base/handlers/GameRoomBaseBetHandler";
import Keno from "../Keno";

export default class KenoBetHandler extends GameRoomBaseBetHandler {
    constructor(protected readonly main: Keno) {
        super(main);
    }
}
