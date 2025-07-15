import GameRoomBaseBetHandler from "../../../_base/handlers/GameRoomBaseBetHandler";
import Sedie from "../Sedie";

export default class SedieBetHandler extends GameRoomBaseBetHandler {
    constructor(protected readonly main: Sedie) {
        super(main);
    }
}
