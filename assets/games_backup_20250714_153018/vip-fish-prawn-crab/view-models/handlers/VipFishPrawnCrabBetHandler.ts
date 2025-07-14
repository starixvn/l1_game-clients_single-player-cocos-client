import GameRoomBaseBetHandler from "../../../_base/handlers/GameRoomBaseBetHandler";
import VipFishPrawnCrab from "../VipFishPrawnCrab";

export default class VipFishPrawnCrabBetHandler extends GameRoomBaseBetHandler {
    constructor(protected readonly main: VipFishPrawnCrab) {
        super(main);
    }
}
