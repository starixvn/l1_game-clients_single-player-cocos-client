import GameRoomBaseBetHandler from "../../../_base/handlers/GameRoomBaseBetHandler";
import VipBaccarat from "../VipBaccarat";

export default class VipBaccaratBetHandler extends GameRoomBaseBetHandler {
    constructor(protected readonly main: VipBaccarat) {
        super(main);
    }
}
